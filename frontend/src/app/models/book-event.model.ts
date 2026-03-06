export interface BookEvent {
  id: string;
  book_id: string;
  user_id: string;
  location: string;
  description: string;
  rating: number;
  hash: string;
  created_at: string;
  images?: BookEventImage[];
}

export interface BookEventImage {
  id: string;
  event_id: string;
  image_url: string;
}
