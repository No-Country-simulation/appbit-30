'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { AppButton, AppInput, ChoiceChip, StepIndicator } from '@/src/components';
import { Body } from '@/src/components/typography';

type Step = 1 | 2 | 3;

interface OnboardingModalProps {
  children: React.ReactNode;
}

export function OnboardingModal({ children }: OnboardingModalProps) {
  const t = useTranslations('Onboarding');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<string | null>(null);
  const [pais, setPais] = useState('');
  const [provinciaEstado, setProvinciaEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [zonaResidencia, setZonaResidencia] = useState('');

  // Step 2
  const [nivelEducacion, setNivelEducacion] = useState<string[]>([]);
  const [momentoProfesional, setMomentoProfesional] = useState<string | null>(null);
  const [areasInteres, setAreasInteres] = useState<string[]>([]);
  const [idiomas, setIdiomas] = useState<string[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<string | null>(null);
  const [ubicacionTrabajo, setUbicacionTrabajo] = useState<string | null>(null);

  // Step 3
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [dispositivos, setDispositivos] = useState<string[]>([]);
  const [tipoConexion, setTipoConexion] = useState<string | null>(null);
  const [whatsappCodigo, setWhatsappCodigo] = useState('');
  const [whatsappNumero, setWhatsappNumero] = useState('');

  function toggleArray(
    arr: string[],
    value: string,
    setter: (v: string[]) => void,
  ) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function isStepValid(): boolean {
    if (step === 1) {
      return !!fechaNacimiento && !!genero && pais.trim().length >= 2 && ciudad.trim().length >= 2;
    }
    if (step === 2) {
      return (
        nivelEducacion.length > 0 &&
        !!momentoProfesional &&
        areasInteres.length > 0 &&
        idiomas.length > 0 &&
        !!disponibilidad &&
        !!ubicacionTrabajo
      );
    }
    return objetivos.length > 0 && dispositivos.length > 0 && !!tipoConexion;
  }

  function handleNext() {
    if (step < 3) setStep((step + 1) as Step);
  }

  function handleBack() {
    if (step > 1) setStep((step - 1) as Step);
  }

  function handleFinish() {
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
    setGenero(null);
    setPais('');
    setProvinciaEstado('');
    setCiudad('');
    setZonaResidencia('');
    setNivelEducacion([]);
    setMomentoProfesional(null);
    setAreasInteres([]);
    setIdiomas([]);
    setDisponibilidad(null);
    setUbicacionTrabajo(null);
    setObjetivos([]);
    setDispositivos([]);
    setTipoConexion(null);
    setWhatsappCodigo('');
    setWhatsappNumero('');
  }

  const generoOptions = [
    { value: 'Masculino', label: t('generoOption1') },
    { value: 'Femenino', label: t('generoOption2') },
    { value: 'No_binario', label: t('generoOption3') },
    { value: 'Prefiero_no_decir', label: t('generoOption4') },
  ];

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
    { value: 'Buscando_trabajo', label: t('momentoProfesionalOption2') },
    { value: 'Trabajando_menos_1_anio', label: t('momentoProfesionalOption3') },
    { value: 'Trabajando_mas_1_anio', label: t('momentoProfesionalOption4') },
    { value: 'Transicion_carrera', label: t('momentoProfesionalOption5') },
    { value: 'Desempleado', label: t('momentoProfesionalOption6') },
  ];

  const areasInteresOptions = [
    { value: 'Desarrollo_software', label: t('areasInteresOption1') },
    { value: 'Datos_analisis', label: t('areasInteresOption2') },
    { value: 'Diseno_UX_UI', label: t('areasInteresOption3') },
    { value: 'Marketing_digital', label: t('areasInteresOption4') },
    { value: 'Ciberseguridad', label: t('areasInteresOption5') },
    { value: 'Cloud_infraestructura', label: t('areasInteresOption6') },
    { value: 'IA', label: t('areasInteresOption7') },
    { value: 'Gestion_proyectos', label: t('areasInteresOption8') },
    { value: 'Soporte_tecnico', label: t('areasInteresOption9') },
    { value: 'Otro', label: t('areasInteresOption10') },
  ];

  const idiomasOptions = [
    { value: 'Ingles_basico', label: t('idiomasOption1') },
    { value: 'Ingles_intermedio', label: t('idiomasOption2') },
    { value: 'Ingles_avanzado', label: t('idiomasOption3') },
    { value: 'Portugues', label: t('idiomasOption4') },
    { value: 'Espanol', label: t('idiomasOption5') },
    { value: 'Otro', label: t('idiomasOption6') },
  ];

  const disponibilidadOptions = [
    { value: 'Inmediata', label: t('disponibilidadOption1') },
    { value: 'En_1_mes', label: t('disponibilidadOption2') },
    { value: 'En_3_meses', label: t('disponibilidadOption3') },
    { value: 'Mas_3_meses', label: t('disponibilidadOption4') },
  ];

  const ubicacionTrabajoOptions = [
    { value: 'Remoto', label: t('ubicacionTrabajoOption1') },
    { value: 'Hibrido', label: t('ubicacionTrabajoOption2') },
    { value: 'Presencial', label: t('ubicacionTrabajoOption3') },
  ];

  const objetivosOptions = [
    { value: 'Primer_empleo_tech', label: t('objetivosOption1') },
    { value: 'Cambiar_area_profesional', label: t('objetivosOption2') },
    { value: 'Mejorar_puesto_actual', label: t('objetivosOption3') },
    { value: 'Crear_emprendimiento', label: t('objetivosOption4') },
    { value: 'Aprender_nueva_habilidad', label: t('objetivosOption5') },
    { value: 'Obtener_certificacion', label: t('objetivosOption6') },
  ];

  const dispositivosOptions = [
    { value: 'Smartphone_Android', label: t('dispositivosOption1') },
    { value: 'iPhone', label: t('dispositivosOption2') },
    { value: 'PC_Notebook', label: t('dispositivosOption3') },
    { value: 'Tablet', label: t('dispositivosOption4') },
    { value: 'Solo_celular', label: t('dispositivosOption5') },
  ];

  const tipoConexionOptions = [
    { value: 'WiFi_casa', label: t('tipoConexionOption1') },
    { value: 'Datos_4G', label: t('tipoConexionOption2') },
    { value: 'Datos_5G', label: t('tipoConexionOption3') },
    { value: 'WiFi_compartido', label: t('tipoConexionOption4') },
  ];

  return (
    <>
      <span onClick={() => setOpen(true)} className='cursor-pointer'>
        {children}
      </span>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent
          showCloseButton={false}
          className='sm:max-w-lg'
        >
          <DialogHeader>
            <DialogTitle>{t('step1Title')}</DialogTitle>
            <DialogDescription>{t('stepIndicator', { step, total: 3 })}</DialogDescription>
          </DialogHeader>

          <div className='flex justify-center py-4'>
            <StepIndicator currentStep={step} totalSteps={3} />
          </div>

          <div className='space-y-5'>
            {/* ===== STEP 1 ===== */}
            {step === 1 && (
              <>
                <Body>{t('step1Title')}</Body>

                <div className='space-y-4'>
                  <div>
                    <Body>{t('fechaNacimientoLabel')}</Body>
                    <AppInput
                      type='date'
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                    />
                  </div>

                  <div>
                    <Body>{t('generoLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {generoOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={genero === opt.value}
                          onClick={() => setGenero(genero === opt.value ? null : opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('paisLabel')}</Body>
                    <AppInput
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      placeholder={t('paisPlaceholder')}
                    />
                  </div>

                  <div>
                    <Body>{t('provinciaEstadoLabel')}</Body>
                    <AppInput
                      value={provinciaEstado}
                      onChange={(e) => setProvinciaEstado(e.target.value)}
                      placeholder={t('provinciaEstadoPlaceholder')}
                    />
                  </div>

                  <div>
                    <Body>{t('ciudadLabel')}</Body>
                    <AppInput
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder={t('ciudadPlaceholder')}
                    />
                  </div>

                  <div>
                    <Body>{t('zonaResidenciaLabel')}</Body>
                    <AppInput
                      value={zonaResidencia}
                      onChange={(e) => setZonaResidencia(e.target.value)}
                      placeholder={t('zonaResidenciaPlaceholder')}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 2 ===== */}
            {step === 2 && (
              <>
                <Body>{t('step2Title')}</Body>

                <div className='space-y-5'>
                  <div>
                    <Body>{t('nivelEducacionLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {nivelEducacionOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={nivelEducacion.includes(opt.value)}
                          onClick={() => toggleArray(nivelEducacion, opt.value, setNivelEducacion)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('momentoProfesionalLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {momentoProfesionalOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={momentoProfesional === opt.value}
                          onClick={() => setMomentoProfesional(momentoProfesional === opt.value ? null : opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('areasInteresLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {areasInteresOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={areasInteres.includes(opt.value)}
                          onClick={() => toggleArray(areasInteres, opt.value, setAreasInteres)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('idiomasLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {idiomasOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={idiomas.includes(opt.value)}
                          onClick={() => toggleArray(idiomas, opt.value, setIdiomas)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('disponibilidadLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {disponibilidadOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={disponibilidad === opt.value}
                          onClick={() => setDisponibilidad(disponibilidad === opt.value ? null : opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('ubicacionTrabajoLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {ubicacionTrabajoOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={ubicacionTrabajo === opt.value}
                          onClick={() => setUbicacionTrabajo(ubicacionTrabajo === opt.value ? null : opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 3 ===== */}
            {step === 3 && (
              <>
                <Body>{t('step3Title')}</Body>

                <div className='space-y-5'>
                  <div>
                    <Body>{t('objetivosLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {objetivosOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={objetivos.includes(opt.value)}
                          onClick={() => toggleArray(objetivos, opt.value, setObjetivos)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('dispositivosLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {dispositivosOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={dispositivos.includes(opt.value)}
                          onClick={() => toggleArray(dispositivos, opt.value, setDispositivos)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Body>{t('tipoConexionLabel')}</Body>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {tipoConexionOptions.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          label={opt.label}
                          selected={tipoConexion === opt.value}
                          onClick={() => setTipoConexion(tipoConexion === opt.value ? null : opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <div className='w-1/3'>
                      <Body>{t('whatsappCodigoLabel')}</Body>
                      <AppInput
                        value={whatsappCodigo}
                        onChange={(e) => setWhatsappCodigo(e.target.value)}
                        placeholder={t('whatsappCodigoPlaceholder')}
                      />
                    </div>
                    <div className='w-2/3'>
                      <Body>{t('whatsappNumeroLabel')}</Body>
                      <AppInput
                        value={whatsappNumero}
                        onChange={(e) => setWhatsappNumero(e.target.value)}
                        placeholder={t('whatsappNumeroPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {step > 1 && (
              <AppButton variant='outline' onClick={handleBack}>
                {t('backButton')}
              </AppButton>
            )}
            {step < 3 ? (
              <AppButton disabled={!isStepValid()} onClick={handleNext}>
                {t('nextButton')}
              </AppButton>
            ) : (
              <AppButton disabled={!isStepValid()} onClick={handleFinish}>
                {t('finishButton')}
              </AppButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
