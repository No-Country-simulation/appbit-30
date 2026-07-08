'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface AppDateInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'max'
> {
  value?: string | null;
  onChange: (value: string) => void;
  maxDate?: string;
  minYear?: number;
}

export function getLocalTodayIso() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isoToDisplay(value?: string | null) {
  if (!value) return '';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

function displayToIso(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length < 8) return '';

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('/');
}

export function isValidIsoDate(
  value: string,
  options: {
    maxDate?: string;
    minYear?: number;
  } = {},
) {
  const { maxDate, minYear = 1900 } = options;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const [, yearRaw, monthRaw, dayRaw] = match;

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (year < minYear) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealDate) return false;

  if (maxDate && value > maxDate) return false;

  return true;
}

function isAllowedPartialDisplayDate(
  value: string,
  options: {
    maxDate?: string;
    minYear?: number;
  },
) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (!digits) return true;

  const dayRaw = digits.slice(0, 2);
  const monthRaw = digits.slice(2, 4);
  const yearRaw = digits.slice(4, 8);

  if (dayRaw.length === 1) {
    const firstDayDigit = Number(dayRaw);
    if (firstDayDigit < 0 || firstDayDigit > 3) return false;
  }

  if (dayRaw.length === 2) {
    const day = Number(dayRaw);
    if (day < 1 || day > 31) return false;
  }

  if (monthRaw.length === 1) {
    const firstMonthDigit = Number(monthRaw);
    if (firstMonthDigit < 0 || firstMonthDigit > 1) return false;
  }

  if (monthRaw.length === 2) {
    const month = Number(monthRaw);
    if (month < 1 || month > 12) return false;
  }

  if (yearRaw.length === 4) {
    const iso = displayToIso(value);
    return isValidIsoDate(iso, options);
  }

  return true;
}

function toFormValue(
  rawValue: string,
  options: {
    maxDate?: string;
    minYear?: number;
  },
) {
  const formatted = formatDisplayDate(rawValue);

  if (!isAllowedPartialDisplayDate(formatted, options)) {
    return null;
  }

  const iso = displayToIso(formatted);

  if (!iso) {
    return formatted;
  }

  if (!isValidIsoDate(iso, options)) {
    return null;
  }

  return iso;
}

export const AppDateInput = forwardRef<HTMLInputElement, AppDateInputProps>(
  function AppDateInput(
    {
      className,
      value,
      onChange,
      onBlur,
      placeholder = 'DD/MM/AAAA',
      maxDate,
      minYear = 1900,
      ...props
    },
    ref,
  ) {
    const displayValue = isoToDisplay(value);

    return (
      <input
        ref={ref}
        type='text'
        inputMode='numeric'
        autoComplete='bday'
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          const nextValue = toFormValue(event.target.value, {
            maxDate,
            minYear,
          });

          if (nextValue === null) return;

          onChange(nextValue);
        }}
        onBlur={(event) => {
          const nextValue = toFormValue(event.target.value, {
            maxDate,
            minYear,
          });

          if (nextValue !== null) {
            onChange(nextValue);
          }

          onBlur?.(event);
        }}
        maxLength={10}
        pattern='[0-9]{2}/[0-9]{2}/[0-9]{4}'
        className={cn(
          'block h-11 w-full min-w-0 max-w-full appearance-none',
          'rounded-[8px] border border-[var(--color-input-border)]',
          'bg-[var(--color-card)] px-3 py-2',
          'font-body text-base leading-tight text-[var(--color-text)] sm:text-sm',
          'outline-none transition-colors duration-200',
          'placeholder:text-[var(--color-text-muted)]',
          'focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)]',
          className,
        )}
        {...props}
      />
    );
  },
);
