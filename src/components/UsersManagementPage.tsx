import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Search, Plus, Shield, Briefcase, Trash2, Edit2, Home } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'empleado';
}

export function UsersManagementPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    role: 'empleado'
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    }
    return <Badge variant="secondary"><Briefcase className="w-3 h-3 mr-1" /> Empleado</Badge>;
  };

  const handleOpenModal = (userId?: string) => {
    // Validar que solo admin pueda agregar nuevos usuarios
    if (!userId && currentUser?.role !== 'admin') {
      toast.error('Solo los administradores pueden agregar nuevos usuarios');
      return;
    }

    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setEditingUserId(user.id);
        setFormData({
          username: user.username,
          password: user.password,
          name: user.name,
          role: user.role
        });
      }
    } else {
      setEditingUserId(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'empleado'
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setShowPassword(false);
  };

  const handleSave = () => {
    if (!formData.username || !formData.password || !formData.name) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Check if username already exists (only when creating new user or changing username)
    if (!editingUserId || users.find(u => u.id === editingUserId)?.username !== formData.username) {
      const usernameExists = users.some(u => u.username === formData.username);
      if (usernameExists) {
        toast.error('Este nombre de usuario ya existe');
        return;
      }
    }

    if (editingUserId) {
      // Update existing user
      updateUser(editingUserId, formData);
      toast.success('Usuario actualizado exitosamente');
    } else {
      // Add new user
      addUser(formData);
      toast.success('Usuario agregado exitosamente');
    }
    handleCloseModal();
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${user?.username}"?`)) {
      deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#272727] transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#272727] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-2 dark:text-white">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">Administra los usuarios del sistema</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Limpiar filtros y búsqueda
                  setSearchQuery('');
                  setRoleFilter('all');
                  
                  // Cerrar modales
                  setIsModalOpen(false);
                  
                  // Limpiar formulario
                  setEditingUserId(null);
                  setFormData({
                    username: '',
                    password: '',
                    name: '',
                    role: 'empleado'
                  });
                  setShowPassword(false);
                  
                  toast.success('Página limpiada completamente');
                }}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Limpiar
              </Button>
              {onNavigate && (
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('inicio')}
                  className="flex items-center gap-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </Button>
              )}
              <Button 
                onClick={() => handleOpenModal()} 
                className="dark:bg-[#7D0C00] dark:hover:bg-[#5A0900]"
                disabled={currentUser?.role !== 'admin'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Usuario
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="Buscar por usuario, nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-[#272727] dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px] dark:bg-[#383838] dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#272727] dark:border-gray-700">
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="empleado">Empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-muted-foreground">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="dark:bg-[#272727] dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Usuarios del Sistema</CardTitle>
            <CardDescription>Lista de todos los usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 dark:text-gray-200">Usuario</th>
                    <th className="text-left py-3 px-4 dark:text-gray-200">Nombre</th>
                    <th className="text-left py-3 px-4 dark:text-gray-200">Rol</th>
                    <th className="text-right py-3 px-4 dark:text-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#383838]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-[#505050] rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className="dark:text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 dark:text-white">{user.name}</td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(user.id)}
                            title="Editar"
                            className="dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#505050]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-gray-600 dark:text-gray-400 mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md dark:bg-[#272727] dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{editingUserId ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUserId ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="dark:text-gray-200">Usuario *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="nombre_usuario"
                className="dark:bg-[#383838] dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-200">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="dark:bg-[#383838] dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Nombre completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                className="dark:bg-[#383838] dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="dark:text-gray-200">Rol *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'empleado' })}
              >
                <SelectTrigger className="dark:bg-[#383838] dark:text-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#272727] dark:border-gray-700">
                  <SelectItem value="empleado">Empleado</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} className="dark:bg-[#383838] dark:text-white dark:border-gray-600 dark:hover:bg-[#505050]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="dark:bg-[#7D0C00] dark:hover:bg-[#5A0900]">
              {editingUserId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}