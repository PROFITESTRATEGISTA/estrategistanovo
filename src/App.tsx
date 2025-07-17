import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PackRobos from './components/PackRobos';
import WhiteLabelPage from './components/WhiteLabelPage';
import CreateSolution from './components/CreateSolution';
import PlansPage from './components/PlansPage';
import { AdminPanel } from './components/AdminPanel';
import MembersArea from './components/MembersArea';
import VPSServicesPage from './components/VPSServicesPage';
import FloatingButton from './components/FloatingButton';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getUsersWithFallback, updateUser, deleteUser, refreshData, isSupabaseAvailable } from './utils/adminData';
import { User as AdminUser } from './types/admin';

type Page = 'pack' | 'plans' | 'whitelabel' | 'createsolution' | 'admin' | 'members' | 'vps';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('pack');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, loading } = useAuth();
  
  // Admin panel state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');

  // Load admin users when admin page is accessed
  useEffect(() => {
    if (currentPage === 'admin' && user?.role === 'admin') {
      loadAdminUsers();
    }
  }, [currentPage, user?.role]);

  const loadAdminUsers = async () => {
    setAdminLoading(true);
    setAdminError(null);
    
    try {
      const users = await getUsersWithFallback();
      setAdminUsers(users);
      setDataSource(isSupabaseAvailable() ? 'supabase' : 'mock');
    } catch (error) {
      console.error('Error loading admin users:', error);
      setAdminError('Failed to load user data. Please try again.');
      setDataSource('mock');
    } finally {
      setAdminLoading(false);
    }
  };

  const handlePageChange = (page: Page) => {
    // Check if user needs to be authenticated for certain pages
    if ((page === 'admin' || page === 'members') && !user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    // Check if user has admin access for admin page
    if (page === 'admin' && user && user.role !== 'admin') {
      alert('Acesso negado. Você precisa de permissões de administrador.');
      return;
    }
    
    setCurrentPage(page);
  };

  const handleAuthSuccess = () => {
    console.log('🔄 handleAuthSuccess called - closing modal');
    setShowAuthModal(false);
    // If user was trying to access admin/members, redirect them there
    if (currentPage === 'admin' || currentPage === 'members') {
      // Page will be set after auth context updates
    }
  };

  const handleNavigateToPlans = () => {
    setCurrentPage('plans');
  };

  // Admin panel functions
  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUser = await updateUser(userId, updates);
      if (updatedUser) {
        // Refresh the users list
        await loadAdminUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setAdminError('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        // Refresh the users list
        await loadAdminUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAdminError('Failed to delete user. Please try again.');
    }
  };

  const handleRefreshAdminData = async () => {
    setAdminLoading(true);
    setAdminError(null);
    
    try {
      const refreshedUsers = await refreshData();
      setAdminUsers(refreshedUsers);
      setDataSource('supabase');
    } catch (error) {
      console.error('Error refreshing admin data:', error);
      setAdminError('Failed to refresh data. Please try again.');
      // Fall back to mock data
      const fallbackUsers = await getUsersWithFallback();
      setAdminUsers(fallbackUsers);
      setDataSource('mock');
    } finally {
      setAdminLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'pack':
        return <PackRobos 
          onPageChange={handlePageChange}
          onAuthClick={(mode: 'login' | 'register') => {
            setAuthMode(mode);
            setShowAuthModal(true);
          }}
        />;
      case 'plans':
        return <PlansPage onAuthClick={(mode: 'login' | 'register') => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }} />;
      case 'whitelabel':
        return <WhiteLabelPage onNavigateToCreateSolution={() => setCurrentPage('createsolution')} />;
      case 'createsolution':
        return <CreateSolution />;
      case 'admin':
        return user?.role === 'admin' ? (
          <AdminPanel 
            users={adminUsers}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRefreshData={handleRefreshAdminData}
            loading={adminLoading}
          />
        ) : (
          <PackRobos />
        );
      case 'members':
        return user ? (
          <MembersArea 
            adminUsers={adminUsers}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRefreshAdminData={handleRefreshAdminData}
            adminLoading={adminLoading}
          />
        ) : <PackRobos />;
      case 'vps':
        return <VPSServicesPage onBack={() => setCurrentPage('pack')} />;
      default:
        return <PackRobos />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        user={user}
        onAuthClick={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
      />
      
      {renderCurrentPage()}
      
      {/* Data Source Indicator for Admin Panel */}
      {currentPage === 'admin' && user?.role === 'admin' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            dataSource === 'supabase' 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {dataSource === 'supabase' ? '📊 Live Data' : '🎭 Demo Data'}
          </div>
        </div>
      )}
      
      {/* Error Notification */}
      {adminError && currentPage === 'admin' && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{adminError}</span>
            <button 
              onClick={() => setAdminError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Button - Always visible */}
      {(currentPage === 'pack' || currentPage === 'plans' || currentPage === 'whitelabel' || currentPage === 'createsolution' || currentPage === 'members' || currentPage === 'vps') && (
        <FloatingButton 
          onNavigateToPlans={handleNavigateToPlans}
          onOpenRegister={() => {
            setAuthMode('register');
            setShowAuthModal(true);
          }}
        />
      )}
      
      {showAuthModal && (
        <LoginModal
          isOpen={showAuthModal}
          onClose={() => {
            console.log('🔄 Modal onClose called - closing modal');
            setShowAuthModal(false);
          }}
          onLogin={handleAuthSuccess}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;