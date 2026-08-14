import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface AppleGlassDateTimePickerProps {
  label: string;
  value: string; // ISO or 'YYYY-MM-DDTHH:mm'
  onChange: (val: string) => void;
  minDate?: string;
}

export const AppleGlassDateTimePicker: React.FC<AppleGlassDateTimePickerProps> = ({
  label,
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parse initial date & 24h time
  const initialDate = value ? new Date(value) : new Date();
  if (isNaN(initialDate.getTime())) {
    initialDate.setTime(Date.now());
  }

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // 24-Hour Time States (0 - 23 hours, 0 - 59 mins)
  const [hours24, setHours24] = useState<number>(initialDate.getHours());
  const [minutes, setMinutes] = useState<number>(initialDate.getMinutes());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setHours24(d.getHours());
        setMinutes(d.getMinutes());
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthsList = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const emitValue = (newDate: Date, h: number, m: number) => {
    const yr = newDate.getFullYear();
    const mo = String(newDate.getMonth() + 1).padStart(2, '0');
    const da = String(newDate.getDate()).padStart(2, '0');
    const hr = String(h).padStart(2, '0');
    const mi = String(m).padStart(2, '0');

    const formattedIso = `${yr}-${mo}-${da}T${hr}:${mi}`;
    onChange(formattedIso);
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(d);
    emitValue(d, hours24, minutes);
  };

  const handleTime24Change = (h: number, m: number) => {
    setHours24(h);
    setMinutes(m);
    emitValue(selectedDate, h, m);
  };

  const handleClear = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setHours24(9);
    setMinutes(0);
    emitValue(now, 9, 0);
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    emitValue(now, hours24, minutes);
  };

  const formatDisplayValue = () => {
    if (!value) return 'Select Date & Time';
    const d = selectedDate;
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')} hrs`;
    return `${dateStr}, ${timeStr}`;
  };

  const hoursArray = Array.from({ length: 24 }).map((_, i) => i);
  const minutesArray = Array.from({ length: 60 }).map((_, i) => i);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs sm:text-sm font-semibold text-[#172033] mb-1.5">
        {label}
      </label>

      {/* Compact Input Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 text-sm text-[#172033] font-semibold flex items-center justify-between shadow-2xs transition-all focus:outline-none focus:border-blue-600 cursor-pointer"
      >
        <div className="flex items-center space-x-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#007aff] shrink-0" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* ULTRA-COMPACT APPLE GLASSMORPHIC SIDE-BY-SIDE POPOVER */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 w-[320px] max-w-[90vw] p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-xl text-[#172033] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
          
          <div className="flex gap-3">
            
            {/* LEFT PANEL: COMPACT APPLE CALENDAR */}
            <div className="flex-1 min-w-0 pr-2 border-r border-slate-200/80">
              {/* Header: Month & Prev/Next */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 mb-2">
                <span className="font-bold text-xs text-[#172033]">
                  {monthsList[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center space-x-0.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-0.5 rounded hover:bg-slate-100 text-slate-700"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-0.5 rounded hover:bg-slate-100 text-slate-700"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-slate-500 mb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-6" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected =
                    selectedDate.getDate() === dayNum &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getFullYear() === viewYear;

                  return (
                    <button
                      type="button"
                      key={`day-${dayNum}`}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-6 w-6 mx-auto rounded font-bold text-[11px] transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#007aff] text-white shadow-2xs'
                          : 'hover:bg-slate-100 text-[#172033]'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] font-bold">
                <button type="button" onClick={handleClear} className="text-[#007aff] hover:underline">
                  Clear
                </button>
                <button type="button" onClick={handleToday} className="text-[#007aff] hover:underline">
                  Today
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: COMPACT APPLE DUAL WHEEL TIME PICKER */}
            <div className="w-24 shrink-0 flex flex-col">
              {/* Active Selection Boxes */}
              <div className="grid grid-cols-2 gap-1 mb-1.5">
                <div className="bg-[#007aff] text-white rounded py-1 text-center font-bold text-xs shadow-2xs">
                  {String(hours24).padStart(2, '0')}
                </div>
                <div className="bg-[#007aff] text-white rounded py-1 text-center font-bold text-xs shadow-2xs">
                  {String(minutes).padStart(2, '0')}
                </div>
              </div>

              {/* Dual Scroll Wheels */}
              <div className="grid grid-cols-2 gap-1 h-36 border border-slate-200 rounded-lg bg-slate-50/80 p-0.5 overflow-hidden">
                {/* Hours Wheel */}
                <div className="overflow-y-auto custom-scrollbar space-y-0.5">
                  {hoursArray.map(h => (
                    <button
                      type="button"
                      key={`h-${h}`}
                      onClick={() => handleTime24Change(h, minutes)}
                      className={`w-full py-1 text-center font-semibold text-[10px] rounded transition-colors cursor-pointer ${
                        hours24 === h ? 'bg-[#007aff] text-white font-bold' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  ))}
                </div>

                {/* Minutes Wheel */}
                <div className="overflow-y-auto custom-scrollbar space-y-0.5">
                  {minutesArray.map(m => (
                    <button
                      type="button"
                      key={`m-${m}`}
                      onClick={() => handleTime24Change(hours24, m)}
                      className={`w-full py-1 text-center font-semibold text-[10px] rounded transition-colors cursor-pointer ${
                        minutes === m ? 'bg-[#007aff] text-white font-bold' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
