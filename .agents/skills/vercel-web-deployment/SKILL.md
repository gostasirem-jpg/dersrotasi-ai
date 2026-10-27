---
name: vercel-web-deployment
description: Next.js web projesini Git ve GitHub ile sürümleyip GitHub'a bağlı Vercel projesi üzerinden production ortamına almak ve her değişikliği güvenli bir güncelleme döngüsüyle canlıya taşımak için kullanılır.
---

# Vercel Web Deployment Kılavuzu

Bu kılavuz, Next.js projelerinin Git ve GitHub kullanılarak sürüm kontrolüne alınması, GitHub'a bağlı Vercel projesi aracılığıyla production ortamına deploy edilmesi ve her geliştirmenin güvenli bir güncelleme döngüsüyle canlıya taşınması için izlenmesi gereken standartları ve kuralları içerir.

---

## 1. Ne Zaman Kullanılır?

Bu yetenek ve kılavuz aşağıdaki durumlarda kullanılır:
- Yeni bir Next.js web projesinin Git sürüm kontrolüne alınması ve GitHub uzak deposunun (repository) oluşturulması gerektiğinde,
- Projenin ilk kez Vercel ile GitHub üzerinden production ortamına bağlanıp deploy edileceği aşamada,
- Geliştirilen yeni özelliklerin, arayüz düzenlemelerinin veya hata düzeltmelerinin production ortamına güvenli ve kontrollü bir şekilde taşınmasında,
- Canlı ortam değişkenlerinin (Environment Variables) yapılandırılması, güncellenmesi veya yönetilmesinde,
- Build (derleme) ve deployment süreçlerinde karşılaşılan hataların çözümlenmesinde.

---

## 2. Proje Varsayımları

Bu kılavuzdaki adımlar ve yönergeler aşağıdaki proje yapısı ve araç seti varsayımlarına dayanır:
- **Framework:** Next.js (App Router mimarisi)
- **Dil:** TypeScript (`.ts`, `.tsx`)
- **Stil & Tasarım:** Tailwind CSS
- **Paket Yöneticisi:** `npm` (paket kurulumları, scriptler ve build adımları npm ile yürütülür)
- **Ana Dal:** `main` (tüm production sürümleri bu daldan beslenir)
- **Uzak Depo:** GitHub `origin`
- **Barındırma & CI/CD Platformu:** Vercel (GitHub deposu ile entegre otomatik deployment)

---

## 3. Agent İçin Kesin Kurallar

Agent'ın bu süreçte uyması zorunlu olan kesin güvenlik ve operasyon kuralları:

1. **Onaysız Git Push Yapılmaz:** Kullanıcıdan net ve açık onay alınmadan asla `git push` komutu çalıştırılamaz.
2. **Yıkıcı Komutlar Kesinlikle Yasaktır:** Proje geçmişini bozan veya yerel değişiklikleri geri dönülemez biçimde silebilecek `git push --force` (veya `-f`), `git reset --hard` ve `git clean -fd` komutları kesinlikle kullanılamaz.
3. **Hassas Veriler ve .env Dosyaları Asla Commit Edilmez:** `.env`, `.env.local`, `.env.production` gibi ortam değişkeni dosyaları ve doğrudan API anahtarları kesinlikle Git'e eklenemez; `.gitignore` dosyasında tanımlı olmalıdır.
4. **Gizli Değişkenlere NEXT_PUBLIC_ Öneki Verilmez:** İstemci (browser) tarafına sızdırılmaması gereken gizli API anahtarları ve sır değişkenler asla `NEXT_PUBLIC_` önekiyle adlandırılamaz; yalnızca sunucu tarafında (Server Components / Route Handlers) erişilecek şekilde yapılandırılır.
5. **Kırık Build ile Commit Yapılmaz:** Yerel ortamda `npm run build` komutu başarıyla sonuçlanmadan (hata kodu 0 olmadan) kesinlikle commit oluşturulamaz ve kod gönderilemez.
6. **Doğrulanmayan Şey "Test Edildi" Denmez:** Bizzat çalıştırılarak veya çıktıları incelenerek teyit edilmemiş hiçbir aşama kullanıcıya "test edildi", "doğrulandı" veya "çalışıyor" olarak beyan edilemez.

---

## 4. İlk Kurulum

Projeyi sıfırdan GitHub ve Vercel üzerine taşırken izlenecek adımlar:

