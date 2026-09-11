import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Clock, RefreshCw, MapPin, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { alertWebSocketService } from '../services/websocket';
import { getCachedAlerts, cacheAlerts } from '../services/offlineStorage';

export default function AlertPanel({ isOnline = true }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [liveToast, setLiveToast] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const data = await api.getActiveAlerts();
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
          await cacheAlerts(data);
        } else {
          const cached = await getCachedAlerts();
          setAlerts(cached);
        }
      } else {
        const cached = await getCachedAlerts();
        setAlerts(cached);
      }
    } catch (e) {
      console.warn('Alerts load note, using offline cache:', e);
      const cached = await getCachedAlerts();
      setAlerts(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // WebSocket subscription when online
    if (isOnline) {
      const unsubscribe = alertWebSocketService.subscribe((incomingAlert) => {
        setLiveToast(incomingAlert);
        setAlerts((prev) => [incomingAlert, ...prev.filter(a => a.alert_id !== incomingAlert.alert_id)]);
        setTimeout(() => setLiveToast(null), 8000);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isOnline]);

  const handleManualCheck = async () => {
    if (!isOnline) return;
    setChecking(true);
    try {
      await api.checkAlerts();
      await loadAlerts();
    } catch (e) {
      console.error('Manual check error:', e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4 text-xs text-slate-950">
      {/* Live Toast */}
      {liveToast && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-red-950 shadow-xl space-y-1 animate-bounce">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-red-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              🚨 Critical Landslide Alert
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 text-white font-black">
              {liveToast.risk_level?.toUpperCase()}
            </span>
          </div>
          <div className="font-extrabold text-sm text-red-950">Road: {liveToast.road_id} ({liveToast.state})</div>
          <p className="text-xs text-red-900 font-medium">{liveToast.alert_message || liveToast.title}</p>
          <div className="text-[11px] font-mono text-red-950 font-bold">
            Probability: {(liveToast.probability * 100).toFixed(1)}% &bull; Advisory Enacted
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <h3 className="text-sm font-extrabold font-heading text-slate-950">Active Landslide Alerts</h3>
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
            isOnline ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-blue-100 text-blue-950 border-blue-300'
          }`}>
            {isOnline ? 'WebSocket Live' : 'Cached IndexedDB'}
          </span>
        </div>

        {isOnline && (
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[11px] transition cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check ML Now'}</span>
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-8 text-slate-800 font-bold">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-2">
            <CheckCircle className="w-6 h-6 text-emerald-700 mx-auto" />
            <p className="text-slate-950 font-bold">No Active Critical Hazards</p>
            <p className="text-slate-700 text-[11px] font-medium">All Northeast India corridors within safe thresholds.</p>
          </div>
        ) : (
          alerts.map((alt) => {
            const isCrit = (alt.risk_level || alt.alert_level || '').toLowerCase() === 'critical';
            return (
              <div
                key={alt.alert_id || alt.id}
                className={`p-4 rounded-2xl border space-y-2 transition shadow-sm ${
                  isCrit ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-950 text-xs">{alt.title || alt.road_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                    isCrit ? 'bg-red-100 text-red-950 border border-red-300' : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}>
                    {alt.risk_level || 'HIGH'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-800 font-medium leading-relaxed">{alt.alert_message || alt.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-700 font-semibold pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-red-700" />
                    <span>Road: <strong className="text-slate-950 font-mono font-bold">{alt.road_id || 'NE-ROAD'}</strong></span>
                    <span>&bull;</span>
                    <span>Prob: <strong className="text-slate-950 font-mono font-bold">{alt.probability ? `${(alt.probability * 100).toFixed(1)}%` : '85%'}</strong></span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {alt.created_at ? new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
