import {
  LayoutDashboard,
  Users,
  UserCheck,
  GitMerge,
  ClipboardCheck,
  Package,
  FileText,
  ShoppingBag,
  Wrench,
  HardHat,
  Receipt,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Shield,
  Settings,
} from 'lucide-react';
import { ModuleName } from '@/lib/rbac';

export interface NavItem {
  label: string;
  href: string;
  module: ModuleName;
  icon: any;
  badge?: string;
}

export const ERP_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/erp', module: 'dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/erp/leads', module: 'leads', icon: Users },
  { label: 'Customers', href: '/erp/customers', module: 'customers', icon: UserCheck },
  { label: 'Sales Pipeline', href: '/erp/pipeline', module: 'pipeline', icon: GitMerge },
  { label: 'Site Surveys', href: '/erp/surveys', module: 'pipeline', icon: ClipboardCheck },
  { label: 'Products', href: '/erp/products', module: 'products', icon: Package },
  { label: 'Quotations', href: '/erp/quotations', module: 'quotations', icon: FileText },
  { label: 'Orders', href: '/erp/orders', module: 'orders', icon: ShoppingBag },
  { label: 'Projects', href: '/erp/projects', module: 'projects', icon: Wrench },
  { label: 'Installations', href: '/erp/installations', module: 'projects', icon: HardHat },
  { label: 'Invoices', href: '/erp/invoices', module: 'invoices', icon: Receipt },
  { label: 'Payments', href: '/erp/payments', module: 'invoices', icon: CreditCard },
  { label: 'Follow-ups', href: '/erp/followups', module: 'followups', icon: CalendarCheck },
  { label: 'Reports', href: '/erp/reports', module: 'analytics', icon: BarChart3 },
  { label: 'Users', href: '/erp/users', module: 'users', icon: Shield },
  { label: 'Settings', href: '/erp/settings', module: 'settings', icon: Settings },
];
