/**
 * OmniX Engine — QA DOM Checker
 * Bu script projenin DOM yapısını statik veya dinamik olarak analiz eder.
 * 
 * Kullanılan Teknolojiler: Cheerio (Hızlı analiz), Fetch API
 */

const TARGET_URL = process.env.TEST_URL || 'http://localhost:3000';

async function checkDOM() {
  console.log(`[DOM Checker] Analiz ediliyor: ${TARGET_URL}`);

  try {
    const cheerio = await import('cheerio');
    const response = await fetch(TARGET_URL);
    if (!response.ok) {
      throw new Error(`HTTP Hata! Statu: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = {
      title: $('title').text(),
      hasH1: $('h1').length > 0,
      h1Content: $('h1').first().text(),
      mainExists: $('main').length > 0,
      interactiveElements: $('button, a, input').length,
      clerkLoaded: $('script').toArray().some(s => $(s).attr('src')?.includes('clerk')),
      metaDescription: $('meta[name="description"]').attr('content')
    };

    console.log('\n--- DOM Analiz Sonuçları ---');
    console.log(`📌 Başlık: ${results.title}`);
    console.log(`📌 H1 Var mı: ${results.hasH1 ? '✅' : '❌'}`);
    if (results.hasH1) console.log(`   └ İçerik: ${results.h1Content}`);
    console.log(`📌 Main Elementi: ${results.mainExists ? '✅' : '❌'}`);
    console.log(`📌 Etkileşimli Element Sayısı: ${results.interactiveElements}`);
    console.log(`📌 Clerk Entegrasyonu: ${results.clerkLoaded ? '✅' : '❌'}`);
    console.log(`📌 Meta Açıklama: ${results.metaDescription ? '✅' : '❌'}`);

    if (!results.hasH1 || !results.mainExists) {
      console.warn('\n⚠️ UYARI: Kritik DOM elementleri eksik olabilir!');
    } else {
      console.log('\n✨ DOM yapısı temel testlerden başarıyla geçti.');
    }

  } catch (error) {
    console.error(`\n❌ [DOM Checker] Hata: ${error.message}`);
    console.log('💡 İpucu: Projenin yerelde çalıştığından emin olun (npm run dev)');
  }
}

checkDOM();
