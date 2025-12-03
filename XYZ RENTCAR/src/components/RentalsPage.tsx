import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, Search, Calendar as CalendarIcon, Eye, Filter, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Rental } from '../types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';

export function RentalsPage() {
  const { rentals, vehicles, users, addRental } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  
  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    pickupLocation: '',
    returnLocation: '',
    deposit: 0
  });

  // Filter clients (empleado and admin are staff, not clients)
  const clients = users;

  const availableVehicles = vehicles.filter(v => v.status === 'disponible');

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      const vehicle = vehicles.find(v => v.id === rental.vehicleId);
      const user = users.find(u => u.id === rental.userId);
      
      const matchesSearch = 
        rental.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle && `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [rentals, searchQuery, statusFilter, vehicles, users]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendiente': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      'activa': { label: 'Activa', className: 'bg-green-100 text-green-800' },
      'completada': { label: 'Finalizada', className: 'bg-gray-100 text-gray-800' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleOpenModal = (rental?: Rental) => {
    if (rental) {
      setSelectedRental(rental);
    } else {
      setSelectedRental(null);
      setFormData({
        userId: '',
        vehicleId: '',
        startDate: undefined,
        endDate: undefined,
        pickupLocation: '',
        returnLocation: '',
        deposit: 500
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRental(null);
  };

  const calculateTotal = () => {
    if (!formData.vehicleId || !formData.startDate || !formData.endDate) {
      return 0;
    }
    
    const vehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!vehicle) return 0;
    
    const days = differenceInDays(formData.endDate, formData.startDate);
    return days * vehicle.pricePerDay;
  };

  const handleSave = () => {
    if (!formData.userId || !formData.vehicleId || !formData.startDate || !formData.endDate) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.endDate <= formData.startDate) {
      toast.error('La fecha de devolución debe ser posterior a la fecha de inicio');
      return;
    }

    const totalDays = differenceInDays(formData.endDate, formData.startDate);
    const vehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!vehicle) return;

    const basePrice = totalDays * vehicle.pricePerDay;

    const newRental: Omit<Rental, 'id'> = {
      registrationNumber: `RNT-${new Date().getFullYear()}-${String(rentals.length + 1).padStart(4, '0')}`,
      reservationType: 'reservado',
      vehicleId: formData.vehicleId,
      userId: formData.userId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays,
      basePrice,
      initialPayment: basePrice * 0.3,
      deposit: formData.deposit,
      damageCharges: 0,
      totalPrice: basePrice + formData.deposit,
      status: 'pendiente',
      contractSigned: false,
      pickupLocation: formData.pickupLocation || 'Oficina principal',
      returnLocation: formData.returnLocation || 'Oficina principal',
      createdAt: new Date()
    };

    addRental(newRental);
    toast.success('Renta creada exitosamente');
    handleCloseModal();
  };

  const totalDays = formData.startDate && formData.endDate 
    ? differenceInDays(formData.endDate, formData.startDate) 
    : 0;
  const baseTotal = calculateTotal();
  const grandTotal = baseTotal + (formData.deposit || 0);

  const activeFiltersCount = statusFilter !== 'all' ? 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727]">
      <div className="bg-white dark:bg-[#272727] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 md:mb-6">
            <h1 className="dark:text-white">Gestión de Rentas</h1>
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Renta
            </Button>
          </div>

          <div className="mb-3 md:mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por ID, vehículo o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden relative dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7D0C00] text-white rounded-full text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[50vh] dark:bg-[#272727] dark:border-gray-700">
                <SheetHeader>
                  <SheetTitle className="dark:text-white">Filtros de Búsqueda</SheetTitle>
                  <SheetDescription className="dark:text-gray-400">
                    Filtra las rentas por estado
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label className="dark:text-white">Estado de la renta</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full mt-2 dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="completada">Finalizada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                      onClick={() => setStatusFilter('all')}
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

            {/* Desktop Filter */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="completada">Finalizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  onClick={() => setStatusFilter('all')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Mostrando {filteredRentals.length} de {rentals.length} rentas
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <Card className="dark:bg-[#272727] dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Listado de Rentas</CardTitle>
            <CardDescription className="dark:text-gray-400">Administra todas las rentas de vehículos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Renta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron rentas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRentals.map((rental) => {
                      const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                      const user = users.find(u => u.id === rental.userId);
                      
                      return (
                        <TableRow key={rental.id}>
                          <TableCell className="font-mono">{rental.registrationNumber}</TableCell>
                          <TableCell>{user?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}
                          </TableCell>
                          <TableCell>{format(new Date(rental.startDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(new Date(rental.endDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>${rental.totalPrice.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(rental.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRental(rental);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Rental Details Modal */}
        {selectedRental && !isModalOpen && (
          <Dialog open={!!selectedRental} onOpenChange={() => setSelectedRental(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles de la Renta</DialogTitle>
                <DialogDescription>
                  {selectedRental.registrationNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p>{users.find(u => u.id === selectedRental.userId)?.name}</p>
                  </div>
                  <div>
                    <Label>Vehículo</Label>
                    <p>
                      {vehicles.find(v => v.id === selectedRental.vehicleId)
                        ? `${vehicles.find(v => v.id === selectedRental.vehicleId)?.brand} ${vehicles.find(v => v.id === selectedRental.vehicleId)?.model}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label>Fecha Inicio</Label>
                    <p>{format(new Date(selectedRental.startDate), 'PPP', { locale: es })}</p>
                  </div>
                  <div>
                    <Label>Fecha Fin</Label>
                    <p>{format(new Date(selectedRental.endDate), 'PPP', { locale: es })}</p>
                  </div>
                  <div>
                    <Label>Días Totales</Label>
                    <p>{selectedRental.totalDays} días</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRental.status)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="mb-3">Resumen de Costos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio base</span>
                      <span>${selectedRental.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depósito</span>
                      <span>${selectedRental.deposit.toLocaleString()}</span>
                    </div>
                    {selectedRental.damageCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cargos por daños</span>
                        <span className="text-red-600">${selectedRental.damageCharges.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span>Total</span>
                      <span className="text-xl">${selectedRental.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Lugar de recogida</Label>
                      <p className="text-sm text-muted-foreground">{selectedRental.pickupLocation}</p>
                    </div>
                    <div>
                      <Label>Lugar de devolución</Label>
                      <p className="text-sm text-muted-foreground">{selectedRental.returnLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRental(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* New Rental Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Renta</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva renta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Cliente *</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehículo Disponible *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - ${vehicle.pricePerDay}/día
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      disabled={(date) => !formData.startDate || date <= formData.startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Lugar de Recogida</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  placeholder="Oficina principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnLocation">Lugar de Devolución</Label>
                <Input
                  id="returnLocation"
                  value={formData.returnLocation}
                  onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                  placeholder="Oficina principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Depósito ($)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            {totalDays > 0 && formData.vehicleId && (
              <div className="bg-neutral-50 p-4 rounded-sm space-y-2">
                <h3 className="mb-2">Cálculo de Total</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Días totales:</span>
                    <span>{totalDays} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio por día:</span>
                    <span>${vehicles.find(v => v.id === formData.vehicleId)?.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${baseTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depósito:</span>
                    <span>${formData.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total:</span>
                    <span className="text-xl">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Crear Renta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