### 4.1. Araç ve Yetkilendirme Kontrolleri
Gerekli araçların kurulu olduğu ve GitHub CLI oturumunun açık olduğu doğrulanır:
```bash
node -v
npm -v
git --version
gh auth status
```
*`gh auth status` komutunun aktif ve geçerli bir hesabı doğruladığından emin olunmalıdır.*

### 4.2. Lint ve Build Kontrolleri
Proje kodunda sözdizimi, tip veya derleme hatası olmadığını doğrulamak için:
```bash
npm run lint
npm run build
```
Bu adımlar hata verirse hatalar giderilmeden Git işlemlerine geçilmez.

### 4.3. GitHub Repository Oluşturma ve İlk Push
Yerel depo ilklendirilir ve GitHub CLI aracılığıyla uzak repo oluşturularak kod aktarılır:
```bash
git init
git add .
git commit -m "feat: proje ilk kurulumu ve temel altyapı"
git branch -M main
gh repo create dersrotasi-ai --public --source=. --remote=origin --push
```

### 4.4. Vercel'de GitHub Repository Import
1. [Vercel Dashboard](https://vercel.com/dashboard) sayfasına gidilir.
2. **"Add New..."** butonuna tıklanıp **"Project"** seçilir.
3. GitHub hesabına bağlı depolar arasından proje seçilerek **"Import"** butonuna basılır.
4. Framework Preset olarak **Next.js** seçildiği kontrol edilir.
5. Gerekli ortam değişkenleri tanımlandıktan sonra **"Deploy"** butonuna basılır.

---

## 5. Zorunlu Güncelleme Döngüsü

Her kod değişikliğinde aşağıdaki 7 adımlı güncelleme döngüsünün eksiksiz uygulanması zorunludur:

1. **Değişikliği Tarif Et:** Yapılan veya yapılacak değişiklik kullanıcıya net bir şekilde açıklanır.
2. **Local Kontrol:** Geliştirmenin yerel geliştirme sunucusunda beklenen davranışı sağladığı kontrol edilir.
3. **`git status` ve `git diff` İncelemesi:**
   - Yalnızca ilgili dosyaların değiştiği `git status` ile teyit edilir.
   - Değiştirilen satırlar `git diff` ile kontrol edilerek gereksiz kod veya hassas veri kalıntısı olmadığı doğrulanır.
4. **`npm run build` ile Derleme Testi:**
   - Yerel ortamda derleme komutu koşturulur:
     ```bash
     npm run build
     ```
   - TypeScript veya Next.js kaynaklı hiçbir hata kalmadığından emin olunur.
5. **`git add`, `git commit` ve `git push`:**
   - Standartlara uygun bir commit mesajıyla değişiklikler kaydedilir:
     ```bash
     git add .
     git commit -m "feat: yeni ders rotasi hesaplama modulu"
     ```
   - Kullanıcıdan onay alındıktan sonra uzak depoya gönderilir:
     ```bash
     git push origin main
     ```
6. **Vercel Otomatik Deployment:**
   - Vercel, `main` dalına yapılan push işlemini otomatik olarak algılar ve build sürecini başlatır. Dashboard üzerinden durum takip edilir.
7. **Production URL'de Doğrulama:**
   - Dağıtım tamamlandıktan sonra Vercel tarafından sağlanan canlı üretim URL'i ziyaret edilerek değişikliğin çalıştığı bizzat test edilir.

---

## 6. Commit Mesajı Biçimi ve Örnekler

Commit mesajları **Conventional Commits** standartlarına göre, küçük harfle ve açık bir dille yazılmalıdır:

### Desteklenen Tipler
- `feat`: Kullanıcıya sunulan yeni bir işlevsellik veya özellik eklendiğinde
- `fix`: Bir hata veya aksaklık düzeltildiğinde
- `style`: Kod çalışma mantığını değiştirmeyen biçimlendirme, CSS, Tailwind veya arayüz düzenlemelerinde
- `docs`: Dokümantasyon, kılavuz veya README dosyalarındaki güncellemelerde
- `refactor`: Hata düzeltmesi veya yeni özellik içermeyen kod yapısı iyileştirmelerinde

### Örnekler
- `feat: yapay zeka ders planlama arayuzu eklendi`
- `fix: mobil cihazlarda navigasyon menusunun kapanmama sorunu giderildi`
- `style: ders kartlarindaki tailwind golgelendirmeleri ve bosluklari duzenlendi`
- `docs: vercel deployment klavuzuna env degiskenleri eklendi`
- `refactor: gemini api istemci cagrilarini yoneten servis modulu sadelestirildi`

---

## 7. Ortam Değişkenleri (Environment Variables)

Projede yapay zeka entegrasyonu ve harici servisler için kullanılan ortam değişkenlerinin yönetimi:

### Kullanılan Değişkenler
- `GEMINI_API_KEY`: Google Gemini API erişim anahtarı (Gizli - Sadece Server Side).
- `GEMINI_MODEL`: Kullanılan yapay zeka modelinin adı (Örn: `gemini-1.5-flash` veya `gemini-1.5-pro`).

### Local Ortamda Yapılandırma (`.env.local`)
- Proje ana dizininde yer alan `.env.local` dosyası içine tanımlanır:
  ```env
  GEMINI_API_KEY=AIzaSy...
  GEMINI_MODEL=gemini-1.5-flash
  ```
- `.env.local` dosyası `.gitignore` içinde yer alır ve asla depoya aktarılmaz.

### Vercel Ortamında Yapılandırma ve Redeploy
1. Vercel üzerinde proje seçilerek **Settings** > **Environment Variables** sekmesine girilir.
2. `GEMINI_API_KEY` ve `GEMINI_MODEL` değişkenleri **Production**, **Preview** ve **Development** ortam kutucukları işaretlenerek eklenir.
3. Değişkenler eklendikten veya güncellendikten sonra değişikliklerin canlıya yansıması için **Redeploy** zorunludur:
   - **Deployments** sekmesine gidilir,
   - En son deployment satırının sağındaki menüden (`...`) **"Redeploy"** seçilir.

---

## 8. Sorun Giderme Tablosu

| Sorun | Olası Neden | Çözüm Adımı |
| :--- | :--- | :--- |
| **Vercel Build Failed (Type Error)** | TypeScript tip uyumsuzlukları veya eksik property'ler | Yerelde `npm run build` çalıştırılarak hata veren satırlar incelenir ve tipler düzeltilir. |
| **500 Server Error (API Çağrılarında)** | `GEMINI_API_KEY` veya model adının tanımlanmamış olması | Vercel Environment Variables kontrol edilir, anahtar girilip Redeploy yapılır. |
| **NEXT_PUBLIC_ Güvenlik Sızıntısı** | Hassas API anahtarına `NEXT_PUBLIC_` öneki verilmesi | Önek kaldırılır, değişken istemciye açılmadan Route Handler üzerinden okunur. |
| **Git Push Reddedildi (Non-fast-forward)** | GitHub'da yerelde bulunmayan yeni commit'ler olması | `git pull --rebase origin main` çalıştırılır, olası çakışmalar çözülüp build alındıktan sonra push edilir. |
| **Tailwind Stilleri Production'da Görünmüyor** | `tailwind.config.js` dosyasında dosya yollarının eksik olması | `content` dizisine `app`, `components` ve ilgili tüm klasör yolları eklenir. |
| **Vercel Yeni Commit'i Deploy Etmiyor** | Commit'in `main` dışında bir dala gönderilmesi veya GitHub webhook kesintisi | `git branch` ile `main` dalında olunduğu teyit edilir, Vercel Git ayarları doğrulanır. |

---

## 9. Teslim Kontrol Listesi

Bir değişiklik canlıya gönderilmeden ve çalışma teslim edilmeden önce aşağıdaki maddelerin tamamı teyit edilmelidir:

- [ ] `.env` veya hassas anahtar içeren hiçbir dosya `git status` listesinde yer almıyor.
- [ ] Gizli sunucu değişkenlerinde `NEXT_PUBLIC_` öneki bulunmuyor.
- [ ] `git diff` ile tüm değişiklikler satır satır denetlendi; gereksiz dosya/kod bulunmuyor.
- [ ] Yerelde `npm run lint` hatasız tamamlandı.
- [ ] Yerelde `npm run build` komutu başarıyla (exit code 0) sonuçlandı.
- [ ] Kullanıcıdan `git push` işlemi için açık onay alındı.
- [ ] `git push origin main` komutu başarıyla tamamlandı.
- [ ] Vercel Dashboard üzerinde derleme ve dağıtım başarıyla sonuçlandı (Ready / Production).
- [ ] Canlı Production URL ziyaret edilerek yapılan değişikliğin sorunsuz çalıştığı doğrulandı.
