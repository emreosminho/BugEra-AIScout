/**
 * Component for displaying generated test scenarios
 */

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useScenariosStore } from '@/hooks/useScenariosStore';
import { useComponentsStore } from '@/hooks/useComponentsStore';
import { Download, Trash2, Code } from 'lucide-react';
import type { GeneratedScenario } from '@/services/ai/types';
import { generatePlaywrightTests, downloadPlaywrightTest } from '@/utils/playwrightGenerator';

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

function ScenarioCard({ scenario }: { scenario: GeneratedScenario }) {
  const { removeScenario } = useScenariosStore();

  const handleDownload = () => {
    // Format scenario as text
    let text = `# ${scenario.title}\n\n`;
    text += `**Priority:** ${scenario.priority.toUpperCase()}\n`;
    text += `**Category:** ${scenario.category}\n\n`;
    text += `## Description\n${scenario.description}\n\n`;
    text += `## Test Steps\n`;
    scenario.steps.forEach(step => {
      text += `${step.stepNumber}. ${step.action}\n`;
    });
    text += `\n## Expected Result\n${scenario.expectedResult}\n`;

    // Download as file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{scenario.title}</CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityColors[scenario.priority]}>
              {scenario.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Test Adımları:</p>
            <ol className="space-y-1 text-sm">
              {scenario.steps.map((step) => (
                <li key={step.stepNumber} className="flex gap-2">
                  <span className="font-medium">{step.stepNumber}.</span>
                  <span>{step.action}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div>
            <p className="font-medium mb-1">Beklenen Sonuç:</p>
            <p className="text-sm text-muted-foreground">{scenario.expectedResult}</p>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => removeScenario(scenario.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScenariosList() {
  const { allScenarios, currentResult } = useScenariosStore();
  const { currentAnalysis } = useComponentsStore();

  const handleDownloadAllAsPlaywright = () => {
    if (!currentResult || !currentAnalysis) {
      alert('Senaryolar ve bileşen analizi gerekli');
      return;
    }

    const scenarios = currentResult.scenarios || allScenarios;
    const playwrightCode = generatePlaywrightTests(scenarios, currentAnalysis);
    downloadPlaywrightTest(playwrightCode, `tests-${Date.now()}.spec.ts`);
  };

  if (!currentResult && allScenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Üretilen Senaryolar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Henüz senaryo üretilmedi. AI ile senaryo oluşturmak için yukarıdaki butonu kullanın.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Üretilen Senaryolar</h2>
        <div className="flex items-center gap-4">
          {currentResult && (
            <div className="text-sm text-muted-foreground">
              {currentResult.totalGenerated} senaryo • {currentResult.generationTime}ms
            </div>
          )}
          <Button 
            onClick={handleDownloadAllAsPlaywright}
            variant="default"
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            Playwright Test Kodu İndir
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {(currentResult?.scenarios || allScenarios).map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}

