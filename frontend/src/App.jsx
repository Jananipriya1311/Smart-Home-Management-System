import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './styles.css';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import Devices from './pages/Devices';
import UsageRecords from './pages/UsageRecords';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Logout from './components/Logout';

import { AuthProvider, useAuth } from './AuthContext';
import PrivateRoute from './PrivateRoute';

function Navigation() {
  const { user } = useAuth();
  return (
    <nav style={{ marginBottom: 20 }}>
      {user && (
        <>
          <Link to="/users">Users</Link> |{' '}
          <Link to="/rooms">Rooms</Link> |{' '}
          <Link to="/devices">Devices</Link> |{' '}
          <Link to="/usage-records">Usage Records</Link> |{' '}
          <Link to="/logs">View Logs</Link> |{' '}
          <Link to="/alerts">Alerts</Link> |{' '}
          <Link to="/maintenance">Maintenance</Link> |{' '}
          <Link to="/notifications">Notifications</Link> |{' '}
        </>
      )}
      {!user ? (
        <>
          <Link to="/login">Login</Link> |{' '}
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <Logout />
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ padding: 20 }}>
          <h1>Smart Home Management System</h1>
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private Routes */}
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
            <Route path="/devices" element={<PrivateRoute><Devices /></PrivateRoute>} />
            <Route path="/usage-records" element={<PrivateRoute><UsageRecords /></PrivateRoute>} />
            <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
            <Route path="/maintenance" element={<PrivateRoute><Maintenance /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
