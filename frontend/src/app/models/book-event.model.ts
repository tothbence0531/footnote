export interface BookEvent {
  id?: string;
  book_id: string;
  user_id: string;
  user_name?: string;
  location: string;
  description: string;
  rating: number;
  hash?: string;
  created_at: string;
  images?: BookEventImage[];
  files?: File[];
}

export interface BookEventImage {
  id?: string;
  event_id?: string;
  image_url: string;
}
