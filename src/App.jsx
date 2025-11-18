import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/Login';
import AdminDashboard from './component/AdminDashboard';
import UserDashboard from './component/UserDashboard';
import { getToken } from './utils/auth';

const ProtectedRoute = ({ children, role }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" />;
  // In a real app, decode JWT to check role; here assume based on route
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;