export type Category = 'work' | 'personal' | 'shopping' | 'other';

export type Priority = 'low' | 'medium' | 'high';

export interface Item {
  id: number;
  title: string;
  favorite: boolean;
  description: string;
  category: Category;
  createdAt: Date;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}