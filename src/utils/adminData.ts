// Supabase user data and management functions for AdminPanel
import { User } from '../types/admin';
import supabase from '../lib/supabase';

// Supabase database types
interface SupabaseUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  plan: 'free' | 'pro' | 'master';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone_verified?: boolean;
}

// Convert Supabase user to AdminPanel user format
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    phone: supabaseUser.phone,
    plan: supabaseUser.plan,
    is_active: supabaseUser.is_active,
    created_at: supabaseUser.created_at,
    last_login: supabaseUser.last_login,
    phone_verified: supabaseUser.phone_verified || false
  };
};

// User management functions with Supabase integration
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data?.map(convertSupabaseUser) || [];
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    // Remove fields that shouldn't be updated directly
    const { id: _id, created_at: _created_at, ...updateData } = updates;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data ? convertSupabaseUser(data) : null;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

export const addUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error adding user to Supabase:', error);
      throw new Error(`Failed to add user: ${error.message}`);
    }

    return convertSupabaseUser(data);
  } catch (error) {
    console.error('Error in addUser:', error);
    throw error;
  }
};

// Statistics calculation functions (now using real data)
export const calculateStats = (users: User[]) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const masterUsers = users.filter(u => u.plan === 'master').length;
  const freeUsers = users.filter(u => u.plan === 'free').length;
  
  const recentSignups = users.filter(u => new Date(u.created_at) > weekAgo).length;
  const monthlySignups = users.filter(u => new Date(u.created_at) > monthAgo).length;
  
  const usersWithPhone = users.filter(u => u.phone_verified).length;
  const recentLogins = users.filter(u => u.last_login && new Date(u.last_login) > weekAgo).length;

  // Calculate growth rates
  const previousWeekUsers = users.filter(u => new Date(u.created_at) <= weekAgo && new Date(u.created_at) > new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
  const weeklyGrowth = previousWeekUsers > 0 ? ((recentSignups - previousWeekUsers) / previousWeekUsers) * 100 : 0;

  // Calculate conversion rates
  const paidUsers = proUsers + masterUsers;
      const conversionRate = (totalUsers || 0) > 0 ? (paidUsers / (totalUsers || 0)) * 100 : 0;

  // Calculate revenue metrics (estimated)
  const estimatedRevenue = (proUsers * 97) + (masterUsers * 197); // Monthly revenue in BRL

  return {
    totalUsers,
    activeUsers,
    proUsers,
    masterUsers,
    freeUsers,
    recentSignups,
    monthlySignups,
    usersWithPhone,
    recentLogins,
    weeklyGrowth,
    conversionRate,
    estimatedRevenue,
    paidUsers
  };
};

// Get user activity data for charts
export const getUserActivityData = (users: User[]) => {
  const now = new Date();
  const days = 30;
  const activityData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const signups = users.filter(u => {
      const created = new Date(u.created_at);
      return created >= dayStart && created < dayEnd;
    }).length;

    const logins = users.filter(u => {
      if (!u.last_login) return false;
      const login = new Date(u.last_login);
      return login >= dayStart && login < dayEnd;
    }).length;

    activityData.push({
      date: dayStart.toISOString().split('T')[0],
      signups,
      logins
    });
  }

  return activityData;
};

// Get plan distribution data
export const getPlanDistributionData = (users: User[]) => {
  const planCounts = {
    free: users.filter(u => u.plan === 'free').length,
    pro: users.filter(u => u.plan === 'pro').length,
    master: users.filter(u => u.plan === 'master').length
  };

  return [
    { name: 'Free', value: planCounts.free, color: '#6B7280' },
    { name: 'PRO', value: planCounts.pro, color: '#3B82F6' },
    { name: 'MASTER', value: planCounts.master, color: '#8B5CF6' }
  ];
};

// Enhanced statistics with Supabase aggregation queries
export const getEnhancedStats = async () => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users count
    const { count: totalUsers, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active users count
    const { count: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Get recent signups
    const { count: recentSignups, error: recentError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    if (recentError) throw recentError;

    // Get plan distribution
    const { data: planData, error: planError } = await supabase
      .from('users')
      .select('plan');

    if (planError) throw planError;

    const planCounts = {
      free: planData?.filter(u => u.plan === 'free').length || 0,
      pro: planData?.filter(u => u.plan === 'pro').length || 0,
      master: planData?.filter(u => u.plan === 'master').length || 0
    };

    const paidUsers = planCounts.pro + planCounts.master;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
    const estimatedRevenue = (planCounts.pro * 97) + (planCounts.master * 197);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      proUsers: planCounts.pro,
      masterUsers: planCounts.master,
      freeUsers: planCounts.free,
      recentSignups: recentSignups || 0,
      paidUsers,
      conversionRate,
      estimatedRevenue
    };
  } catch (error) {
    console.error('Error getting enhanced stats:', error);
    throw error;
  }
};

// Refresh data from Supabase
export const refreshData = async (): Promise<User[]> => {
  try {
    return await getUsers();
  } catch (error) {
    console.error('Error refreshing data:', error);
    throw error;
  }
};

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key');
};

// Fallback to mock data if Supabase is not available
export const getUsersWithFallback = async (): Promise<User[]> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, using mock data');
    return getMockUsers();
  }

  try {
    return await getUsers();
  } catch (error) {
    console.warn('Failed to fetch from Supabase, falling back to mock data:', error);
    return getMockUsers();
  }
};

// Mock data fallback functions
const generateMockUsers = (): User[] => {
  const plans: ('free' | 'pro' | 'master')[] = ['free', 'pro', 'master'];
  const names = [
    'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
    'Lucia Rodrigues', 'Roberto Almeida', 'Fernanda Lima', 'Ricardo Gomes', 'Patricia Martins',
    'Marcos Sousa', 'Juliana Barbosa', 'Andre Ribeiro', 'Camila Carvalho', 'Felipe Cardoso',
    'Gabriela Melo', 'Thiago Araujo', 'Isabela Castro', 'Rafael Dias', 'Mariana Moreira'
  ];

  const users: User[] = [];
  
  for (let i = 0; i < 50; i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
    
    const lastLogin = Math.random() > 0.3 ? new Date() : null;
    if (lastLogin) {
      lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 30));
    }

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const isActive = Math.random() > 0.15;
    const phoneVerified = Math.random() > 0.4;

    users.push({
      id: `user_${i + 1}`,
      name: names[i % names.length],
      email: `user${i + 1}@example.com`,
      phone: phoneVerified ? `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      plan,
      is_active: isActive,
      created_at: createdAt.toISOString(),
      last_login: lastLogin?.toISOString(),
      phone_verified: phoneVerified
    });
  }

  return users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

let mockUsers = generateMockUsers();

const getMockUsers = (): User[] => {
  return [...mockUsers];
};

export const refreshMockData = (): User[] => {
  mockUsers = generateMockUsers();
  return mockUsers;
}; 