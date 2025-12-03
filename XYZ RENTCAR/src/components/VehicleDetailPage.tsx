import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star, ArrowLeft, Users, Settings, Fuel, Check, Calendar, CalendarCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface VehicleDetailPageProps {
  vehicleId: string;
  onBack: () => void;
}

export function VehicleDetailPage({ vehicleId, onBack }: VehicleDetailPageProps) {
  const { vehicles, addReservation } = useApp();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicle = vehicles.find(v => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#272727] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="dark:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <p className="mt-8 dark:text-white">Vehículo no encontrado</p>
        </div>
      </div>
    );
  }

  // Calcular días y precio total
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();
  const totalPrice = days * vehicle.pricePerDay;

  const handleReserve = () => {
    // Validaciones
    if (!startDate || !endDate) {
      toast.error('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (!clientName.trim()) {
      toast.error('Por favor ingresa el nombre del cliente');
      return;
    }

    if (!clientEmail.trim()) {
      toast.error('Por favor ingresa el email del cliente');
      return;
    }

    if (!clientPhone.trim()) {
      toast.error('Por favor ingresa el teléfono del cliente');
      return;
    }

    setIsSubmitting(true);

    // Crear reserva
    const reservation = {
      id: `RSV-${Date.now()}`,
      reservationNumber: `RSV-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      startDate,
      endDate,
      totalPrice,
      status: 'pendiente' as const,
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    addReservation(reservation);

    toast.success(`¡Reserva creada exitosamente! Número: ${reservation.reservationNumber}`);

    // Limpiar formulario
    setStartDate('');
    setEndDate('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setNotes('');
    setIsSubmitting(false);

    // Volver después de 2 segundos
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4 md:mb-6 dark:text-white dark:hover:bg-[#383838]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Image and Details */}
          <div className="space-y-6">
            <div className="aspect-video rounded-lg overflow-hidden">
              <ImageWithFallback
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                    <CardDescription>{vehicle.year} • {vehicle.category}</CardDescription>
                  </div>
                  {vehicle.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span>{vehicle.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({vehicle.reviewCount})</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2">Descripción</h3>
                    <p className="text-muted-foreground">{vehicle.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p>{vehicle.seats} asientos</p>
                    </div>
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p>{vehicle.transmission}</p>
                    </div>
                    <div className="text-center">
                      <Fuel className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p>{vehicle.fuelType}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3">Características</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kilometraje</span>
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matrícula</span>
                      <span>{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <Badge variant={vehicle.status === 'disponible' ? 'default' : 'secondary'}>
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información de Precios</CardTitle>
                <CardDescription>Tarifa de alquiler del vehículo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-neutral-50 p-6 rounded-sm text-center">
                  <p className="text-sm text-muted-foreground mb-2">Precio por día</p>
                  <p className="text-4xl">${vehicle.pricePerDay}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tarifa diaria</span>
                    <span>${vehicle.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tarifa semanal (7 días)</span>
                    <span>${vehicle.pricePerDay * 7}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tarifa mensual (30 días)</span>
                    <span>${vehicle.pricePerDay * 30}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    * Los precios están sujetos a disponibilidad. Contacta con el administrador para realizar una reserva.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reservar Vehículo</CardTitle>
                <CardDescription>Completa los detalles para hacer una reserva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de fin</Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[rgba(255,255,255,0)] rounded-[3px]">
                    <Label htmlFor="clientName">Nombre del cliente</Label>
                    <Input
                      type="text"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full text-[rgb(255,255,255)]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email del cliente</Label>
                    <Input
                      type="email"
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="clientPhone">Teléfono del cliente</Label>
                    <Input
                      type="tel"
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agregar información adicional..."
                    className="w-full"
                    rows={3}
                  />
                </div>

                {days > 0 && (
                  <div className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Días de alquiler</span>
                      <span className="font-semibold">{days} {days === 1 ? 'día' : 'días'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio por día</span>
                      <span>${vehicle.pricePerDay}</span>
                    </div>
                    <div className="h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                    <div className="flex justify-between text-lg">
                      <span>Total</span>
                      <span style={{ color: '#7D0C00' }}>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleReserve}
                  disabled={isSubmitting || vehicle.status !== 'disponible'}
                  className="w-full h-12"
                  style={{ backgroundColor: '#7D0C00' }}
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Procesando reserva...' : vehicle.status !== 'disponible' ? 'Vehículo no disponible' : 'Confirmar Reserva'}
                </Button>

                {vehicle.status !== 'disponible' && (
                  <p className="text-sm text-center text-muted-foreground">
                    Este vehículo no está disponible para reservas en este momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}