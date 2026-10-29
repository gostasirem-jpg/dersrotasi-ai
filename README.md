# DersRotası AI — Akıllı Ders Planlayıcısı

Üniversite öğrencilerinin derslerini, sınavlarını ve ödevlerini tek yerde toplayıp kişiye özel, günlere bölünmüş bir çalışma programı oluşturan web uygulaması.

> YZO 205 Operasyonel Yapay Zekâ dersi — Assignment 1 kapsamında geliştirilmiştir.

**Canlı site:** https://dersrotasi-ai.vercel.app

## Amaç

Öğrencinin en sık sorduğu soruya cevap vermek: **"Bugün hangi derse kaç dakika çalışmalıyım?"**

Sistem üç bilgiyi birleştirir:

1. Öğrencinin günlük ayırabildiği çalışma süresi
2. Görevlerin son tarihleri (aciliyet)
3. Derslerin zorluk seviyesi

Bu bilgilerden her göreve bir öncelik puanı verir ve süreyi bu puanlarla orantılı olarak günlere dağıtır.

## Hedef kullanıcı

- Dönem içinde birden fazla ders alan ve sınav haftalarında zamanını planlamakta zorlanan lisans öğrencileri
- Çalışma alışkanlığını düzenlemek ve takip etmek isteyen öğrenciler

## Özellikler

| Özellik | Durum |
|---|---|
| Ders ekleme, düzenleme, silme ve zorluk seviyesi (1-5) | ✅ |
| Ödev, sınav, proje ve quiz ekleme; son tarih ve kalan gün takibi | ✅ |
| Kural tabanlı öncelik algoritması (açıklamalı puan dökümü) | ✅ |
| 7 günlük akıllı çalışma planı (25-50 dk bloklar, tamamlama, süre değiştirme, güne taşıma) | ✅ |
| Kapasite uyarıları (süre son tarihe yetmiyorsa uyarı) | ✅ |
| Panel: bugünkü hedef, yaklaşan görevler, ders ilerlemesi | ✅ |
| İstatistikler: son 7 gün grafiği, derslere ayrılan zaman, görev türleri | ✅ |
| Açık / koyu tema, masaüstü ve mobil uyumlu arayüz | ✅ |
| Takvim görünümü | Planlanıyor |
| Gemini destekli çalışma asistanı | Planlanıyor |

Paneldeki ve istatistiklerdeki tüm sayılar kullanıcının kendi verilerinden hesaplanır; sabit veya örnek istatistik gösterilmez.

## Öncelik algoritması

Plan oluşturma **kural tabanlı** bir algoritmayla yapılır; bu kısımda yapay zekâ kullanılmaz. Her kararın gerekçesi arayüzde gösterilir.

```
öncelik = zorlukPuanı + aciliyetPuanı + türPuanı      (0-100)

zorlukPuanı   = (zorluk / 5) × 30
aciliyetPuanı = max(0, 1 − kalanGün / 14) × 50        (gecikmiş görev: 50)
türPuanı      = ağırlık × 20   (sınav 1.0 · proje 0.8 · ödev 0.6 · quiz 0.5)
```

Örnek: zorluk 4, 3 gün kalmış bir sınav → 24 + 39,3 + 20 = **83 puan**.
Algoritma, sonuçları önceden elle hesaplanmış kabul testleriyle doğrulanmıştır.

Planlayıcı kuralları:

- Günlük süre, görevlere öncelik puanlarıyla orantılı dağıtılır.
- Bloklar 5'in katı, en az 25 ve en fazla 50 dakikadır.
- O gün tamamlanmış bloklar günlük kapasiteden düşülür; hedef aşılmaz.
- Bir görev son tarihinden sonraki günlere planlanmaz.

## Kullanılan teknolojiler

- **Next.js 16** (App Router, Turbopack) ve **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** (ikonlar)
- **LocalStorage** (veriler kullanıcının tarayıcısında saklanır)
- **Vercel** (yayınlama)

## Geliştirme süreci

- **AI coding agent'lar:**
  - **Google Antigravity** (Gemini 3.8 Flash ve Claude Sonnet 4.6 modelleri, *Request Review* modunda): iskelet, veri katmanı, ders/görev yönetimi, öncelik algoritması, akıllı plan, panel ve istatistikler
  - **OpenAI Codex** (VS Code eklentisi, GPT-6.1 Sol modeli, *Ask for approval* modunda): planlayıcı blok ve kapasite kuralları. Antigravity'nin ücretsiz kotası dolduğu için ödevde izin verilen ikinci agent'a geçildi.
- Her terminal komutu ve dosya değişikliği öğrenci onayıyla çalıştırıldı.
- **Sürüm kontrolü:** Git ve GitHub CLI
- **Doğrulama:** Her değişiklikten sonra `npm run lint`, `npm run build` ve tarayıcıda masaüstü/mobil (360, 768, 1280 px) testleri. Agent raporları bağımsız olarak kontrol edildi; agent'ların gözden kaçırdığı hatalar (lint hatası, metadata kaybı, yanlış yapay zekâ iddiaları, blok kuralı ihlali) testlerde yakalanıp düzeltildi.
- **Deployment kuralları:** [`.agents/skills/vercel-web-deployment/SKILL.md`](.agents/skills/vercel-web-deployment/SKILL.md)
- Planlama ve öğrenme sürecinde ayrıca Claude'dan rehberlik alındı.

### İlk production deployment'tan sonra yapılan iyileştirmeler

| # | Commit | Yapan |
|---|---|---|
| 1 | `feat: gerçek verilerle panel ve istatistik ekranları` | Antigravity |
| 2 | `fix: istatistik grafiğinin ölçeklenmesini düzelt ve sütun değerlerini göster` | Antigravity |
| 3 | `feat: planlayıcıda 25-50 dk blok kuralı ve günlük kapasite kontrolü` | Codex |
| — | `fix: tanıtım sayfasındaki yapay zekâ iddiasını ve tekrarlanan başlığı düzelt` | Öğrenci (manuel) |

Her iyileştirme ayrı commit olarak GitHub'a gönderildi ve Vercel'in canlı siteyi otomatik olarak güncellediği doğrulandı.

## Local'de çalıştırma

Gereksinim: [Node.js](https://nodejs.org) LTS sürümü (geliştirmede v24 kullanıldı).

```bash
git clone https://github.com/gostasirem-jpg/dersrotasi-ai.git
cd dersrotasi-ai
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

Diğer komutlar:

```bash
npm run lint    # kod kalite kontrolü
npm run build   # production derlemesi
```

## Veri ve gizlilik

- Tüm ders ve görev verileri **yalnızca kullanıcının kendi tarayıcısında** (LocalStorage) saklanır; sunucuya gönderilmez.
- Veriler cihazlar arasında senkronize edilmez; farklı bir tarayıcıda veya cihazda liste boş görünür.
- Sitedeki örnek dersler ve görevler tanıtım amaçlıdır ve arayüzde "örnek" olarak işaretlenmiştir.