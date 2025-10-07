/**
 * Settings Page
 * Configure API keys, models, and application preferences
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/hooks/useAppStore';
import { Save, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Ayarlar
        </h1>
        <p className="text-muted-foreground">
          Uygulama tercihlerinizi ve API yapılandırmanızı yönetin
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Hugging Face API Yapılandırması</CardTitle>
          <CardDescription>
            Test senaryosu üretimi için AI model ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Anahtarı
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="hf_..."
              value={localSettings.apiKey}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, apiKey: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Hugging Face API anahtarınızı{' '}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                buradan
              </a>{' '}
              alabilirsiniz
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="model" className="text-sm font-medium">
              Model
            </label>
            <Input
              id="model"
              type="text"
              placeholder="mistralai/Mistral-7B-Instruct-v0.2"
              value={localSettings.model}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, model: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Kullanmak istediğiniz Hugging Face model adı
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
          <CardDescription>
            Uygulama davranışını özelleştirin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium">
              Dil
            </label>
            <select
              id="language"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={localSettings.language}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  language: e.target.value as 'en' | 'tr',
                })
              }
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="timeout" className="text-sm font-medium">
              Timeout (ms)
            </label>
            <Input
              id="timeout"
              type="number"
              min="5000"
              max="120000"
              step="1000"
              value={localSettings.defaultTimeout}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  defaultTimeout: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Playwright analizi için maksimum bekleme süresi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            ✓ Ayarlar kaydedildi
          </span>
        )}
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Kaydet
        </Button>
      </div>
    </div>
  );
}

