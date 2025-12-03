import { 
  Car, 
  User, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  LogOut,
  FileText,
  FileSignature,
  ClipboardList,
  Calendar,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from './ui/utils';
import { Separator } from './ui/separator';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, section: 'main', adminOnly: true },
    { id: 'users', label: 'Usuarios', icon: Users, section: 'main', adminOnly: true },
    { id: 'vehicles', label: 'Rentar Vehículo', icon: Car, section: 'management' },
    { id: 'reservations-contracts', label: 'Reservas', icon: FileSignature, section: 'management' },
    { id: 'rentals', label: 'Gestión Rentas', icon: FileText, section: 'management' }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const renderNavButton = (item: any) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;

    return (
      <Button
        key={item.id}
        variant={isActive ? 'default' : 'ghost'}
        onClick={() => onNavigate(item.id)}
        className={cn(
          'w-full justify-start relative transition-all duration-200 rounded-sm',
          isCollapsed ? 'justify-center px-2' : 'px-4',
          isActive 
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md shadow-red-500/20' 
            : isCollapsed 
              ? 'hover:bg-neutral-900 text-neutral-300 hover:text-white'
              : 'hover:bg-neutral-100 text-neutral-700 hover:text-black'
        )}
      >
        <Icon className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
        {!isCollapsed && (
          <span className="flex-1 text-left">{item.label}</span>
        )}
      </Button>
    );
  };

  return (
    <aside
      className={cn(
        'border-r border-neutral-800 h-screen sticky top-0 transition-all duration-300 flex flex-col shadow-xl',
        isCollapsed ? 'w-20 bg-black' : 'w-72 bg-white'
      )}
    >
      {/* Header */}
      <div className={cn('h-16 flex items-center justify-between px-4 border-b', isCollapsed ? 'border-neutral-800' : 'border-neutral-200')}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-sm flex items-center justify-center shadow-md shadow-red-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-black">XYZ</span>
              <p className="text-xs text-neutral-500">Rental System</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('ml-auto', isCollapsed ? 'mx-auto hover:bg-neutral-900' : 'hover:bg-neutral-100')}
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', isCollapsed ? 'rotate-180 text-neutral-400' : 'text-neutral-600')} />
        </Button>
      </div>

      {/* User Info */}
      <div className={cn('px-4 py-4 border-b', isCollapsed ? 'border-neutral-800 px-2' : 'border-neutral-200')}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-sm flex items-center justify-center shadow-md ring-2 ring-neutral-700">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate text-black">{user?.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="w-11 h-11 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-sm flex items-center justify-center mx-auto shadow-md ring-2 ring-neutral-700">
            <User className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Main Section */}
        {!isCollapsed && (
          <p className="text-xs font-semibold text-neutral-500 px-3 mb-2 mt-2">PRINCIPAL</p>
        )}
        {filteredNavItems.filter(item => item.section === 'main').map(renderNavButton)}
        
        <Separator className={cn('my-4', isCollapsed ? 'bg-neutral-800' : 'bg-neutral-300')} />
        
        {/* Management Section */}
        {!isCollapsed && (
          <p className="text-xs font-semibold text-neutral-500 px-3 mb-2">GESTIÓN</p>
        )}
        {filteredNavItems.filter(item => item.section === 'management').map(renderNavButton)}
      </nav>

      {/* Footer - Logout */}
      <div className={cn('p-3 border-t', isCollapsed ? 'border-neutral-800' : 'border-neutral-200')}>
        <Button
          variant="outline"
          onClick={logout}
          className={cn(
            'w-full justify-start text-red-500 hover:text-red-400 border-red-900/50 transition-all rounded-sm',
            isCollapsed ? 'justify-center px-2 hover:bg-red-950/50' : 'hover:bg-red-50'
          )}
        >
          <LogOut className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
          {!isCollapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </aside>
  );
}