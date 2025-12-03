import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { Search, Plus, Trash2, Star, Users, Fuel, Settings, Filter, X, Eye, CalendarCheck, Car, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Vehicle, VehicleStatus, Contract } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface VehiclesPageProps {
  onSelectVehicle: (vehicleId: string) => void;
  onNavigate?: (page: string) => void;
}

export function VehiclesPage({ onSelectVehicle, onNavigate }: VehiclesPageProps) {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, addRental, users, contracts, rentals, updateContract, updateRental, addNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Estados para los dos modales independientes
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Estados para el modal de reasignación
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignVehicle, setReassignVehicle] = useState<Vehicle | null>(null);
  const [selectedContractForReassign, setSelectedContractForReassign] = useState<string>('');
  
  // Estado para el formulario de renta
  const [rentFormData, setRentFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dateRange: undefined as DateRange | undefined,
    pickupLocation: '',
    returnLocation: '',
    reservationType: 'reservado' as 'reservado' | 'pre-reservado',
    initialPayment: 0,
    deposit: 0,
  });

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    pricePerDay: 0,
    status: 'disponible' as VehicleStatus,
    imageUrl: '',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 5,
    mileage: 0,
    licensePlate: '',
    description: '',
    features: [] as string[]
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(vehicles.map(v => v.category)));
    return cats;
  }, [vehicles]);

  const filteredAndSortedVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || vehicle.category === categoryFilter;

      let matchesPrice = true;
      if (priceFilter === 'low') {
        matchesPrice = vehicle.pricePerDay < 100;
      } else if (priceFilter === 'medium') {
        matchesPrice = vehicle.pricePerDay >= 100 && vehicle.pricePerDay < 200;
      } else if (priceFilter === 'high') {
        matchesPrice = vehicle.pricePerDay >= 200;
      }

      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
    });
  }, [vehicles, searchQuery, categoryFilter, priceFilter, statusFilter]);

  const getStatusBadge = (status: VehicleStatus) => {
    const statusConfig = {
      'disponible': { label: 'Disponible', variant: 'default' as const },
      'pre-rentado': { label: 'Pre-rentado', variant: 'secondary' as const },
      'rentado': { label: 'Rentado', variant: 'destructive' as const },
      'en-mantenimiento': { label: 'Mantenimiento', variant: 'outline' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        pricePerDay: vehicle.pricePerDay,
        status: vehicle.status,
        imageUrl: vehicle.imageUrl,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        seats: vehicle.seats,
        mileage: vehicle.mileage,
        licensePlate: vehicle.licensePlate,
        description: vehicle.description,
        features: vehicle.features
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        category: '',
        pricePerDay: 0,
        status: 'disponible',
        imageUrl: '',
        transmission: 'Automática',
        fuelType: 'Gasolina',
        seats: 5,
        mileage: 0,
        licensePlate: '',
        description: '',
        features: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSave = () => {
    if (!formData.brand || !formData.model || !formData.category || !formData.licensePlate) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, formData);
      toast.success('Vehículo actualizado exitosamente');
    } else {
      addVehicle(formData);
      toast.success('Vehículo agregado exitosamente');
    }
    handleCloseModal();
  };

  const handleDelete = (vehicleId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      deleteVehicle(vehicleId);
      toast.success('Vehículo eliminado exitosamente');
    }
  };

  // Funciones para el modal de Rentar
  const handleOpenRentModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setRentFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      dateRange: undefined,
      pickupLocation: '',
      returnLocation: '',
      reservationType: 'reservado',
      initialPayment: 0,
      deposit: vehicle.pricePerDay * 0.5, // 50% como depósito por defecto
    });
    setIsRentModalOpen(true);
  };

  const handleCloseRentModal = () => {
    setIsRentModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSaveRental = () => {
    if (!selectedVehicle || !rentFormData.customerName || !rentFormData.customerEmail || !rentFormData.customerPhone || !rentFormData.dateRange?.from || !rentFormData.dateRange?.to) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!rentFormData.pickupLocation || !rentFormData.returnLocation) {
      toast.error('Por favor completa los lugares de recogida y devolución');
      return;
    }

    const startDate = rentFormData.dateRange.from;
    const endDate = rentFormData.dateRange.to;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const basePrice = selectedVehicle.pricePerDay * totalDays;
    const totalPrice = basePrice + rentFormData.deposit;

    const rentalData = {
      registrationNumber: `RNT-${Date.now()}`,
      reservationType: rentFormData.reservationType,
      vehicleId: selectedVehicle.id,
      userId: rentFormData.customerEmail, // Usar el email como ID de usuario
      // Información del cliente para generar el contrato después
      customerName: rentFormData.customerName,
      customerEmail: rentFormData.customerEmail,
      customerPhone: rentFormData.customerPhone,
      startDate,
      endDate,
      totalDays,
      basePrice,
      initialPayment: rentFormData.initialPayment,
      deposit: rentFormData.deposit,
      damageCharges: 0,
      totalPrice,
      status: 'pendiente' as const,
      contractSigned: false,
      pickupLocation: rentFormData.pickupLocation,
      returnLocation: rentFormData.returnLocation,
      createdAt: new Date(),
    };

    addRental(rentalData);
    toast.success(`Contrato preliminar creado - Número: ${rentalData.registrationNumber}`, {
      description: 'Redirigiendo a Reservas y Contratos para completar el proceso...',
      duration: 3000,
    });
    handleCloseRentModal();
    
    // Redirigir a la página de Reservas después de un breve delay
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('reservations-contracts');
      }
    }, 500);
  };

  // Funciones para el modal de Ver Detalles
  const handleOpenDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVehicle(null);
  };

  // Funciones para el modal de Reasignación
  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.status === 'activo');
  }, [contracts]);

  const handleOpenReassignModal = (vehicle: Vehicle) => {
    setReassignVehicle(vehicle);
    setSelectedContractForReassign('');
    setIsReassignModalOpen(true);
  };

  const handleCloseReassignModal = () => {
    setIsReassignModalOpen(false);
    setReassignVehicle(null);
    setSelectedContractForReassign('');
  };

  const handleReassignVehicle = () => {
    if (!reassignVehicle || !selectedContractForReassign) {
      toast.error('Por favor selecciona un contrato para reasignar');
      return;
    }

    const contract = contracts.find(c => c.id === selectedContractForReassign);
    if (!contract) {
      toast.error('Contrato no encontrado');
      return;
    }

    const rental = rentals.find(r => r.id === contract.rentalId);
    if (!rental) {
      toast.error('Renta no encontrada');
      return;
    }

    const oldVehicle = vehicles.find(v => v.id === contract.vehicleId);

    // Actualizar el contrato con el nuevo vehículo y agregar nota
    updateContract(contract.id, {
      vehicleId: reassignVehicle.id,
      notes: `${contract.notes || ''}\n\nReasignación: Vehículo cambiado de ${oldVehicle?.brand} ${oldVehicle?.model} (${oldVehicle?.licensePlate}) a ${reassignVehicle.brand} ${reassignVehicle.model} (${reassignVehicle.licensePlate}) - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`
    });

    // Actualizar la renta con el nuevo vehículo
    updateRental(rental.id, {
      vehicleId: reassignVehicle.id
    });

    // Actualizar el estado del vehículo anterior a disponible
    if (oldVehicle) {
      updateVehicle(oldVehicle.id, {
        status: 'disponible'
      });
    }

    // Actualizar el estado del nuevo vehículo a rentado
    updateVehicle(reassignVehicle.id, {
      status: 'rentado'
    });

    toast.success(`Vehículo reasignado exitosamente a ${reassignVehicle.brand} ${reassignVehicle.model}`);
    handleCloseReassignModal();

    // Notificar al cliente
    addNotification({
      id: String(Date.now()),
      userId: contract.userId,
      title: 'Vehículo reasignado',
      message: `Tu vehículo ha sido reasignado de ${oldVehicle?.brand} ${oldVehicle?.model} a ${reassignVehicle.brand} ${reassignVehicle.model}. El costo se mantiene sin cambios según el acuerdo original.`,
      type: 'info',
      read: false,
      createdAt: new Date()
    });
  };

  const activeFiltersCount = [
    categoryFilter !== 'all',
    priceFilter !== 'all',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727]">
      <div className="bg-white dark:bg-[#272727] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 md:mb-6">
            <h1 className="dark:text-white">Gestión de Vehículos</h1>
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-3 md:mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por marca, modelo o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Filters Button for Mobile / Inline Filters for Desktop */}
          <div className="flex items-center gap-3 mb-4">
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden relative dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7D0C00] text-white rounded-full text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] dark:bg-[#272727] dark:border-gray-700">
                <SheetHeader>
                  <SheetTitle className="dark:text-white">Filtros de Búsqueda</SheetTitle>
                  <SheetDescription className="dark:text-gray-400">
                    Personaliza tu búsqueda de vehículos
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label className="dark:text-white">Tipo de vehículo</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full mt-2 dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Tipo de vehículo" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="dark:text-white">Rango de precio</Label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="w-full mt-2 dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Rango de precio" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                        <SelectItem value="all">Todos los precios</SelectItem>
                        <SelectItem value="low">Menos de $100/día</SelectItem>
                        <SelectItem value="medium">$100-$200/día</SelectItem>
                        <SelectItem value="high">Más de $200/día</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="dark:text-white">Estado del vehículo</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full mt-2 dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Estado del vehículo" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="pre-rentado">Pre-rentado</SelectItem>
                        <SelectItem value="rentado">Rentado</SelectItem>
                        <SelectItem value="en-mantenimiento">En mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]"
                      onClick={() => {
                        setCategoryFilter('all');
                        setPriceFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => setIsFilterOpen(false)}
                    style={{ backgroundColor: '#7D0C00' }}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Tipo de vehículo" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[200px] dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Rango de precio" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="low">Menos de $100/día</SelectItem>
                  <SelectItem value="medium">$100-$200/día</SelectItem>
                  <SelectItem value="high">Más de $200/día</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Estado del vehículo" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="pre-rentado">Pre-rentado</SelectItem>
                  <SelectItem value="rentado">Rentado</SelectItem>
                  <SelectItem value="en-mantenimiento">En mantenimiento</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]"
                  onClick={() => {
                    setCategoryFilter('all');
                    setPriceFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Mostrando {filteredAndSortedVehicles.length} de {vehicles.length} vehículos
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#272727] dark:border-gray-700 group">
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
              
              <CardHeader className="dark:bg-[#272727]">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="dark:text-white">{vehicle.brand} {vehicle.model}</CardTitle>
                    <CardDescription className="dark:text-gray-400">{vehicle.year} • {vehicle.category}</CardDescription>
                  </div>
                  {vehicle.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="dark:text-white">{vehicle.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="dark:bg-[#272727]">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{vehicle.seats}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                    <Settings className="w-4 h-4" />
                    <span>{vehicle.transmission === 'Automática' ? 'Auto' : 'Manual'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                    <Fuel className="w-4 h-4" />
                    <span>{vehicle.fuelType}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl dark:text-white">${vehicle.pricePerDay}</span>
                  <span className="text-muted-foreground dark:text-gray-400">/ día</span>
                </div>

                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Matrícula: {vehicle.licensePlate}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 dark:bg-[#272727] dark:border-t dark:border-gray-700">
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => handleOpenRentModal(vehicle)}
                    className="flex-1"
                    style={{ backgroundColor: '#7D0C00' }}
                    title="Rentar auto"
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Rentar
                  </Button>

                  <Button 
                    onClick={() => handleOpenDetailsModal(vehicle)}
                    title="Ver detalles del vehículo"
                    className="flex-1"
                    style={{ 
                      backgroundColor: '#1a1a1a',
                      color: 'white'
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Detalles
                  </Button>
                </div>
                
                <Button 
                  onClick={() => handleOpenReassignModal(vehicle)}
                  title="Reasignar vehículo a otro cliente"
                  className="w-full"
                  variant="outline"
                  style={{ 
                    borderColor: '#7D0C00',
                    color: '#7D0C00'
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reasignar Vehículo
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredAndSortedVehicles.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 mb-2">No se encontraron vehículos</h3>
            <p className="text-muted-foreground dark:text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{editingVehicle ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {editingVehicle ? 'Actualiza la información del vehículo' : 'Completa los datos del nuevo vehículo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand" className="dark:text-white">Marca *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Toyota, BMW, etc."
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="dark:text-white">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Corolla, X5, etc."
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="dark:text-white">Año *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="2000"
                max="2030"
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="dark:text-white">Tipo/Categoría *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="SUV, Sedán, etc."
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="dark:text-white">Matrícula *</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="ABC-123"
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerDay" className="dark:text-white">Precio por día *</Label>
              <Input
                id="pricePerDay"
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                min="0"
                placeholder="100"
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="dark:text-white">Estado *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as VehicleStatus })}>
                <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="pre-rentado">Pre-rentado</SelectItem>
                  <SelectItem value="rentado">Rentado</SelectItem>
                  <SelectItem value="en-mantenimiento">En mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmission" className="dark:text-white">Transmisión</Label>
              <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="Automática">Automática</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType" className="dark:text-white">Tipo de combustible</Label>
              <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Diésel">Diésel</SelectItem>
                  <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats" className="dark:text-white">Asientos</Label>
              <Input
                id="seats"
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                min="2"
                max="12"
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage" className="dark:text-white">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                min="0"
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl" className="dark:text-white">URL de Imagen</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
              {formData.imageUrl && (
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border dark:border-gray-600">
                  <ImageWithFallback
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="dark:text-white">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del vehículo..."
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} className="dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]">
              Cancelar
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: '#7D0C00' }}>
              {editingVehicle ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rentar - INDEPENDIENTE */}
      <Dialog open={isRentModalOpen} onOpenChange={setIsRentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Rentar Vehículo</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedVehicle && `${selectedVehicle.brand} ${selectedVehicle.model} - $${selectedVehicle.pricePerDay}/día`}
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="dark:text-white">Nombre del Cliente *</Label>
                  <Input
                    id="customerName"
                    value={rentFormData.customerName}
                    onChange={(e) => setRentFormData({ ...rentFormData, customerName: e.target.value })}
                    placeholder="Nombre completo"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail" className="dark:text-white">Email del Cliente *</Label>
                  <Input
                    id="customerEmail"
                    value={rentFormData.customerEmail}
                    onChange={(e) => setRentFormData({ ...rentFormData, customerEmail: e.target.value })}
                    placeholder="Correo electrónico"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="dark:text-white">Teléfono del Cliente *</Label>
                  <Input
                    id="customerPhone"
                    value={rentFormData.customerPhone}
                    onChange={(e) => setRentFormData({ ...rentFormData, customerPhone: e.target.value })}
                    placeholder="Número de teléfono"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservationType" className="dark:text-white">Tipo de Reserva *</Label>
                  <Select value={rentFormData.reservationType} onValueChange={(value: 'reservado' | 'pre-reservado') => setRentFormData({ ...rentFormData, reservationType: value })}>
                    <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                      <SelectItem value="reservado">Reservado</SelectItem>
                      <SelectItem value="pre-reservado">Pre-reservado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <DateRangePicker
                    label="Fechas de Renta"
                    value={rentFormData.dateRange}
                    onChange={(range) => setRentFormData({ ...rentFormData, dateRange: range })}
                    placeholder="Seleccionar fechas de inicio y fin"
                    required={true}
                    numberOfMonths={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation" className="dark:text-white">Lugar de Recogida *</Label>
                  <Input
                    id="pickupLocation"
                    value={rentFormData.pickupLocation}
                    onChange={(e) => setRentFormData({ ...rentFormData, pickupLocation: e.target.value })}
                    placeholder="Dirección de recogida"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnLocation" className="dark:text-white">Lugar de Devolución *</Label>
                  <Input
                    id="returnLocation"
                    value={rentFormData.returnLocation}
                    onChange={(e) => setRentFormData({ ...rentFormData, returnLocation: e.target.value })}
                    placeholder="Dirección de devolución"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit" className="dark:text-white">Depósito *</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={rentFormData.deposit}
                    onChange={(e) => setRentFormData({ ...rentFormData, deposit: parseFloat(e.target.value) })}
                    min="0"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialPayment" className="dark:text-white">Pago Inicial</Label>
                  <Input
                    id="initialPayment"
                    type="number"
                    value={rentFormData.initialPayment}
                    onChange={(e) => setRentFormData({ ...rentFormData, initialPayment: parseFloat(e.target.value) })}
                    min="0"
                    className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {rentFormData.dateRange?.from && rentFormData.dateRange?.to && (
                <div className="p-4 bg-gray-100 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <h4 className="dark:text-white mb-2">Resumen de Renta</h4>
                  <div className="space-y-1 text-sm">
                    <p className="dark:text-gray-300">
                      Días: {Math.ceil((rentFormData.dateRange.to.getTime() - rentFormData.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="dark:text-gray-300">
                      Precio base: ${selectedVehicle.pricePerDay * Math.ceil((rentFormData.dateRange.to.getTime() - rentFormData.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="dark:text-gray-300">
                      Depósito: ${rentFormData.deposit}
                    </p>
                    <p className="dark:text-white">
                      Total: ${(selectedVehicle.pricePerDay * Math.ceil((rentFormData.dateRange.to.getTime() - rentFormData.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))) + rentFormData.deposit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRentModal} className="dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]">
              Cancelar
            </Button>
            <Button onClick={handleSaveRental} style={{ backgroundColor: '#7D0C00' }}>
              Generar Contrato Preliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles - INDEPENDIENTE */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700 bg-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Detalles del Vehículo</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Informacin completa del vehículo
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* Imagen principal */}
              <div className="aspect-video rounded-lg overflow-hidden border dark:border-gray-600">
                <ImageWithFallback
                  src={selectedVehicle.imageUrl}
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Información principal */}
              <div>
                <h3 className="dark:text-white mb-2">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusBadge(selectedVehicle.status)}
                  {selectedVehicle.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="dark:text-white">{selectedVehicle.rating.toFixed(1)}</span>
                      {selectedVehicle.reviewCount && (
                        <span className="text-sm text-muted-foreground dark:text-gray-400">
                          ({selectedVehicle.reviewCount} reseñas)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Año</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.year}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Transmisión</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.transmission}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Fuel className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Combustible</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.fuelType}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Asientos</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.seats}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Matrícula</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.licensePlate}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-[#7D0C00]" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Kilometraje</span>
                  </div>
                  <p className="dark:text-white text-gray-900">{selectedVehicle.mileage.toLocaleString()} km</p>
                </div>
              </div>

              {/* Precio */}
              <div className="p-6 bg-gradient-to-r from-[#7D0C00] to-[#a01000] rounded-lg text-white">
                <p className="text-sm opacity-90 mb-1">Precio por día</p>
                <p className="text-3xl">${selectedVehicle.pricePerDay}</p>
              </div>

              {/* Descripción */}
              {selectedVehicle.description && (
                <div>
                  <h4 className="dark:text-white text-gray-900 mb-2">Descripción</h4>
                  <p className="text-muted-foreground dark:text-gray-400">{selectedVehicle.description}</p>
                </div>
              )}

              {/* Características */}
              {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                <div>
                  <h4 className="dark:text-white text-gray-900 mb-3">Características</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#383838] rounded border dark:border-gray-600">
                        <div className="w-2 h-2 rounded-full bg-[#7D0C00]"></div>
                        <span className="text-sm dark:text-gray-300 text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetailsModal} className="dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#4a4a4a]">
              Cerrar
            </Button>
            {selectedVehicle && (
              <Button 
                onClick={() => {
                  handleCloseDetailsModal();
                  handleOpenRentModal(selectedVehicle);
                }}
                style={{ backgroundColor: '#7D0C00' }}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Rentar ahora
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Reasignación */}
      <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="dark:text-white">Reasignar Vehículo</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Asigna este vehículo a un cliente que ya tiene un contrato activo
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {reassignVehicle && (
            <div className="space-y-6">
              {/* Información del vehículo a reasignar */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-[#383838] dark:to-[#383838]/50 p-5 rounded-xl border border-orange-200 dark:border-gray-700">
                <h3 className="flex items-center gap-2 mb-4 dark:text-white">
                  <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold">Nuevo Vehículo</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Vehículo</span>
                    <p className="font-medium text-sm dark:text-gray-200">{reassignVehicle.brand} {reassignVehicle.model}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Matrícula</span>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">{reassignVehicle.licensePlate}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Año</span>
                    <p className="font-medium text-sm dark:text-gray-200">{reassignVehicle.year}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Categoría</span>
                    <p className="font-medium text-sm dark:text-gray-200">{reassignVehicle.category}</p>
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              {/* Selección de contrato */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract" className="text-sm font-medium dark:text-gray-300">
                    Selecciona el contrato activo <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedContractForReassign} onValueChange={(value) => setSelectedContractForReassign(value)}>
                    <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Selecciona un contrato activo" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#383838] dark:border-gray-600">
                      {activeContracts.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground dark:text-gray-400">
                          No hay contratos activos disponibles
                        </div>
                      ) : (
                        activeContracts.map(contract => {
                          const currentVehicle = vehicles.find(v => v.id === contract.vehicleId);
                          return (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.contractNumber} - {contract.customerName} | Actual: {currentVehicle?.brand} {currentVehicle?.model} ({currentVehicle?.licensePlate})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground dark:text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Solo se muestran contratos activos. El cliente recibirá el nuevo vehículo sin costo adicional.
                  </p>
                </div>

                {selectedContractForReassign && (() => {
                  const contract = contracts.find(c => c.id === selectedContractForReassign);
                  const currentVehicle = contract ? vehicles.find(v => v.id === contract.vehicleId) : null;
                  
                  return (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50">
                      <h4 className="flex items-center gap-2 mb-3 font-semibold dark:text-white">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Resumen del Cambio
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-900/50">
                          <span className="text-muted-foreground dark:text-gray-400">Contrato:</span>
                          <span className="font-medium dark:text-gray-200">{contract?.contractNumber}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-900/50">
                          <span className="text-muted-foreground dark:text-gray-400">Cliente:</span>
                          <span className="font-medium dark:text-gray-200">{contract?.customerName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-900/50">
                          <span className="text-muted-foreground dark:text-gray-400">Vehículo actual:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {currentVehicle?.brand} {currentVehicle?.model} ({currentVehicle?.licensePlate})
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground dark:text-gray-400">Nuevo vehículo:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {reassignVehicle.brand} {reassignVehicle.model} ({reassignVehicle.licensePlate})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-900 dark:text-gray-300">
                  El vehículo anterior quedará disponible y el nuevo vehículo se marcará como rentado. El cliente será notificado del cambio. El costo del contrato se mantiene sin cambios.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={handleCloseReassignModal} className="dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#484848]">
              Cancelar
            </Button>
            <Button 
              onClick={handleReassignVehicle} 
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              disabled={!selectedContractForReassign}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirmar Reasignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}