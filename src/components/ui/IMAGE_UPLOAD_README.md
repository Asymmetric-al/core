# Image Upload & Crop System

This directory contains the canonical image upload and cropping flow for the application.

## Architecture

```
User selects/drops file
        ↓
  validateImageFile()     ← MIME + extension + size checks
        ↓
  loadImageAsDataUrl()    ← Read file as base64
        ↓
  validateImageLoads()    ← Verify image is not corrupt
        ↓
    ImageCropper          ← User adjusts crop, zoom, rotation
        ↓
    getCroppedImg()       ← Canvas-based crop with rotation support
        ↓
  Supabase Storage        ← Upload to 'profiles' bucket
        ↓
    Return public URL
```

## Key Modules

### `src/lib/image-utils.ts`

Core utilities for image processing:

- `validateImageFile(file)` - Validates MIME type, extension, and file size
- `loadImageAsDataUrl(file)` - Converts File to base64 data URL
- `validateImageLoads(dataUrl)` - Verifies image can be rendered
- `getCroppedImg(src, crop, rotation, flip, options)` - Generates cropped Blob

### `src/components/ui/image-upload.tsx`

Main upload component with drag-and-drop support:

- Handles file selection (click or drag)
- Opens cropper dialog
- Uploads cropped result to Supabase Storage
- Supports custom children via render props pattern

### `src/components/ui/image-cropper.tsx`

Dialog-based image cropper using `react-easy-crop`:

- Zoom and rotation controls
- Touch-friendly for mobile
- Outputs WebP by default (configurable)

## Usage

### Basic Usage (Default UI)

```tsx
<ImageUpload
  value={avatarUrl}
  onChange={(url) => setAvatarUrl(url)}
  onRemove={() => setAvatarUrl("")}
/>
```

### Custom Trigger

```tsx
<ImageUpload
  value={avatarUrl}
  onChange={(url) => setAvatarUrl(url)}
  path="avatars"
  aspect={1}
>
  <Button>Upload Photo</Button>
</ImageUpload>
```

### Cover Photo (Wide Aspect)

```tsx
<ImageUpload
  value={coverUrl}
  onChange={(url) => setCoverUrl(url)}
  path="covers"
  aspect={3 / 1}
>
  <CoverPhotoPlaceholder />
</ImageUpload>
```

## Props

### ImageUpload

| Prop       | Type                    | Default      | Description                       |
| ---------- | ----------------------- | ------------ | --------------------------------- |
| `value`    | `string`                | -            | Current image URL                 |
| `onChange` | `(url: string) => void` | -            | Called with new URL after upload  |
| `onRemove` | `() => void`            | -            | Called when remove button clicked |
| `bucket`   | `string`                | `'profiles'` | Supabase Storage bucket           |
| `path`     | `string`                | `'avatars'`  | Path prefix in bucket             |
| `aspect`   | `number`                | `1`          | Aspect ratio for cropper          |
| `disabled` | `boolean`               | `false`      | Disable upload                    |

### ImageCropper

| Prop             | Type                   | Default        | Description               |
| ---------------- | ---------------------- | -------------- | ------------------------- |
| `image`          | `string`               | -              | Base64 data URL to crop   |
| `aspect`         | `number`               | `1`            | Aspect ratio              |
| `onCropComplete` | `(blob: Blob) => void` | -              | Called with cropped image |
| `onCancel`       | `() => void`           | -              | Called when dialog closed |
| `outputFormat`   | `string`               | `'image/webp'` | Output MIME type          |
| `quality`        | `number`               | `0.92`         | Output quality (0-1)      |

## Validation Rules

- **Allowed types**: JPEG, PNG, WebP, GIF
- **Max file size**: 10MB
- **Corrupt image detection**: Image must successfully load before cropping

## Error Handling

All errors surface as toast notifications:

- `"Unsupported file type..."` - Invalid MIME/extension
- `"File is too large..."` - Exceeds 10MB limit
- `"The image appears to be corrupt..."` - Failed to load
- `"Not authenticated"` - User not logged in
- `"Failed to upload image"` - Supabase Storage error

## Extending

### Adding a new upload target

1. Use `<ImageUpload>` with custom `bucket` and `path`
2. Ensure the bucket exists in Supabase with appropriate RLS policies
3. Handle the `onChange` callback to persist the URL

### Changing output format

Pass `outputFormat` and `quality` to `ImageCropper` (or modify defaults in `getCroppedImg`):

```tsx
<ImageCropper outputFormat="image/jpeg" quality={0.85} {...otherProps} />
```

### Adding new validation rules

Extend `validateImageFile()` in `image-utils.ts`.

## Supabase Storage Setup

The system expects a `profiles` bucket with these policies:

```sql
-- Public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

-- Authenticated users can upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles');

-- Owners can update/delete their files
CREATE POLICY "Owner Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'profiles' AND auth.uid() = owner);

CREATE POLICY "Owner Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'profiles' AND auth.uid() = owner);
```

## Known Limitations

1. **EXIF orientation**: Modern browsers auto-correct EXIF orientation. The cropper displays images as the browser renders them, which matches the final output.

2. **Large images**: Very large images (>4000px) may cause performance issues on mobile. Consider adding resolution limits if needed.

3. **Animated GIFs**: The cropper will convert animated GIFs to static images.

## Testing

Run the E2E tests:

```bash
npx playwright test tests/e2e/upload-crop.spec.ts
```

Key test scenarios:

- File picker upload → crop → save → image appears
- Drag-and-drop upload → crop → save
- Cancel during crop → original state preserved
- Invalid file type → error message
- Oversized file → error message
