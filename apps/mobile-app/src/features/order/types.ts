export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
