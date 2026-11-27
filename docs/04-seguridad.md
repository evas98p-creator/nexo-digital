# Etapa 4 · Seguridad

Regla de la Clase 12: ocultar un botón no es seguridad. Los permisos se comprueban en la base de datos.

## Qué puede hacer cada rol
| Acción sobre `inscripciones` | Visitante | Cuenta no administradora | Administradora |
|---|---|---|---|
| Crear (inscribirse) | Sí, solo sus datos | Sí, solo sus datos | Sí |
| Elegir el estado al crear | No | No | No |
| Leer | No | No | Sí |
| Cambiar el estado | No | No | Sí |
| Cambiar nombre, correo, etc. | No | No | No |
| Eliminar | No | No | Sí |
| Ver lugares ocupados (solo cantidades) | Sí | Sí | Sí |
| Leer o modificar `admins` | No | No | No |

Cada celda de esta tabla tiene una prueba automática en `tests/seguridad-rls.test.ts`.

## Cómo se aplica
- **RLS habilitado** en las dos tablas.
- **Permisos explícitos por columna** (mínimo privilegio): el formulario público solo puede escribir las columnas de datos personales; el panel solo puede modificar `estado`.
- **Restricciones en PostgreSQL**: largos, formato de correo, estados permitidos, inscripción única.
- **Validación en dos lugares**: el formulario avisa rápido; la base es la que impide guardar.

## Claves
- El navegador usa solo la **URL del proyecto** y la **clave publicable** (`sb_publishable_...`). Son públicas.
- La clave secreta (`sb_secret_...`), la contraseña de la base y la contraseña de la administradora no están en el código, ni en GitHub, ni en ningún prompt.
- Las variables se cargan en Netlify. El archivo `.env` local está en `.gitignore`.

## Otras medidas incluidas
- HTTPS (lo da Netlify).
- El panel no se indexa en buscadores (`robots.txt`).
- Lo que escribe un inscripto se muestra siempre como texto: no puede inyectar HTML en el panel ni fórmulas en el Excel.
- Datos ficticios para las pruebas (modo demostración).

## Pendiente para una segunda etapa
- Doble factor de autenticación para la administradora.
- Límite de intentos y CAPTCHA en el formulario público.
- Registro de auditoría (quién cambió qué estado y cuándo).
- Ambientes separados de prueba y producción.
- Copias de seguridad (el plan gratuito de Supabase no las incluye).
