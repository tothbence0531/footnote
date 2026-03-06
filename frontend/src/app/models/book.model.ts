export interface Book {
  id: string;
  title: string;
  author: string;
  original_owner?: string;
  cover_image_url?: string;
  created_at: string;
  imageError?: boolean;
}
