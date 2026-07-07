export const MARKET_SKILL_LEVELS = ['Junior', 'Mid', 'Senior'] as const;

export type MarketSkillLevel = (typeof MARKET_SKILL_LEVELS)[number];

export const MARKET_SKILL_LEVEL_LABEL_KEYS = {
  Junior: 'skillLevelJunior',
  Mid: 'skillLevelMid',
  Senior: 'skillLevelSenior',
} as const satisfies Record<MarketSkillLevel, string>;

export type MarketSkillOption = {
  value: string;
  labelKey: string;
};

function skill(value: string, labelKey: string): MarketSkillOption {
  return {
    value,
    labelKey,
  };
}

export const MARKET_SKILLS_BY_AREA = {
  Desarrollo_Web: {
    labelKey: 'marketAreaWebDevelopment',
    hardSkills: {
      Junior: [
        skill('HTML5/CSS3', 'skillHtmlCss'),
        skill('JavaScript ES6+', 'skillJavascriptEs6'),
        skill('Git básico', 'skillBasicGit'),
        skill('APIs REST', 'skillRestApis'),
        skill('React o Angular', 'skillReactAngular'),
        skill('Diseño Responsivo Web', 'skillResponsiveDesign'),
      ],
      Mid: [
        skill('TypeScript Web', 'skillTypescript'),
        skill('Redux/Zustand', 'skillReduxZustand'),
        skill('Next.js SSR/SSG', 'skillNextSsrSsg'),
        skill('SQL/NoSQL', 'skillSqlNoSql'),
        skill('Testing Jest/Cypress', 'skillTestingJestCypress'),
        skill('CI/CD básico Web', 'skillBasicCiCd'),
      ],
      Senior: [
        skill('Arquitectura de software', 'skillSoftwareArchitecture'),
        skill('Microfrontends', 'skillMicrofrontends'),
        skill('Web Performance', 'skillWebPerformance'),
        skill('OWASP Web', 'skillOwasp'),
        skill('AWS/GCP Web', 'skillAwsGcp'),
        skill('Diseño de APIs', 'skillApiDesign'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Ganas de aprender', 'skillLearningMindset'),
        skill('Recepción al feedback', 'skillFeedbackReception'),
        skill('Trabajo en equipo Web', 'skillTeamwork'),
      ],
      Mid: [
        skill('Autonomía Web', 'skillAutonomy'),
        skill('Code Review', 'skillCodeReview'),
        skill('Mentoreo básico', 'skillBasicMentoring'),
      ],
      Senior: [
        skill('Liderazgo técnico', 'skillTechnicalLeadership'),
        skill('Decisiones arquitectónicas', 'skillArchitecturalDecisions'),
        skill(
          'Negociación con stakeholders Web',
          'skillStakeholderNegotiation',
        ),
      ],
    },
  },

  Ciberseguridad: {
    labelKey: 'marketAreaCybersecurity',
    hardSkills: {
      Junior: [
        skill('Redes TCP/IP', 'skillTcpIpNetworks'),
        skill('Linux/Windows', 'skillLinuxWindows'),
        skill('Nmap/Nessus', 'skillNmapNessus'),
        skill('Criptografía básica', 'skillBasicCryptography'),
      ],
      Mid: [
        skill('Pentesting', 'skillPentesting'),
        skill('Análisis de Malware', 'skillMalwareAnalysis'),
        skill('SIEM Splunk/ELK', 'skillSiemSplunkElk'),
        skill('IAM', 'skillIam'),
        skill('Respuesta a incidentes', 'skillIncidentResponse'),
        skill('Python/Bash', 'skillPythonBash'),
      ],
      Senior: [
        skill('Threat Hunting', 'skillThreatHunting'),
        skill('Zero Trust', 'skillZeroTrust'),
        skill('ISO 27001/GDPR', 'skillIsoGdpr'),
        skill('DevSecOps', 'skillDevSecOps'),
        skill('Ciberinteligencia', 'skillCyberIntelligence'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Pensamiento analítico', 'skillAnalyticalThinking'),
        skill('Atención al detalle', 'skillAttentionToDetail'),
        skill('Curiosidad técnica', 'skillTechnicalCuriosity'),
      ],
      Mid: [
        skill('Trabajo bajo presión', 'skillWorkUnderPressure'),
        skill('Comunicación de riesgos', 'skillRiskCommunication'),
      ],
      Senior: [
        skill('Gestión de crisis', 'skillCrisisManagement'),
        skill('Estrategia corporativa', 'skillCorporateStrategy'),
        skill('Liderazgo de equipos Cyber', 'skillTeamLeadership'),
      ],
    },
  },

  Marketing_Digital: {
    labelKey: 'marketAreaDigitalMarketing',
    hardSkills: {
      Junior: [
        skill('Redes Sociales', 'skillSocialMedia'),
        skill('Copywriting básico', 'skillBasicCopywriting'),
        skill('Google Analytics Marketing', 'skillGoogleAnalytics'),
        skill('Email Marketing', 'skillEmailMarketing'),
        skill('SEO On-page', 'skillSeoOnPage'),
      ],
      Mid: [
        skill('Google Ads/Meta Ads', 'skillGoogleMetaAds'),
        skill('SEO Técnico', 'skillTechnicalSeo'),
        skill('KPIs/A-B Testing Marketing', 'skillKpisAbTesting'),
        skill('CRM HubSpot', 'skillCrmHubspot'),
      ],
      Senior: [
        skill('Go-to-Market', 'skillGoToMarket'),
        skill('Growth Hacking', 'skillGrowthHacking'),
        skill('Automatización Marketing', 'skillAutomation'),
        skill('ROI/ROAS', 'skillRoiRoas'),
        skill('Modelos de atribución', 'skillAttributionModels'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Creatividad', 'skillCreativity'),
        skill('Empatía con el usuario Marketing', 'skillUserEmpathy'),
        skill('Adaptabilidad Marketing', 'skillAdaptability'),
      ],
      Mid: [
        skill('Pensamiento estratégico Marketing', 'skillStrategicThinking'),
        skill('Análisis orientado a resultados', 'skillResultsDrivenAnalysis'),
      ],
      Senior: [
        skill('Liderazgo estratégico', 'skillStrategicLeadership'),
        skill('Visión de negocio', 'skillBusinessVision'),
        skill('Gestión de presupuestos', 'skillBudgetManagement'),
      ],
    },
  },

  Data_Analytics: {
    labelKey: 'marketAreaDataAnalytics',
    hardSkills: {
      Junior: [
        skill('SQL Data', 'skillSql'),
        skill('Excel Avanzado', 'skillAdvancedExcel'),
        skill('Python básico Pandas', 'skillBasicPythonPandas'),
        skill('Tableau/Power BI', 'skillTableauPowerBi'),
        skill('Estadística básica', 'skillBasicStatistics'),
      ],
      Mid: [
        skill('Modelado de datos', 'skillDataModeling'),
        skill('ETL/ELT dbt/Airflow', 'skillEtlElt'),
        skill('Python/R avanzado', 'skillAdvancedPythonR'),
        skill('ML básico Data', 'skillBasicMl'),
        skill('BigQuery/Snowflake', 'skillBigQuerySnowflake'),
      ],
      Senior: [
        skill('Arquitectura de Datos', 'skillDataArchitecture'),
        skill('Spark/Hadoop', 'skillSparkHadoop'),
        skill('MLOps Data', 'skillMlOps'),
        skill('Gobernanza de Datos', 'skillDataGovernance'),
        skill('Modelos predictivos', 'skillPredictiveModels'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Curiosidad matemática', 'skillMathematicalCuriosity'),
        skill('Precisión Data', 'skillPrecision'),
        skill('Organización Data', 'skillOrganization'),
      ],
      Mid: [
        skill('Storytelling con datos', 'skillDataStorytelling'),
        skill(
          'Traducción negocio-técnico',
          'skillBusinessTechnicalTranslation',
        ),
      ],
      Senior: [
        skill('Visión de producto Data', 'skillProductVision'),
        skill('Estrategia data-driven', 'skillDataDrivenStrategy'),
        skill('Liderazgo Data', 'skillLeadership'),
      ],
    },
  },

  UX_UI_Design: {
    labelKey: 'marketAreaUxUiDesign',
    hardSkills: {
      Junior: [
        skill('Figma', 'skillFigma'),
        skill('Principios de Diseño Visual', 'skillVisualDesignPrinciples'),
        skill('Wireframing', 'skillWireframing'),
        skill('Prototipado', 'skillPrototyping'),
        skill('Diseño Responsivo UX', 'skillResponsiveDesign'),
      ],
      Mid: [
        skill('User Research', 'skillUserResearch'),
        skill('Design Systems', 'skillDesignSystems'),
        skill('Arquitectura de la Información', 'skillInformationArchitecture'),
        skill('Usability Testing', 'skillUsabilityTesting'),
        skill('WCAG', 'skillWcag'),
      ],
      Senior: [
        skill('Estrategia UX', 'skillUxStrategy'),
        skill('Service Design', 'skillServiceDesign'),
        skill('CRO', 'skillCro'),
        skill('DesignOps', 'skillDesignOps'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Empatía UX', 'skillEmpathy'),
        skill('Recepción de críticas', 'skillCritiqueReception'),
        skill('Trabajo en equipo UX', 'skillTeamwork'),
      ],
      Mid: [
        skill('Facilitación de talleres', 'skillWorkshopFacilitation'),
        skill('Argumentación de diseño', 'skillDesignArgumentation'),
      ],
      Senior: [
        skill('Mentoría UX', 'skillMentoring'),
        skill('Liderazgo creativo', 'skillCreativeLeadership'),
        skill('Alineación con negocio', 'skillBusinessAlignment'),
      ],
    },
  },

  Inteligencia_Artificial: {
    labelKey: 'marketAreaArtificialIntelligence',
    hardSkills: {
      Junior: [
        skill('Python IA', 'skillPython'),
        skill('Álgebra Lineal/Cálculo', 'skillLinearAlgebraCalculus'),
        skill('Scikit-Learn', 'skillScikitLearn'),
        skill('Prompt Engineering', 'skillPromptEngineering'),
        skill('APIs de IA OpenAI/Gemini', 'skillAiApis'),
      ],
      Mid: [
        skill('Deep Learning TensorFlow/PyTorch', 'skillDeepLearning'),
        skill('NLP o Computer Vision', 'skillNlpComputerVision'),
        skill('Fine-Tuning LLMs', 'skillLlmFineTuning'),
        skill('LangChain/LlamaIndex', 'skillLangChainLlamaIndex'),
        skill('RAG', 'skillRag'),
      ],
      Senior: [
        skill('Arquitectura de Sistemas IA', 'skillAiSystemsArchitecture'),
        skill('Optimización de Modelos', 'skillModelOptimization'),
        skill('IA Ética', 'skillEthicalAi'),
        skill('MLOps IA', 'skillMlOps'),
        skill('Edge/Cloud a escala', 'skillEdgeCloudScale'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Curiosidad científica', 'skillScientificCuriosity'),
        skill('Resiliencia ante errores', 'skillErrorResilience'),
      ],
      Mid: [
        skill('Pensamiento abstracto', 'skillAbstractThinking'),
        skill('Innovación', 'skillInnovation'),
      ],
      Senior: [
        skill('Liderazgo de investigación', 'skillResearchLeadership'),
        skill('Ética profesional', 'skillProfessionalEthics'),
        skill('Visión de producto IA', 'skillProductVision'),
      ],
    },
  },

  Product_Management: {
    labelKey: 'marketAreaProductManagement',
    hardSkills: {
      Junior: [
        skill('User Stories', 'skillUserStories'),
        skill('Scrum/Kanban', 'skillScrumKanban'),
        skill('Métricas básicas', 'skillBasicMetrics'),
        skill('Backlog Grooming', 'skillBacklogGrooming'),
      ],
      Mid: [
        skill('Priorización RICE/MoSCoW', 'skillPrioritization'),
        skill('Product Discovery', 'skillProductDiscovery'),
        skill('Roadmap', 'skillRoadmap'),
        skill('Análisis de Cohortes', 'skillCohortAnalysis'),
        skill('A/B Testing Product', 'skillAbTesting'),
      ],
      Senior: [
        skill('Product-Led Growth', 'skillProductLedGrowth'),
        skill('P&L', 'skillPnl'),
        skill('OKRs', 'skillOkrs'),
        skill('Diseño Organizacional', 'skillOrganizationalDesign'),
        skill('Visión de largo plazo', 'skillLongTermVision'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Organización Product', 'skillOrganization'),
        skill('Comunicación asertiva Product', 'skillAssertiveCommunication'),
        skill('Empatía con el usuario Product', 'skillUserEmpathy'),
      ],
      Mid: [
        skill('Negociación Product', 'skillNegotiation'),
        skill('Facilitación Product', 'skillFacilitation'),
        skill('Gestión de stakeholders Product', 'skillStakeholderManagement'),
      ],
      Senior: [
        skill('Liderazgo de líderes', 'skillLeadershipOfLeaders'),
        skill('Decisiones de alto riesgo', 'skillHighRiskDecisions'),
        skill('Visión ejecutiva', 'skillExecutiveVision'),
      ],
    },
  },

  Cloud_DevOps: {
    labelKey: 'marketAreaCloudDevOps',
    hardSkills: {
      Junior: [
        skill('Linux CLI', 'skillLinuxCli'),
        skill('Bash/PowerShell', 'skillBashPowerShell'),
        skill('Fundamentos de Redes Cloud', 'skillNetworkingFundamentals'),
        skill('Git avanzado', 'skillAdvancedGit'),
        skill('Docker', 'skillDocker'),
        skill('Conceptos de Cloud', 'skillCloudConcepts'),
      ],
      Mid: [
        skill('Kubernetes', 'skillKubernetes'),
        skill('CI/CD GitHub Actions/Jenkins', 'skillCiCdGithubJenkins'),
        skill('Terraform/Ansible', 'skillTerraformAnsible'),
        skill('Prometheus/Grafana', 'skillPrometheusGrafana'),
      ],
      Senior: [
        skill('Arquitectura Cloud Nativa', 'skillCloudNativeArchitecture'),
        skill('SRE', 'skillSre'),
        skill('FinOps', 'skillFinOps'),
        skill('Seguridad en Cloud', 'skillCloudSecurity'),
        skill('Multi-cloud', 'skillMultiCloud'),
      ],
    },
    softSkills: {
      Junior: [
        skill('Troubleshooting', 'skillTroubleshooting'),
        skill('Precisión Cloud', 'skillPrecision'),
        skill('Paciencia', 'skillPatience'),
      ],
      Mid: [
        skill('Pensamiento sistémico', 'skillSystemsThinking'),
        skill(
          'Colaboración multifuncional',
          'skillCrossFunctionalCollaboration',
        ),
      ],
      Senior: [
        skill('Diseño de sistemas resilientes', 'skillResilientSystemsDesign'),
        skill('Cultura DevOps', 'skillDevOpsCulture'),
        skill('Planificación estratégica Cloud', 'skillStrategicPlanning'),
      ],
    },
  },
} as const;

export type AreaInteresValue = keyof typeof MARKET_SKILLS_BY_AREA;

export function isAreaInteresValue(value: string): value is AreaInteresValue {
  return value in MARKET_SKILLS_BY_AREA;
}

export function getHardSkillValuesForAreas(areas: string[]): Set<string> {
  return new Set<string>(
    areas
      .filter(isAreaInteresValue)
      .flatMap((area) =>
        MARKET_SKILL_LEVELS.flatMap((level) =>
          MARKET_SKILLS_BY_AREA[area].hardSkills[level].map((skill) =>
            String(skill.value),
          ),
        ),
      ),
  );
}

export function getSoftSkillValuesForAreas(areas: string[]): Set<string> {
  return new Set<string>(
    areas
      .filter(isAreaInteresValue)
      .flatMap((area) =>
        MARKET_SKILL_LEVELS.flatMap((level) =>
          MARKET_SKILLS_BY_AREA[area].softSkills[level].map((skill) =>
            String(skill.value),
          ),
        ),
      ),
  );
}
