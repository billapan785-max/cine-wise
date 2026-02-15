const fs = require('fs');

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const DOMAIN = 'https://moviebox.shop'; // Aapki movie domain

async function generate() {
  console.log('🚀 Generating Sitemap...');
  
  try {
    // Trending movies fetch kar rahe hain sitemap ke links ke liye
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    const movies = data.results || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>`;

    // Har movie ke liye dynamic URL generate ho raha hai
    movies.forEach(movie => {
      const slug = movie.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
        
      xml += `
  <url>
    <loc>${DOMAIN}/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    // Ise 'public' folder mein save kar rahe hain taake build ke baad ye root par show ho
    // Agar public folder nahi hai toh seedha root par save karein
    const dir = './public';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('✅ Sitemap.xml generated successfully in /public folder!');
    
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
  }
}

generate();
