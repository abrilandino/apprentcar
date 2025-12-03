import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Car, 
  FileText, 
  BarChart3, 
  Users,
  CheckCircle,
  Clock,
  Wrench,
  ArrowRight,
  TrendingUp,
  Package,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SimpleDashboardProps {
  onNavigate: (page: string) => void;
}

export function SimpleDashboard({ onNavigate }: SimpleDashboardProps) {
  const { user } = useAuth();
  const { vehicles, rentals, users, contracts } = useApp();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Función para obtener el saludo según la hora
  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour >= 5 && hour < 12) return '¡Buenos días';
    if (hour >= 12 && hour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Formatear fecha
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return currentDateTime.toLocaleDateString('es-ES', options);
  };

  // Formatear hora
  const formatTime = () => {
    return currentDateTime.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Estadísticas básicas
  const availableVehicles = vehicles.filter(v => v.status === 'disponible').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rentado').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'en-mantenimiento').length;
  const activeRentals = rentals.filter(r => r.status === 'activa').length;
  const totalUsers = users.length;
  const totalContracts = contracts.length;

  // Calcular ingresos totales basados en rentas completadas
  const totalRevenue = rentals
    .filter(r => r.status === 'completada')
    .reduce((sum, r) => sum + (r.totalCost || 0), 0);

  // Actividad reciente - obtener las 3 rentas más recientes
  const recentRentals = [...rentals]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  // Función para obtener información del vehículo
  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo';
  };

  // Función para calcular tiempo transcurrido
  const getTimeAgo = (date: Date | undefined) => {
    if (!date) return 'Recientemente';
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Header con saludo dinámico y fecha/hora */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4">
            <h1 className="mb-1 dark:text-white">
              {getGreeting()}, {user?.username}!
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="capitalize text-xs sm:text-sm">{formatDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-xs sm:text-sm">{formatTime()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="border dark:bg-[#272727] dark:border-gray-700">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total de Vehículos</p>
                  <p className="text-xl md:text-2xl text-gray-900 dark:text-white">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border dark:bg-[#272727] dark:border-gray-700">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Disponibles</p>
                  <p className="text-xl md:text-2xl text-gray-900 dark:text-white">{availableVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border dark:bg-[#272727] dark:border-gray-700">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-0.5">En Renta</p>
                  <p className="text-xl md:text-2xl text-gray-900 dark:text-white">{rentedVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border dark:bg-[#272727] dark:border-gray-700">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Mantenimiento</p>
                  <p className="text-xl md:text-2xl text-gray-900 dark:text-white">{maintenanceVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Principales */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-gray-900 dark:text-white mb-4 md:mb-6">Acciones principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card 
              className="border-2 dark:bg-[#272727] dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group hover:border-[#D4A5A0] dark:hover:border-[#7D0C00]"
              onClick={() => onNavigate('vehicles')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#7D0C00' }}>
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:opacity-100 transition-all" style={{ opacity: 0.4 }} />
                </div>
                <CardTitle className="text-xl">Gestionar Vehículos</CardTitle>
                <CardDescription className="text-base">
                  Ver, editar y administrar toda la flota de vehículos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Disponibles</p>
                    <p className="text-xl text-gray-900 dark:text-white">{availableVehicles}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rentados</p>
                    <p className="text-xl text-gray-900 dark:text-white">{rentedVehicles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-2 dark:bg-[#272727] dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group hover:border-[#D4A5A0] dark:hover:border-[#7D0C00]"
              onClick={() => onNavigate('reservations-contracts')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#7D0C00' }}>
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:opacity-100 transition-all" style={{ opacity: 0.4 }} />
                </div>
                <CardTitle className="text-xl">Reservas y Contratos</CardTitle>
                <CardDescription className="text-base">
                  Administrar todas las reservas y documentación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Activas</p>
                    <p className="text-xl text-gray-900 dark:text-white">{activeRentals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <>
                <Card 
                  className="border-2 dark:bg-[#272727] dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group hover:border-[#D4A5A0] dark:hover:border-[#7D0C00]"
                  onClick={() => onNavigate('reports')}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#7D0C00' }}>
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:opacity-100 transition-all" style={{ opacity: 0.4 }} />
                    </div>
                    <CardTitle className="text-xl">Ver Reportes</CardTitle>
                    <CardDescription className="text-base">
                      Analiza estadísticas y rendimiento del negocio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg inline-block">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Ingresos estimados</p>
                      <p className="text-xl text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="border-2 dark:bg-[#272727] dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group hover:border-[#D4A5A0] dark:hover:border-[#7D0C00]"
                  onClick={() => onNavigate('users')}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#7D0C00' }}>
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:opacity-100 transition-all" style={{ opacity: 0.4 }} />
                    </div>
                    <CardTitle className="text-xl">Gestionar Usuarios</CardTitle>
                    <CardDescription className="text-base">
                      Administra empleados y permisos del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg inline-block">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total usuarios</p>
                      <p className="text-xl text-gray-900 dark:text-white">{totalUsers}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-2 dark:bg-[#272727] dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRentals.length > 0 ? (
                  recentRentals.map((rental) => {
                    const statusIcon = rental.status === 'activa' ? CheckCircle : 
                                      rental.status === 'completada' ? TrendingUp : Clock;
                    const StatusIcon = statusIcon;
                    
                    return (
                      <div key={rental.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#383838] rounded-lg border border-gray-200 dark:border-gray-600">
                        <StatusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {rental.status === 'activa' ? 'Renta activa' : 
                             rental.status === 'completada' ? 'Renta completada' : 'Nueva reserva'} - {getVehicleInfo(rental.vehicleId)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(rental.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-[#383838] rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 dark:bg-[#272727] dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full h-14 text-base justify-start bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 hover:from-blue-100/70 hover:to-blue-200/70 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 text-gray-900 dark:text-white border-2 border-blue-200/30 dark:border-blue-700/30 animate-gradient-rotate"
                variant="outline"
                onClick={() => onNavigate('vehicles')}
              >
                <Car className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                Ir a Vehículos
              </Button>
              <Button 
                className="w-full h-14 text-base justify-start bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30 hover:from-purple-100/70 hover:to-purple-200/70 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 text-gray-900 dark:text-white border-2 border-purple-200/30 dark:border-purple-700/30 animate-gradient-rotate-delay-1"
                variant="outline"
                onClick={() => onNavigate('reservations-contracts')}
              >
                <FileText className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                Ir a Reservas
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  className="w-full h-14 text-base justify-start bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/30 hover:from-amber-100/70 hover:to-amber-200/70 dark:hover:from-amber-900/50 dark:hover:to-amber-800/50 text-gray-900 dark:text-white border-2 border-amber-200/30 dark:border-amber-700/30 animate-gradient-rotate-delay-2"
                  variant="outline"
                  onClick={() => onNavigate('reports')}
                >
                  <BarChart3 className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-400" />
                  Ir a Reportes
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}