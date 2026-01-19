# Image Upload Backend Processing

This document explains the backend image processing system for the application.

## Architecture Overview

```
Client                          Server (Next.js API Route)              Storage
  │                                      │                                 │
  │  1. Select/Crop Image                │                                 │
  │  ─────────────────────────────────>  │                                 │
  │     POST /api/upload/image           │                                 │
  │     FormData: file, bucket, path     │                                 │
  │                                      │                                 │
  │                                      │  2. Validate & Process          │
  │                                      │     - sharp resize              │
  │                                      │     - Generate variants         │
  │                                      │                                 │
  │                                      │  3. Upload Variants ──────────> │
  │                                      │     - display (1200px max)      │
  │                                      │     - thumbnail (200px)         │
  │                                      │                                 │
  │  4. Return URLs   <─────────────────│                                 │
  │     { url, thumbnailUrl, result }    │                                 │
```

## API Endpoint

### `POST /api/upload/image`

Accepts an image file, processes it server-side using Sharp, and uploads optimized variants to Supabase Storage.

#### Request

- **Headers**: `Authorization: Bearer <supabase-access-token>`
- **Body**: `multipart/form-data`
  - `file` (required): Image file (JPEG, PNG, WebP, GIF)
  - `bucket` (optional): Storage bucket name (default: `profiles`)
  - `path` (optional): Path prefix in bucket (default: `avatars`)

#### Response

```json
{
  "success": true,
  "url": "https://...supabase.co/.../display.webp",
  "thumbnailUrl": "https://...supabase.co/.../thumb.webp",
  "result": {
    "original": {
      "key": "avatars/user-123-display",
      "width": 4000,
      "height": 3000,
      "bytes": 5242880,
      "format": "image/jpeg"
    },
    "display": {
      "key": "avatars/user-123-display.webp",
      "url": "https://...",
      "width": 1200,
      "height": 900,
      "bytes": 85432,
      "format": "image/webp"
    },
    "thumbnail": {
      "key": "avatars/user-123-thumb.webp",
      "url": "https://...",
      "width": 200,
      "height": 200,
      "bytes": 8234,
      "format": "image/webp"
    }
  }
}
```

## Processing Configuration

Edit `src/app/api/upload/image/route.ts` to adjust:

| Constant                  | Default | Description                              |
| ------------------------- | ------- | ---------------------------------------- |
| `DISPLAY_MAX_DIMENSION`   | 1200    | Maximum width/height for display variant |
| `THUMBNAIL_MAX_DIMENSION` | 200     | Thumbnail size (square, center-cropped)  |
| `OUTPUT_QUALITY`          | 85      | WebP quality (1-100)                     |
| `MAX_FILE_SIZE`           | 50MB    | Maximum upload size                      |

## Client-Side Limits

The client (`src/lib/image-utils.ts`) enforces a **50MB safeguard limit** to prevent browser crashes from extremely large files. This is not a practical limit but a safety mechanism.

- Files 2-50MB: Accepted, processed normally
- Files >50MB: Rejected client-side with error message

## Variants Generated

1. **Display**: Main image used for profile views, posts, etc.
   - Max 1200x1200px (maintains aspect ratio)
   - WebP format, 85% quality
   - `fit: inside` (never upscales)

2. **Thumbnail**: Small preview for lists, avatars, etc.
   - 200x200px square
   - WebP format, 85% quality
   - `fit: cover` (center-cropped)

## Changing Sizing Rules

### To add a new variant:

1. Add resize logic in the API route:

```typescript
const newVariantBuffer = await sharp(buffer)
  .resize(800, 800, { fit: "inside" })
  .webp({ quality: OUTPUT_QUALITY })
  .toBuffer();
```

2. Upload to storage:

```typescript
const newVariantPath = `${path}/${baseName}-newvariant.webp`;
await supabaseAdmin.storage
  .from(bucket)
  .upload(newVariantPath, newVariantBuffer, {
    contentType: "image/webp",
    upsert: true,
  });
```

3. Include in response:

```typescript
const result = {
  // ...existing variants
  newVariant: {
    key: newVariantPath,
    url: publicUrl,
    // ...metadata
  },
};
```

### To change output format:

Replace `.webp({ quality: OUTPUT_QUALITY })` with:

- JPEG: `.jpeg({ quality: OUTPUT_QUALITY, mozjpeg: true })`
- PNG: `.png({ compressionLevel: 9 })`
- AVIF: `.avif({ quality: OUTPUT_QUALITY })`

## Error Handling

| Error                      | Status | Cause                              |
| -------------------------- | ------ | ---------------------------------- |
| `Unauthorized`             | 401    | Missing or invalid Bearer token    |
| `No file provided`         | 400    | Missing file in FormData           |
| `Unsupported file type`    | 400    | File MIME not in allowed list      |
| `File too large`           | 400    | Exceeds 50MB limit                 |
| `Invalid or corrupt image` | 400    | Sharp couldn't read image metadata |
| `Upload failed`            | 500    | Supabase Storage error             |

## Storage Bucket Setup

Ensure the target bucket exists with appropriate policies:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles');
```

## Dependencies

- **sharp**: High-performance image processing (libvips)
- **@supabase/supabase-js**: Storage client

## Performance Notes

- Sharp uses libvips which processes images in streaming fashion
- Memory usage is proportional to image dimensions, not file size
- Large images (>10000px) may take 2-5 seconds to process
- Many serverless platforms default to 10-30 seconds (sufficient for most images)
