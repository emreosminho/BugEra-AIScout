/**
 * Main Dashboard Page
 * Entry point for starting DOM analysis and generating scenarios
 */

import { AnalysisForm } from '@/components/AnalysisForm';
import { ComponentsTable } from '@/components/ComponentsTable';
import { ScenarioGenerator } from '@/components/ScenarioGenerator';
import { ScenariosList } from '@/components/ScenariosList';
import { useComponentsStore } from '@/hooks/useComponentsStore';
import { useScenariosStore } from '@/hooks/useScenariosStore';
import { AlertCircle, Loader2 } from 'lucide-react';

export function Dashboard() {
  const { isAnalyzing, analysisError } = useComponentsStore();
  const { isGenerating, generationError } = useScenariosStore();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">BugEra AIScout</h1>
        <p className="text-muted-foreground">
          AI destekli otomatik test senaryosu üretim platformu
        </p>
      </div>

      {/* Error Messages */}
      {analysisError && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium">Analiz Hatası</p>
            <p className="text-sm text-muted-foreground">{analysisError}</p>
          </div>
        </div>
      )}

      {generationError && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium">Üretim Hatası</p>
            <p className="text-sm text-muted-foreground">{generationError}</p>
          </div>
        </div>
      )}

      {/* Loading States */}
      {isAnalyzing && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>DOM analizi yapılıyor...</p>
        </div>
      )}

      {isGenerating && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>AI test senaryoları üretiliyor...</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <AnalysisForm />
          <ScenarioGenerator />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <ComponentsTable />
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="pt-8 border-t">
        <ScenariosList />
      </div>
    </div>
  );
}

