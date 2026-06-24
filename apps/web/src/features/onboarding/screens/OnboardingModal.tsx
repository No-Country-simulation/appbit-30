'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { AppButton, AppInput, ChoiceChip, CountryCodeSelect, StepIndicator } from '@/src/components';
import { Body, Caption } from '@/src/components/typography';
import { FieldError } from '@/src/features/onboarding/components';
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react';

const SELECT_TRIGGER_CLASSES = 'w-full px-4 py-[14px] rounded-[8px] border border-[var(--color-input-border)] bg-[var(--color-card)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)] data-[size=default]:!h-auto';
const TEXT_ONLY_REGEX = /^[a-zA-ZáéíóúñÑüÜ\s'-]*$/;
const NUMBERS_ONLY_REGEX = /^\d*$/;

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
  ubicacionTrabajo: string;
  objetivos: string[];
  dispositivos: string[];
  tipoConexion: string;
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
  ubicacionTrabajo: '',
  objetivos: [],
  dispositivos: [],
  tipoConexion: '',
  whatsappCodigo: '',
  whatsappNumero: '',
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
    </svg>
  );
}

type Step = 1 | 2 | 3;

const STEP_LABELS = ['Personales', 'Educación', 'Objetivos'];

interface OnboardingModalProps {
  children: React.ReactNode;
}

