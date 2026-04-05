import sharp from 'sharp';
import fs from 'fs';

async function processImage() {
  try {
    const inputPath = './public/dental_logo.jpg';
    const outputPath = './public/dental_logo_circle.png';
    
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Zoom in by taking the center part (e.g., 60% of min dimension)
    const size = Math.floor(Math.min(metadata.width, metadata.height) * 0.7); // 70% to zoom in
    
    const cropLeft = Math.floor((metadata.width - size) / 2);
    const cropTop = Math.floor((metadata.height - size) / 2);

    // Create a circular SVG mask
    const circleSvg = Buffer.from(
      `<svg height="${size}" width="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );

    await sharp(inputPath)
      .extract({ left: cropLeft, top: cropTop, width: size, height: size }) // Zoom in by cropping
      .resize(size, size) // Resize if needed
      .composite([{
        input: circleSvg,
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);

    console.log(`Processed logo saved to ${outputPath}`);
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

processImage();
