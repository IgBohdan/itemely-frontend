import { Category } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '@/services/categoriesService';
import { toast } from 'react-toastify';
import { FolderOpen } from 'lucide-react';

export default function CategoryCard({ category }: { category: Category }) {
  const queryClient = useQueryClient();

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

  const handleDelete = () => {
    if (confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <CardTitle>{category.name}</CardTitle>
        </div>
        <CardDescription>
          Подій: {category.events?.length || 0}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Видалити
        </Button>
      </CardContent>
    </Card>
  );
}
