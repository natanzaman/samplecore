const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Product image mappings - creating stylish SVG placeholders
const productImages = {
  'Denim Jacket X': {
    baseColor: '#1e3a5f',
    accentColor: '#4a90e2',
    type: 'jacket'
  },
  'Silk Blouse Premium': {
    baseColor: '#f5f5dc',
    accentColor: '#d4af37',
    type: 'blouse'
  },
  'Wool Coat Classic': {
    baseColor: '#2c2c2c',
    accentColor: '#8b7355',
    type: 'coat'
  },
  'Cotton T-Shirt Essential': {
    baseColor: '#ffffff',
    accentColor: '#333333',
    type: 'tshirt'
  },
  'Leather Jacket Classic': {
    baseColor: '#3d2817',
    accentColor: '#8b4513',
    type: 'jacket'
  }
};

// Generate multiple SVG images for each product with various views
Object.entries(productImages).forEach(([productName, config]) => {
  const baseSlug = productName.toLowerCase().replace(/\s+/g, '-');
  
  // Generate 8-10 images per product with different views and angles
  const views = [
    { view: 'front', variant: 1 },
    { view: 'back', variant: 2 },
    { view: 'detail', variant: 3 },
    { view: 'side', variant: 4 },
    { view: 'angle', variant: 5 },
    { view: 'closeup', variant: 6 },
    { view: 'texture', variant: 7 },
    { view: 'styling', variant: 8 }
  ];
  
  views.forEach(({ view, variant }) => {
    const svg = generateFashionSVG(productName, config, view, variant);
    const filename = `${baseSlug}-${view}-${variant}.svg`;
    const filepath = path.join(imagesDir, filename);
    fs.writeFileSync(filepath, svg);
    console.log(`Generated: ${filename}`);
  });
});

