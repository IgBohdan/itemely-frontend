'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { notificationsService } from '@/services/notificationsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getAllNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Сповіщення позначено як прочитане');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при оновленні сповіщення');
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Завантаження...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const readNotifications = notifications?.filter((n) => n.isRead) || [];

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Сповіщення</h1>
          {unreadNotifications.length > 0 && (
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              {unreadNotifications.length} непрочитаних
            </span>
          )}
        </div>

        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Немає сповіщень</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Непрочитані</h2>
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={!notification.isRead ? 'border-primary' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(notification.createdAt), 'PPp', { locale: uk })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Прочитані</h2>
                <div className="space-y-2">
                  {readNotifications.map((notification) => (
                    <Card key={notification.id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(notification.createdAt), 'PPp', { locale: uk })}
                            </p>
                          </div>
                          <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

