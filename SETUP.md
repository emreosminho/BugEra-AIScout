# 🚀 BugEra AIScout - Kurulum Rehberi

Bu rehber, projeyi sıfırdan kurup çalıştırmanız için gerekli tüm adımları içerir.

---

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Playwright Kurulumu

```bash
npx playwright install chromium
```

### 3. Environment Variables

`.env` dosyası oluşturun (`.env.example` dosyasını kopyalayabilirsiniz):

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

`.env` dosyasını düzenleyin ve Hugging Face API anahtarınızı ekleyin:

```env
VITE_HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
VITE_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
VITE_DEFAULT_TIMEOUT=30000
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

---

## 🔑 Hugging Face API Key Nasıl Alınır?

1. [Hugging Face](https://huggingface.co/) hesabı oluşturun (ücretsiz)
2. Giriş yaptıktan sonra [Settings → Access Tokens](https://huggingface.co/settings/tokens) sayfasına gidin
3. **"New token"** butonuna tıklayın
4. Token'a bir isim verin (örn: "bugera-aiscout")
5. **Role** olarak **"Read"** seçin (write gerekmez)
6. **"Generate token"** butonuna tıklayın
7. Oluşturulan token'ı kopyalayın
8. `.env` dosyasına yapıştırın

⚠️ **Önemli:** Token'ınızı asla kimseyle paylaşmayın ve git'e commit etmeyin!

---

## 🎯 İlk Kullanım

### Dashboard'u Açın

1. Uygulamayı başlattığınızda Dashboard sayfası açılacak
2. Sol tarafta "DOM Analizi Başlat" ve "AI Test Senaryosu Üret" kartları var

### İlk Analizi Yapın

1. "DOM Analizi Başlat" kartından bir URL girin (örn: `https://example.com`)
2. "Analizi Başlat" butonuna tıklayın
3. ⚠️ **Not:** Playwright entegrasyonu frontend'de tam çalışmaz, backend gerektirir (aşağıya bakın)

### API Anahtarını Ayarlayın

1. Üst menüden **"Ayarlar"** sayfasına gidin
2. "Hugging Face API Yapılandırması" bölümünde API anahtarınızı girin
3. İsterseniz model değiştirebilirsiniz
4. **"Kaydet"** butonuna tıklayın

---

## 🔧 Backend Entegrasyonu (Opsiyonel)

Frontend tek başına tam çalışmaz çünkü **Playwright** browser'da çalışamaz. İki seçeneğiniz var:

### Seçenek 1: Node.js Backend Servisi (Önerilen)

Backend klasörü oluşturun ve Express sunucusu kurulumu yapın:

```bash
mkdir backend
cd backend
npm init -y
npm install express cors playwright
```

`backend/server.js` dosyası oluşturun:

```javascript
const express = require('express');
const cors = require('cors');
const { analyzeWebPage } = require('../src/services/playwright/analyzer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await analyzeWebPage({ url });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

Backend'i başlatın:

```bash
node backend/server.js
```

Frontend'de API çağrısını güncelleyin (`src/components/AnalysisForm.tsx`):

```typescript
const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url })
});
const result = await response.json();
setCurrentAnalysis(result);
```

### Seçenek 2: Electron Uygulaması

Electron ile desktop uygulaması yapın, main process'te Playwright'ı çalıştırın.

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

Build çıktısı `dist/` klasöründe olacak.

### Preview

```bash
npm run preview
```

---

## 🐛 Sık Karşılaşılan Sorunlar

### 1. "Module not found" hatası

```bash
npm install
```

### 2. Playwright hatası

```bash
npx playwright install chromium --force
```

### 3. API Key hatası

- `.env` dosyasının proje kök dizininde olduğundan emin olun
- API key'in başında boşluk olmadığından emin olun
- Hugging Face token'ınızın aktif olduğundan emin olun

### 4. CORS hatası

Backend kullanıyorsanız CORS middleware'inin ekli olduğundan emin olun:

```javascript
app.use(cors());
```

---

## 📚 Ek Kaynaklar

- [Playwright Dokümantasyonu](https://playwright.dev/)
- [Hugging Face API Docs](https://huggingface.co/docs/api-inference/index)
- [React + TypeScript Guide](https://react.dev/learn/typescript)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 🆘 Yardım

Sorun yaşıyorsanız:

1. `node_modules` ve `package-lock.json` silin, yeniden `npm install` yapın
2. `.env` dosyasını kontrol edin
3. Browser console'da hata mesajlarını inceleyin
4. GitHub Issues açın

---

**✅ Kurulum tamamlandı! İyi testler! 🚀**

