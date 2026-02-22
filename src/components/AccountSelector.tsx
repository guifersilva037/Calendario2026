import { useState, useEffect } from 'react';
import { supabase, Account } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface AccountSelectorProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account) => void;
}

export function AccountSelector({ selectedAccount, onAccountSelect }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);

      if (data && data.length > 0 && !selectedAccount) {
        onAccountSelect(data[0]);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    if (!newAccountName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({ name: newAccountName })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAccounts([data, ...accounts]);
        onAccountSelect(data);
        setNewAccountName('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  async function deleteAccount(id: string) {
    try {
      await supabase.from('accounts').delete().eq('id', id);
      const updatedAccounts = accounts.filter(a => a.id !== id);
      setAccounts(updatedAccounts);
      if (selectedAccount?.id === id && updatedAccounts.length > 0) {
        onAccountSelect(updatedAccounts[0]);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }

  if (loading) {
    return <div className="text-gray-600">Carregando contas...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Contas</h2>

      <div className="space-y-2 mb-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
              ${selectedAccount?.id === account.id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
              }
            `}
          >
            <button
              onClick={() => onAccountSelect(account)}
              className="flex-1 text-left font-medium text-gray-800"
            >
              {account.name}
            </button>
            <button
              onClick={() => deleteAccount(account.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Nome da conta"
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && createAccount()}
          />
          <button
            onClick={createAccount}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Criar
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      )}
    </div>
  );
}
