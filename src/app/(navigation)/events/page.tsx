'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { calendarEventsService } from '@/services/calendarEventsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function EventsPage() {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: calendarEventsService.getAllEvents,
  });

  const deleteMutation = useMutation({
    mutationFn: calendarEventsService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success('Подію успішно видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні події');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цю подію?')) {
      deleteMutation.mutate(id);
    }
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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Події календаря</h1>
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Створити подію
            </Button>
          </Link>
        </div>

        {!events || events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Немає подій</p>
              <Link href="/events/create">
                <Button>Створити першу подію</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{event.title}</CardTitle>
                      {event.description && (
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(event.startDateTime), 'PPp', { locale: uk })} -{' '}
                        {format(new Date(event.endDateTime), 'PPp', { locale: uk })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.isAllDay && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Весь день
                      </span>
                    )}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: tag.color || '#e5e7eb',
                              color: '#000',
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Редагувати
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
