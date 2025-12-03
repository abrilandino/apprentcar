import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Star, Users, Settings, Fuel, AlertTriangle, CheckCircle2, Info, Filter, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function RentVehiclePage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { vehicles, addRental, checkVehicleAvailability, addNotification } = useApp();
  const { user } = useAuth();

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCarTypes, setSelectedCarTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modal states
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateRangeError, setDateRangeError] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [willPayInitial, setWillPayInitial] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState<{
    available: boolean;
    preReservesCount: number;
  } | null>(null);

  const carTypes = ['Sedan', 'SUV', 'Sports', 'Electric', 'Luxury'];

  // Map vehicle categories to display car types
  const mapCategoryToType = (category: string): string => {
    if (category.toLowerCase().includes('sedan')) return 'Sedan';
    if (category.toLowerCase().includes('suv')) return 'SUV';
    if (category.toLowerCase().includes('deportivo') || category.toLowerCase().includes('sport')) return 'Sports';
    if (category.toLowerCase().includes('eléctrico') || category.toLowerCase().includes('electric')) return 'Electric';
    if (category.toLowerCase().includes('lujo') || category.toLowerCase().includes('luxury')) return 'Luxury';
    return 'Sedan'; // Default
  };

  const mapSeatsToPassengers = (seats: number): string => {
    if (seats <= 2) return '2 Seats';
    if (seats <= 4) return '4 Seats';
    return '5+ Seats';
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Price filter
      if (vehicle.pricePerDay < priceRange[0] || vehicle.pricePerDay > priceRange[1]) {
        return false;
      }

      // Car type filter
      const vehicleType = mapCategoryToType(vehicle.category);
      if (selectedCarTypes.length > 0 && !selectedCarTypes.includes(vehicleType)) {
        return false;
      }

      // Transmission filter
      const transmission = vehicle.transmission === 'Automática' ? 'Automatic' : 'Manual';
      if (selectedTransmissions.length > 0 && !selectedTransmissions.includes(transmission)) {
        return false;
      }

      // Passengers filter
      const passengerCategory = mapSeatsToPassengers(vehicle.seats);
      if (selectedPassengers.length > 0 && !selectedPassengers.includes(passengerCategory)) {
        return false;
      }

      return true;
    });
  }, [vehicles, priceRange, selectedCarTypes, selectedTransmissions, selectedPassengers]);

  const toggleCarType = (type: string) => {
    setSelectedCarTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTransmission = (type: string) => {
    setSelectedTransmissions(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const togglePassengers = (type: string) => {
    setSelectedPassengers(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleOpenRentalModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDateRange(undefined);
    setDateRangeError('');
    setPickupLocation('');
    setReturnLocation('');
    setInitialPayment(0);
    setWillPayInitial(false);
    setAvailabilityInfo(null);
    setIsRentalModalOpen(true);
  };

  const handleCheckAvailability = () => {
    if (!selectedVehicle || !dateRange?.from || !dateRange?.to) {
      toast.error('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    if (dateRange.from >= dateRange.to) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const availability = checkVehicleAvailability(selectedVehicle.id, dateRange.from, dateRange.to);
    setAvailabilityInfo(availability);
  };

  const generateReservationCode = (type: 'reservado' | 'pre-reservado') => {
    const prefix = type === 'reservado' ? 'RNT' : 'PRE';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleCreateRental = () => {
    if (!selectedVehicle || !user) {
      toast.error('Error inesperado. Por favor intenta de nuevo.');
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Selecciona las fechas de inicio y fin');
      return;
    }

    if (dateRange.from >= dateRange.to) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (!pickupLocation || !returnLocation) {
      toast.error('Por favor completa las ubicaciones de recogida y devolución');
      return;
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = selectedVehicle.pricePerDay * totalDays;
    const reservationType = willPayInitial && initialPayment > 0 ? 'reservado' : 'pre-reservado';
    const registrationNumber = generateReservationCode(reservationType);

    const availability = checkVehicleAvailability(selectedVehicle.id, startDate, endDate);

    if (reservationType === 'pre-reservado' && availability.preReservesCount >= 3) {
      toast.error('Este vehículo ya tiene el máximo de pre-reservas (3). Por favor, elige otro vehículo o paga el monto inicial.');
      return;
    }

    const rentalData = {
      registrationNumber,
      reservationType,
      vehicleId: selectedVehicle.id,
      userId: user.id,
      startDate,
      endDate,
      totalDays,
      basePrice,
      initialPayment: willPayInitial ? initialPayment : 0,
      deposit: 0,
      damageCharges: 0,
      totalPrice: basePrice,
      status: 'pendiente' as const,
      contractSigned: false,
      pickupLocation,
      returnLocation,
      createdAt: new Date(),
      preReservePosition: reservationType === 'pre-reservado' ? availability.preReservesCount + 1 : undefined
    };

    addRental(rentalData);

    addNotification({
      id: String(Date.now()),
      userId: user.id,
      title: reservationType === 'reservado' ? 'Reserva confirmada' : 'Pre-reserva creada',
      message: reservationType === 'reservado'
        ? `Tu reserva ${registrationNumber} ha sido confirmada. Ve a "Reservas y Contratos" para generar el contrato preliminar.`
        : `Tu pre-reserva ${registrationNumber} ha sido creada. Posición: ${availability.preReservesCount + 1}/3. Ve a "Reservas y Contratos" para generar el contrato preliminar.`,
      type: reservationType === 'reservado' ? 'success' : 'info',
      read: false,
      createdAt: new Date()
    });

    toast.success(
      reservationType === 'reservado'
        ? `¡Reserva creada exitosamente! Código: ${registrationNumber}`
        : `¡Pre-reserva creada! Código: ${registrationNumber}. Posición: ${availability.preReservesCount + 1}/3`,
      {
        description: 'Ve a "Reservas y Contratos" para generar el contrato',
        duration: 5000
      }
    );

    setIsRentalModalOpen(false);
  };

  const isFeatured = (vehicle: Vehicle) => {
    return vehicle.rating && vehicle.rating >= 4.5;
  };

  const resetFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCarTypes([]);
    setSelectedTransmissions([]);
    setSelectedPassengers([]);
    toast.success('Filtros reiniciados');
  };

  const activeFiltersCount = [
    priceRange[0] !== 0 || priceRange[1] !== 500,
    selectedCarTypes.length > 0,
    selectedTransmissions.length > 0,
    selectedPassengers.length > 0
  ].filter(Boolean).length;

  // Filters Component
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-gray-900 dark:text-white">Rango de Precio</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={500}
          step={10}
          className="mt-2 [&_[data-slot=slider-range]]:bg-[#7D0C00]"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>${priceRange[0]}/día</span>
          <span>${priceRange[1]}/día</span>
        </div>
      </div>

      {/* Car Type */}
      <div className="space-y-3">
        <Label className="text-gray-900 dark:text-white">Tipo de Vehículo</Label>
        <div className="space-y-2">
          {carTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`car-type-${type}`}
                checked={selectedCarTypes.includes(type)}
                onCheckedChange={() => toggleCarType(type)}
                className={selectedCarTypes.includes(type) 
                  ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                  : ''}
              />
              <label
                htmlFor={`car-type-${type}`}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <Label className="text-gray-900 dark:text-white">Transmisión</Label>
        <div className="space-y-2">
          {[{ id: 'Automatic', label: 'Automático' }, { id: 'Manual', label: 'Manual' }].map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`transmission-${type.id}`}
                checked={selectedTransmissions.includes(type.id)}
                onCheckedChange={() => toggleTransmission(type.id)}
                className={selectedTransmissions.includes(type.id) 
                  ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                  : ''}
              />
              <label
                htmlFor={`transmission-${type.id}`}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Passengers */}
      <div className="space-y-3">
        <Label className="text-gray-900 dark:text-white">Pasajeros</Label>
        <div className="space-y-2">
          {[{ id: '2 Seats', label: '2 Asientos' }, { id: '4 Seats', label: '4 Asientos' }, { id: '5+ Seats', label: '5+ Asientos' }].map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`passengers-${type.id}`}
                checked={selectedPassengers.includes(type.id)}
                onCheckedChange={() => togglePassengers(type.id)}
                className={selectedPassengers.includes(type.id) 
                  ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                  : ''}
              />
              <label
                htmlFor={`passengers-${type.id}`}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full dark:bg-[#383838] dark:border-gray-600 dark:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Reiniciar Filtros
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Header with Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-gray-900 dark:text-white mb-2">
            Vehículos Disponibles
            <span className="text-base md:text-xl text-gray-600 dark:text-gray-400 ml-3">({filteredVehicles.length})</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Elige de nuestra selección premium de vehículos</p>
        </div>

        {/* Filters Section - Desktop: Horizontal, Mobile: Button with Sheet */}
        <div className="mb-6">
          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="md:hidden w-full relative dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7D0C00] text-white rounded-full text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] dark:bg-[#272727] dark:border-gray-700 overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="dark:text-white">Filtros</SheetTitle>
                <SheetDescription className="dark:text-gray-400">
                  Personaliza tu búsqueda de vehículos
                </SheetDescription>
              </SheetHeader>
              <FiltersContent />
            </SheetContent>
          </Sheet>

          {/* Desktop Filters - Horizontal Cards */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Filter Card */}
            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardContent className="p-4">
                <Label className="text-gray-900 dark:text-white mb-3 block">Precio</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={500}
                  step={10}
                  className="mb-3 [&_[data-slot=slider-range]]:bg-[#7D0C00]"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </CardContent>
            </Card>

            {/* Type Filter Card */}
            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardContent className="p-4">
                <Label className="text-gray-900 dark:text-white mb-3 block">Tipo</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {carTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`desktop-car-type-${type}`}
                        checked={selectedCarTypes.includes(type)}
                        onCheckedChange={() => toggleCarType(type)}
                        className={selectedCarTypes.includes(type) 
                          ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                          : ''}
                      />
                      <label
                        htmlFor={`desktop-car-type-${type}`}
                        className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transmission Filter Card */}
            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardContent className="p-4">
                <Label className="text-gray-900 dark:text-white mb-3 block">Transmisión</Label>
                <div className="space-y-2">
                  {[{ id: 'Automatic', label: 'Automático' }, { id: 'Manual', label: 'Manual' }].map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`desktop-transmission-${type.id}`}
                        checked={selectedTransmissions.includes(type.id)}
                        onCheckedChange={() => toggleTransmission(type.id)}
                        className={selectedTransmissions.includes(type.id) 
                          ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                          : ''}
                      />
                      <label
                        htmlFor={`desktop-transmission-${type.id}`}
                        className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Passengers Filter Card */}
            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardContent className="p-4">
                <Label className="text-gray-900 dark:text-white mb-3 block">Pasajeros</Label>
                <div className="space-y-2">
                  {[{ id: '2 Seats', label: '2 Asientos' }, { id: '4 Seats', label: '4 Asientos' }, { id: '5+ Seats', label: '5+ Asientos' }].map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`desktop-passengers-${type.id}`}
                        checked={selectedPassengers.includes(type.id)}
                        onCheckedChange={() => togglePassengers(type.id)}
                        className={selectedPassengers.includes(type.id) 
                          ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                          : ''}
                      />
                      <label
                        htmlFor={`desktop-passengers-${type.id}`}
                        className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reset Filters Button - Desktop */}
          {activeFiltersCount > 0 && (
            <div className="hidden md:flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar filtros ({activeFiltersCount})
              </Button>
            </div>
          )}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredVehicles.map(vehicle => (
            <Card
              key={vehicle.id}
              className="bg-white dark:bg-[#272727] border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#7D0C00] transition-all cursor-pointer group"
            >
              <div className="relative aspect-video overflow-hidden">
                <ImageWithFallback
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isFeatured(vehicle) && (
                  <Badge
                    className="absolute top-3 right-3 text-white border-0"
                    style={{ backgroundColor: '#7D0C00' }}
                  >
                    Destacado
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 md:p-5 space-y-3 md:space-y-4">
                {/* Title and Category */}
                <div>
                  <h3 className="text-base md:text-lg text-gray-900 dark:text-white mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{vehicle.category}</p>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3 md:gap-4 text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{vehicle.seats}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{vehicle.transmission === 'Automática' ? 'Auto' : 'Manual'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{vehicle.fuelType}</span>
                  </div>
                </div>

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl md:text-2xl text-[#7D0C00]">${vehicle.pricePerDay}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">/día</span>
                  </div>
                  {vehicle.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm md:text-base text-gray-900 dark:text-white">{vehicle.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Book Now Button */}
                <Button
                  className="w-full text-white border-0 hover:opacity-90"
                  style={{ backgroundColor: '#7D0C00' }}
                  onClick={() => handleOpenRentalModal(vehicle)}
                >
                  Reservar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">No hay vehículos que coincidan con tus filtros</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-2">Intenta ajustar tus criterios de filtro</p>
          </div>
        )}
      </div>

      {/* Rental Modal */}
      <Dialog open={isRentalModalOpen} onOpenChange={setIsRentalModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#272727] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Reservar {selectedVehicle?.brand} {selectedVehicle?.model}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Completa los detalles para crear tu reserva
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-lg">
                <div className="w-32 h-24 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={selectedVehicle.imageUrl}
                    alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedVehicle.year} • {selectedVehicle.category}</p>
                  <div className="mt-2">
                    <span className="text-2xl text-[#7D0C00]">${selectedVehicle.pricePerDay}</span>
                    <span className="text-gray-600 dark:text-gray-400"> / día</span>
                  </div>
                </div>
              </div>

              {/* Date Range Selection */}
              <DateRangePicker
                label="Periodo de Alquiler"
                value={dateRange}
                onChange={setDateRange}
                placeholder="Selecciona fechas de inicio y fin"
                error={dateRangeError}
                required
                tooltip="Selecciona fechas de recogida y devolución"
                numberOfMonths={1}
              />

              {/* Summary */}
              {dateRange?.from && dateRange?.to && dateRange.to > dateRange.from && !dateRangeError && (
                <Alert className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1E1E1E]">
                  <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <AlertDescription className="text-gray-900 dark:text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span>
                        Duración: {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} día(s)
                      </span>
                      <span>
                        Total Estimado: ${(selectedVehicle.pricePerDay * Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Check Availability */}
              {dateRange?.from && dateRange?.to && dateRange.to > dateRange.from && !dateRangeError && (
                <Button
                  onClick={handleCheckAvailability}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#383838]"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Verificar Disponibilidad
                </Button>
              )}

              {/* Availability Info */}
              {availabilityInfo && (
                <Alert variant={availabilityInfo.available ? "default" : "destructive"} className="bg-gray-50 dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-700">
                  {availabilityInfo.available ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle className="text-gray-900 dark:text-white">
                    {availabilityInfo.available ? 'Vehículo Disponible' : 'Conflicto de Fechas'}
                  </AlertTitle>
                  <AlertDescription className="text-gray-700 dark:text-gray-300">
                    {availabilityInfo.available
                      ? `Este vehículo está disponible. Pre-reservas actuales: ${availabilityInfo.preReservesCount}`
                      : `Este vehículo tiene una reserva confirmada para estas fechas. Pre-reservas: ${availabilityInfo.preReservesCount}/3`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Locations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Ubicación de Recogida</Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger className="bg-gray-50 dark:bg-[#1E1E1E] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#272727] border-gray-200 dark:border-gray-700">
                      <SelectItem value="Oficina Centro">Oficina Centro</SelectItem>
                      <SelectItem value="Oficina Aeropuerto">Oficina Aeropuerto</SelectItem>
                      <SelectItem value="Oficina Norte">Oficina Norte</SelectItem>
                      <SelectItem value="Oficina Sur">Oficina Sur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Ubicación de Devolución</Label>
                  <Select value={returnLocation} onValueChange={setReturnLocation}>
                    <SelectTrigger className="bg-gray-50 dark:bg-[#1E1E1E] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#272727] border-gray-200 dark:border-gray-700">
                      <SelectItem value="Oficina Centro">Oficina Centro</SelectItem>
                      <SelectItem value="Oficina Aeropuerto">Oficina Aeropuerto</SelectItem>
                      <SelectItem value="Oficina Norte">Oficina Norte</SelectItem>
                      <SelectItem value="Oficina Sur">Oficina Sur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Initial Payment */}
              <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1E1E1E]">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="initial-payment"
                    checked={willPayInitial}
                    onCheckedChange={(checked) => setWillPayInitial(checked as boolean)}
                    className={willPayInitial 
                      ? 'data-[state=checked]:bg-[#7D0C00] data-[state=checked]:border-[#7D0C00]' 
                      : ''}
                  />
                  <label htmlFor="initial-payment" className="text-sm text-gray-900 dark:text-white cursor-pointer">
                    Pagar monto inicial (Opcional)
                  </label>
                </div>
                {willPayInitial && (
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Monto de Pago Inicial</Label>
                    <Input
                      type="number"
                      min="0"
                      value={initialPayment}
                      onChange={(e) => setInitialPayment(Number(e.target.value))}
                      className="bg-white dark:bg-[#272727] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="Ingresa el monto"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRentalModalOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#383838]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRental}
              className="text-white border-0"
              style={{ backgroundColor: '#7D0C00' }}
            >
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
