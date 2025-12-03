import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Search, Car, User, DollarSign, AlertCircle, FileSignature, CheckCircle2, Send, ClipboardList, AlertTriangle, CheckSquare, CalendarDays, MapPin, Clock, Home, Calendar, Edit3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Rental, Contract } from '../types';
import { format, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';

export function ReservationsAndContractsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { rentals, vehicles, users, updateRental, addNotification, addContract, updateContract, contracts, updateVehicle } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreReservation, setSelectedPreReservation] = useState<Rental | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerDNI, setCustomerDNI] = useState('');
  const [customerLicense, setCustomerLicense] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
  // Estados para las firmas
  const [companySignature, setCompanySignature] = useState('');
  const [clientSignature, setClientSignature] = useState('');
  
  // Estados para finalizar contrato
  const [isFinishContractModalOpen, setIsFinishContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [hasDamages, setHasDamages] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageCharges, setDamageCharges] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');

  // Estados para extender contrato
  const [isExtendContractModalOpen, setIsExtendContractModalOpen] = useState(false);
  const [extendingContract, setExtendingContract] = useState<Contract | null>(null);
  const [additionalDays, setAdditionalDays] = useState<number>(1);
  const [extensionNotes, setExtensionNotes] = useState('');

  const preReservations = useMemo(() => {
    return rentals.filter(r => r.reservationType === 'pre-reservado' && r.status !== 'cancelada');
  }, [rentals]);

  const confirmedReservations = useMemo(() => {
    return rentals.filter(r => 
      r.reservationType === 'reservado' && 
      r.status === 'pendiente' &&
      !r.contractSigned
    );
  }, [rentals]);

  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.status === 'activo');
  }, [contracts]);

  const filteredPreReservations = useMemo(() => {
    return preReservations.filter(rental => {
      const vehicle = vehicles.find(v => v.id === rental.vehicleId);
      const customer = users.find(u => u.id === rental.userId);
      
      const matchesSearch = 
        rental.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [preReservations, searchQuery, vehicles, users]);

  const filteredConfirmedReservations = useMemo(() => {
    return confirmedReservations.filter(rental => {
      const vehicle = vehicles.find(v => v.id === rental.vehicleId);
      const customer = users.find(u => u.id === rental.userId);
      
      const matchesSearch = 
        rental.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [confirmedReservations, searchQuery, vehicles, users]);

  const handleOpenCancelConfirm = (rental: Rental) => {
    setSelectedPreReservation(rental);
    setIsCancelConfirmOpen(true);
  };

  const handleGenerateContractFromPreReservation = (rental: Rental) => {
    setSelectedPreReservation(rental);

    // Prellenar información del cliente desde el rental o desde la base de usuarios
    if (rental.customerName) {
      // Si la información está en el rental (nuevo formato), usar esa
      setCustomerName(rental.customerName);
      setCustomerDNI(rental.customerDNI || '');
      setCustomerLicense(rental.customerLicense || '');
    } else {
      // Si no, buscar en la base de usuarios (formato antiguo)
      const customer = users.find(u => u.id === rental.userId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerDNI(customer.dni || '');
        setCustomerLicense(customer.licenseNumber || '');
      }
    }

    // Depósito sugerido (10% del total)
    setDepositAmount(Math.round(rental.totalPrice * 0.1));
    setNotes('');
    
    setIsCreateContractModalOpen(true);
  };

  const handleGenerateContractFromReservation = (rental: Rental) => {
    setSelectedPreReservation(rental);

    // Prellenar información del cliente desde el rental o desde la base de usuarios
    if (rental.customerName) {
      // Si la información está en el rental (nuevo formato), usar esa
      setCustomerName(rental.customerName);
      setCustomerDNI(rental.customerDNI || '');
      setCustomerLicense(rental.customerLicense || '');
    } else {
      // Si no, buscar en la base de usuarios (formato antiguo)
      const customer = users.find(u => u.id === rental.userId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerDNI(customer.dni || '');
        setCustomerLicense(customer.licenseNumber || '');
      }
    }

    // Depósito sugerido (10% del total)
    setDepositAmount(Math.round(rental.totalPrice * 0.1));
    setNotes('');
    
    // Limpiar firmas
    setCompanySignature('');
    setClientSignature('');
    
    setIsCreateContractModalOpen(true);
  };

  const handleConfirmCancelPreReservation = () => {
    if (!selectedPreReservation) return;

    updateRental(selectedPreReservation.id, {
      status: 'cancelada'
    });

    addNotification({
      id: String(Date.now()),
      userId: selectedPreReservation.userId,
      title: 'Pre-reserva cancelada',
      message: `Tu pre-reserva ${selectedPreReservation.registrationNumber} ha sido cancelada.`,
      type: 'warning',
      read: false,
      createdAt: new Date()
    });

    toast.success('Pre-reserva cancelada exitosamente');
    setIsCancelConfirmOpen(false);
    setSelectedPreReservation(null);
  };

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CTR-${year}-${random}`;
  };

  const handleCreateContract = () => {
    if (!selectedPreReservation || !customerName || !customerDNI || !customerLicense) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!companySignature || !clientSignature) {
      toast.error('Por favor completa ambas firmas (Empresa y Cliente)');
      return;
    }

    const contractNumber = generateContractNumber();

    const notesWithSignatures = `${notes}\n\n--- FIRMAS DIGITALES ---\nFirma de la Empresa: ${companySignature}\nFirma del Cliente: ${clientSignature}\nFecha y Hora: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`;

    const newContract = addContract({
      contractNumber,
      rentalId: selectedPreReservation.id,
      vehicleId: selectedPreReservation.vehicleId,
      userId: selectedPreReservation.userId,
      customerName,
      customerDNI,
      customerLicense,
      startDate: selectedPreReservation.startDate,
      endDate: selectedPreReservation.endDate,
      totalAmount: selectedPreReservation.totalPrice,
      depositAmount,
      status: 'activo',
      emailSent: false,
      createdAt: new Date(),
      notes: notesWithSignatures
    });

    // Actualizar la renta para marcar que tiene contrato y cambiar a reservado si era pre-reserva
    updateRental(selectedPreReservation.id, {
      contractSigned: true,
      status: 'activa',
      reservationType: 'reservado',
      contractUrl: `https://storage.xyz.com/contracts/${contractNumber}.pdf` // URL simulada
    });

    // Enviar notificación
    addNotification({
      id: String(Date.now()),
      userId: selectedPreReservation.userId,
      title: 'Contrato preliminar generado',
      message: `Se ha generado el contrato preliminar ${contractNumber} para tu reserva ${selectedPreReservation.registrationNumber}. El pago se realizará al devolver el vehículo.`,
      type: 'success',
      read: false,
      createdAt: new Date()
    });

    toast.success(`Contrato preliminar ${contractNumber} generado exitosamente. Se enviará por correo al cliente.`);
    setIsCreateContractModalOpen(false);
    setSelectedPreReservation(null);
    setCustomerName('');
    setCustomerDNI('');
    setCustomerLicense('');
    setDepositAmount(0);
    setNotes('');
    setCompanySignature('');
    setClientSignature('');
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getCustomerInfo = (userId: string, rental?: Rental) => {
    // Si el rental tiene información del cliente, usarla directamente
    if (rental?.customerName) {
      return {
        id: userId,
        name: rental.customerName,
        email: rental.customerEmail,
        phone: rental.customerPhone,
        dni: rental.customerDNI,
        licenseNumber: rental.customerLicense
      };
    }
    // Si no, buscar en la base de usuarios
    return users.find(u => u.id === userId);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      'pendiente': { variant: 'secondary', className: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
      'activa': { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
      'completada': { variant: 'outline', className: 'bg-gray-100 text-gray-700' },
      'cancelada': { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-200' }
    };
    const { variant, className } = config[status] || { variant: 'default', className: '' };
    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  const handleOpenFinishContractModal = (contract: Contract) => {
    setSelectedContract(contract);
    setHasDamages(false);
    setDamageDescription('');
    setDamageCharges(0);
    setPaymentMethod('efectivo');
    setIsFinishContractModalOpen(true);
  };

  const handleFinishContract = () => {
    if (!selectedContract) return;

    const totalToPay = selectedContract.totalAmount - selectedContract.depositAmount + damageCharges;

    // Actualizar el contrato
    updateContract(selectedContract.id, {
      status: 'completado',
      notes: hasDamages ? `${selectedContract.notes || ''}\n\nDaños reportados: ${damageDescription}\nCargos adicionales: $${damageCharges.toFixed(2)}` : selectedContract.notes
    });

    // Actualizar la renta
    updateRental(selectedContract.rentalId, {
      status: 'completada',
      damageCharges: damageCharges
    });

    // Actualizar el estado del vehículo a disponible
    updateVehicle(selectedContract.vehicleId, {
      status: 'disponible'
    });

    // Enviar notificación
    addNotification({
      id: String(Date.now()),
      userId: selectedContract.userId,
      title: 'Contrato finalizado',
      message: `El contrato ${selectedContract.contractNumber} ha sido finalizado. Monto total pagado: $${totalToPay.toFixed(2)}.`,
      type: 'success',
      read: false,
      createdAt: new Date()
    });

    toast.success(`Contrato finalizado. Pago total procesado: $${totalToPay.toFixed(2)}`);
    setIsFinishContractModalOpen(false);
    setSelectedContract(null);
  };

  const handleOpenExtendContractModal = (contract: Contract) => {
    setExtendingContract(contract);
    setAdditionalDays(1);
    setExtensionNotes('');
    setIsExtendContractModalOpen(true);
  };

  const handleExtendContract = () => {
    if (!extendingContract || additionalDays < 1) {
      toast.error('Por favor ingresa al menos 1 día adicional');
      return;
    }

    const vehicle = getVehicleInfo(extendingContract.vehicleId);
    if (!vehicle) {
      toast.error('No se encontró información del vehículo');
      return;
    }

    const newEndDate = addDays(new Date(extendingContract.endDate), additionalDays);
    const additionalCost = vehicle.pricePerDay * additionalDays;
    const newTotalAmount = extendingContract.totalAmount + additionalCost;

    // Actualizar el contrato
    updateContract(extendingContract.id, {
      endDate: newEndDate,
      totalAmount: newTotalAmount,
      notes: `${extendingContract.notes || ''}\n\nExtensión: +${additionalDays} día(s) hasta ${format(newEndDate, 'dd/MM/yyyy', { locale: es })} - Costo adicional: $${additionalCost.toFixed(2)}${extensionNotes ? `\nNotas: ${extensionNotes}` : ''}`
    });

    // Actualizar la renta asociada
    const rental = rentals.find(r => r.id === extendingContract.rentalId);
    if (rental) {
      updateRental(rental.id, {
        endDate: newEndDate,
        totalDays: rental.totalDays + additionalDays,
        totalPrice: newTotalAmount
      });
    }

    // Enviar notificación
    addNotification({
      id: String(Date.now()),
      userId: extendingContract.userId,
      title: 'Contrato extendido',
      message: `Tu contrato ${extendingContract.contractNumber} ha sido extendido por ${additionalDays} día(s) adicional(es). Nueva fecha de finalización: ${format(newEndDate, 'dd/MM/yyyy', { locale: es })}. Costo adicional: $${additionalCost.toFixed(2)}.`,
      type: 'info',
      read: false,
      createdAt: new Date()
    });

    toast.success(`Contrato extendido exitosamente. ${additionalDays} día(s) adicional(es) agregado(s). Costo adicional: $${additionalCost.toFixed(2)}`);
    setIsExtendContractModalOpen(false);
    setExtendingContract(null);
    setAdditionalDays(1);
    setExtensionNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727] transition-colors duration-200">
      {/* Header mejorado */}
      <div className="bg-white dark:bg-[#272727] border-b dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2 dark:text-white">Reservas y Contratos</h1>
              <p className="text-muted-foreground dark:text-gray-400">
                Gestiona pre-reservas, reservas confirmadas y genera contratos preliminares
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Limpiar búsqueda
                  setSearchQuery('');
                  
                  // Cerrar modales
                  setIsCreateContractModalOpen(false);
                  setIsFinishContractModalOpen(false);
                  setIsCancelConfirmOpen(false);
                  
                  // Limpiar selecciones
                  setSelectedPreReservation(null);
                  setSelectedContract(null);
                  
                  // Limpiar formularios
                  setCustomerName('');
                  setCustomerDNI('');
                  setCustomerLicense('');
                  setDepositAmount(0);
                  setNotes('');
                  setHasDamages(false);
                  setDamageDescription('');
                  setDamageCharges(0);
                  setPaymentMethod('efectivo');
                  
                  toast.success('Página limpiada completamente');
                }}
                className="dark:bg-[#272727] dark:text-white dark:border-gray-600 dark:hover:bg-[#383838]"
              >
                Limpiar
              </Button>
              {onNavigate && (
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('inicio')}
                  className="flex items-center gap-2 dark:bg-[#272727] dark:text-white dark:border-gray-600 dark:hover:bg-[#383838]"
                >
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </Button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda mejorada */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por código, vehículo o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-[#272727] border-gray-200 dark:border-gray-700 dark:text-white focus:bg-white dark:focus:bg-[#383838] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="prereservations" className="space-y-6">
          {/* Tabs mejorados */}
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-[#272727] p-1.5 rounded-sm shadow-sm dark:border dark:border-gray-700">
            <TabsTrigger 
              value="prereservations"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neutral-700 data-[state=active]:to-neutral-800 data-[state=active]:text-white transition-all rounded-sm"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Pre-reservas</span>
                <Badge variant="secondary" className="ml-1 bg-neutral-800 text-neutral-300">
                  {preReservations.length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="confirmed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white transition-all rounded-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmadas</span>
                <Badge variant="secondary" className="ml-1 bg-green-950/50 text-green-500">
                  {confirmedReservations.length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="contracts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white transition-all rounded-sm"
            >
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                <span>Contratos</span>
                <Badge variant="secondary" className="ml-1 bg-red-950/50 text-red-500">
                  {activeContracts.length}
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Pre-reservas Tab */}
          <TabsContent value="prereservations" className="space-y-5">
            <Alert className="bg-neutral-900 dark:bg-[#383838] border-neutral-800 dark:border-gray-700">
              <AlertCircle className="h-4 w-4 text-neutral-400" />
              <AlertDescription className="text-neutral-300 dark:text-gray-300">
                Las pre-reservas son reservas sin pago inicial. Se permiten máximo 3 por vehículo. 
                Genera un contrato preliminar para confirmarlas. El pago se realiza al devolver el vehículo.
              </AlertDescription>
            </Alert>

            <Card className="shadow-sm border-gray-200 dark:bg-[#272727] dark:border-gray-700">
              <CardHeader className="border-b bg-gray-50/50 dark:bg-[#383838] dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Clock className="w-5 h-5 text-neutral-600 dark:text-gray-400" />
                      Pre-reservas
                    </CardTitle>
                    <CardDescription className="mt-1 dark:text-gray-400">
                      {filteredPreReservations.length} pre-reserva(s) encontrada(s)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-[#383838] hover:bg-gray-50/50 dark:hover:bg-[#383838]">
                        <TableHead className="font-semibold dark:text-gray-300">Código</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Vehículo</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Cliente</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Posición</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Fecha Inicio</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Fecha Fin</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Estado</TableHead>
                        <TableHead className="font-semibold text-right dark:text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPreReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <Clock className="w-12 h-12 text-gray-300" />
                              <p>No se encontraron pre-reservas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPreReservations.map((rental) => {
                          const vehicle = getVehicleInfo(rental.vehicleId);
                          const customer = getCustomerInfo(rental.userId, rental);
                          
                          return (
                            <TableRow key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell>
                                <span className="font-mono text-sm">{rental.registrationNumber}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{customer?.name || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200">
                                  {rental.preReservePosition || 1}/3
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <CalendarDays className="w-4 h-4 text-gray-400" />
                                  {format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <CalendarDays className="w-4 h-4 text-gray-400" />
                                  {format(new Date(rental.endDate), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(rental.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCancelConfirm(rental)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateContractFromPreReservation(rental)}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                  >
                                    <FileSignature className="w-4 h-4 mr-1.5" />
                                    Contrato
                                  </Button>
                                </div>
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
          </TabsContent>

          {/* Reservas Confirmadas Tab */}
          <TabsContent value="confirmed" className="space-y-5">
            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-[#383838] dark:border-gray-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-900 dark:text-gray-300">
                Estas reservas tienen pago inicial. Genera el contrato preliminar para formalizar la reserva.
              </AlertDescription>
            </Alert>

            <Card className="shadow-sm border-gray-200 dark:bg-[#272727] dark:border-gray-700">
              <CardHeader className="border-b bg-gray-50/50 dark:bg-[#383838] dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Reservas Confirmadas sin Contrato
                    </CardTitle>
                    <CardDescription className="mt-1 dark:text-gray-400">
                      {filteredConfirmedReservations.length} reserva(s) encontrada(s)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-[#383838] dark:hover:bg-[#383838]">
                        <TableHead className="font-semibold dark:text-gray-300">Código</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Vehículo</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Cliente</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Pago Inicial</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Fecha Inicio</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Fecha Fin</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Total</TableHead>
                        <TableHead className="font-semibold text-right dark:text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConfirmedReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground dark:text-gray-400">
                              <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                              <p>No hay reservas confirmadas sin contrato</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredConfirmedReservations.map((rental) => {
                          const vehicle = getVehicleInfo(rental.vehicleId);
                          const customer = getCustomerInfo(rental.userId, rental);
                          
                          return (
                            <TableRow key={rental.id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-[#383838]">
                              <TableCell className="dark:text-gray-300">
                                <span className="font-mono text-sm">{rental.registrationNumber}</span>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{customer?.name || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  ${rental.initialPayment?.toFixed(2) || '0.00'}
                                </span>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <CalendarDays className="w-4 h-4 text-gray-400" />
                                  {format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <CalendarDays className="w-4 h-4 text-gray-400" />
                                  {format(new Date(rental.endDate), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <span className="font-semibold">${rental.totalPrice.toFixed(2)}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateContractFromReservation(rental)}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                                  >
                                    <FileSignature className="w-4 h-4 mr-2" />
                                    Generar Contrato
                                  </Button>
                                </div>
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
          </TabsContent>

          {/* Contratos Activos Tab */}
          <TabsContent value="contracts" className="space-y-5">
            <Alert className="bg-purple-50 border-purple-200 dark:bg-[#383838] dark:border-gray-700">
              <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <AlertDescription className="text-purple-900 dark:text-gray-300">
                Contratos preliminares generados. El pago final se realizará al devolver el vehículo después de la inspección.
              </AlertDescription>
            </Alert>

            <Card className="shadow-sm border-gray-200 dark:bg-[#272727] dark:border-gray-700">
              <CardHeader className="border-b bg-gray-50/50 dark:bg-[#383838] dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <FileSignature className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Contratos Activos
                    </CardTitle>
                    <CardDescription className="mt-1 dark:text-gray-400">
                      {activeContracts.length} contrato(s) activo(s)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-[#383838] dark:hover:bg-[#383838]">
                        <TableHead className="font-semibold dark:text-gray-300">Nº Contrato</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Cliente</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Vehículo</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Período</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Depósito</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Total</TableHead>
                        <TableHead className="font-semibold dark:text-gray-300">Estado</TableHead>
                        <TableHead className="font-semibold text-right dark:text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeContracts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground dark:text-gray-400">
                              <FileSignature className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                              <p>No hay contratos activos</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeContracts.map((contract) => {
                          const vehicle = getVehicleInfo(contract.vehicleId);
                          
                          return (
                            <TableRow key={contract.id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-[#383838]">
                              <TableCell className="dark:text-gray-300">
                                <span className="font-mono text-sm font-medium">{contract.contractNumber}</span>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{contract.customerName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <CalendarDays className="w-4 h-4 text-gray-400" />
                                  {format(new Date(contract.startDate), 'dd/MM/yy', { locale: es })} - {format(new Date(contract.endDate), 'dd/MM/yy', { locale: es })}
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <span className="text-sm">${contract.depositAmount.toFixed(2)}</span>
                              </TableCell>
                              <TableCell className="dark:text-gray-300">
                                <span className="font-semibold">${contract.totalAmount.toFixed(2)}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                                  {contract.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenExtendContractModal(contract)}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-0"
                                  >
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Extender
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenFinishContractModal(contract)}
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                  >
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    Finalizar
                                  </Button>
                                </div>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Confirmation AlertDialog - Mejorado */}
      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent className="max-w-md dark:bg-[#272727] dark:border-gray-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="dark:text-white">¿Cancelar pre-reserva?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1 dark:text-gray-400">
                  Pre-reserva: <span className="font-mono">{selectedPreReservation?.registrationNumber}</span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="pl-15 dark:text-gray-400">
            Esta acción no se puede deshacer. La pre-reserva será cancelada permanentemente y el cliente recibirá una notificación.
          </AlertDialogDescription>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="mt-0 dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#484848]">Mantener pre-reserva</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancelPreReservation} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Contract Modal - Mejorado */}
      <Dialog open={isCreateContractModalOpen} onOpenChange={setIsCreateContractModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="dark:text-white">Generar Contrato Preliminar</DialogTitle>
                <DialogDescription className="mt-1 dark:text-gray-400">
                  Completa la información para generar el contrato. Se enviará por correo al cliente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Información del Vehículo y Fechas */}
            {selectedPreReservation && (
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-[#383838] dark:to-[#383838]/50 p-5 rounded-sm border border-neutral-200 dark:border-gray-700">
                <h3 className="flex items-center gap-2 mb-4 dark:text-white">
                  <Car className="w-5 h-5 text-neutral-600 dark:text-gray-400" />
                  <span className="font-semibold">Información del Vehículo y Reserva</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700 text-[rgb(54,54,54)]">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Vehículo</span>
                    <p className="font-medium dark:text-gray-200">
                      {getVehicleInfo(selectedPreReservation.vehicleId)?.brand}{' '}
                      {getVehicleInfo(selectedPreReservation.vehicleId)?.model}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700 bg-[rgba(54,54,54,0.26)]">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Placa</span>
                    <p className="font-medium font-mono dark:text-gray-200">
                      {getVehicleInfo(selectedPreReservation.vehicleId)?.licensePlate}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Código Reserva</span>
                    <p className="font-medium font-mono dark:text-gray-200">{selectedPreReservation.registrationNumber}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Fecha Inicio</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {format(new Date(selectedPreReservation.startDate), 'PPP', { locale: es })}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Fecha Fin</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {format(new Date(selectedPreReservation.endDate), 'PPP', { locale: es })}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-sm border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Duración</span>
                    <p className="font-medium dark:text-gray-200">
                      {differenceInDays(new Date(selectedPreReservation.endDate), new Date(selectedPreReservation.startDate))} días
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Separator className="dark:bg-gray-700" />

            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                <User className="w-5 h-5 text-neutral-600 dark:text-gray-400" />
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium dark:text-gray-300">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerDNI" className="text-sm font-medium dark:text-gray-300">
                    DNI/Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerDNI"
                    value={customerDNI}
                    onChange={(e) => setCustomerDNI(e.target.value)}
                    placeholder="12345678"
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerLicense" className="text-sm font-medium dark:text-gray-300">
                    Licencia de conducir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerLicense"
                    value={customerLicense}
                    onChange={(e) => setCustomerLicense(e.target.value)}
                    placeholder="ABC123456"
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                <DollarSign className="w-5 h-5 text-neutral-600 dark:text-gray-400" />
                Información Financiera
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount" className="text-sm font-medium dark:text-gray-300">Depósito de garantía</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Sugerido: 10% del total (${selectedPreReservation ? (selectedPreReservation.totalPrice * 0.1).toFixed(2) : '0.00'})
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-300">Monto total</Label>
                  <div className="px-4 py-2.5 bg-gray-100 dark:bg-[#383838] border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-lg dark:text-white">
                    ${selectedPreReservation ? selectedPreReservation.totalPrice.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Notas adicionales */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium dark:text-gray-300">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones especiales, observaciones, etc."
                rows={3}
                className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white resize-none"
              />
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Sección de Firmas */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                <Edit3 className="w-5 h-5 text-neutral-600 dark:text-gray-400" />
                Firmas Digitales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Firma de la Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="companySignature" className="text-sm font-medium dark:text-gray-300">
                    Firma de la Empresa <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="companySignature"
                      value={companySignature}
                      onChange={(e) => setCompanySignature(e.target.value)}
                      placeholder="Escribe el nombre de quien firma por la empresa"
                      className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white pr-10"
                    />
                    <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {companySignature && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/50">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Vista previa de firma:</p>
                      <p className="font-signature text-2xl text-blue-900 dark:text-blue-300" style={{ fontFamily: 'cursive' }}>
                        {companySignature}
                      </p>
                    </div>
                  )}
                </div>

                {/* Firma del Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="clientSignature" className="text-sm font-medium dark:text-gray-300">
                    Firma del Cliente <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="clientSignature"
                      value={clientSignature}
                      onChange={(e) => setClientSignature(e.target.value)}
                      placeholder="Escribe el nombre completo del cliente"
                      className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white pr-10"
                    />
                    <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {clientSignature && (
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Vista previa de firma:</p>
                      <p className="font-signature text-2xl text-emerald-900 dark:text-emerald-300" style={{ fontFamily: 'cursive' }}>
                        {clientSignature}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-gray-300">
                  Las firmas digitales se registrarán en el contrato con fecha y hora exactas. Ambas firmas son obligatorias para generar el contrato.
                </AlertDescription>
              </Alert>
            </div>

            <Alert className="bg-neutral-50 border-neutral-200 dark:bg-[#383838] dark:border-gray-700">
              <Send className="h-4 w-4 text-neutral-600 dark:text-gray-400" />
              <AlertDescription className="text-neutral-900 dark:text-gray-300">
                El contrato preliminar se generará y enviará por correo electrónico al cliente.
                El pago final se realizará al devolver el vehículo después de la inspección.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateContractModalOpen(false)} className="dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#484848]">
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateContract}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Generar y Enviar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Contract Modal - Mejorado */}
      <Dialog open={isFinishContractModalOpen} onOpenChange={setIsFinishContractModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="dark:text-white">Finalizar Contrato</DialogTitle>
                <DialogDescription className="mt-1 dark:text-gray-400">
                  Realiza la inspección del vehículo y procesa el pago final
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6 mt-4">
              {/* Información del Contrato */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-[#383838] dark:to-[#383838]/50 p-5 rounded-xl border border-purple-200 dark:border-gray-700">
                <h3 className="flex items-center gap-2 mb-4 dark:text-white">
                  <FileSignature className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">Información del Contrato</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Nº Contrato</span>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">{selectedContract.contractNumber}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Cliente</span>
                    <p className="font-medium text-sm dark:text-gray-200">{selectedContract.customerName}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">DNI</span>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">{selectedContract.customerDNI}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Vehículo</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {getVehicleInfo(selectedContract.vehicleId)?.brand}{' '}
                      {getVehicleInfo(selectedContract.vehicleId)?.model}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Placa</span>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">
                      {getVehicleInfo(selectedContract.vehicleId)?.licensePlate}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Período</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {format(new Date(selectedContract.startDate), 'dd/MM/yy', { locale: es })} - {format(new Date(selectedContract.endDate), 'dd/MM/yy', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              {/* Inspección del Vehículo */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Inspección del Vehículo
                </h3>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#383838] rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="hasDamages"
                    checked={hasDamages}
                    onChange={(e) => setHasDamages(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                  <Label htmlFor="hasDamages" className="cursor-pointer font-medium dark:text-gray-200">
                    El vehículo presenta daños
                  </Label>
                </div>

                {hasDamages && (
                  <div className="space-y-4 p-5 border-2 border-orange-200 dark:border-orange-900/50 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10">
                    <div className="space-y-2">
                      <Label htmlFor="damageDescription" className="text-sm font-medium dark:text-gray-300">
                        Descripción de daños <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="damageDescription"
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        placeholder="Describe los daños encontrados en el vehículo..."
                        rows={4}
                        className="bg-white dark:bg-[#383838] border-orange-300 dark:border-gray-600 dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="damageCharges" className="text-sm font-medium dark:text-gray-300">
                        Cargo por daños ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="damageCharges"
                        type="number"
                        value={damageCharges}
                        onChange={(e) => setDamageCharges(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white dark:bg-[#383838] border-orange-300 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de Pago */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <h3 className="flex items-center gap-2 mb-4 font-semibold dark:text-white">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Resumen de Pago Final
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Monto total del contrato</span>
                    <span className="font-medium dark:text-gray-200">${selectedContract.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Depósito pagado</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-${selectedContract.depositAmount.toFixed(2)}</span>
                  </div>
                  {hasDamages && damageCharges > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                      <span className="text-sm text-orange-600 dark:text-orange-400">Cargo por daños</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">+${damageCharges.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold dark:text-white">Total a pagar</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${(selectedContract.totalAmount - selectedContract.depositAmount + damageCharges).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-300">Método de pago</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['efectivo', 'tarjeta', 'transferencia'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method
                          ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#383838]'
                      }`}
                    >
                      <span className="font-medium capitalize dark:text-gray-200">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription className="text-emerald-900 dark:text-gray-300">
                  Al finalizar el contrato, el vehículo quedará disponible automáticamente y se enviará una notificación al cliente.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsFinishContractModalOpen(false)} className="dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#484848]">
              Cancelar
            </Button>
            <Button 
              onClick={handleFinishContract}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Procesar Pago y Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Contract Modal */}
      <Dialog open={isExtendContractModalOpen} onOpenChange={setIsExtendContractModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="dark:text-white">Extender Contrato</DialogTitle>
                <DialogDescription className="mt-1 dark:text-gray-400">
                  Agrega días adicionales al contrato existente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {extendingContract && (
            <div className="space-y-6 mt-4">
              {/* Información del Contrato Actual */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-[#383838] dark:to-[#383838]/50 p-5 rounded-xl border border-blue-200 dark:border-gray-700">
                <h3 className="flex items-center gap-2 mb-4 dark:text-white">
                  <FileSignature className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">Información del Contrato Actual</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Nº Contrato</span>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">{extendingContract.contractNumber}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Cliente</span>
                    <p className="font-medium text-sm dark:text-gray-200">{extendingContract.customerName}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Vehículo</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {getVehicleInfo(extendingContract.vehicleId)?.brand}{' '}
                      {getVehicleInfo(extendingContract.vehicleId)?.model}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Precio por día</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      ${getVehicleInfo(extendingContract.vehicleId)?.pricePerDay.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Fecha actual de fin</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {format(new Date(extendingContract.endDate), 'PPP', { locale: es })}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#272727]/60 p-3 rounded-lg border border-transparent dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-500 block mb-1">Total actual</span>
                    <p className="font-medium text-sm dark:text-gray-200">
                      ${extendingContract.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              {/* Configurar Extensión */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Configurar Extensión
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalDays" className="text-sm font-medium dark:text-gray-300">
                    Días adicionales <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="additionalDays"
                    type="number"
                    min="1"
                    value={additionalDays}
                    onChange={(e) => setAdditionalDays(parseInt(e.target.value) || 1)}
                    placeholder="1"
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Ingresa la cantidad de días que deseas extender el contrato
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extensionNotes" className="text-sm font-medium dark:text-gray-300">
                    Notas adicionales (opcional)
                  </Label>
                  <Textarea
                    id="extensionNotes"
                    value={extensionNotes}
                    onChange={(e) => setExtensionNotes(e.target.value)}
                    placeholder="Motivo de la extensión, acuerdos especiales, etc."
                    rows={3}
                    className="border-gray-300 dark:bg-[#383838] dark:border-gray-600 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Resumen de la Extensión */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <h3 className="flex items-center gap-2 mb-4 font-semibold dark:text-white">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Resumen de la Extensión
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Días adicionales</span>
                    <span className="font-medium dark:text-gray-200">{additionalDays} día(s)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Costo por día</span>
                    <span className="font-medium dark:text-gray-200">
                      ${getVehicleInfo(extendingContract.vehicleId)?.pricePerDay.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Nueva fecha de finalización</span>
                    <span className="font-medium dark:text-gray-200">
                      {format(addDays(new Date(extendingContract.endDate), additionalDays), 'PPP', { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Costo adicional</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      +${((getVehicleInfo(extendingContract.vehicleId)?.pricePerDay || 0) * additionalDays).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold dark:text-white">Nuevo total del contrato</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${(extendingContract.totalAmount + ((getVehicleInfo(extendingContract.vehicleId)?.pricePerDay || 0) * additionalDays)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-gray-300">
                  El cliente será notificado sobre la extensión del contrato y el costo adicional. El monto adicional se cobrará al finalizar el contrato.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsExtendContractModalOpen(false)} 
              className="dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#484848]"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleExtendContract}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Confirmar Extensión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}