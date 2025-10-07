# 🤝 Katkıda Bulunma Rehberi

BugEra AIScout'a katkıda bulunmak istediğiniz için teşekkürler! 

## 🚀 Hızlı Başlangıç

### 1. Repository'yi Fork Edin
GitHub'da "Fork" butonuna tıklayın.

### 2. Clone Edin
```bash
git clone https://github.com/KULLANICI_ADINIZ/BugEra-AIScout.git
cd BugEra-AIScout
```

### 3. Kurulum
```bash
npm run setup
```

### 4. Geliştirmeye Başlayın
```bash
npm run dev
```

---

## 📝 Geliştirme Süreci

### 1. Branch Oluşturun
```bash
git checkout -b feature/amazing-feature
```

Branch isimlendirme:
- `feature/` - Yeni özellik
- `fix/` - Bug fix
- `docs/` - Dokümantasyon
- `refactor/` - Kod iyileştirme

### 2. Değişikliklerinizi Yapın
- Kod standardına uyun
- TypeScript strict mode kullanın
- Yorumları Türkçe yazın (kod İngilizce)

### 3. Test Edin
```bash
npm run lint
npm run build
```

### 4. Commit Edin
```bash
git add .
git commit -m "feat: add amazing feature"
```

Commit mesajı formatı:
- `feat:` - Yeni özellik
- `fix:` - Bug fix
- `docs:` - Dokümantasyon
- `style:` - Styling değişikliği
- `refactor:` - Kod iyileştirme
- `test:` - Test ekleme
- `chore:` - Diğer değişiklikler

### 5. Push Edin
```bash
git push origin feature/amazing-feature
```

### 6. Pull Request Açın
GitHub'da Pull Request oluşturun.

---

## 📋 Kod Standartları

### TypeScript
- Strict mode aktif
- Tip tanımlamaları kullanın
- `any` kullanmayın

### React
- Functional components kullanın
- Custom hooks oluşturun
- Props için interface tanımlayın

### Styling
- TailwindCSS kullanın
- Shadcn/UI bileşenlerini tercih edin
- Responsive tasarım yapın

### İsimlendirme
- Dosyalar: `camelCase.ts` veya `PascalCase.tsx`
- Değişkenler: `camelCase`
- Componentler: `PascalCase`
- Sabitler: `UPPER_CASE`

---

## 🐛 Bug Raporu

Bug bulduysanız GitHub Issues'da rapor edin:

**Şablon:**
```markdown
## Bug Açıklaması
Kısa açıklama

## Adımlar
1. ...
2. ...

## Beklenen Davranış
Ne olmalıydı

## Gerçek Davranış
Ne oldu

## Ekran Görüntüsü
(Varsa)

## Ortam
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox
- Node: v18.x.x
```

---

## 💡 Özellik İsteği

Yeni özellik önerisi için GitHub Issues kullanın:

**Şablon:**
```markdown
## Özellik Açıklaması
Ne istiyorsunuz

## Neden Gerekli
Use case açıklayın

## Önerilen Çözüm
Nasıl implemente edilmeli

## Alternatifler
Başka çözümler
```

---

## ✅ Pull Request Checklist

PR açmadan önce kontrol edin:

- [ ] Kod lint'ten geçiyor (`npm run lint`)
- [ ] Build başarılı (`npm run build`)
- [ ] Değişiklikler test edildi
- [ ] Dokümantasyon güncellendi
- [ ] Commit mesajları anlamlı
- [ ] Branch güncel (`git pull origin main`)

---

## 📚 Proje Yapısı

```
/src
  /components  → React UI bileşenleri
  /hooks       → Zustand store'lar
  /pages       → Sayfa bileşenleri
  /services    → API servisleri
  /utils       → Yardımcı fonksiyonlar
/backend       → Express.js backend
```

---

## 🎯 Öncelikli Alanlar

Katkı yapabileceğiniz alanlar:

1. **UI İyileştirmeleri**
   - Dark mode tam entegrasyonu
   - Responsive tasarım iyileştirmeleri
   - Animasyonlar

2. **Backend**
   - Batch processing
   - Caching
   - Error handling

3. **AI**
   - Daha iyi prompt engineering
   - Çoklu model desteği
   - Test kalitesi artırma

4. **Dokümantasyon**
   - Tutorial'lar
   - Video anlatımlar
   - Çeviri (İngilizce)

5. **Testing**
   - Unit testler
   - E2E testler
   - Integration testler

---

## 🆘 Yardım

Sorularınız için:
- GitHub Discussions
- Issues bölümü
- Email: (ekleyin)

---

**Teşekkürler! 🙏**
