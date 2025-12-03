import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Home,
  Car, 
  FileText, 
  BarChart3, 
  Users
} from 'lucide-react';

interface SimpleNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function SimpleNavigation({ currentPage, onNavigate }: SimpleNavigationProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, roles: ['admin', 'employee'] },
    { id: 'vehicles', label: 'Vehículos', icon: Car, roles: ['admin', 'employee'] },
    { id: 'reservations-contracts', label: 'Reservas', icon: FileText, roles: ['admin', 'employee'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <nav className="bg-white dark:bg-[#272727] border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`
                  flex items-center gap-2 h-12 px-6 whitespace-nowrap
                  ${isActive 
                    ? 'text-white' 
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
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}