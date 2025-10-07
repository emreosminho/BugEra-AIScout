/**
 * Table component for displaying analyzed DOM components
 */

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useComponentsStore } from '@/hooks/useComponentsStore';
import type { ComponentType } from '@/services/playwright/types';

const componentColors: Record<ComponentType, string> = {
  button: 'bg-blue-500',
  input: 'bg-green-500',
  textarea: 'bg-green-600',
  select: 'bg-purple-500',
  checkbox: 'bg-yellow-500',
  radio: 'bg-yellow-600',
  label: 'bg-gray-500',
  link: 'bg-indigo-500',
  image: 'bg-pink-500',
  heading: 'bg-red-500',
  form: 'bg-orange-500',
  div: 'bg-gray-400',
  span: 'bg-gray-400',
  other: 'bg-gray-300',
};

export function ComponentsTable() {
  const { currentAnalysis } = useComponentsStore();

  if (!currentAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analiz Sonuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Henüz analiz yapılmadı. Bir URL girerek analiz başlatın.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { components, statistics } = currentAnalysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulunan Bileşenler ({statistics.totalComponents})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(statistics.componentsByType)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => (
                <div key={type} className="text-center p-2 border rounded">
                  <Badge className={componentColors[type as ComponentType]}>
                    {type}
                  </Badge>
                  <p className="text-lg font-bold mt-1">{count}</p>
                </div>
              ))}
          </div>

          {/* Components List */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="border-b sticky top-0 bg-background">
                <tr>
                  <th className="text-left p-2">Tip</th>
                  <th className="text-left p-2">Text/Label</th>
                  <th className="text-left p-2">Selector Tipi</th>
                  <th className="text-left p-2">Selector</th>
                </tr>
              </thead>
              <tbody>
                {components.slice(0, 50).map((component) => {
                  // Determine best selector type
                  const hasId = component.cssSelector?.includes('#') && !component.cssSelector?.includes(' ');
                  const selectorType = hasId ? 'ID' : 'CSS';
                  const selectorValue = hasId 
                    ? component.cssSelector 
                    : component.cssSelector;
                  
                  return (
                    <tr key={component.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Badge variant="outline">{component.type}</Badge>
                      </td>
                      <td className="p-2 max-w-xs truncate">
                        {component.text || component.placeholder || component.ariaLabel || '-'}
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant="secondary"
                          className={
                            selectorType === 'ID' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                          }
                        >
                          {selectorType}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <code className="text-xs font-mono max-w-xs truncate block">
                            {selectorValue}
                          </code>
                          {component.xpath && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                <Badge variant="outline" className="text-xs">XPath</Badge>
                              </summary>
                              <code className="text-xs font-mono block mt-1 text-muted-foreground">
                                {component.xpath}
                              </code>
                            </details>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {components.length > 50 && (
              <p className="text-center text-muted-foreground py-4">
                Ve {components.length - 50} bileşen daha...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

