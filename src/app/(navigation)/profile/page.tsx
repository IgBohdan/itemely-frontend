'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usersService } from "@/services/usersService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface FormData {
  fullName?: string;
  phone?: string;
  defaultReminderTime?: number;
  defaultReminderUnit?: "MINUTES" | "HOURS" | "DAYS";
  defaultReminderMethod?: "EMAIL" | "POPUP" | "SMS";
}

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: usersService.getCurrentUser,
  });

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    defaultReminderTime: 15,
    defaultReminderUnit: "MINUTES",
    defaultReminderMethod: "POPUP",
  });

  // Якщо є дані користувача, використовуємо їх для ініціалізації форми
  useEffect(() => {
    if (user) {
      const newFormData = {
        fullName: user.fullName,
        phone: user.phone || "",
        defaultReminderTime: user.defaultReminderTime || 15,
        defaultReminderUnit: user.defaultReminderUnit || "MINUTES",
        defaultReminderMethod: user.defaultReminderMethod || "POPUP",
      };

      // Порівнюємо з поточним станом, щоб уникнути непотрібного оновлення
      setFormData((prev) => {
        if (
          prev.fullName !== newFormData.fullName ||
          prev.phone !== newFormData.phone ||
          prev.defaultReminderTime !== newFormData.defaultReminderTime ||
          prev.defaultReminderUnit !== newFormData.defaultReminderUnit ||
          prev.defaultReminderMethod !== newFormData.defaultReminderMethod
        ) {
          return newFormData;
        }
        return prev;
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: usersService.updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["currentUser"], updatedUser);
      toast.success("Профіль успішно оновлено!");
    },
    onError: (
      error: Error | { response?: { data?: { message?: string } } }
    ) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Помилка при оновленні профілю";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Якщо ще завантажується, показуємо завантажувальний екран
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Завантаження...</div>
        </div>
      </div>
    );
  }

  // Якщо немає користувача, показуємо помилку
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-destructive">Помилка завантаження профілю</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Мій профіль</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація профілю</CardTitle>
              <CardDescription>Ваші особисті дані</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Телефон</p>
                      <p className="text-sm text-muted-foreground">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Налаштування</CardTitle>
              <CardDescription>Оновіть інформацію профілю</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium mb-2 block"
                  >
                    Повне ім'я
                  </label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Введіть ваше ім'я"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium mb-2 block"
                  >
                    Телефон
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+380 XX XXX XX XX"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Налаштування нагадувань</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="reminderTime"
                        className="text-sm font-medium mb-2 block"
                      >
                        Час нагадування
                      </label>
                      <Input
                        id="reminderTime"
                        type="number"
                        min="1"
                        value={formData.defaultReminderTime || 15}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultReminderTime: parseInt(e.target.value) || 15,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reminderUnit"
                        className="text-sm font-medium mb-2 block"
                      >
                        Одиниця часу
                      </label>
                      <select
                        id="reminderUnit"
                        value={formData.defaultReminderUnit || "MINUTES"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultReminderUnit: e.target.value as
                              | "MINUTES"
                              | "HOURS"
                              | "DAYS",
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="MINUTES">Хвилини</option>
                        <option value="HOURS">Години</option>
                        <option value="DAYS">Дні</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="reminderMethod"
                        className="text-sm font-medium mb-2 block"
                      >
                        Метод нагадування
                      </label>
                      <select
                        id="reminderMethod"
                        value={formData.defaultReminderMethod || "POPUP"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultReminderMethod: e.target.value as
                              | "EMAIL"
                              | "POPUP"
                              | "SMS",
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="POPUP">Сповіщення</option>
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending
                    ? "Збереження..."
                    : "Зберегти зміни"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
