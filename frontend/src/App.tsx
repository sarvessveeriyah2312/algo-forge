import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { StrategyBuilder } from './pages/StrategyBuilder';
import { IndicatorLab } from './pages/IndicatorLab';
import { Backtest } from './pages/Backtest';
import { Results } from './pages/Results';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import { useStrategyStore } from './store/useStrategyStore';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrateUser = useAuthStore((state) => state.hydrateUser);
  const fetchStrategies = useStrategyStore((state) => state.fetchStrategies);

  useEffect(() => {
    if (isAuthenticated) {
      hydrateUser();
      fetchStrategies();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<StrategyBuilder />} />
          <Route path="/indicator-lab" element={<IndicatorLab />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
          {/* Wildcard redirect fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
