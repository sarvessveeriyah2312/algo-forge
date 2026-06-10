import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terminalFeed, setTerminalFeed] = useState<string>('SYS_AUTH: Standby. Ready for secure connection handshake.');

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setEmail('');
    setUsername('');
    setPassword('');
    clearError();
    setTerminalFeed(`SYS_AUTH: Switched to ${newMode === 'signin' ? 'AUTHORIZATION' : 'REGISTRATION'} protocol.`);
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      addToast('Please enter a valid email address.', 'warning');
      return false;
    }
    if (mode === 'signup' && !username.trim()) {
      addToast('Please enter a username.', 'warning');
      return false;
    }
    if (mode === 'signup' && username.trim().length < 3) {
      addToast('Username must be at least 3 characters.', 'warning');
      return false;
    }
    if (!password || password.length < 8) {
      addToast('Password must be at least 8 characters.', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setTerminalFeed('SYS_AUTH: Launching key exchange handshake & token authorization...');

    try {
      if (mode === 'signin') {
        await login(email, password);
        addToast(`Protocol success. Welcome back!`, 'success');
      } else {
        await register(email, username.trim(), password, username.trim());
        addToast(`Account initialized. Welcome, ${username}!`, 'success');
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed.';
      addToast(msg, 'error');
      setTerminalFeed(`SYS_AUTH: [REJECTED] ${msg}`);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0e17] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none text-[#f9fafb]">
      
      {/* Visual background ambient grids and glowing indicators */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,170,0.03)_0%,transparent_70%)] pointer-events-none"></div>
      
      {/* Decorative vertical background grids to fit the Sophisticated Dark theme */}
      <div className="absolute inset-0 bg-[#0a0e17] bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none"></div>

      {/* Main card panel with motion entrance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-lg shadow-2xl overflow-hidden relative"
      >
        {/* Glow accent bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-[#00d4aa] to-cyan-500"></div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Brand header */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="w-11 h-11 bg-[#00d4aa] rounded grid place-items-center text-[#0a0e17] font-bold shadow-lg shadow-[#00d4aa]/15">
              <span className="text-xl font-mono tracking-tighter">AF</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-lg font-mono font-bold uppercase tracking-widest text-[#00d4aa] flex items-center justify-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#00d4aa] animate-pulse" />
                <span>AlgoForge Terminal</span>
              </h1>
              <p className="text-xs text-gray-400">
                Institutional-grade algorithmic trading backtesting & research suite
              </p>
            </div>
          </div>

          {/* Form wrapper */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block font-bold">
                Quantum Interface ID / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  disabled={isLoading}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-[#1f2937] rounded pl-10 pr-4 py-2 text-xs text-gray-200 font-sans focus:border-[#00d4aa] focus:outline-none transition-colors placeholder-gray-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Username - signup only */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block font-bold">
                  Username / Handle
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    disabled={isLoading}
                    placeholder="quantsmaster"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#1f2937] rounded pl-10 pr-4 py-2 text-xs text-gray-200 font-sans focus:border-[#00d4aa] focus:outline-none transition-colors placeholder-gray-600 disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}

            {/* Input Passcode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block font-bold">
                  Terminal Key / Passcode
                </label>
                <span className="text-[9px] font-mono text-gray-600 uppercase select-none">
                  SSL Encrypted
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-[#1f2937] rounded pl-10 pr-10 py-2 text-xs text-gray-200 font-mono tracking-widest focus:border-[#00d4aa] focus:outline-none transition-colors placeholder-gray-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-[#00d4aa] transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#00d4aa] text-black hover:bg-opacity-95 rounded text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#00d4aa]/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></span>
                    <span>Synchronizing Server...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'AUTHORIZE TERMINAL' : 'INITIALIZE PROTOCOL'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Controls to toggle Sign In / Sign Up */}
          <div className="border-t border-[#1f2937] pt-4 flex items-center justify-between text-xs select-none">
            <span className="text-gray-400">
              {mode === 'signin' ? "Are you a new analyst?" : "Have an analytical ID?"}
            </span>
            <button
              onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
              disabled={isLoading}
              className="text-[#00d4aa] font-mono hover:underline font-bold transition-all cursor-pointer bg-transparent border-none p-0 focus:outline-none disabled:opacity-50"
            >
              {mode === 'signin' ? 'Register Account' : 'Authenticate Signature'}
            </button>
          </div>

          {/* Backend error inline */}
          {error && (
            <div className="bg-red-950/40 border border-red-800/50 rounded px-3 py-2 text-[10px] font-mono text-red-400">
              {error}
            </div>
          )}

          {/* Terminal feed */}
          <div className="bg-[#05080f] border border-[#1f2937] p-3 rounded font-mono text-[10px] text-gray-500 flex items-start gap-2 select-text leading-tight">
            <span className="text-[#00d4aa] shrink-0">●</span>
            <div>{terminalFeed}</div>
          </div>

        </div>

        {/* Footer info links */}
        <div className="bg-[#0a0e17] border-t border-[#1f2937] px-6 py-3.5 flex items-center justify-between text-[9px] font-mono text-gray-600 tracking-wider">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            SECURED ENDPOINT
          </span>
          <span>VERSION A.F. 5.1.0_L</span>
        </div>

      </motion.div>
    </div>
  );
};
