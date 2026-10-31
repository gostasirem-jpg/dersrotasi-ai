import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const testDizini = path.dirname(fileURLToPath(import.meta.url));

// Mevcut TypeScript derleyicisiyle yalıtılmış modüller; ortam dosyası veya gerçek API kullanılmaz.
function moduller({ env = {}, fetch = () => { throw new Error('Ağ yok'); }, hizliZamanAsimi = false } = {}) {
  const cache = new Map();
  function yukle(dosya) {
    const mutlak = path.resolve(testDizini, '..', dosya);
    if (cache.has(mutlak)) return cache.get(mutlak).exports;
    const kayit = { exports: {} };
    cache.set(mutlak, kayit);
    const kod = ts.transpileModule(fs.readFileSync(mutlak, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const yerelRequire = (ad) => {
      const hedef = ad.startsWith('@/') ? path.resolve(testDizini, '../src', ad.slice(2)) : path.resolve(path.dirname(mutlak), ad);
      return yukle(`${hedef}.ts`);
    };
    vm.runInNewContext(`(function(require, module, exports) { ${kod}\n})`, {
      process: { env }, fetch, Response, Request, Buffer, AbortController,
      setTimeout: (fn, ms) => setTimeout(fn, hizliZamanAsimi ? 0 : ms), clearTimeout,
    })(yerelRequire, kayit, kayit.exports);
    return kayit.exports;
  }
  return yukle;
}

function ozet() {
  return { bugun: '2026-10-31', gunlukSaat: 1, dersler: [{ ad: 'Matematik', zorluk: 5 }], gorevler: [
    { dersIndex: 0, baslik: 'Yakın sınav', tur: 'sinav', sonTarih: '2026-11-02', tahminiSaat: 8 },
    { dersIndex: 0, baslik: 'Gecikmiş ödev', tur: 'odev', sonTarih: '2026-10-30', tahminiSaat: 2 },
  ] };
}
function istek(veri = { ozet: ozet() }) {
  return new Request('http://localhost/api/asistan', { method: 'POST', body: JSON.stringify(veri) });
}

test('Kurallar: yakın sınav ilk, gecikme, zorluk, kapasite ve 4–8 madde', () => {
  const { kuralTabanliOneri } = moduller()('src/lib/kuralTabanliOneri.ts');
  const veri = ozet();
  const once = JSON.stringify(veri);
  const metin = kuralTabanliOneri(veri);
  assert.match(metin.split('\n')[0], /Yakın sınav/);
  for (const kural of [/son tarihi geçmiş/, /ilk çalışma bloğuna/, /süreyi aşıyor/]) assert.match(metin, kural);
  assert.ok(metin.split('\n').length >= 4 && metin.split('\n').length <= 8);
  assert.equal(JSON.stringify(veri), once);
  assert.equal(kuralTabanliOneri(veri), metin);
  veri.gorevler = [];
  assert.match(kuralTabanliOneri(veri), /görev yok/);
  assert.ok(kuralTabanliOneri(veri).split('\n').length >= 4);
});

test('Doğrulama: uzun soru, fazla ders/görev, geçersiz tarih ve bağlantı 400', async () => {
  const { POST } = moduller()('src/app/api/asistan/route.ts');
  const bozuklar = [null, {}, { soru: 'a'.repeat(501), ozet: ozet() }];
  for (const degistir of [
    (o) => { o.dersler = Array(31).fill(o.dersler[0]); },
    (o) => { o.gorevler = Array(101).fill(o.gorevler[0]); },
    (o) => { o.gorevler[0].sonTarih = '2026-02-30'; },
    (o) => { o.gorevler[0].dersIndex = 9; },
    (o) => { o.gunlukSaat = -1; },
  ]) { const o = ozet(); degistir(o); bozuklar.push({ ozet: o }); }
  for (const veri of bozuklar) assert.equal((await POST(istek(veri))).status, 400);
  assert.equal((await POST(new Request('http://localhost', { method: 'POST', body: '{' }))).status, 400);
  assert.equal((await POST(new Request('http://localhost', { method: 'POST', body: 'x'.repeat(131073) }))).status, 400);
});

test('Eksik yapılandırma ve sağlayıcı hatalarında HTTP 200 kural yanıtı', async () => {
  for (const ayar of [
    {},
    { env: { GEMINI_API_KEY: 'test-secret' }, fetch: async () => new Response('test-secret', { status: 429 }) },
    { env: { GEMINI_API_KEY: 'test-secret' }, fetch: async () => new Response('', { status: 503 }) },
    { env: { GEMINI_API_KEY: 'test-secret' }, fetch: async () => { throw new Error('test-secret'); } },
    { env: { GEMINI_API_KEY: 'test-secret' }, fetch: async () => Response.json({ candidates: [] }) },
    { env: { GEMINI_API_KEY: 'test-secret' }, hizliZamanAsimi: true, fetch: (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('test-secret')))) },
  ]) {
    const { POST } = moduller(ayar)('src/app/api/asistan/route.ts');
    const cevap = await POST(istek());
    assert.equal(cevap.status, 200);
    const veri = await cevap.json();
    assert.equal(veri.kaynak, 'kural');
    assert.ok(veri.uyari);
    assert.ok(!JSON.stringify(veri).includes('test-secret'));
    if (ayar.hizliZamanAsimi) assert.match(veri.uyari, /20 saniye/);
  }
});

test('Gemini REST başlığı, varsayılan/özel model, özet temizleme ve gizli yanıt engeli', async () => {
  for (const model of [undefined, 'ozel-model']) {
    let gizliYanit = false;
    const { POST } = moduller({ env: { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: model }, fetch: async (url, init) => {
      assert.ok(url.endsWith(`${model || 'gemini-3.8-flash'}:generateContent`));
      assert.ok(!url.includes('test-secret'));
      assert.equal(init.headers['x-goog-api-key'], 'test-secret');
      const govde = JSON.parse(init.body);
      assert.ok(govde.systemInstruction.parts[0].text.includes('en fazla 8 madde'));
      assert.ok(!JSON.stringify(govde).includes('KİŞİSEL'));
      return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: gizliYanit ? 'test-secret' : '- İlk öneri' }] } }] });
    } })('src/app/api/asistan/route.ts');
    const veri = { soru: 'Plan?', ozet: { ...ozet(), eposta: 'KİŞİSEL' } };
    const cevap = await POST(istek(veri));
    assert.equal((await cevap.json()).kaynak, 'gemini');
    gizliYanit = true;
    const yedek = await (await POST(istek())).json();
    assert.equal(yedek.kaynak, 'kural');
    assert.ok(!JSON.stringify(yedek).includes('test-secret'));
  }
});
