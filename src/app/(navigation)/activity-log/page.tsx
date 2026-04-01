'use client';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { getActivityLog } from '@/services/activityLogService';
import { Activity } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function ActivityLogPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activityLog'],
    queryFn: getActivityLog,
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
        <h1 className="text-3xl font-bold mb-6">Журнал активності</h1>

        {!activities || activities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Немає активності</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded">
                      <ActivityIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">{activity.action}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{activity.user.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(activity.createdAt), 'PPp', { locale: uk })}
                          </span>
                        </div>
                      </div>
                    </div>
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
