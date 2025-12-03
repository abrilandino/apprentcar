import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        onSuccess();
      } else {
        setError('Credenciales inválidas. Por favor verifica tu usuario y contraseña.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-200">
      {/* Fondo con gradiente */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200"
      />
      
      {/* Efecto de patrón sutil */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(125,12,0,.03) 35px, rgba(125,12,0,.03) 70px)`
        }}
      />

      {/* Logo XYZ en la esquina superior izquierda */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#7D0C00' }}
        >
          <span className="text-xl text-white">XYZ</span>
        </div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-[#272727] rounded-lg shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-12 transition-colors duration-200 border border-transparent dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            {/* Título */}
            <h1 className="text-3xl text-center text-gray-900 dark:text-white mb-8">Sign in</h1>

            {/* Mensaje de error */}
            {error && (
              <Alert variant="destructive" className="mb-6 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Campo Username */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-[#383838] rounded border-0 outline-none focus:bg-gray-200 dark:focus:bg-[#404040] transition-colors text-gray-900 dark:text-white"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              {/* Campo Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-[#383838] rounded border-0 outline-none focus:bg-gray-200 dark:focus:bg-[#404040] transition-colors text-gray-900 dark:text-white"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botón Submit Circular */}
            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_0_30px_rgba(125,12,0,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7D0C00' }}
              >
                <ArrowRight className="w-8 h-8 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Texto inferior */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sistema de Alquiler XYZ
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Para empleados y administradores
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-500">
          © 2024 XYZ Rental System. All rights reserved.
        </p>
      </div>
    </div>
  );
}