export type Artwork = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  description: string | null;
  collection: string | null;
  image_url: string;
  thumbnail_url: string;
  /** Storage paths inside the `artworks` bucket. Null for demo images served from /public. */
  image_path: string | null;
  thumbnail_path: string | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  artwork_slug: string | null;
};
