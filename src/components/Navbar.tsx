"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Bell,
  Calendar,
  FolderOpen,
  LogOut,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { getCurrentUser, logout } from "@/services/authService";

interface User {
  id: number;
  email: string;
  fullName: string;
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export default function Navbar() {
  const pathname = usePathname();

  const user = useSyncExternalStore(subscribe, getCurrentUser, () => null);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { href: "/", label: "Головна", icon: Calendar },
    { href: "/categories", label: "Категорії", icon: FolderOpen },
    { href: "/events", label: "Події", icon: Calendar },
    { href: "/tags", label: "Теги", icon: Tag },
    { href: "/notifications", label: "Сповіщення", icon: Bell },
    { href: "/activity-log", label: "Журнал активності", icon: Activity },
    { href: "/calendar", label: "Календар", icon: Calendar },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-neutral-900 bg-white/80 dark:bg-black/70 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-white dark:text-black font-black text-lg italic">i</span>
              </div>
              <span className="text-xl dark:text-white font-bold tracking-tight">
                Itemely
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium cursor-pointer",
                        isActive
                          ? "bg-black/5 dark:bg-white/5 text-black dark:text-white"
                          : "text-gray-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-40")} />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-neutral-900/50 p-1 rounded-full border border-gray-100 dark:border-neutral-800">
              <ThemeToggle />
            </div>

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-neutral-800 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="ghost" className="gap-2 p-1.5 pr-4 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 border border-transparent hover:border-gray-200 dark:hover:border-neutral-800 transition-all font-black hover:font-white ">
                    <Avatar className="h-8 w-8 border border-white dark:border-black shadow-sm">
                      <AvatarFallback className="text-[10px] bg-black text-white dark:bg-white dark:text-black">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{user.fullName}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  title="Вийти"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl px-5 font-bold">Увійти</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-black text-white dark:bg-white dark:text-black rounded-xl px-6 font-black shadow-lg hover:opacity-90 transition-opacity">
                    Реєстрація
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
