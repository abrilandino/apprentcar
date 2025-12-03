import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Home,
  Car, 
  FileText, 
  BarChart3, 
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarCheck
} from 'lucide-react';

interface CollapsibleSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function CollapsibleSidebar({ currentPage, onNavigate }: CollapsibleSidebarProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, roles: ['admin', 'empleado'] },
    { id: 'vehicles', label: 'Vehículos', icon: Car, roles: ['admin', 'empleado'] },
    { id: 'reservations-contracts', label: 'Reservas', icon: FileText, roles: ['admin', 'empleado'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside 
      className={`
        fixed top-[73px] left-0 bottom-0 bg-white dark:bg-[#272727] 
        border-r border-gray-200 dark:border-gray-700 
        transition-all duration-300 ease-in-out z-30
        flex flex-col
        hidden md:flex
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
      style={{ 
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Toggle Button - Solo visible en desktop */}
      <div className="absolute -right-4 top-8 z-50 hidden md:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-[#272727]"
          style={{ backgroundColor: '#7D0C00' }}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2 mt-8 flex-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <Button
                variant="ghost"
                className={`
                  w-full flex items-center gap-3 h-12 transition-all rounded-lg
                  ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'}
                  ${isActive 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#383838]'
                  }
                `}
                style={isActive ? { backgroundColor: '#7D0C00' } : undefined}
                onMouseEnter={(e) => {
                  if (isActive) e.currentTarget.style.backgroundColor = '#5A0900';
                }}
                onMouseLeave={(e) => {
                  if (isActive) e.currentTarget.style.backgroundColor = '#7D0C00';
                }}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </Button>
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info (only when expanded) */}
      {!isCollapsed && (
        <div className="p-4 flex-shrink-0">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="truncate">{user?.name}</p>
              <p className="text-[10px] mt-1 opacity-75">
                {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}