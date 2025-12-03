import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { LogOut, Sun, Moon, Menu, Home, Car, FileText, BarChart3, Users } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

interface SimpleHeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function SimpleHeader({ onNavigate, currentPage }: SimpleHeaderProps) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const handleNavigate = (page: string) => {
    setIsMobileMenuOpen(false);
    onNavigate?.(page);
  };

  return (
    <>
      <header className="bg-white dark:bg-[#272727] border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40 shadow-sm transition-colors duration-200">
        <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden dark:text-white"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7D0C00' }}>
                <span className="text-base sm:text-lg md:text-2xl text-white">XYZ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base lg:text-xl text-gray-900 dark:text-white leading-tight">Sistema de Alquiler</h1>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 dark:text-gray-400">Gestión de Vehículos</p>
              </div>
            </div>

          {/* Right Section: Theme Toggle + User Menu */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative h-7 w-12 md:h-8 md:w-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7D0C00] dark:focus:ring-offset-[#272727]"
              style={{ backgroundColor: isDarkMode ? '#7D0C00' : '#e5e7eb' }}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 md:top-1 md:left-1 h-6 w-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  isDarkMode ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                }`}
              >
                {isDarkMode ? (
                  <Moon className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#7D0C00]" />
                ) : (
                  <Sun className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-600" />
                )}
              </span>
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 md:gap-3 h-12 md:h-14 px-2 md:px-4 hover:bg-gray-100 dark:hover:bg-[#383838]">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm md:text-base">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-[#272727] dark:border-gray-700">
                <DropdownMenuItem 
                  onClick={logout} 
                  className="cursor-pointer hover:opacity-90 m-1"
                  style={{ backgroundColor: '#7D0C00', color: 'white' }}
                >
                  <LogOut className="mr-2 h-4 w-4" style={{ color: 'white' }} />
                  <span style={{ color: 'white' }}>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Navigation Sheet */}
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetContent side="left" className="w-[280px] dark:bg-[#272727] dark:border-gray-700">
        <SheetHeader>
          <SheetTitle className="dark:text-white">Menú de Navegación</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full flex items-center gap-3 h-12 justify-start px-4 transition-all rounded-lg ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#383838]'
                }`}
                style={isActive ? { backgroundColor: '#7D0C00' } : undefined}
                onClick={() => handleNavigate(item.id)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}