import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Mountain,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('praveena@landguard.ai');
  const [password, setPassword] = useState('Praveena@2026');
  const [selectedRole, setSelectedRole] = useState('field_officer'); // 'citizen', 'field_officer', 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // 1-Click Role Demo autofill helper
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'citizen') {
      setIdentifier('praveena.citizen@landguard.ai');
      setPassword('Praveena@2026');
    } else if (role === 'field_officer') {
      setIdentifier('praveena.officer@landguard.ai');
      setPassword('Praveena@2026');
    } else if (role === 'admin') {
      setIdentifier('praveena.admin@landguard.ai');
      setPassword('Praveena@2026');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier.trim()) {
      setError('Please enter your registered email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(identifier, password, selectedRole);
      // Role-based redirection
      if (loggedUser?.role === 'citizen' || selectedRole === 'citizen' || identifier.includes('citizen')) {
        navigate('/citizen-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email/phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-600 selection:text-white bg-ner-backdrop">
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Clean Glass Card Login Form */}
        <div className="lg:col-span-6 max-w-md mx-auto w-full">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-md shadow-emerald-500/30 ring-1 ring-emerald-500/20">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-slate-950 tracking-tight">LANDGUARD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-extrabold tracking-widest uppercase border border-emerald-300">AI</span>
              </div>
              <p className="text-[11px] text-slate-800 font-semibold">AI Landslide Early Warning &amp; Monitoring</p>
            </div>
          </div>

          {/* Main Card Container with Solid Frosted Glass & Strong Contrast */}
          <div className="command-card-solid rounded-3xl p-7 md:p-8 shadow-2xl relative overflow-hidden border border-slate-300">
            {/* Top emerald highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent" />

            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-950 font-heading">Welcome Back</h2>
              <p className="text-xs text-slate-800 mt-1 font-semibold">
                Sign in to access real-time landslide monitoring &amp; emergency alerts.
              </p>
            </div>

            {/* Role Switcher Pill Tabs (Citizen vs Field Officer vs Admin) */}
            <div className="mb-5 p-1.5 rounded-2xl bg-slate-100 border border-slate-300 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleRoleSelect('citizen')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  selectedRole === 'citizen'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 font-semibold'
                }`}
              >
                <span>Citizen</span>
                <span className="text-[9px] font-medium">Resident Safety</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('field_officer')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  selectedRole === 'field_officer'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 font-semibold'
                }`}
              >
                <span>Field Officer</span>
                <span className="text-[9px] font-medium">Officer Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  selectedRole === 'admin'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 font-semibold'
                }`}
              >
                <span>Admin</span>
                <span className="text-[9px] font-medium">Disaster Mgmt</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2 animate-fade-in font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Phone Input */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. praveena@landguard.ai or +91 94432 98765"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition font-semibold"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Demo reset instructions sent to registered recovery channel.');
                    }}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-950 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded bg-white border-slate-300 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 font-semibold">Keep me signed in on this device</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-black text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to {selectedRole === 'citizen' ? 'Citizen Safety Portal' : 'Landslide Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Link */}
            <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-800 font-semibold">
              <span>Don't have an account yet? </span>
              <Link to="/register" className="text-emerald-800 font-extrabold hover:underline">
                Create new resident or officer account
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Mountain Imagery & Safety Showcase */}
        <div className="hidden lg:flex flex-col justify-between lg:col-span-6 h-[660px] rounded-3xl command-card-solid border border-slate-300 p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold shadow-sm">
              ROLE-BASED DISASTER INTELLIGENCE (RBAC)
            </span>
            <span className="text-xs text-slate-800 font-semibold">NDMA &bull; GSI Synchronized</span>
          </div>

          <div className="my-auto space-y-5 relative z-10">
            {/* Visual Callout Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-300 space-y-3 shadow-md">
              <div className="text-xs font-mono text-emerald-900 font-extrabold uppercase tracking-wider">
                {selectedRole === 'citizen' ? 'PUBLIC RESIDENT SAFETY GRID' : 'DISASTER OPERATIONS CONSOLE'}
              </div>
              <h3 className="text-2xl font-black text-slate-950 font-heading leading-snug">
                {selectedRole === 'citizen'
                  ? 'Real-time safety advisories & safe relief shelters for local hill communities.'
                  : 'Predicting slope failure before the mountain moves with 24/7 AI telemetry.'}
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                {selectedRole === 'citizen'
                  ? 'Access nearby safe evacuation camps across Assam, Meghalaya, Manipur, and Sikkim, receive instant flash flood alerts, and report hillside cracks directly to disaster responders.'
                  : 'Real-time telemetry ingestion across 12 high-hazard corridors with explainable SHAP weights and multi-horizon failure forecasts.'}
              </p>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-lg font-black text-emerald-800 font-heading">
                    {selectedRole === 'citizen' ? '4 Shelters' : '12 Stations'}
                  </div>
                  <div className="text-[10px] text-slate-700 font-semibold">
                    {selectedRole === 'citizen' ? 'Open & Ready' : 'Active Telemetry'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-lg font-black text-slate-950 font-heading">
                    {selectedRole === 'citizen' ? '108' : '6-24h'}
                  </div>
                  <div className="text-[10px] text-slate-700 font-semibold">
                    {selectedRole === 'citizen' ? 'Helpline 108' : 'Lead Time'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-lg font-black text-emerald-800 font-heading">
                    {selectedRole === 'citizen' ? 'Free SOS' : '92.4%'}
                  </div>
                  <div className="text-[10px] text-slate-700 font-semibold">
                    {selectedRole === 'citizen' ? 'Direct Dispatch' : 'Model Accuracy'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-800 pt-4 border-t border-slate-200 relative z-10 font-bold">
            <span>256-bit SSL Encrypted Token Verification</span>
            <Link to="/" className="text-emerald-800 font-extrabold hover:underline">Return to Home &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
