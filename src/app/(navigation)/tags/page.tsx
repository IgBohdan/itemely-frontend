'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { calendarTagsService } from '@/services/calendarTagsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { useState } from 'react';

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  const { data: tags, isLoading } = useQuery({
    queryKey: ['calendarTags'],
    queryFn: calendarTagsService.getAllTags,
  });

  const createMutation = useMutation({
    mutationFn: calendarTagsService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarTags'] });
      toast.success('Тег успішно створено!');
      setIsCreating(false);
      setNewTagName('');
      setNewTagColor('#3b82f6');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при створенні тегу');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: calendarTagsService.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarTags'] });
      toast.success('Тег успішно видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні тегу');
    },
  });

  const handleCreate = () => {
    if (!newTagName.trim()) {
      toast.error('Введіть назву тегу');
      return;
    }
    createMutation.mutate({ name: newTagName, color: newTagColor });
  };

  const handleDelete = (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей тег?')) {
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
          <h1 className="text-3xl font-bold">Теги</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            Створити тег
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Створити новий тег</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tagName" className="text-sm font-medium mb-2 block">
                    Назва тегу *
                  </label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Назва тегу"
                  />
                </div>
                <div>
                  <label htmlFor="tagColor" className="text-sm font-medium mb-2 block">
                    Колір
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="tagColor"
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    Створити
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Скасувати
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!tags || tags.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Немає тегів</p>
              <Button onClick={() => setIsCreating(true)}>Створити перший тег</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color || '#3b82f6' }}
                    />
                    {tag.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        toast.info('Редагування тегів буде додано пізніше');
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редагувати
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(tag.id)}
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

