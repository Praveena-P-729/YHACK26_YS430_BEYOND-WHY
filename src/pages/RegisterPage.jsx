import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Mountain, 
  Phone, 
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen', // 'citizen', 'field_officer', 'admin'
    department: 'Resident Community & Nilgiris Panchayat',
    badge_number: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      department: role === 'citizen' 
        ? 'North-Eastern Resident Community & Hill Panchayat' 
        : role === 'field_officer' 
        ? 'North-Eastern Regional Disaster Management Authority (NER-SDMA)' 
        : 'National Disaster Management Authority (NDMA)'
    }));
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-white/10' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500', width: '50%' };
    if (score === 4) return { score: 3, label: 'Strong', color: 'bg-[#10B981]', width: '75%' };
    return { score: 4, label: 'Rock-Solid', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        badge_number: formData.badge_number || undefined
      });

      // Role-based redirection after signup
      if (loggedUser && loggedUser.role === 'citizen') {
        navigate('/citizen-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A100D] text-[#F5F1EA] flex items-center justify-center p-4 relative overflow-hidden py-10 selection:bg-[#10B981] selection:text-white">
      {/* Background Mountain Contours & Ambient Atmospheric Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#10B981]/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-[#12201C]/70 rounded-full blur-[90px] pointer-events-none" />

      {/* Subtle Mountain Topography SVG Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#10B981 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Register Card Form */}
        <div className="lg:col-span-7 max-w-xl mx-auto w-full">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-lg shadow-[#10B981]/30 ring-1 ring-white/20">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-bold text-white tracking-tight">LANDGUARD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-mono font-bold tracking-widest uppercase border border-[#10B981]/30">AI</span>
              </div>
              <p className="text-[10px] text-[#A8ADB2]">Disaster Intelligence Platform Account Creation</p>
            </div>
          </div>

          {/* Form Container */}
          <div className="command-card rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading">Create Account</h2>
                <p className="text-xs text-[#A8ADB2] mt-0.5">
                  Join LandGuard early warning network for real-time safety alerts.
                </p>
              </div>
              <Link 
                to="/login"
                className="text-xs font-semibold text-[#10B981] hover:underline flex items-center gap-1"
              >
                <span>Sign in instead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Role Switcher Pill Tabs */}
            <div className="mb-5 p-1 rounded-2xl bg-[#0D1714] border border-white/5 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleRoleSelect('citizen')}
                className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  formData.role === 'citizen'
                    ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                    : 'text-[#8E959E] hover:text-white'
                }`}
              >
                <span>Citizen</span>
                <span className="text-[9px] font-mono opacity-80">Resident Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('field_officer')}
                className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  formData.role === 'field_officer'
                    ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                    : 'text-[#8E959E] hover:text-white'
                }`}
              >
                <span>Field Officer</span>
                <span className="text-[9px] font-mono opacity-80">Responder HUD</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex flex-col items-center ${
                  formData.role === 'admin'
                    ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                    : 'text-[#8E959E] hover:text-white'
                }`}
              >
                <span>Admin</span>
                <span className="text-[9px] font-mono opacity-80">State NDMA</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Row 1: Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition"
                      placeholder={formData.role === 'citizen' ? 'Aarav Sharma' : 'Capt. Vikramaditya'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                    Phone Number (SOS SMS)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition"
                      placeholder="+91 98401 99887"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition"
                    placeholder="name@landguard.ai or yourname@gmail.com"
                  />
                </div>
              </div>

              {/* Row 3: Role Specific Fields */}
              {formData.role !== 'citizen' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                      Department / Authority
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981]"
                        placeholder="e.g. State Disaster Authority"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                      Badge / Agency ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="badge_number"
                        value={formData.badge_number}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981]"
                        placeholder="e.g. SDMA-402"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Row 4: Password & Confirm Password with Show/Hide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E8793] hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8ADB2] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7E8793]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D1714] border border-white/10 text-xs text-[#F5F1EA] placeholder-[#606774] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E8793] hover:text-white transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="space-y-1 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8E959E]">Security Strength:</span>
                    <span className="font-semibold text-white font-mono">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1714] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-[#A8ADB2]">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="w-4 h-4 mt-0.5 rounded bg-[#0D1714] border-white/20 accent-[#10B981] cursor-pointer flex-shrink-0"
                  />
                  <span>
                    I agree to receive regional landslide early warning broadcasts and adhere to emergency safety protocols.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#10B981]/30 emerald-btn-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Profile &amp; Connecting Grid...</span>
                  </div>
                ) : (
                  <>
                    <span>Create {formData.role === 'citizen' ? 'Citizen Account' : 'Responder Profile'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-[#8E959E]">
              <span>Already registered on LandGuard? </span>
              <Link to="/login" className="text-[#10B981] font-semibold hover:underline">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Educational & Features Info */}
        <div className="hidden lg:flex flex-col justify-between lg:col-span-5 h-[640px] rounded-3xl bg-[#101A16] border border-white/10 p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#14221E] border border-white/10 text-[#10B981]">
              COMMUNITY RESILIENCE NETWORK
            </span>
            <h3 className="text-xl font-bold text-white font-heading mt-4">
              Why Register with LandGuard AI?
            </h3>
          </div>

          <div className="space-y-4 relative z-10 my-auto">
            <div className="p-4 rounded-2xl bg-[#121E1A] border border-white/5 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 text-[#10B981] mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">Localized SMS / Web Warnings</h4>
                <p className="text-[11px] text-[#A8ADB2] mt-0.5 leading-relaxed">
                  Receive instant alerts when pore pressure and soil moisture exceed critical thresholds in your hill station.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121E1A] border border-white/5 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">1-Click SOS Slope Reporting</h4>
                <p className="text-[11px] text-[#A8ADB2] mt-0.5 leading-relaxed">
                  Notice fresh hillside fissures or road subsidence? Report with GPS coordinates directly to NDRF and district responders.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121E1A] border border-white/5 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                <Mountain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">Verified Safe Relief Shelters</h4>
                <p className="text-[11px] text-[#A8ADB2] mt-0.5 leading-relaxed">
                  Live occupancy, contact numbers, and turn-by-turn evacuation routes to NDMA-cleared community halls and shelters.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7E8793] pt-4 border-t border-white/10 relative z-10">
            <span>Free Public Community Service</span>
            <Link to="/" className="text-[#10B981] hover:underline">Explore Public Portal &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
