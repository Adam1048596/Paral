const { createClient } = require('@supabase/supabase-js');

// ⚠️ Use your Supabase SERVICE ROLE key
const supabase = createClient(
  'https://tnhovzsjbsvllaursoit.supabase.co',
  'sb_publishable_MldVnl1DOe93Ih2nTgyxlA_NIQxvjYZ'
);

const BRANDS_URL = 'https://lacdp.ma/wp-json/wp/v2/product_brand?per_page=100';

async function importBrands() {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    console.log(`Fetching brands page ${page}…`);

    const response = await fetch(`${BRANDS_URL}&page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    // Check if the response is actually JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`❌ Page ${page} returned non‑JSON (status ${response.status}):`, text.slice(0, 200));
      break;   // stop if the server returns HTML
    }

    totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
    const brands = await response.json();
    console.log(`  → ${brands.length} brands received`);

    for (const brand of brands) {
      const { error } = await supabase
        .from('brands')
        .upsert({
          id: brand.id,
          name: brand.name,
        }, { onConflict: 'id' });

      if (error) {
        console.error(`Error inserting brand ${brand.id}:`, error.message);
      }
    }

    page++;
  }

  console.log('✅ Brands import complete!');
}

importBrands().catch(console.error);