'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  AppButton,
  AppInput,
  ChoiceChip,
  CountryCodeSelect,
  formatPhoneNumber,
  countries,
  StepIndicator,
  AppDateInput,
  getLocalTodayIso,
  isValidIsoDate,
} from '@/src/components';
import { Body, Caption } from '@/src/components/typography';
import { FieldError } from '@/src/features/onboarding/components';
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react';
import {
  MARKET_SKILL_LEVELS,
  MARKET_SKILL_LEVEL_LABEL_KEYS,
  MARKET_SKILLS_BY_AREA,
  getHardSkillValuesForAreas,
  getSoftSkillValuesForAreas,
  isAreaInteresValue,
} from '@/src/features/onboarding/data/market-skills';

const SELECT_TRIGGER_CLASSES =
  'h-11 w-full min-w-0 max-w-full justify-between rounded-[8px] border border-[var(--color-input-border)] bg-[var(--color-card)] px-3 py-2 font-body text-base leading-tight text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)] sm:text-sm data-[size=default]:!h-11';
const TEXT_ONLY_REGEX = /^[a-zA-ZáéíóúñÑüÜ\s'-]*$/;

const SIN_CONOCIMIENTO = 'Desde_cero' as const;
const CON_CONOCIMIENTOS = 'Con_conocimientos_previos' as const;

interface FormData {
  fechaNacimiento: string;
  genero: string;
  pais: string;
  provinciaEstado: string;
  ciudad: string;
  zonaResidencia: string;
  nivelEducacion: string[];
  momentoProfesional: string[];
  areasInteres: string[];
  idiomas: { idioma: string; nivel: string }[];
  disponibilidad: string[];
  ubicacionTrabajo: string[];
  nivelExperienciaTecnologia: string;
  habilidadesTecnicas: string[];
  habilidadesBlandas: string[];
  objetivos: string[];
  dispositivos: string[];
  tipoConexion: string[];
  whatsappCodigo: string;
  whatsappNumero: string;
}

const INITIAL_FORM_DATA: FormData = {
  fechaNacimiento: '',
  genero: '',
  pais: '',
  provinciaEstado: '',
  ciudad: '',
  zonaResidencia: '',
  nivelEducacion: [],
  momentoProfesional: [],
  areasInteres: [],
  idiomas: [],
  disponibilidad: [],
  ubicacionTrabajo: [],
  nivelExperienciaTecnologia: '',
  habilidadesTecnicas: [],
  habilidadesBlandas: [],
  objetivos: [],
  dispositivos: [],
  tipoConexion: [],
  whatsappCodigo: '',
  whatsappNumero: '',
};

const STORAGE_KEY = 'onboarding_form_data';
const STORAGE_KEY_STEP = 'onboarding_step';

const FORM_DATA_KEYS: (keyof FormData)[] = [
  'fechaNacimiento',
  'genero',
  'pais',
  'provinciaEstado',
  'ciudad',
  'zonaResidencia',
  'nivelEducacion',
  'momentoProfesional',
  'areasInteres',
  'idiomas',
  'disponibilidad',
  'ubicacionTrabajo',
  'nivelExperienciaTecnologia',
  'habilidadesTecnicas',
  'habilidadesBlandas',
  'objetivos',
  'dispositivos',
  'tipoConexion',
  'whatsappCodigo',
  'whatsappNumero',
];

function getStoredFormData(): FormData {
  if (typeof window === 'undefined') return INITIAL_FORM_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FORM_DATA;
    const parsed = JSON.parse(raw);
    const valid = FORM_DATA_KEYS.every((key) => key in parsed);
    if (!valid) return INITIAL_FORM_DATA;
    return parsed as FormData;
  } catch {
    return INITIAL_FORM_DATA;
  }
}

function clearStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY_STEP);
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
    </svg>
  );
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABEL_KEYS = [
  'stepLabelPersonales',
  'stepLabelEducacion',
  'stepLabelSkills',
  'stepLabelObjetivos',
] as const;

interface OnboardingModalProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  locked?: boolean;
  onCompleted?: () => void | Promise<void>;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function getWhatsappCountry(code: string) {
  return countries.find((country) => country.code === code);
}

