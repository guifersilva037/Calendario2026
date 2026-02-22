import { useState } from 'react';
import { Account, Platform } from './lib/supabase';
import { Calendar } from './components/Calendar';
import { AccountSelector } from './components/AccountSelector';
import { PlatformSelector } from './components/PlatformSelector';
import { TimeSlotSettings } from './components/TimeSlotSettings';
import { Settings, X } from 'lucide-react';

function App() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {!showSettings && (
          <aside className="w-80 bg-white shadow-lg overflow-y-auto hidden md:flex flex-col gap-6 p-6">
            <AccountSelector
              selectedAccount={selectedAccount}
              onAccountSelect={setSelectedAccount}
            />
            <PlatformSelector
              account={selectedAccount}
              selectedPlatform={selectedPlatform}
              onPlatformSelect={setSelectedPlatform}
            />
          </aside>
        )}

        <main className="flex-1 overflow-auto">
          {showSettings ? (
            <div className="min-h-screen p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="text-blue-600" size={32} />
                    <h1 className="text-4xl font-bold text-gray-800">Configurações</h1>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-gray-700" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Contas e Plataformas</h2>
                    <AccountSelector
                      selectedAccount={selectedAccount}
                      onAccountSelect={setSelectedAccount}
                    />
                  </div>

                  {selectedAccount && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <PlatformSelector
                        account={selectedAccount}
                        selectedPlatform={selectedPlatform}
                        onPlatformSelect={setSelectedPlatform}
                      />
                    </div>
                  )}

                  {selectedAccount && selectedPlatform && (
                    <TimeSlotSettings
                      account={selectedAccount}
                      platform={selectedPlatform}
                      onSlotsSaved={() => setShowSettings(false)}
                    />
                  )}

                  {(!selectedAccount || !selectedPlatform) && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-amber-800">
                      <p className="font-medium">Selecione uma conta e plataforma para configurar os horários</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Calendar
              account={selectedAccount}
              platform={selectedPlatform}
              onSettingsClick={() => setShowSettings(true)}
            />
          )}
        </main>
      </div>

      {!showSettings && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Settings size={24} />
            Configurar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
