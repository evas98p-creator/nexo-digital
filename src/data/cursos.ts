import type { Curso } from '../types.ts'

/* ============================================================
   CATÁLOGO DE CURSOS
   Para cambiar un curso se edita este archivo y nada más:
   el inicio, el formulario y el panel leen los datos de acá.

   Duración, inicio, horario y cupo son valores de EJEMPLO.
   ============================================================ */
export const CURSOS: Curso[] = [
  {
    slug: 'ia-desde-cero',
    nombre: 'IA desde cero para profesionales',
    area: 'Punto de partida',
    resumen:
      'Qué es la IA generativa, cómo pedirle las cosas bien y qué tareas de tu día conviene delegarle.',
    temas: [
      'Cómo funcionan los asistentes de IA',
      'Instrucciones claras: contexto, tarea y formato',
      'Resúmenes, correos e informes en minutos',
      'Límites, errores frecuentes y uso responsable',
    ],
    duracion: '4 semanas',
    inicio: 'Marzo 2027',
    horario: 'Martes, 19 a 21 h',
    cupo: 40,
    tono: 'cielo',
  },
  {
    slug: 'ia-contadores',
    nombre: 'IA para contadores y administradores',
    area: 'Gestión y contabilidad',
    resumen:
      'Asistentes de IA para armar informes, revisar planillas y analizar información contable y de gestión.',
    temas: [
      'Análisis de planillas de Excel con IA',
      'Informes de gestión a partir de datos crudos',
      'Control de consistencia y detección de errores',
      'Automatización de tareas repetitivas del estudio',
    ],
    duracion: '6 semanas',
    inicio: 'Marzo 2027',
    horario: 'Miércoles, 19 a 21 h',
    cupo: 30,
    tono: 'vina',
  },
  {
    slug: 'ia-turismo',
    nombre: 'IA para turismo',
    area: 'Agencias y emprendimientos',
    resumen:
      'Itinerarios, respuestas a consultas y contenidos para tu agencia o emprendimiento turístico, con IA.',
    temas: [
      'Diseño de itinerarios a medida',
      'Atención de consultas en varios idiomas',
      'Textos e imágenes para redes y folletería',
      'Análisis de opiniones de viajeros',
    ],
    duracion: '4 semanas',
    inicio: 'Abril 2027',
    horario: 'Jueves, 19 a 21 h',
    cupo: 25,
    tono: 'ocre',
  },
  {
    slug: 'ia-aduanas',
    nombre: 'IA para comercio internacional y aduanas',
    area: 'Comercio exterior',
    resumen:
      'IA aplicada a la documentación, las consultas normativas y el análisis de operaciones de comercio exterior.',
    temas: [
      'Lectura y control de documentación comercial',
      'Búsqueda y resumen de normativa',
      'Apoyo en clasificación arancelaria',
      'Análisis de costos y tiempos de una operación',
    ],
    duracion: '6 semanas',
    inicio: 'Abril 2027',
    horario: 'Lunes, 19 a 21 h',
    cupo: 25,
    tono: 'malbec',
  },
]

export function buscarCurso(slug: string | null | undefined): Curso | undefined {
  return CURSOS.find((c) => c.slug === slug)
}
