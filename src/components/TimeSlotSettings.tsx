import { useEffect, useState } from 'react';
import { supabase, Account, Platform, TimeSlot } from '../lib/supabase';
import { Save } from 'lucide-react';

interface TimeSlotSettingsProps {
  account: Account | null;
  platform: Platform | null;
  onSlotsSaved?: () => void;
}

export function TimeSlotSettings({
  account,
  platform,
  onSlotsSaved,
}: TimeSlotSettingsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [times, setTimes] = useState(['07:00', '12:00', '18:00']);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (!account || !platform) return;
    loadTimeSlots();
  }, [account, platform]);

  async function loadTimeSlots() {
    if (!account || !platform) return;

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('account_id', account.id)
        .eq('platform_id', platform.id)
        .order('slot_order');

      if (error) throw error;

      if (data && data.length === 3) {
        setSlots(data);
        setTimes(data.map((s) => s.time));
      } else {
        setSlots([]);
        setTimes(['07:00', '12:00', '18:00']);
      }
      setIsSaved(true);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleTimeChange(index: number, newTime: string) {
    const newTimes = [...times];
    newTimes[index] = newTime;
    setTimes(newTimes);
    setIsSaved(false);
  }

  async function saveTimeSlots() {
    if (!account || !platform) return;

    try {
      await supabase
        .from('time_slots')
        .delete()
        .eq('account_id', account.id)
        .eq('platform_id', platform.id);

      const newSlots = times.map((time, index) => ({
        account_id: account.id,
        platform_id: platform.id,
        slot_order: index + 1,
        time,
      }));

      const { data, error } = await supabase
        .from('time_slots')
        .insert(newSlots)
        .select();

      if (error) throw error;

      setSlots(data || []);
      setIsSaved(true);
      onSlotsSaved?.();
    } catch (error) {
      console.error('Error saving time slots:', error);
    }
  }

  if (!account || !platform || loading) {
    return <div className="text-gray-600">Carregando horários...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Horários Fixos</h2>

      <p className="text-sm text-gray-600 mb-4">
        Configure os 3 horários para {account.name} em {platform.name}
      </p>

      <div className="space-y-3 mb-6">
        {times.map((time, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="font-medium text-gray-700 w-16">Slot {index + 1}:</span>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveTimeSlots}
        disabled={isSaved}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
          ${isSaved
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >
        <Save size={20} />
        {isSaved ? 'Salvo' : 'Salvar Horários'}
      </button>

      {slots.length === 3 && (
        <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Horários configurados e ativos
          </p>
        </div>
      )}
    </div>
  );
}
