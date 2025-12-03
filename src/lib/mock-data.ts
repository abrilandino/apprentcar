// Mock data for development
import { Vehicle, User, Rental, Review, Maintenance, Notification } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    category: 'Eléctrico',
    pricePerDay: 120,
    status: 'disponible',
    imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhcnxlbnwxfHx8fDE3NjE1NDQ4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Eléctrico',
    seats: 5,
    mileage: 5000,
    licensePlate: 'ABC-123',
    description: 'Vehículo eléctrico de última generación con autopilot y gran autonomía.',
    features: ['Autopilot', 'Cámara 360°', 'Asientos de cuero', 'Pantalla táctil 15"', 'Carga rápida'],
    rating: 4.8,
    reviewCount: 24
  },
  {
    id: '2',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    category: 'SUV',
    pricePerDay: 150,
    status: 'disponible',
    imageUrl: 'https://images.unsplash.com/photo-1758217209786-95458c5d30a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdXYlMjB2ZWhpY2xlfGVufDF8fHx8MTc2MTU3NTg5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 7,
    mileage: 15000,
    licensePlate: 'XYZ-456',
    description: 'SUV de lujo con espacio para toda la familia y tecnología de punta.',
    features: ['7 asientos', 'Sistema de navegación', 'Control crucero adaptativo', 'Techo panorámico', 'Sistema de sonido premium'],
    rating: 4.6,
    reviewCount: 18
  },
  {
    id: '3',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    category: 'Sedán',
    pricePerDay: 60,
    status: 'rentado',
    imageUrl: 'https://images.unsplash.com/photo-1658662160331-62f7e52e63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NjE1MjIxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Híbrido',
    seats: 5,
    mileage: 25000,
    licensePlate: 'DEF-789',
    description: 'Sedán eficiente y confiable, ideal para viajes largos y uso diario.',
    features: ['Bajo consumo', 'Sistema híbrido', 'Apple CarPlay', 'Cámara trasera', 'Sensores de estacionamiento'],
    rating: 4.5,
    reviewCount: 32
  },
  {
    id: '4',
    brand: 'Porsche',
    model: '911',
    year: 2024,
    category: 'Deportivo',
    pricePerDay: 350,
    status: 'disponible',
    imageUrl: 'https://images.unsplash.com/photo-1716013989018-698c714f20d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjByZWR8ZW58MXx8fHwxNzYxNTEzNzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 2,
    mileage: 3000,
    licensePlate: 'GHI-321',
    description: 'Deportivo de alto rendimiento para una experiencia de conducción inolvidable.',
    features: ['Motor turbo', 'Modo deportivo', 'Sistema de escape deportivo', 'Frenos de alto rendimiento', 'Interior premium'],
    rating: 5.0,
    reviewCount: 8
  },
  {
    id: '5',
    brand: 'Honda',
    model: 'CR-V',
    year: 2023,
    category: 'SUV',
    pricePerDay: 85,
    status: 'en-mantenimiento',
    imageUrl: 'https://images.unsplash.com/photo-1705747401901-28363172fe7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBzaG93cm9vbXxlbnwxfHx8fDE3NjE1MDIxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 5,
    mileage: 35000,
    licensePlate: 'JKL-654',
    description: 'SUV compacto versátil con gran espacio de carga y confort.',
    features: ['Amplio maletero', 'Sistema de seguridad Honda Sensing', 'Climatizador dual', 'Bluetooth', 'Control de voz'],
    rating: 4.4,
    reviewCount: 15
  },
  {
    id: '6',
    brand: 'Mercedes-Benz',
    model: 'Clase C',
    year: 2024,
    category: 'Sedán',
    pricePerDay: 180,
    status: 'pre-rentado',
    imageUrl: 'https://images.unsplash.com/photo-1658662160331-62f7e52e63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NjE1MjIxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 5,
    mileage: 8000,
    licensePlate: 'MNO-987',
    description: 'Sedán de lujo con elegancia y tecnología de vanguardia.',
    features: ['Sistema MBUX', 'Asientos con masaje', 'Iluminación ambiental', 'Head-up display', 'Asistente de estacionamiento'],
    rating: 4.7,
    reviewCount: 12
  },
  {
    id: '7',
    brand: 'Ford',
    model: 'Mustang',
    year: 2023,
    category: 'Deportivo',
    pricePerDay: 200,
    status: 'rentado',
    imageUrl: 'https://images.unsplash.com/photo-1642975474863-94903cfdc4aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGb3JkJTIwTXVzdGFuZyUyMHJlZHxlbnwxfHx8fDE3NjI2MzY0NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    transmission: 'Manual',
    fuelType: 'Gasolina',
    seats: 4,
    mileage: 12000,
    licensePlate: 'PQR-111',
    description: 'Muscle car americano con un potente motor V8.',
    features: ['Motor V8', 'Sistema de escape deportivo', 'Asientos deportivos', 'Pantalla táctil', 'Sistema de sonido premium'],
    rating: 4.8,
    reviewCount: 20
  },
  {
    id: '8',
    brand: 'Nissan',
    model: 'Altima',
    year: 2023,
    category: 'Sedán',
    pricePerDay: 70,
    status: 'rentado',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaXNzYW4lMjBhbHRpbWF8ZW58MXx8fHwxNzYxNTQ0ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    transmission: 'Automática',
    fuelType: 'Gasolina',
    seats: 5,
    mileage: 28000,
    licensePlate: 'STU-222',
    description: 'Sedán familiar espacioso con excelente rendimiento de combustible.',
    features: ['Pantalla táctil', 'Cámara de reversa', 'Bluetooth', 'Control crucero', 'Sistema de navegación'],
    rating: 4.3,
    reviewCount: 16
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: '1234', // Contraseña: 1234
    email: 'admin@xyz.com',
    name: 'Admin',
    phone: '+1234567890',
    role: 'admin',
    dni: '001-0123456-7',
    address: 'Av. Principal 123, Santo Domingo',
    licenseNumber: 'A12345678',
    depositVerified: true,
    depositAmount: 500,
    createdAt: new Date('2024-01-01')
  }
];

