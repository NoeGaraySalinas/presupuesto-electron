const { ipcRenderer } = require('electron');
const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');
const { setFontAndSize } = require('pdf-lib');

if (!ipcRenderer) {
    console.error('ipcRenderer no está disponible. Asegúrate de que está cargado correctamente.');
}

// Lista de insumos
const insumos = [
    "Con respecto a los insumos, los mismos están incluídos en el costo del presupuesto, con excepción de insumos especiales",
    "Con respecto a los insumos, de común acuerdo, los mismos quedarán a cargo del cliente.",
    "Alcohol Etílico (1lt)",
    "Aromatizador/Odorante Aer.",
    "Bolsas Compactad. Negras [80x100]",
    "Bolsas Compactad. Transp. [80x110]",
    "Bolsas Consorcio Negras [60x90]",
    "Bolsas Residuos Negras [45x60]",
    "Cera Auto Brillo",
    "Cera Incolora (5lt)",
    "Cera Incolora (5lt)",
    "Cera p/Madera (5lt)",
    "Cera p/Madera (850cc)",
    "Cera Roja (5lt)",
    "Cloro (5lt)",
    "Desengrasante Alcalino Prep. (5lt)",
    "Desengrasante Amoniac. Prep. (5lt)",
    "Desinfectante Aer. (360cc)",
    "Desodorante Ambiental Aer. (360cc)",
    "Detergente (1lt)",
    "Detergente (250cc)",
    "Detergente (500cc)",
    "Detergente (750cc)",
    "Fibra Verde",
    "Franela/Gamuza Paño [40x50]",
    "Hipoclorito Prep. (5lt)",
    "Insecticida p/Moscas",
    "Jabón Líq. p/Manos Prep. (5lt)",
    "Jabón Tocador (3un)",
    "Lampazo Líq. Amarillo (5lt)",
    "Lampazo Líq. Azúl (5lt)",
    "Lavandina Prep. (5lt)",
    "Limpiador Crema CIF (750cc)",
    "Limpiador p/Baños (1lt)",
    "Limpiador p/Pisos Plast/Flot (800cc)",
    "Limpiavidrios Líq (1lt)",
    "Limpiavidrios Líq. Prep. (5lt)",
    "Lustramuebles Aer. (360cc)",
    "Papel Higiénico (4un x30mt)",
    "Papel Higiénico JUMBO (8un)",
    "Perfumina Prep. (5lt)",
    "Removedor Sarro HARPIC",
    "Rollo Cocina (3un)",
    "Rollo Industrial [20cm](1un)",
    "Toallas Intercalad. [Beige](250un)",
    "Toallas Intercalad. [Blancas](250un)",
    "Toallas Rollo p/Manos [p/RE-MAX]",
    "Trapo Piso Blanco",
    "Trapo Piso Gris",
    "Valerina Común",
    "Virulana"
];

function autoExpand(field) {
    field.style.height = 'auto'; // Resetea la altura
    field.style.height = field.scrollHeight + 'px'; // Ajusta a la altura del contenido
}

// Selecciona el input y el contenedor de sugerencias
const inputInsumo = document.getElementById('insumo-input');
const contenedorSugerencias = document.getElementById('sugerencias');

// Nuevo input para insumos seleccionados
const inputInsumosSeleccionados = document.getElementById('insumos-seleccionados');
let insumosElegidos = []; // Array para almacenar insumos seleccionados

// Evento de entrada en el input
inputInsumo.addEventListener('input', function () {
    const valor = this.value.toLowerCase();
    contenedorSugerencias.innerHTML = ''; // Limpiar sugerencias previas

    let filtrados = []; // Define filtrados aquí

    if (valor) {
        // Filtrar insumos que contienen el valor ingresado
        filtrados = insumos.filter(insumo => insumo.toLowerCase().includes(valor));
        mostrarSugerencias(filtrados);
    }

    // Mostrar u ocultar el contenedor de sugerencias
    contenedorSugerencias.style.display = filtrados.length ? 'block' : 'none';
});

