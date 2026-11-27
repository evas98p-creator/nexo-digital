# Etapa 3 · Modelo de datos

Base: PostgreSQL en Supabase. Definición completa en `supabase/migrations/`.

## Tabla `inscripciones`
| Columna | Tipo | Regla |
|---|---|---|
| `id` | uuid | Clave principal, se genera sola |
| `creado_en` | timestamptz | Fecha y hora del alta, se completa sola |
| `curso` | text | Obligatorio. Identificador del curso (`ia-turismo`, etc.) |
| `nombre` | text | Obligatorio, 2 a 80 caracteres |
| `apellido` | text | Obligatorio, 2 a 80 caracteres |
| `email` | text | Obligatorio, formato de correo, hasta 120 caracteres |
| `telefono` | text | Opcional, hasta 40 |
| `profesion` | text | Opcional, hasta 80 |
| `mensaje` | text | Opcional, hasta 600 |
| `estado` | text | `pendiente` (inicial), `contactado`, `confirmado` o `cancelado` |

- **Índice único** `(lower(email), curso)`: impide la inscripción repetida.
- **Índice** por `creado_en` descendente: el panel lista por fecha.

## Tabla `admins`
| Columna | Tipo | Regla |
|---|---|---|
| `user_id` | uuid | Clave principal y clave externa a `auth.users` (usuarios de Supabase Auth) |
| `creado_en` | timestamptz | Se completa sola |

Si se borra el usuario en Supabase Auth, deja de ser administradora automáticamente.

## Funciones
| Función | Devuelve | Para qué |
|---|---|---|
| `es_admin()` | verdadero/falso | La usan las políticas de seguridad y el panel |
| `ocupacion_por_curso()` | curso y cantidad | Lugares ocupados para el sitio público. No expone datos personales |

## Catálogo de cursos
Los cursos no están en la base: viven en `src/data/cursos.ts`. Es una decisión de MVP: son cuatro, cambian poco y el sitio se sigue viendo aunque la base esté pausada.

## Estados de una inscripción
```
pendiente → contactado → confirmado
     ↘          ↘
       cancelado (libera el lugar)
```
