import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart3, Download, TrendingUp, DollarSign, Car, Calendar, Home, Filter, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { mockMaintenance } from '../lib/mock-data';
import { getMaintenanceCostByVehicle } from '../lib/mock-data';
import { toast } from 'sonner@2.0.3';
import { DateRangePicker } from './DateRangePicker';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function ReportsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { vehicles, rentals } = useApp();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingCustomData, setIsAddingCustomData] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Custom data state
  const [customRevenue, setCustomRevenue] = useState('');
  const [customExpense, setCustomExpense] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Filter rentals by date range
  const filteredRentals = dateRange?.from && dateRange?.to 
    ? rentals.filter(r => {
        const rentalDate = new Date(r.startDate);
        return rentalDate >= dateRange.from! && rentalDate <= dateRange.to!;
      })
    : rentals;

  // Filter by category
  const categoryFilteredRentals = selectedCategory === 'all' 
    ? filteredRentals 
    : filteredRentals.filter(r => {
        const vehicle = vehicles.find(v => v.id === r.vehicleId);
        return vehicle?.category === selectedCategory;
      });

  // Revenue data
  const totalRevenue = categoryFilteredRentals.reduce((sum, r) => sum + r.totalPrice, 0);
  const monthlyRevenue = categoryFilteredRentals.reduce((sum, r) => sum + r.basePrice, 0);
  const deposits = categoryFilteredRentals.reduce((sum, r) => sum + r.deposit, 0);

  // Vehicle statistics
  const availableVehicles = vehicles.filter(v => v.status === 'disponible').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rentado').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'en-mantenimiento').length;
  const preRentedVehicles = vehicles.filter(v => v.status === 'pre-rentado').length;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Disponible', value: availableVehicles, color: '#3b82f6' },
    { name: 'Rentado', value: rentedVehicles, color: '#ef4444' },
    { name: 'Pre-rentado', value: preRentedVehicles, color: '#f59e0b' },
    { name: 'Mantenimiento', value: maintenanceVehicles, color: '#6b7280' }
  ];

  // Revenue by category
  const revenueByCategory = vehicles.reduce((acc, vehicle) => {
    const vehicleRentals = categoryFilteredRentals.filter(r => r.vehicleId === vehicle.id);
    const categoryRevenue = vehicleRentals.reduce((sum, r) => sum + r.basePrice, 0);
    
    const existing = acc.find(item => item.category === vehicle.category);
    if (existing) {
      existing.revenue += categoryRevenue;
    } else {
      acc.push({ category: vehicle.category, revenue: categoryRevenue });
    }
    
    return acc;
  }, [] as { category: string; revenue: number }[]);

  // Most rented vehicles
  const vehicleRentalCount = vehicles.map(vehicle => ({
    name: `${vehicle.brand} ${vehicle.model}`,
    rentals: categoryFilteredRentals.filter(r => r.vehicleId === vehicle.id).length,
    revenue: categoryFilteredRentals.filter(r => r.vehicleId === vehicle.id).reduce((sum, r) => sum + r.basePrice, 0)
  })).sort((a, b) => b.rentals - a.rentals).slice(0, 5);

  // Monthly revenue trend (mock data)
  const monthlyTrend = [
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Abr', revenue: 16000 },
    { month: 'May', revenue: 20000 },
    { month: 'Jun', revenue: 22000 },
    { month: 'Jul', revenue: 25000 },
    { month: 'Ago', revenue: 24000 },
    { month: 'Sep', revenue: 21000 },
    { month: 'Oct', revenue: monthlyRevenue }
  ];

  // Maintenance costs
  const maintenanceCosts = vehicles.map(vehicle => ({
    vehicle: `${vehicle.brand} ${vehicle.model}`,
    cost: getMaintenanceCostByVehicle(vehicle.id),
    status: vehicle.status
  })).filter(v => v.cost > 0).sort((a, b) => b.cost - a.cost);

  const totalMaintenanceCost = maintenanceCosts.reduce((sum, v) => sum + v.cost, 0);

  const exportToExcel = () => {
    toast.success('Exportando datos a Excel...');
    // In a real app, this would generate an Excel file
    setTimeout(() => {
      toast.success('Datos exportados correctamente');
    }, 1000);
  };

  const handleAddCustomData = () => {
    if (!customRevenue && !customExpense) {
      toast.error('Por favor ingresa al menos un ingreso o gasto');
      return;
    }
    
    toast.success('Datos personalizados agregados correctamente');
    setCustomRevenue('');
    setCustomExpense('');
    setCustomDescription('');
    setIsAddingCustomData(false);
  };

  const clearFilters = () => {
    // Limpiar filtros
    setDateRange(undefined);
    setSelectedCategory('all');
    
    // Cerrar modales
    setShowExportDialog(false);
    
    // Limpiar formularios de datos personalizados
    setCustomRevenue('');
    setCustomExpense('');
    setCustomDescription('');
    setIsAddingCustomData(false);
    
    toast.success('Página limpiada completamente');
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(vehicles.map(v => v.category)))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <h1 className="dark:text-white">Reportes y Estadísticas</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              onClick={clearFilters} 
              variant="outline"
              size="sm"
              className="dark:bg-[#272727] dark:text-white dark:border-gray-700 dark:hover:bg-[#383838]"
            >
              Limpiar
            </Button>
            {onNavigate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('inicio')}
                className="flex items-center gap-2 dark:bg-[#272727] dark:text-white dark:border-gray-700 dark:hover:bg-[#383838]"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al inicio</span>
                <span className="sm:hidden">Inicio</span>
              </Button>
            )}
            <Button onClick={exportToExcel} size="sm" className="dark:bg-[#7D0C00] dark:hover:bg-[#5A0900]">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar a Excel</span>
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-4 md:mb-6 dark:bg-[#272727] dark:border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Reporte
                </CardTitle>
                <CardDescription className="dark:text-gray-400 text-sm">
                  Personaliza tu reporte con filtros de fecha, categoría y datos personalizados
                </CardDescription>
              </div>
              <Dialog open={isAddingCustomData} onOpenChange={setIsAddingCustomData}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto dark:bg-[#7D0C00] dark:hover:bg-[#5A0900] dark:text-white dark:border-[#7D0C00]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Agregar Datos Personalizados</span>
                    <span className="sm:hidden">Datos Personalizados</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-[#272727] dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Agregar Datos Personalizados</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Ingresa ingresos o gastos adicionales para incluir en el reporte
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="dark:text-white">Descripción</Label>
                      <Input
                        placeholder="Ej: Venta de repuestos, Publicidad, etc."
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="dark:text-white">Ingreso Adicional ($)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customRevenue}
                          onChange={(e) => setCustomRevenue(e.target.value)}
                          className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <Label className="dark:text-white">Gasto Adicional ($)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customExpense}
                          onChange={(e) => setCustomExpense(e.target.value)}
                          className="dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleAddCustomData}
                        className="flex-1 dark:bg-[#7D0C00] dark:hover:bg-[#5A0900]"
                      >
                        Agregar
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsAddingCustomData(false)}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="md:col-span-1">
                <Label className="dark:text-white mb-2 block text-sm">Rango de Fechas</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Todas las fechas"
                  numberOfMonths={1}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="dark:text-white mb-2 block text-sm">Categoría de Vehículo</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="dark:bg-[#383838] dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat === 'all' ? 'Todas las categorías' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  size="sm"
                  className="w-full dark:bg-[#383838] dark:border-gray-600 dark:text-white dark:hover:bg-[#505050]"
                  disabled={!dateRange && selectedCategory === 'all'}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
            {(dateRange?.from || selectedCategory !== 'all') && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm dark:text-blue-300">
                  <strong>Filtros activos:</strong>
                  {dateRange?.from && ` Rango de fechas seleccionado`}
                  {dateRange?.from && selectedCategory !== 'all' && ' • '}
                  {selectedCategory !== 'all' && ` Categoría: ${selectedCategory}`}
                  {' • '}Mostrando {categoryFilteredRentals.length} de {rentals.length} reservas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          <Card className="dark:bg-[#272727] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="dark:text-white">Ingresos totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl dark:text-white">${totalRevenue.toFixed(2)}</div>
              <p className="text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#272727] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="dark:text-white">Vehículos disponibles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl dark:text-white">{availableVehicles}</div>
              <p className="text-muted-foreground">de {vehicles.length} totales</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#272727] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="dark:text-white">Reservas activas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl dark:text-white">{rentals.filter(r => r.status === 'activa').length}</div>
              <p className="text-muted-foreground">en curso</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#272727] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="dark:text-white">Tasa de ocupación</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl dark:text-white">
                {vehicles.length > 0 ? Math.round((rentedVehicles / vehicles.length) * 100) : 0}%
              </div>
              <p className="text-muted-foreground">vehículos rentados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="dark:bg-[#272727] dark:border-gray-700">
            <TabsTrigger value="revenue" className="dark:text-gray-300 dark:data-[state=active]:bg-[#383838] dark:data-[state=active]:text-white">Ingresos</TabsTrigger>
            <TabsTrigger value="vehicles" className="dark:text-gray-300 dark:data-[state=active]:bg-[#383838] dark:data-[state=active]:text-white">Vehículos</TabsTrigger>
            <TabsTrigger value="maintenance" className="dark:text-gray-300 dark:data-[state=active]:bg-[#383838] dark:data-[state=active]:text-white">Mantenimiento</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-[#272727] dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Tendencia de ingresos mensuales</CardTitle>
                  <CardDescription className="dark:text-gray-400">Ingresos de los últimos 10 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Ingresos ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="dark:bg-[#272727] dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Ingresos por categoría</CardTitle>
                  <CardDescription className="dark:text-gray-400">Distribución de ingresos por tipo de vehículo</CardDescription>
                </CardHeader>
                <CardContent className="bg-[rgba(98,84,84,0)]">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Resumen financiero</CardTitle>
                <CardDescription className="dark:text-gray-400">Desglose de ingresos del periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#272727] rounded-lg">
                    <span className="dark:text-gray-300">Ingresos por alquileres</span>
                    <span className="text-2xl dark:text-white">${monthlyRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#272727] rounded-lg">
                    <span className="dark:text-gray-300">Depósitos recibidos</span>
                    <span className="text-2xl dark:text-white">${deposits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#272727] rounded-lg">
                    <span className="dark:text-gray-300">Impuestos recaudados (18%)</span>
                    <span className="text-2xl dark:text-white">${(monthlyRevenue * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-[#383838] rounded-sm border-2 border-neutral-200 dark:border-gray-600">
                    <span className="dark:text-gray-300">Total de ingresos</span>
                    <span className="text-3xl text-neutral-600 dark:text-white">${totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-[#272727] dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Distribución por estado</CardTitle>
                  <CardDescription className="dark:text-gray-400">Estado actual de la flota</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="dark:bg-[#272727] dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Vehículos más rentados</CardTitle>
                  <CardDescription className="dark:text-gray-400">Top 5 vehículos por número de alquileres</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vehicleRentalCount} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rentals" fill="#3b82f6" name="Alquileres" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Estadísticas de la flota</CardTitle>
                <CardDescription className="dark:text-gray-400">Información detallada de vehículos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-[#272727] rounded-sm text-center">
                    <div className="text-3xl text-neutral-600 dark:text-gray-300 mb-2">{availableVehicles}</div>
                    <p className="text-muted-foreground dark:text-gray-400">Disponibles</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-sm text-center">
                    <div className="text-3xl text-red-600 dark:text-red-400 mb-2">{rentedVehicles}</div>
                    <p className="text-muted-foreground dark:text-gray-400">Rentados</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-sm text-center">
                    <div className="text-3xl text-yellow-600 dark:text-yellow-400 mb-2">{preRentedVehicles}</div>
                    <p className="text-muted-foreground dark:text-gray-400">Pre-rentados</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-[#272727] rounded-lg text-center">
                    <div className="text-3xl text-gray-600 dark:text-gray-300 mb-2">{maintenanceVehicles}</div>
                    <p className="text-muted-foreground dark:text-gray-400">Mantenimiento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Costos de mantenimiento</CardTitle>
                <CardDescription className="dark:text-gray-400">Gasto total en mantenimiento: ${totalMaintenanceCost.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {maintenanceCosts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#272727] rounded-lg">
                      <div className="flex-1">
                        <p className="dark:text-gray-300">{item.vehicle}</p>
                        <p className="text-muted-foreground dark:text-gray-400">
                          Estado: {item.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl dark:text-white">${item.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#272727] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Historial de mantenimiento</CardTitle>
                <CardDescription className="dark:text-gray-400">{mockMaintenance.length} servicios registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMaintenance.map((maintenance) => {
                    const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
                    return (
                      <div key={maintenance.id} className="p-4 bg-gray-50 dark:bg-[#272727] rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="dark:text-gray-300">{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo desconocido'}</p>
                            <p className="text-muted-foreground dark:text-gray-400">{maintenance.type}</p>
                          </div>
                          <span className="text-xl dark:text-white">${maintenance.cost}</span>
                        </div>
                        <p className="text-muted-foreground dark:text-gray-400 mb-2">{maintenance.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground dark:text-gray-400">
                            {new Date(maintenance.date).toLocaleDateString('es-ES')}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            maintenance.status === 'completado' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            maintenance.status === 'en-progreso' ? 'bg-neutral-100 dark:bg-[#383838] text-neutral-700 dark:text-gray-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {maintenance.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}