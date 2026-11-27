# Etapa 1 · Alcance

## Problema
Nexo Digital ofrece cursos virtuales de inteligencia artificial. Hoy las inscripciones llegan por mensajes sueltos: se pierden datos, no se sabe cuántos lugares quedan y nadie registra a quién ya se contactó.

## Objetivo
Una aplicación web donde cualquier persona se inscribe a un curso y la administradora ve, ordena y da seguimiento a todas las inscripciones desde un panel privado.

## Usuarios
| Usuario | Qué necesita |
|---|---|
| Visitante (sin cuenta) | Ver cursos, saber si hay lugar, inscribirse en un minuto |
| Administradora (con cuenta) | Ver inscriptos, filtrar, marcar el estado de cada uno, exportar a Excel |

## Módulos
1. **Catálogo**: fichas de los cursos con duración, horario y lugares libres.
2. **Inscripción**: formulario validado que guarda en la base de datos.
3. **Acceso**: inicio de sesión de la administradora.
4. **Panel**: resumen, ocupación por curso, tabla con filtros, cambio de estado, eliminación y exportación.

## Proceso principal
1. El visitante elige un curso.
2. Completa el formulario.
3. La inscripción queda guardada con estado *pendiente* y baja un lugar libre.
4. La administradora la ve en el panel y lo contacta (*contactado*).
5. Cuando la persona confirma, pasa a *confirmado*. Si desiste, a *cancelado* y el lugar se libera.

## Riesgos
| Riesgo | Cómo se trata |
|---|---|
| Que cualquiera lea datos personales de los inscriptos | RLS: solo las administradoras leen la tabla |
| Inscripciones repetidas | Índice único por correo y curso |
| Datos inválidos o demasiado largos | Validación en el formulario y restricciones en la base |
| Robots que completan el formulario | Campo trampa oculto (protección básica) |
| El proyecto gratuito de Supabase se pausa tras una semana sin uso | Entrar al panel unos días antes de presentar; se reactiva desde el tablero de Supabase |

## MVP (lo que incluye esta versión)
Catálogo, inscripción, acceso, panel con filtros, estados, eliminación y exportación a Excel.

## Segunda etapa (fuera de esta versión)
- Correo automático de confirmación al inscripto.
- Alta y edición de cursos desde el panel (hoy se editan en `src/data/cursos.ts`).
- Pago en línea.
- Rol "docente" que vea solo los inscriptos de su curso.
- Registro de auditoría de los cambios de estado.
- Doble factor de autenticación para la administradora.

## Preguntas pendientes
- Duración, fecha de inicio, horario y cupo definitivos de cada curso (hoy son valores de ejemplo).
- Dominio propio.
