'use client'

import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { signOut } from '../../lib/supabase';

interface HeaderProps {
  onMenuToggle: () => void;
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, user }) => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.email || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};