import fs from 'fs';
import https from 'https';

const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const DOMAIN = 'https://moviebox.shop';

// Function jo TMDB se data layega
const fetchMovies = (page) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(JSON.parse(data).results || []));
    }).on('error', reject);
  });
};

async function generate() {
  console.log('🚀 Fetching 100 movies for sitemap...');
  try {
    let allMovies = [];
    // Page 1 se 5 tak fetch karega (Total 100 movies)
    for (let i = 1; i <= 5; i++) {
      const movies = await fetchMovies(i);
      allMovies = [...allMovies, ...movies];
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    xml += `\n  <url><loc>${DOMAIN}/</loc><priority>1.0</priority></url>`;

    allMovies.forEach(movie => {
      if (movie.title) {
        // Slug waisa hi rakha hai jaisa App.tsx mein hai
        const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        xml += `\n  <url><loc>${DOMAIN}/${slug}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`;
      }
    });

    xml += '\n</urlset>';
    
    // File save karna
    if (!fs.existsSync('./public')) fs.mkdirSync('./public');
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('✅ Sitemap.xml with 100+ movies created!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

generate();
