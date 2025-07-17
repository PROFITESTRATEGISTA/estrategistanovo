// Admin panel types and interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: 'free' | 'pro' | 'master';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone_verified: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  proUsers: number;
  masterUsers: number;
  freeUsers: number;
  recentSignups: number;
  monthlySignups: number;
  usersWithPhone: number;
  recentLogins: number;
  weeklyGrowth: number;
  conversionRate: number;
  estimatedRevenue: number;
  paidUsers: number;
}

export interface ActivityData {
  date: string;
  signups: number;
  logins: number;
}

export interface PlanDistribution {
  name: string;
  value: number;
  color: string;
}

export interface AdminPanelProps {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onRefreshData?: () => void;
  loading?: boolean;
} 