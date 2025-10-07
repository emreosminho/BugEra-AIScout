# 🎭 Playwright Test Kodu Üretme

## ✨ Yeni Özellik: Otomatik Playwright Test Kodu

Artık BugEra AIScout, bulunan bileşenleri ve AI senaryolarını kullanarak **çalıştırılabilir Playwright test kodu** üretebilir!

---

## 🚀 Nasıl Kullanılır?

### 1. DOM Analizi Yap
URL girerek bir web sayfasını analiz edin.

### 2. Senaryolar Üret
AI ile test senaryoları oluşturun.

### 3. Playwright Kodu İndir
Senaryolar bölümünde **"Playwright Test Kodu İndir"** butonuna tıklayın.

---

## 📥 İndirilen Dosya

`tests-{timestamp}.spec.ts` dosyası indirilir.

**İçeriği:**
```typescript
// Auto-generated Playwright Tests
// Generated from BugEra AIScout

import { test, expect } from '@playwright/test';

test.describe('Web Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
  });

  test('Kullanıcı Girişi - Başarılı Senaryo', async ({ page }) => {
    // Priority: CRITICAL
    // Category: Functional Testing
    
    // Step 1: Ana sayfaya git
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Step 2: Email alanına geçerli bir email adresi gir
    await page.locator('#email').fill('test@example.com');

    // Step 3: Şifre alanına geçerli şifreyi gir
    await page.locator('#password').fill('TestPassword123!');

    // Step 4: "Giriş Yap" butonuna tıkla
    await page.locator('#login-btn').click();
    await page.waitForLoadState('networkidle');

    // Expected Result: Kullanıcı başarıyla giriş yapar
    // Add your verification assertions here
  });
});
```

---

## 🔧 IDE'de Çalıştırma

### 1. Test Dosyasını Projeye Ekle

İndirilen dosyayı test projenize kopyalayın:
```
your-project/
  tests/
    tests-{timestamp}.spec.ts  ← Buraya
```

### 2. Playwright Kurulumu (İlk Kez)

```bash
npm init playwright@latest
```

### 3. Testi Çalıştır

```bash
# Tüm testleri çalıştır
npx playwright test

# Sadece bu dosyayı çalıştır
npx playwright test tests-{timestamp}.spec.ts

# UI mode ile çalıştır (görsel)
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## 🎯 Akıllı Özellikler

### Otomatik Selector Eşleştirme
- Bulunan bileşenlerin selector'larını kullanır
- ID selector'ları önceliklendirir
- CSS Selector ve XPath desteği

### Akıllı Step Dönüştürme
- "Tıkla" → `page.locator().click()`
- "Gir" → `page.locator().fill()`
- "Seç" → `page.locator().selectOption()`
- "İşaretle" → `page.locator().check()`
- "Doğrula" → `expect().toBeVisible()`

### Veri Çıkarımı
- Email tespiti → Otomatik `test@example.com`
- Şifre tespiti → Otomatik `TestPassword123!`
- Kullanıcı adı → Otomatik `testuser`

---

## ✏️ Kodu Özelleştirme

İndirilen kodu düzenleyebilirsiniz:

### 1. Selector'ları Düzelt
```typescript
// Otomatik üretilen
await page.locator('#email').fill('test@example.com');

// Özelleştirilmiş
await page.locator('[data-testid="email-input"]').fill('user@domain.com');
```

### 2. Assertion'lar Ekle
```typescript
// Doğrulama ekle
await expect(page.locator('.success-message')).toBeVisible();
await expect(page).toHaveURL(/.*dashboard/);
```

### 3. Wait Stratejileri Ekle
```typescript
// Özel bekleme
await page.waitForSelector('.modal');
await page.waitForResponse(resp => resp.url().includes('/api/login'));
```

---

## 📋 Örnek Tam Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('E-commerce Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
  });

  test('Başarılı Kullanıcı Girişi', async ({ page }) => {
    // Login
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Verify
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page).toHaveURL(/.*inventory/);
  });

  test('Sepete Ürün Ekleme', async ({ page }) => {
    // Login
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Add to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify cart badge
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });
});
```

---

## 🐛 Sorun Giderme

### "Selector not found" hatası
- Selector'ı manuel olarak kontrol edin
- Browser DevTools'da selector'ı test edin
- Playwright Inspector kullanın: `npx playwright test --debug`

### Test timeout
- `test.setTimeout()` ekleyin
- Yavaş elementler için daha uzun wait ekleyin

### Element not visible
- `page.waitForSelector()` ekleyin
- `waitForLoadState('networkidle')` kullanın

---

## 💡 İpuçları

1. **İlk önce manuel test edin** - Browser'da testleri manuel çalıştırıp akışı kontrol edin
2. **Selector'ları doğrulayın** - Playwright Inspector ile selector'ları test edin
3. **Wait stratejileri ekleyin** - Network isteklerini bekleyin
4. **Assertion'lar ekleyin** - Her adımdan sonra doğrulama yapın
5. **Screenshot'lar ekleyin** - Hata durumlarında görsel kayıt alın

---

## 📚 Kaynaklar

- [Playwright Dokümantasyonu](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [Selectors](https://playwright.dev/docs/selectors)

---

**🎉 Artık AI ile üretilen test senaryolarınızı direkt çalıştırabilirsiniz!**
