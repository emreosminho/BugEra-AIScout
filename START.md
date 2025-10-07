# 🚀 BugEra AIScout - Başlangıç Rehberi

## ⚡ Tek Komutla Başlat

Artık **tek bir komut** ile hem frontend hem backend başlıyor!

```bash
npm run dev
```

Bu komut otomatik olarak:
- ✅ **Frontend** başlatır → http://localhost:5173
- ✅ **Backend** başlatır → http://localhost:3001
- ✅ Renkli log'lar gösterir (Cyan: Frontend, Green: Backend)

---

## 📋 Terminal Görünümü

```
[FRONTEND] VITE v5.4.20  ready in 617 ms
[FRONTEND] ➜  Local:   http://localhost:5173/
[BACKEND]  🚀 BugEra AIScout Backend Server
[BACKEND]  ✅ Server running on http://localhost:3001
```

---

## 🛑 Durdurmak İçin

`Ctrl + C` tuşlarına basın - her ikisi de duracak.

---

## 🔧 İlk Kurulum (Sadece İlk Çalıştırmada)

Eğer ilk kez kuruyorsanız:

```bash
npm run setup
```

Bu komut:
1. Frontend bağımlılıklarını kurar
2. Backend bağımlılıklarını kurar
3. Playwright Chromium browser'ı indirir

---

## 📝 Diğer Komutlar

```bash
# Sadece frontend
npm run frontend

# Sadece backend  
npm run backend

# Backend bağımlılıklarını kur
npm run backend:install

# Production build
npm run build
```

---

**✨ Artık her şey otomatik! Sadece `npm run dev` yazın! 🎉**
