import { useEffect, useState } from 'react';
import { DayCard } from './DayCard';
import { supabase, CalendarEntry, Account, Platform, TimeSlot } from '../lib/supabase';
import { Calendar as CalendarIcon, Loader2, Settings } from 'lucide-react';

function generateDaysOf2026() {
  const days: Date[] = [];
  const year = 2026;

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
  }

  return days;
}

interface CalendarProps {
  account: Account | null;
  platform: Platform | null;
  onSettingsClick?: () => void;
}

export function Calendar({ account, platform, onSettingsClick }: CalendarProps) {
  const [completedSlots, setCompletedSlots] = useState<Set<string>>(new Set());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const days = generateDaysOf2026();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const filteredDays = selectedMonth === 0
    ? days
    : days.filter(d => d.getMonth() === selectedMonth - 1);

  useEffect(() => {
    if (!account || !platform) return;
    loadData();
  }, [account, platform]);

  async function loadData() {
    if (!account || !platform) return;

    try {
      const [completedData, slotsData] = await Promise.all([
        supabase
          .from('calendar_entries')
          .select('*')
          .eq('account_id', account.id)
          .eq('platform_id', platform.id)
          .eq('is_completed', true),
        supabase
          .from('time_slots')
          .select('*')
          .eq('account_id', account.id)
          .eq('platform_id', platform.id)
          .order('slot_order')
      ]);

      const completed = new Set<string>();
      completedData.data?.forEach((entry: CalendarEntry) => {
        completed.add(`${entry.date}-${entry.time_slot}`);
      });

      setCompletedSlots(completed);
      setTimeSlots(slotsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSlot(date: string, timeSlot: string) {
    if (!account || !platform) return;

    const key = `${date}-${timeSlot}`;
    const isCurrentlyCompleted = completedSlots.has(key);

    const newCompletedSlots = new Set(completedSlots);
    if (isCurrentlyCompleted) {
      newCompletedSlots.delete(key);
    } else {
      newCompletedSlots.add(key);
    }
    setCompletedSlots(newCompletedSlots);

    try {
      const { data: existingEntry } = await supabase
        .from('calendar_entries')
        .select('*')
        .eq('account_id', account.id)
        .eq('platform_id', platform.id)
        .eq('date', date)
        .eq('time_slot', timeSlot)
        .maybeSingle();

      if (existingEntry) {
        await supabase
          .from('calendar_entries')
          .update({
            is_completed: !isCurrentlyCompleted,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        await supabase
          .from('calendar_entries')
          .insert({
            account_id: account.id,
            platform_id: platform.id,
            date,
            time_slot: timeSlot,
            is_completed: true
          });
      }
    } catch (error) {
      console.error('Error toggling slot:', error);
      setCompletedSlots(completedSlots);
    }
  }

  const displayTimes = timeSlots.length > 0
    ? timeSlots.map(s => s.time)
    : ['07:00', '12:00', '18:00'];

  const totalSlots = filteredDays.length * displayTimes.length;
  const completedCount = Array.from(completedSlots).filter(key => {
    const date = key.split('-').slice(0, 3).join('-');
    const dateObj = new Date(date + 'T00:00:00');
    return selectedMonth === 0 || dateObj.getMonth() === selectedMonth - 1;
  }).length;
  const completionPercentage = totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;

  if (!account || !platform) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">Selecione uma conta e plataforma para começar</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <CalendarIcon className="mx-auto mb-4 text-blue-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Horários não configurados</h2>
          <p className="text-gray-600 mb-6">
            Configure os 3 horários fixos para {account.name} em {platform.name} antes de usar o calendário.
          </p>
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Settings size={20} />
            Ir para Configurações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="text-blue-600" size={32} />
                <h1 className="text-4xl font-bold text-gray-800">Calendário 2026</h1>
              </div>
              <p className="text-gray-600 ml-11">
                {account.name} • {platform.name}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:border-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value={0}>Todos os meses</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-md">
                <div className="text-sm font-medium">Progresso</div>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="text-xs opacity-90">{completedCount}/{totalSlots}</div>
              </div>

              <button
                onClick={onSettingsClick}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings size={24} className="text-gray-700" />
              </button>
            </div>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {filteredDays.map((day, index) => (
            <DayCard
              key={index}
              date={day}
              completedSlots={completedSlots}
              onToggleSlot={toggleSlot}
              timeSlots={displayTimes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
