/**
 * Form component for initiating DOM analysis
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useComponentsStore } from '@/hooks/useComponentsStore';

export function AnalysisForm() {
  const [url, setUrl] = useState('');
  const { setIsAnalyzing, setAnalysisError, setCurrentAnalysis, addToHistory } = useComponentsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setAnalysisError('Lütfen geçerli bir URL girin');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      console.log('🔍 Starting real DOM analysis for:', url);
      
      // Call backend API
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          options: {
            timeout: 30000,
            excludeSelectors: ['script', 'style', 'noscript'],
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analiz başarısız oldu');
      }

      const result = await response.json();
      
      setCurrentAnalysis(result);
      addToHistory(result);
      setIsAnalyzing(false);
      
      console.log('✅ Analysis completed:', result.statistics.totalComponents, 'components found');
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setIsAnalyzing(false);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setAnalysisError('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (backend klasöründe: npm start)');
      } else {
        setAnalysisError(error instanceof Error ? error.message : 'Analiz sırasında bir hata oluştu');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DOM Analizi Başlat</CardTitle>
        <CardDescription>
          Web sayfasını Playwright ile analiz edin ve bileşenleri çıkarın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Web Sayfası URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Analizi Başlat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

