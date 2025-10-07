/**
 * Component for AI-powered scenario generation
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useComponentsStore } from '@/hooks/useComponentsStore';
import { useScenariosStore } from '@/hooks/useScenariosStore';
import { useAppStore } from '@/hooks/useAppStore';
import { Wand2 } from 'lucide-react';
import type { ScenarioGenerationResult } from '@/services/ai/types';

export function ScenarioGenerator() {
  const [progress, setProgress] = useState(0);
  const { currentAnalysis } = useComponentsStore();
  const { setIsGenerating, setGenerationError, setCurrentResult, addScenarios } = useScenariosStore();
  const { settings } = useAppStore();

  // Generate mock scenarios for demo
  const generateMockScenarios = (): ScenarioGenerationResult => {
    const now = Date.now();
    return {
      scenarios: [
        {
          id: `scenario-${now}-1`,
          title: 'Kullanıcı Girişi - Başarılı Senaryo',
          description: 'Geçerli kullanıcı bilgileri ile giriş yapma işleminin doğrulanması',
          steps: [
            { stepNumber: 1, action: 'Ana sayfaya git' },
            { stepNumber: 2, action: 'Email alanına geçerli bir email adresi gir (örn: test@example.com)' },
            { stepNumber: 3, action: 'Şifre alanına geçerli şifreyi gir' },
            { stepNumber: 4, action: '"Giriş Yap" butonuna tıkla' },
          ],
          expectedResult: 'Kullanıcı başarıyla giriş yapar ve dashboard sayfasına yönlendirilir',
          priority: 'critical',
          category: 'Functional Testing',
          timestamp: new Date().toISOString(),
        },
        {
          id: `scenario-${now}-2`,
          title: 'Ürün Arama İşlevi',
          description: 'Kullanıcının arama özelliğini kullanarak ürün bulabilmesinin testi',
          steps: [
            { stepNumber: 1, action: 'Ana sayfada arama kutusunu bul' },
            { stepNumber: 2, action: 'Arama kutusuna "laptop" yaz' },
            { stepNumber: 3, action: '"Ara" butonuna tıkla veya Enter tuşuna bas' },
            { stepNumber: 4, action: 'Arama sonuçlarının yüklendiğini doğrula' },
          ],
          expectedResult: 'Laptop ile ilgili ürünler listelenir ve sonuç sayısı gösterilir',
          priority: 'high',
          category: 'Functional Testing',
          timestamp: new Date().toISOString(),
        },
        {
          id: `scenario-${now}-3`,
          title: 'Şifre Hatırlama İşlevi',
          description: 'Şifresini unutan kullanıcının şifre sıfırlama sürecini test eder',
          steps: [
            { stepNumber: 1, action: 'Login sayfasına git' },
            { stepNumber: 2, action: '"Şifremi Unuttum" linkine tıkla' },
            { stepNumber: 3, action: 'Email adresini gir' },
            { stepNumber: 4, action: 'Şifre sıfırlama linkinin gönderildiğini doğrula' },
          ],
          expectedResult: 'Kullanıcıya email ile şifre sıfırlama linki gönderilir ve başarı mesajı gösterilir',
          priority: 'medium',
          category: 'Functional Testing',
          timestamp: new Date().toISOString(),
        },
        {
          id: `scenario-${now}-4`,
          title: 'Sepete Ürün Ekleme',
          description: 'Kullanıcının seçtiği ürünü sepete ekleyebilmesinin testi',
          steps: [
            { stepNumber: 1, action: 'Ürün listesinde bir ürün seç' },
            { stepNumber: 2, action: '"Sepete Ekle" butonuna tıkla' },
            { stepNumber: 3, action: 'Sepet ikonunda ürün sayısının arttığını doğrula' },
            { stepNumber: 4, action: 'Sepete git ve ürünün sepette olduğunu kontrol et' },
          ],
          expectedResult: 'Ürün başarıyla sepete eklenir ve sepet sayacı güncellenir',
          priority: 'critical',
          category: 'E-Commerce',
          timestamp: new Date().toISOString(),
        },
        {
          id: `scenario-${now}-5`,
          title: 'Geçersiz Giriş Denemesi - Negatif Test',
          description: 'Hatalı kullanıcı bilgileri ile giriş denemesinin hata vermesinin testi',
          steps: [
            { stepNumber: 1, action: 'Login sayfasına git' },
            { stepNumber: 2, action: 'Email alanına geçersiz email gir (örn: invalid@test)' },
            { stepNumber: 3, action: 'Şifre alanına hatalı şifre gir' },
            { stepNumber: 4, action: '"Giriş Yap" butonuna tıkla' },
          ],
          expectedResult: 'Sistem hata mesajı gösterir: "Geçersiz kullanıcı adı veya şifre"',
          priority: 'high',
          category: 'Security Testing',
          timestamp: new Date().toISOString(),
        },
      ],
      totalGenerated: 5,
      generationTime: 3500,
      model: settings.model || 'mistralai/Mistral-7B-Instruct-v0.2',
      timestamp: new Date().toISOString(),
    };
  };

  const handleGenerate = async () => {
    if (!currentAnalysis) {
      setGenerationError('Önce bir DOM analizi yapmalısınız');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 400);

    // Generate mock scenarios (demo mode)
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const mockResult = generateMockScenarios();
      setCurrentResult(mockResult);
      addScenarios(mockResult.scenarios);
      
      setIsGenerating(false);
      console.log('✅ Demo mode: Mock scenarios generated. Gerçek AI için Hugging Face API key gerekli.');
    }, 3500);
  };

  const canGenerate = currentAnalysis && currentAnalysis.components.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Test Senaryosu Üret
        </CardTitle>
        <CardDescription>
          Analiz edilen bileşenlerden otomatik test senaryoları oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canGenerate && (
          <p className="text-muted-foreground text-sm">
            Senaryo üretmek için önce bir web sayfası analiz edin.
          </p>
        )}
        
        {currentAnalysis && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analiz edilen bileşenler:</span>
              <span className="font-bold">{currentAnalysis.statistics.totalComponents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Sayfa:</span>
              <span className="font-medium truncate max-w-xs">{currentAnalysis.title}</span>
            </div>
          </div>
        )}

        {progress > 0 && progress < 100 && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Senaryolar üretiliyor... {progress}%
            </p>
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={!canGenerate}
          className="w-full"
        >
          Senaryoları Üret
        </Button>
      </CardContent>
    </Card>
  );
}

