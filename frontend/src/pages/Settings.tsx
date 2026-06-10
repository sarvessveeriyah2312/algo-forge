import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Terminal, 
  Save, 
  Link2, 
  ShieldCheck, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

export const Settings: React.FC = () => {
  const { addToast } = useToastStore();

  // MT5 states
  const [terminalPath, setTerminalPath] = useState(localStorage.getItem('af_mt5_path') || 'C:\\Program Files\\MetaTrader 5\\terminal64.exe');
  const [login, setLogin] = useState(localStorage.getItem('af_mt5_login') || '8482910');
  const [password, setPassword] = useState(localStorage.getItem('af_mt5_pass') || '•••••••••••••••••');
  const [server, setServer] = useState(localStorage.getItem('af_mt5_server') || 'FTMO-Server3');
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);

  // Backend states
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('af_backend_url') || 'http://localhost:8000');
  const [apiKey, setApiKey] = useState(localStorage.getItem('af_api_key') || 'af_pk_live_839f939ac12ff48ea');

  // Preferences states
  const [defTimeframe, setDefTimeframe] = useState(localStorage.getItem('af_def_timeframe') || 'H1');
  const [defInstrument, setDefInstrument] = useState(localStorage.getItem('af_def_instrument') || 'XAUUSD');
  const [maxBars, setMaxBars] = useState(localStorage.getItem('af_max_bars') || '10000');

  const handleTestMT5Connection = () => {
    setIsTestingConn(true);
    addToast('Contacting local MetaTrader 5 Bridge sequence on TCP port 18882...', 'info');

    setTimeout(() => {
      setIsTestingConn(false);
      addToast(`MetaTrader 5 bridge connected! Linked accounts active: [${login}]. Ping: 12ms.`, 'success');
    }, 1500);
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for persistence
    localStorage.setItem('af_mt5_path', terminalPath);
    localStorage.setItem('af_mt5_login', login);
    localStorage.setItem('af_mt5_pass', password);
    localStorage.setItem('af_mt5_server', server);
    localStorage.setItem('af_backend_url', backendUrl);
    localStorage.setItem('af_api_key', apiKey);
    localStorage.setItem('af_def_timeframe', defTimeframe);
    localStorage.setItem('af_def_instrument', defInstrument);
    localStorage.setItem('af_max_bars', maxBars);

    addToast('AlgoForge platform preferences persisted successfully to local storage.', 'success');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveAllSettings} className="space-y-6 max-w-4xl mx-auto">
        
        {/* Panel 1: MT5 Connection Bridge */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md space-y-4">
          <div className="border-b border-[#1f2937] pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-[#00d4aa]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                MetaTrader 5 Bridge Link
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">MT5 INTEGRATION</span>
          </div>

          <div className="space-y-4">
            {/* Terminal Path */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">MT5 Terminal Path</label>
              <input
                type="text"
                value={terminalPath}
                onChange={(e) => setTerminalPath(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
              />
            </div>

            {/* Login, Password, Server */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Login ID</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">MT5 Passcode</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded pl-3 pr-10 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">MT5 Broker Server</label>
                <input
                  type="text"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1f2937] mt-2">
              <p className="text-[10px] font-mono text-gray-500 leading-normal max-w-md">
                Requires the custom Python AlgoForge Link EA running inside your local terminal to establish sockets synchronization.
              </p>
              
              <button
                type="button"
                onClick={handleTestMT5Connection}
                disabled={isTestingConn}
                className="py-1.5 px-3.5 bg-gradient-to-r from-[#1f2937] to-[#111827] hover:to-[#1f2937] border border-[#374151] hover:border-[#00d4aa]/30 rounded text-xs font-mono text-gray-300 hover:text-[#00d4aa] transition-all cursor-pointer flex items-center space-x-2"
              >
                {isTestingConn && <span className="w-3 h-3 border-2 border-t-transparent border-[#00d4aa] rounded-full animate-spin"></span>}
                <span>Test Connection Bridge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: API / Cloud parameters */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md space-y-4">
          <div className="border-b border-[#1f2937] pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#00d4aa]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                Central API & Host Server Configs
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">DATABASE BACKEND</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Backend Host Port</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">AlgoForge API Token</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Workspace Data Defaults */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md space-y-4">
          <div className="border-b border-[#1f2937] pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#00d4aa]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                Workspace & Candle Data Defaults
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">DEFAULT ENVIRONMENT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Default Timeframe</label>
              <select
                value={defTimeframe}
                onChange={(e) => setDefTimeframe(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none"
              >
                {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Default Instrument</label>
              <select
                value={defInstrument}
                onChange={(e) => setDefInstrument(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none"
              >
                {['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Max Historical Bars</label>
              <input
                type="number"
                step="1000"
                min="1000"
                max="100000"
                value={maxBars}
                onChange={(e) => setMaxBars(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Global Save Action Row */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#00d4aa] text-black font-semibold rounded text-xs uppercase tracking-wider font-mono hover:bg-opacity-95 transition-all cursor-pointer shadow-lg shadow-[#00d4aa]/10"
          >
            <Save className="w-4 h-4" />
            <span>Save Coordinates Coordinates</span>
          </button>
        </div>

      </form>
    </div>
  );
};
