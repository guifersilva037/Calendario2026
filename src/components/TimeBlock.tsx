import { Check } from 'lucide-react';

interface TimeBlockProps {
  time: string;
  isCompleted: boolean;
  onClick: () => void;
}

export function TimeBlock({ time, isCompleted, onClick }: TimeBlockProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
        ${isCompleted
          ? 'bg-green-500 text-white shadow-md'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50'
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{time}</span>
        {isCompleted && <Check size={16} className="stroke-[3]" />}
      </div>
    </button>
  );
}
