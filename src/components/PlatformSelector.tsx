import { useEffect, useState } from 'react';
import { supabase, Account, Platform } from '../lib/supabase';

interface PlatformSelectorProps {
  account: Account | null;
  selectedPlatform: Platform | null;
  onPlatformSelect: (platform: Platform) => void;
}

const AVAILABLE_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn'];

export function PlatformSelector({
  account,
  selectedPlatform,
  onPlatformSelect,
}: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;
    loadPlatforms();
  }, [account]);

  async function loadPlatforms() {
    if (!account) return;

    try {
      const { data: platformData, error: platformError } = await supabase
        .from('platforms')
        .select('*')
        .order('name');

      if (platformError) throw platformError;

      const { data: accountPlatforms, error: apError } = await supabase
        .from('account_platforms')
        .select('platform_id')
        .eq('account_id', account.id);

      if (apError) throw apError;

      const accountPlatformIds = new Set(
        accountPlatforms?.map((ap) => ap.platform_id) || []
      );

      const userPlatforms =
        platformData?.filter((p) => accountPlatformIds.has(p.id)) || [];

      setPlatforms(userPlatforms);

      if (userPlatforms.length > 0 && !selectedPlatform) {
        onPlatformSelect(userPlatforms[0]);
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addPlatform(platformName: string) {
    if (!account) return;

    try {
      let platform = await supabase
        .from('platforms')
        .select('*')
        .eq('name', platformName)
        .maybeSingle();

      if (platform.data) {
        const { error: existsError } = await supabase
          .from('account_platforms')
          .select('*')
          .eq('account_id', account.id)
          .eq('platform_id', platform.data.id)
          .maybeSingle();

        if (!existsError || !existsError) {
          await supabase.from('account_platforms').insert({
            account_id: account.id,
            platform_id: platform.data.id,
          });
        }
      } else {
        const { data: newPlatform, error: insertError } = await supabase
          .from('platforms')
          .insert({ name: platformName })
          .select()
          .single();

        if (insertError) throw insertError;

        if (newPlatform) {
          await supabase.from('account_platforms').insert({
            account_id: account.id,
            platform_id: newPlatform.id,
          });

          platform.data = newPlatform;
        }
      }

      if (platform.data) {
        setPlatforms([...platforms, platform.data]);
        onPlatformSelect(platform.data);
      }
    } catch (error) {
      console.error('Error adding platform:', error);
    }
  }

  async function removePlatform(platformId: string) {
    if (!account) return;

    try {
      await supabase
        .from('account_platforms')
        .delete()
        .eq('account_id', account.id)
        .eq('platform_id', platformId);

      const updated = platforms.filter((p) => p.id !== platformId);
      setPlatforms(updated);

      if (selectedPlatform?.id === platformId && updated.length > 0) {
        onPlatformSelect(updated[0]);
      }
    } catch (error) {
      console.error('Error removing platform:', error);
    }
  }

  if (!account || loading) {
    return <div className="text-gray-600">Carregando plataformas...</div>;
  }

  const availablePlatforms = AVAILABLE_PLATFORMS.filter(
    (name) => !platforms.some((p) => p.name === name)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Plataformas</h2>

      <div className="space-y-2 mb-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
              ${selectedPlatform?.id === platform.id
                ? 'bg-purple-100 border-2 border-purple-500'
                : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
              }
            `}
          >
            <button
              onClick={() => onPlatformSelect(platform)}
              className="flex-1 text-left font-medium text-gray-800"
            >
              {platform.name}
            </button>
            <button
              onClick={() => removePlatform(platform.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {availablePlatforms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Adicionar plataforma:</p>
          {availablePlatforms.map((name) => (
            <button
              key={name}
              onClick={() => addPlatform(name)}
              className="w-full px-4 py-2 bg-green-100 text-green-800 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors font-medium text-left"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      {availablePlatforms.length === 0 && platforms.length > 0 && (
        <p className="text-sm text-gray-500 text-center">Todas as plataformas adicionadas</p>
      )}
    </div>
  );
}
