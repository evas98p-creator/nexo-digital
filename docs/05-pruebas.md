# Etapa 7 · Pruebas

## Pruebas automáticas
Se ejecutan con `npm test` (33 pruebas).

| Archivo | Qué comprueba | Cantidad |
|---|---|---|
| `tests/seguridad-rls.test.ts` | Levanta un PostgreSQL real en memoria, ejecuta las mismas migraciones que se pegan en Supabase y prueba qué puede hacer cada rol | 20 |
| `tests/validar.test.ts` | Validación y normalización del formulario | 6 |
| `tests/demo.test.ts` | Prototipo con datos ficticios y detección de la configuración | 7 |

## Prueba en navegador (versión de demostración)
Hecha el 25/11/2026 con Chrome, en escritorio (1280 px) y móvil (390 px):

| Paso | Resultado |
|---|---|
| El inicio muestra 4 fichas con lugares libres | Correcto |
| Entrar desde la ficha de turismo deja ese curso seleccionado | Correcto |
| Enviar vacío muestra 4 mensajes y lleva el cursor al nombre | Correcto |
| Inscripción válida muestra la confirmación y baja un lugar | Correcto |
| Repetir correo y curso muestra el aviso de duplicado | Correcto |
| El panel lista la inscripción nueva en primer lugar | Correcto |
| Texto con HTML y fórmula se muestra como texto | Correcto |
| Cambiar estado actualiza el resumen | Correcto |
| Filtro por curso y búsqueda sin resultados | Correcto |
| Exportar descarga un .xlsx sin fórmulas | Correcto |
| Eliminar pide confirmación y borra | Correcto |
| Sin desborde horizontal en móvil | Correcto (tras corregir el panel) |

## Errores encontrados y corregidos durante las pruebas
1. En móvil el panel se desbordaba hacia la derecha: un texto para lectores de pantalla se escapaba de la tabla.
2. Los mensajes de error del formulario seguían visibles después de corregir el campo.
3. El título de la ficha lateral salía con tamaño de título de sección.
4. Las fechas salían en formato de 12 horas; pasaron a 24 horas.

## Falta probar
La conexión con un proyecto real de Supabase (inicio de sesión incluido). Depende de crear el proyecto y cargar las variables. Lista de control para ese momento:

- [ ] Inscribirse desde el sitio publicado y ver la fila en Supabase > Table Editor.
- [ ] Entrar al panel con la cuenta de administradora.
- [ ] Probar una contraseña incorrecta.
- [ ] Cambiar un estado, exportar y eliminar la inscripción de prueba.
- [ ] Abrir el sitio en una ventana de incógnito y confirmar que `/admin` pide contraseña.
