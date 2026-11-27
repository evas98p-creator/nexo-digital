import writeExcelFile from 'write-excel-file/browser'
import { buscarCurso } from '../data/cursos.ts'
import { ESTADOS } from '../types.ts'
import type { Inscripcion } from '../types.ts'

const ENCABEZADOS = ['Fecha', 'Curso', 'Apellido', 'Nombre', 'Correo', 'Teléfono', 'Profesión', 'Estado', 'Consulta']
const ANCHOS = [18, 40, 20, 20, 32, 18, 28, 14, 50]

export function formatoFecha(iso: string): string {
  const f = new Date(iso)
  if (Number.isNaN(f.getTime())) return ''
  return f.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function nombreEstado(valor: string): string {
  return ESTADOS.find((e) => e.valor === valor)?.nombre ?? valor
}

/** Arma las filas de la planilla. Todo va como texto: nada se interpreta como fórmula. */
export function filasParaExcel(filas: Inscripcion[]): string[][] {
  return filas.map((f) => [
    formatoFecha(f.creado_en),
    buscarCurso(f.curso)?.nombre ?? f.curso,
    f.apellido,
    f.nombre,
    f.email,
    f.telefono ?? '',
    f.profesion ?? '',
    nombreEstado(f.estado),
    f.mensaje ?? '',
  ])
}

export async function exportarExcel(filas: Inscripcion[]): Promise<string> {
  const hoy = new Date().toISOString().slice(0, 10)
  const archivo = `inscriptos-nexo-digital-${hoy}.xlsx`
  const hoja = [
    ENCABEZADOS.map((value) => ({ value, fontWeight: 'bold' as const })),
    ...filasParaExcel(filas).map((fila) => fila.map((value) => ({ value, type: String }))),
  ]
  await writeExcelFile(hoja, {
    sheet: 'Inscriptos',
    columns: ANCHOS.map((width) => ({ width })),
  }).toFile(archivo)
  return archivo
}
