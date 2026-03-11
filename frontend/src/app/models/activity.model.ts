export type ActivityType = 'user_registered' | 'book_added' | 'event_added';

export interface ActivityBook {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
}

export interface ActivityEvent {
  id: number;
  location: string;
  description: string;
  rating: number;
  book_id: string;
  book_title: string;
  book_cover: string;
  images: { id: number; image_url: string }[];
}

export interface Activity {
  id: number;
  type: ActivityType;
  entity_id: string;
  user_id: string;
  username: string;
  created_at: string;
  book?: ActivityBook;
  event?: ActivityEvent;
}
