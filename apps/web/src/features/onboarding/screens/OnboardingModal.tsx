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
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react';

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

  // Step 1
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [pais, setPais] = useState('');
  const [provinciaEstado, setProvinciaEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [zonaResidencia, setZonaResidencia] = useState('');

  // Step 2
  const [nivelEducacion, setNivelEducacion] = useState<string[]>([]);
  const [momentoProfesional, setMomentoProfesional] = useState<string[]>([]);
  const [areasInteres, setAreasInteres] = useState<string[]>([]);
  const [idiomas, setIdiomas] = useState<string[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<string[]>([]);
  const [ubicacionTrabajo, setUbicacionTrabajo] = useState('');

  // Step 3
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [dispositivos, setDispositivos] = useState<string[]>([]);
  const [tipoConexion, setTipoConexion] = useState('');
  const [whatsappCodigo, setWhatsappCodigo] = useState('');
  const [whatsappNumero, setWhatsappNumero] = useState('');

  function toggleArray(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function isStepValid(): boolean {
    if (step === 1) {
      return !!fechaNacimiento && !!genero && !!pais && !!ciudad;
    }
    if (step === 2) {
      return (
        nivelEducacion.length > 0 &&
        momentoProfesional.length > 0 &&
        areasInteres.length > 0 &&
        idiomas.length > 0 &&
        disponibilidad.length > 0 &&
        !!ubicacionTrabajo
      );
    }
    return objetivos.length > 0 && dispositivos.length > 0 && !!tipoConexion;
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
    const data = {
      fechaNacimiento,
      genero,
      pais,
      provinciaEstado,
      ciudad,
      zonaResidencia,
      nivelEducacion,
      momentoProfesional,
      areasInteres,
      idiomas,
      disponibilidad,
      ubicacionTrabajo,
      objetivos,
      dispositivos,
      tipoConexion,
      whatsappCodigo,
      whatsappNumero,
    };
    console.log('Onboarding data:', data);
  }

  function resetForm() {
    setStep(1);
    setFechaNacimiento('');
    setGenero('');
    setPais('');
    setProvinciaEstado('');
    setCiudad('');
    setZonaResidencia('');
    setNivelEducacion([]);
    setMomentoProfesional([]);
    setAreasInteres([]);
    setIdiomas([]);
    setDisponibilidad([]);
    setUbicacionTrabajo('');
    setObjetivos([]);
    setDispositivos([]);
    setTipoConexion('');
    setWhatsappCodigo('');
    setWhatsappNumero('');
  }

  const nivelEducacionOptions = [
    { value: 'Secundario', label: t('nivelEducacionOption1') },
    { value: 'Terciario', label: t('nivelEducacionOption2') },
    { value: 'Universitario', label: t('nivelEducacionOption3') },
    { value: 'Posgrado', label: t('nivelEducacionOption4') },
    { value: 'Curso_tecnico_bootcamp', label: t('nivelEducacionOption5') },
    { value: 'Otro', label: t('nivelEducacionOption6') },
  ];

  const momentoProfesionalOptions = [
    { value: 'Estudiando', label: t('momentoProfesionalOption1') },
    { value: 'Sin_experiencia_laboral', label: t('momentoProfesionalOption2') },
    { value: 'En_busqueda_activa', label: t('momentoProfesionalOption3') },
    { value: 'Trabajando_cambiar', label: t('momentoProfesionalOption4') },
    { value: 'Freelancer', label: t('momentoProfesionalOption5') },
    { value: 'Emprendedor', label: t('momentoProfesionalOption6') },
  ];

  const areasInteresOptions = [
    { value: 'Data_Analytics', label: t('areasInteresOption1') },
    { value: 'Desarrollo_Web', label: t('areasInteresOption2') },
    { value: 'UX_UI_Design', label: t('areasInteresOption3') },
    { value: 'Ciberseguridad', label: t('areasInteresOption4') },
    { value: 'Cloud_DevOps', label: t('areasInteresOption5') },
    { value: 'IA', label: t('areasInteresOption6') },
    { value: 'Marketing_Digital', label: t('areasInteresOption7') },
    { value: 'Product_Management', label: t('areasInteresOption8') },
  ];

  const idiomasOptions = [
    { value: 'Espanol_nativo', label: t('idiomasOption1') },
    { value: 'Ingles_A1', label: t('idiomasOption2') },
    { value: 'Ingles_B1', label: t('idiomasOption3') },
    { value: 'Ingles_B2', label: t('idiomasOption4') },
    { value: 'Ingles_C1_C2', label: t('idiomasOption5') },
    { value: 'Portugues', label: t('idiomasOption6') },
    { value: 'Frances', label: t('idiomasOption7') },
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

  function FieldError({ show }: { show: boolean }) {
    if (!show) return null;
    return (
      <Caption className='mt-1 flex items-center gap-1 text-[var(--color-danger)]'>
        <AlertCircleIcon className='size-3 shrink-0' />
        {t('fieldRequired')}
      </Caption>
    );
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className='cursor-pointer'>
        {children}
      </span>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent ref={scrollRef} showCloseButton={false} className='sm:max-w-lg' onPointerDownOutside={handlePointerDownOutside}>
          <div className='flex justify-center py-2'>
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
                      value={fechaNacimiento}
                      onChange={(e) => { setFechaNacimiento(e.target.value); setShowErrors(false); }}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <FieldError show={showErrors && !fechaNacimiento} />
                  </div>

                  <div>
                    <Body>{t('generoLabel')}</Body>
                    <Select value={genero} onValueChange={(v) => { setGenero(v); setShowErrors(false); }} onOpenChange={(v) => { selectOpenRef.current = v; }}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('generoPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Masculino'>{t('generoOption1')}</SelectItem>
                        <SelectItem value='Femenino'>{t('generoOption2')}</SelectItem>
                        <SelectItem value='No_binario'>{t('generoOption3')}</SelectItem>
                        <SelectItem value='Prefiero_no_decir'>{t('generoOption4')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError show={showErrors && !genero} />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Body>{t('paisLabel')}</Body>
                      <Select value={pais} onValueChange={(v) => { setPais(v); setShowErrors(false); }} onOpenChange={(v) => { selectOpenRef.current = v; }}>
                        <SelectTrigger className='w-full'>
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
                      <FieldError show={showErrors && !pais} />
                    </div>
                    <div>
                      <Body>{t('provinciaEstadoLabel')}</Body>
                      <AppInput
                        value={provinciaEstado}
                        onChange={(e) => setProvinciaEstado(e.target.value)}
                        placeholder={t('provinciaEstadoPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Body>{t('ciudadLabel')}</Body>
                    <AppInput
                      value={ciudad}
                      onChange={(e) => { setCiudad(e.target.value); setShowErrors(false); }}
                      placeholder={t('ciudadPlaceholder')}
                    />
                    <FieldError show={showErrors && !ciudad} />
                  </div>

                  <div>
                    <Body>
                      {t('zonaResidenciaLabel')}{' '}
                      <span className='text-[var(--color-text-muted)] text-xs'>{t('zonaResidenciaOptional')}</span>
                    </Body>
                    <AppInput
                      value={zonaResidencia}
                      onChange={(e) => setZonaResidencia(e.target.value)}
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
                        selected={nivelEducacion.includes(opt.value)}
                        onClick={() => { toggleArray(nivelEducacion, opt.value, setNivelEducacion); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && nivelEducacion.length === 0} />
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
                        selected={momentoProfesional.includes(opt.value)}
                        onClick={() => { toggleArray(momentoProfesional, opt.value, setMomentoProfesional); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && momentoProfesional.length === 0} />
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
                        selected={areasInteres.includes(opt.value)}
                        onClick={() => { toggleArray(areasInteres, opt.value, setAreasInteres); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && areasInteres.length === 0} />
                </div>

                <div>
                  <Body>
                    {t('idiomasLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('idiomasHint')}</span>
                  </Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {idiomasOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={idiomas.includes(opt.value)}
                        onClick={() => { toggleArray(idiomas, opt.value, setIdiomas); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && idiomas.length === 0} />
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
                        selected={disponibilidad.includes(opt.value)}
                        onClick={() => { toggleArray(disponibilidad, opt.value, setDisponibilidad); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && disponibilidad.length === 0} />
                </div>

                <div>
                  <Body>{t('ubicacionTrabajoLabel')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {ubicacionTrabajoOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={ubicacionTrabajo === opt.value}
                        onClick={() => { setUbicacionTrabajo(ubicacionTrabajo === opt.value ? '' : opt.value); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && !ubicacionTrabajo} />
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
                        selected={objetivos.includes(opt.value)}
                        onClick={() => { toggleArray(objetivos, opt.value, setObjetivos); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && objetivos.length === 0} />
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
                        selected={dispositivos.includes(opt.value)}
                        onClick={() => { toggleArray(dispositivos, opt.value, setDispositivos); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && dispositivos.length === 0} />
                </div>

                <div>
                  <Body>{t('tipoConexionLabel')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {tipoConexionOptions.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        label={opt.label}
                        selected={tipoConexion === opt.value}
                        onClick={() => { setTipoConexion(tipoConexion === opt.value ? '' : opt.value); setShowErrors(false); }}
                      />
                    ))}
                  </div>
                  <FieldError show={showErrors && !tipoConexion} />
                </div>

                <div>
                  <Body>
                    {t('whatsappLabel')}{' '}
                    <span className='text-[var(--color-text-muted)] text-xs'>{t('whatsappOptional')}</span>
                  </Body>
                  <div className='mt-2 flex gap-2'>
                    <div className='w-1/3'>
                      <CountryCodeSelect
                        value={whatsappCodigo}
                        onChange={setWhatsappCodigo}
                        onOpenChange={(v) => { selectOpenRef.current = v; }}
                        placeholder='+54'
                      />
                    </div>
                    <div className='w-2/3'>
                      <AppInput
                        value={whatsappNumero}
                        onChange={(e) => setWhatsappNumero(e.target.value)}
                        placeholder={t('whatsappPlaceholder')}
                      />
                    </div>
                  </div>
                  <Caption className='mt-1 text-[var(--color-text-muted)]'>
                    {t('whatsappInfo')}
                  </Caption>
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
