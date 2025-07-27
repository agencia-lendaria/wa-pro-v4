import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout/Layout';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { APIs } from './pages/APIs';

// Placeholder components for other pages
const Schedules = () => <div className="p-6"><h1 className="text-2xl font-bold">Agendamentos</h1><p className="text-gray-600">Em desenvolvimento...</p></div>;
const Contacts = () => <div className="p-6"><h1 className="text-2xl font-bold">Contatos</h1><p className="text-gray-600">Em desenvolvimento...</p></div>;
const Reports = () => <div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-gray-600">Em desenvolvimento...</p></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-gray-600">Em desenvolvimento...</p></div>;

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/apis" element={<APIs />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;