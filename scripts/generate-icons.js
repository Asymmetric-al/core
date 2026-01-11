#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * Uses Sharp (already in dependencies) to create all required icon sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SOURCE_ICON = path.join(PUBLIC_DIR, 'icon.svg');

// Icon configurations
const icons = [
  { name: 'icon-192.png', size: 192, type: 'regular' },
  { name: 'icon-512.png', size: 512, type: 'regular' },
  { name: 'apple-touch-icon.png', size: 180, type: 'regular' },
  { name: 'icon-maskable-192.png', size: 192, iconSize: 154, type: 'maskable' },
  { name: 'icon-maskable-512.png', size: 512, iconSize: 410, type: 'maskable' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    console.error('Please ensure icon.svg exists in the public folder.');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SOURCE_ICON);

  for (const config of icons) {
    const outputPath = path.join(PUBLIC_DIR, config.name);

    try {
      if (config.type === 'regular') {
        // Generate regular icon
        await sharp(svgBuffer)
          .resize(config.size, config.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      } else if (config.type === 'maskable') {
        // Generate maskable icon with safe zone padding
        const padding = (config.size - config.iconSize) / 2;
        
        await sharp(svgBuffer)
          .resize(config.iconSize, config.iconSize, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .extend({
            top: Math.floor(padding),
            bottom: Math.ceil(padding),
            left: Math.floor(padding),
            right: Math.ceil(padding),
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✓ Generated ${config.name} (${config.size}x${config.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${config.name}:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!');
  console.log('\nNext steps:');
  console.log('1. Check the generated icons in the /public folder');
  console.log('2. Update manifest.webmanifest if needed');
  console.log('3. Test with Chrome DevTools > Application > Manifest');
}

// Run the generator
generateIcons().catch((error) => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});

