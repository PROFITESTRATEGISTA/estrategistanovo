import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Server, Shield, Settings, Database, Clock, CheckCircle, AlertTriangle, Eye, Search, Trash2, Star, Crown, Gift, BarChart3, RefreshCw, Bell, FileText, ExternalLink, Copy, Share2, Lock, Unlock, Plus, Minus, X, Check, AlertCircle, Info, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Home, Package, Briefcase, Headphones, LogOut, User, Menu } from 'lucide-react';
import { User as AdminUser, UserStats, ActivityData, PlanDistribution } from '../types/admin';
import { calculateStats, getUserActivityData, getPlanDistributionData } from '../utils/adminData';

interface AdminPanelProps {
  users: AdminUser[];
  onUpdateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onRefreshData?: () => Promise<void>;
  loading?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users = [], 
  onUpdateUser, 
  onDeleteUser, 
  onRefreshData,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);

  // Calculate statistics and data when users change
  useEffect(() => {
    if (users.length > 0) {
      setStats(calculateStats(users));
      setActivityData(getUserActivityData(users));
      setPlanDistribution(getPlanDistributionData(users));
    }
  }, [users]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesActive = showInactive || user.is_active;
    
    return matchesSearch && matchesPlan && matchesActive;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Gift className="w-4 h-4" />;
      case 'pro': return <Star className="w-4 h-4" />;
      case 'master': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (user) {
          switch (action) {
            case 'activate':
              await onUpdateUser(userId, { is_active: true });
              break;
            case 'deactivate':
              await onUpdateUser(userId, { is_active: false });
              break;
            case 'delete':
              await onDeleteUser(userId);
              break;
          }
        }
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const vpsPlans = [
    {
      name: "VPS Básico",
      originalPrice: "R$ 29,90",
      discountPrice: "R$ 19,90",
      specs: "1 vCPU, 1GB RAM, 20GB SSD",
      description: "Ideal para robôs leves"
    },
    {
      name: "VPS Intermediário", 
      originalPrice: "R$ 59,90",
      discountPrice: "R$ 39,90",
      specs: "2 vCPU, 2GB RAM, 40GB SSD",
      description: "Para múltiplos robôs"
    },
    {
      name: "VPS Avançado",
      originalPrice: "R$ 99,90", 
      discountPrice: "R$ 69,90",
      specs: "4 vCPU, 4GB RAM, 80GB SSD",
      description: "Máximo desempenho"
    }
  ];

  // Simple chart components
  const ActivityChart = ({ data }: { data: ActivityData[] }) => (
    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Atividade dos Últimos 30 Dias</h4>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-300">Cadastros</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-300">Logins</span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between h-48 space-x-1">
        {data.slice(-7).map((day, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex flex-col-reverse space-y-1 w-full">
              <div 
                className="bg-green-500 rounded-t"
                style={{ height: `${(day.logins / Math.max(...data.map(d => d.logins))) * 120}px` }}
              ></div>
              <div 
                className="bg-blue-500 rounded-t"
                style={{ height: `${(day.signups / Math.max(...data.map(d => d.signups))) * 120}px` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">{day.date.split('-')[2]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PlanDistributionChart = ({ data }: { data: PlanDistribution[] }) => (
    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
      <h4 className="text-sm font-medium text-white mb-4">Distribuição de Planos</h4>
      <div className="flex items-center justify-center h-40">
        <div className="relative w-32 h-32">
          {data.map((plan, index) => {
            const total = data.reduce((sum, p) => sum + p.value, 0);
            const percentage = total > 0 ? (plan.value / total) * 100 : 0;
            const angle = data.slice(0, index).reduce((sum, p) => sum + (p.value / total) * 360, 0);
            
            return (
              <div
                key={plan.name}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from ${angle}deg, ${plan.color} 0deg, ${plan.color} ${(plan.value / total) * 360}deg, transparent ${(plan.value / total) * 360}deg)`
                }}
              ></div>
            );
          })}
          <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">{stats?.totalUsers || 0}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {data.map((plan) => (
          <div key={plan.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: plan.color }}
            ></div>
            <span className="text-xs text-slate-300">{plan.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">Admin Panel - Estrategista Trading Solutions</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {onRefreshData && (
                <button 
                  onClick={onRefreshData}
                  disabled={loading}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
                  title="Atualizar dados"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'users', label: 'Usuários', icon: <Users className="w-4 h-4" /> },
            { id: 'vps', label: 'VPS', icon: <Server className="w-4 h-4" /> },
            { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total de Usuários</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      +{stats?.recentSignups || 0} esta semana
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats?.activeUsers || 0}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% do total
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Receita Estimada</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(stats?.estimatedRevenue || 0)}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats?.paidUsers || 0} usuários pagos
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-purple-400">{stats?.conversionRate.toFixed(1) || 0}%</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Free → Pago
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Usuários PRO</p>
                    <p className="text-xl font-bold text-blue-400">{stats?.proUsers || 0}</p>
                  </div>
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Usuários MASTER</p>
                    <p className="text-xl font-bold text-purple-400">{stats?.masterUsers || 0}</p>
                  </div>
                  <Crown className="w-6 h-6 text-purple-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Logins Recentes</p>
                    <p className="text-xl font-bold text-orange-400">{stats?.recentLogins || 0}</p>
                  </div>
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityChart data={activityData} />
              <PlanDistributionChart data={planDistribution} />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Atividade Recente</span>
              </h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os planos</option>
                    <option value="free">Free</option>
                    <option value="pro">PRO</option>
                    <option value="master">MASTER</option>
                  </select>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mostrar inativos</span>
                  </label>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">
                      {selectedUsers.length} selecionados
                    </span>
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm transition-colors"
                    >
                      Ativar
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
                    >
                      Desativar
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Último Login
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.name}</div>
                              <div className="text-sm text-slate-400">{user.email}</div>
                              {user.phone && (
                                <div className="text-xs text-slate-500">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                            {getPlanIcon(user.plan)}
                            <span>{user.plan.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                              className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onUpdateUser(user.id, { is_active: !user.is_active })}
                              className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                              title={user.is_active ? 'Desativar' : 'Ativar'}
                            >
                              {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="p-1 hover:bg-red-600/50 rounded transition-colors text-red-400"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* VPS Tab */}
        {activeTab === 'vps' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Serviços VPS para Trading</h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Hospedagem especializada para robôs de trading com desconto exclusivo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {vpsPlans.map((plan, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                    
                    <div className="mb-6">
                      <div className="text-sm text-slate-400 line-through mb-1">
                        {plan.originalPrice}/mês
                      </div>
                      <div className="text-3xl font-bold text-emerald-400 mb-2">
                        {plan.discountPrice}
                      </div>
                      <div className="text-sm text-emerald-400 font-medium">
                        Desconto Exclusivo Estrategista Trading Solutions
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <div className="text-sm text-slate-300 mb-2">{plan.specs}</div>
                      <div className="text-xs text-slate-400">{plan.description}</div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300">
                      Contratar Agora
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-600/30">
              <div className="flex items-center space-x-3 mb-4">
                <Server className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Por que usar VPS para Trading?</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
                <div>
                  <h4 className="font-medium text-white mb-2">Vantagens:</h4>
                  <ul className="space-y-1">
                    <li>• Operação 24/7 sem interrupções</li>
                    <li>• Baixa latência para execução rápida</li>
                    <li>• Backup automático das configurações</li>
                    <li>• Suporte técnico especializado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Incluído:</h4>
                  <ul className="space-y-1">
                    <li>• Windows Server pré-configurado</li>
                    <li>• Profit instalado e otimizado</li>
                    <li>• Monitoramento 24/7</li>
                    <li>• Suporte via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>Configurações do Sistema</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Notificações por Email</h4>
                    <p className="text-sm text-slate-400">Receber alertas sobre novos usuários</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Backup Automático</h4>
                    <p className="text-sm text-slate-400">Backup diário dos dados</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Modo Manutenção</h4>
                    <p className="text-sm text-slate-400">Desabilitar acesso temporariamente</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span>Estatísticas do Sistema</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{stats?.totalUsers || 0}</div>
                  <div className="text-sm text-slate-400">Total de Usuários</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{stats?.recentSignups || 0}</div>
                  <div className="text-sm text-slate-400">Novos esta semana</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {stats?.conversionRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-slate-400">Taxa de Conversão</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AdminPanel };