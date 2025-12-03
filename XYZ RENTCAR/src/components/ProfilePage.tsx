import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Camera, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dni: user?.dni || '',
    address: user?.address || '',
    licenseNumber: user?.licenseNumber || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handleScanDocument = (type: 'dni' | 'license') => {
    // Simulate document scanning
    toast.success('Iniciando escaneo de cámara...');
    
    setTimeout(() => {
      if (type === 'dni') {
        const mockDNI = '001-' + Math.floor(Math.random() * 10000000) + '-' + Math.floor(Math.random() * 10);
        setFormData(prev => ({ ...prev, dni: mockDNI }));
        toast.success('DNI escaneado correctamente');
      } else {
        const mockLicense = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 100000000);
        setFormData(prev => ({ ...prev, licenseNumber: mockLicense }));
        toast.success('Licencia escaneada correctamente');
      }
    }, 1500);
  };

  const handleVerifyDeposit = () => {
    toast.success('Verificación de depósito en proceso...');
    setTimeout(() => {
      updateUser({ depositVerified: true, depositAmount: 500 });
      toast.success('Depósito verificado correctamente');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="mb-8">Mi Perfil</h1>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="verification">Verificación</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Gestiona tu información de perfil</CardDescription>
                  </div>
                  <div className="w-16 h-16 bg-neutral-100 rounded-sm flex items-center justify-center">
                    <User className="w-8 h-8 text-neutral-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Calle, ciudad, código postal"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>

                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Guardar cambios</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DNI / Cédula</CardTitle>
                  <CardDescription>Escanea tu documento de identidad con la cámara</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">Número de DNI</Label>
                    <div className="flex gap-2">
                      <Input
                        id="dni"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="001-0123456-7"
                      />
                      <Button variant="outline" onClick={() => handleScanDocument('dni')}>
                        <Camera className="w-4 h-4 mr-2" />
                        Escanear
                      </Button>
                    </div>
                  </div>
                  {formData.dni && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>DNI registrado</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Licencia de conducir</CardTitle>
                  <CardDescription>Escanea tu licencia de conducir con la cámara</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Número de licencia</Label>
                    <div className="flex gap-2">
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="A12345678"
                      />
                      <Button variant="outline" onClick={() => handleScanDocument('license')}>
                        <Camera className="w-4 h-4 mr-2" />
                        Escanear
                      </Button>
                    </div>
                  </div>
                  {formData.licenseNumber && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Licencia registrada</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de verificación</CardTitle>
                  <CardDescription>Verifica tu identidad y depósito</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p>Documentos de identidad</p>
                        <p className="text-muted-foreground">DNI y licencia de conducir</p>
                      </div>
                    </div>
                    {formData.dni && formData.licenseNumber ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p>Depósito de verificación</p>
                        <p className="text-muted-foreground">
                          {user?.depositVerified 
                            ? `Verificado - $${user.depositAmount}` 
                            : 'Pendiente de verificación'}
                        </p>
                      </div>
                    </div>
                    {user?.depositVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {!user?.depositVerified && (
                    <div className="pt-4">
                      <Button onClick={handleVerifyDeposit} className="w-full">
                        Verificar depósito ($500)
                      </Button>
                      <p className="text-muted-foreground mt-2">
                        El depósito es requerido para completar reservas. Será reembolsado al finalizar tus alquileres.
                      </p>
                    </div>
                  )}

                  {user?.depositVerified && formData.dni && formData.licenseNumber && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <p>Verificación completa</p>
                      </div>
                      <p className="text-green-700 mt-2">
                        Tu cuenta está completamente verificada. Puedes proceder con tus reservas.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
