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
let contadorID = 0;
let lanzamientos = [];
let filtroActivo = "todos";
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

// Generar ID único para cada lanzamiento
const generarID = () => {
  contadorID++;
  return `VUELO-${contadorID.toString().padStart(4, '0')}`;
};

// Convertir datetime-local a formato ISO para comparación
const convertirFechaAISO = (fechaLocal) => {
  return new Date(fechaLocal).toISOString();
};

// Formatear fecha para mostrar en tarjeta (DD/MM/YYYY HH:MM)
const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  const dia = fecha.getUTCDate().toString().padStart(2, '0');
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getUTCFullYear();
  const hora = fecha.getUTCHours().toString().padStart(2, '0');
  const minuto = fecha.getUTCMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${año} ${hora}:${minuto}`;
};

// Obtener hora UTC en formato HH:MM:SSZ
const obtenerHoraUTC = () => {
  const ahora = new Date();
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

// Crear una tarjeta HTML para un lanzamiento
const crearTarjeta = (lanzamiento) => {
  const card = document.createElement('article');
  card.className = `organism-launch-card organism-launch-card--${lanzamiento.estado}`;
  card.setAttribute('data-id', lanzamiento.id);
  card.setAttribute('data-tipo', lanzamiento.tipo);
  card.setAttribute('data-estado', lanzamiento.estado);

  // Header de la tarjeta
  const header = document.createElement('div');
  header.className = 'molecule-card-header';

  const idSpan = document.createElement('span');
  idSpan.className = 'molecule-card-header__id atom-mono';
  idSpan.textContent = lanzamiento.id;

  const badge = document.createElement('span');
  badge.className = `atom-badge atom-badge--${lanzamiento.estado}`;
  badge.textContent = lanzamiento.estado.toUpperCase();

  header.appendChild(idSpan);
  header.appendChild(badge);

  // Body de la tarjeta
  const body = document.createElement('div');
  body.className = 'molecule-card-body';

  const nombre = document.createElement('div');
  nombre.className = 'molecule-card-body__name';
  nombre.textContent = lanzamiento.nombre;

  const tipo = document.createElement('div');
  tipo.className = 'molecule-card-body__type';
  tipo.textContent = lanzamiento.tipo.toUpperCase();

  const objetivo = document.createElement('div');
  objetivo.className = 'molecule-card-body__objective';
  objetivo.textContent = lanzamiento.objetivo;

  const fecha = document.createElement('div');
  fecha.className = 'molecule-card-body__date atom-mono';
  fecha.textContent = formatearFecha(lanzamiento.fechaISO);

  body.appendChild(nombre);
  body.appendChild(tipo);
  body.appendChild(objetivo);
  body.appendChild(fecha);
  

  // Footer de la tarjeta
  const footer = document.createElement('div');
  footer.className = 'molecule-card-footer';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'atom-btn atom-btn--secondary atom-btn--sm';
  btnEditar.setAttribute('data-action', 'editar');
  btnEditar.setAttribute('data-id', lanzamiento.id);
  btnEditar.textContent = 'EDITAR';

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'atom-btn atom-btn--danger atom-btn--sm';
  btnCancelar.setAttribute('data-action', 'cancelar');
  btnCancelar.setAttribute('data-id', lanzamiento.id);
  btnCancelar.textContent = 'CANCELAR';

  footer.appendChild(btnEditar);
  footer.appendChild(btnCancelar);

  // Ensamblar tarjeta completa
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
};

// Renderizar todas las tarjetas en el grid
const renderizarTarjetas = () => {
  const grid = document.getElementById('grid-lanzamientos');
  const estadoVacio = document.getElementById('estado-vacio');

  // Limpiar grid
  const tarjetasExistentes = grid.querySelectorAll('.organism-launch-card');
  tarjetasExistentes.forEach(tarjeta => tarjeta.remove());

  // Filtrar tarjetas según el filtro activo
  let tarjetasAMostrar = lanzamientos;
  if (filtroActivo !== 'todos') {
    tarjetasAMostrar = lanzamientos.filter(l => l.estado === filtroActivo);
  }

  // Mostrar u ocultar estado vacío
  if (tarjetasAMostrar.length === 0) {
    estadoVacio.style.display = 'block';
  } else {
    estadoVacio.style.display = 'none';
    tarjetasAMostrar.forEach(lanzamiento => {
      const tarjeta = crearTarjeta(lanzamiento);
      grid.appendChild(tarjeta);
      agregarEventosHover(tarjeta);
      agregarEventosBotones(tarjeta);
    });
  }

  // Actualizar contador de visibles
  document.getElementById('contador-visibles').textContent = `${tarjetasAMostrar.length} REGISTROS`;

  // Actualizar contador en topbar
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

// Agregar eventos de hover a una tarjeta
const agregarEventosHover = (tarjeta) => {
  tarjeta.addEventListener('mouseover', () => {
    tarjeta.classList.add('is-hovered');
  });

  tarjeta.addEventListener('mouseout', () => {
    tarjeta.classList.remove('is-hovered');
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

// Manejar el envío del formulario
const manejarFormulario = (evento) => {
  evento.preventDefault();

  try {
    // Obtener valores del formulario
    const nombre = document.getElementById('input-nombre-serie').value.trim();
    const tipo = document.getElementById('select-tipo-cohete').value.trim();
    const fechaLocal = document.getElementById('input-fecha-lanzamiento').value;
    const objetivo = document.getElementById('input-objetivo-mision').value.trim();
    const idEdicion = document.getElementById('input-id-edicion').value;

    // Validar campos
    if (!nombre || !tipo || !fechaLocal || !objetivo) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Convertir fecha local a ISO
    const fechaISO = convertirFechaAISO(fechaLocal);

    if (idEdicion) {
      // Modo edición: actualizar lanzamiento existente
      const lanzamiento = lanzamientos.find(l => l.id === idEdicion);
      if (lanzamiento) {
        lanzamiento.nombre = nombre;
        lanzamiento.tipo = tipo;
        lanzamiento.fechaISO = fechaISO;
        lanzamiento.objetivo = objetivo;
      }
      cancelarEdicion();
    } else {
      // Modo nuevo: crear lanzamiento
      const nuevoLanzamiento = {
        id: generarID(),
        nombre: nombre,
        tipo: tipo,
        fechaISO: fechaISO,
        objetivo: objetivo,
        estado: 'pendiente'
      };
      lanzamientos.push(nuevoLanzamiento);
    }

    // Limpiar formulario
    document.getElementById('form-lanzamiento').reset();
    document.getElementById('input-id-edicion').value = '';

    // Actualizar vista
    renderizarTarjetas();
    actualizarEstadisticas();

  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    alert('Ocurrió un error al procesar el lanzamiento');
  }
};

// Cargar lanzamiento en modo edición
const cargarEnEdicion = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id);

  if (!lanzamiento) return;
  if (lanzamiento.estado !== 'pendiente') {
    alert('Solo se pueden editar lanzamientos pendientes');
    return;
  }

  // Llenar formulario con datos del lanzamiento
  document.getElementById('input-nombre-serie').value = lanzamiento.nombre;
  document.getElementById('select-tipo-cohete').value = lanzamiento.tipo;
  document.getElementById('input-objetivo-mision').value = lanzamiento.objetivo;

  // Convertir ISO a formato local (datetime-local espera YYYY-MM-DDTHH:mm)
  const fecha = new Date(lanzamiento.fechaISO);
  const fechaLocal = fecha.toISOString().slice(0, 16);
  document.getElementById('input-fecha-lanzamiento').value = fechaLocal;

  // Guardar ID en campo oculto
  document.getElementById('input-id-edicion').value = id;
  idEnEdicion = id;

  // Mostrar botón de cancelar edición
  document.getElementById('btn-cancelar-edicion').style.display = 'inline-flex';

  // Hacer scroll al formulario
  document.querySelector('.template-panel--left').scrollIntoView({ behavior: 'smooth' });
};

// Cancelar modo edición
const cancelarEdicion = () => {
  document.getElementById('form-lanzamiento').reset();
  document.getElementById('input-id-edicion').value = '';
  document.getElementById('btn-cancelar-edicion').style.display = 'none';
  idEnEdicion = null;
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

// Cancelar un lanzamiento
const cancelarLanzamiento = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id);

  if (!lanzamiento) return;
  if (lanzamiento.estado !== 'pendiente') {
    alert('Solo se pueden cancelar lanzamientos pendientes');
    return;
  }

  lanzamiento.estado = 'cancelado';
  renderizarTarjetas();
  actualizarEstadisticas();
};

// Agregar eventos a los botones de las tarjetas
const agregarEventosBotones = (tarjeta) => {
  const btnEditar = tarjeta.querySelector('[data-action="editar"]');
  const btnCancelar = tarjeta.querySelector('[data-action="cancelar"]');

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      const id = btnEditar.getAttribute('data-id');
      cargarEnEdicion(id);
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      const id = btnCancelar.getAttribute('data-id');
      cancelarLanzamiento(id);
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

// Aplicar filtro por estado
const aplicarFiltro = (estado) => {
  filtroActivo = estado;

  // Actualizar clases de los botones
  const botonesFiltro = document.querySelectorAll('#grupo-filtros .atom-btn--filter');
  botonesFiltro.forEach(boton => {
    const filtroBoton = boton.getAttribute('data-filter');
    if (filtroBoton === estado) {
      boton.classList.add('atom-btn--filter-active');
    } else {
      boton.classList.remove('atom-btn--filter-active');
    }
  });

  // Renderizar tarjetas filtradas
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

// Iniciar reloj y monitoreo automático
const iniciarRelojYMonitoreo = () => {
  setInterval(() => {
    // Tarea A: Actualizar reloj
    const horaUTC = obtenerHoraUTC();
    document.getElementById('reloj-principal').textContent = horaUTC;

    // Tarea B: Detectar lanzamientos automáticos
    const ahora = new Date();
    lanzamientos.forEach(lanzamiento => {
      if (lanzamiento.estado === 'pendiente') {
        const fechaProgramada = new Date(lanzamiento.fechaISO);
        if (ahora >= fechaProgramada) {
          lanzamiento.estado = 'lanzado';
          renderizarTarjetas();
          actualizarEstadisticas();
        }
      }
    });
  }, 1000);
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

// Actualizar panel de estadísticas
const actualizarEstadisticas = () => {
  const pendientes = lanzamientos.filter(l => l.estado === 'pendiente').length;
  const lanzados = lanzamientos.filter(l => l.estado === 'lanzado').length;
  const cancelados = lanzamientos.filter(l => l.estado === 'cancelado').length;
  const total = lanzamientos.length;

  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-lanzados').textContent = lanzados;
  document.getElementById('stat-cancelados').textContent = cancelados;
  document.getElementById('stat-total').textContent = total;
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

// Punto de entrada principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Conectar evento del formulario
  const form = document.getElementById('form-lanzamiento');
  form.addEventListener('submit', manejarFormulario);

  // Conectar botón de cancelar edición
  const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
  btnCancelarEdicion.addEventListener('click', cancelarEdicion);
  btnCancelarEdicion.style.display = 'none';

  // Conectar eventos de filtros
  const botonesFiltro = document.querySelectorAll('#grupo-filtros .atom-btn--filter');
  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      const filtro = boton.getAttribute('data-filter');
      aplicarFiltro(filtro);
    });
  });

  // Iniciar reloj y monitoreo automático
  iniciarRelojYMonitoreo();

  // Primer renderizado
  renderizarTarjetas();
  actualizarEstadisticas();
});
