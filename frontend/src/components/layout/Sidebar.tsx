import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Play,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Library,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();

  const handleLogout = async () => {
    await logout();
    addToast('Terminal session destroyed. Secure logout sequence complete.', 'info');
  };

  const menuItems = [
    { name: 'Dashboard',     path: '/',              icon: LayoutDashboard },
    { name: 'Strategies',    path: '/strategies',    icon: Library },
    { name: 'Indicator Lab', path: '/indicator-lab', icon: FlaskConical },
    { name: 'Backtest',      path: '/backtest',      icon: Play },
    { name: 'Results',       path: '/results',       icon: BarChart3 },
    { name: 'Settings',      path: '/settings',      icon: SettingsIcon },
  ];

  return (
    <div 
      className={`bg-[#111827] border-r border-[#1f2937] flex flex-col transition-all duration-300 h-screen select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1f2937] overflow-hidden justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#00d4aa]/10 p-1.5 rounded border border-[#00d4aa]/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#00d4aa]" />
          </div>
          {!isCollapsed && (
            <span className="font-sans font-bold text-lg tracking-wider bg-gradient-to-r from-white via-gray-300 to-[#00d4aa] bg-clip-text text-transparent">
              ALGO<span className="text-[#00d4aa]">FORGE</span>
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span className="text-[10px] font-mono text-[#00d4aa]/40 bg-[#00d4aa]/5 px-1.5 py-0.5 rounded border border-[#00d4aa]/10">
            v1.0.0
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-sans tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#00d4aa] text-black font-semibold shadow-[0_0_10px_rgba(0,212,170,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1f2937]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      {!isCollapsed ? (
        <div className="p-4 border-t border-[#1f2937] bg-[#0a0e17]/20 select-none flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/40 flex items-center justify-center font-mono text-xs font-bold text-[#00d4aa] shrink-0">
              {user ? (user.full_name || user.username || 'QM').slice(0, 2).toUpperCase() : 'QM'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-200 truncate">{user?.full_name || user?.username || 'QuantsMaster'}</p>
              <p className="text-[9px] text-[#00d4aa] font-mono tracking-widest font-bold">PRO PLAN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out terminal"
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-all cursor-pointer flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-2 border-t border-[#1f2937] flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#111827] border border-gray-700 flex items-center justify-center font-mono text-[9px] font-bold text-[#00d4aa]">
            {user ? (user.full_name || user.username || 'QM').slice(0, 2).toUpperCase() : 'QM'}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out terminal"
            className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-all cursor-pointer flex items-center justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Collapse Action Footer */}
      <div className="p-3 border-t border-[#1f2937] flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-2 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#1f2937] rounded border border-transparent hover:border-[#1f2937] transition-all cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-2 text-xs font-mono">
              <ChevronLeft className="w-4 h-4" />
              <span>COLLAPSE NAV</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
