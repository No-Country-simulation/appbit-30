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
import { Body, Caption } from '@/src/components/typography';

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
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className='flex justify-center py-4'>
          <StepIndicator currentStep={step} totalSteps={3} />
        </div>

        <div className='space-y-5'>
          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <>
              <Caption>{t('step1Subtitle')}</Caption>

              <div className='space-y-4'>
                <div>
                  <Body>{t('fechaNacimiento')}</Body>
                  <AppInput
                    type='date'
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                  />
                </div>

                <div>
                  <Body>{t('genero')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {['Masculino', 'Femenino', 'No_binario', 'Prefiero_no_decir'].map(
                      (opt) => (
                        <ChoiceChip
                          key={opt}
                          label={t(`genero_${opt}`)}
                          selected={genero === opt}
                          onClick={() =>
                            setGenero(genero === opt ? null : opt)
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <Body>{t('pais')}</Body>
                  <AppInput
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                  />
                </div>

                <div>
                  <Body>{t('provinciaEstado')}</Body>
                  <AppInput
                    value={provinciaEstado}
                    onChange={(e) => setProvinciaEstado(e.target.value)}
                  />
                </div>

                <div>
                  <Body>{t('ciudad')}</Body>
                  <AppInput
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                  />
                </div>

                <div>
                  <Body>{t('zonaResidencia')}</Body>
                  <AppInput
                    value={zonaResidencia}
                    onChange={(e) => setZonaResidencia(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <>
              <Caption>{t('step2Subtitle')}</Caption>

              <div className='space-y-5'>
                <div>
                  <Body>{t('nivelEducacion')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Secundario_incompleto',
                      'Secundario_completo',
                      'Universitario_incompleto',
                      'Universitario_completo',
                      'Licenciatura',
                      'Diplomatura',
                      'Maestria',
                      'Doctorado',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`nivel_${opt}`)}
                        selected={nivelEducacion.includes(opt)}
                        onClick={() =>
                          toggleArray(nivelEducacion, opt, setNivelEducacion)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('momentoProfesional')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Estudio_actualmente',
                      'Sin_experiencia_laboral',
                      'En_busqueda_activa',
                      'Trabajando_cambiar',
                      'Freelancer',
                      'Emprendedor_a',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`momento_${opt}`)}
                        selected={momentoProfesional === opt}
                        onClick={() =>
                          setMomentoProfesional(
                            momentoProfesional === opt ? null : opt,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('areasInteres')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Data_Analytics',
                      'Desarrollo_Web',
                      'UX_UI_Design',
                      'Ciberseguridad',
                      'Cloud_DevOps',
                      'Inteligencia_Artificial',
                      'Marketing_Digital',
                      'Product_Management',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`area_${opt}`)}
                        selected={areasInteres.includes(opt)}
                        onClick={() =>
                          toggleArray(areasInteres, opt, setAreasInteres)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('idiomas')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Nativo',
                      'A1_Basico',
                      'B1_Intermedio',
                      'B2_Avanzado',
                      'C1_C2_Bilingue',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`idioma_${opt}`)}
                        selected={idiomas.includes(opt)}
                        onClick={() =>
                          toggleArray(idiomas, opt, setIdiomas)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('disponibilidad')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {['Part_time', 'Full_time', 'Contractor', 'Freelance'].map(
                      (opt) => (
                        <ChoiceChip
                          key={opt}
                          label={t(`disp_${opt}`)}
                          selected={disponibilidad === opt}
                          onClick={() =>
                            setDisponibilidad(
                              disponibilidad === opt ? null : opt,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <Body>{t('ubicacionTrabajo')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {['Presencial', 'Hibrido', 'Remoto'].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`ubic_${opt}`)}
                        selected={ubicacionTrabajo === opt}
                        onClick={() =>
                          setUbicacionTrabajo(
                            ubicacionTrabajo === opt ? null : opt,
                          )
                        }
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
              <Caption>{t('step3Subtitle')}</Caption>

              <div className='space-y-5'>
                <div>
                  <Body>{t('objetivos')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Primer_empleo_IT',
                      'Reconversion_laboral',
                      'Mejorar_salario',
                      'Definir_camino',
                      'Ampliar_red',
                      'Aprender_tecnologias',
                      'Estudiar_sin_trabajar',
                      'Emprender',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`obj_${opt}`)}
                        selected={objetivos.includes(opt)}
                        onClick={() =>
                          toggleArray(objetivos, opt, setObjetivos)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('dispositivos')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {['Solo_celular', 'PC_Laptop', 'Tablet'].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`disp_${opt}`)}
                        selected={dispositivos.includes(opt)}
                        onClick={() =>
                          toggleArray(dispositivos, opt, setDispositivos)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Body>{t('tipoConexion')}</Body>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {[
                      'Banda_ancha_estable',
                      'Datos_moviles',
                      'Conexion_inestable',
                      'Sin_conexion_casa',
                    ].map((opt) => (
                      <ChoiceChip
                        key={opt}
                        label={t(`conexion_${opt}`)}
                        selected={tipoConexion === opt}
                        onClick={() =>
                          setTipoConexion(
                            tipoConexion === opt ? null : opt,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <div className='w-1/3'>
                    <Body>{t('whatsappCodigo')}</Body>
                    <AppInput
                      value={whatsappCodigo}
                      onChange={(e) => setWhatsappCodigo(e.target.value)}
                      placeholder='+54'
                    />
                  </div>
                  <div className='w-2/3'>
                    <Body>{t('whatsappNumero')}</Body>
                    <AppInput
                      value={whatsappNumero}
                      onChange={(e) => setWhatsappNumero(e.target.value)}
                      placeholder='11 1234 5678'
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
