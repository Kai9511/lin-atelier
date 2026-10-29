export type ExtraPhoto = {
  cropped_url: string;
  original_url: string;
  cropped_path: string;
  original_path: string;
  thumb_url?: string;
  thumb_path?: string;
  width: number;
  height: number;
};

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  title_cn?: string;
  year: number | null;
  medium: string | null;
  medium_cn?: string;
  dimensions: string | null;
  description: string | null;
  description_cn?: string;
  collection: string | null;
  collection_cn?: string;
  image_url: string;
  thumbnail_url: string;
  /** Storage paths inside the `artworks` bucket. Null for demo images served from /public. */
  image_path: string | null;
  thumbnail_path: string | null;
  original_url?: string | null;
  original_path?: string | null;
  extra_photos?: ExtraPhoto[] | null;
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
