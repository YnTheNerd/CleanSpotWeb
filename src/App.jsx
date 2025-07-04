import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import HeatmapView from './pages/HeatmapView';
import StatsView from './pages/StatsView';
import Collectors from './pages/Collectors';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/heatmap"
            element={
              <ProtectedRoute>
                <Layout>
                  <HeatmapView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Layout>
                  <StatsView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collectors"
            element={
              <ProtectedRoute>
                <Layout>
                  <Collectors />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