// Función para mostrar las sugerencias
function mostrarSugerencias(sugerencias) {
    sugerencias.forEach(insumo => {
        const divSugerencia = document.createElement('div');
        divSugerencia.textContent = insumo;
        divSugerencia.classList.add('sugerencia');

        // Evento al hacer clic en una sugerencia
        divSugerencia.addEventListener('click', function () {
            agregarInsumo(insumo); // Llama a la función para agregar el insumo
            contenedorSugerencias.innerHTML = ''; // Limpiar sugerencias
            contenedorSugerencias.style.display = 'none'; // Ocultar sugerencias
        });

        contenedorSugerencias.appendChild(divSugerencia);
    });
}

// Función para agregar insumos seleccionados
function agregarInsumo(insumo) {
    if (!insumosElegidos.includes(insumo)) { // Evita duplicados
        insumosElegidos.push(insumo); // Agrega el insumo al array
        inputInsumosSeleccionados.value = insumosElegidos.join(', '); // Actualiza el input de insumos seleccionados
    }
}

// Función para obtener insumos desde insumos.json
function getInsumosFromJSON() {
    return new Promise((resolve, reject) => {
        const insumosPath = path.join(__dirname, 'insumos.json');
        fs.readFile(insumosPath, 'utf8', (err, data) => {
            if (err) {
                reject('Error al leer insumos.json: ' + err);
                return;
            }
            try {
                const parsedData = JSON.parse(data);
                const insumos = parsedData.insumos; // Accede a la propiedad 'insumos'
                resolve(insumos);
            } catch (parseError) {
                reject('Error al parsear JSON: ' + parseError);
            }
        });
    });
}

// Llama a la función después de cargar el contenido del DOM
document.addEventListener('DOMContentLoaded', () => {
    getInsumosFromJSON()
        .then(insumos => {
            // Aquí puedes usar los insumos para actualizar el DOM o realizar otras acciones
        })
        .catch(error => {
            console.error(error);
        });
});


// Función para obtener insumos desde el proceso principal
async function getInsumos() {
    try {
        const insumos = await ipcRenderer.invoke('get-insumos');
        // Aquí puedes usar los insumos para actualizar el DOM o realizar otras acciones
    } catch (error) {
        console.error('Error al obtener insumos:', error);
    }
}

// Llama a la función después de cargar el contenido del DOM
document.addEventListener('DOMContentLoaded', () => {
    getInsumos();

    const addButton = document.getElementById('add-button');
    if (addButton) {
        addButton.addEventListener('click', addItem);
    }
});

function makeTableStatic() {
    // Seleccionar todos los elementos contenteditable dentro del budgetList
    const budgetList = document.getElementById('budget_list');
    const editableElements = budgetList.querySelectorAll('[contenteditable="true"]');

    // Iterar sobre cada elemento y reemplazarlo por su contenido como texto plano
    editableElements.forEach(element => {
        const textContent = element.textContent; // Obtener el texto ingresado por el usuario
        const span = document.createElement('span'); // Crear un elemento <span>
        span.textContent = textContent; // Asignar el contenido de texto
        element.replaceWith(span); // Reemplazar el elemento editable por el <span> con el texto
    });

    // Deshabilitar el textarea si existe en la tabla
    const textarea = budgetList.querySelector('textarea');
    if (textarea) {
        const text = textarea.value;
        const span = document.createElement('span');
        span.textContent = text;
        textarea.replaceWith(span);
    }

    alert('La tabla ahora es estática.');
}

// Actualiza la función addItem
function addItemMensual() {
    const date = document.getElementById('date').value;
    const recipient = document.getElementById('recipient').value;
    const serviceSelect = document.getElementById('service').value;
    const addressInput = document.getElementById('address').value;
    
    // Obtén las horas diarias y semanales
    const hoursInput = document.getElementById('hoursPerDay').value;
    const weeklyHoursInput = document.getElementById('weeklyHours').value;
    
    // Obtén los días seleccionados y conviértelos en una lista de nombres separados por comas
    const dayCheckboxes = document.querySelectorAll('.dayCheckbox:checked');
    const selectedDays = Array.from(dayCheckboxes).map(checkbox => checkbox.parentElement.textContent.trim()).join(', ');

    const tasks = document.getElementById('tasks').value;
    const supplies = document.getElementById('insumos-seleccionados').value;
    const validity = document.getElementById('validity').value;
    const payment = document.getElementById('payment').value;
    const budgetList = document.getElementById('budget-list');

    budgetList.innerHTML = ''; // Limpiar la lista anterior antes de añadir nuevos elementos

    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Servicio: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p>Días a trabajar: ${selectedDays}</p>
      <p>Horas por día: ${hoursInput}</p>
      <p>Horas semanales: ${weeklyHoursInput}</p>
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:<p>
      <p>-> Supervisión continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas </p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}