export const mockRentals: Rental[] = [
  {
    id: '1',
    registrationNumber: 'RNT-2024-0001',
    reservationType: 'reservado',
    vehicleId: '3',
    userId: '2', // María Empleado
    customerName: 'Juan Pérez García',
    customerEmail: 'juan.perez@example.com',
    customerPhone: '+1 (809) 555-1234',
    customerDNI: '001-0234567-8',
    customerLicense: 'B23456789',
    startDate: new Date('2024-10-20'),
    endDate: new Date('2024-10-27'),
    totalDays: 7,
    basePrice: 420,
    initialPayment: 100,
    deposit: 200,
    damageCharges: 0,
    totalPrice: 620,
    status: 'activa',
    contractSigned: true,
    contractUrl: '/contracts/RNT-2024-0001.pdf',
    pickupLocation: 'Oficina Centro',
    returnLocation: 'Oficina Centro',
    createdAt: new Date('2024-10-15')
  },
  {
    id: '2',
    registrationNumber: 'PRE-2024-0002',
    reservationType: 'pre-reservado',
    vehicleId: '6',
    userId: '2', // María Empleado
    customerName: 'María Rodríguez Santos',
    customerEmail: 'maria.rodriguez@example.com',
    customerPhone: '+1 (809) 555-5678',
    customerDNI: '001-0345678-9',
    customerLicense: 'C34567890',
    startDate: new Date('2024-10-28'),
    endDate: new Date('2024-11-02'),
    totalDays: 5,
    basePrice: 900,
    initialPayment: 0,
    deposit: 300,
    damageCharges: 0,
    totalPrice: 1200,
    status: 'pendiente',
    contractSigned: false,
    pickupLocation: 'Oficina Aeropuerto',
    returnLocation: 'Oficina Centro',
    createdAt: new Date('2024-10-25'),
    preReservePosition: 1
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    rentalId: '1',
    vehicleId: '3',
    userId: '3',
    rating: 5,
    comment: 'Excelente vehículo, muy cómodo y económico. El proceso de alquiler fue muy sencillo.',
    createdAt: new Date('2024-10-10')
  },
  {
    id: '2',
    rentalId: '2',
    vehicleId: '1',
    userId: '2',
    rating: 5,
    comment: 'El Tesla es increíble, la tecnología es impresionante y el servicio impecable.',
    createdAt: new Date('2024-10-05')
  }
];

export const mockMaintenance: Maintenance[] = [
  {
    id: '1',
    vehicleId: '5',
    type: 'Mantenimiento Preventivo',
    description: 'Cambio de aceite, filtros y revisión general',
    cost: 250,
    date: new Date('2024-10-26'),
    performedBy: 'Taller Autorizado Honda',
    status: 'en-progreso'
  },
  {
    id: '2',
    vehicleId: '3',
    type: 'Reparación',
    description: 'Cambio de neumáticos delanteros',
    cost: 400,
    date: new Date('2024-09-15'),
    performedBy: 'Taller Central',
    status: 'completado'
  },
  {
    id: '3',
    vehicleId: '1',
    type: 'Inspección',
    description: 'Inspección técnica anual',
    cost: 150,
    date: new Date('2024-08-20'),
    performedBy: 'Centro de Inspección Vehicular',
    status: 'completado'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Reserva confirmada',
    message: 'Tu reserva RNT-2024-0001 ha sido confirmada. Recoge tu vehículo el 20 de octubre.',
    type: 'success',
    read: false,
    createdAt: new Date('2024-10-15')
  },
  {
    id: '2',
    userId: '2',
    title: 'Recordatorio de devolución',
    message: 'Recuerda devolver tu vehículo mañana 27 de octubre antes de las 5:00 PM.',
    type: 'warning',
    read: false,
    createdAt: new Date('2024-10-26')
  },
  {
    id: '3',
    userId: '2',
    title: 'Contrato pendiente',
    message: 'Por favor firma el contrato de tu reserva RNT-2024-0002 antes del 28 de octubre.',
    type: 'info',
    read: true,
    createdAt: new Date('2024-10-25')
  }
];

// Helper functions
export const getVehiclesByStatus = (status: string) => {
  return mockVehicles.filter(v => v.status === status);
};

export const getMaintenanceCostByVehicle = (vehicleId: string) => {
  return mockMaintenance
    .filter(m => m.vehicleId === vehicleId)
    .reduce((sum, m) => sum + m.cost, 0);
};

export const getVehicleRating = (vehicleId: string) => {
  const reviews = mockReviews.filter(r => r.vehicleId === vehicleId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
};