import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, Check, Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationsPage() {
  const { notifications, markNotificationAsRead } = useApp();
  const { user } = useAuth();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadNotifications = userNotifications.filter(n => !n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  const markAllAsRead = () => {
    unreadNotifications.forEach(n => markNotificationAsRead(n.id));
  };

  if (userNotifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="mb-8">Notificaciones</h1>
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="mb-2">No tienes notificaciones</h2>
            <p className="text-muted-foreground">
              Aquí aparecerán las notificaciones sobre tus reservas y actividad
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Notificaciones</h1>
            {unreadNotifications.length > 0 && (
              <p className="text-muted-foreground">
                Tienes {unreadNotifications.length} notificaciones sin leer
              </p>
            )}
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {userNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.read ? 'border-l-4 border-l-neutral-600' : ''} ${getBgColor(notification.type)}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3>{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge variant="default">Nuevo</Badge>
                        )}
                        <span className="text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(notification.createdAt, { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Marcar como leída
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
