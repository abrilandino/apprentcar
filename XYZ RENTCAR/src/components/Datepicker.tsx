import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export type DatepickerVariant = 'default' | 'focused' | 'open' | 'error' | 'disabled';

interface DatepickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
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
}

export function Datepicker({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  error,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  disabledDates,
  className,
  showError = true,
  tooltip
}: DatepickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const currentVariant: DatepickerVariant = disabled 
    ? 'disabled' 
    : hasError 
    ? 'error' 
    : isOpen 
    ? 'open' 
    : isFocused 
    ? 'focused' 
    : 'default';

  const handleDateSelect = (date: Date | undefined) => {
    onChange?.(date);
    setIsOpen(false);
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

  return (
    <div className={cn('space-y-2', className)}>
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

      <Popover open={isOpen && !disabled} onOpenChange={setIsOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full justify-start text-left transition-all duration-200',
              'hover:bg-gray-50 cursor-pointer',
              !value && 'text-muted-foreground',
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
              {value ? format(value, 'dd/MM/yyyy', { locale: es }) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 shadow-lg border-2" 
          align="start" 
          style={{ zIndex: 9999 }}
          sideOffset={5}
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus
              disabled={getDisabledDates}
              locale={es}
              className="rounded-md"
            />
          </div>
        </PopoverContent>
      </Popover>

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
