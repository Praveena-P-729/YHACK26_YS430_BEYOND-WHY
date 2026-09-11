import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { 
  getOfflineSummary, 
  getPendingFieldReports, 
  markFieldReportsSynced,
  setSyncMeta,
  cacheWeather,
  cacheRoadRisks
} from '../services/offlineStorage';

export default function OnlineStatus({ onStatusChange }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [lastSyncDate, setLastSyncDate] = useState(new Date());
  const [outdatedWarning, setOutdatedWarning] = useState(false);

  // Effective status
  const effectiveOnline = isOnline && !isSimulatedOffline;

  const checkPendingQueue = async () => {
    try {
      const pending = await getPendingFieldReports();
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  };

  const executeSync = async () => {
    if (!effectiveOnline) return;
    setIsSyncing(true);
    try {
      const pending = await getPendingFieldReports();
      if (pending.length > 0) {
        console.log(`[AutoSync] Uploading ${pending.length} pending offline field reports...`);
        const syncRes = await api.syncOfflineData({
          pending_reports: pending,
          last_sync_timestamp: lastSyncDate.toISOString()
        });

        if (syncRes && syncRes.status === 'SUCCESS') {
          await markFieldReportsSynced(pending.map(p => p.report_id));
          if (syncRes.latest_weather) {
            await cacheWeather(syncRes.latest_weather);
          }
        }
      }

      // Refresh road risks cache
      try {
        const roadsData = await api.getRiskMap();
        if (roadsData && roadsData.features) {
          await cacheRoadRisks(roadsData.features);
        }
      } catch (err) {
        console.warn('Road cache refresh note:', err);
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      setLastSyncDate(now);
      await setSyncMeta('last_sync_timestamp', timeStr);
      await checkPendingQueue();
      setOutdatedWarning(false);
    } catch (err) {
      console.warn('[AutoSync] Sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        executeSync();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkPendingQueue();

    // Periodic queue check every 10 seconds
    const interval = setInterval(() => {
      checkPendingQueue();
      // Check if data is older than 2 hours (7200000ms)
      if (Date.now() - lastSyncDate.getTime() > 7200000) {
        setOutdatedWarning(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isSimulatedOffline, effectiveOnline]);

  // Notify parent component if callback provided
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isOnline: effectiveOnline,
        isSyncing,
        pendingCount,
        lastSyncTime
      });
    }
  }, [effectiveOnline, isSyncing, pendingCount, lastSyncTime]);

  const toggleSimulateOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    if (!nextState && isOnline) {
      executeSync();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 border border-slate-300 shadow-md text-xs">
      {/* Status Pill & Message */}
      <div className="flex items-center gap-3">
        {isSyncing ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-mono font-bold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>🔄 SYNCING</span>
          </div>
        ) : effectiveOnline ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-mono font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span>🟢 System Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-950 border border-blue-300 font-mono font-bold">
            <WifiOff className="w-3.5 h-3.5 text-blue-700" />
            <span>🔵 Offline Mode</span>
          </div>
        )}

        {/* Sync Info Text */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px] text-slate-700 font-medium">
          {isSyncing ? (
            <span className="text-amber-950 font-bold">Uploading {pendingCount} pending field reports...</span>
          ) : effectiveOnline ? (
            <span>Connected to Central NDMA / GSI Cloud &bull; Last sync: <strong className="text-slate-950 font-mono font-bold">{lastSyncTime}</strong></span>
          ) : (
            <span className="text-blue-950 font-semibold">Using cached/local IndexedDB data &bull; Last data sync: <strong className="text-slate-950 font-mono font-bold">{lastSyncTime}</strong></span>
          )}

          {pendingCount > 0 && !isSyncing && (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold border border-amber-300">
              {pendingCount} Pending Sync
            </span>
          )}
        </div>
      </div>

      {/* Outdated Warning Notice (Rule 16) */}
      {outdatedWarning && !effectiveOnline && (
        <div className="w-full bg-amber-50 border border-amber-300 rounded-xl p-2 text-[11px] text-amber-950 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>⚠️ Data may be outdated. Prediction based on cached/local data. Reconnect to sync live Open-Meteo telemetry.</span>
        </div>
      )}

      {/* Hackathon Offline Simulation Control & Manual Sync Trigger */}
      <div className="flex items-center gap-2">
        {effectiveOnline && (
          <button
            onClick={executeSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Force Synchronize with Cloud"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        )}

        <button
          onClick={toggleSimulateOffline}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isSimulatedOffline
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
          }`}
          title="Toggle Offline Mode for Demonstration"
        >
          {isSimulatedOffline ? (
            <>
              <Wifi className="w-3 h-3 text-white" />
              <span>Restore Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-blue-700" />
              <span>Simulate Offline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
