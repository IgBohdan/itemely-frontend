import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, FolderOpen, Activity, Plus } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 text-black dark:text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ласкаво просимо до Itemely</h1>
          <p className="text-muted-foreground text-lg">
            Керуйте своїми подіями, категоріями та активністю в одному місці
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Події</CardTitle>
              </div>
              <CardDescription>
                Створюйте та керуйте своїми подіями та нагадуваннями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити подію
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <CardTitle>Категорії</CardTitle>
              </div>
              <CardDescription>
                Організуйте свої події за категоріями для кращого керування
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/categories">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити категорію
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Журнал активності</CardTitle>
              </div>
              <CardDescription>
                Переглядайте історію всіх ваших дій та змін
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/activity-log">
                <Button className="w-full" variant="outline">
                  Переглянути журнал
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Calendar</CardTitle>
              </div>
              <CardDescription>
                See your calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calendar">
                <Button className="w-full" variant="outline">
                  go
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}