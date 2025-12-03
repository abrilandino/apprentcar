import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CreditCard, Building2, FileText, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';
import SignatureCanvas from 'react-signature-canvas';

interface CheckoutPageProps {
  onComplete: () => void;
}

export function CheckoutPage({ onComplete }: CheckoutPageProps) {
  const { user } = useAuth();
  const { cart, vehicles, clearCart, addRental, addNotification } = useApp();
  const [step, setStep] = useState<'payment' | 'contract' | 'complete'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'transferencia'>('tarjeta');
  const [processing, setProcessing] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [contractSigned, setContractSigned] = useState(false);
  const [rentalNumber, setRentalNumber] = useState('');

  const cartWithVehicles = cart.map(item => ({
    ...item,
    vehicle: vehicles.find(v => v.id === item.vehicleId)
  }));

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deposit = 200;
  const taxes = subtotal * 0.18;
  const total = subtotal + deposit + taxes;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Pago procesado correctamente');
    setProcessing(false);
    setStep('contract');
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setContractSigned(false);
  };

  const handleSignContract = () => {
    if (signatureRef.current?.isEmpty()) {
      toast.error('Por favor firma el contrato');
      return;
    }

    setContractSigned(true);
    const registrationNum = `RNT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setRentalNumber(registrationNum);

    // Create rentals for each cart item
    cart.forEach((item, index) => {
      const rental = {
        id: String(Date.now() + index),
        registrationNumber: `${registrationNum}-${index + 1}`,
        vehicleId: item.vehicleId,
        userId: user?.id || '',
        startDate: item.startDate,
        endDate: item.endDate,
        totalDays: item.totalDays,
        basePrice: item.totalPrice,
        deposit: deposit / cart.length,
        damageCharges: 0,
        totalPrice: (item.totalPrice + deposit / cart.length + (item.totalPrice * 0.18)),
        status: 'pendiente' as const,
        contractSigned: true,
        contractUrl: `/contracts/${registrationNum}-${index + 1}.pdf`,
        pickupLocation: 'Oficina Centro',
        returnLocation: 'Oficina Centro',
        createdAt: new Date()
      };

      addRental(rental);

      // Add notification
      addNotification({
        id: String(Date.now() + index + 1000),
        userId: user?.id || '',
        title: 'Reserva confirmada',
        message: `Tu reserva ${rental.registrationNumber} ha sido confirmada. El contrato ha sido enviado a tu correo.`,
        type: 'success',
        read: false,
        createdAt: new Date()
      });
    });

    toast.success('Contrato firmado correctamente');
    toast.success('Contrato enviado por correo a ambas partes');
    
    setTimeout(() => {
      setStep('complete');
    }, 1500);
  };

  const handleComplete = () => {
    clearCart();
    onComplete();
  };

  const downloadContract = () => {
    toast.success('Descargando contrato en formato PDF...');
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="mb-2">¡Reserva completada!</h2>
            <p className="text-muted-foreground mb-6">
              Tu reserva {rentalNumber} ha sido procesada exitosamente
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="mb-4">Detalles de la reserva</h3>
              <div className="space-y-2">
                <p>Número de registro: <span>{rentalNumber}</span></p>
                <p>Vehículos: <span>{cart.length}</span></p>
                <p>Total pagado: <span>${total.toFixed(2)}</span></p>
                <p>Estado: <span className="text-green-600">Confirmada</span></p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-6 text-left">
              <p className="text-neutral-900">
                El contrato firmado ha sido enviado a tu correo electrónico ({user?.email}) y 
                almacenado en la nube. También puedes descargarlo desde aquí.
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={downloadContract} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Descargar contrato
              </Button>
              <Button onClick={handleComplete}>
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'contract') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="mb-8">Firma del contrato</h1>

          <Card>
            <CardHeader>
              <CardTitle>Contrato de Alquiler de Vehículo</CardTitle>
              <CardDescription>Lee y firma el contrato digitalmente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Content */}
              <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto border">
                <h3 className="mb-4">CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</h3>
                
                <div className="space-y-4">
                  <div>
                    <p>Entre <strong>XYZ</strong> (en adelante "El Arrendador") y <strong>{user?.name}</strong> (en adelante "El Arrendatario"), se acuerda lo siguiente:</p>
                  </div>

                  <div>
                    <p><strong>PRIMERA: OBJETO DEL CONTRATO</strong></p>
                    <p>El Arrendador se compromete a entregar en calidad de arrendamiento los siguientes vehículos:</p>
                    <ul className="list-disc list-inside ml-4 mt-2">
                      {cartWithVehicles.map((item, idx) => (
                        <li key={idx}>
                          {item.vehicle?.brand} {item.vehicle?.model} ({item.vehicle?.year}) - 
                          Matrícula: {item.vehicle?.licensePlate}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p><strong>SEGUNDA: PERIODO DE ARRENDAMIENTO</strong></p>
                    {cartWithVehicles.map((item, idx) => (
                      <p key={idx}>
                        Vehículo {idx + 1}: Del {item.startDate.toLocaleDateString('es-ES')} al {item.endDate.toLocaleDateString('es-ES')}
                      </p>
                    ))}
                  </div>

                  <div>
                    <p><strong>TERCERA: PRECIO Y FORMA DE PAGO</strong></p>
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Depósito de garantía: ${deposit.toFixed(2)}</p>
                    <p>Impuestos (18%): ${taxes.toFixed(2)}</p>
                    <p>Total: ${total.toFixed(2)}</p>
                  </div>

                  <div>
                    <p><strong>CUARTA: OBLIGACIONES DEL ARRENDATARIO</strong></p>
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>Utilizar el vehículo de forma adecuada y responsable</li>
                      <li>Devolver el vehículo en las mismas condiciones en que lo recibió</li>
                      <li>Pagar cualquier daño causado durante el periodo de alquiler</li>
                      <li>No subarrendar el vehículo sin autorización escrita</li>
                      <li>Mantener vigente la licencia de conducir</li>
                    </ul>
                  </div>

                  <div>
                    <p><strong>QUINTA: DEPÓSITO DE GARANTÍA</strong></p>
                    <p>El depósito será reembolsado al finalizar el alquiler si el vehículo es devuelto sin daños. 
                    Cualquier daño será deducido del depósito y facturado al arrendatario.</p>
                  </div>

                  <div>
                    <p><strong>SEXTA: DATOS DEL ARRENDATARIO</strong></p>
                    <p>Nombre: {user?.name}</p>
                    <p>DNI: {user?.dni}</p>
                    <p>Dirección: {user?.address}</p>
                    <p>Licencia de conducir: {user?.licenseNumber}</p>
                    <p>Teléfono: {user?.phone}</p>
                    <p>Email: {user?.email}</p>
                  </div>

                  <div>
                    <p><strong>SÉPTIMA: JURISDICCIÓN</strong></p>
                    <p>Este contrato se rige por las leyes vigentes y cualquier controversia será resuelta en los tribunales competentes.</p>
                  </div>
                </div>
              </div>

              {/* Signature Pad */}
              <div>
                <Label className="mb-2 block">Firma del arrendatario</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'w-full h-40 border rounded',
                      style: { backgroundColor: 'white' }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearSignature}>
                      Limpiar firma
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">
                  Firma en el recuadro con el mouse o con el dedo en dispositivos táctiles
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                <p className="text-neutral-900">
                  Al firmar este contrato, aceptas todos los términos y condiciones del arrendamiento. 
                  El contrato firmado será enviado por correo electrónico a ambas partes y almacenado en la nube.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleSignContract} disabled={contractSigned}>
                <FileText className="w-4 h-4 mr-2" />
                Firmar y completar
              </Button>
              <Button variant="outline" onClick={() => setStep('payment')}>
                Volver
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="mb-8">Pago y finalización</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Método de pago</CardTitle>
                <CardDescription>Selecciona tu método de pago preferido</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tarjeta">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Tarjeta
                    </TabsTrigger>
                    <TabsTrigger value="transferencia">
                      <Building2 className="w-4 h-4 mr-2" />
                      Transferencia
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tarjeta">
                    <form onSubmit={handlePayment} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de tarjeta</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Fecha de vencimiento</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                        <Input
                          id="cardName"
                          placeholder="NOMBRE APELLIDO"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={processing}>
                        {processing ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="transferencia">
                    <div className="space-y-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p>Realiza la transferencia a la siguiente cuenta:</p>
                        <div className="space-y-1">
                          <p><strong>Banco:</strong> Banco Popular</p>
                          <p><strong>Cuenta:</strong> 123-456789-0</p>
                          <p><strong>Beneficiario:</strong> XYZ S.A.</p>
                          <p><strong>Monto:</strong> ${total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reference">Número de referencia</Label>
                        <Input
                          id="reference"
                          placeholder="Ingresa el número de referencia"
                        />
                      </div>

                      <Button onClick={handlePayment} className="w-full" size="lg" disabled={processing}>
                        {processing ? 'Verificando...' : 'Confirmar pago'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartWithVehicles.map((item, idx) => (
                    <div key={idx} className="pb-2 border-b">
                      <p>{item.vehicle?.brand} {item.vehicle?.model}</p>
                      <p className="text-muted-foreground">
                        {item.totalDays} días × ${item.pricePerDay}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depósito</span>
                    <span>${deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Total</span>
                    <span className="text-2xl">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
