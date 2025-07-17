import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Settings, Shield, Key, LogOut, Monitor, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RobotMarketplace } from './RobotMarketplace';
import { TutorialSystem } from './TutorialSystem';
import VPSServicesPage from './VPSServicesPage';
import { SetPasswordModal } from './SetPasswordModal';
import { AdminPanel } from './AdminPanel';
import { User as AdminUser } from '../types/admin';

interface MembersAreaProps {
  // AdminPanel props
  adminUsers?: AdminUser[];
  onUpdateUser?: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onRefreshAdminData?: () => Promise<void>;
  adminLoading?: boolean;
}

export default function MembersArea({ 
  adminUsers = [], 
  onUpdateUser, 
  onDeleteUser, 
  onRefreshAdminData,
  adminLoading = false 
}: MembersAreaProps) {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [realTimePlan, setRealTimePlan] = useState('free');
  const [isSmsUser, setIsSmsUser] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);

  // Check if user is Pedro (admin)
  const isPedroAdmin = user?.email === 'pedropardal04@gmail.com';
  const hasAdminAccess = isPedroAdmin || user?.role === 'admin';

  useEffect(() => {
    if (user) {
      checkUserAuthMethod();
      loadCurrentPlan();
    }
  }, [user]);

  const checkUserAuthMethod = async () => {
    if (user?.phone && !user?.email) {
      setIsSmsUser(true);
    } else {
      setIsSmsUser(false);
    }
  };

  const loadCurrentPlan = async () => {
    if (!user) return;

    try {
      // Try to get plan from user metadata or default to 'free'
      const plan = user.plan || 'free';
      setRealTimePlan(plan);
    } catch (error) {
      console.error('Error loading user plan:', error);
      setRealTimePlan('free');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400';
      case 'pro': return 'text-blue-400';
      case 'master': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Zap className="w-5 h-5" />;
      case 'pro': return <Zap className="w-5 h-5" />;
      case 'master': return <Zap className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />; // Default to master icon
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Panel */}
      {currentView === 'admin' && hasAdminAccess && onUpdateUser && onDeleteUser && (
        <AdminPanel 
          users={adminUsers}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onRefreshData={onRefreshAdminData}
          loading={adminLoading}
        />
      )}

      {/* VPS Services */}
      {currentView === 'vps' && (
        <VPSServicesPage onBack={() => setCurrentView('dashboard')} />
      )}

      {/* Main Content */}
      {currentView !== 'admin' && currentView !== 'vps' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4" id="boas-vindas-membro">
                  Bem-vindo, {user?.name || user?.email || 'Trader'}!
                </h1>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-800 ${getPlanColor(realTimePlan)}`}>
                    {getPlanIcon(realTimePlan)}
                    <span className="text-sm font-medium capitalize">
                      Plano {realTimePlan.toUpperCase()}
                      {isPedroAdmin && <span className="ml-1 text-red-400 font-bold">(ADMIN)</span>}
                    </span>
                  </div>
                  
                  {hasAdminAccess && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="p-2 rounded-lg bg-red-900/50 hover:bg-red-900/70 transition-colors"
                      title="Admin Panel"
                    >
                      <Settings className="w-5 h-5 text-red-400" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 text-lg">
                  Sua central da Estrategista Trading Solutions
                </p>
              </div>

              {/* Main Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setCurrentView('robots')}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="text-center">
                    <Bot className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Meus Robôs</h3>
                    <p className="text-blue-100">Ver e baixar robôs do seu plano</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('tutorials')}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Tutoriais</h3>
                    <p className="text-purple-100">Aprenda a ativar e configurar</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('vps')}
                  className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Serviços</h3>
                    <p className="text-orange-100">VPS para Trading</p>
                  </div>
                </button>
              </div>

              {/* Plan Info */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4" id="info-plano-atual">Informações do Plano Atual</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className={`text-2xl font-bold ${getPlanColor(realTimePlan)} mb-1`}>
                      {realTimePlan.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-sm">Plano Atual</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {realTimePlan === 'pro' ? '6' : 
                       realTimePlan === 'master' ? '4' : 
                       realTimePlan === 'free' ? '1' : '4'}
                    </div>
                    <div className="text-gray-400 text-sm">Robôs Disponíveis</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">Ativo</div>
                    <div className="text-gray-400 text-sm">Status</div>
                  </div>
                </div>
                
                {/* Admin Access */}
                {hasAdminAccess && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-red-400" />
                        <div>
                          <div className="text-white font-medium">Acesso Administrativo</div>
                          <div className="text-red-300 text-sm">
                            {isPedroAdmin ? 'Pedro Pardal - Admin Master' : 'Controle total do sistema'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        🛡️ Admin Panel
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Setting for SMS Users */}
                {isSmsUser && user?.email && (
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Key className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">Configuração de Senha</div>
                          <div className="text-blue-300 text-sm">
                            Defina uma senha para fazer login com email e senha
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSetPasswordModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Definir Senha
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Alternative for Robots */}
              <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 lg:hidden">
                <div className="text-center">
                  <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Meus Robôs</h3>
                  <p className="text-gray-400">Disponível apenas no desktop</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'robots' && (
            <RobotMarketplace 
              userPlan={realTimePlan}
              onBack={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'tutorials' && (
            <TutorialSystem onBack={() => setCurrentView('dashboard')} />
          )}
        </main>
      )}

      {/* SetPasswordModal for SMS Users */}
      {showSetPasswordModal && user?.email && (
        <SetPasswordModal
          isOpen={showSetPasswordModal}
          onClose={() => setShowSetPasswordModal(false)}
          userEmail={user.email}
        />
      )}
    </div>
  );
}