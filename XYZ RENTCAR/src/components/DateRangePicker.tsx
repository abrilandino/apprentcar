import { useState, useRef, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { CalendarIcon, AlertCircle, X } from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export type DateRangePickerVariant = 'default' | 'focused' | 'open' | 'error' | 'disabled';

interface DateRangePickerProps {
  label?: string;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
  className?: string;
  showError?: boolean;
  tooltip?: string;
  numberOfMonths?: 1 | 2;
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar rango de fechas',
  error,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  disabledDates,
  className,
  showError = true,
  tooltip,
  numberOfMonths = 1
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const currentVariant: DateRangePickerVariant = disabled 
    ? 'disabled' 
    : hasError 
    ? 'error' 
    : isOpen 
    ? 'open' 
    : isFocused 
    ? 'focused' 
    : 'default';

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    onChange?.(range);
    // Solo cerrar cuando ambas fechas están seleccionadas
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const handleClearRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  const getDisabledDates = (date: Date) => {
    // Deshabilitar fechas pasadas si no se especifica minDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!minDate && date < today) {
      return true;
    }

    // Aplicar restricciones de minDate y maxDate
    if (minDate && date < minDate) {
      return true;
    }

    if (maxDate && date > maxDate) {
      return true;
    }

    // Aplicar función personalizada de fechas deshabilitadas
    if (disabledDates) {
      return disabledDates(date);
    }

    return false;
  };

  const formatDateRange = () => {
    if (!value?.from) {
      return placeholder;
    }

    if (value.from && !value.to) {
      return format(value.from, 'dd/MM/yyyy', { locale: es });
    }

    if (value.from && value.to) {
      return `${format(value.from, 'dd/MM/yyyy', { locale: es })} - ${format(value.to, 'dd/MM/yyyy', { locale: es })}`;
    }

    return placeholder;
  };

  const hasValue = value?.from || value?.to;

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <Label className={cn(
          'block',
          hasError && 'text-red-600',
          disabled && 'text-gray-400'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {tooltip && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({tooltip})
            </span>
          )}
        </Label>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full justify-start text-left transition-all duration-200',
            'hover:bg-gray-50 cursor-pointer',
            !hasValue && 'text-muted-foreground',
            // Variantes visuales
            currentVariant === 'focused' && 'ring-2 ring-neutral-500 ring-offset-2',
            currentVariant === 'open' && 'ring-2 ring-neutral-500 ring-offset-2 bg-gray-50',
            currentVariant === 'error' && 'border-red-500 ring-2 ring-red-200 hover:bg-red-50',
            currentVariant === 'disabled' && 'opacity-50 cursor-not-allowed bg-gray-100',
            // Estado por defecto
            currentVariant === 'default' && 'hover:border-gray-400'
          )}
          aria-label={label || placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        >
          <CalendarIcon className={cn(
            'mr-2 h-4 w-4 flex-shrink-0 transition-colors',
            hasError && 'text-red-500',
            disabled && 'text-gray-400',
            isOpen && 'text-neutral-500'
          )} />
          <span className="flex-1 truncate">
            {formatDateRange()}
          </span>
          {hasValue && !disabled && (
            <X
              className="h-4 w-4 ml-2 opacity-50 hover:opacity-100 transition-opacity"
              onClick={handleClearRange}
            />
          )}
        </Button>

        {/* Calendar Dropdown */}
        {isOpen && !disabled && (
          <div
            ref={calendarRef}
            className="absolute left-0 top-full mt-2 z-[9999] bg-white dark:bg-[#272727] rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
            style={{ 
              minWidth: numberOfMonths === 2 ? '650px' : '320px',
              maxWidth: numberOfMonths === 2 ? '650px' : '320px',
            }}
          >
            <div className="p-3">
              <Calendar
                mode="range"
                selected={value}
                onSelect={handleRangeSelect}
                disabled={getDisabledDates}
                locale={es}
                className="rounded-md"
                numberOfMonths={numberOfMonths}
              />
              <div className="border-t dark:border-gray-700 mt-3 pt-3 px-2 flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400">
                <span>
                  {value?.from && value?.to 
                    ? `${Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24))} día(s)`
                    : 'Selecciona las fechas'}
                </span>
                {hasValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.(undefined);
                    }}
                    className="h-7 text-xs"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {showError && hasError && (
        <div 
          id={`${label}-error`}
          className="flex items-start gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}