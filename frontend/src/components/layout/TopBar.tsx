import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Dynamic page title finder
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Terminal Dashboard', subtitle: 'Real-time monitoring and quantitative matrix' };
      case '/builder':
        return { title: 'Visual Strategy Builder', subtitle: 'Compose and arrange algorithmic models' };
      case '/indicator-lab':
        return { title: 'Indicator Synthesis Lab', subtitle: 'Simulate overlap and test cross-correlation' };
      case '/backtest':
        return { title: 'High-Fidelity Backtester', subtitle: 'Simulate strategies against historical tick streams' };
      case '/results':
        return { title: 'Quantitative Analytics & Report', subtitle: 'Detailed equity growth and performance logs' };
      case '/settings':
        return { title: 'Platform Preferences', subtitle: 'Connection paths and terminal parameters' };
      default:
        return { title: 'Terminal Console', subtitle: 'AlgoForge Research Platform' };
    }
  };

  const page = getPageInfo();

  useEffect(() => {
    // Start with server metadata timestamp: 2026-06-10T10:05:58Z
    const baseTime = new Date('2026-06-10T10:06:00Z');
    let secondsOffset = 0;

    const interval = setInterval(() => {
      secondsOffset += 1;
      const displayTime = new Date(baseTime.getTime() + secondsOffset * 1000);
      setCurrentTime(displayTime.toUTCString().replace('GMT', 'UTC'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [notifications] = useState([
    { id: '1', title: 'Strategy Completed', desc: 'XAUUSD Trend Scalper backtest completed.', time: 'Just now', type: 'success' },
    { id: '2', title: 'Indicator Saved', desc: 'RSI Parameter customized to overbought: 70.', time: '12 mins ago', type: 'info' },
    { id: '3', title: 'Connection Ready', desc: 'Linked successfully to simulated local server.', time: '34 mins ago', type: 'success' }
  ]);

  return (
    <header className="h-16 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-6 shrink-0 z-20 select-none">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-wide bg-[#00d4aa]/10 px-2 py-0.5 rounded border border-[#00d4aa]/20">
            {location.pathname === '/' ? 'ALGO' : location.pathname.substring(1).toUpperCase()}
          </span>
          <span className="text-gray-600">/</span>
          <h1 className="text-sm font-sans font-semibold text-[#f9fafb]">
            {page.title}
          </h1>
        </div>
        <p className="text-[11px] text-[#6b7280] hidden md:block">
          {page.subtitle}
        </p>
      </div>

      {/* Clock, Notifications & User Status */}
      <div className="flex items-center space-x-6">
        {/* Dynamic UTC Server Clock */}
        <div className="hidden lg:flex flex-col items-end font-mono">
          <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">SYSTEM UTC TIME</span>
          <span className="text-xs text-[#00d4aa] font-medium tracking-wide">
            {currentTime || '2026-06-10 10:06:00 UTC'}
          </span>
        </div>

        {/* Info Feed Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-400 hover:text-[#00d4aa] bg-[#1f2937]/50 rounded border border-[#1f2937] hover:border-[#00d4aa]/30 transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
          </button>

          {isNotifOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsNotifOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2.5 w-80 bg-[#111827] border border-[#1f2937] rounded-md shadow-2xl z-20 font-sans text-xs">
                <div className="p-3 border-b border-[#1f2937] flex items-center justify-between">
                  <span className="font-semibold text-gray-200">Terminal Notifications</span>
                  <span className="text-[10px] text-[#00d4aa]">3 New Logs</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#1f2937]">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-[#1f2937] transition-all">
                      <div className="flex items-start space-x-2.5">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00d4aa] mt-0.5 shrink-0" />
                        ) : (
                          <Cpu className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-200">{notif.title}</span>
                            <span className="text-[9px] text-[#6b7280]">{notif.time}</span>
                          </div>
                          <p className="text-[#6b7280] text-[11px] mt-0.5">{notif.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Identity profile */}
        <div className="flex items-center space-x-2.5 border-l border-[#1f2937] pl-6">
          <div className="w-8 h-8 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/40 flex items-center justify-center font-mono text-xs font-bold text-[#00d4aa]">
            {user ? (user.full_name || user.username || 'QM').slice(0, 2).toUpperCase() : 'QM'}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-medium text-gray-200 font-sans">{user?.full_name || user?.username || 'QuantsMaster'}</span>
            <span className="text-[9px] text-[#00d4aa]/70 font-mono uppercase tracking-wider font-bold">QUANT TRADER</span>
          </div>
        </div>
      </div>
    </header>
  );
};
