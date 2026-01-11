# PWA Icons Setup

## Current Status
The manifest.webmanifest has been temporarily fixed to use the existing `/icon.svg` file.

## Required Icons for Production PWA

To properly support Progressive Web App (PWA) functionality, you need the following icon files:

### Required Files
- `icon-192.png` - 192x192px PNG icon
- `icon-512.png` - 512x512px PNG icon
- `icon-maskable-192.png` - 192x192px maskable icon (with safe zone)
- `icon-maskable-512.png` - 512x512px maskable icon (with safe zone)
- `apple-touch-icon.png` - 180x180px for iOS (referenced in layout.tsx)

### How to Generate Icons

#### Option 1: Using Online Tools
1. Visit https://realfavicongenerator.net/
2. Upload your logo/icon
3. Configure settings for PWA
4. Download and extract to `/public` folder

#### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Generate icons from SVG
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 512x512 icon-512.png
magick icon.svg -resize 180x180 apple-touch-icon.png

# For maskable icons, add padding (safe zone)
magick icon.svg -resize 154x154 -gravity center -extent 192x192 icon-maskable-192.png
magick icon.svg -resize 410x410 -gravity center -extent 512x512 icon-maskable-512.png
```

#### Option 3: Using Node.js Sharp (already in dependencies)
Create a script `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const maskableSizes = [
  { name: 'icon-maskable-192.png', size: 192, iconSize: 154 },
  { name: 'icon-maskable-512.png', size: 512, iconSize: 410 },
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/icon.svg');
  
  // Generate regular icons
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/${name}`);
    console.log(`✓ Generated ${name}`);
  }
  
  // Generate maskable icons (with safe zone padding)
  for (const { name, size, iconSize } of maskableSizes) {
    await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .extend({
        top: (size - iconSize) / 2,
        bottom: (size - iconSize) / 2,
        left: (size - iconSize) / 2,
        right: (size - iconSize) / 2,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(`public/${name}`);
    console.log(`✓ Generated ${name}`);
  }
}

generateIcons().catch(console.error);
```

Run with: `node scripts/generate-icons.js`

### Maskable Icons
Maskable icons need a "safe zone" - the important content should be in the center 80% of the image, with 10% padding on all sides. This ensures the icon looks good on all devices, even when masked to different shapes (circle, squircle, etc.).

### After Generating Icons

1. Place all icon files in the `/public` folder
2. Update `manifest.webmanifest` to reference the new icons:

```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

3. Test the PWA with Chrome DevTools > Application > Manifest

### Testing
- Chrome DevTools > Application > Manifest
- Lighthouse PWA audit
- Test on actual mobile devices (iOS Safari, Android Chrome)

