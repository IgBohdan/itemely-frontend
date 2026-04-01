'use client';
import Layout from '@/components/Layout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '@/services/categoriesService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateCategoryPage() {
  const [name, setName] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категорію успішно створено!');
      router.push('/categories');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при створенні категорії');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(name);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Link href="/categories">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до категорій
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Створити категорію</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Інформація про категорію</CardTitle>
            <CardDescription>Введіть назву нової категорії</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Назва категорії *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Назва категорії"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? 'Створення...' : 'Створити категорію'}
                </Button>
                <Link href="/categories">
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
