import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Car, Star, TrendingUp, Shield, Clock, Users, Fuel, Settings, Gauge } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { Vehicle } from '../types';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const { vehicles, rentals } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>('rentado');

  const availableVehicles = vehicles.filter(v => v.status === 'disponible');
  const filteredVehicles = vehicleStatusFilter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === vehicleStatusFilter);
  const userRentals = rentals.filter(r => r.userId === user?.id);
  const activeRentals = userRentals.filter(r => r.status === 'activa');

  const features = [
    {
      icon: Car,
      title: 'Flota diversa',
      description: 'Más de 500 vehículos de diferentes categorías'
    },
    {
      icon: Shield,
      title: 'Seguro incluido',
      description: 'Todos nuestros vehículos tienen seguro completo'
    },
    {
      icon: Clock,
      title: 'Disponible 24/7',
      description: 'Alquila cuando quieras, donde quieras'
    },
    {
      icon: Star,
      title: 'Servicio premium',
      description: 'Atención personalizada y de calidad'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'disponible': { label: 'Disponible', variant: 'default' },
      'pre-rentado': { label: 'Pre-rentado', variant: 'secondary' },
      'rentado': { label: 'Rentado', variant: 'destructive' },
      'en-mantenimiento': { label: 'Mantenimiento', variant: 'outline' }
    };

    const config = statusConfig[status] || statusConfig['disponible'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-white">Bienvenido{user?.name ? `, ${user.name}` : ''}</h1>
            <p className="text-neutral-400 mb-8">
              Sistema de gestión de alquiler de vehículos XYZ. Encuentra el vehículo perfecto para tu próximo viaje.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/20" onClick={() => onNavigate('vehicles')}>
                Explorar vehículos
              </Button>
              {user?.role === 'admin' && (
                <Button size="lg" variant="outline" className="text-neutral-300 border-neutral-700 hover:bg-neutral-900 hover:text-white" onClick={() => onNavigate('admin')}>
                  Panel de administración
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-[#272727] border-[#3a3a3a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Vehículos disponibles</CardTitle>
              <div className="w-10 h-10 bg-[#7D0C00]/20 rounded-lg flex items-center justify-center ring-1 ring-[#7D0C00]/30">
                <Car className="h-5 w-5 text-[#7D0C00]" />
              </div>
            </CardHeader>
            <div className="w-full h-px bg-[#3a3a3a] mb-4"></div>
            <CardContent>
              <div className="text-2xl text-white">{availableVehicles.length}</div>
              <p className="text-neutral-400">de {vehicles.length} totales</p>
            </CardContent>
          </Card>

          {user?.role !== 'admin' && (
            <Card className="bg-[#272727] border-[#3a3a3a]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white">Alquileres activos</CardTitle>
                <div className="w-10 h-10 bg-[#7D0C00]/20 rounded-lg flex items-center justify-center ring-1 ring-[#7D0C00]/30">
                  <TrendingUp className="h-5 w-5 text-[#7D0C00]" />
                </div>
              </CardHeader>
              <div className="w-full h-px bg-[#3a3a3a] mb-4"></div>
              <CardContent>
                <div className="text-2xl text-white">{activeRentals.length}</div>
                <p className="text-neutral-400">en curso</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#272727] border-[#3a3a3a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Calificación promedio</CardTitle>
              <div className="w-10 h-10 bg-[#7D0C00]/20 rounded-lg flex items-center justify-center ring-1 ring-[#7D0C00]/30">
                <Star className="h-5 w-5 text-[#7D0C00]" />
              </div>
            </CardHeader>
            <div className="w-full h-px bg-[#3a3a3a] mb-4"></div>
            <CardContent>
              <div className="text-2xl text-white">4.7</div>
              <p className="text-neutral-400">de 5 estrellas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Rentals */}
        {activeRentals.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-white">Tus alquileres activos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRentals.map((rental) => {
                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                if (!vehicle) return null;

                return (
                  <Card key={rental.id} className="bg-[#272727] border-[#3a3a3a]">
                    <CardHeader>
                      <CardTitle className="text-white">{vehicle.brand} {vehicle.model}</CardTitle>
                      <CardDescription className="text-neutral-400">Reserva: {rental.registrationNumber}</CardDescription>
                    </CardHeader>
                    <div className="w-full h-px bg-[#3a3a3a]"></div>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#7D0C00] rounded-full"></div>
                          <p className="text-neutral-300">
                            Recogida: <span className="text-white">{new Date(rental.startDate).toLocaleDateString('es-ES')}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#7D0C00] rounded-full"></div>
                          <p className="text-neutral-300">
                            Devolución: <span className="text-white">{new Date(rental.endDate).toLocaleDateString('es-ES')}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#7D0C00] rounded-full"></div>
                          <p className="text-neutral-300">
                            Ubicación: <span className="text-white">{rental.pickupLocation}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Vehicle Status Filter Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white">Estado de vehículos</h2>
            <div className="flex items-center gap-4">
              <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                <SelectTrigger className="w-[250px] bg-[#272727] border-[#3a3a3a] text-white">
                  <SelectValue placeholder="Estado del vehículo" />
                </SelectTrigger>
                <SelectContent className="bg-[#272727] border-[#3a3a3a]">
                  <SelectItem value="all" className="text-white">Todos los estados</SelectItem>
                  <SelectItem value="disponible" className="text-white">Disponible</SelectItem>
                  <SelectItem value="pre-rentado" className="text-white">Pre-rentado</SelectItem>
                  <SelectItem value="rentado" className="text-white">Rentado</SelectItem>
                  <SelectItem value="en-mantenimiento" className="text-white">En mantenimiento</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={
                vehicleStatusFilter === 'disponible' ? 'default' :
                vehicleStatusFilter === 'pre-rentado' ? 'secondary' :
                vehicleStatusFilter === 'rentado' ? 'destructive' :
                vehicleStatusFilter === 'en-mantenimiento' ? 'outline' : 'default'
              } className="bg-[#7D0C00] text-white border-[#7D0C00]">
                {filteredVehicles.length} vehículos
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-[#272727] border-[#3a3a3a]">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={vehicle.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{vehicle.brand} {vehicle.model}</CardTitle>
                        <CardDescription className="text-neutral-400">{vehicle.year} • {vehicle.category}</CardDescription>
                      </div>
                      {vehicle.rating && (
                        <div className="flex items-center gap-1 text-white">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{vehicle.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <div className="w-full h-px bg-[#3a3a3a]"></div>

                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Users className="w-4 h-4 text-[#7D0C00]" />
                        <span className="text-white">{vehicle.seats}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Settings className="w-4 h-4 text-[#7D0C00]" />
                        <span className="text-white">{vehicle.transmission === 'Automática' ? 'Auto' : 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Fuel className="w-4 h-4 text-[#7D0C00]" />
                        <span className="text-white">{vehicle.fuelType}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl text-white">${vehicle.pricePerDay}</span>
                      <span className="text-neutral-400">/ día</span>
                    </div>

                    <div className="text-sm text-neutral-400">
                      Matrícula: <span className="text-white">{vehicle.licensePlate}</span>
                    </div>
                  </CardContent>

                  <CardContent className="pt-0">
                    <Button 
                      className="w-full bg-[#7D0C00] hover:bg-[#5a0900] text-white border-0" 
                      onClick={() => handleViewDetails(vehicle)}
                    >
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            {filteredVehicles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Car className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-neutral-400 mb-2">No hay vehículos con este estado</h3>
                <p className="text-neutral-500">
                  Intenta seleccionar otro filtro de estado
                </p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-center mb-8 text-white">¿Por qué elegir XYZ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-[#272727] border-[#3a3a3a]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[#7D0C00]/20 rounded-lg flex items-center justify-center mb-4 ring-1 ring-[#7D0C00]/30">
                      <Icon className="w-6 h-6 text-[#7D0C00]" />
                    </div>
                    <div className="w-full h-px bg-[#3a3a3a] mb-3"></div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-neutral-400">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-[#7D0C00] to-[#5a0900] border-0 shadow-xl shadow-[#7D0C00]/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-white mb-4">¿Listo para empezar?</h2>
            <div className="w-24 h-px bg-white/30 mx-auto mb-4"></div>
            <p className="text-red-100 mb-6">
              Explora nuestra flota y encuentra el vehículo perfecto para ti
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-[#7D0C00] hover:bg-neutral-100" onClick={() => onNavigate('vehicles')}>
              Ver vehículos disponibles
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedVehicle && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVehicle.brand} {selectedVehicle.model}</DialogTitle>
              <DialogDescription>
                {selectedVehicle.year} • {selectedVehicle.category}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Vehicle Image */}
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedVehicle.imageUrl}
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(selectedVehicle.status)}
                </div>
              </div>

              {/* Price and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl">${selectedVehicle.pricePerDay}</span>
                  <span className="text-muted-foreground">/ día</span>
                </div>
                {selectedVehicle.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>{selectedVehicle.rating.toFixed(1)}</span>
                    {selectedVehicle.reviewCount && (
                      <span className="text-muted-foreground">({selectedVehicle.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedVehicle.description && (
                <div>
                  <h3 className="mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{selectedVehicle.description}</p>
                </div>
              )}

              {/* Vehicle Specifications */}
              <div>
                <h3 className="mb-4">Especificaciones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Asientos</p>
                      <p>{selectedVehicle.seats} personas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmisión</p>
                      <p>{selectedVehicle.transmission}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Combustible</p>
                      <p>{selectedVehicle.fuelType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kilometraje</p>
                      <p>{selectedVehicle.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Matrícula</p>
                      <p>{selectedVehicle.licensePlate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Año</p>
                      <p>{selectedVehicle.year}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                <div>
                  <h3 className="mb-3">Características adicionales</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVehicle.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}