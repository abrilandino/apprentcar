import { Car, Home, ShoppingCart, User, Bell, BarChart3, Settings, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, logout } = useAuth();
  const { cart, notifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home, roles: ['empleado', 'admin'] },
    { id: 'vehicles', label: 'Vehículos', icon: Car, roles: ['empleado', 'admin'] },
    { id: 'cart', label: 'Carrito', icon: ShoppingCart, badge: cart.length, roles: ['empleado'] },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadNotifications, roles: ['empleado', 'admin'] },
    { id: 'admin', label: 'Administración', icon: Settings, roles: ['admin', 'empleado'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin', 'empleado'] },
    { id: 'profile', label: 'Perfil', icon: User, roles: ['empleado', 'admin'] }
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  // Different navigation for admin/empleado vs cliente
  const isStaff = user && (user.role === 'admin' || user.role === 'empleado');

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#808080] rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold">XYZ</span>
            </div>

            {/* Desktop Navigation - Staff (Admin/Empleado) */}
            {isStaff && (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={currentPage === 'admin' ? 'default' : 'ghost'}
                  onClick={() => handleNavClick('admin')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Panel
                </Button>
                <Button
                  variant={currentPage === 'reports' ? 'default' : 'ghost'}
                  onClick={() => handleNavClick('reports')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reportes
                </Button>
                <Button
                  variant={currentPage === 'notifications' ? 'default' : 'ghost'}
                  onClick={() => handleNavClick('notifications')}
                  className="relative"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones
                  {unreadNotifications > 0 && (
                    <Badge className="ml-2" variant="destructive">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
                
                {/* User Menu for Staff */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="w-4 h-4" />
                      {user.name}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleNavClick('profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('vehicles')}>
                      <Car className="w-4 h-4 mr-2" />
                      Ver vehículos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Desktop Navigation - Cliente */}
            {!isStaff && (
              <div className="hidden md:flex items-center gap-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? 'default' : 'ghost'}
                      onClick={() => handleNavClick(item.id)}
                      className="relative"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <Badge className="ml-2" variant="destructive">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
                <Button variant="outline" onClick={logout}>
                  Cerrar sesión
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => handleNavClick(item.id)}
                    className="w-full justify-start relative"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge className="ml-auto" variant="destructive">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
              <Button variant="outline" onClick={logout} className="w-full">
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}