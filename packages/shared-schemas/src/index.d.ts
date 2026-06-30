import { z } from 'zod';
export declare const orientationSchema: z.ZodObject<{
    userId: z.ZodString;
    level: z.ZodString;
    goal: z.ZodString;
}, z.core.$strip>;
export declare const validText: (field: string) => z.ZodOptional<z.ZodString>;
export declare const wellbeingEmojiSchema: z.ZodEnum<{
    Agotado: "Agotado";
    Triste: "Triste";
    Neutral: "Neutral";
    Bien: "Bien";
    Genial: "Genial";
}>;
export declare const wellbeingRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    emoji: z.ZodEnum<{
        Agotado: "Agotado";
        Triste: "Triste";
        Neutral: "Neutral";
        Bien: "Bien";
        Genial: "Genial";
    }>;
    nota_diaria: z.ZodOptional<z.ZodNumber>;
    motivo: z.ZodOptional<z.ZodString>;
    contexto: z.ZodOptional<z.ZodString>;
    historial_semanal: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    idioma: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const wellbeingResponseSchema: z.ZodObject<{
    nota_actual: z.ZodNumber;
    nota_semanal: z.ZodNumber;
    mensaje: z.ZodString;
    accion_sugerida: z.ZodString;
    derivar_cvv: z.ZodBoolean;
    alerta: z.ZodBoolean;
}, z.core.$strip>;
export declare const onboardingStep1Schema: z.ZodObject<{
    fechaNacimiento: z.ZodString;
    genero: z.ZodEnum<{
        Masculino: "Masculino";
        Femenino: "Femenino";
        No_binario: "No_binario";
        Prefiero_no_decir: "Prefiero_no_decir";
    }>;
    pais: z.ZodString;
    provinciaEstado: z.ZodOptional<z.ZodString>;
    ciudad: z.ZodString;
    zonaResidencia: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const onboardingStep2Schema: z.ZodObject<{
    nivelEducacion: z.ZodArray<z.ZodEnum<{
        Secundario_incompleto: "Secundario_incompleto";
        Secundario_completo: "Secundario_completo";
        Universitario_incompleto: "Universitario_incompleto";
        Universitario_completo: "Universitario_completo";
        Licenciatura: "Licenciatura";
        Diplomatura: "Diplomatura";
        Maestria: "Maestria";
        Doctorado: "Doctorado";
    }>>;
    momentoProfesional: z.ZodArray<z.ZodEnum<{
        Estudio_actualmente: "Estudio_actualmente";
        Sin_experiencia_laboral: "Sin_experiencia_laboral";
        En_busqueda_activa: "En_busqueda_activa";
        Trabajando_cambiar: "Trabajando_cambiar";
        Freelancer: "Freelancer";
        Emprendedor_a: "Emprendedor_a";
    }>>;
    areasInteres: z.ZodArray<z.ZodEnum<{
        Data_Analytics: "Data_Analytics";
        Desarrollo_Web: "Desarrollo_Web";
        UX_UI_Design: "UX_UI_Design";
        Ciberseguridad: "Ciberseguridad";
        Cloud_DevOps: "Cloud_DevOps";
        Inteligencia_Artificial: "Inteligencia_Artificial";
        Marketing_Digital: "Marketing_Digital";
        Product_Management: "Product_Management";
    }>>;
    idiomas: z.ZodArray<z.ZodObject<{
        idioma: z.ZodEnum<{
            Espanol: "Espanol";
            Ingles: "Ingles";
            Portugues: "Portugues";
            Frances: "Frances";
        }>;
        nivel: z.ZodEnum<{
            A1: "A1";
            A2: "A2";
            B1: "B1";
            B2: "B2";
            C1: "C1";
        }>;
    }, z.core.$strip>>;
    disponibilidad: z.ZodArray<z.ZodEnum<{
        Part_time: "Part_time";
        Full_time: "Full_time";
        Contractor: "Contractor";
        Freelance: "Freelance";
    }>>;
    ubicacionTrabajo: z.ZodEnum<{
        Presencial: "Presencial";
        Hibrido: "Hibrido";
        Remoto: "Remoto";
    }>;
}, z.core.$strip>;
export declare const onboardingStep3Schema: z.ZodObject<{
    objetivos: z.ZodArray<z.ZodEnum<{
        Primer_empleo_IT: "Primer_empleo_IT";
        Reconversion_laboral: "Reconversion_laboral";
        Mejorar_salario: "Mejorar_salario";
        Definir_camino: "Definir_camino";
        Ampliar_red: "Ampliar_red";
        Aprender_tecnologias: "Aprender_tecnologias";
        Estudiar_sin_trabajar: "Estudiar_sin_trabajar";
        Emprender: "Emprender";
    }>>;
    dispositivos: z.ZodArray<z.ZodEnum<{
        Solo_celular: "Solo_celular";
        PC_Laptop: "PC_Laptop";
        Tablet: "Tablet";
    }>>;
    tipoConexion: z.ZodEnum<{
        Banda_ancha_estable: "Banda_ancha_estable";
        Datos_moviles: "Datos_moviles";
        Conexion_inestable: "Conexion_inestable";
        Sin_conexion_casa: "Sin_conexion_casa";
    }>;
    whatsappCodigo: z.ZodOptional<z.ZodString>;
    whatsappNumero: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const onboardingSchema: z.ZodObject<{
    objetivos: z.ZodArray<z.ZodEnum<{
        Primer_empleo_IT: "Primer_empleo_IT";
        Reconversion_laboral: "Reconversion_laboral";
        Mejorar_salario: "Mejorar_salario";
        Definir_camino: "Definir_camino";
        Ampliar_red: "Ampliar_red";
        Aprender_tecnologias: "Aprender_tecnologias";
        Estudiar_sin_trabajar: "Estudiar_sin_trabajar";
        Emprender: "Emprender";
    }>>;
    dispositivos: z.ZodArray<z.ZodEnum<{
        Solo_celular: "Solo_celular";
        PC_Laptop: "PC_Laptop";
        Tablet: "Tablet";
    }>>;
    tipoConexion: z.ZodEnum<{
        Banda_ancha_estable: "Banda_ancha_estable";
        Datos_moviles: "Datos_moviles";
        Conexion_inestable: "Conexion_inestable";
        Sin_conexion_casa: "Sin_conexion_casa";
    }>;
    whatsappCodigo: z.ZodOptional<z.ZodString>;
    whatsappNumero: z.ZodOptional<z.ZodString>;
    nivelEducacion: z.ZodArray<z.ZodEnum<{
        Secundario_incompleto: "Secundario_incompleto";
        Secundario_completo: "Secundario_completo";
        Universitario_incompleto: "Universitario_incompleto";
        Universitario_completo: "Universitario_completo";
        Licenciatura: "Licenciatura";
        Diplomatura: "Diplomatura";
        Maestria: "Maestria";
        Doctorado: "Doctorado";
    }>>;
    momentoProfesional: z.ZodArray<z.ZodEnum<{
        Estudio_actualmente: "Estudio_actualmente";
        Sin_experiencia_laboral: "Sin_experiencia_laboral";
        En_busqueda_activa: "En_busqueda_activa";
        Trabajando_cambiar: "Trabajando_cambiar";
        Freelancer: "Freelancer";
        Emprendedor_a: "Emprendedor_a";
    }>>;
    areasInteres: z.ZodArray<z.ZodEnum<{
        Data_Analytics: "Data_Analytics";
        Desarrollo_Web: "Desarrollo_Web";
        UX_UI_Design: "UX_UI_Design";
        Ciberseguridad: "Ciberseguridad";
        Cloud_DevOps: "Cloud_DevOps";
        Inteligencia_Artificial: "Inteligencia_Artificial";
        Marketing_Digital: "Marketing_Digital";
        Product_Management: "Product_Management";
    }>>;
    idiomas: z.ZodArray<z.ZodObject<{
        idioma: z.ZodEnum<{
            Espanol: "Espanol";
            Ingles: "Ingles";
            Portugues: "Portugues";
            Frances: "Frances";
        }>;
        nivel: z.ZodEnum<{
            A1: "A1";
            A2: "A2";
            B1: "B1";
            B2: "B2";
            C1: "C1";
        }>;
    }, z.core.$strip>>;
    disponibilidad: z.ZodArray<z.ZodEnum<{
        Part_time: "Part_time";
        Full_time: "Full_time";
        Contractor: "Contractor";
        Freelance: "Freelance";
    }>>;
    ubicacionTrabajo: z.ZodEnum<{
        Presencial: "Presencial";
        Hibrido: "Hibrido";
        Remoto: "Remoto";
    }>;
    fechaNacimiento: z.ZodString;
    genero: z.ZodEnum<{
        Masculino: "Masculino";
        Femenino: "Femenino";
        No_binario: "No_binario";
        Prefiero_no_decir: "Prefiero_no_decir";
    }>;
    pais: z.ZodString;
    provinciaEstado: z.ZodOptional<z.ZodString>;
    ciudad: z.ZodString;
    zonaResidencia: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type OnboardingRequest = z.infer<typeof onboardingSchema>;
export declare const onboardingResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    userId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map