function addItemEventual() {
    const date = document.getElementById('date').value;
    const recipient = document.getElementById('recipient').value;
    const serviceSelect = document.getElementById('service').value;
    const addressInput = document.getElementById('address').value;
    const tasks = document.getElementById('tasks').value;
    const supplies = document.getElementById('insumos-seleccionados').value;
    const validity = document.getElementById('validity').value;
    const payment = document.getElementById('payment').value;
    const budgetList = document.getElementById('budget-list');

    budgetList.innerHTML = ''; // Limpiar la lista anterior

    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Propuesta económica: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

function addItemSeguridad() {
    const date = document.getElementById('date').value;
    const recipient = document.getElementById('recipient').value;
    const serviceSelect = document.getElementById('service').value;
    const addressInput = document.getElementById('address').value;
    const aPartirDe = document.getElementById('aPartirDe').value;
    const tabla = document.getElementById('tablas').innerHTML;
    const budgetList = document.getElementById('budget-list');

    budgetList.innerHTML = ''; // Limpiar la lista anterior

    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Propuesta económica: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p id="introSeguridad">➢MEDIOS HUMANOS: Personal formado. Nuestro servicio es constante, reemplazos por ausencias, etc.
            <br><br>
            ➢ SUPERVISION: Nuestros supervisores cuentan con medios de comunicación para mantenerse en contacto
            continuo y directo con el operario de seguridad, cliente, área de gerencia y recursos humanos para
            gestionar la prestación del servicio.
            <br><br>
            ➢ UNIFORME DE TRABAJO: Proveemos uniformes de trabajo y elementos de seguridad de primera calidad,
            para nuestro personal que presta servicios, para cada estación del año (adaptándose según el clima).
            <br><br>
            ➢ SALARIOS: Presupuestamos tomando en consideración la escala salarial que rige nuestra actividad en la
            zona geográfica donde desarrollemos nuestras tareas. Queremos destacar que CORSACOR División
            Seguridad, cumple con todas las disposiciones legales, previsionales y laborales aplicables a la actividad
            que desempeña, eximiendo al cliente de cualquier riesgo laboral.
            <br><br>
            ➢ MEDIOS TECNICOS: Insumos, Equipos, e Implementos: Esta área está a cargo de personal especializado.
            Se ocupa de que estén en óptimas condiciones de funcionamiento para el desarrollo de las tareas
            programadas por nuestra área operativa.
            <br><br>
            ➢ CALIDAD: Implementaremos un sistema de gestión de calidad, buscando con ello la máxima objetividad
            en el control del servicio y ofrecer al cliente un sistema de seguimiento de la contratación.
            El control de calidad se realiza sobre dos niveles: Control de satisfacción del cliente y Control de los
            servicios de vigilancia física prestados por el vigilador
        </p>

        <p>A partir de: ${aPartirDe}</p>

        <div>${tabla}</div>

        <p>Si por razones del servicio se debiera trabajar en horario nocturno y días feriados, se le incrementaran los recargos
                de ley correspondiente.
                La presente cotización está realizada en base a las escalas salariales vigentes del Gremio S.U.V.I.C.O., quedando 
                sin variantes, en tanto y en cuanto no se produzcan modificaciones en las mismas </p>
                
                <p>Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su
            disposición por cualquier consulta, aclaración o modificación del mismo.</p>

      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

function addItemFinalDeObra() {
    const date = document.getElementById('date').value;
    const recipient = document.getElementById('recipient').value;
    const serviceSelect = document.getElementById('service').value;
    const addressInput = document.getElementById('address').value;
    const tasks = document.getElementById('tasks').value;
    const supplies = document.getElementById('insumos-seleccionados').value;
    const validity = document.getElementById('validity').value;
    const payment = document.getElementById('payment').value;
    const budgetList = document.getElementById('budget-list');

    budgetList.innerHTML = ''; // Limpiar la lista anterior

    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Propuesta económica: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

// Función para borrar la lista y los campos de entrada
function deleteItemMensual() {
    document.getElementById('date').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('service').value = '';
    document.getElementById('address').value = '';
    
    // Restablece horas diarias y semanales
    document.getElementById('hoursPerDay').value = '';
    document.getElementById('weeklyHours').value = '';

    // Restablece los días seleccionados
    const dayCheckboxes = document.querySelectorAll('.dayCheckbox');
    dayCheckboxes.forEach(checkbox => checkbox.checked = false);

    document.getElementById('tasks').value = '';
    document.getElementById('insumos-seleccionados').value = '';
    document.getElementById('validity').value = '';
    document.getElementById('payment').value = '';

    // Limpia la lista del presupuesto
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';
}

// Función para borrar la lista y los campos de entrada
function deleteItemEventual() {
    document.getElementById('date').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('service').value = '';
    document.getElementById('address').value = '';
    document.getElementById('tasks').value = '';
    document.getElementById('insumos-seleccionados').value = '';
    document.getElementById('validity').value = '';
    document.getElementById('payment').value = '';
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';

    budgetList.innerHTML += `
     <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Propuesta económica: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

// Función para borrar la lista y los campos de entrada
function deleteItemSeguridad() {
    document.getElementById('date').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('service').value = '';
    document.getElementById('address').value = '';
    document.getElementById('aPartirDe').value;
    document.getElementById('tablas').innerHTML;
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';

    budgetList.innerHTML += `
    <p>Fecha: ${date}</p>
    <p>Destinatario: ${recipient}</p>
    <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
    <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
    <p>Propuesta económica: ${serviceSelect}</p>
    <p>Domicilio: ${addressInput}</p>
    <p id="introSeguridad">➢MEDIOS HUMANOS: Personal formado. Nuestro servicio es constante, reemplazos por ausencias, etc.
          <br><br>
          ➢ SUPERVISION: Nuestros supervisores cuentan con medios de comunicación para mantenerse en contacto
          continuo y directo con el operario de seguridad, cliente, área de gerencia y recursos humanos para
          gestionar la prestación del servicio.
          <br><br>
          ➢ UNIFORME DE TRABAJO: Proveemos uniformes de trabajo y elementos de seguridad de primera calidad,
          para nuestro personal que presta servicios, para cada estación del año (adaptándose según el clima).
          <br><br>
          ➢ SALARIOS: Presupuestamos tomando en consideración la escala salarial que rige nuestra actividad en la
          zona geográfica donde desarrollemos nuestras tareas. Queremos destacar que CORSACOR División
          Seguridad, cumple con todas las disposiciones legales, previsionales y laborales aplicables a la actividad
          que desempeña, eximiendo al cliente de cualquier riesgo laboral.
          <br><br>
          ➢ MEDIOS TECNICOS: Insumos, Equipos, e Implementos: Esta área está a cargo de personal especializado.
          Se ocupa de que estén en óptimas condiciones de funcionamiento para el desarrollo de las tareas
          programadas por nuestra área operativa.
          <br><br>
          ➢ CALIDAD: Implementaremos un sistema de gestión de calidad, buscando con ello la máxima objetividad
          en el control del servicio y ofrecer al cliente un sistema de seguimiento de la contratación.
          El control de calidad se realiza sobre dos niveles: Control de satisfacción del cliente y Control de los
          servicios de vigilancia física prestados por el vigilador
      </p>

      <p>A partir de: ${aPartirDe}</p>

      <div>${tabla}</div>

      <p>Si por razones del servicio se debiera trabajar en horario nocturno y días feriados, se le incrementaran los recargos
              de ley correspondiente.
              La presente cotización está realizada en base a las escalas salariales vigentes del Gremio S.U.V.I.C.O., quedando 
              sin variantes, en tanto y en cuanto no se produzcan modificaciones en las mismas </p>
              
              <p>Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su
          disposición por cualquier consulta, aclaración o modificación del mismo.</p>

    <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
  `;
}

// Función para borrar la lista y los campos de entrada
function deleteItemFinalDeObra() {
    document.getElementById('date').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('service').value = '';
    document.getElementById('address').value = '';
    document.getElementById('tasks').value = '';
    document.getElementById('insumos-seleccionados').value = '';
    document.getElementById('validity').value = '';
    document.getElementById('payment').value = '';
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';

    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Domicilio: ${address}</p>
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

// Función para cargar una imagen desde una ruta
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
    });
}

async function generatePDFmensual() {
    try {
        // Solicitar al proceso principal que abra el diálogo de guardar archivo
        const filePath = await ipcRenderer.invoke('dialog:saveFile');

        // Verificar si el usuario canceló el diálogo
        if (!filePath) {
            console.log('Guardado cancelado.');
            return;
        }

        // Verificar si el archivo ya existe
        let finalPath = filePath;
        let counter = 1;

        while (fs.existsSync(finalPath)) {
            // Crear un nuevo nombre basado en el contador
            const { dir, name, ext } = path.parse(filePath);
            finalPath = path.join(dir, `${name}(${counter})${ext}`);
            counter++;
        }

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO EVENTUAL(1)(1).pdf.png'));
        const doc = new jsPDF();

        // Establecer fuente
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(10);

        // Añadir la imagen al PDF
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

        const yOffsetStart = 45;  // Ajuste inicial para bajar los elementos
        const lineSpacing = 6;     // Espacio entre cada línea de texto
        const yOffsetBottom = 30;  // Margen inferior
        const maxWidth = doc.internal.pageSize.width - 40; // Ancho máximo para el texto
        let yOffset = yOffsetStart; // Posición vertical inicial

        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const hoursInput = document.getElementById('hoursPerDay').value;
        const weeklyHoursInput = document.getElementById('weeklyHours').value;
        const tasks = document.getElementById('tasks').value;
        const supplies = document.getElementById('insumos-seleccionados').value;
        const validity = document.getElementById('validity').value;
        const payment = document.getElementById('payment').value;

        // Obtener los días seleccionados
        const selectedDays = Array.from(document.querySelectorAll('.dayCheckbox:checked'))
            .map(checkbox => checkbox.value)
            .join(', ');

        // Alineación derecha para la fecha
        doc.setFontSize(10); // Establecer tamaño de fuente a 10
        doc.text(` ${date}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
        yOffset += lineSpacing;

        // Texto justificado
        const justifyText = (text, yOffset) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                doc.text(line, 20, yOffset);
                yOffset += lineSpacing;
            });
            return yOffset; // Devuelve la nueva posición vertical
        };

        yOffset = justifyText(`${recipient}:`, yOffset);
        yOffset = justifyText(`Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.`, yOffset);
        yOffset = justifyText(`CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.`, yOffset);

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        // Imprimir los días seleccionados
        const daysLine = `Días: ${selectedDays}.`;
        yOffset = justifyText(daysLine, yOffset);

        // Imprimir "HORAS A TRABAJAR" y "HORAS SEMANALES" en la misma línea
        const hoursLine = `- HORAS A TRABAJAR POR DÍA: ${hoursInput}hs, HORAS SEMANALES: ${weeklyHoursInput}hs.`;
        yOffset = justifyText(hoursLine, yOffset);

        yOffset = justifyText(`- TAREAS A REALIZAR: ${tasks}`, yOffset);
        yOffset = justifyText(`- INSUMOS: ${supplies}`, yOffset);

        doc.setFontSize(11); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS. MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.`, yOffset);
        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);
        yOffset = justifyText(`En todos nuestros servicios nos comprometemos y ofrecemos:`, yOffset);
        yOffset = justifyText(`-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas.`, yOffset);
        yOffset += lineSpacing * 1;
        yOffset = justifyText(`- COSTO: ${payment}`, yOffset);
        yOffset += lineSpacing * 1;

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.`, yOffset);

        // Alineación derecha para contacto
        doc.setFontSize(10); // Establecer tamaño de fuente a 10
        doc.text(`Sandra Córdoba\nÁrea Comercial\nTel: 351-2049880`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });

        // Guardar el PDF
        doc.save(finalPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}