export function OnboardingModal({ children }: OnboardingModalProps) {
  const t = useTranslations('Onboarding');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectOpenRef = useRef(false);
  const [showErrors, setShowErrors] = useState(false);

  const handlePointerDownOutside = useCallback((e: Event) => {
    if (selectOpenRef.current) {
      e.preventDefault();
    }
  }, []);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  function toggleArray(field: keyof Pick<FormData, 'nivelEducacion' | 'momentoProfesional' | 'areasInteres' | 'disponibilidad' | 'objetivos' | 'dispositivos'>, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
    setShowErrors(false);
  }

  function toggleIdioma(value: string) {
    setFormData(prev => {
      const exists = prev.idiomas.find(i => i.idioma === value);
      if (exists) {
        return { ...prev, idiomas: prev.idiomas.filter(i => i.idioma !== value) };
      }
      return { ...prev, idiomas: [...prev.idiomas, { idioma: value, nivel: '' }] };
    });
    setShowErrors(false);
  }

  function setIdiomaNivel(idioma: string, nivel: string) {
    setFormData(prev => ({
      ...prev,
      idiomas: prev.idiomas.map(i => i.idioma === idioma ? { ...i, nivel } : i),
    }));
    setShowErrors(false);
  }

  function isStepValid(): boolean {
    const d = formData;
    if (step === 1) {
      return !!d.fechaNacimiento && !!d.genero && !!d.pais && !!d.ciudad;
    }
    if (step === 2) {
      return (
        d.nivelEducacion.length > 0 &&
        d.momentoProfesional.length > 0 &&
        d.areasInteres.length > 0 &&
        d.idiomas.some(i => i.idioma && i.nivel) &&
        d.disponibilidad.length > 0 &&
        !!d.ubicacionTrabajo
      );
    }
    return d.objetivos.length > 0 && d.dispositivos.length > 0 && !!d.tipoConexion;
  }

  function handleNext() {
    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < 3) {
      setStep((step + 1) as Step);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
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
    console.log('Onboarding data:', formData);
  }

  function resetForm() {
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setShowErrors(false);
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
    step === 1 ? t('step1Greeting') : step === 2 ? t('step2Greeting') : t('step3Greeting');
  const currentSubtitle =
    step === 1 ? t('step1Subtitle') : step === 2 ? t('step2Subtitle') : t('step3Subtitle');

  return (
    <>
      <span onClick={() => setOpen(true)} className='cursor-pointer'>
        {children}
      </span>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent ref={scrollRef} showCloseButton={false} className='sm:max-w-lg' onPointerDownOutside={handlePointerDownOutside}>
          <div className='py-2'>
            <StepIndicator currentStep={step} totalSteps={3} labels={STEP_LABELS} />
          </div>

          <DialogHeader>
            <DialogTitle>{currentGreeting}</DialogTitle>
            <DialogDescription>{currentSubtitle}</DialogDescription>
          </DialogHeader>

          <div className='space-y-5'>
            {/* ===== STEP 1 ===== */}
            {step === 1 && (
              <>
                <div className='space-y-4'>
                  <div>
                    <Body>{t('fechaNacimientoLabel')}</Body>
                    <AppInput
                      type='date'
                      value={formData.fechaNacimiento}
                      onChange={(e) => { setFormData(prev => ({...prev, fechaNacimiento: e.target.value})); setShowErrors(false); }}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <FieldError show={showErrors && !formData.fechaNacimiento} />
                  </div>

                  <div>
                    <Body>{t('generoLabel')}</Body>
                    <Select value={formData.genero} onValueChange={(v) => { setFormData(prev => ({...prev, genero: v})); setShowErrors(false); }} onOpenChange={(v) => { selectOpenRef.current = v; }}>
                      <SelectTrigger className={SELECT_TRIGGER_CLASSES}>
                        <SelectValue placeholder={t('generoPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Masculino'>{t('generoOption1')}</SelectItem>
                        <SelectItem value='Femenino'>{t('generoOption2')}</SelectItem>
                        <SelectItem value='No_binario'>{t('generoOption3')}</SelectItem>
                        <SelectItem value='Prefiero_no_decir'>{t('generoOption4')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError show={showErrors && !formData.genero} />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Body>{t('paisLabel')}</Body>
                      <Select value={formData.pais} onValueChange={(v) => { setFormData(prev => ({...prev, pais: v})); setShowErrors(false); }} onOpenChange={(v) => { selectOpenRef.current = v; }}>
                        <SelectTrigger className={SELECT_TRIGGER_CLASSES}>
                          <SelectValue placeholder={t('paisPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Argentina'>Argentina</SelectItem>
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
                    <div>
                      <Body>{t('provinciaEstadoLabel')}</Body>
                      <AppInput
                        value={formData.provinciaEstado}
                        onChange={(e) => { if (TEXT_ONLY_REGEX.test(e.target.value)) setFormData(prev => ({...prev, provinciaEstado: e.target.value})); }}
                        placeholder={t('provinciaEstadoPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Body>{t('ciudadLabel')}</Body>
                    <AppInput
                      value={formData.ciudad}
                      onChange={(e) => { if (TEXT_ONLY_REGEX.test(e.target.value)) { setFormData(prev => ({...prev, ciudad: e.target.value})); setShowErrors(false); } }}
                      placeholder={t('ciudadPlaceholder')}
                    />
                    <FieldError show={showErrors && !formData.ciudad} />
                  </div>

                  <div>
                    <Body>
                      {t('zonaResidenciaLabel')}{' '}
                      <span className='text-[var(--color-text-muted)] text-xs'>{t('zonaResidenciaOptional')}</span>
                    </Body>
                    <AppInput
                      value={formData.zonaResidencia}
                      onChange={(e) => { if (TEXT_ONLY_REGEX.test(e.target.value)) setFormData(prev => ({...prev, zonaResidencia: e.target.value})); }}
                      placeholder={t('zonaResidenciaPlaceholder')}
                    />
                  </div>

                  <div className='flex items-start gap-2 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-bg)] p-3'>
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
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('nivelEducacionHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {nivelEducacionOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.nivelEducacion.includes(opt.value)}
                        onClick={() => toggleArray('nivelEducacion', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.nivelEducacion.length === 0} />
                </div>

                <div>
                  <Body>
                    {t('momentoProfesionalLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('momentoProfesionalHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {momentoProfesionalOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.momentoProfesional.includes(opt.value)}
                        onClick={() => toggleArray('momentoProfesional', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.momentoProfesional.length === 0} />
                </div>

                <div>
                  <Body>
                    {t('areasInteresLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('areasInteresHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {areasInteresOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.areasInteres.includes(opt.value)}
                        onClick={() => toggleArray('areasInteres', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.areasInteres.length === 0} />
                </div>

                <div>
                  <Body>
                    {t('idiomasLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('idiomasHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {idiomasList.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.idiomas.some(i => i.idioma === opt.value)}
                        onClick={() => toggleIdioma(opt.value)}
                      />
                    ))}
                  </div>
                  {formData.idiomas.map((idioma) => (
                    <div key={idioma.idioma} className='mt-3'>
                      <Body className='mb-1.5 text-[var(--color-text-muted)]'>
                        {idiomasList.find(l => l.value === idioma.idioma)?.label}:
                      </Body>
                      <div className='flex flex-wrap gap-2'>
                        {nivelesList.map((nivel) => (
                          <ChoiceChip
                            key={nivel.value}
                            label={nivel.label}
                            selected={idioma.nivel === nivel.value}
                            onClick={() => setIdiomaNivel(idioma.idioma, nivel.value)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <FieldError show={showErrors && !formData.idiomas.some(i => i.idioma && i.nivel)} />
                </div>

                <div>
                  <Body>
                    {t('disponibilidadLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('disponibilidadHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {disponibilidadOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.disponibilidad.includes(opt.value)}
                        onClick={() => toggleArray('disponibilidad', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.disponibilidad.length === 0} />
                </div>

                <div>
                  <Body>{t('ubicacionTrabajoLabel')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {ubicacionTrabajoOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.ubicacionTrabajo === opt.value}
                        onClick={() => { setFormData(prev => ({...prev, ubicacionTrabajo: prev.ubicacionTrabajo === opt.value ? '' : opt.value})); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && !formData.ubicacionTrabajo} />
                </div>
              </div>
            )}

            {/* ===== STEP 3 ===== */}
            {step === 3 && (
              <div className='space-y-5'>
                <div>
                  <Body>
                    {t('objetivosLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('objetivosHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {objetivosOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.objetivos.includes(opt.value)}
                        onClick={() => toggleArray('objetivos', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.objetivos.length === 0} />
                </div>

                <div>
                  <Body>
                    {t('dispositivosLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('dispositivosHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {dispositivosOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.dispositivos.includes(opt.value)}
                        onClick={() => toggleArray('dispositivos', opt.value)}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && formData.dispositivos.length === 0} />
                </div>

                <div>
                  <Body>{t('tipoConexionLabel')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {tipoConexionOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={formData.tipoConexion === opt.value}
                        onClick={() => { setFormData(prev => ({...prev, tipoConexion: prev.tipoConexion === opt.value ? '' : opt.value})); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && !formData.tipoConexion} />
                </div>

                <div>
                  <Body>
                    {t('whatsappLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('whatsappOptional')}</span>
                  </Body>
                  <div className='mt-2 flex gap-2'>
                    <div className='w-1/3'>
                      <CountryCodeSelect
                        value={formData.whatsappCodigo}
                        onChange={(v) => setFormData(prev => ({...prev, whatsappCodigo: v}))}
                        onOpenChange={(v) => { selectOpenRef.current = v; }}
                        placeholder='+54'
                      />
                    </div>
                    <div className='w-2/3'>
                      <AppInput
                        value={formData.whatsappNumero}
                        onChange={(e) => { if (NUMBERS_ONLY_REGEX.test(e.target.value)) setFormData(prev => ({...prev, whatsappNumero: e.target.value})); }}
                        placeholder={t('whatsappPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-1.5'>
                    <WhatsAppIcon className='size-4 shrink-0 text-[#25D366]' />
                    <Caption className='text-[var(--color-text-muted)]'>
                      {t('whatsappInfo')}
                    </Caption>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {step > 1 && (
              <AppButton variant='outline' onClick={handleBack}>
                {t('backButton')}
              </AppButton>
            )}
            {step < 3 ? (
              <AppButton onClick={handleNext}>
                {t('nextButton')} →
              </AppButton>
            ) : (
              <AppButton onClick={handleFinish}>
                {t('finishButton')}
              </AppButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
