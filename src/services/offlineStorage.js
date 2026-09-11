/**
 * IndexedDB Offline Storage Service for LandGuard AI
 * Enables 100% offline-first GIS map browsing, field reports queue, local alerts, and cache recovery.
 */

const DB_NAME = 'landguard_offline_db';
const DB_VERSION = 1;

let dbInstance = null;

export const initOfflineDb = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (!window.indexedDB) {
      console.warn('[IndexedDB] IndexedDB is not supported in this browser environment.');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Road Risks Store
      if (!db.objectStoreNames.contains('road_risks')) {
        const roadStore = db.createObjectStore('road_risks', { keyPath: 'road_id' });
        roadStore.createIndex('risk_level', 'risk_level', { unique: false });
        roadStore.createIndex('state', 'state', { unique: false });
      }

      // 2. Alerts Store
      if (!db.objectStoreNames.contains('alerts')) {
        const alertStore = db.createObjectStore('alerts', { keyPath: 'alert_id' });
        alertStore.createIndex('road_id', 'road_id', { unique: false });
        alertStore.createIndex('risk_level', 'risk_level', { unique: false });
        alertStore.createIndex('created_at', 'created_at', { unique: false });
      }

      // 3. Weather Cache Store
      if (!db.objectStoreNames.contains('weather_cache')) {
        db.createObjectStore('weather_cache', { keyPath: 'id' });
      }

      // 4. GIS Features Store
      if (!db.objectStoreNames.contains('gis_data')) {
        db.createObjectStore('gis_data', { keyPath: 'id' });
      }

      // 5. Field Reports Queue Store (Pending & Synced)
      if (!db.objectStoreNames.contains('field_reports')) {
        const reportStore = db.createObjectStore('field_reports', { keyPath: 'report_id' });
        reportStore.createIndex('sync_status', 'sync_status', { unique: false });
        reportStore.createIndex('road_id', 'road_id', { unique: false });
        reportStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 6. Sync Metadata Store
      if (!db.objectStoreNames.contains('sync_meta')) {
        db.createObjectStore('sync_meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('[IndexedDB] LandGuard Offline Storage initialized successfully.');
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Initialization error:', event.target.error);
      reject(event.target.error);
    };
  });
};

const getStore = async (storeName, mode = 'readonly') => {
  const db = await initOfflineDb();
  if (!db) return null;
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

// ==================== ROAD RISKS CACHE ====================
export const cacheRoadRisks = async (roadsList) => {
  if (!Array.isArray(roadsList) || roadsList.length === 0) return;
  try {
    const store = await getStore('road_risks', 'readwrite');
    if (!store) return;
    const now = new Date().toISOString();
    roadsList.forEach((road) => {
      const road_id = road.road_id || road.id || `ROAD-${Math.random().toString(36).substring(7)}`;
      store.put({
        ...road,
        road_id: String(road_id),
        cached_at: now,
        source: 'local_cache'
      });
    });
    await setSyncMeta('last_roads_sync', now);
  } catch (err) {
    console.warn('[OfflineStorage] Error caching road risks:', err);
  }
};

export const getCachedRoadRisks = async () => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('road_risks', 'readonly');
      if (!store) {
        resolve([]);
        return;
      }
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

// ==================== ALERTS CACHE ====================
export const cacheAlerts = async (alertsList) => {
  if (!Array.isArray(alertsList) || alertsList.length === 0) return;
  try {
    const store = await getStore('alerts', 'readwrite');
    if (!store) return;
    alertsList.forEach((alt) => {
      const alert_id = alt.alert_id || alt.id || `ALT-${Math.random().toString(36).substring(7)}`;
      store.put({
        ...alt,
        alert_id: String(alert_id),
        cached_at: new Date().toISOString()
      });
    });
    await setSyncMeta('last_alerts_sync', new Date().toISOString());
  } catch (err) {
    console.warn('[OfflineStorage] Error caching alerts:', err);
  }
};

export const getCachedAlerts = async () => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('alerts', 'readonly');
      if (!store) {
        resolve([]);
        return;
      }
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

// ==================== WEATHER CACHE ====================
export const cacheWeather = async (weatherData) => {
  if (!weatherData) return;
  try {
    const store = await getStore('weather_cache', 'readwrite');
    if (!store) return;
    const record = {
      id: 'latest_observation',
      data: weatherData,
      cached_at: new Date().toISOString(),
      source: 'offline_cache'
    };
    store.put(record);
    await setSyncMeta('last_weather_sync', new Date().toISOString());
  } catch (err) {
    console.warn('[OfflineStorage] Error caching weather:', err);
  }
};

export const getCachedWeather = async () => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('weather_cache', 'readonly');
      if (!store) {
        resolve(null);
        return;
      }
      const request = store.get('latest_observation');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

// ==================== FIELD REPORTS QUEUE (OFFLINE-FIRST) ====================
export const savePendingFieldReport = async (reportData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore('field_reports', 'readwrite');
      if (!store) {
        reject(new Error('IndexedDB not available'));
        return;
      }
      const now = new Date().toISOString();
      const report_id = reportData.report_id || `REP-OFFLINE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const record = {
        ...reportData,
        report_id,
        sync_status: 'pending',
        timestamp: reportData.timestamp || now,
        created_at: now
      };

      const request = store.put(record);
      request.onsuccess = () => {
        console.log(`[OfflineStorage] Saved pending field report offline: ${report_id}`);
        resolve(record);
      };
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const getPendingFieldReports = async () => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('field_reports', 'readonly');
      if (!store) {
        resolve([]);
        return;
      }
      const index = store.index('sync_status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

export const getAllFieldReports = async () => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('field_reports', 'readonly');
      if (!store) {
        resolve([]);
        return;
      }
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

export const markFieldReportsSynced = async (reportIds) => {
  if (!Array.isArray(reportIds) || reportIds.length === 0) return;
  try {
    const store = await getStore('field_reports', 'readwrite');
    if (!store) return;
    for (const rid of reportIds) {
      const req = store.get(rid);
      req.onsuccess = () => {
        if (req.result) {
          const updated = { ...req.result, sync_status: 'synced', synced_at: new Date().toISOString() };
          store.put(updated);
        }
      };
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error marking reports synced:', err);
  }
};

// ==================== SYNC METADATA ====================
export const setSyncMeta = async (key, value) => {
  try {
    const store = await getStore('sync_meta', 'readwrite');
    if (!store) return;
    store.put({ key, value, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[OfflineStorage] Error setting sync meta:', err);
  }
};

export const getSyncMeta = async (key) => {
  return new Promise(async (resolve) => {
    try {
      const store = await getStore('sync_meta', 'readonly');
      if (!store) {
        resolve(null);
        return;
      }
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

export const getLastSyncTimestamp = async () => {
  return await getSyncMeta('last_sync_timestamp');
};

export const getOfflineSummary = async () => {
  const [roads, alerts, weather, pendingReports, lastSync] = await Promise.all([
    getCachedRoadRisks(),
    getCachedAlerts(),
    getCachedWeather(),
    getPendingFieldReports(),
    getLastSyncTimestamp()
  ]);

  return {
    cached_roads_count: roads.length,
    cached_alerts_count: alerts.length,
    has_cached_weather: !!weather,
    pending_reports_count: pendingReports.length,
    last_sync: lastSync || (roads.length > 0 ? 'Previously cached' : 'Never')
  };
};
