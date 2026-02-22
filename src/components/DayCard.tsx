import { TimeBlock } from './TimeBlock';

interface DayCardProps {
  date: Date;
  completedSlots: Set<string>;
  onToggleSlot: (date: string, timeSlot: string) => void;
  timeSlots?: string[];
}

export function DayCard({ date, completedSlots, onToggleSlot, timeSlots = ['07:00', '12:00', '18:00'] }: DayCardProps) {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'short' });

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className={`
      bg-gradient-to-br ${isWeekend ? 'from-blue-50 to-blue-100' : 'from-gray-50 to-gray-100'}
      rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow
    `}>
      <div className="text-center mb-3">
        <div className="text-xs font-semibold text-gray-500 uppercase">
          {dayOfWeek}
        </div>
        <div className="text-2xl font-bold text-gray-800">
          {dayOfMonth}
        </div>
        <div className="text-xs text-gray-600">
          {month}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {timeSlots.map((timeSlot) => {
          const key = `${dateStr}-${timeSlot}`;
          const isCompleted = completedSlots.has(key);

          return (
            <TimeBlock
              key={timeSlot}
              time={timeSlot}
              isCompleted={isCompleted}
              onClick={() => onToggleSlot(dateStr, timeSlot)}
            />
          );
        })}
      </div>
    </div>
  );
}
