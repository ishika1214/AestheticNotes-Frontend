import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchMe } from './store/slices/authSlice';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/auth/AuthModal';

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={!token ? <AuthModal /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}
