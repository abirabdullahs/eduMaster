'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export default function ExamTimer({ durationMinutes, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 300; // 5 minutes

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-500 font-mono font-bold text-lg shadow-lg",
      isWarning 
        ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" 
        : "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
    )}>
      {isWarning ? <AlertCircle size={20} /> : <Clock size={20} />}
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
