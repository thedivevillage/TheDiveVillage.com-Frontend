import fs from 'fs';
import path from 'path';

async function main() {
  console.log('================================================================');
  console.log('TDV SQUARESPACE & CDN DISCOVERY SCRIPT');
  console.log('================================================================\n');

  const targets = [
    'https://thedivevillage.com',
    'https://www.thedivevillage.com',
    'https://thedivevillage.co',
    'https://www.thedivevillage.co',
    'https://tdv-test.mkavs.com'
  ];

  for (const url of targets) {
    try {
      console.log(`\nFetching ${url}...`);
      const res = await fetch(url);
      const text = await res.text();
      console.log(`  Status: ${res.status}`);
      console.log(`  Content-Length: ${text.length}`);
      
      const title = text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title';
      console.log(`  Title: ${title.trim()}`);
      
      // Look for Squarespace signals
      const isSqsp = text.includes('squarespace') || text.includes('sqsp') || text.includes('static1.squarespace.com');
      console.log(`  Squarespace mentions: ${isSqsp}`);

      // Extract all media URLs
      const sqUrls = [...text.matchAll(/https?:\/\/[a-zA-Z0-9\-\.]*(?:squarespace|sqspcdn)[a-zA-Z0-9\-\.\/\_\%\?\=\&]*/gi)].map(m => m[0]);
      console.log(`  Discovered Squarespace URLs: ${sqUrls.length}`);
      if (sqUrls.length > 0) {
        console.log('  Sample Sqsp URLs:', [...new Set(sqUrls)].slice(0, 10));
      }

      const mediaUrls = [...text.matchAll(/https?:\/\/[^\s"\'<>]+\.(?:mp4|webm|mov|m4v)[^\s"\'<>]*/gi)].map(m => m[0]);
      console.log(`  Discovered Video URLs: ${mediaUrls.length}`);
      if (mediaUrls.length > 0) {
        console.log('  Video URLs:', [...new Set(mediaUrls)]);
      }
    } catch (err) {
      console.error(`  Error fetching ${url}:`, err.message);
    }
  }
}

main();
