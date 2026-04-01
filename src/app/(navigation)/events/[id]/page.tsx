'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import {
  calendarEventsService,
  type UpdateEventDto,
} from '@/services/calendarEventsService';
import { calendarTagsService } from '@/services/calendarTagsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const eventId = Number(params.id);

  const [formData, setFormData] = useState<UpdateEventDto>({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    isAllDay: false,
    location: '',
    tagIds: [],
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ['calendarEvent', eventId],
    queryFn: () => calendarEventsService.getEventById(eventId),
  });

  const { data: tags } = useQuery({
    queryKey: ['calendarTags'],
    queryFn: calendarTagsService.getAllTags,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDateTime: new Date(event.startDateTime).toISOString().slice(0, 16),
        endDateTime: new Date(event.endDateTime).toISOString().slice(0, 16),
        isAllDay: event.isAllDay,
        location: event.location || '',
        tagIds: event.tags?.map((tag) => tag.id) || [],
      });
    }
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEventDto) => calendarEventsService.updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEvent', eventId] });
      toast.success('Подію успішно оновлено!');
      router.push('/events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при оновленні події');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => calendarEventsService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success('Подію успішно видалено!');
      router.push('/events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні події');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm('Ви впевнені, що хочете видалити цю подію?')) {
      deleteMutation.mutate();
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }));
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

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-destructive">Подію не знайдено</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до подій
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Редагувати подію</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Інформація про подію</CardTitle>
            <CardDescription>Оновіть дані події</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Назва *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Назва події"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium mb-2 block">
                  Опис
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Опис події"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDateTime" className="text-sm font-medium mb-2 block">
                    Початок *
                  </label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDateTime" className="text-sm font-medium mb-2 block">
                    Кінець *
                  </label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Весь день</span>
                </label>
              </div>

              <div>
                <label htmlFor="location" className="text-sm font-medium mb-2 block">
                  Місце проведення
                </label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Місце проведення"
                />
              </div>

              {tags && tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Теги</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          formData.tagIds?.includes(tag.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        style={
                          formData.tagIds?.includes(tag.id) && tag.color
                            ? { backgroundColor: tag.color, color: '#fff' }
                            : {}
                        }
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Видалити
                </Button>
                <Link href="/events">
                  <Button type="button" variant="outline">
                    Скасувати
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