function generateFashionSVG(name, { baseColor, accentColor, type }, view = 'front', variant = 1) {
  const width = 800;
  const height = 1000;
  
  let shape = '';
  const rotation = view === 'back' ? 180 : view === 'side' ? 90 : 0;
  const detailMode = view === 'detail';
  
  switch(type) {
    case 'jacket':
      if (view === 'back') {
        shape = `
          <rect x="200" y="100" width="400" height="700" rx="20" fill="${baseColor}" opacity="0.9"/>
          <rect x="150" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <rect x="550" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <rect x="250" y="600" width="300" height="200" rx="10" fill="${accentColor}" opacity="0.3"/>
          <rect x="350" y="150" width="100" height="150" rx="10" fill="${accentColor}" opacity="0.4"/>
        `;
      } else if (view === 'detail') {
        shape = `
          <rect x="250" y="200" width="300" height="400" rx="15" fill="${baseColor}" opacity="0.9"/>
          <circle cx="400" cy="300" r="40" fill="${accentColor}" opacity="0.5"/>
          <rect x="300" y="350" width="200" height="8" rx="4" fill="${accentColor}"/>
          <rect x="320" y="420" width="160" height="6" rx="3" fill="${accentColor}" opacity="0.7"/>
        `;
      } else if (view === 'side') {
        shape = `
          <ellipse cx="400" cy="400" rx="150" ry="500" fill="${baseColor}" opacity="0.9"/>
          <path d="M 250 300 Q 200 400 250 600 L 280 800 L 520 800 L 550 600 Q 600 400 550 300" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="3"/>
        `;
      } else if (view === 'angle') {
        shape = `
          <rect x="150" y="150" width="500" height="700" rx="25" fill="${baseColor}" opacity="0.85" transform="rotate(-15 400 500)"/>
          <rect x="100" y="120" width="100" height="280" rx="15" fill="${baseColor}" opacity="0.75" transform="rotate(-15 150 260)"/>
          <rect x="600" y="120" width="100" height="280" rx="15" fill="${baseColor}" opacity="0.75" transform="rotate(15 650 260)"/>
          <line x1="400" y1="150" x2="400" y2="850" stroke="${accentColor}" stroke-width="3" transform="rotate(-15 400 500)"/>
        `;
      } else if (view === 'closeup') {
        shape = `
          <rect x="300" y="250" width="200" height="300" rx="15" fill="${baseColor}" opacity="0.95"/>
          <circle cx="400" cy="350" r="25" fill="${accentColor}" opacity="0.6"/>
          <rect x="350" y="400" width="100" height="6" rx="3" fill="${accentColor}"/>
          <rect x="360" y="450" width="80" height="4" rx="2" fill="${accentColor}" opacity="0.8"/>
          <rect x="370" y="480" width="60" height="4" rx="2" fill="${accentColor}" opacity="0.6"/>
        `;
      } else if (view === 'texture') {
        shape = `
          <rect x="200" y="200" width="400" height="600" rx="20" fill="${baseColor}" opacity="0.9"/>
          <circle cx="300" cy="300" r="8" fill="${accentColor}" opacity="0.4"/>
          <circle cx="500" cy="300" r="8" fill="${accentColor}" opacity="0.4"/>
          <circle cx="350" cy="400" r="6" fill="${accentColor}" opacity="0.3"/>
          <circle cx="450" cy="400" r="6" fill="${accentColor}" opacity="0.3"/>
          <circle cx="400" cy="500" r="10" fill="${accentColor}" opacity="0.5"/>
          <circle cx="320" cy="600" r="7" fill="${accentColor}" opacity="0.4"/>
          <circle cx="480" cy="600" r="7" fill="${accentColor}" opacity="0.4"/>
          <rect x="250" y="650" width="300" height="100" rx="10" fill="${accentColor}" opacity="0.2"/>
        `;
      } else if (view === 'styling') {
        shape = `
          <rect x="200" y="100" width="400" height="700" rx="20" fill="${baseColor}" opacity="0.9"/>
          <rect x="150" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <rect x="550" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="100" x2="400" y2="800" stroke="${accentColor}" stroke-width="3"/>
          <circle cx="300" cy="200" r="15" fill="${accentColor}"/>
          <circle cx="500" cy="200" r="15" fill="${accentColor}"/>
          <rect x="250" y="600" width="300" height="200" rx="10" fill="${accentColor}" opacity="0.3"/>
          <ellipse cx="400" cy="100" rx="120" ry="40" fill="${accentColor}" opacity="0.2"/>
        `;
      } else {
        shape = `
          <rect x="200" y="100" width="400" height="700" rx="20" fill="${baseColor}" opacity="0.9"/>
          <rect x="150" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <rect x="550" y="100" width="100" height="300" rx="15" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="100" x2="400" y2="800" stroke="${accentColor}" stroke-width="3"/>
          <circle cx="300" cy="200" r="15" fill="${accentColor}"/>
          <circle cx="500" cy="200" r="15" fill="${accentColor}"/>
          <rect x="250" y="600" width="300" height="200" rx="10" fill="${accentColor}" opacity="0.3"/>
        `;
      }
      break;
    case 'blouse':
      if (view === 'back') {
        shape = `
          <ellipse cx="400" cy="200" rx="180" ry="150" fill="${baseColor}" opacity="0.9"/>
          <path d="M 220 200 Q 200 300 220 500 L 250 700 L 350 750 L 450 750 L 550 700 L 580 500 Q 600 300 580 200" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <rect x="300" y="200" width="200" height="100" rx="10" fill="${accentColor}" opacity="0.3"/>
        `;
      } else if (view === 'detail') {
        shape = `
          <ellipse cx="400" cy="300" rx="200" ry="250" fill="${baseColor}" opacity="0.9"/>
          <circle cx="400" cy="250" r="30" fill="${accentColor}" opacity="0.4"/>
          <path d="M 300 350 Q 400 400 500 350" stroke="${accentColor}" stroke-width="3" fill="none"/>
        `;
      } else if (view === 'side') {
        shape = `
          <ellipse cx="400" cy="400" rx="120" ry="400" fill="${baseColor}" opacity="0.9"/>
          <path d="M 280 200 Q 250 400 280 700" stroke="${accentColor}" stroke-width="3" fill="none"/>
        `;
      } else if (view === 'angle') {
        shape = `
          <ellipse cx="400" cy="200" rx="200" ry="160" fill="${baseColor}" opacity="0.85" transform="rotate(-20 400 200)"/>
          <path d="M 200 200 Q 180 350 220 550 L 280 750 L 380 780 L 480 750 L 540 550 Q 580 350 560 200" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2" transform="rotate(-20 400 400)"/>
        `;
      } else if (view === 'closeup') {
        shape = `
          <ellipse cx="400" cy="350" rx="180" ry="200" fill="${baseColor}" opacity="0.95"/>
          <circle cx="400" cy="300" r="35" fill="${accentColor}" opacity="0.5"/>
          <path d="M 350 350 Q 400 380 450 350" stroke="${accentColor}" stroke-width="3" fill="none"/>
          <circle cx="380" cy="400" r="5" fill="${accentColor}" opacity="0.6"/>
          <circle cx="420" cy="400" r="5" fill="${accentColor}" opacity="0.6"/>
        `;
      } else if (view === 'texture') {
        shape = `
          <ellipse cx="400" cy="200" rx="180" ry="150" fill="${baseColor}" opacity="0.9"/>
          <path d="M 220 200 Q 200 300 220 500 L 250 700 L 350 750 L 450 750 L 550 700 L 580 500 Q 600 300 580 200" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <circle cx="320" cy="300" r="4" fill="${accentColor}" opacity="0.5"/>
          <circle cx="480" cy="300" r="4" fill="${accentColor}" opacity="0.5"/>
          <circle cx="360" cy="400" r="3" fill="${accentColor}" opacity="0.4"/>
          <circle cx="440" cy="400" r="3" fill="${accentColor}" opacity="0.4"/>
          <circle cx="400" cy="500" r="5" fill="${accentColor}" opacity="0.6"/>
        `;
      } else if (view === 'styling') {
        shape = `
          <ellipse cx="400" cy="200" rx="180" ry="150" fill="${baseColor}" opacity="0.9"/>
          <path d="M 220 200 Q 200 300 220 500 L 250 700 L 350 750 L 450 750 L 550 700 L 580 500 Q 600 300 580 200" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <circle cx="350" cy="250" r="8" fill="${accentColor}"/>
          <circle cx="450" cy="250" r="8" fill="${accentColor}"/>
          <path d="M 350 300 Q 400 350 450 300" stroke="${accentColor}" stroke-width="2" fill="none"/>
          <rect x="300" y="600" width="200" height="100" rx="10" fill="${accentColor}" opacity="0.2"/>
        `;
      } else {
        shape = `
          <ellipse cx="400" cy="200" rx="180" ry="150" fill="${baseColor}" opacity="0.9"/>
          <path d="M 220 200 Q 200 300 220 500 L 250 700 L 350 750 L 450 750 L 550 700 L 580 500 Q 600 300 580 200" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <circle cx="350" cy="250" r="8" fill="${accentColor}"/>
          <circle cx="450" cy="250" r="8" fill="${accentColor}"/>
          <path d="M 350 300 Q 400 350 450 300" stroke="${accentColor}" stroke-width="2" fill="none"/>
        `;
      }
      break;
    case 'coat':
      if (view === 'back') {
        shape = `
          <rect x="150" y="80" width="500" height="850" rx="25" fill="${baseColor}" opacity="0.9"/>
          <rect x="100" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <rect x="580" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="80" x2="400" y2="930" stroke="${accentColor}" stroke-width="4"/>
          <rect x="300" y="200" width="200" height="200" rx="15" fill="${accentColor}" opacity="0.3"/>
        `;
      } else if (view === 'detail') {
        shape = `
          <rect x="200" y="250" width="400" height="500" rx="20" fill="${baseColor}" opacity="0.9"/>
          <circle cx="400" cy="350" r="50" fill="${accentColor}" opacity="0.4"/>
          <rect x="300" y="450" width="200" height="10" rx="5" fill="${accentColor}"/>
        `;
      } else if (view === 'side') {
        shape = `
          <ellipse cx="400" cy="450" rx="180" ry="500" fill="${baseColor}" opacity="0.9"/>
          <path d="M 220 200 Q 200 450 220 800" stroke="${accentColor}" stroke-width="4" fill="none"/>
        `;
      } else if (view === 'angle') {
        shape = `
          <rect x="100" y="100" width="600" height="850" rx="30" fill="${baseColor}" opacity="0.85" transform="rotate(-12 400 525)"/>
          <rect x="50" y="80" width="140" height="420" rx="25" fill="${baseColor}" opacity="0.75" transform="rotate(-12 120 290)"/>
          <rect x="610" y="80" width="140" height="420" rx="25" fill="${baseColor}" opacity="0.75" transform="rotate(12 680 290)"/>
          <line x1="400" y1="100" x2="400" y2="950" stroke="${accentColor}" stroke-width="4" transform="rotate(-12 400 525)"/>
        `;
      } else if (view === 'closeup') {
        shape = `
          <rect x="250" y="300" width="300" height="400" rx="20" fill="${baseColor}" opacity="0.95"/>
          <circle cx="400" cy="400" r="60" fill="${accentColor}" opacity="0.4"/>
          <rect x="350" y="500" width="100" height="12" rx="6" fill="${accentColor}"/>
          <rect x="360" y="550" width="80" height="8" rx="4" fill="${accentColor}" opacity="0.8"/>
        `;
      } else if (view === 'texture') {
        shape = `
          <rect x="150" y="80" width="500" height="850" rx="25" fill="${baseColor}" opacity="0.9"/>
          <rect x="100" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <rect x="580" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="80" x2="400" y2="930" stroke="${accentColor}" stroke-width="4"/>
          <circle cx="300" cy="250" r="6" fill="${accentColor}" opacity="0.5"/>
          <circle cx="500" cy="250" r="6" fill="${accentColor}" opacity="0.5"/>
          <circle cx="350" cy="400" r="5" fill="${accentColor}" opacity="0.4"/>
          <circle cx="450" cy="400" r="5" fill="${accentColor}" opacity="0.4"/>
          <circle cx="400" cy="600" r="8" fill="${accentColor}" opacity="0.6"/>
        `;
      } else if (view === 'styling') {
        shape = `
          <rect x="150" y="80" width="500" height="850" rx="25" fill="${baseColor}" opacity="0.9"/>
          <rect x="100" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <rect x="580" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="80" x2="400" y2="930" stroke="${accentColor}" stroke-width="4"/>
          <rect x="250" y="200" width="300" height="150" rx="15" fill="${accentColor}" opacity="0.2"/>
          <circle cx="300" cy="180" r="12" fill="${accentColor}"/>
          <circle cx="500" cy="180" r="12" fill="${accentColor}"/>
          <rect x="200" y="700" width="400" height="200" rx="15" fill="${accentColor}" opacity="0.3"/>
          <ellipse cx="400" cy="80" rx="150" ry="50" fill="${accentColor}" opacity="0.25"/>
        `;
      } else {
        shape = `
          <rect x="150" y="80" width="500" height="850" rx="25" fill="${baseColor}" opacity="0.9"/>
          <rect x="100" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <rect x="580" y="80" width="120" height="400" rx="20" fill="${baseColor}" opacity="0.8"/>
          <line x1="400" y1="80" x2="400" y2="930" stroke="${accentColor}" stroke-width="4"/>
          <rect x="250" y="200" width="300" height="150" rx="15" fill="${accentColor}" opacity="0.2"/>
          <circle cx="300" cy="180" r="12" fill="${accentColor}"/>
          <circle cx="500" cy="180" r="12" fill="${accentColor}"/>
          <rect x="200" y="700" width="400" height="200" rx="15" fill="${accentColor}" opacity="0.3"/>
        `;
      }
      break;
    case 'tshirt':
      if (view === 'back') {
        shape = `
          <ellipse cx="400" cy="180" rx="200" ry="120" fill="${baseColor}" opacity="0.9"/>
          <path d="M 200 180 Q 180 280 200 450 L 250 700 L 350 750 L 450 750 L 550 700 L 600 450 Q 620 280 600 180" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <rect x="150" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <rect x="570" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <rect x="300" y="300" width="200" height="150" rx="10" fill="${accentColor}" opacity="0.3"/>
        `;
      } else if (view === 'detail') {
        shape = `
          <ellipse cx="400" cy="300" rx="250" ry="200" fill="${baseColor}" opacity="0.9"/>
          <circle cx="400" cy="250" r="40" fill="${accentColor}" opacity="0.4"/>
          <rect x="300" y="350" width="200" height="8" rx="4" fill="${accentColor}"/>
        `;
      } else if (view === 'side') {
        shape = `
          <ellipse cx="400" cy="400" rx="150" ry="400" fill="${baseColor}" opacity="0.9"/>
          <path d="M 250 200 Q 200 400 250 700" stroke="${accentColor}" stroke-width="3" fill="none"/>
        `;
      } else if (view === 'angle') {
        shape = `
          <ellipse cx="400" cy="180" rx="220" ry="140" fill="${baseColor}" opacity="0.85" transform="rotate(-18 400 180)"/>
          <path d="M 180 180 Q 160 300 200 480 L 260 720 L 360 760 L 440 720 L 500 480 Q 540 300 520 180" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2" transform="rotate(-18 400 400)"/>
        `;
      } else if (view === 'closeup') {
        shape = `
          <ellipse cx="400" cy="350" rx="220" ry="220" fill="${baseColor}" opacity="0.95"/>
          <circle cx="400" cy="300" r="45" fill="${accentColor}" opacity="0.4"/>
          <rect x="320" y="400" width="160" height="10" rx="5" fill="${accentColor}"/>
          <circle cx="380" cy="450" r="6" fill="${accentColor}" opacity="0.6"/>
          <circle cx="420" cy="450" r="6" fill="${accentColor}" opacity="0.6"/>
        `;
      } else if (view === 'texture') {
        shape = `
          <ellipse cx="400" cy="180" rx="200" ry="120" fill="${baseColor}" opacity="0.9"/>
          <path d="M 200 180 Q 180 280 200 450 L 250 700 L 350 750 L 450 750 L 550 700 L 600 450 Q 620 280 600 180" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <rect x="150" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <rect x="570" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <circle cx="330" cy="300" r="4" fill="${accentColor}" opacity="0.5"/>
          <circle cx="470" cy="300" r="4" fill="${accentColor}" opacity="0.5"/>
          <circle cx="380" cy="450" r="3" fill="${accentColor}" opacity="0.4"/>
          <circle cx="420" cy="450" r="3" fill="${accentColor}" opacity="0.4"/>
        `;
      } else if (view === 'styling') {
        shape = `
          <ellipse cx="400" cy="180" rx="200" ry="120" fill="${baseColor}" opacity="0.9"/>
          <path d="M 200 180 Q 180 280 200 450 L 250 700 L 350 750 L 450 750 L 550 700 L 600 450 Q 620 280 600 180" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <rect x="150" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <rect x="570" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <circle cx="350" cy="220" r="6" fill="${accentColor}"/>
          <circle cx="450" cy="220" r="6" fill="${accentColor}"/>
          <rect x="300" y="600" width="200" height="120" rx="10" fill="${accentColor}" opacity="0.25"/>
        `;
      } else {
        shape = `
          <ellipse cx="400" cy="180" rx="200" ry="120" fill="${baseColor}" opacity="0.9"/>
          <path d="M 200 180 Q 180 280 200 450 L 250 700 L 350 750 L 450 750 L 550 700 L 600 450 Q 620 280 600 180" 
                fill="${baseColor}" opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
          <rect x="150" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <rect x="570" y="200" width="80" height="300" rx="10" fill="${baseColor}" opacity="0.7"/>
          <circle cx="350" cy="220" r="6" fill="${accentColor}"/>
          <circle cx="450" cy="220" r="6" fill="${accentColor}"/>
        `;
      }
      break;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${baseColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.7" />
    </linearGradient>
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)" opacity="0.1"/>
  ${shape}
  <text x="${width/2}" y="${height - 50}" font-family="Arial, sans-serif" font-size="24" 
        font-weight="bold" fill="${accentColor}" text-anchor="middle" opacity="0.8">${name} - ${view}</text>
</svg>`;
}

console.log('✅ Mock images generated successfully!');
