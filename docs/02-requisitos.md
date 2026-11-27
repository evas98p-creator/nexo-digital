# Etapa 2 · Requisitos

Cada historia tiene criterios de aceptación. La columna "Prueba" indica dónde se verifica (ver `05-pruebas.md`).

## H1 · Ver los cursos
Como visitante quiero ver los cursos y sus lugares libres para decidir en cuál anotarme.
- Se muestran los cuatro cursos con área, resumen, temas, duración, inicio y horario.
- Cada ficha muestra "N de M lugares libres"; las inscripciones canceladas no ocupan lugar.
- Si el cupo está completo, la ficha lo dice y el botón pasa a "Anotarme en lista de espera".

## H2 · Inscribirme
Como visitante quiero inscribirme completando un formulario corto para reservar mi lugar.
- Al entrar desde una ficha, el curso ya viene seleccionado.
- Nombre, apellido, correo y aceptación son obligatorios; teléfono, profesión y consulta son opcionales.
- Si falta un dato, aparece el mensaje junto al campo y el cursor va al primer error.
- Al enviar se ve una confirmación con curso, nombre, correo e inicio.
- La inscripción se guarda con estado *pendiente*.

## H3 · No inscribirme dos veces
Como academia quiero que una persona no quede anotada dos veces al mismo curso.
- Mismo correo y mismo curso: el sistema avisa y no guarda. No distingue mayúsculas.
- El mismo correo puede inscribirse en cursos distintos.

## H4 · Entrar al panel
Como administradora quiero entrar con correo y contraseña para que nadie más vea los datos.
- Con credenciales incorrectas se muestra un mensaje y no se entra.
- Una cuenta que existe pero no es administradora ve "Sin permiso" y ninguna inscripción.
- Puedo cerrar sesión.

## H5 · Ver y filtrar inscripciones
Como administradora quiero ver todas las inscripciones y filtrarlas para encontrar rápido a una persona.
- La tabla lista de la más nueva a la más vieja.
- Puedo buscar por nombre, correo o profesión, y filtrar por curso y por estado.
- Veo cuántos inscriptos activos, pendientes y confirmados hay, y la ocupación de cada curso.

## H6 · Dar seguimiento
Como administradora quiero marcar cada inscripción como contactada, confirmada o cancelada para saber a quién me falta escribirle.
- Cambio el estado desde la misma fila y los números del resumen se actualizan.
- Solo puedo modificar el estado, no los datos que cargó la persona.

## H7 · Eliminar una inscripción
Como administradora quiero eliminar inscripciones de prueba o erróneas.
- Antes de borrar se pide confirmación y se avisa que no se puede deshacer.

## H8 · Exportar a Excel
Como administradora quiero descargar la lista en Excel para compartirla con los docentes.
- Se descarga un archivo .xlsx con las filas que estoy viendo (respeta los filtros).
- El contenido se guarda como texto: nada de lo que escribió un inscripto se ejecuta como fórmula.
