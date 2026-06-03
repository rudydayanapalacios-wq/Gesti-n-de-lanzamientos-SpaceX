// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
//
//  INSTRUCCIONES PARA EL APRENDIZ:
//  ─────────────────────────────────────────────────────────────────────────────
//  Este archivo está vacío. Tu tarea es implementar todas las funciones
//  necesarias para que la aplicación funcione de acuerdo al enunciado.
//
//  Pasos recomendados:
//    1. Lee el enunciado completo en ENUNCIADO.md
//    2. Abre spacex_control_vuelos.html en el navegador con F12 activo
//    3. Revisa el HTML para conocer los IDs disponibles
//    4. Revisa el CSS para conocer las clases que debes aplicar
//    5. Implementa las secciones de este archivo en orden
//
//  IMPORTANTE: No modifiques spacex_control_vuelos.html ni styles-vuelos.css
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  Declara aquí las variables que guardarán el estado global de la aplicación:
//  la colección de lanzamientos registrados y cualquier variable de control
//  que necesites para el funcionamiento de la interfaz.
//
//  Piensa en qué tipo de estructura de datos es más apropiada para
//  mantener una lista de registros, cada uno con múltiples propiedades.
// ─────────────────────────────────────────────────────────────────────────────

// Numerador que sube en 1 cada vez que se registra un vuelo nuevo.
// Se usa para generar IDs únicos como VUELO-0001, VUELO-0002, etc.
let contadorID = 0;

// Array (lista) donde se guardan todos los objetos de lanzamiento.
// Cada objeto tiene: id, nombre, tipo, fecha, objetivo, estado.
// Arranca vacío porque no hay vuelos registrados al inicio.
const lanzamientos = [];

// String que guarda el filtro que el usuario tiene seleccionado en este momento.
// Arranca en 'todos' para mostrar todos los vuelos al abrir la app.
// Puede cambiar a: 'pendiente', 'lanzado' o 'cancelado'.
let filtroActivo = "todos";

// Guarda el ID del vuelo que se está editando en este momento.
// null significa que no hay ningún vuelo en edición (modo registro normal).
// Cuando el usuario presiona EDITAR en una tarjeta, aquí se guarda el ID de ese vuelo.
// Cuando termina la edición, vuelve a null.
let idEnEdicion = null;


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  Funciones de propósito general que pueden reutilizarse en distintas
//  partes del código. Considera qué operaciones se repiten frecuentemente
//  y valdría la pena encapsular como función auxiliar.
//
//  Por ejemplo: generar un identificador único para cada registro,
//  o transformar una fecha al formato que se mostrará en las tarjetas.
// ─────────────────────────────────────────────────────────────────────────────

// Genera un ID único para cada vuelo nuevo.
// Sube el contadorID en 1, luego lo convierte en texto con 4 dígitos.
// Ejemplo: si contadorID es 1, devuelve 'VUELO-0001'.
// padStart(4, '0') agrega ceros adelante hasta tener 4 dígitos: 1 → '0001'.
const generarID = () => {
  contadorID++;
  return `VUELO-${contadorID.toString().padStart(4, '0')}`;
};

// Convierte la fecha que el usuario eligió en el formulario a formato ISO.
// El formulario entrega: '2026-05-30T14:30'
// Esta función la convierte a: '2026-05-30T14:30:00.000Z'
// Se necesita el formato ISO para poder comparar fechas en la Sección 8.
const convertirFechaAISO = (fechaLocal) => {
  return new Date(fechaLocal).toISOString();
};

