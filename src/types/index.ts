export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
  events?: Event[];
}

export interface Activity {
  id: number;
  action: string;
  createdAt: string;
  user: User;
}
