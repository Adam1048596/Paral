const { createClient } = require('@supabase/supabase-js');

// ⚠️ Replace with your real Supabase SERVICE ROLE key
const supabase = createClient(
  'https://tnhovzsjbsvllaursoit.supabase.co',
  'sb_publishable_MldVnl1DOe93Ih2nTgyxlA_NIQxvjYZ'
);

const BASE_URL = 'https://lacdp.ma/wp-json/wc/store/v1/products';
const PER_PAGE = 100;

async function importAllProducts() {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    console.log(`Fetching page ${page}…`);
    const response = await fetch(`${BASE_URL}?page=${page}&per_page=${PER_PAGE}`);
    totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);

    const products = await response.json();
    console.log(`  → ${products.length} products received`);

    for (const product of products) {
      const minorUnit = product.prices?.currency_minor_unit ?? 2;
      const divisor = Math.pow(10, minorUnit);      // 10^2 = 100 for MAD

      const { error } = await supabase
        .from('catalog')
        .upsert({
          id: product.id,
          name: product.name,
          slug: product.slug,
          permalink: product.permalink,
          description: product.description,
          short_description: product.short_description,
          price: product.prices?.price
            ? parseFloat(product.prices.price) / divisor
            : null,
          regular_price: product.prices?.regular_price
            ? parseFloat(product.prices.regular_price) / divisor
            : null,
          sale_price: product.prices?.sale_price
            ? parseFloat(product.prices.sale_price) / divisor
            : null,
          stock_status: product.stock_availability?.text || 'In Stock',
          images: product.images || [],
          categories: product.categories || [],
          tags: product.tags || [],
          attributes: product.attributes || [],
          raw_data: product,
        }, { onConflict: 'id' });

      if (error) {
        console.error(`Error on product ${product.id}:`, error.message);
      }
    }
    page++;
  }
  console.log('✅ Import complete!');
}

importAllProducts().catch(console.error);