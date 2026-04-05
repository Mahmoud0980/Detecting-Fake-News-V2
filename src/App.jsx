import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Result from './pages/Result';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Imports
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AnalysisLogs from './pages/admin/AnalysisLogs';
import KeywordManagement from './pages/admin/KeywordManagement';
import SourceManagement from './pages/admin/SourceManagement';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/detector" element={<Layout><Home /></Layout>} />
        <Route path="/result" element={<Layout><Result /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/logs" element={
          <ProtectedRoute>
            <AdminLayout>
              <AnalysisLogs />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/keywords" element={
          <ProtectedRoute>
            <AdminLayout>
              <KeywordManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/sources" element={
          <ProtectedRoute>
            <AdminLayout>
              <SourceManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
