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
    <div className="space-y-4 text-xs text-white">
      {/* Live Toast */}
      {liveToast && (
        <div className="bg-red-950/95 border-2 border-red-500 rounded-2xl p-4 text-white shadow-2xl space-y-1 animate-bounce">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              🚨 Critical Landslide Alert
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 font-black">
              {liveToast.risk_level?.toUpperCase()}
            </span>
          </div>
          <div className="font-extrabold text-sm">Road: {liveToast.road_id} ({liveToast.state})</div>
          <p className="text-xs text-red-200">{liveToast.alert_message || liveToast.title}</p>
          <div className="text-[11px] font-mono text-red-300">
            Probability: {(liveToast.probability * 100).toFixed(1)}% &bull; Advisory Enacted
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold font-heading text-white">Active Landslide Alerts</h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {isOnline ? 'WebSocket Live' : 'Cached IndexedDB'}
          </span>
        </div>

        {isOnline && (
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-[11px] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check ML Now'}</span>
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-8 text-[#8E959E]">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 bg-[#0D1714] border border-white/10 rounded-xl p-4 space-y-2">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-white font-semibold">No Active Critical Hazards</p>
            <p className="text-[#8E959E] text-[11px]">All Northeast India corridors within safe thresholds.</p>
          </div>
        ) : (
          alerts.map((alt) => {
            const isCrit = (alt.risk_level || alt.alert_level || '').toLowerCase() === 'critical';
            return (
              <div
                key={alt.alert_id || alt.id}
                className={`p-4 rounded-xl border space-y-2 transition shadow-lg ${
                  isCrit ? 'bg-red-950/30 border-red-500/50' : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{alt.title || alt.road_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isCrit ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {alt.risk_level || 'HIGH'}
                  </span>
                </div>

                <p className="text-[11px] text-[#CBD1D6] leading-relaxed">{alt.alert_message || alt.message}</p>

                <div className="flex items-center justify-between text-[10px] text-[#8E959E] pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span>Road: <strong className="text-white font-mono">{alt.road_id || 'NE-ROAD'}</strong></span>
                    <span>&bull;</span>
                    <span>Prob: <strong className="text-white font-mono">{alt.probability ? `${(alt.probability * 100).toFixed(1)}%` : '85%'}</strong></span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
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
