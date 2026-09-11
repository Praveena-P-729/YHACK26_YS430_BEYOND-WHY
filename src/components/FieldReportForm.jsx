import React, { useState } from 'react';
import { ShieldAlert, MapPin, Camera, Send, Database, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { api } from '../services/api';
import { savePendingFieldReport } from '../services/offlineStorage';

export default function FieldReportForm({ isOnline = true, onReportSubmitted }) {
  const [roadId, setRoadId] = useState('NH-27-SEC-04');
  const [officerId, setOfficerId] = useState('OFFICER-NER-09');
  const [state, setState] = useState('Assam');
  const [latitude, setLatitude] = useState(26.1445);
  const [longitude, setLongitude] = useState(91.7362);
  const [description, setDescription] = useState('');
  const [observedCondition, setObservedCondition] = useState('Active Soil Creep');
  const [rainfallObservation, setRainfallObservation] = useState('Heavy Torrential Downpour');
  const [roadBlocked, setRoadBlocked] = useState(false);
  const [landslideObserved, setLandslideObserved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const predefinedCorridors = [
    { id: 'NH-27-SEC-04', name: 'NH-27 East-West Corridor (Guwahati)', state: 'Assam', lat: 26.1445, lon: 91.7362 },
    { id: 'NH-206-SEC-02', name: 'NH-206 Shillong Peak Pass Bypass', state: 'Meghalaya', lat: 25.5788, lon: 91.8933 },
    { id: 'NH-10-SEC-08', name: 'NH-10 Gangtok-Siliguri Mountain Lifeline', state: 'Sikkim', lat: 27.3389, lon: 88.6065 },
    { id: 'NH-29-SEC-03', name: 'NH-29 Dimapur-Kohima Ghat Highway', state: 'Nagaland', lat: 25.6751, lon: 94.1086 },
    { id: 'NH-102-SEC-01', name: 'NH-102 Imphal-Moreh Lifeline', state: 'Manipur', lat: 24.8170, lon: 93.9368 },
    { id: 'NH-54-SEC-06', name: 'NH-54 Aizawl-Lunglei Ridge', state: 'Mizoram', lat: 23.7271, lon: 92.7176 },
    { id: 'NH-13-SEC-05', name: 'NH-13 Trans-Arunachal Highway (Tawang)', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053 },
    { id: 'NH-8-SEC-02', name: 'NH-8 Agartala-Udaipur Hill Connector', state: 'Tripura', lat: 23.8315, lon: 91.2868 }
  ];

  const handleCorridorChange = (e) => {
    const selected = predefinedCorridors.find(c => c.id === e.target.value);
    if (selected) {
      setRoadId(selected.id);
      setState(selected.state);
      setLatitude(selected.lat);
      setLongitude(selected.lon);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    const reportData = {
      report_id: `REP-${roadId}-${Date.now()}`,
      officer_id: officerId,
      road_id: roadId,
      state: state,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description: description || `Field reconnaissance on ${roadId}. Condition: ${observedCondition}.`,
      observed_condition: observedCondition,
      rainfall_observation: rainfallObservation,
      road_blocked: Boolean(roadBlocked),
      landslide_observed: Boolean(landslideObserved),
      photo: photoPreview,
      timestamp: new Date().toISOString()
    };

    try {
      if (isOnline) {
        // Online: Direct API submit
        await api.submitFieldReport(reportData);
        setSuccessMsg({
          type: 'online',
          text: `Field Report submitted successfully to Central Database (Report ID: ${reportData.report_id})`
        });
      } else {
        // Offline: Save to IndexedDB queue
        await savePendingFieldReport(reportData);
        setSuccessMsg({
          type: 'offline',
          text: `🔵 OFFLINE MODE: Report saved securely in local IndexedDB. It will automatically synchronize when internet is restored.`
        });
      }

      // Reset form fields
      setDescription('');
      setPhotoPreview(null);
      setRoadBlocked(false);
      setLandslideObserved(false);

      if (onReportSubmitted) {
        onReportSubmitted(reportData);
      }
    } catch (err) {
      // Fallback save to IndexedDB on error
      console.warn('API error, saving to offline IndexedDB fallback:', err);
      await savePendingFieldReport(reportData);
      setSuccessMsg({
        type: 'offline',
        text: `Network unreachable. Report safely queued locally in IndexedDB for auto-sync.`
      });
      if (onReportSubmitted) {
        onReportSubmitted(reportData);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="command-card-solid rounded-3xl p-6 border border-slate-300 space-y-5 text-xs text-slate-950 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black font-heading text-slate-950">Field Officer Incident &amp; Road Observation</h3>
            <p className="text-[11px] text-slate-700 font-semibold">Submit slope fissure, debris flow, or road blockage reports (Offline-First Supported)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 border border-slate-300 text-slate-900">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-blue-600'}`} />
          <span>{isOnline ? 'Direct Cloud Upload' : 'Local IndexedDB Queue'}</span>
        </div>
      </div>

      {successMsg && (
        <div className={`p-4 rounded-2xl border flex items-start gap-2.5 ${
          successMsg.type === 'online' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
            : 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">{successMsg.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Road Corridor Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-900 font-bold text-[11px]">Road / Highway Corridor</label>
            <select
              value={roadId}
              onChange={handleCorridorChange}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
            >
              {predefinedCorridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Officer ID */}
          <div className="space-y-1.5">
            <label className="text-slate-900 font-bold text-[11px]">Reporting Officer ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-slate-800 font-bold text-[10px]">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-950 font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-800 font-bold text-[10px]">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-950 font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-800 font-bold text-[10px]">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-950 font-semibold"
            />
          </div>
        </div>

        {/* Observed Geotechnical & Rain Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-900 font-bold text-[11px]">Observed Slope Condition</label>
            <select
              value={observedCondition}
              onChange={(e) => setObservedCondition(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="Normal">Normal (No visible movement)</option>
              <option value="Minor Tension Cracks">Minor Hillside Tension Cracks</option>
              <option value="Active Soil Creep">Active Soil Creep / Escarpment Bulge</option>
              <option value="Severe Debris Slump">Severe Colluvium Debris Flow / Rockfall</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-900 font-bold text-[11px]">Local Rainfall Observation</label>
            <select
              value={rainfallObservation}
              onChange={(e) => setRainfallObservation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="None">None / Clear</option>
              <option value="Light Drizzle">Light Drizzle (&lt;5 mm/h)</option>
              <option value="Moderate Rain">Moderate Sustained Rain (5-15 mm/h)</option>
              <option value="Heavy Torrential Downpour">Heavy Monsoon Downpour (&gt;25 mm/h)</option>
            </select>
          </div>
        </div>

        {/* Toggles: Road Blockage & Active Landslide */}
        <div className="flex flex-wrap items-center gap-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={landslideObserved}
              onChange={(e) => setLandslideObserved(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 text-red-600 focus:ring-red-400"
            />
            <span className="font-bold text-red-900">⚠️ Active Landslide / Slump Observed</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={roadBlocked}
              onChange={(e) => setRoadBlocked(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 text-amber-600 focus:ring-amber-400"
            />
            <span className="font-bold text-amber-900">⛔ Road Corridor Blocked / Impassable</span>
          </label>
        </div>

        {/* Detailed Notes */}
        <div className="space-y-1.5">
          <label className="text-slate-900 font-bold text-[11px]">Field Officer Reconnaissance Notes</label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe debris extent, traffic diversions, culvert overflow, or vulnerable hillside settlements..."
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-950 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Photo Upload & Preview */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-slate-900 shadow-sm">
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>Attach Field Photo</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
          {photoPreview && (
            <div className="flex items-center gap-2">
              <img src={photoPreview} alt="Field Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="text-[10px] text-red-700 font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Processing...' : isOnline ? 'Submit Live Field Report' : 'Save Offline in IndexedDB Queue'}</span>
        </button>
      </form>
    </div>
  );
}
