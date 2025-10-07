# 🐛 BugEra AIScout

**AI destekli otomatik test senaryosu üretim platformu**

BugEra AIScout, web uygulamalarınızı Playwright ile analiz ederek DOM bileşenlerini çıkarır ve Hugging Face AI modelleri kullanarak otomatik test senaryoları üretir.

---

## 🚀 Hızlı Başlangıç

### 1️⃣ İlk Kurulum

```bash
npm run setup
```

Bu komut otomatik olarak:
- ✅ Frontend bağımlılıklarını yükler
- ✅ Backend bağımlılıklarını yükler
- ✅ Playwright Chromium browser'ı kurar

### 2️⃣ Projeyi Çalıştır

```bash
npm run dev
```

Bu tek komut ile:
- ✅ **Frontend** başlar (http://localhost:5173)
- ✅ **Backend** başlar (http://localhost:3001)
- ✅ Her şey otomatik çalışır!

### 3️⃣ Test Et

Tarayıcınızda `http://localhost:5173` açılacak. Herhangi bir URL girin ve analiz başlatın!

---

## 📦 Manuel Kurulum (İsteğe Bağlı)

Eğer adım adım kurmak isterseniz:

```bash
# 1. Ana proje bağımlılıkları
npm install

# 2. Backend bağımlılıkları
cd backend
npm install
npx playwright install chromium
cd ..

# 3. Başlat
npm run dev
```

---

## 🎯 Proje Amacı

Test süreçlerini otonom hale getirerek QA ekiplerinin verimliliğini artırmak. 

**Pipeline:**
```
Playwright DOM Analizi → components.json → Hugging Face AI → Test Senaryoları → React UI
```

---

## ✨ Özellikler

- ✅ **Playwright DOM Analizi**: Web sayfalarındaki tüm interaktif bileşenleri otomatik tanımlar
- 🤖 **AI Test Senaryosu Üretimi**: Hugging Face modelleri ile akıllı test senaryoları oluşturur
- 📊 **Görsel Dashboard**: Modern ve kullanıcı dostu React arayüzü
- 💾 **Senaryo Yönetimi**: Üretilen senaryoları `.txt` formatında indir ve yönet
- ⚙️ **Yapılandırılabilir**: API anahtarları, model seçimi ve dil tercihleri
- 🎨 **Modern UI**: TailwindCSS ve Shadcn/UI ile şık tasarım

---

## 🛠️ Teknoloji Yığını

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Playwright
- **Styling**: TailwindCSS + Shadcn/UI
- **State Management**: Zustand
- **DOM Analysis**: Playwright Chromium
- **AI Integration**: Hugging Face Inference API

---

## 📁 Proje Yapısı

```
/
├── src/                    # Frontend React uygulaması
│   ├── components/         # UI bileşenleri
│   ├── hooks/             # Zustand store'lar
│   ├── pages/             # Sayfa bileşenleri
│   ├── services/          # API servisleri
│   └── utils/             # Yardımcı fonksiyonlar
├── backend/               # Express.js backend servisi
│   ├── server.js          # Ana backend sunucusu
│   └── package.json       # Backend bağımlılıkları
├── public/                # Statik dosyalar
└── outputs/               # Üretilen test senaryoları
```

---

## 🎮 Kullanım

### DOM Analizi

1. Dashboard'da URL giriş alanına bir web sitesi adresi yazın
2. **"Analizi Başlat"** butonuna tıklayın
3. Playwright sayfayı analiz edecek ve bileşenleri listeleyecek

**Test için önerilen siteler:**
- `https://example.com` - Basit
- `https://www.saucedemo.com` - Demo e-commerce
- `https://www.wikipedia.org` - Orta komplekslik

### AI Test Senaryosu Üretimi

1. DOM analizi tamamlandıktan sonra
2. **"Senaryoları Üret"** butonuna tıklayın
3. AI otomatik olarak test senaryoları oluşturacak
4. Her senaryoyu **"İndir"** butonu ile indirebilirsiniz

### Ayarlar

1. Üst menüden **"Ayarlar"** sayfasına gidin
2. Hugging Face API anahtarınızı girin
3. Dil ve model tercihlerinizi ayarlayın

**Hugging Face API Key almak için:**
- [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## 📜 Komutlar

```bash
# Tüm projeyi başlat (Frontend + Backend)
npm run dev

# Sadece frontend
npm run frontend

# Sadece backend
npm run backend

# Production build
npm run build

# İlk kurulum
npm run setup

# Backend bağımlılıklarını kur
npm run backend:install
```

---

## 🔧 Backend API

Backend otomatik başlar ve şu endpoint'leri sunar:

### Health Check
```
GET http://localhost:3001/health
```

### DOM Analizi
```
POST http://localhost:3001/api/analyze

Body:
{
  "url": "https://example.com",
  "options": {
    "timeout": 30000,
    "excludeSelectors": ["script", "style"]
  }
}
```

---

## 🎨 UI Özellikleri

- ✅ Responsive tasarım
- ✅ Dark mode hazır (geliştirilecek)
- ✅ Renkli bileşen kategorileri
- ✅ Selector tipi gösterimi (ID, CSS, XPath)
- ✅ İndirilebilir test senaryoları
- ✅ Gerçek zamanlı hata mesajları
- ✅ Loading states

---

## 🧪 Test Senaryosu Örneği

```
# Kullanıcı Girişi - Başarılı Senaryo

**Priority:** CRITICAL
**Category:** Functional Testing

## Description
Geçerli kullanıcı bilgileri ile giriş yapma işleminin doğrulanması

## Test Steps
1. Ana sayfaya git
2. Email alanına geçerli bir email adresi gir
3. Şifre alanına geçerli şifreyi gir
4. "Giriş Yap" butonuna tıkla

## Expected Result
Kullanıcı başarıyla giriş yapar ve dashboard sayfasına yönlendirilir
```

---

## 🐛 Sorun Giderme

### "Backend sunucusuna bağlanılamadı" hatası

Backend'in çalıştığından emin olun:
```bash
npm run dev
```

### Port zaten kullanılıyor

Frontend (5173) veya Backend (3001) portları kullanımdaysa:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Playwright hatası

```bash
cd backend
npx playwright install chromium --force
```

---

## 🛡️ Güvenlik

- ⚠️ **API anahtarlarını asla commit etmeyin**
- ✅ `.env` dosyası `.gitignore`'da
- 🔒 Production'da environment variables kullanın

---

## 📝 Geliştirme Roadmap

- [ ] Çoklu sayfa analizi
- [ ] Test senaryolarının Playwright script'e dönüştürülmesi
- [ ] Dark mode tam entegrasyonu
- [ ] Senaryo versiyonlama
- [ ] CI/CD entegrasyonu
- [ ] Docker support
- [ ] Electron desktop uygulaması

---

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**BugEra Team**

Sorular ve geri bildirimler için issues açabilirsiniz.

---

## 🙏 Teşekkürler

- [Playwright](https://playwright.dev/)
- [Hugging Face](https://huggingface.co/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---

**⚡ Tek komutla başlat: `npm run dev` 🚀**