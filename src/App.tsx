/**
 * Main App Component
 * Routes and global layout
 */

import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Button } from './components/ui/button';
import { useAppStore } from './hooks/useAppStore';
import { Home, Settings as SettingsIcon, Github } from 'lucide-react';

function App() {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">BugEra AIScout</h2>
              <p className="text-xs text-muted-foreground">AI Test Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('settings')}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'settings' && <Settings />}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            BugEra AIScout - AI destekli test senaryosu üretim platformu
          </p>
          <p className="mt-2">
            Playwright × Hugging Face × React × TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

