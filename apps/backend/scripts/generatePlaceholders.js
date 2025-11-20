/**
 * Generate simple SVG placeholder images for movie posters
 * These will be used for testing until real images are uploaded
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads/posters');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Color palette
const colors = [
  { bg: '#EF4444', text: '#FFFFFF' }, // Red
  { bg: '#F59E0B', text: '#000000' }, // Orange
  { bg: '#10B981', text: '#FFFFFF' }, // Green
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
  { bg: '#F97316', text: '#000000' }, // Amber
  { bg: '#06B6D4', text: '#000000' }, // Cyan
  { bg: '#84CC16', text: '#000000' }, // Lime
];

// Sample movie titles
const movieTitles = [
  'Inception', 'The Matrix', 'Interstellar', 'The Dark Knight',
  'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Godfather',
  'The Shawshank Redemption', 'Schindler\'s List', 'The Lord of the Rings',
  'Star Wars', 'Jurassic Park', 'Titanic', 'Avatar',
  'Gladiator', 'The Departed', 'The Prestige', 'Memento',
  'Django Unchained', 'Kill Bill', 'The Big Lebowski', 'Blade Runner',
  'Alien', 'Terminator', 'Die Hard', 'Mad Max', 'The Thing',
  'Casablanca', 'Citizen Kane', 'Vertigo', 'Psycho', 'The Third Man'
];

/**
 * Generate a simple SVG poster image
 */
function generatePosterSVG(title, colorIndex) {
  const color = colors[colorIndex % colors.length];
  const width = 500;
  const height = 750;
  
  // Truncate title if too long
  const displayTitle = title.length > 20 ? title.substring(0, 18) + '...' : title;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(color.bg, -20)};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#grad${colorIndex})"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="150" r="80" fill="${color.text}" opacity="0.1"/>
  <circle cx="400" cy="600" r="120" fill="${color.text}" opacity="0.1"/>
  <rect x="-50" y="300" width="200" height="200" fill="${color.text}" opacity="0.05" transform="rotate(45 50 400)"/>
  
  <!-- Film strip decoration -->
  <rect x="20" y="20" width="60" height="60" fill="${color.text}" opacity="0.2" rx="8"/>
  <rect x="30" y="30" width="40" height="40" fill="${color.bg}" opacity="0.5" rx="4"/>
  
  <!-- Title -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="48" 
    font-weight="bold" 
    fill="${color.text}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    filter="url(#shadow)"
  >
    ${escapeXml(displayTitle)}
  </text>
  
  <!-- Subtitle -->
  <text 
    x="50%" 
    y="58%" 
    font-family="Arial, sans-serif" 
    font-size="20" 
    fill="${color.text}" 
    opacity="0.8"
    text-anchor="middle"
  >
    CineZone Placeholder
  </text>
  
  <!-- Film icon -->
  <g transform="translate(220, 620)">
    <rect width="60" height="50" fill="${color.text}" opacity="0.3" rx="4"/>
    <circle cx="20" cy="15" r="8" fill="${color.bg}"/>
    <circle cx="40" cy="15" r="8" fill="${color.bg}"/>
    <circle cx="20" cy="35" r="8" fill="${color.bg}"/>
    <circle cx="40" cy="35" r="8" fill="${color.bg}"/>
  </g>
</svg>`;
}

/**
 * Adjust color brightness
 */
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate all placeholders
 */
function generateAllPlaceholders() {
  console.log('🎬 Generating placeholder movie posters...\n');
  
  let count = 0;
  
  movieTitles.forEach((title, index) => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index + 1}.svg`;
    const filepath = path.join(uploadsDir, filename);
    const svg = generatePosterSVG(title, index);
    
    fs.writeFileSync(filepath, svg);
    console.log(`✓ Generated: ${filename}`);
    count++;
  });
  
  console.log(`\n✅ Successfully generated ${count} placeholder images!`);
  console.log(`📁 Location: ${uploadsDir}`);
  console.log('\nThese SVG files can be used as poster_url in your database.');
  console.log('Example: /uploads/posters/inception-1.svg');
}

// Run the script
try {
  generateAllPlaceholders();
} catch (error) {
  console.error('❌ Error generating placeholders:', error);
  process.exit(1);
}
