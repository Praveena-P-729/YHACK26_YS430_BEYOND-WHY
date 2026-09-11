const API_BASE = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('landguard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Network error occurred' }));
      throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getCurrentUser: () => request('/auth/me'),

  // Locations & GIS
  getLocations: () => request('/locations'),
  getLocation: (id) => request(`/locations/${id}`),

  // Route Risk Checker
  checkRouteRisk: (origin, destination, travel_mode = "car") => request('/routes/check', {
    method: 'POST',
    body: JSON.stringify({ origin, destination, travel_mode })
  }),

  // Officer Operations
  getOfficerOverview: () => request('/officer/overview-stats'),
  getEmergencyPrioritization: () => request('/officer/prioritization'),
  updateIncidentStatus: (incidentId, status, notes = "") => request(`/officer/incidents/${incidentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, officer_notes: notes })
  }),
  calculateDispatchPlan: (team_name, target_location_id, vehicle_type, priority) => request('/officer/dispatch-plan', {
    method: 'POST',
    body: JSON.stringify({ team_name, target_location_id, vehicle_type, priority })
  }),

  // Monitoring
  getLatestReadings: () => request('/monitoring/latest'),
  getReadingHistory: (locationId, limit = 24) => request(`/monitoring/history/${locationId}?limit=${limit}`),

  // Predictions
  getLatestPredictions: () => request('/predictions/latest'),
  getPredictionHorizons: (locationId) => request(`/predictions/horizons/${locationId}`),

  // Alerts
  getActiveAlerts: () => request('/alerts'),
  getAllAlerts: () => request('/alerts/all'),

  // Incidents
  getIncidents: () => request('/incidents'),
  reportIncident: (data) => request('/incidents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Shelters & SOS
  getShelters: () => request('/shelters'),
  getNearestShelters: (lat, lon) => request(`/shelters/nearest?lat=${lat}&lon=${lon}`),
  sendSOS: (data) => request('/shelters/sos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Real-Time Weather & Multi-Hazard (Challenge 24)
  getCurrentWeather: (lat, lon) => request(`/weather/current${lat && lon ? `?lat=${lat}&lon=${lon}` : ''}`),
  getRainfallHistory: (limit = 24) => request(`/weather/rainfall-history?limit=${limit}`),
  predictLandslide: (data) => request('/predict/landslide', { method: 'POST', body: JSON.stringify(data) }),
  predictFlood: (data) => request('/predict/flood', { method: 'POST', body: JSON.stringify(data) }),
  getRiskMap: () => request('/risk/map'),
  getRoadImpact: (locationId = 2) => request(`/road-impact?location_id=${locationId}`),
  getInfrastructureImpact: (locationId = 2) => request(`/infrastructure-impact?location_id=${locationId}`),
  getCommunityRisk: (locationId = 2) => request(`/community-risk?location_id=${locationId}`),
  updateAlertStatus: (alertId, status, notes = "") => request(`/alerts/${alertId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes })
  }),
  getStatistics: () => request('/statistics'),

  // Analytics & Reports
  getAnalyticsSummary: () => request('/analytics/summary'),
  getLatestReport: () => request('/reports/latest'),
  runSimulation: (data) => request('/simulation/run', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getNotifications: () => request('/notifications')
};
