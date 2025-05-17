import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, auth, onLogout, requireAuth = true, allowedRoles = [] }) => {
  // Redirect to login if not authenticated and authentication is required
  if (requireAuth && !auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect if user doesn't have the required role
  if (auth.isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    // Redirect based on role
    if (auth.user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (auth.user.role === 'instructor') {
      return <Navigate to="/instructor/dashboard" />;
    } else {
      return <Navigate to="/student/dashboard" />;
    }
  }

  // If authentication is not required or user is authenticated with correct role
  return (
    <div className="flex h-screen bg-gray-100">
      {auth.isAuthenticated && (
        <Sidebar user={auth.user} onLogout={onLogout} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {auth.isAuthenticated && (
          <TopBar user={auth.user} />
        )}
        
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
