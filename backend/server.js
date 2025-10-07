/**
 * BugEra AIScout - Backend Server
 * Express server with Playwright integration for DOM analysis
 */

import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BugEra AIScout Backend is running' });
});

/**
 * AI Scenario Generation endpoint (Supports Google Gemini & Hugging Face)
 */
app.post('/api/generate-scenarios', async (req, res) => {
  const { components, url, title, options = {}, config } = req.body;

  if (!components || components.length === 0) {
    return res.status(400).json({ 
      error: 'Components are required',
      message: 'Please provide DOM components to generate scenarios'
    });
  }

  if (!config?.apiKey) {
    return res.status(400).json({ 
      error: 'API key is required',
      message: 'Please provide API key in the config'
    });
  }

  const isGemini = config.provider === 'gemini' || config.model?.includes('gemini');
  
  console.log(`🤖 Starting AI scenario generation...`);
  console.log(`📊 Components: ${components.length}`);
  console.log(`🌐 URL: ${url}`);
  console.log(`🤖 Provider: ${isGemini ? 'Google Gemini' : 'Hugging Face'}`);
  console.log(`🤖 Model: ${config.model}`);

  try {
    const startTime = Date.now();

    // Build prompt
    const componentSummary = buildComponentSummary(components);
    const prompt = buildPrompt({
      url,
      title,
      componentSummary,
      options,
      config
    });

    console.log(`📝 Prompt oluşturuldu (${prompt.length} karakter)`);
    console.log(`🔑 API Key: ${config.apiKey.substring(0, 10)}...`);

    let generatedText = '';

    if (isGemini) {
      // Use Google Gemini API
      console.log(`🚀 Google Gemini API çağrılıyor...`);
      
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      generatedText = response.text();
      
      console.log(`✅ Gemini yanıt alındı (${generatedText.length} karakter)`);
      
    } else {
      // Use Hugging Face API
      console.log(`🚀 Hugging Face API çağrılıyor (direkt HTTP)...`);
      
      const apiUrl = `https://api-inference.huggingface.co/models/${config.model}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: config.temperature ?? 0.7,
            max_new_tokens: config.maxTokens ?? 2000,
            top_p: 0.95,
            return_full_text: false,
          },
        }),
      });

      console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error Response: ${errorText}`);
        throw new Error(`Hugging Face API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Hugging Face yanıt alındı`);

      // Extract generated text
      if (Array.isArray(data) && data.length > 0) {
        generatedText = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        generatedText = data.generated_text;
      } else if (typeof data === 'string') {
        generatedText = data;
      }
    }

    console.log(`📝 Generated text uzunluğu: ${generatedText.length} karakter`);

    // Parse scenarios from AI response
    const scenarios = parseAIResponse(generatedText);
    const generationTime = Date.now() - startTime;

    console.log(`✅ ${scenarios.length} senaryo üretildi (${generationTime}ms)`);

    res.json({
      scenarios,
      totalGenerated: scenarios.length,
      generationTime,
      model: config.model,
      provider: isGemini ? 'gemini' : 'huggingface',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ AI generation error (DETAYLI):', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    
    // Extract meaningful error message
    let errorMessage = error.message || 'Failed to generate test scenarios from AI model';
    
    if (error.message?.includes('Invalid credentials')) {
      errorMessage = 'API key geçersiz. Lütfen Hugging Face token\'ınızı kontrol edin.';
    } else if (error.message?.includes('loading')) {
      errorMessage = 'Model yükleniyor. 30-60 saniye bekleyin ve tekrar deneyin.';
    } else if (error.message?.includes('blob')) {
      errorMessage = 'Model erişim hatası. Model değiştirmeyi deneyin veya biraz bekleyin.';
    }
    
    res.status(500).json({
      error: 'Scenario generation failed',
      message: errorMessage,
      details: error.toString(),
      stack: error.stack
    });
  }
});

/**
 * Build component summary for prompt
 */
function buildComponentSummary(components) {
  const summary = [];
  
  // Group by type
  const byType = components.reduce((acc, comp) => {
    if (!acc[comp.type]) acc[comp.type] = [];
    acc[comp.type].push(comp);
    return acc;
  }, {});

  Object.entries(byType).forEach(([type, comps]) => {
    summary.push(`- ${type}: ${comps.length} adet`);
    
    // Add sample details for important components
    if (['button', 'input', 'link', 'form'].includes(type) && comps.length > 0) {
      const samples = comps.slice(0, 3).map(c => 
        c.text || c.placeholder || c.ariaLabel || c.name || 'isimsiz'
      );
      summary.push(`  Örnekler: ${samples.join(', ')}`);
    }
  });

  return summary.join('\n');
}

/**
 * Build AI prompt
 */
function buildPrompt({ url, title, componentSummary, options, config }) {
  const language = options?.language === 'tr' ? 'Türkçe' : 'İngilizce';
  const complexity = options?.complexity ?? 'orta';
  const maxScenarios = options?.maxScenarios ?? 5;

  return `Sen uzman bir QA mühendisisin. Bir web uygulaması için kapsamlı test senaryoları oluşturman gerekiyor.

**Uygulama Bilgileri:**
- URL: ${url}
- Sayfa Başlığı: ${title || 'Bilinmiyor'}

**Bulunan UI Bileşenleri:**
${componentSummary}

**Gereksinimler:**
- ${maxScenarios} adet test senaryosu üret
- Karmaşıklık seviyesi: ${complexity}
- Dil: ${language}
- ${options?.includeEdgeCases ? 'Negatif test senaryoları ve edge case\'leri dahil et' : 'Pozitif test senaryolarına odaklan'}

**Çıktı Formatı:**
Her test senaryosu için:
1. Senaryo Başlığı (açık ve tanımlayıcı)
2. Açıklama (senaryonun ne test ettiği)
3. Test Adımları (numaralı, net aksiyonlar)
4. Beklenen Sonuç
5. Öncelik (low, medium, high, critical)
6. Kategori (örn: functional, usability, security)

Gerçekçi, uygulanabilir test senaryoları oluştur.
Her senaryoyu net bir yapı ile formatla.

---

Test senaryolarını oluşturmaya başla:`;
}

/**
 * Parse AI response into scenarios
 */
function parseAIResponse(text) {
  const scenarios = [];
  
  // Split by scenario markers
  const scenarioBlocks = text.split(/(?:Senaryo|Scenario|Test Case|TC)\s*\d+/i).filter(block => block.trim());

  scenarioBlocks.forEach((block, index) => {
    try {
      const scenario = parseScenarioBlock(block, index);
      if (scenario) {
        scenarios.push(scenario);
      }
    } catch (error) {
      console.warn(`Failed to parse scenario block ${index}:`, error.message);
    }
  });

  // If no scenarios parsed, return a default one
  if (scenarios.length === 0) {
    scenarios.push({
      id: `scenario-${Date.now()}-1`,
      title: 'AI Senaryo Üretimi',
      description: 'AI tarafından üretilen test senaryosu',
      steps: [
        { stepNumber: 1, action: 'Web sayfasına git' },
        { stepNumber: 2, action: 'Sayfanın yüklendiğini doğrula' }
      ],
      expectedResult: 'Sayfa başarıyla yüklenir',
      priority: 'medium',
      category: 'Functional',
      timestamp: new Date().toISOString(),
    });
  }

  return scenarios;
}

/**
 * Parse individual scenario block
 */
function parseScenarioBlock(block, index) {
  const lines = block.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return null;

  // Extract title
  const titleMatch = block.match(/(?:Başlık|Title|Senaryo|Name):\s*(.+?)(?:\n|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : `Test Senaryosu ${index + 1}`;

  // Extract description
  const descMatch = block.match(/(?:Açıklama|Description|Objective|Goal):\s*(.+?)(?:\n|$)/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract steps
  const steps = extractSteps(block);

  // Extract expected result
  const expectedMatch = block.match(/(?:Beklenen Sonuç|Expected Result|Expected Outcome|Result):\s*(.+?)(?:\n|$)/i);
  const expectedResult = expectedMatch ? expectedMatch[1].trim() : 'Test başarıyla tamamlanır';

  // Extract priority
  const priorityMatch = block.match(/(?:Öncelik|Priority):\s*(low|medium|high|critical|düşük|orta|yüksek|kritik)/i);
  let priority = 'medium';
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    if (p === 'low' || p === 'düşük') priority = 'low';
    else if (p === 'high' || p === 'yüksek') priority = 'high';
    else if (p === 'critical' || p === 'kritik') priority = 'critical';
  }

  // Extract category
  const categoryMatch = block.match(/(?:Kategori|Category|Type):\s*(.+?)(?:\n|$)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : 'Functional';

  return {
    id: `scenario-${Date.now()}-${index}`,
    title,
    description,
    steps,
    expectedResult,
    priority,
    category,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract test steps from scenario block
 */
function extractSteps(block) {
  const steps = [];
  const lines = block.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^\s*(\d+)\.\s*(.+)$/);
    if (match) {
      steps.push({
        stepNumber: parseInt(match[1]),
        action: match[2].trim(),
      });
    }
  });

  // Fallback: if no steps found, create a generic one
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      action: 'Test adımı ayrıştırılamadı',
    });
  }

  return steps;
}