function getWhatsappValidationError(params: { code: string; number: string }) {
  const code = params.code;
  const digits = onlyDigits(params.number);

  if (!code && !digits) return null;

  if (!code && digits) {
    return 'Seleccioná el código de país para tu WhatsApp.';
  }

  if (code && !digits) {
    return 'Ingresá tu número de WhatsApp o borrá el código de país.';
  }

  const country = getWhatsappCountry(code);

  if (country && digits.length !== country.phoneLength) {
    return `El número debe tener ${country.phoneLength} dígitos para ${code}.`;
  }

  if (!country && (digits.length < 8 || digits.length > 15)) {
    return 'Ingresá un número de WhatsApp válido.';
  }

  return null;
}

function isWhatsappValid(code: string, number: string) {
  return getWhatsappValidationError({ code, number }) === null;
}

export function OnboardingModal({
  children,
  defaultOpen = false,
  locked = false,
  onCompleted,
}: OnboardingModalProps) {
  const t = useTranslations('Onboarding');
  const stepLabels = STEP_LABEL_KEYS.map((key) => t(key));
  const [open, setOpen] = useState(defaultOpen);
  const [step, setStep] = useState<Step>(() => {
    if (typeof window === 'undefined') return 1 as Step;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STEP);
      const n = Number(saved);
      return (n >= 1 && n <= 4 ? n : 1) as Step;
    } catch {
      return 1 as Step;
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectOpenRef = useRef(false);
  const [showErrors, setShowErrors] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const handlePointerDownOutside = useCallback((e: Event) => {
    if (selectOpenRef.current) {
      e.preventDefault();
    }
  }, []);

  const [formData, setFormData] = useState<FormData>(getStoredFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STEP, String(step));
  }, [step]);

  function toggleArray(
    field: keyof Pick<
      FormData,
      | 'nivelEducacion'
      | 'momentoProfesional'
      | 'areasInteres'
      | 'disponibilidad'
      | 'ubicacionTrabajo'
      | 'habilidadesTecnicas'
      | 'habilidadesBlandas'
      | 'objetivos'
      | 'dispositivos'
      | 'tipoConexion'
    >,
    value: string,
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
    setShowErrors(false);
  }

  function handleAreasInteresToggle(value: string) {
    setFormData((prev) => {
      const nextAreas = prev.areasInteres.includes(value)
        ? prev.areasInteres.filter((area) => area !== value)
        : [...prev.areasInteres, value];

      const allowedHardSkills = getHardSkillValuesForAreas(nextAreas);
      const allowedSoftSkills = getSoftSkillValuesForAreas(nextAreas);

      return {
        ...prev,
        areasInteres: nextAreas,
        habilidadesTecnicas: prev.habilidadesTecnicas.filter((skill) =>
          allowedHardSkills.has(skill),
        ),
        habilidadesBlandas: prev.habilidadesBlandas.filter((skill) =>
          allowedSoftSkills.has(skill),
        ),
      };
    });

    setShowErrors(false);
  }

  function handleNivelExperienciaTecnologiaChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      nivelExperienciaTecnologia: value,
    }));

    setShowErrors(false);
  }

  function toggleIdioma(value: string) {
    setFormData((prev) => {
      const exists = prev.idiomas.find((i) => i.idioma === value);
      if (exists) {
        return {
          ...prev,
          idiomas: prev.idiomas.filter((i) => i.idioma !== value),
        };
      }
      return {
        ...prev,
        idiomas: [...prev.idiomas, { idioma: value, nivel: '' }],
      };
    });
    setShowErrors(false);
  }

  function setIdiomaNivel(idioma: string, nivel: string) {
    setFormData((prev) => ({
      ...prev,
      idiomas: prev.idiomas.map((i) =>
        i.idioma === idioma ? { ...i, nivel } : i,
      ),
    }));
    setShowErrors(false);
  }

  function isStepValid(): boolean {
    const d = formData;

    if (step === 1) {
      return (
        isValidIsoDate(d.fechaNacimiento, {
          maxDate: getLocalTodayIso(),
        }) &&
        !!d.genero &&
        !!d.pais &&
        !!d.provinciaEstado.trim() &&
        !!d.ciudad.trim()
      );
    }

    if (step === 2) {
      return (
        d.nivelEducacion.length > 0 &&
        d.momentoProfesional.length > 0 &&
        d.areasInteres.length > 0 &&
        d.idiomas.some((i) => i.idioma && i.nivel) &&
        d.disponibilidad.length > 0 &&
        d.ubicacionTrabajo.length > 0
      );
    }

    if (step === 3) {
      if (!d.nivelExperienciaTecnologia) return false;

      if (d.nivelExperienciaTecnologia === SIN_CONOCIMIENTO) {
        return true;
      }

      return (
        d.habilidadesTecnicas.length > 0 && d.habilidadesBlandas.length > 0
      );
    }

    return (
      d.objetivos.length > 0 &&
      d.dispositivos.length > 0 &&
      d.tipoConexion.length > 0 &&
      isWhatsappValid(d.whatsappCodigo, d.whatsappNumero)
    );
  }

  function getCurrentWhatsappError() {
    return getWhatsappValidationError({
      code: formData.whatsappCodigo,
      number: formData.whatsappNumero,
    });
  }

  function hasWhatsappError() {
    return Boolean(getCurrentWhatsappError());
  }

  function clearWhatsapp() {
    setFormData((prev) => ({
      ...prev,
      whatsappCodigo: '',
      whatsappNumero: '',
    }));

    setShowErrors(false);
  }

  function handleNext() {
    setSubmitError(null);

    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);

    if (step < 4) {
      setStep((step + 1) as Step);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    setSubmitError(null);
    setShowErrors(false);

    if (step > 1) {
      setStep((step - 1) as Step);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleFinish() {
    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    setIsLoading(true);
    setSubmitError(null);

    const normalizedWhatsappNumero = onlyDigits(formData.whatsappNumero);

    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        whatsappCodigo: formData.whatsappCodigo || '',
        whatsappNumero: normalizedWhatsappNumero,
        provinciaEstado: formData.provinciaEstado.trim(),
        ciudad: formData.ciudad.trim(),
        zonaResidencia: formData.zonaResidencia.trim(),
        habilidadesTecnicas:
          formData.nivelExperienciaTecnologia === SIN_CONOCIMIENTO
            ? []
            : formData.habilidadesTecnicas,
        habilidadesBlandas:
          formData.nivelExperienciaTecnologia === SIN_CONOCIMIENTO
            ? []
            : formData.habilidadesBlandas,
        locale,
      }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          const requestIdText = result?.requestId
            ? `\nCódigo: ${result.requestId}`
            : '';

          if (result?.fieldErrors) {
            const fieldMessages = Object.values(
              result.fieldErrors as Record<string, string[]>,
            )
              .flat()
              .join('\n');

            throw new Error(
              `${result.message || 'No pudimos completar el onboarding.'}\n${fieldMessages}${requestIdText}`,
            );
          }

          throw new Error(
            `${result?.message || 'No pudimos completar el onboarding.'}${requestIdText}`,
          );
        }

        if (onCompleted) {
          setOpen(false);
          resetForm();
          await onCompleted();
          return;
        }

        router.replace('/dashboard', { locale });
        router.refresh();
      })
      .catch((err) => {
        setSubmitError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function resetForm() {
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    clearStorage();
    setShowErrors(false);
    setIsLoading(false);
    setSubmitError(null);
  }

  const nivelEducacionOptions = [
    { value: 'Secundario_incompleto', label: t('nivelEducacionOption1') },
    { value: 'Secundario_completo', label: t('nivelEducacionOption2') },
    { value: 'Universitario_incompleto', label: t('nivelEducacionOption3') },
    { value: 'Universitario_completo', label: t('nivelEducacionOption4') },
    { value: 'Licenciatura', label: t('nivelEducacionOption5') },
    { value: 'Diplomatura', label: t('nivelEducacionOption6') },
    { value: 'Maestria', label: t('nivelEducacionOption7') },
    { value: 'Doctorado', label: t('nivelEducacionOption8') },
  ];

  const momentoProfesionalOptions = [
    { value: 'Estudio_actualmente', label: t('momentoProfesionalOption1') },
    { value: 'Sin_experiencia_laboral', label: t('momentoProfesionalOption2') },
    { value: 'En_busqueda_activa', label: t('momentoProfesionalOption3') },
    { value: 'Trabajando_cambiar', label: t('momentoProfesionalOption4') },
    { value: 'Freelancer', label: t('momentoProfesionalOption5') },
    { value: 'Emprendedor_a', label: t('momentoProfesionalOption6') },
  ];

  const areasInteresOptions = [
    { value: 'Data_Analytics', label: t('areasInteresOption1') },
    { value: 'Desarrollo_Web', label: t('areasInteresOption2') },
    { value: 'UX_UI_Design', label: t('areasInteresOption3') },
    { value: 'Ciberseguridad', label: t('areasInteresOption4') },
    { value: 'Cloud_DevOps', label: t('areasInteresOption5') },
    { value: 'Inteligencia_Artificial', label: t('areasInteresOption6') },
    { value: 'Marketing_Digital', label: t('areasInteresOption7') },
    { value: 'Product_Management', label: t('areasInteresOption8') },
  ];

  const idiomasList = [
    { value: 'Espanol', label: t('idiomasOption1') },
    { value: 'Ingles', label: t('idiomasOption2') },
    { value: 'Portugues', label: t('idiomasOption3') },
    { value: 'Frances', label: t('idiomasOption4') },
  ];

  const nivelesList = [
    { value: 'A1', label: t('nivelOption1') },
    { value: 'A2', label: t('nivelOption2') },
    { value: 'B1', label: t('nivelOption3') },
    { value: 'B2', label: t('nivelOption4') },
    { value: 'C1', label: t('nivelOption5') },
    { value: 'C2', label: t('nivelOption6') },
    { value: 'Nativo', label: t('nivelOption7') },
  ];

  const disponibilidadOptions = [
    { value: 'Part_time', label: t('disponibilidadOption1') },
    { value: 'Full_time', label: t('disponibilidadOption2') },
    { value: 'Contractor', label: t('disponibilidadOption3') },
    { value: 'Freelance', label: t('disponibilidadOption4') },
  ];

  const ubicacionTrabajoOptions = [
    { value: 'Presencial', label: t('ubicacionTrabajoOption1') },
    { value: 'Hibrido', label: t('ubicacionTrabajoOption2') },
    { value: 'Remoto', label: t('ubicacionTrabajoOption3') },
  ];

  const nivelExperienciaTecnologiaOptions = [
    {
      value: SIN_CONOCIMIENTO,
      label: t('nivelExperienciaTecnologiaOption1'),
    },
    {
      value: CON_CONOCIMIENTOS,
      label: t('nivelExperienciaTecnologiaOption2'),
    },
  ];

  const objetivosOptions = [
    { value: 'Primer_empleo_IT', label: t('objetivosOption1') },
    { value: 'Reconversion_laboral', label: t('objetivosOption2') },
    { value: 'Mejorar_salario', label: t('objetivosOption3') },
    { value: 'Definir_camino', label: t('objetivosOption4') },
    { value: 'Ampliar_red', label: t('objetivosOption5') },
    { value: 'Aprender_tecnologias', label: t('objetivosOption6') },
    { value: 'Estudiar_sin_trabajar', label: t('objetivosOption7') },
    { value: 'Emprender', label: t('objetivosOption8') },
  ];

  const dispositivosOptions = [
    { value: 'Solo_celular', label: t('dispositivosOption1') },
    { value: 'PC_Laptop', label: t('dispositivosOption2') },
    { value: 'Tablet', label: t('dispositivosOption3') },
  ];

  const tipoConexionOptions = [
    { value: 'Banda_ancha_estable', label: t('tipoConexionOption1') },
    { value: 'Datos_moviles', label: t('tipoConexionOption2') },
    { value: 'Conexion_inestable', label: t('tipoConexionOption3') },
    { value: 'Sin_conexion_casa', label: t('tipoConexionOption4') },
  ];

  const currentGreeting =
    step === 1
      ? t('step1Greeting')
      : step === 2
        ? t('step2Greeting')
        : step === 3
          ? t('step3Greeting')
          : t('step4Greeting');

  const currentSubtitle =
    step === 1
      ? t('step1Subtitle')
      : step === 2
        ? t('step2Subtitle')
        : step === 3
          ? t('step3Subtitle')
          : t('step4Subtitle');

  const selectedMarketAreas = formData.areasInteres.filter(isAreaInteresValue);

  const todayIso = getLocalTodayIso();

  const isFechaNacimientoValid = isValidIsoDate(formData.fechaNacimiento, {
    maxDate: todayIso,
  });

  return (
    <>
      {children && (
        <span onClick={() => setOpen(true)} className='cursor-pointer'>
          {children}
        </span>
      )}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && locked) {
            return;
          }

          if (!nextOpen) {
            resetForm();
          }

          setOpen(nextOpen);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className='max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0 sm:max-w-2xl'
          onPointerDownOutside={handlePointerDownOutside}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (locked) {
              e.preventDefault();
            }
          }}
        >
          <div className='flex max-h-[92dvh] min-w-0 flex-col overflow-hidden'>
            <div className='shrink-0 border-b border-[var(--color-border)] px-4 pt-4 pb-3 sm:px-6'>
              <div className='min-w-0 overflow-hidden py-1'>
                <StepIndicator
                  currentStep={step}
                  totalSteps={4}
                  labels={stepLabels}
                />
              </div>

              <DialogHeader className='mt-3 text-left'>
                <DialogTitle className='break-words leading-tight'>
                  {currentGreeting}
                </DialogTitle>

                <DialogDescription className='break-words leading-relaxed'>
                  {currentSubtitle}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div
              ref={scrollRef}
              className='onboarding-form min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6'
            >
              <div className='min-w-0 space-y-5'>
                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <>
                    <div className='space-y-4'>
                      <div>
                        <Body>{t('fechaNacimientoLabel')}</Body>

                        <AppDateInput
                          value={formData.fechaNacimiento}
                          maxDate={todayIso}
                          onChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              fechaNacimiento: value,
                            }));
                            setShowErrors(false);
                          }}
                        />

                        <FieldError
                          show={showErrors && !isFechaNacimientoValid}
                        />
                      </div>

                      <div>
                        <Body>{t('generoLabel')}</Body>
                        <Select
                          value={formData.genero}
                          onValueChange={(v) => {
                            setFormData((prev) => ({ ...prev, genero: v }));
                            setShowErrors(false);
                          }}
                          onOpenChange={(v) => {
                            selectOpenRef.current = v;
                          }}
                        >
                          <SelectTrigger className={SELECT_TRIGGER_CLASSES}>
                            <SelectValue placeholder={t('generoPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Masculino'>
                              {t('generoOption1')}
                            </SelectItem>
                            <SelectItem value='Femenino'>
                              {t('generoOption2')}
                            </SelectItem>
                            <SelectItem value='No_binario'>
                              {t('generoOption3')}
                            </SelectItem>
                            <SelectItem value='Prefiero_no_decir'>
                              {t('generoOption4')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError show={showErrors && !formData.genero} />
                      </div>

                      <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='min-w-0'>
                          <Body>{t('paisLabel')}</Body>
                          <Select
                            value={formData.pais}
                            onValueChange={(v) => {
                              setFormData((prev) => ({ ...prev, pais: v }));
                              setShowErrors(false);
                            }}
                            onOpenChange={(v) => {
                              selectOpenRef.current = v;
                            }}
                          >
                            <SelectTrigger className={SELECT_TRIGGER_CLASSES}>
                              <SelectValue placeholder={t('paisPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Argentina'>
                                Argentina
                              </SelectItem>
                              <SelectItem value='Brasil'>Brasil</SelectItem>
                              <SelectItem value='Chile'>Chile</SelectItem>
                              <SelectItem value='Colombia'>Colombia</SelectItem>
                              <SelectItem value='México'>México</SelectItem>
                              <SelectItem value='Perú'>Perú</SelectItem>
                              <SelectItem value='Uruguay'>Uruguay</SelectItem>
                              <SelectItem value='España'>España</SelectItem>
                              <SelectItem value='Otro'>Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError show={showErrors && !formData.pais} />
                        </div>
                        <div className='min-w-0'>
                          <Body>{t('provinciaEstadoLabel')}</Body>
                          <AppInput
                            value={formData.provinciaEstado}
                            onChange={(e) => {
                              if (TEXT_ONLY_REGEX.test(e.target.value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  provinciaEstado: e.target.value,
                                }));
                                setShowErrors(false);
                              }
                            }}
                            placeholder={t('provinciaEstadoPlaceholder')}
                          />

                          <FieldError
                            show={
                              showErrors && !formData.provinciaEstado.trim()
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Body>{t('ciudadLabel')}</Body>
                        <AppInput
                          value={formData.ciudad}
                          onChange={(e) => {
                            if (TEXT_ONLY_REGEX.test(e.target.value)) {
                              setFormData((prev) => ({
                                ...prev,
                                ciudad: e.target.value,
                              }));
                              setShowErrors(false);
                            }
                          }}
                          placeholder={t('ciudadPlaceholder')}
                        />
                        <FieldError show={showErrors && !formData.ciudad} />
                      </div>

                      <div>
                        <Body>
                          {t('zonaResidenciaLabel')}{' '}
                          <span className='text-[var(--color-text-muted)] text-xs'>
                            {t('zonaResidenciaOptional')}
                          </span>
                        </Body>
                        <AppInput
                          value={formData.zonaResidencia}
                          onChange={(e) => {
                            if (TEXT_ONLY_REGEX.test(e.target.value))
                              setFormData((prev) => ({
                                ...prev,
                                zonaResidencia: e.target.value,
                              }));
                          }}
                          placeholder={t('zonaResidenciaPlaceholder')}
                        />
                      </div>

                      <div className='flex items-start gap-2 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-bg)] p-3 mb-6'>
                        <ShieldCheckIcon className='size-5 shrink-0 text-[var(--color-success)] mt-0.5' />
                        <Caption className='text-[var(--color-success-text)]'>
                          {t('zonaResidenciaInfo')}
                        </Caption>
                      </div>
                    </div>
                  </>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                  <div className='space-y-5'>
                    <div>
                      <Body>
                        {t('nivelEducacionLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('nivelEducacionHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {nivelEducacionOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.nivelEducacion.includes(
                              opt.value,
                            )}
                            onClick={() =>
                              toggleArray('nivelEducacion', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={
                          showErrors && formData.nivelEducacion.length === 0
                        }
                      />
                    </div>

                    <div>
                      <Body>
                        {t('momentoProfesionalLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('momentoProfesionalHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {momentoProfesionalOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.momentoProfesional.includes(
                              opt.value,
                            )}
                            onClick={() =>
                              toggleArray('momentoProfesional', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={
                          showErrors && formData.momentoProfesional.length === 0
                        }
                      />
                    </div>

                    <div>
                      <Body>
                        {t('areasInteresLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('areasInteresHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {areasInteresOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.areasInteres.includes(opt.value)}
                            onClick={() => handleAreasInteresToggle(opt.value)}
                          />
                        ))}
                      </div>
                      <FieldError
                        show={showErrors && formData.areasInteres.length === 0}
                      />
                    </div>

                    <div>
                      <Body>
                        {t('idiomasLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('idiomasHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {idiomasList.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.idiomas.some(
                              (i) => i.idioma === opt.value,
                            )}
                            onClick={() => toggleIdioma(opt.value)}
                          />
                        ))}
                      </div>
                      {formData.idiomas.map((idioma) => (
                        <div key={idioma.idioma} className='mt-3'>
                          <Body className='mb-1.5 text-[var(--color-text-muted)]'>
                            {
                              idiomasList.find((l) => l.value === idioma.idioma)
                                ?.label
                            }
                            :
                          </Body>
                          <div className='flex flex-wrap gap-2'>
                            {nivelesList.map((nivel) => (
                              <ChoiceChip
                                key={nivel.value}
                                label={nivel.label}
                                selected={idioma.nivel === nivel.value}
                                onClick={() =>
                                  setIdiomaNivel(idioma.idioma, nivel.value)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <FieldError
                        show={
                          showErrors &&
                          !formData.idiomas.some((i) => i.idioma && i.nivel)
                        }
                      />
                    </div>

                    <div>
                      <Body>
                        {t('disponibilidadLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('disponibilidadHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {disponibilidadOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.disponibilidad.includes(
                              opt.value,
                            )}
                            onClick={() =>
                              toggleArray('disponibilidad', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={
                          showErrors && formData.disponibilidad.length === 0
                        }
                      />
                    </div>

                    <div>
                      <Body>{t('ubicacionTrabajoLabel')}</Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden mb-6'>
                        {ubicacionTrabajoOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.ubicacionTrabajo.includes(
                              opt.value,
                            )}
                            onClick={() =>
                              toggleArray('ubicacionTrabajo', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={
                          showErrors && formData.ubicacionTrabajo.length === 0
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ===== STEP 3 ===== */}
                {step === 3 && (
                  <div className='space-y-5 mb-6'>
                    <div>
                      <Body>{t('nivelExperienciaTecnologiaLabel')}</Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {nivelExperienciaTecnologiaOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={
                              formData.nivelExperienciaTecnologia === opt.value
                            }
                            onClick={() =>
                              handleNivelExperienciaTecnologiaChange(opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={
                          showErrors && !formData.nivelExperienciaTecnologia
                        }
                      />
                    </div>

                    {formData.nivelExperienciaTecnologia ===
                      CON_CONOCIMIENTOS && (
                      <>
                        <div>
                          <Body>
                            {t('habilidadesTecnicasLabel')}{' '}
                            <span className='text-[var(--color-text-muted)] text-xs'>
                              {t('habilidadesTecnicasHint')}
                            </span>
                          </Body>

                          <div className='mt-3 space-y-4'>
                            {selectedMarketAreas.map((area) => {
                              const areaConfig = MARKET_SKILLS_BY_AREA[area];

                              return (
                                <div
                                  key={area}
                                  className='rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3'
                                >
                                  <p className='mb-3 text-sm font-bold text-[var(--color-text)]'>
                                    {t(areaConfig.labelKey)}
                                  </p>

                                  <div className='space-y-3'>
                                    {MARKET_SKILL_LEVELS.map((level) => (
                                      <div key={level}>
                                        <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]'>
                                          {t(
                                            MARKET_SKILL_LEVEL_LABEL_KEYS[
                                              level
                                            ],
                                          )}
                                        </p>

                                        <div className='flex flex-wrap gap-2'>
                                          {areaConfig.hardSkills[level].map(
                                            (skill) => (
                                              <ChoiceChip
                                                key={skill.value}
                                                label={t(skill.labelKey)}
                                                selected={formData.habilidadesTecnicas.includes(
                                                  skill.value,
                                                )}
                                                onClick={() =>
                                                  toggleArray(
                                                    'habilidadesTecnicas',
                                                    skill.value,
                                                  )
                                                }
                                              />
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <FieldError
                            show={
                              showErrors &&
                              formData.nivelExperienciaTecnologia ===
                                CON_CONOCIMIENTOS &&
                              formData.habilidadesTecnicas.length === 0
                            }
                          />
                        </div>

                        <div>
                          <Body>
                            {t('habilidadesBlandasLabel')}{' '}
                            <span className='text-[var(--color-text-muted)] text-xs'>
                              {t('habilidadesBlandasHint')}
                            </span>
                          </Body>

                          <div className='mt-3 space-y-4'>
                            {selectedMarketAreas.map((area) => {
                              const areaConfig = MARKET_SKILLS_BY_AREA[area];

                              return (
                                <div
                                  key={area}
                                  className='rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3'
                                >
                                  <p className='mb-3 text-sm font-bold text-[var(--color-text)]'>
                                    {t(areaConfig.labelKey)}
                                  </p>

                                  <div className='space-y-3'>
                                    {MARKET_SKILL_LEVELS.map((level) => (
                                      <div key={level}>
                                        <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]'>
                                          {t(
                                            MARKET_SKILL_LEVEL_LABEL_KEYS[
                                              level
                                            ],
                                          )}
                                        </p>

                                        <div className='flex flex-wrap gap-2'>
                                          {areaConfig.softSkills[level].map(
                                            (skill) => (
                                              <ChoiceChip
                                                key={skill.value}
                                                label={t(skill.labelKey)}
                                                selected={formData.habilidadesBlandas.includes(
                                                  skill.value,
                                                )}
                                                onClick={() =>
                                                  toggleArray(
                                                    'habilidadesBlandas',
                                                    skill.value,
                                                  )
                                                }
                                              />
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <FieldError
                            show={
                              showErrors &&
                              formData.nivelExperienciaTecnologia ===
                                CON_CONOCIMIENTOS &&
                              formData.habilidadesBlandas.length === 0
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ===== STEP 4 ===== */}
                {step === 4 && (
                  <div className='space-y-5'>
                    <div>
                      <Body>
                        {t('objetivosLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('objetivosHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {objetivosOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.objetivos.includes(opt.value)}
                            onClick={() => toggleArray('objetivos', opt.value)}
                          />
                        ))}
                      </div>
                      <FieldError
                        show={showErrors && formData.objetivos.length === 0}
                      />
                    </div>

                    <div>
                      <Body>
                        {t('dispositivosLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('dispositivosHint')}
                        </span>
                      </Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {dispositivosOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.dispositivos.includes(opt.value)}
                            onClick={() =>
                              toggleArray('dispositivos', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={showErrors && formData.dispositivos.length === 0}
                      />
                    </div>

                    <div>
                      <Body>{t('tipoConexionLabel')}</Body>
                      <div className='mt-2 flex min-w-0 max-w-full flex-wrap gap-2 overflow-x-hidden'>
                        {tipoConexionOptions.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            label={opt.label}
                            selected={formData.tipoConexion.includes(opt.value)}
                            onClick={() =>
                              toggleArray('tipoConexion', opt.value)
                            }
                          />
                        ))}
                      </div>
                      <FieldError
                        show={showErrors && formData.tipoConexion.length === 0}
                      />
                    </div>

                    <div>
                      <Body>
                        {t('whatsappLabel')}{' '}
                        <span className='text-[var(--color-text-muted)] text-xs'>
                          {t('whatsappOptional')}
                        </span>
                      </Body>
                      {(formData.whatsappCodigo || formData.whatsappNumero) && (
                        <button
                          type='button'
                          onClick={clearWhatsapp}
                          className='font-body text-xs font-semibold text-[var(--color-primary)] hover:underline'
                        >
                          {t('whatsappClearButton')}
                        </button>
                      )}
                      <div className='mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)]'>
                        <div className='min-w-0'>
                          <CountryCodeSelect
                            value={formData.whatsappCodigo}
                            onChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,
                                whatsappCodigo: value,
                                whatsappNumero:
                                  prev.whatsappCodigo !== value
                                    ? ''
                                    : prev.whatsappNumero,
                              }));

                              setShowErrors(false);
                              setSubmitError(null);
                            }}
                            onOpenChange={(v) => {
                              selectOpenRef.current = v;
                            }}
                            placeholder={t('countryCodePlaceHolder')}
                          />
                        </div>
                        <div className='min-w-0'>
                          {(() => {
                            const country = countries.find(
                              (c) => c.code === formData.whatsappCodigo,
                            );
                            const maxLen = country?.phoneLength ?? 15;
                            const blocks = country?.phoneBlocks ?? [3, 3, 4];

                            return (
                              <AppInput
                                value={formatPhoneNumber(
                                  formData.whatsappNumero,
                                  blocks,
                                )}
                                onChange={(e) => {
                                  const raw = onlyDigits(e.target.value);

                                  if (raw.length <= maxLen) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      whatsappNumero: raw,
                                    }));

                                    setShowErrors(false);
                                    setSubmitError(null);
                                  }
                                }}
                                disabled={!formData.whatsappCodigo}
                                placeholder={country?.phoneHint ?? ''}
                              />
                            );
                          })()}
                        </div>
                      </div>
                      {formData.whatsappCodigo && (
                        <Caption className='mt-1.5 text-[var(--color-text-muted)]'>
                          {t('phoneFormatHint', {
                            hint:
                              countries.find(
                                (c) => c.code === formData.whatsappCodigo,
                              )?.phoneHint ?? '',
                          })}
                        </Caption>
                      )}
                      <div className='mt-3 flex items-center gap-1.5 mb-4'>
                        <WhatsAppIcon className='size-4 shrink-0 text-[#25D366]' />
                        <Caption className='text-[var(--color-text-muted)]'>
                          {t('whatsappInfo')}
                        </Caption>
                      </div>
                      {showErrors && hasWhatsappError() && (
                        <div className='mb-6 flex items-start gap-1.5 text-[var(--color-danger)]'>
                          <AlertCircleIcon className='size-4 shrink-0' />
                          <Caption className='text-[var(--color-danger)]'>
                            {getCurrentWhatsappError()}
                          </Caption>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='shrink-0 border-t border-[var(--color-border)] px-4 py-4 sm:px-6'>
              {submitError && (
                <div
                  role='alert'
                  className='mb-4 flex min-w-0 items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm leading-relaxed text-[var(--color-danger-text)]'
                >
                  <AlertCircleIcon className='mt-0.5 size-4 shrink-0' />

                  <p className='min-w-0 whitespace-pre-line break-words'>
                    {submitError}
                  </p>
                </div>
              )}

              <DialogFooter className='p-0'>
                <div className='flex w-full min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                  {step > 1 && (
                    <AppButton
                      type='button'
                      variant='outline'
                      className='w-full !whitespace-nowrap sm:w-auto'
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      {t('backButton')}
                    </AppButton>
                  )}

                  {step < 4 ? (
                    <AppButton
                      type='button'
                      className='w-full !whitespace-nowrap sm:w-auto'
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      {t('nextButton')} →
                    </AppButton>
                  ) : (
                    <AppButton
                      type='button'
                      className='w-full !whitespace-nowrap sm:w-auto'
                      onClick={handleFinish}
                      disabled={isLoading}
                    >
                      {isLoading ? t('savingButton') : t('finishButton')}
                    </AppButton>
                  )}
                </div>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