// Función para generar el PDF
async function generatePDFeventual() {
    try {
        // Solicitar al proceso principal que abra el diálogo de guardar archivo
        const filePath = await ipcRenderer.invoke('dialog:saveFile');

        // Verificar si el usuario canceló el diálogo
        if (!filePath) {
            console.log('Guardado cancelado.');
            return;
        }

        // Verificar si el archivo ya existe
        let finalPath = filePath;
        let counter = 1;

        while (fs.existsSync(finalPath)) {
            // Crear un nuevo nombre basado en el contador
            const { dir, name, ext } = path.parse(filePath);
            finalPath = path.join(dir, `${name}(${counter})${ext}`);
            counter++;
        }

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO EVENTUAL(1)(1).pdf.png'));
        const doc = new jsPDF();

        // Establecer fuente
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(10);

        // Añadir la imagen al PDF
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

        const yOffsetStart = 45;  // Ajuste inicial para bajar los elementos
        const lineSpacing = 6;     // Espacio entre cada línea de texto
        const yOffsetBottom = 30;  // Margen inferior
        const maxWidth = doc.internal.pageSize.width - 40; // Ancho máximo para el texto
        let yOffset = yOffsetStart; // Posición vertical inicial

        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const tasks = document.getElementById('tasks').value;
        const supplies = document.getElementById('insumos-seleccionados').value;
        const validity = document.getElementById('validity').value;
        const payment = document.getElementById('payment').value;

        // Alineación derecha para la fecha
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(` ${date}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
        yOffset += lineSpacing;

        // Texto justificado
        const justifyText = (text, yOffset) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                doc.text(line, 20, yOffset);
                yOffset += lineSpacing;
            });
            return yOffset; // Devuelve la nueva posición vertical
        };

        yOffset = justifyText(`${recipient}:`, yOffset);
        yOffset = justifyText(`Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.`, yOffset);
        yOffset = justifyText(`CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.`, yOffset);

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        yOffset = justifyText(`- TAREAS A REALIZAR: ${tasks}`, yOffset);

        yOffset = justifyText(`- INSUMOS: ${supplies}`, yOffset);

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS. MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.`, yOffset);

        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);


        yOffset = justifyText(`-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas.`, yOffset);
        yOffset += lineSpacing * 1;
        yOffset = justifyText(`- COSTO: ${payment}`, yOffset);
        yOffset += lineSpacing * 1;

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.`, yOffset);


        // Alineación derecha para contacto
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(`Sandra Córdoba\nÁrea Comercial\nTel: 351-2049880`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });

        // Guardar el PDF
        doc.save(finalPath); // Guarda el PDF en la ruta seleccionada por el usuario
        console.log('PDF guardado en:', finalPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}

// Función para generar el PDF
async function generatePDFseguridad() {
    try {
        // Solicitar al proceso principal que abra el diálogo de guardar archivo
        const filePath = await ipcRenderer.invoke('dialog:saveFile');

        // Verificar si el usuario canceló el diálogo
        if (!filePath) {
            console.log('Guardado cancelado.');
            return;
        }

        // Verificar si el archivo ya existe
        let finalPath = filePath;
        let counter = 1;

        while (fs.existsSync(finalPath)) {
            // Crear un nuevo nombre basado en el contador
            const { dir, name, ext } = path.parse(filePath);
            finalPath = path.join(dir, `${name}(${counter})${ext}`);
            counter++;
        }

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO EVENTUAL(1)(1).pdf.png'));
        const doc = new jsPDF();

        // Establecer fuente
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(10);

        // Añadir la imagen al PDF
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

        const yOffsetStart = 45;  // Ajuste inicial para bajar los elementos
        const lineSpacing = 6;     // Espacio entre cada línea de texto
        const yOffsetBottom = 30;  // Margen inferior
        const maxWidth = doc.internal.pageSize.width - 40; // Ancho máximo para el texto
        let yOffset = yOffsetStart; // Posición vertical inicial

        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const aPartirDe = document.getElementById('aPartirDe').value;
        const tabla = document.getElementById('tablas');

        // Alineación derecha para la fecha
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(` ${date}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
        yOffset += lineSpacing * 1;

        // Texto justificado
        const justifyText = (text, yOffset) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                doc.text(line, 20, yOffset);
                yOffset += lineSpacing;
            });
            return yOffset; // Devuelve la nueva posición vertical
        };

        yOffset = justifyText(`${recipient}:`, yOffset);
        yOffset += lineSpacing * 1;

        yOffset = justifyText(`Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.`, yOffset);
        yOffset = justifyText(`CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.`, yOffset);
        yOffset += lineSpacing * 1;

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        yOffset = justifyText(`
        - MEDIOS HUMANOS: Personal formado. Nuestro servicio es constante, reemplazos por ausencias, etc.
        - SUPERVISION: Nuestros supervisores cuentan con medios de comunicación para mantenerse en contacto continuo y directo con el operario de seguridad, cliente, área de gerencia y recursos humanos para gestionar la prestación del servicio.
        - UNIFORME DE TRABAJO: Proveemos uniformes de trabajo y elementos de seguridad de primera calidad, para nuestro personal que presta servicios, para cada estación del año (adaptándose según el clima).
        - SALARIOS: Presupuestamos tomando en consideración la escala salarial que rige nuestra actividad en la zona geográfica donde desarrollemos nuestras tareas. Queremos destacar que CORSACOR División Seguridad, cumple con todas las disposiciones legales, previsionales y laborales aplicables a la actividad que desempeña, eximiendo al cliente de cualquier riesgo laboral.
        - MEDIOS TECNICOS: Insumos, Equipos, e Implementos: Esta área está a cargo de personal especializado. Se ocupa de que estén en óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.
        - CALIDAD: Implementaremos un sistema de gestión de calidad, buscando con ello la máxima objetividad en el control del servicio y ofrecer al cliente un sistema de seguimiento de la contratación. El control de calidad se realiza sobre dos niveles: Control de satisfacción del cliente y Control de los servicios de vigilancia física prestados por el vigilador`, yOffset);
        yOffset += lineSpacing * 1;

        // Agregar una nueva página y repetir la imagen de fondo
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);
        yOffset = yOffsetStart; // Reiniciar el margen superior en la nueva página
        yOffset += lineSpacing * 2;

        yOffset = justifyText(`- A partir de: ${aPartirDe}`, yOffset);

        // Configuración de la tabla con margen ajustado
        yOffset += lineSpacing;
        const rows = tabla.querySelectorAll('tr');
        const cellPadding = 2;
        const startX = 10; // Reducido para dejar más espacio en el margen derecho
        const cellWidth = 28; // Ancho de celda ajustado
        const rowHeight = 10; // Altura de fila

        rows.forEach(row => {
            let xPosition = startX;
            const cells = row.querySelectorAll('td, th');

            // Verificar si la fila cabe en la página, de lo contrario, agregar nueva página
            if (yOffset + rowHeight > doc.internal.pageSize.height - 20) {
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);
                yOffset = yOffsetStart;
            }

            cells.forEach(cell => {
                const text = cell.innerText || "";
                const fontSize = text.length > 10 ? 6 : 7; // Ajustar tamaño de fuente dinámicamente
                doc.setFontSize(fontSize);

                const cellLines = doc.splitTextToSize(text, cellWidth - cellPadding * 2);

                // Dibujar la celda
                doc.rect(xPosition, yOffset, cellWidth, rowHeight);

                // Calcular el punto de inicio vertical para centrar el texto
                const textY = yOffset + rowHeight / 2 - (cellLines.length - 1) * lineSpacing / 2;

                // Dibujar el texto centrado en la celda
                cellLines.forEach((line, i) => {
                    doc.text(line, xPosition + cellWidth / 2, textY + i * lineSpacing, { align: 'center' });
                });

                xPosition += cellWidth;
            });

            yOffset += rowHeight;
        });

        yOffset += lineSpacing * 2;

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- Si por razones del servicio se debiera trabajar en horario nocturno y días feriados, se le incrementaran los recargos de ley correspondiente.
            La presente cotización está realizada en base a las escalas salariales vigentes del Gremio S.U.V.I.C.O., quedando sin variantes, en tanto y en cuanto no se produzcan modificaciones en las mismas.`, yOffset);

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.`, yOffset);

        // Alineación derecha para contacto
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(`Sandra Córdoba\nÁrea Comercial\nTel: 351-2049880`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });

        // Guardar el PDF
        doc.save(finalPath); // Guarda el PDF en la ruta seleccionada por el usuario
        console.log('PDF guardado en:', finalPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}

