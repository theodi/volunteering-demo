"use client";

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0] as const;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const TIME_PERIODS: { label: string; startHour: number; isMorning?: boolean; isAfternoon?: boolean; isEvening?: boolean; isNight?: boolean }[] = [
  { label: "MORNING", startHour: 6, isMorning: true },
  { label: "AFTERNOON", startHour: 12, isAfternoon: true },
  { label: "EVENING", startHour: 17, isEvening: true },
  { label: "NIGHT", startHour: 21, isNight: true },
];

const TIME_COL_WIDTH = 80;
const GRID_COLS = `${TIME_COL_WIDTH}px repeat(7, 1fr)`;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function slotKey(dayIndex: number, hour: number): string {
  return `${dayIndex}-${hour}`;
}

function periodForHour(hour: number): (typeof TIME_PERIODS)[number] | null {
  for (const p of TIME_PERIODS) {
    if (p.startHour === hour) return p;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Drag helpers
// ---------------------------------------------------------------------------

type DragState = {
  adding: boolean;
  startDay: number;
  startHour: number;
  currentDay: number;
  currentHour: number;
} | null;

function getDragSlots(drag: NonNullable<DragState>): Set<string> {
  const minDay = Math.min(drag.startDay, drag.currentDay);
  const maxDay = Math.max(drag.startDay, drag.currentDay);
  const startIdx = HOURS.indexOf(drag.startHour as (typeof HOURS)[number]);
  const curIdx = HOURS.indexOf(drag.currentHour as (typeof HOURS)[number]);
  const minIdx = Math.min(startIdx, curIdx);
  const maxIdx = Math.max(startIdx, curIdx);
  const slots = new Set<string>();
  for (let d = minDay; d <= maxDay; d++) {
    for (let h = minIdx; h <= maxIdx; h++) {
      slots.add(slotKey(d, HOURS[h]));
    }
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Contiguous block detection (per column)
// ---------------------------------------------------------------------------

type Block = { startIdx: number; endIdx: number; hours: number };

function findBlocks(selected: Set<string>, dayIndex: number): Block[] {
  const blocks: Block[] = [];
  let blockStart: number | null = null;

  for (let i = 0; i < HOURS.length; i++) {
    const sel = selected.has(slotKey(dayIndex, HOURS[i]));
    if (sel && blockStart === null) {
      blockStart = i;
    } else if (!sel && blockStart !== null) {
      blocks.push({ startIdx: blockStart, endIdx: i - 1, hours: i - blockStart });
      blockStart = null;
    }
  }
  if (blockStart !== null) {
    blocks.push({
      startIdx: blockStart,
      endIdx: HOURS.length - 1,
      hours: HOURS.length - blockStart,
    });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type AvailabilitySchedulerProps = {
  weekStart: Date;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AvailabilityScheduler({ weekStart }: AvailabilitySchedulerProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<DragState>(null);
  const [now, setNow] = useState(() => new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const isToday = useCallback(
    (dayIndex: number) => {
      const d = weekDates[dayIndex];
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    },
    [weekDates, now],
  );

  // -- Drag to select -------------------------------------------------------

  const handleCellDown = useCallback(
    (dayIndex: number, hour: number) => {
      const adding = !selectedSlots.has(slotKey(dayIndex, hour));
      setDragState({
        adding,
        startDay: dayIndex,
        startHour: hour,
        currentDay: dayIndex,
        currentHour: hour,
      });
    },
    [selectedSlots],
  );

  const handleCellEnter = useCallback(
    (dayIndex: number, hour: number) => {
      setDragState((prev) =>
        prev ? { ...prev, currentDay: dayIndex, currentHour: hour } : null,
      );
    },
    [],
  );

  const commitDrag = useCallback(() => {
    if (!dragState) return;
    const slots = getDragSlots(dragState);
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      for (const key of slots) {
        if (dragState.adding) next.add(key);
        else next.delete(key);
      }
      return next;
    });
    setDragState(null);
  }, [dragState]);

  // -- Derived state --------------------------------------------------------

  const effectiveSelection = useMemo(() => {
    if (!dragState) return selectedSlots;
    const eff = new Set(selectedSlots);
    const slots = getDragSlots(dragState);
    for (const key of slots) {
      if (dragState.adding) eff.add(key);
      else eff.delete(key);
    }
    return eff;
  }, [selectedSlots, dragState]);

  const hourIdx = HOURS.indexOf(now.getHours() as (typeof HOURS)[number]);
  const showTimeLine = hourIdx >= 0;
  const timeLineTop = showTimeLine
    ? ((hourIdx + now.getMinutes() / 60) / HOURS.length) * 100
    : 0;

  // -- Render ---------------------------------------------------------------

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <div
        ref={gridRef}
        className="relative min-w-[700px] select-none"
        onMouseUp={commitDrag}
        onMouseLeave={commitDrag}
      >
        {/* Day header row */}
        <div
          className="sticky top-0 z-20 grid border-b border-sparkling-silver/60 bg-white"
          style={{ gridTemplateColumns: GRID_COLS }}
        >
          <div className="min-w-[80px] w-full flex items-center justify-center border-r border-slate-100 py-3 sm:py-7">
            <ClockIcon className="h-5 w-5 text-slate-300" />
          </div>
          {weekDates.map((date, i) => {
            const today = isToday(i);
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-3 sm:py-7 text-center ${i < 6 ? "border-r border-slate-100" : ""
                  } ${today ? "bg-primary/3" : ""}`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${today ? "text-primary" : "text-slate-400"
                    }`}
                >
                  {DAY_LABELS[i]}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center text-sm font-medium ${today ? "rounded-full bg-primary text-white drop-shadow-xl" : "text-slate-700"
                    }`}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid body */}
        <div className="relative">
          <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>
            {HOURS.map((hour, rowIdx) => {
              const period = periodForHour(hour);
              return (
                <div key={rowIdx} className="contents">
                  {/* Time label */}
                  <div
                    className={`min-w-[80px] w-full flex flex-col justify-center items-center border-r border-slate-100 px- py-1.5 text-center bg-white ${rowIdx < HOURS.length - 1 ? "border-b border-b-slate-100" : ""
                      }`}
                    style={{ minHeight: 55 }}
                  >
                    {period && (
                      <span
                        className={`text-[10px] font-bold uppercase leading-tight py-[2px] px-2 rounded-full mb-2 ${period.isMorning ? "bg-blue-50 text-blue-400" : period.isAfternoon ? "bg-orange-50 text-orange-400" : period.isEvening ? "bg-yellow-100 text-yellow-600" : "text-gray-900"
                          } ${period.isNight ? "bg-slate-100 text-slate-500" : ""}`}
                      >
                        {period.label}
                      </span>
                    )}
                    <span className="text-xs leading-tight text-slate-400 font-medium">
                      {formatHour(hour)}
                    </span>
                  </div>

                  {/* Day cells */}
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const key = slotKey(dayIdx, hour);
                    let selected = selectedSlots.has(key);
                    if (dragState) {
                      const dragSlots = getDragSlots(dragState);
                      if (dragSlots.has(key)) selected = dragState.adding;
                    }
                    return (
                      <div
                        key={dayIdx}
                        className={`relative cursor-pointer bg-slate-50 hover:bg-slate-100 border-r border-slate-200 last:border-r-0 ${rowIdx < HOURS.length - 1 ? "border-b border-b-slate-100" : ""
                          } ${isToday(dayIdx) ? "bg-primary/3" : ""}`}
                        style={{ minHeight: 40 }}
                        onMouseDown={(e: ReactMouseEvent) => {
                          e.preventDefault();
                          handleCellDown(dayIdx, hour);
                        }}
                        onMouseEnter={() => handleCellEnter(dayIdx, hour)}
                        role="gridcell"
                        aria-label={`${DAY_LABELS[dayIdx]} ${formatHour(hour)}`}
                        aria-selected={selected}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Selected block overlays */}
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const blocks = findBlocks(effectiveSelection, dayIdx);
            return blocks.map((block, bIdx) => {
              const top = (block.startIdx / HOURS.length) * 100;
              const height =
                ((block.endIdx - block.startIdx + 1) / HOURS.length) * 100;
              return (
                <div
                  key={`${dayIdx}-${bIdx}`}
                  className="pointer-events-none absolute rounded-md border-l-[3px] border-l-primary bg-lavender/70"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    left: `calc(${TIME_COL_WIDTH}px + (100% - ${TIME_COL_WIDTH}px) * ${dayIdx} / 7)`,
                    width: `calc((100% - ${TIME_COL_WIDTH}px) / 7)`,
                  }}
                >
                  <div className="flex h-full flex-col justify-between p-1.5">
                    <div className="flex items-start gap-1">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-[10px] font-semibold uppercase leading-tight text-primary">
                        Available
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-primary">
                      {block.hours === 1 ? "1 Hr" : `${block.hours} Hrs`}
                    </span>
                  </div>
                </div>
              );
            });
          })}

          {/* Current time indicator */}
          {showTimeLine && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
              style={{ top: `${timeLineTop}%` }}
            >
              <span className="h-2 w-2 -translate-x-0.5 rounded-full bg-red-500" />
              <span className="h-px flex-1 bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
