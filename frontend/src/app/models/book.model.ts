import { BookEvent } from './book-event.model';

export interface Book {
  id?: string;
  title: string;
  author: string;
  original_owner?: string;
  owner_name?: string;
  cover_image_url?: string;
  created_at?: string;
  imageError?: boolean;
  events?: BookEvent[];
  wallet_address?: string;
}