// Convierte una fecha en formato ISO a un texto legible para mostrar en la tarjeta.
// Recibe: '2026-05-30T14:30:00.000Z'
// Devuelve: '30/05/2026 14:30'
// Usa métodos UTC para extraer día, mes, año, hora y minutos por separado.
// padStart(2, '0') asegura que siempre haya 2 dígitos: 5 → '05'.
// getUTCMonth() + 1 porque JavaScript cuenta los meses desde 0 (enero = 0).
const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  const dia = fecha.getUTCDate().toString().padStart(2, '0');
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getUTCFullYear();
  const hora = fecha.getUTCHours().toString().padStart(2, '0');
  const minuto = fecha.getUTCMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${año} ${hora}:${minuto}`;
};

// Obtiene la hora actual del computador en formato UTC.
// Devuelve un string como: '23:31:22Z'
// La Z al final indica que es hora UTC (hora universal).
// Esta función se llama cada segundo desde la Sección 8 para actualizar el reloj del header.
const obtenerHoraUTC = () => {
  const ahora = new Date(); // toma la fecha y hora exacta de este momento
  const hora = ahora.getUTCHours().toString().padStart(2, '0');
  const minuto = ahora.getUTCMinutes().toString().padStart(2, '0');
  const segundo = ahora.getUTCSeconds().toString().padStart(2, '0');
  return `${hora}:${minuto}:${segundo}Z`;
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
//
//  Funciones que leen el almacén de datos y convierten cada lanzamiento
//  en un elemento HTML visible dentro del contenedor del grid.
//
//  La tarjeta debe construirse como un elemento del DOM con la estructura
//  documentada en el archivo HTML. Revisa los comentarios del grid para
//  conocer exactamente qué clases y atributos debe tener cada parte.
//
//  IDs relevantes del HTML:
//    · #grid-lanzamientos  → contenedor donde se insertan las tarjetas
//    · #estado-vacio       → se muestra cuando no hay tarjetas
//    · #contador-visibles  → muestra cuántas tarjetas son visibles
//    · #contador-lanzamientos → contador de vuelos en la topbar
// ─────────────────────────────────────────────────────────────────────────────

// Recibe un objeto lanzamiento y construye su tarjeta visual en el DOM.
// Crea cada elemento HTML con createElement, le asigna clases y contenido,
// y los ensambla con appendChild. Devuelve la tarjeta lista para insertar en el grid.
const crearTarjeta = (lanzamiento) => {

  // Crea la caja principal de la tarjeta (elemento article)
  // Le asigna las clases CSS según el estado del vuelo para que tenga el color correcto.
  // data-id, data-tipo y data-estado son atributos que JavaScript lee después
  // para saber qué vuelo editar, cancelar o filtrar.
  const card = document.createElement('article');
  card.className = `organism-launch-card organism-launch-card--${lanzamiento.estado}`;
  card.setAttribute('data-id', lanzamiento.id);
  card.setAttribute('data-tipo', lanzamiento.tipo);
  card.setAttribute('data-estado', lanzamiento.estado);

  // ── HEADER: parte superior de la tarjeta ──────────────────────────────────
  // Muestra el ID del vuelo y el badge de estado (PENDIENTE, LANZADO, CANCELADO).
  const header = document.createElement('div');
  header.className = 'molecule-card-header';

  // Span que muestra el ID del vuelo, ejemplo: VUELO-0001
  const idSpan = document.createElement('span');
  idSpan.className = 'molecule-card-header__id atom-mono';
  idSpan.textContent = lanzamiento.id;

  // Badge que muestra el estado en mayúsculas con color según el estado.
  // toUpperCase() convierte 'pendiente' a 'PENDIENTE'.
  const badge = document.createElement('span');
  badge.className = `atom-badge atom-badge--${lanzamiento.estado}`;
  badge.textContent = lanzamiento.estado.toUpperCase();

  // Se insertan el ID y el badge dentro del header
  header.appendChild(idSpan);
  header.appendChild(badge);

  // ── BODY: parte central de la tarjeta ─────────────────────────────────────
  // Muestra el nombre, tipo de cohete, objetivo y fecha del vuelo.
  const body = document.createElement('div');
  body.className = 'molecule-card-body';

  // Nombre de la serie del vuelo, ejemplo: STARLINK-GROUP-9-1
  const nombre = document.createElement('div');
  nombre.className = 'molecule-card-body__name';
  nombre.textContent = lanzamiento.nombre;

  // Tipo de cohete en mayúsculas, ejemplo: FALCON
  const tipo = document.createElement('div');
  tipo.className = 'molecule-card-body__type';
  tipo.textContent = lanzamiento.tipo.toUpperCase();

  // Objetivo de la misión, ejemplo: Despliegue Starlink
  const objetivo = document.createElement('div');
  objetivo.className = 'molecule-card-body__objective';
  objetivo.textContent = lanzamiento.objetivo;

  // Fecha formateada para el usuario, ejemplo: 30/05/2026 14:30
  // formatearFecha convierte la fecha ISO a un formato legible
  const fecha = document.createElement('div');
  fecha.className = 'molecule-card-body__date atom-mono';
  fecha.textContent = formatearFecha(lanzamiento.fecha);

  // Se insertan todos los datos dentro del body
  body.appendChild(nombre);
  body.appendChild(tipo);
  body.appendChild(objetivo);
  body.appendChild(fecha);

  // ── FOOTER: parte inferior de la tarjeta ──────────────────────────────────
  // Contiene los botones EDITAR y CANCELAR.
  // data-action indica qué acción ejecutar al hacer clic.
  // data-id indica qué vuelo modificar.
  const footer = document.createElement('div');
  footer.className = 'molecule-card-footer';

  // Botón EDITAR: carga los datos del vuelo en el formulario para modificarlos
  const btnEditar = document.createElement('button');
  btnEditar.className = 'atom-btn atom-btn--secondary atom-btn--sm';
  btnEditar.setAttribute('data-action', 'editar');
  btnEditar.setAttribute('data-id', lanzamiento.id);
  btnEditar.textContent = 'EDITAR';

  // Botón CANCELAR: cambia el estado del vuelo a 'cancelado'
  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'atom-btn atom-btn--danger atom-btn--sm';
  btnCancelar.setAttribute('data-action', 'cancelar');
  btnCancelar.setAttribute('data-id', lanzamiento.id);
  btnCancelar.textContent = 'CANCELAR';

  // Se insertan los botones dentro del footer
  footer.appendChild(btnEditar);
  footer.appendChild(btnCancelar);

  // ── ENSAMBLAJE FINAL ──────────────────────────────────────────────────────
  // Se insertan el header, body y footer dentro de la tarjeta principal
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  // Se devuelve la tarjeta completa para que renderizarTarjetas la meta al grid
  return card;
};

// Limpia el grid y redibuja todas las tarjetas según el filtro activo.
// Se llama cada vez que hay un cambio: nuevo registro, edición, cancelación o filtro.
// Primero borra las tarjetas existentes para evitar duplicados,
// luego crea y agrega una tarjeta por cada vuelo del array.
const renderizarTarjetas = () => {
  const grid = document.getElementById('grid-lanzamientos');
  const estadoVacio = document.getElementById('estado-vacio');

  // Borra solo las tarjetas existentes, no el mensaje de vacío
  // Así evita duplicados cada vez que se redibuja el grid
  const tarjetasExistentes = grid.querySelectorAll('.organism-launch-card');
  tarjetasExistentes.forEach(tarjeta => tarjeta.remove());

  // Decide qué tarjetas mostrar según el filtro activo.
  // Si el filtro es 'todos', muestra todas. Si no, filtra por estado.
  let tarjetasAMostrar = lanzamientos;
  if (filtroActivo !== 'todos') {
    tarjetasAMostrar = lanzamientos.filter(l => l.estado === filtroActivo);
  }

  // Si no hay tarjetas que mostrar, muestra el mensaje de vacío.
  // Si hay tarjetas, oculta el mensaje y las dibuja una por una.
  if (tarjetasAMostrar.length === 0) {
    estadoVacio.style.display = 'block';
  } else {
    estadoVacio.style.display = 'none';
    tarjetasAMostrar.forEach(lanzamiento => {
      const tarjeta = crearTarjeta(lanzamiento);  // crea la tarjeta visual
      grid.appendChild(tarjeta);                   // la mete al grid
      agregarEventosHover(tarjeta);                // le agrega la animación hover
      agregarEventosBotones(tarjeta);              // le conecta los botones
    });
  }

  // Actualiza el contador de registros visibles encima del grid
  document.getElementById('contador-visibles').textContent = `${tarjetasAMostrar.length} REGISTROS`;

  // Actualiza el contador total de vuelos en el header
  document.getElementById('contador-lanzamientos').textContent = lanzamientos.length;
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 4 — ANIMACIONES DE TARJETAS (HOVER)
//
//  Cada tarjeta creada debe escuchar eventos del cursor y responder
//  aplicando o removiendo la clase CSS que activa la animación.
//
//  La clase de activación está definida en el archivo de estilos.
//  El CSS ya tiene la transición configurada para entrada y salida.
//
//  Eventos que debes capturar en cada tarjeta:
//    · mouseover  → activar el estado de hover
//    · mouseout   → desactivar el estado de hover
// ─────────────────────────────────────────────────────────────────────────────

// Agrega dos eventos a cada tarjeta para la animación hover.
// mouseover: cuando el cursor entra a la tarjeta, agrega la clase is-hovered
//            y el CSS la eleva y le pone sombra azul.
// mouseout:  cuando el cursor sale de la tarjeta, quita la clase is-hovered
//            y el CSS la regresa a su posición normal.
// classList.add y classList.remove manipulan las clases CSS desde JavaScript.
const agregarEventosHover = (tarjeta) => {
  tarjeta.addEventListener('mouseover', () => {
    tarjeta.classList.add('is-hovered'); // eleva la tarjeta visualmente
  });

  tarjeta.addEventListener('mouseout', () => {
    tarjeta.classList.remove('is-hovered'); // regresa la tarjeta a su posición normal
  });
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
//
//  Función que responde al evento de envío del formulario.
//  Debe leer el valor de cada campo, verificar que no estén vacíos,
//  construir el objeto del lanzamiento y añadirlo al almacén.
//  Si el campo oculto de edición contiene un ID, debe actualizar el
//  registro existente en lugar de crear uno nuevo.
//
//  IDs relevantes del HTML:
//    · #form-lanzamiento        → el elemento <form>
//    · #input-nombre-serie      → campo texto nombre
//    · #select-tipo-cohete      → campo selección tipo
//    · #input-fecha-lanzamiento → campo fecha y hora
//    · #input-objetivo-mision   → campo texto objetivo
//    · #input-id-edicion        → campo oculto con el ID en modo edición
//    · #btn-registrar           → botón principal del formulario
//    · #btn-cancelar-edicion    → botón para salir del modo edición
// ─────────────────────────────────────────────────────────────────────────────

// Se ejecuta cuando el usuario presiona el botón REGISTRAR LANZAMIENTO.
// evento.preventDefault() evita que el navegador recargue la página al enviar el formulario.
// Lee los campos, valida que no estén vacíos, y decide si crear un vuelo nuevo
// o actualizar uno existente según si hay un ID en el campo oculto input-id-edicion.
const manejarFormulario = (evento) => {
  evento.preventDefault(); // evita que el navegador recargue la página

  // try/catch es una red de seguridad: si algo sale mal adentro,
  // el catch atrapa el error y muestra un mensaje en vez de romper la app.
  try {
    // Lee el contenido de cada campo del formulario con getElementById y .value
    // .trim() elimina espacios en blanco al inicio y al final del texto
    const nombre = document.getElementById('input-nombre-serie').value.trim();
    const tipo = document.getElementById('select-tipo-cohete').value.trim();
    const fechaLocal = document.getElementById('input-fecha-lanzamiento').value; // no necesita trim
    const objetivo = document.getElementById('input-objetivo-mision').value.trim();
    const idEdicion = document.getElementById('input-id-edicion').value; // vacío = modo nuevo

    // Valida que ningún campo esté vacío.
    // El ! significa "está vacío". El || significa "o".
    // Si cualquier campo está vacío, muestra un alert y para la función con return.
    if (!nombre || !tipo || !fechaLocal || !objetivo) {
      alert('Por favor completa todos los campos');
      return; // detiene la función, no sigue creando el vuelo
    }

    // Convierte la fecha del formulario a formato ISO para guardarla en el objeto
    const fechaISO = convertirFechaAISO(fechaLocal);

    if (idEdicion) {
      // ── MODO EDICIÓN ──────────────────────────────────────────────────────
      // Si idEdicion tiene un valor, el usuario está editando un vuelo existente.
      // find busca en el array el vuelo con ese ID y devuelve el objeto.
      // Luego sobreescribe sus datos con los nuevos valores del formulario.
      const lanzamiento = lanzamientos.find(l => l.id === idEdicion);
      if (lanzamiento) {
        lanzamiento.nombre = nombre;
        lanzamiento.tipo = tipo;
        lanzamiento.fecha = fechaISO;
        lanzamiento.objetivo = objetivo;
        // el estado no se modifica, solo los datos del vuelo
      }
      cancelarEdicion(); // limpia el formulario y sale del modo edición
    } else {
      // ── MODO REGISTRO NUEVO ───────────────────────────────────────────────
      // Si idEdicion está vacío, el usuario está creando un vuelo desde cero.
      // Se crea un objeto con todos los datos del vuelo.
      // Todo vuelo nuevo arranca siempre con estado 'pendiente'.
      const nuevoLanzamiento = {
        id: generarID(),   // genera automáticamente: VUELO-0001, VUELO-0002, etc.
        nombre: nombre,
        tipo: tipo,
        fecha: fechaISO,
        objetivo: objetivo,
        estado: 'pendiente' // estado inicial obligatorio
      };
      lanzamientos.push(nuevoLanzamiento); // agrega el vuelo al final del array
    }

    // Limpia el formulario para el siguiente registro
    document.getElementById('form-lanzamiento').reset();
    document.getElementById('input-id-edicion').value = '';

    // Actualiza la vista: redibuja las tarjetas y actualiza las estadísticas
    renderizarTarjetas();
    actualizarEstadisticas();

  } catch (error) {
    // Si ocurre un error inesperado, lo muestra en la consola (F12)
    // y le avisa al usuario sin romper la app
    console.error('Error al procesar el formulario:', error);
    alert('Ocurrió un error al procesar el lanzamiento');
  }
};

// Se ejecuta cuando el usuario presiona EDITAR en una tarjeta.
// Recibe el ID del vuelo a editar, lo busca en el array con find,
// valida que esté pendiente, y carga sus datos en el formulario.
const cargarEnEdicion = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id); // busca el vuelo por ID

  if (!lanzamiento) return; // si no existe, para la función

  // Solo se pueden editar vuelos pendientes (lo pide el enunciado)
  if (lanzamiento.estado !== 'pendiente') {
    alert('Solo se pueden editar lanzamientos pendientes');
    return;
  }

  // Llena cada campo del formulario con los datos del vuelo
  // Es lo contrario a leer los campos: ahora escribe en ellos con .value =
  document.getElementById('input-nombre-serie').value = lanzamiento.nombre;
  document.getElementById('select-tipo-cohete').value = lanzamiento.tipo;
  document.getElementById('input-objetivo-mision').value = lanzamiento.objetivo;

  // La fecha necesita un tratamiento especial:
  // está guardada en ISO ('2026-05-30T14:30:00.000Z') pero el campo
  // datetime-local solo acepta ('2026-05-30T14:30').
  // slice(0, 16) recorta los primeros 16 caracteres para quitar los segundos y la Z.
  const fecha = new Date(lanzamiento.fecha);
  const fechaLocal = fecha.toISOString().slice(0, 16);
  document.getElementById('input-fecha-lanzamiento').value = fechaLocal;

  // Guarda el ID en el campo oculto para que manejarFormulario sepa que está en modo edición
  document.getElementById('input-id-edicion').value = id;
  idEnEdicion = id; // también lo guarda en la variable global

  // Muestra el botón CANCELAR EDICIÓN que normalmente está oculto
  document.getElementById('btn-cancelar-edicion').style.display = 'inline-flex';

  // Hace scroll automático al formulario para que el usuario lo vea
  document.querySelector('.template-panel--left').scrollIntoView({ behavior: 'smooth' });
};

// Se ejecuta cuando el usuario presiona CANCELAR EDICIÓN.
// Limpia el formulario, oculta el botón de cancelar edición
// y resetea idEnEdicion a null para volver al modo registro normal.
const cancelarEdicion = () => {
  document.getElementById('form-lanzamiento').reset();          // limpia los campos
  document.getElementById('input-id-edicion').value = '';       // vacía el campo oculto
  document.getElementById('btn-cancelar-edicion').style.display = 'none'; // oculta el botón
  idEnEdicion = null; // vuelve a null: ya no hay ningún vuelo en edición
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  Funciones que modifican un lanzamiento existente:
//    · Modo edición: cargar los datos del registro en el formulario
//    · Cancelación: cambiar el estado del registro a "cancelado"
//
//  Las tarjetas tienen botones con los atributos data-id y data-action.
//  Puedes usar estos atributos para saber qué registro modificar y
//  qué acción ejecutar cuando el usuario hace clic.
// ─────────────────────────────────────────────────────────────────────────────

// Cambia el estado de un vuelo a 'cancelado'.
// Recibe el ID del vuelo, lo busca en el array con find,
// valida que esté pendiente (solo pendientes se pueden cancelar),
// y cambia su estado. Luego redibuja las tarjetas y actualiza estadísticas.
const cancelarLanzamiento = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id); // busca el vuelo por ID

  if (!lanzamiento) return; // si no existe, para la función

  // Solo se pueden cancelar vuelos pendientes (lo pide el enunciado)
  if (lanzamiento.estado !== 'pendiente') {
    alert('Solo se pueden cancelar lanzamientos pendientes');
    return;
  }

  lanzamiento.estado = 'cancelado'; // cambia el estado en el array
  renderizarTarjetas();             // redibuja las tarjetas para reflejar el cambio
  actualizarEstadisticas();         // actualiza los contadores del panel
};

// Conecta los eventos de clic a los botones EDITAR y CANCELAR de cada tarjeta.
// querySelector busca el botón dentro de la tarjeta por su atributo data-action.
// addEventListener escucha el clic y llama a la función correspondiente
// pasándole el ID del vuelo que está guardado en el atributo data-id del botón.
const agregarEventosBotones = (tarjeta) => {
  const btnEditar = tarjeta.querySelector('[data-action="editar"]');
  const btnCancelar = tarjeta.querySelector('[data-action="cancelar"]');

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      const id = btnEditar.getAttribute('data-id'); // lee el ID del vuelo del botón
      cargarEnEdicion(id); // carga ese vuelo en el formulario para editarlo
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      const id = btnCancelar.getAttribute('data-id'); // lee el ID del vuelo del botón
      cancelarLanzamiento(id); // cancela ese vuelo
    });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
//
//  Funciones que muestran u ocultan tarjetas según el filtro activo.
//  Al aplicar un filtro, solo deben verse las tarjetas que coincidan
//  con el estado seleccionado. El botón activo debe marcarse visualmente.
//
//  IDs relevantes del HTML:
//    · #grupo-filtros  → contenedor de los botones de filtro
//
//  Atributo en los botones de filtro: data-filter
//  Valores posibles: "todos" · "pendiente" · "lanzado" · "cancelado"
//
//  Clase CSS del botón activo: atom-btn--filter-active
// ─────────────────────────────────────────────────────────────────────────────

// Se ejecuta cuando el usuario hace clic en un botón de filtro.
// Actualiza filtroActivo con el estado seleccionado,
// marca visualmente el botón activo con la clase atom-btn--filter-active,
// y llama a renderizarTarjetas para redibujar solo las tarjetas que correspondan.
const aplicarFiltro = (estado) => {
  filtroActivo = estado; // guarda el filtro seleccionado en la variable global

  // Recorre todos los botones de filtro y marca solo el que coincide con el filtro activo.
  // classList.add agrega la clase al botón activo para que se vea resaltado.
  // classList.remove la quita de los demás para que se vean normal.
  const botonesFiltro = document.querySelectorAll('#grupo-filtros .atom-btn--filter');
  botonesFiltro.forEach(boton => {
    const filtroBoton = boton.getAttribute('data-filter'); // lee el data-filter del botón
    if (filtroBoton === estado) {
      boton.classList.add('atom-btn--filter-active');    // resalta el botón activo
    } else {
      boton.classList.remove('atom-btn--filter-active'); // quita el resaltado de los demás
    }
  });

  // Redibuja las tarjetas aplicando el filtro activo
  // renderizarTarjetas lee filtroActivo y muestra solo las tarjetas que coincidan
  renderizarTarjetas();
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
//
//  Un intervalo de tiempo que se ejecuta cada segundo y realiza dos tareas:
//
//    Tarea A: Reloj en tiempo real
//      Obtener la hora actual en UTC y mostrarla en el elemento del reloj
//      usando el formato HH:MM:SSZ (horas, minutos, segundos + letra Z).
//
//    Tarea B: Detección automática de lanzamientos
//      Recorrer el almacén y buscar registros con estado "pendiente"
//      cuya fecha programada ya se haya alcanzado o superado.
//      Cuando se detecte uno, cambiar su estado a "lanzado" y
//      actualizar la vista para reflejar el cambio.
//
//  ID relevante del HTML:
//    · #reloj-principal → elemento donde se despliega la hora
// ─────────────────────────────────────────────────────────────────────────────

// Inicia el reloj y el monitoreo automático usando setInterval.
// setInterval repite el código de adentro cada 1000 milisegundos (1 segundo).
// Cada segundo hace dos cosas: actualiza el reloj y revisa si algún vuelo debe lanzarse.
const iniciarRelojYMonitoreo = () => {
  setInterval(() => {

    // ── TAREA A: RELOJ ────────────────────────────────────────────────────
    // Obtiene la hora UTC actual y la muestra en el reloj del header.
    // textContent reemplaza el texto del elemento con la hora nueva.
    const horaUTC = obtenerHoraUTC();
    document.getElementById('reloj-principal').textContent = horaUTC;

    // ── TAREA B: MONITOREO AUTOMÁTICO ─────────────────────────────────────
    // Recorre todos los vuelos del array con forEach.
    // Por cada vuelo pendiente, compara su fecha programada con la hora actual.
    // Si la hora actual ya llegó o superó la fecha del vuelo,
    // cambia su estado a 'lanzado' automáticamente sin que el usuario haga nada.
    const ahora = new Date(); // hora exacta de este momento
    lanzamientos.forEach(lanzamiento => {
      if (lanzamiento.estado === 'pendiente') {
        const fechaProgramada = new Date(lanzamiento.fecha); // fecha del vuelo
        if (ahora >= fechaProgramada) { // si ya llegó la hora
          lanzamiento.estado = 'lanzado'; // cambia el estado automáticamente
          renderizarTarjetas();           // redibuja las tarjetas
          actualizarEstadisticas();       // actualiza los contadores
        }
      }
    });

  }, 1000); // se repite cada 1000 milisegundos = cada 1 segundo
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
//
//  Función que recorre el almacén, cuenta los registros por estado
//  y actualiza los elementos del panel de estadísticas con los totales.
//
//  IDs relevantes del HTML:
//    · #stat-pendientes  → contador de lanzamientos pendientes
//    · #stat-lanzados    → contador de lanzamientos ejecutados
//    · #stat-cancelados  → contador de lanzamientos cancelados
//    · #stat-total       → total de registros en el sistema
// ─────────────────────────────────────────────────────────────────────────────

// Cuenta los vuelos por estado y actualiza los contadores del panel de estadísticas.
// filter devuelve un array con solo los vuelos que cumplan la condición.
// .length cuenta cuántos elementos tiene ese array filtrado.
// textContent reemplaza el número en pantalla con el conteo real.
const actualizarEstadisticas = () => {
  const pendientes = lanzamientos.filter(l => l.estado === 'pendiente').length;
  const lanzados   = lanzamientos.filter(l => l.estado === 'lanzado').length;
  const cancelados = lanzamientos.filter(l => l.estado === 'cancelado').length;
  const total      = lanzamientos.length; // total sin filtrar

  // Actualiza cada contador en el panel de estadísticas de la izquierda
  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-lanzados').textContent   = lanzados;
  document.getElementById('stat-cancelados').textContent = cancelados;
  document.getElementById('stat-total').textContent      = total;
};



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//
//  Punto de arranque de la aplicación. Todo el código que necesita
//  interactuar con elementos del DOM debe ejecutarse aquí, dentro de
//  un mecanismo que garantice que la página ya terminó de cargar.
//
//  Desde aquí debes:
//    · Conectar los eventos del formulario y los botones
//    · Iniciar el intervalo del reloj y el monitor automático
//    · Hacer el primer renderizado y actualizar las estadísticas
// ─────────────────────────────────────────────────────────────────────────────

// Punto de entrada de la aplicación.
// DOMContentLoaded garantiza que el HTML terminó de cargar antes de ejecutar nada.
// Sin esto, JavaScript intentaría buscar elementos que aún no existen y daría error.
// Desde aquí se conectan todos los eventos y se arranca la aplicación.
document.addEventListener('DOMContentLoaded', () => {

  // Conecta el formulario: cuando el usuario presiona REGISTRAR,
  // se ejecuta la función manejarFormulario
  const form = document.getElementById('form-lanzamiento');
  form.addEventListener('submit', manejarFormulario);

  // Conecta el botón CANCELAR EDICIÓN y lo oculta al inicio
  // porque solo debe verse cuando el formulario está en modo edición
  const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
  btnCancelarEdicion.addEventListener('click', cancelarEdicion);
  btnCancelarEdicion.style.display = 'none'; // oculto al inicio

  // Conecta los botones de filtro: cuando el usuario hace clic en uno,
  // lee su atributo data-filter y llama a aplicarFiltro con ese valor
  const botonesFiltro = document.querySelectorAll('#grupo-filtros .atom-btn--filter');
  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      const filtro = boton.getAttribute('data-filter'); // lee el filtro del botón
      aplicarFiltro(filtro); // aplica ese filtro
    });
  });

  // Arranca el reloj y el monitoreo automático (se ejecuta cada segundo)
  iniciarRelojYMonitoreo();

  // Primer renderizado: dibuja el grid (vacío al inicio) y muestra las estadísticas en 0
  renderizarTarjetas();
  actualizarEstadisticas();
});
