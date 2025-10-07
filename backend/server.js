/**
 * BugEra AIScout - Backend Server
 * Express server with Playwright integration for DOM analysis
 */

import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

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
