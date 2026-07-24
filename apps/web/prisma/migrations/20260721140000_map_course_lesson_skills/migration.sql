-- Enrich the existing learning catalog with the skills taught by each course.

WITH course_skill_map(course_title, skill_name, weight) AS (
  VALUES
    ('Desarrollo Web Full Stack con React', 'React', 3),
    ('Desarrollo Web Full Stack con React', 'JavaScript', 2),
    ('Desarrollo Web Full Stack con React', 'Node.js', 2),
    ('Introducción a Data Analytics', 'Python', 3),
    ('Introducción a Data Analytics', 'SQL', 3),
    ('DevOps con AWS y Docker', 'AWS', 3),
    ('DevOps con AWS y Docker', 'Docker', 3),
    ('DevOps con AWS y Docker', 'Kubernetes', 2),
    ('Diseño UX/UI Avanzado', 'Figma', 3),
    ('Fundamentos de Ciberseguridad', 'Ciberseguridad', 3)
)
INSERT INTO "curso_habilidades" ("curso_id", "habilidad_id", "peso")
SELECT c."curso_id", h."habilidad_id", mapping.weight
FROM course_skill_map mapping
JOIN "cursos" c ON c."titulo" = mapping.course_title
JOIN "habilidades_mercado" h ON h."nombre" = mapping.skill_name
ON CONFLICT ("curso_id", "habilidad_id")
DO UPDATE SET "peso" = EXCLUDED."peso";

WITH lesson_skill_map(course_title, lesson_title, skill_name, weight) AS (
  VALUES
    ('Desarrollo Web Full Stack con React', 'Intro a React', 'React', 1),
    ('Desarrollo Web Full Stack con React', 'Componentes y Props', 'React', 2),
    ('Desarrollo Web Full Stack con React', 'useState', 'React', 2),
    ('Desarrollo Web Full Stack con React', 'Manejo de eventos', 'JavaScript', 2),
    ('Desarrollo Web Full Stack con React', 'Introducción a Node', 'Node.js', 2),
    ('Desarrollo Web Full Stack con React', 'API REST', 'Node.js', 3),
    ('Introducción a Data Analytics', 'Variables y tipos', 'Python', 1),
    ('Introducción a Data Analytics', 'Pandas y NumPy', 'Python', 3),
    ('Introducción a Data Analytics', 'Consultas básicas', 'SQL', 2),
    ('Introducción a Data Analytics', 'Joins y subconsultas', 'SQL', 3),
    ('Introducción a Data Analytics', 'Matplotlib', 'Python', 2),
    ('Introducción a Data Analytics', 'Seaborn', 'Python', 2),
    ('DevOps con AWS y Docker', 'EC2 y S3', 'AWS', 3),
    ('DevOps con AWS y Docker', 'IAM', 'AWS', 2),
    ('DevOps con AWS y Docker', 'Contenedores', 'Docker', 3),
    ('DevOps con AWS y Docker', 'Orquestación', 'Kubernetes', 3),
    ('DevOps con AWS y Docker', 'Jenkins', 'Docker', 1),
    ('DevOps con AWS y Docker', 'GitHub Actions', 'Docker', 1),
    ('Diseño UX/UI Avanzado', 'Investigación', 'Figma', 1),
    ('Diseño UX/UI Avanzado', 'Wireframing', 'Figma', 2),
    ('Diseño UX/UI Avanzado', 'Herramientas básicas', 'Figma', 2),
    ('Diseño UX/UI Avanzado', 'Prototipado', 'Figma', 3),
    ('Fundamentos de Ciberseguridad', 'Tipos de amenazas', 'Ciberseguridad', 2),
    ('Fundamentos de Ciberseguridad', 'Criptografía', 'Ciberseguridad', 3),
    ('Fundamentos de Ciberseguridad', 'Firewalls', 'Ciberseguridad', 2),
    ('Fundamentos de Ciberseguridad', 'VPN y acceso', 'Ciberseguridad', 2)
)
INSERT INTO "leccion_habilidades" ("leccion_id", "habilidad_id", "peso")
SELECT lesson."leccion_id", skill."habilidad_id", mapping.weight
FROM lesson_skill_map mapping
JOIN "cursos" course ON course."titulo" = mapping.course_title
JOIN "modulos" module ON module."curso_id" = course."curso_id"
JOIN "lecciones" lesson
  ON lesson."modulo_id" = module."modulo_id"
 AND lesson."titulo" = mapping.lesson_title
JOIN "habilidades_mercado" skill ON skill."nombre" = mapping.skill_name
ON CONFLICT ("leccion_id", "habilidad_id")
DO UPDATE SET "peso" = EXCLUDED."peso";