// Función para generar el PDF
async function generatePDFfinalObra() {
    try {
        // Solicitar al proceso principal que abra el diálogo de guardar archivo
        const filePath = await ipcRenderer.invoke('dialog:saveFile');

        // Verificar si el usuario canceló el diálogo
        if (!filePath) {
            console.log('Guardado cancelado.');
            return;
        }

        // Verificar si el archivo ya existe
        let finalPath = filePath;
        let counter = 1;

        while (fs.existsSync(finalPath)) {
            // Crear un nuevo nombre basado en el contador
            const { dir, name, ext } = path.parse(filePath);
            finalPath = path.join(dir, `${name}(${counter})${ext}`);
            counter++;
        }

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO EVENTUAL(1)(1).pdf.png'));
        const doc = new jsPDF();

        // Establecer fuente
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(10);

        // Añadir la imagen al PDF
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

        const yOffsetStart = 45;  // Ajuste inicial para bajar los elementos
        const lineSpacing = 6;     // Espacio entre cada línea de texto
        const yOffsetBottom = 30;  // Margen inferior
        const maxWidth = doc.internal.pageSize.width - 40; // Ancho máximo para el texto
        let yOffset = yOffsetStart; // Posición vertical inicial

        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const tasks = document.getElementById('tasks').value;
        const supplies = document.getElementById('insumos-seleccionados').value;
        const validity = document.getElementById('validity').value;
        const payment = document.getElementById('payment').value;

        // Alineación derecha para la fecha
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(` ${date}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
        yOffset += lineSpacing;

        // Texto justificado
        const justifyText = (text, yOffset) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                doc.text(line, 20, yOffset);
                yOffset += lineSpacing;
            });
            return yOffset; // Devuelve la nueva posición vertical
        };

        yOffset = justifyText(`${recipient}:`, yOffset);
        yOffset = justifyText(`Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.`, yOffset);
        yOffset = justifyText(`CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.`, yOffset);

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        yOffset = justifyText(`- TAREAS A REALIZAR: ${tasks}`, yOffset);

        yOffset = justifyText(`- INSUMOS: ${supplies}`, yOffset);

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS. MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.`, yOffset);

        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);


        yOffset = justifyText(`-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas.`, yOffset);
        yOffset += lineSpacing * 1;
        yOffset = justifyText(`- COSTO: ${payment}`, yOffset);
        yOffset += lineSpacing * 1;

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.`, yOffset);


        // Alineación derecha para contacto
        doc.setFontSize(10); // Establecer tamaño de fuente a 12
        doc.text(`Sandra Córdoba\nÁrea Comercial\nTel: 351-2049880`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });

        // Guardar el PDF
        doc.save(finalPath); // Guarda el PDF en la ruta seleccionada por el usuario
        console.log('PDF guardado en:', finalPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}

function calculateWeeklyHours() {
    // Obtener el valor de horas por día
    const hoursPerDay = parseInt(document.getElementById('hoursPerDay').value) || 0;

    // Contar los días seleccionados
    const dayCheckboxes = document.querySelectorAll('.dayCheckbox');
    let daysSelected = 0;
    dayCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            daysSelected++;
        }
    });

    // Calcular las horas semanales
    const weeklyHours = hoursPerDay * daysSelected;

    // Mostrar el resultado en el campo de horas semanales
    document.getElementById('weeklyHours').value = weeklyHours;
}