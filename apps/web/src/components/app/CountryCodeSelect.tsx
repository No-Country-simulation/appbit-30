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
  phoneLength: number;
  phoneHint: string;
  phoneBlocks: number[];
}

const countries: CountryOption[] = [
  { flag: '🇦🇷', code: '+54', label: 'Argentina (AR)', phoneLength: 10, phoneHint: '11 1234-5678', phoneBlocks: [2, 4, 4] },
  { flag: '🇧🇷', code: '+55', label: 'Brasil (BR)', phoneLength: 11, phoneHint: '83 9 8888 8888', phoneBlocks: [2, 1, 4, 4] },
  { flag: '🇨🇱', code: '+56', label: 'Chile (CL)', phoneLength: 9, phoneHint: '9 1234 5678', phoneBlocks: [1, 4, 4] },
  { flag: '🇨🇴', code: '+57', label: 'Colombia (CO)', phoneLength: 10, phoneHint: '300 123 4567', phoneBlocks: [3, 3, 4] },
  { flag: '🇲🇽', code: '+52', label: 'México (MX)', phoneLength: 10, phoneHint: '55 1234 5678', phoneBlocks: [2, 4, 4] },
  { flag: '🇵🇪', code: '+51', label: 'Perú (PE)', phoneLength: 9, phoneHint: '987 654 321', phoneBlocks: [3, 3, 3] },
  { flag: '🇺🇾', code: '+598', label: 'Uruguay (UY)', phoneLength: 8, phoneHint: '98 123 456', phoneBlocks: [2, 3, 3] },
  { flag: '🇵🇾', code: '+595', label: 'Paraguay (PY)', phoneLength: 9, phoneHint: '981 234 567', phoneBlocks: [3, 3, 3] },
  { flag: '🇧🇴', code: '+591', label: 'Bolivia (BO)', phoneLength: 8, phoneHint: '71 234 567', phoneBlocks: [2, 3, 3] },
  { flag: '🇪🇨', code: '+593', label: 'Ecuador (EC)', phoneLength: 9, phoneHint: '99 123 4567', phoneBlocks: [2, 3, 4] },
  { flag: '🇻🇪', code: '+58', label: 'Venezuela (VE)', phoneLength: 10, phoneHint: '412 123 4567', phoneBlocks: [3, 3, 4] },
  { flag: '🇨🇺', code: '+53', label: 'Cuba (CU)', phoneLength: 8, phoneHint: '5 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇩🇴', code: '+1', label: 'República Dominicana (DO)', phoneLength: 10, phoneHint: '809 123 4567', phoneBlocks: [3, 3, 4] },
  { flag: '🇬🇹', code: '+502', label: 'Guatemala (GT)', phoneLength: 8, phoneHint: '5 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇭🇳', code: '+504', label: 'Honduras (HN)', phoneLength: 8, phoneHint: '9 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇸🇻', code: '+503', label: 'El Salvador (SV)', phoneLength: 8, phoneHint: '7 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇳🇮', code: '+505', label: 'Nicaragua (NI)', phoneLength: 8, phoneHint: '8 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇨🇷', code: '+506', label: 'Costa Rica (CR)', phoneLength: 8, phoneHint: '8 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇵🇦', code: '+507', label: 'Panamá (PA)', phoneLength: 8, phoneHint: '6 123 4567', phoneBlocks: [1, 3, 4] },
  { flag: '🇪🇸', code: '+34', label: 'España (ES)', phoneLength: 9, phoneHint: '612 345 678', phoneBlocks: [3, 3, 3] },
  { flag: '🇺🇸', code: '+1', label: 'Estados Unidos (US)', phoneLength: 10, phoneHint: '202 555 0123', phoneBlocks: [3, 3, 4] },
  { flag: '🇬🇧', code: '+44', label: 'Reino Unido (UK)', phoneLength: 10, phoneHint: '7700 900 123', phoneBlocks: [4, 3, 3] },
  { flag: '🇵🇹', code: '+351', label: 'Portugal (PT)', phoneLength: 9, phoneHint: '912 345 678', phoneBlocks: [3, 3, 3] },
];

export { countries };
export type { CountryOption };

export function formatPhoneNumber(digits: string, blocks: number[]): string {
  const chars = digits.replace(/\D/g, '').split('');
  const parts: string[] = [];
  let i = 0;
  for (const len of blocks) {
    if (i >= chars.length) break;
    parts.push(chars.slice(i, i + len).join(''));
    i += len;
  }
  return parts.join(' ');
}

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
