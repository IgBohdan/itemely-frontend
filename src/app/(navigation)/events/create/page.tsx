'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { calendarEventsService, type CreateEventDto } from '@/services/calendarEventsService';
import { calendarTagsService } from '@/services/calendarTagsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    isAllDay: false,
    location: '',
    tagIds: [],
  });

  const { data: tags } = useQuery({
    queryKey: ['calendarTags'],
    queryFn: calendarTagsService.getAllTags,
  });

  const createMutation = useMutation({
    mutationFn: calendarEventsService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success('Подію успішно створено!');
      router.push('/events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при створенні події');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }));
  };

  const fillWithExample = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
    const toLocalDateTime = (date: Date) =>
      date.toISOString().slice(0, 16);
  
    setFormData({
      title: 'Зустріч з командою',
      description: 'Обговорення поточного стану проєкту та наступних кроків',
      startDateTime: toLocalDateTime(start),
      endDateTime: toLocalDateTime(end),
      isAllDay: false,
      location: 'Онлайн (Google Meet)',
      tagIds: tags?.slice(0, 2).map(t => t.id) ?? [],
    });
  };
  

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
          <h1 className="text-3xl font-bold">Створити подію</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Інформація про подію</CardTitle>
            <CardDescription>Заповніть дані для нової події</CardDescription>
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
    type="button"
    variant="secondary"
    onClick={fillWithExample}
  >
    Заповнити прикладом
  </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? 'Створення...' : 'Створити подію'}
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