/**
 * Main DOM analysis endpoint
 */
app.post('/api/analyze', async (req, res) => {
  const { url, options = {} } = req.body;

  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      message: 'Please provide a valid URL to analyze'
    });
  }

  console.log(`📊 Starting analysis for: ${url}`);
  
  let browser = null;
  
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // Navigate to URL with timeout
    const timeout = options.timeout || 30000;
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout 
    });

    console.log('✅ Page loaded successfully');

    // Wait for specific selector if provided
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout });
    }

    // Extract page title
    const title = await page.title();

    // Extract all components
    const components = await page.evaluate((excludeSelectors) => {
      const components = [];
      let idCounter = 0;

      // Component type mapping
      const getComponentType = (element) => {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');

        if (tagName === 'button' || role === 'button') return 'button';
        if (tagName === 'input') {
          const type = element.type;
          if (type === 'checkbox') return 'checkbox';
          if (type === 'radio') return 'radio';
          return 'input';
        }
        if (tagName === 'textarea') return 'textarea';
        if (tagName === 'select') return 'select';
        if (tagName === 'label') return 'label';
        if (tagName === 'a') return 'link';
        if (tagName === 'img') return 'image';
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
        if (tagName === 'form') return 'form';
        if (tagName === 'div') return 'div';
        if (tagName === 'span') return 'span';
        return 'other';
      };

      // Get XPath for an element
      const getXPath = (element) => {
        if (element.id) {
          return `//*[@id="${element.id}"]`;
        }
        
        const parts = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 0;
          let sibling = current.previousSibling;
          
          while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
              index++;
            }
            sibling = sibling.previousSibling;
          }

          const tagName = current.nodeName.toLowerCase();
          const pathIndex = index > 0 ? `[${index + 1}]` : '';
          parts.unshift(tagName + pathIndex);

          current = current.parentElement;
        }

        return parts.length ? '/' + parts.join('/') : '';
      };

      // Get CSS Selector for an element
      const getCSSSelector = (element) => {
        if (element.id) {
          return `#${element.id}`;
        }

        const path = [];
        let current = element;

        while (current && path.length < 5) {
          let selector = current.tagName.toLowerCase();
          
          if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
            if (classes) selector += `.${classes}`;
          }

          path.unshift(selector);
          current = current.parentElement;
        }

        return path.join(' > ');
      };

      // Check if element should be excluded
      const shouldExclude = (element) => {
        if (!excludeSelectors || excludeSelectors.length === 0) return false;
        return excludeSelectors.some(selector => {
          try {
            return element.matches(selector);
          } catch {
            return false;
          }
        });
      };

      // Selectors for interactive elements
      const selectors = [
        'button',
        'input',
        'textarea',
        'select',
        'a',
        'label',
        '[role="button"]',
        '[role="link"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[onclick]',
        'img',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'form',
      ];

      const allElements = document.querySelectorAll(selectors.join(','));

      allElements.forEach((element) => {
        if (shouldExclude(element)) return;

        // Skip hidden elements unless explicitly included
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return;
        }

        const component = {
          id: `component-${idCounter++}`,
          type: getComponentType(element),
          tagName: element.tagName.toLowerCase(),
          text: element.textContent?.trim().substring(0, 100) || undefined,
          className: element.className || undefined,
          role: element.getAttribute('role') || undefined,
          ariaLabel: element.getAttribute('aria-label') || undefined,
          xpath: getXPath(element),
          cssSelector: getCSSSelector(element),
          attributes: {},
        };

        // Extract specific attributes based on element type
        if (element.tagName === 'INPUT') {
          component.placeholder = element.placeholder || undefined;
          component.value = element.value || undefined;
          component.name = element.name || undefined;
          component.attributes['type'] = element.type;
        }

        if (element.tagName === 'A') {
          component.href = element.href || undefined;
        }

        if (element.tagName === 'IMG') {
          component.src = element.src || undefined;
          component.alt = element.alt || undefined;
        }

        // Extract all data attributes
        Array.from(element.attributes).forEach((attr) => {
          if (attr.name.startsWith('data-')) {
            component.attributes[attr.name] = attr.value;
          }
        });

        components.push(component);
      });

      return components;
    }, options.excludeSelectors || []);

    console.log(`✅ Found ${components.length} components`);

    // Calculate statistics
    const componentsByType = {
      button: 0, input: 0, textarea: 0, select: 0, checkbox: 0,
      radio: 0, label: 0, link: 0, image: 0, heading: 0,
      form: 0, div: 0, span: 0, other: 0,
    };

    components.forEach((component) => {
      componentsByType[component.type]++;
    });

    const result = {
      url,
      timestamp: new Date().toISOString(),
      title,
      components,
      statistics: {
        totalComponents: components.length,
        componentsByType,
      },
    };

    // Close browser
    await browser.close();

    console.log('✅ Analysis completed successfully');
    res.json(result);

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    
    if (browser) {
      await browser.close().catch(() => {});
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      details: {
        url,
        timestamp: new Date().toISOString(),
      }
    });
  }
});

/**
 * Batch analysis endpoint (analyze multiple URLs)
 */
app.post('/api/analyze/batch', async (req, res) => {
  const { urls, options = {} } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ 
      error: 'URLs array is required',
      message: 'Please provide an array of URLs to analyze'
    });
  }

  console.log(`📊 Starting batch analysis for ${urls.length} URLs`);

  const results = [];
  const errors = [];

  for (const url of urls) {
    try {
      // Make internal request to analyze endpoint
      const response = await fetch(`http://localhost:${PORT}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options }),
      });

      if (response.ok) {
        const data = await response.json();
        results.push(data);
      } else {
        const error = await response.json();
        errors.push({ url, error: error.message });
      }
    } catch (error) {
      errors.push({ url, error: error.message });
    }
  }

  res.json({
    success: results.length,
    failed: errors.length,
    results,
    errors,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   BugEra AIScout Backend Server');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Analysis endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('📡 Ready to accept requests...');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
