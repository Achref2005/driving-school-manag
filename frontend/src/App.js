import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Layout components
import Layout from './components/layout/Layout';

// Auth components
import Login from './components/auth/Login';

// Dashboard components
import AdminDashboard from './components/dashboard/AdminDashboard';

// Main App
function App() {
  // Authentication state
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
  });

  // Check for token and user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(user),
        token,
        loading: false
      });
    } else {
      setAuth({ isAuthenticated: false, user: null, token: null, loading: false });
    }
  }, []);

  // Set axios auth header
  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  // Handle login
  const handleLogin = (authData) => {
    setAuth({
      isAuthenticated: true,
      user: authData.user,
      token: authData.token,
      loading: false
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isAuthenticated: false, user: null, token: null, loading: false });
  };

  // Show loading spinner while checking auth
  if (auth.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <Layout auth={auth} requireAuth={false}>
            <Login setAuth={handleLogin} />
          </Layout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <Layout auth={auth} onLogout={handleLogout} allowedRoles={['admin']}>
            <AdminDashboard auth={auth} />
          </Layout>
        } />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={
          <Layout auth={auth} onLogout={handleLogout} allowedRoles={['instructor']}>
            <div>Instructor Dashboard</div>
          </Layout>
        } />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <Layout auth={auth} onLogout={handleLogout} allowedRoles={['student']}>
            <div>Student Dashboard</div>
          </Layout>
        } />

        {/* Redirect based on role or to login */}
        <Route path="/" element={
          auth.isAuthenticated ? (
            auth.user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : auth.user.role === 'instructor' ? (
              <Navigate to="/instructor/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Catch all - redirect to appropriate dashboard or login */}
        <Route path="*" element={
          auth.isAuthenticated ? (
            auth.user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : auth.user.role === 'instructor' ? (
              <Navigate to="/instructor/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
