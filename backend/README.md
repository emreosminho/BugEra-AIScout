# BugEra AIScout - Backend Server

Express.js backend servisi - Playwright ile gerçek DOM analizi yapar.

## 🚀 Kurulum

```bash
cd backend
npm install
```

## ▶️ Başlatma

```bash
npm start
```

veya auto-reload ile:

```bash
npm run dev
```

## 📡 API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

### DOM Analysis
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

### Batch Analysis
```
POST http://localhost:3001/api/analyze/batch

Body:
{
  "urls": ["https://example.com", "https://test.com"],
  "options": {}
}
```

## 🛠️ Özellikler

- ✅ Playwright ile gerçek browser analizi
- ✅ Tüm interaktif elementleri bulur
- ✅ XPath ve CSS Selector üretir
- ✅ Batch processing desteği
- ✅ CORS enabled
- ✅ Error handling

## 📝 Not

Frontend uygulaması ile birlikte çalışır.
