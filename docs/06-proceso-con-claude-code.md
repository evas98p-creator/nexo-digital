# Registro del proceso con Claude Code

Cómo se construyó la aplicación usando la IA como copiloto de programación. Sirve de guion para la presentación.

## Decisiones que tomó la persona
| Momento | Decisión |
|---|---|
| Elección de propuesta | Propuesta 1: proyecto desarrollado con Claude Code |
| Idea | Academia de cursos de IA con inscripción en línea y panel (entre cuatro ideas propuestas por la IA) |
| Marca | Reutilizar Nexo Digital y su diseño "Cordillera de datos" |
| Publicación | En línea, con link |
| Corrección de rumbo | "¿Te estás guiando con la Clase 12?" La IA no lo estaba haciendo: había empezado con HTML simple. Se rehízo con la tecnología de la clase |
| Tecnología | React + Vite + TypeScript, Supabase, GitHub → Netlify |

## Qué hizo la IA, por etapas de la Clase 12
| Etapa | Resultado | Dónde está |
|---|---|---|
| 1. Alcance | Problema, usuarios, módulos, riesgos, MVP | `docs/01-alcance.md` |
| 2. Requisitos | 8 historias de usuario con criterios de aceptación | `docs/02-requisitos.md` |
| 3. Modelo de datos | 2 tablas, 2 funciones, restricciones e índices | `docs/03-modelo-de-datos.md` |
| 4. Seguridad | Matriz de permisos por rol, RLS, permisos por columna | `docs/04-seguridad.md` |
| 5. Prototipo | La aplicación completa funcionando con datos ficticios | Modo demostración |
| 6. Conexión con Supabase | Migraciones SQL y capa de datos lista | `supabase/migrations/`, `src/lib/datos.ts` |
| 7. Pruebas | 33 pruebas automáticas y recorrido en navegador | `tests/`, `docs/05-pruebas.md` |

## Momentos en que la IA tuvo que verificar en vez de suponer
1. **Supabase cambió en 2026**: las tablas nuevas ya no quedan expuestas automáticamente; hacen falta permisos explícitos. La IA lo encontró en la documentación oficial antes de escribir el SQL.
2. **Claves de Supabase**: la clave `anon` está en retiro; se usa la clave publicable (`sb_publishable_...`).
3. **Librería de Excel**: la versión instalada tenía una forma de uso distinta de la que la IA recordaba. Leyó la documentación incluida en el paquete y adaptó el código.
4. **Seguridad**: en lugar de afirmar que las políticas funcionaban, levantó una base PostgreSQL real y probó cada permiso.

## Errores que aparecieron y cómo se detectaron
Los cuatro errores de `docs/05-pruebas.md` se encontraron al abrir la aplicación en un navegador y mirar capturas, no leyendo el código.

## Qué quedó en manos de la persona
- Crear las cuentas (Supabase, repositorio en GitHub, proyecto en Netlify) y elegir las contraseñas.
- Confirmar duración, horarios y cupos reales de los cursos.
- Decidir cuándo la aplicación está lista para mostrarse.

## Idea central para la presentación
La IA escribió el código, las tablas y las pruebas. La persona decidió qué problema resolver, eligió entre alternativas, corrigió el rumbo cuando la IA no seguía el método de la clase y conserva las claves.
