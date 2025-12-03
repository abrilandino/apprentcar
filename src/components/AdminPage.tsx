import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Car, Plus, Edit, Trash2, Users, FileText, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Vehicle, VehicleStatus, Rental } from '../types';
import { toast } from 'sonner@2.0.3';
import { mockUsers } from '../lib/mock-data';

export function AdminPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, rentals, updateRental } = useApp();
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>('all');
  const [vehicleForm, setVehicleForm] = useState({
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
    features: ''
  });

  const handleVehicleChange = (field: string, value: any) => {
    setVehicleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: String(Date.now()),
      ...vehicleForm,
      features: vehicleForm.features.split(',').map(f => f.trim()).filter(f => f)
    };

    addVehicle(newVehicle);
    toast.success('Vehículo añadido correctamente');
    setIsAddingVehicle(false);
    resetForm();
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle) return;

    updateVehicle(editingVehicle.id, {
      ...vehicleForm,
      features: vehicleForm.features.split(',').map(f => f.trim()).filter(f => f)
    });

    toast.success('Vehículo actualizado correctamente');
    setEditingVehicle(null);
    resetForm();
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      deleteVehicle(id);
      toast.success('Vehículo eliminado correctamente');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
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
      features: vehicle.features.join(', ')
    });
  };

  const resetForm = () => {
    setVehicleForm({
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
      features: ''
    });
  };

  const clearFilters = () => {
    setVehicleStatusFilter('all');
    toast.success('Filtros limpiados');
  };

  const clearAllData = () => {
    // Limpiar filtros
    setVehicleStatusFilter('all');
    
    // Cerrar modales si están abiertos
    setIsAddingVehicle(false);
    setEditingVehicle(null);
    
    // Resetear formulario
    resetForm();
    
    toast.success('Página limpiada completamente');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'default';
      case 'pre-rentado':
        return 'secondary';
      case 'rentado':
        return 'destructive';
      case 'en-mantenimiento':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRentalStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-950/50 text-yellow-500 border-yellow-900/50">Pendiente</Badge>;
      case 'activa':
        return <Badge variant="default" className="bg-green-950/50 text-green-500 border-green-900/50">Activa</Badge>;
      case 'completada':
        return <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700">Completada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive" className="bg-red-950/50 text-red-500 border-red-900/50">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate statistics
  const availableVehicles = vehicles.filter(v => v.status === 'disponible').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rentado' || v.status === 'pre-rentado').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'en-mantenimiento').length;
  const activeRentals = rentals.filter(r => r.status === 'activa').length;
  const totalRevenue = rentals
    .filter(r => r.status === 'completada')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const vehicleFormDialog = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editingVehicle ? 'Editar vehículo' : 'Añadir nuevo vehículo'}</DialogTitle>
        <DialogDescription>
          {editingVehicle ? 'Modifica los datos del vehículo' : 'Completa los datos del nuevo vehículo'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input
            value={vehicleForm.brand}
            onChange={(e) => handleVehicleChange('brand', e.target.value)}
            placeholder="Toyota"
          />
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input
            value={vehicleForm.model}
            onChange={(e) => handleVehicleChange('model', e.target.value)}
            placeholder="Corolla"
          />
        </div>

        <div className="space-y-2">
          <Label>Año</Label>
          <Input
            type="number"
            value={vehicleForm.year}
            onChange={(e) => handleVehicleChange('year', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Input
            value={vehicleForm.category}
            onChange={(e) => handleVehicleChange('category', e.target.value)}
            placeholder="Sedán"
          />
        </div>

        <div className="space-y-2">
          <Label>Precio por día ($)</Label>
          <Input
            type="number"
            value={vehicleForm.pricePerDay}
            onChange={(e) => handleVehicleChange('pricePerDay', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={vehicleForm.status} onValueChange={(v) => handleVehicleChange('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="pre-rentado">Pre-rentado</SelectItem>
              <SelectItem value="rentado">Rentado</SelectItem>
              <SelectItem value="en-mantenimiento">En mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Transmisión</Label>
          <Select value={vehicleForm.transmission} onValueChange={(v) => handleVehicleChange('transmission', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Automática">Automática</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Combustible</Label>
          <Input
            value={vehicleForm.fuelType}
            onChange={(e) => handleVehicleChange('fuelType', e.target.value)}
            placeholder="Gasolina"
          />
        </div>

        <div className="space-y-2">
          <Label>Asientos</Label>
          <Input
            type="number"
            value={vehicleForm.seats}
            onChange={(e) => handleVehicleChange('seats', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Kilometraje</Label>
          <Input
            type="number"
            value={vehicleForm.mileage}
            onChange={(e) => handleVehicleChange('mileage', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Matrícula</Label>
          <Input
            value={vehicleForm.licensePlate}
            onChange={(e) => handleVehicleChange('licensePlate', e.target.value)}
            placeholder="ABC-123"
          />
        </div>

        <div className="space-y-2">
          <Label>URL de imagen</Label>
          <Input
            value={vehicleForm.imageUrl}
            onChange={(e) => handleVehicleChange('imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Descripción</Label>
          <Input
            value={vehicleForm.description}
            onChange={(e) => handleVehicleChange('description', e.target.value)}
            placeholder="Vehículo en excelente estado..."
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Características (separadas por comas)</Label>
          <Input
            value={vehicleForm.features}
            onChange={(e) => handleVehicleChange('features', e.target.value)}
            placeholder="GPS, Aire acondicionado, Bluetooth"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => {
          setIsAddingVehicle(false);
          setEditingVehicle(null);
          resetForm();
        }}>
          Cancelar
        </Button>
        <Button onClick={editingVehicle ? handleUpdateVehicle : handleAddVehicle}>
          {editingVehicle ? 'Actualizar' : 'Añadir'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Resumen general del sistema de gestión</p>
          </div>
          <Button 
            variant="outline" 
            onClick={clearAllData}
            className="bg-white hover:bg-gray-50 border-gray-300"
          >
            Limpiar
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vehículos Disponibles</CardTitle>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{availableVehicles}</div>
              <p className="text-xs text-gray-500 mt-1">de {vehicles.length} vehículos totales</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vehículos Rentados</CardTitle>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{rentedVehicles}</div>
              <p className="text-xs text-gray-500 mt-1">actualmente en uso</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rentas Activas</CardTitle>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeRentals}</div>
              <p className="text-xs text-gray-500 mt-1">contratos en curso</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">de rentas completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Car className="w-4 h-4 mr-2" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="rentals" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Vehículos</CardTitle>
                    <CardDescription className="mt-1">
                      {vehicleStatusFilter === 'all' 
                        ? `${vehicles.length} vehículos registrados` 
                        : `${vehicles.filter(v => v.status === vehicleStatusFilter).length} de ${vehicles.length} vehículos`}
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingVehicle || !!editingVehicle} onOpenChange={(open) => {
                    if (!open) {
                      setIsAddingVehicle(false);
                      setEditingVehicle(null);
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsAddingVehicle(true)} className="bg-gray-700 hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir vehículo
                      </Button>
                    </DialogTrigger>
                    {vehicleFormDialog}
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Filtrar por estado</Label>
                    {vehicleStatusFilter !== 'all' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-7 text-xs"
                      >
                        Limpiar filtro
                      </Button>
                    )}
                  </div>
                  <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Estado del vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="pre-rentado">Pre-rentado</SelectItem>
                      <SelectItem value="rentado">Rentado</SelectItem>
                      <SelectItem value="en-mantenimiento">En mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>Año</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio/día</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles
                        .filter(vehicle => vehicleStatusFilter === 'all' || vehicle.status === vehicleStatusFilter)
                        .map((vehicle) => (
                        <TableRow key={vehicle.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{vehicle.year}</TableCell>
                          <TableCell className="text-gray-600">{vehicle.category}</TableCell>
                          <TableCell className="font-semibold text-gray-900">${vehicle.pricePerDay}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(vehicle.status)} className="capitalize">
                              {vehicle.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-gray-600">{vehicle.licensePlate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)} className="hover:bg-neutral-800 hover:text-neutral-300">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)} className="hover:bg-red-950/50 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Gestión de Reservas</CardTitle>
                <CardDescription className="mt-1">{rentals.length} reservas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Nº Registro</TableHead>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fechas</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentals.map((rental) => {
                        const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                        const user = mockUsers.find(u => u.id === rental.userId);

                        return (
                          <TableRow key={rental.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-gray-900">{rental.registrationNumber}</TableCell>
                            <TableCell>
                              <p className="font-medium text-gray-900">{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</p>
                            </TableCell>
                            <TableCell className="text-gray-600">{user?.name || 'N/A'}</TableCell>
                            <TableCell className="text-gray-600">
                              <div className="text-sm">
                                <div>{new Date(rental.startDate).toLocaleDateString('es-ES')}</div>
                                <div className="text-gray-400">hasta</div>
                                <div>{new Date(rental.endDate).toLocaleDateString('es-ES')}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900">${rental.totalPrice.toFixed(2)}</TableCell>
                            <TableCell>{getRentalStatusBadge(rental.status)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Select
                                  value={rental.status}
                                  onValueChange={(v) => {
                                    updateRental(rental.id, { status: v as any });
                                    toast.success('Estado actualizado');
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="activa">Activa</SelectItem>
                                    <SelectItem value="completada">Completada</SelectItem>
                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription className="mt-1">{mockUsers.length} usuarios registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Depósito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell className="text-gray-600">{user.phone}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize bg-neutral-800 text-neutral-300 border-neutral-700">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-gray-600">{user.dni || 'N/A'}</TableCell>
                          <TableCell>
                            {user.depositVerified ? (
                              <Badge className="bg-green-950/50 text-green-500 border-green-900/50">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-950/50 text-yellow-500 border-yellow-900/50">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}