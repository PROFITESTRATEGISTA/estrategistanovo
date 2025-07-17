import React, { useState } from 'react';
import { Bot, Menu, X, User, LogOut, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan?: 'starter' | 'pro' | 'master';
}

interface NavigationProps {
  currentPage: 'pack' | 'whitelabel' | 'createsolution' | 'admin' | 'members';
  onPageChange: (page: 'pack' | 'whitelabel' | 'createsolution' | 'admin' | 'members') => void;
  user: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
}

const Navigation = ({ currentPage, onPageChange, user, onAuthClick }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePageChange = (page: 'pack' | 'whitelabel' | 'createsolution' | 'admin' | 'members') => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    try {
      // Clear all user data
      localStorage.removeItem('profit_current_user');
      localStorage.removeItem('profit_users');
      sessionStorage.clear();
      
      // Force redirect to home page and reload
      window.location.href = '/';
      window.location.reload();
    } catch (error) {
      console.error('Erro no logout:', error);
      // Fallback: force reload
      window.location.reload();
    }
  };

  const navItems = [
    { id: 'pack', label: '🤖 Pack de Robôs', emoji: '🤖' },
    { id: 'plans', label: '💎 Planos', emoji: '💎' },
    { id: 'whitelabel', label: '🤝 White Label', emoji: '🤝' },
    { id: 'createsolution', label: '🛠️ Criar Solução', emoji: '🛠️' }
  ];

  const authItems = user ? [
    { id: 'members', label: '👤 Área de Membros', emoji: '👤' },
    ...(user.role === 'admin' ? [{ id: 'admin', label: '🛡️ Admin Panel', emoji: '🛡️' }] : [])
  ] : [];

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'starter': return 'bg-emerald-100 text-emerald-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <span className="text-lg sm:text-xl font-bold text-white truncate">
              Estrategista Trading Solutions
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Main Nav Items */}
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.id === 'plans' && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold mr-2">
                      70% OFF
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth Items */}
            <div className="border-l border-gray-700 pl-4 flex items-center space-x-2">
              {authItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* User Menu or Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name}</span>
                    {user.plan && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAuthClick('login')}
                    className="bg-transparent text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => onAuthClick('register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm"
                  >
                    Cadastrar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Main Nav Items */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors duration-300 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Auth Items */}
              {authItems.length > 0 && (
                <div className="border-t border-gray-700 pt-2 mt-2">
                  {authItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handlePageChange(item.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors duration-300 ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* User Section */}
              <div className="border-t border-gray-700 pt-2 mt-2">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-gray-300">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      {user.plan && (
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                          {user.plan.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => onAuthClick('login')}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => onAuthClick('register')}
                      className="w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;