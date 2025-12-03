// Types for the Vehicle Rental Application

export type UserRole = 'empleado' | 'admin';

export type VehicleStatus = 'disponible' | 'pre-rentado' | 'rentado' | 'en-mantenimiento';

export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  dni?: string;
  address?: string;
  licenseNumber?: string;
  depositVerified: boolean;
  depositAmount?: number;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  status: VehicleStatus;
  imageUrl: string;
  transmission: string;
  fuelType: string;
  seats: number;
  mileage: number;
  licensePlate: string;
  description: string;
  features: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Rental {
  id: string;
  registrationNumber: string;
  reservationType: 'reservado' | 'pre-reservado'; // Nuevo campo
  vehicleId: string;
  userId: string;
  // Información del cliente para generar el contrato
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDNI?: string;
  customerLicense?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  basePrice: number;
  initialPayment: number; // Nuevo campo: monto inicial pagado
  deposit: number;
  damageCharges: number;
  totalPrice: number;
  status: 'pendiente' | 'activa' | 'completada' | 'cancelada';
  contractSigned: boolean;
  contractUrl?: string;
  pickupLocation: string;
  returnLocation: string;
  createdAt: Date;
  preReservePosition?: number; // Posición en la lista de pre-reservas (1-3)
  recommendedVehicleIds?: string[]; // IDs de vehículos recomendados si fue desplazado
}

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  method: 'tarjeta' | 'transferencia' | 'efectivo';
  status: 'pendiente' | 'completado' | 'fallido';
  transactionId: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  rentalId: string;
  invoiceNumber: string;
  userId: string;
  vehicleId: string;
  basePrice: number;
  deposit: number;
  damageCharges: number;
  taxes: number;
  total: number;
  paidAmount: number;
  balance: number;
  createdAt: Date;
}

export interface Review {
  id: string;
  rentalId: string;
  vehicleId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  date: Date;
  performedBy: string;
  status: 'programado' | 'en-progreso' | 'completado';
}

export interface Contract {
  id: string;
  contractNumber: string;
  rentalId: string;
  vehicleId: string;
  userId: string;
  customerName: string;
  customerDNI: string;
  customerLicense: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  depositAmount: number;
  status: 'borrador' | 'activo' | 'completado' | 'cancelado';
  signedDate?: Date;
  contractUrl?: string;
  emailSent: boolean;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface CartItem {
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}