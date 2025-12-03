import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './components/LoginPage';
import { SimpleHeader } from './components/SimpleHeader';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { SimpleDashboard } from './components/SimpleDashboard';
import { VehiclesPage } from './components/VehiclesPage';
import { VehicleDetailPage } from './components/VehicleDetailPage';
import { RentalsPage } from './components/RentalsPage';
import { RentVehiclePage } from './components/RentVehiclePage';
import { AdminPage } from './components/AdminPage';
import { ReportsPage } from './components/ReportsPage';
import { ReservationsAndContractsPage } from './components/ReservationsAndContractsPage';
import { UsersManagementPage } from './components/UsersManagementPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('inicio');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Determine sidebar state for dynamic margin
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Set initial page based on user role when user changes
  useEffect(() => {
    if (user) {
      setCurrentPage('inicio');
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      setSidebarCollapsed(saved ? JSON.parse(saved) : false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Check every 100ms for changes (since we're in the same window)
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleAuthSuccess = () => {
    // Page will be set by useEffect based on user role
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedVehicleId(null);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentPage('vehicle-detail');
  };

  const handleBackToVehicles = () => {
    setSelectedVehicleId(null);
    setCurrentPage('vehicles');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage onSuccess={handleAuthSuccess} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] transition-colors duration-200">
      <SimpleHeader onNavigate={handleNavigate} currentPage={currentPage} />
      <CollapsibleSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main 
        className={`transition-all duration-300 pt-[73px] min-h-screen bg-gray-50 dark:bg-[#1E1E1E] ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          {currentPage === 'inicio' && <SimpleDashboard onNavigate={handleNavigate} />}
          {currentPage === 'admin' && <AdminPage />}
          {currentPage === 'reports' && <ReportsPage onNavigate={handleNavigate} />}
          {currentPage === 'users' && <UsersManagementPage onNavigate={handleNavigate} />}
          {currentPage === 'vehicles' && <VehiclesPage onSelectVehicle={handleSelectVehicle} onNavigate={handleNavigate} />}
          {currentPage === 'rent-vehicle' && <RentVehiclePage onNavigate={handleNavigate} />}
          {currentPage === 'reservations-contracts' && <ReservationsAndContractsPage onNavigate={handleNavigate} />}
          {currentPage === 'vehicle-detail' && selectedVehicleId && (
            <VehicleDetailPage
              vehicleId={selectedVehicleId}
              onBack={handleBackToVehicles}
            />
          )}
          {currentPage === 'rentals' && <RentalsPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}