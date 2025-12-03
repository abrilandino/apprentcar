import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Rental, CartItem, Notification, User, Contract } from '../types';
import { mockVehicles, mockRentals, mockNotifications, mockUsers } from '../lib/mock-data';

interface AppContextType {
  vehicles: Vehicle[];
  rentals: Rental[];
  cart: CartItem[];
  notifications: Notification[];
  users: User[];
  contracts: Contract[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (vehicleId: string) => void;
  clearCart: () => void;
  addVehicle: (data: Partial<Vehicle>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addRental: (data: Omit<Rental, 'id'>) => Rental;
  updateRental: (id: string, data: Partial<Rental>) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
  addContract: (data: Omit<Contract, 'id'>) => Contract;
  updateContract: (id: string, data: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  addUser: (data: Partial<User> & { password: string }) => User;
  updateUser: (id: string, data: Partial<User> & { password?: string }) => void;
  deleteUser: (id: string) => void;
  checkVehicleAvailability: (vehicleId: string, startDate: Date, endDate: Date) => {
    available: boolean;
    preReservesCount: number;
    reservedDates: { startDate: Date; endDate: Date }[];
  };
  getRecommendedVehicles: (originalVehicleId: string, startDate: Date, endDate: Date) => Vehicle[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize users from localStorage or use mock data
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('xyz_users');
    if (stored) {
      try {
        const parsedUsers = JSON.parse(stored);
        // Ensure admin user exists
        const hasAdmin = parsedUsers.some((u: User) => u.username === 'admin');
        if (!hasAdmin) {
          // Add admin user if missing
          const updatedUsers = [...parsedUsers, ...mockUsers];
          localStorage.setItem('xyz_users', JSON.stringify(updatedUsers));
          return updatedUsers;
        }
        return parsedUsers;
      } catch (e) {
        console.error('Error parsing stored users:', e);
        localStorage.setItem('xyz_users', JSON.stringify(mockUsers));
        return mockUsers;
      }
    }
    // First time - store mock users
    localStorage.setItem('xyz_users', JSON.stringify(mockUsers));
    return mockUsers;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [rentals, setRentals] = useState<Rental[]>(mockRentals);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Persist users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('xyz_users', JSON.stringify(users));
  }, [users]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.vehicleId === item.vehicleId);
      if (existing) {
        return prev.map(i => i.vehicleId === item.vehicleId ? item : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (vehicleId: string) => {
    setCart(prev => prev.filter(item => item.vehicleId !== vehicleId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addVehicle = (data: Partial<Vehicle>) => {
    const newVehicle: Vehicle = {
      id: String(Date.now()),
      brand: data.brand || '',
      model: data.model || '',
      year: data.year || new Date().getFullYear(),
      category: data.category || '',
      pricePerDay: data.pricePerDay || 0,
      status: data.status || 'disponible',
      imageUrl: data.imageUrl || '',
      transmission: data.transmission || 'Automática',
      fuelType: data.fuelType || 'Gasolina',
      seats: data.seats || 5,
      mileage: data.mileage || 0,
      licensePlate: data.licensePlate || '',
      description: data.description || '',
      features: data.features || [],
      rating: data.rating,
      reviewCount: data.reviewCount
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => 
      prev.map(v => v.id === id ? { ...v, ...data } : v)
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addRental = (data: Omit<Rental, 'id'>) => {
    const newRental: Rental = {
      ...data,
      id: String(Date.now())
    };
    setRentals(prev => [...prev, newRental]);
    
    // Update vehicle status to 'pre-rentado' when rental is created
    updateVehicle(data.vehicleId, { status: 'pre-rentado' });
    return newRental;
  };

  const updateRental = (id: string, data: Partial<Rental>) => {
    setRentals(prev => 
      prev.map(r => r.id === id ? { ...r, ...data } : r)
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const addContract = (data: Omit<Contract, 'id'>) => {
    const newContract: Contract = {
      ...data,
      id: String(Date.now())
    };
    setContracts(prev => [...prev, newContract]);
    return newContract;
  };

  const updateContract = (id: string, data: Partial<Contract>) => {
    setContracts(prev => 
      prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c)
    );
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addUser = (data: Partial<User> & { password: string }) => {
    const newUser: User = {
      id: String(Date.now()),
      username: data.username || '',
      name: data.name || '',
      email: data.email || '',
      password: data.password,
      role: data.role || 'empleado',
      phone: data.phone || '',
      address: data.address,
      dni: data.dni,
      licenseNumber: data.licenseNumber,
      depositVerified: data.depositVerified || false,
      depositAmount: data.depositAmount,
      createdAt: new Date()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User> & { password?: string }) => {
    setUsers(prev => 
      prev.map(u => u.id === id ? { ...u, ...data } : u)
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const checkVehicleAvailability = (vehicleId: string, startDate: Date, endDate: Date) => {
    const vehicleRentals = rentals.filter(r => 
      r.vehicleId === vehicleId && 
      (r.status === 'pendiente' || r.status === 'activa')
    );
    const reservedDates: { startDate: Date; endDate: Date }[] = [];
    let preReservesCount = 0;

    vehicleRentals.forEach(rental => {
      if (rental.reservationType === 'pre-reservado') {
        preReservesCount++;
      }
      reservedDates.push({ startDate: rental.startDate, endDate: rental.endDate });
    });

    // Check if the requested dates conflict with confirmed reservations only
    const conflictingReservations = vehicleRentals.filter(rental => {
      if (rental.reservationType === 'pre-reservado') return false; // Pre-reservas no bloquean
      
      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      
      return (
        (startDate >= rentalStart && startDate <= rentalEnd) ||
        (endDate >= rentalStart && endDate <= rentalEnd) ||
        (startDate <= rentalStart && endDate >= rentalEnd)
      );
    });

    return {
      available: conflictingReservations.length === 0,
      preReservesCount: preReservesCount,
      reservedDates: reservedDates
    };
  };

  const getRecommendedVehicles = (originalVehicleId: string, startDate: Date, endDate: Date) => {
    const originalVehicle = vehicles.find(v => v.id === originalVehicleId);
    if (!originalVehicle) return [];

    const availableVehicles = vehicles.filter(v => v.id !== originalVehicleId && checkVehicleAvailability(v.id, startDate, endDate).available);
    const recommendedVehicles: Vehicle[] = [];

    availableVehicles.forEach(vehicle => {
      if (vehicle.category === originalVehicle.category && vehicle.pricePerDay <= originalVehicle.pricePerDay * 1.2) {
        recommendedVehicles.push(vehicle);
      }
    });

    return recommendedVehicles;
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        rentals,
        cart,
        notifications,
        users,
        contracts,
        addToCart,
        removeFromCart,
        clearCart,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addRental,
        updateRental,
        markNotificationAsRead,
        addNotification,
        addContract,
        updateContract,
        deleteContract,
        addUser,
        updateUser,
        deleteUser,
        checkVehicleAvailability,
        getRecommendedVehicles
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};