'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
  startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  date: DateRange | undefined
  setDate: (range: DateRange | undefined) => void
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const PRIMARY = '#2E5D4B'
const PRIMARY_LIGHT = '#E6F4F1'

export function DateRangePicker({ date, setDate, className }: DateRangePickerProps) {
  const today = startOfDay(new Date())
  const [currentMonth, setCurrentMonth] = useState(today)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  function buildCalendarDays(month: Date): Date[] {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    const days: Date[] = []
    let d = start
    while (!isAfter(d, end)) {
      days.push(d)
      d = addDays(d, 1)
    }
    return days
  }

  function handleDayClick(day: Date) {
    if (isBefore(day, today)) return

    if (!date?.from || (date.from && date.to)) {
      setDate({ from: day, to: undefined })
    } else {
      if (isBefore(day, date.from)) {
        setDate({ from: day, to: undefined })
      } else {
        setDate({ from: date.from, to: day })
      }
    }
  }

  function isInRange(day: Date): boolean {
    const from = date?.from
    const to = date?.to ?? hoveredDate
    if (!from || !to) return false
    if (isBefore(to, from)) return false
    return isWithinInterval(day, { start: from, end: to }) &&
      !isSameDay(day, from) && !isSameDay(day, to)
  }

  function isSelected(day: Date): boolean {
    return (!!date?.from && isSameDay(day, date.from)) ||
      (!!date?.to && isSameDay(day, date.to))
  }

  function isRangeStart(day: Date): boolean {
    return !!date?.from && isSameDay(day, date.from)
  }

  function isRangeEnd(day: Date): boolean {
    return !!date?.to && isSameDay(day, date.to)
  }

  const days = buildCalendarDays(currentMonth)

  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm select-none ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} color={PRIMARY} />
        </button>
        <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} color={PRIMARY} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-2 pb-2">
        {days.map((day, i) => {
          const isPast = isBefore(day, today) && !isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const selected = isSelected(day)
          const inRange = isInRange(day)
          const isStart = isRangeStart(day)
          const isEnd = isRangeEnd(day)
          const isToday = isSameDay(day, today)

          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
              style={{ height: 36 }}
            >
              {/* Range background strip */}
              {inRange && (
                <div
                  className="absolute inset-y-1 inset-x-0"
                  style={{ backgroundColor: PRIMARY_LIGHT }}
                />
              )}
              {/* Half-strip on start (right half) */}
              {isStart && date?.to && (
                <div
                  className="absolute inset-y-1 right-0 left-1/2"
                  style={{ backgroundColor: PRIMARY_LIGHT }}
                />
              )}
              {/* Half-strip on end (left half) */}
              {isEnd && (
                <div
                  className="absolute inset-y-1 left-0 right-1/2"
                  style={{ backgroundColor: PRIMARY_LIGHT }}
                />
              )}

              <button
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isPast}
                className={[
                  'relative z-10 w-8 h-8 rounded-full text-sm transition-colors',
                  isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer',
                  !isCurrentMonth ? 'text-gray-300' : '',
                  selected
                    ? 'text-white font-semibold'
                    : inRange
                      ? 'text-gray-700'
                      : isToday && !selected
                        ? 'font-bold'
                        : isCurrentMonth && !isPast
                          ? 'hover:bg-gray-100 text-gray-700'
                          : '',
                ].join(' ')}
                style={
                  selected
                    ? { backgroundColor: PRIMARY }
                    : isToday && !selected
                      ? { color: PRIMARY }
                      : {}
                }
              >
                {format(day, 'd')}
              </button>
            </div>
          )
        })}
      </div>

      {/* Selected range display */}
      <div className="px-4 pb-3 pt-1 border-t border-gray-100 text-sm text-gray-500">
        {date?.from ? (
          date.to ? (
            <span>
              <span className="font-semibold" style={{ color: PRIMARY }}>
                {format(date.from, 'MMM dd, yyyy')}
              </span>
              {' — '}
              <span className="font-semibold" style={{ color: PRIMARY }}>
                {format(date.to, 'MMM dd, yyyy')}
              </span>
            </span>
          ) : (
            <span className="font-semibold" style={{ color: PRIMARY }}>
              {format(date.from, 'MMM dd, yyyy')} — select check-out
            </span>
          )
        ) : (
          <span>Select check-in date</span>
        )}
      </div>
    </div>
  )
}
