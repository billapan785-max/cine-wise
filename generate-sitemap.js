import fs from 'fs';
import https from 'https';

const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const DOMAIN = 'https://moviebox.shop';

const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`;

console.log('🚀 Fetching movies for sitemap...');

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const movies = JSON.parse(data).results || [];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      xml += `\n  <url><loc>${DOMAIN}/</loc><priority>1.0</priority></url>`;

      movies.forEach(movie => {
        const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        xml += `\n  <url><loc>${DOMAIN}/${slug}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`;
      });

      xml += '\n</urlset>';
      
      if (!fs.existsSync('./public')) fs.mkdirSync('./public');
      fs.writeFileSync('./public/sitemap.xml', xml);
      console.log('✅ Sitemap.xml created successfully!');
    } catch (e) {
      console.error('❌ Error:', e.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('❌ Fetch error:', err.message);
  process.exit(1);
});
