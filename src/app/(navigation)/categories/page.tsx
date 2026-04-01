'use client';
import CategoryCard from '@/components/CategoryCard';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, deleteCategory } from '@/services/categoriesService';
import { Category } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категорію успішно видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні категорії');
    },
  });

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
          <h1 className="text-3xl font-bold">Категорії</h1>
          <Link href="/categories/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Створити категорію
            </Button>
          </Link>
        </div>

        {!categories || categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Немає категорій</p>
              <Link href="/categories/create">
                <Button>Створити першу категорію</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
