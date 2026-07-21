ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery_videos text[] DEFAULT '{}'::text[];

UPDATE public.profiles
SET gallery_videos = ARRAY[video_url]
WHERE video_url IS NOT NULL
  AND (gallery_videos IS NULL OR array_length(gallery_videos, 1) IS NULL);