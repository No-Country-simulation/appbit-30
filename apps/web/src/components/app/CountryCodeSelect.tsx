import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface CountryOption {
  flag: string;
  code: string;
  label: string;
}

const countries: CountryOption[] = [
  { flag: '🇦🇷', code: '+54', label: 'Argentina (AR)' },
  { flag: '🇧🇷', code: '+55', label: 'Brasil (BR)' },
  { flag: '🇨🇱', code: '+56', label: 'Chile (CL)' },
  { flag: '🇨🇴', code: '+57', label: 'Colombia (CO)' },
  { flag: '🇲🇽', code: '+52', label: 'México (MX)' },
  { flag: '🇵🇪', code: '+51', label: 'Perú (PE)' },
  { flag: '🇺🇾', code: '+598', label: 'Uruguay (UY)' },
  { flag: '🇵🇾', code: '+595', label: 'Paraguay (PY)' },
  { flag: '🇧🇴', code: '+591', label: 'Bolivia (BO)' },
  { flag: '🇪🇨', code: '+593', label: 'Ecuador (EC)' },
  { flag: '🇻🇪', code: '+58', label: 'Venezuela (VE)' },
  { flag: '🇨🇺', code: '+53', label: 'Cuba (CU)' },
  { flag: '🇩🇴', code: '+1', label: 'República Dominicana (DO)' },
  { flag: '🇬🇹', code: '+502', label: 'Guatemala (GT)' },
  { flag: '🇭🇳', code: '+504', label: 'Honduras (HN)' },
  { flag: '🇸🇻', code: '+503', label: 'El Salvador (SV)' },
  { flag: '🇳🇮', code: '+505', label: 'Nicaragua (NI)' },
  { flag: '🇨🇷', code: '+506', label: 'Costa Rica (CR)' },
  { flag: '🇵🇦', code: '+507', label: 'Panamá (PA)' },
  { flag: '🇪🇸', code: '+34', label: 'España (ES)' },
  { flag: '🇺🇸', code: '+1', label: 'Estados Unidos (US)' },
  { flag: '🇬🇧', code: '+44', label: 'Reino Unido (UK)' },
  { flag: '🇵🇹', code: '+351', label: 'Portugal (PT)' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
}

export function CountryCodeSelect({ value, onChange, onOpenChange, placeholder }: CountryCodeSelectProps) {
  const selected = countries.find((c) => c.code === value);

  return (
    <Select value={value} onValueChange={onChange} onOpenChange={onOpenChange}>
      <SelectTrigger className='w-full px-4 py-[14px] rounded-[8px] border border-[var(--color-input-border)] bg-[var(--color-card)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)] data-[size=default]:!h-auto'>
        <SelectValue placeholder={placeholder}>
          {selected ? `${selected.flag} ${selected.code} (${selected.label.split('(')[1]?.replace(')', '') || ''})` : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={`${country.code}-${country.label}`} value={country.code}>
            {country.flag} {country.code} ({country.label.split('(')[1]?.replace(')', '') || country.label})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
