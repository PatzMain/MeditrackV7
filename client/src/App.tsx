import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import LoginForm from './components/LoginForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import './App.css';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
