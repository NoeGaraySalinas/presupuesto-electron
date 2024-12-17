const { ipcRenderer } = require('electron');
const { jsPDF } = require('jspdf'); // Asegúrate de usar solo esta línea
const path = require('path');
const fs = require('fs');
require('jspdf-autotable'); // Cargar la extensión de autotable
const doc = new jsPDF();

if (!ipcRenderer) {
    console.error('ipcRenderer no está disponible. Asegúrate de que está cargado correctamente.');
}

document.querySelectorAll('.hours, .personnel').forEach(input => {
    if (!input.value) {
        input.value = '0';  // Asignar un valor por defecto si está vacío
    }
});


// Lista de insumos
const insumos = [
    "Con respecto a los insumos, los mismos están incluídos en el costo del presupuesto, con excepción de insumos especiales, como papel higiénico, toallas de mano, ceras, etc. En caso de solicitarlos se facturarán por separado.",
    "Con respecto a los insumos no están incluídos en el costo del presupuesto. En caso de solicitarlos se facturarán por separado.",
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

function generateDayInputs() {
    const formContainer = document.getElementById('horas-semanales-form');
    if (!formContainer) {
        console.warn('El contenedor horas-semanales-form no existe en el DOM');
        return; // Sale de la función si el contenedor no existe
    }

    if (formContainer.querySelectorAll('input[type="checkbox"]').length === 0) {
        const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

        days.forEach(day => {
            const div = document.createElement('div');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `dia-${day}`;
            checkbox.name = 'dias';
            checkbox.value = day;

            const horasInput = document.createElement('input');
            horasInput.type = 'number';
            horasInput.id = `horas-${day}`;
            horasInput.name = `horas-${day}`;
            horasInput.placeholder = `Horas de ${day}`;

            const empleadosInput = document.createElement('input');
            empleadosInput.type = 'number';
            empleadosInput.id = `empleados-${day}`;
            empleadosInput.name = `empleados-${day}`;
            empleadosInput.placeholder = `Empleados para ${day}`;

            div.appendChild(checkbox);
            div.appendChild(horasInput);
            div.appendChild(empleadosInput);

            formContainer.appendChild(div);
        });
    }
}

function addItemMensual() {
    const date = document.getElementById('date').value;
    const recipient = document.getElementById('recipient').value;
    const serviceSelect = document.getElementById('service').value;
    const addressInput = document.getElementById('address').value;

    const tasks = document.getElementById('tasks').value;
    const supplies = document.getElementById('insumos-seleccionados').value;
    const validity = document.getElementById('validity').value;
    const payment = document.getElementById('payment').value;
    const escala = document.getElementById('escala').value;
    const budgetList = document.getElementById('budget-list');

    // Capturar los valores de los inputs dentro de la tabla
    const lunes = document.getElementById('input-lunes').value || 0;
    const martes = document.getElementById('input-martes').value || 0;
    const miercoles = document.getElementById('input-miercoles').value || 0;
    const jueves = document.getElementById('input-jueves').value || 0;
    const viernes = document.getElementById('input-viernes').value || 0;
    const sabado = document.getElementById('input-sabado').value || 0;
    const domingo = document.getElementById('input-domingo').value || 0;

    // Capturar los valores de los inputs fuera de la tabla
    const diasSemanales = document.getElementById('dias-semanales-input').value || 0;
    const horasSemanales = document.getElementById('horas-semanales').value || 0;
    const numOperarios = document.getElementById('operarios').value || 0;

    // Generar el contenido de la tabla con los valores ingresados
    const tableContent = `
        <div class="table-inputs-wrapper">
            <div class="unique-table-container">
                <table id="weekly-hours-table">
                    <thead>
                        <tr>
                            <th>L</th>
                            <th>M</th>
                            <th>M</th>
                            <th>J</th>
                            <th>V</th>
                            <th>S</th>
                            <th>D</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="number" id="input-lunes" class="hours" value="${lunes}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-martes" class="hours" value="${martes}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-miercoles" class="hours" value="${miercoles}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-jueves" class="hours" value="${jueves}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-viernes" class="hours" value="${viernes}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-sabado" class="hours" value="${sabado}" placeholder="0" min="0"> hs</td>
                            <td><input type="number" id="input-domingo" class="hours" value="${domingo}" placeholder="0" min="0"> hs</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="unique-inputs-container">
                <label for="dias-semanales">Días semanales:
                    <input type="number" id="dias-semanales-input" value="${diasSemanales}" min="0" placeholder="0"></label>
                <label for="horas-semanales">Horas semanales:
                    <input type="number" id="horas-semanales" value="${horasSemanales}" min="0" placeholder="0"></label>
                <label for="num-operarios">Operarios:
                    <input type="number" id="num-operarios" value="${numOperarios}" min="0" placeholder="0"></label>
            </div>
        </div>
    `;

    // Limpia y actualiza el contenido del presupuesto
    budgetList.innerHTML = '';
    budgetList.innerHTML += `
      <p>Fecha: ${date}</p>
      <p>Destinatario: ${recipient}</p>
      <p>Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.</p>
      <p>CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente. Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.</p>
      <p>Propuesta económica: ${serviceSelect}</p>
      <p>Domicilio: ${addressInput}</p>
      <p>Días y horarios:</p>
      ${tableContent}
      <p>Tareas: ${tasks}</p>
      <p>Insumos: ${supplies}</p>
      <p>Funcionamiento de equipos, maquinarias, herramientas e implementos: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.</p>
      <p>Vigencia: ${validity}</p>
      <p>Costo: ${payment}</p>
      <p>${escala}</p>
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:</p>
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
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:<p>
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
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:<p>
      <p>-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas </p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

// Función borrar lista 
function deleteItemMensual() {
    // Vaciar los valores de los inputs
    document.getElementById('date').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('service').value = '';
    document.getElementById('address').value = '';
    document.getElementById('tasks').value = '';
    document.getElementById('insumos-seleccionados').value = '';
    document.getElementById('validity').value = '';
    document.getElementById('payment').value = '';

    // Restablecer los días seleccionados
    const dayCheckboxes = document.querySelectorAll('input[name="dias"]:checked');
    dayCheckboxes.forEach(checkbox => checkbox.checked = false);  // Desmarcar los checkboxes

    // Restablecer horas y empleados de cada día
    const horasInputs = document.querySelectorAll('input[id^="horas-"]');
    const empleadosInputs = document.querySelectorAll('input[id^="empleados-"]');

    horasInputs.forEach(input => input.value = ''); // Vaciar horas
    empleadosInputs.forEach(input => input.value = ''); // Vaciar empleados

    // Limpia la lista del presupuesto
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';  // Limpiar el contenido generado

    // Si deseas ocultar los checkboxes e inputs generados, puedes hacer esto:
    // (por ejemplo, puedes restaurar la visibilidad del formulario si está oculto)
    document.getElementById('horas-semanales-form').style.display = 'block';  // Asegurarse de que el formulario esté visible
}

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
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:<p>
      <p>-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas </p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

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
      <p>En todos nuestros servicios nos comprometemos y ofrecemos:<p>
      <p>-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas </p>
      <p>Costo: ${payment}</p>
      <p>La forma de pago es abonando el 50% del total al inicio del trabajo, y el 50% restante al finalizar el mismo.</p>
      <p id="saludoFinal">Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo.</p>
      <p style="text-align:right">Sandra Córdoba<br>Área Comercial<br>Tel: 351-2049880</p>
    `;
}

// Función para cargar una imagen desde una ruta y convertirla a Base64
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous"; // Necesario si la imagen está alojada externamente
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const base64Image = canvas.toDataURL('image/png'); // Convierte a Base64
            resolve(base64Image);
        };
        img.onerror = (error) => reject(error);
    });
}

async function generatePDFmensual() {
    try {

        // Solicitar al proceso principal que abra el diálogo de guardar archivo
        const filePath = await ipcRenderer.invoke('dialog:saveFile');
        if (!filePath) {
            console.log('Guardado cancelado.');
            return;
        }

        // Verificar si el archivo ya existe
        let finalPath = filePath;
        let counter = 1;

        while (fs.existsSync(finalPath)) {
            const { dir, name, ext } = path.parse(filePath);
            finalPath = path.join(dir, `${name}(${counter})${ext}`);
            counter++;
        }

        const doc = new jsPDF();

        // Cargar la imagen de fondo
        const backgroundImage = await loadImage('NUEVO FORMULARIO.png');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Agregar la imagen de fondo
        doc.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);

        // Configurar fuente
        const fontSize = 10;
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(fontSize);

        const yOffsetStart = 45;
        const lineSpacing = 4.5; // Reducir el interlineado
        const maxWidth = doc.internal.pageSize.width - 40;
        let yOffset = yOffsetStart;

        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const tasks = document.getElementById('tasks').value;
        const supplies = document.getElementById('insumos-seleccionados').value;
        const validity = document.getElementById('validity').value;
        const payment = document.getElementById('payment').value;
        const escala = document.getElementById('escala').value;

        // Calcular las horas semanales
        const daysInput = Array.from(document.querySelectorAll('input[type="checkbox"][name="dias"]:checked'));
        let weeklyHours = 0;
        const daysDetails = [];

        daysInput.forEach((checkbox) => {
            const day = checkbox.value;
            const hours = parseInt(document.getElementById(`horas-${day}`).value, 10) || 0;
            const employees = parseInt(document.getElementById(`empleados-${day}`).value, 10) || 0;

            const totalDayHours = hours * employees;
            weeklyHours += totalDayHours;

            // Guardar detalles para el PDF
            daysDetails.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}h por ${employees} empleados (${totalDayHours}h total)`);
        });

        // Obtener y formatear la fecha
        const rawDate = document.getElementById('date').value; // Valor en formato 'aaaa-mm-dd'
        let formattedDate = '';
        if (rawDate) {
            const [year, month, day] = rawDate.split('-'); // Dividir el formato ISO
            formattedDate = `${day}/${month}/${year}`; // Reorganizar al formato 'dd/mm/aaaa'
        }

        // Alineación derecha para la fecha
        doc.text(`Córdoba, ${formattedDate}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
        yOffset += lineSpacing;

        // Texto justificado
        const justifyText = (text, yOffset) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line) => {
                doc.text(line, 20, yOffset);
                yOffset += lineSpacing;
            });
            return yOffset;
        };
        yOffset = justifyText(`Estimados/as Sres.:`, yOffset);

        // Cambiar a fuente negrita para el texto del input 'recipient'
        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`${recipient}`, yOffset);
        // Volver a la fuente original para el resto del texto
        doc.setFont('Cambria', 'italic');
        yOffset += lineSpacing;

        yOffset = justifyText(`   Nos es grato presentarles nuestra empresa que se destaca por la calidad de los servicios, ofreciendo servicios de limpieza, desinfección y mantenimiento integral.`, yOffset);
        yOffset = justifyText(`   CORSACOR (Corporación de soluciones ambientales Córdoba S.A.S. - C.U.I.T. Nº 3071655148-9) permite ofrecer un servicio totalmente organizado, controlado y eficiente.`, yOffset);
        yOffset = justifyText(`   Nuestro objetivo se fundamenta en la prestación de servicios de alta calidad, considerando en todo momento los requerimientos y circunstancias concretas de cada uno de nuestros clientes para adaptarnos a sus necesidades reales.`, yOffset);
        yOffset += lineSpacing;


        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;

        // Cambiar a fuente negrita para el texto de los inputs de sevicio y domicilio'
        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(proposalLine, yOffset);
        // Volver a la fuente original para el resto del texto
        doc.setFont('Cambria', 'italic');
        yOffset += lineSpacing;
        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- DIAS Y HORAS A REALIZAR:`, yOffset);
        doc.setFont('Cambria', 'italic');

        // Obtener valores de los días de la semana
        const lunes = document.getElementById('input-lunes')?.value || '0';
        const martes = document.getElementById('input-martes')?.value || '0';
        const miercoles = document.getElementById('input-miercoles')?.value || '0';
        const jueves = document.getElementById('input-jueves')?.value || '0';
        const viernes = document.getElementById('input-viernes')?.value || '0';
        const sabado = document.getElementById('input-sabado')?.value || '0';
        const domingo = document.getElementById('input-domingo')?.value || '0';

        // Calcular días semanales y horas semanales
        const diasSemanales = [lunes, martes, miercoles, jueves, viernes, sabado, domingo].filter(horas => horas > 0).length; // Número de días con horas mayores a 0
        const horasSemanales = [lunes, martes, miercoles, jueves, viernes, sabado, domingo]
            .map(hora => parseInt(hora) || 0) // Convertir a número y reemplazar valores no numéricos con 0
            .reduce((acc, curr) => acc + curr, 0); // Sumar todas las horas

        // Obtener valor de "Operarios"
        const operarios = document.getElementById('operarios')?.value || '0';

        // Dibujar la tabla con autoTable alineada a la izquierda
        doc.autoTable({
            startY: yOffset,
            head: [['L', 'M', 'M', 'J', 'V', 'S', 'D']],
            body: [[lunes, martes, miercoles, jueves, viernes, sabado, domingo]],
            styles: {
                fontSize: 10,
                halign: 'center',
                cellPadding: 2,
                cellWidth: 10,
            },
            headStyles: {
                fillColor: [255, 165, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
            },
            margin: { left: 20, right: 100 }, // Espacio para los inputs a la derecha
        });

        // Posición para los inputs a la derecha de la tabla
        let inputX = 140;
        let inputY = yOffset + 0;

        // Actualizar yOffset para continuar después de la tabla
        yOffset = doc.lastAutoTable.finalY + 10; // Añadir un pequeño espacio después de la tabla

        // Los inputs de Días semanales, Horas semanales y Operarios a la derecha de la tabla
        doc.setFont('Cambria', 'bold');
        doc.text(`Días semanales: ${diasSemanales}`, inputX, inputY);
        inputY += 10;
        doc.text(`Horas semanales: ${horasSemanales}`, inputX, inputY);
        inputY += 10;
        doc.text(`Operarios: ${operarios}`, inputX, inputY);
        doc.setFont('Cambria', 'italic');

        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- TAREAS A REALIZAR:`, yOffset);
        doc.setFont('Cambria', 'italic');
        yOffset = justifyText(`${tasks}`, yOffset);
        yOffset += lineSpacing;

        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- INSUMOS:`, yOffset);
        doc.setFont('Cambria', 'italic');
        yOffset = justifyText(`${supplies}`, yOffset);
        yOffset += lineSpacing;

        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS, MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS:`, yOffset);
        doc.setFont('Cambria', 'italic');
        yOffset = justifyText('En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.', yOffset);
        yOffset += lineSpacing;

        // Aplicar negrita en "Dias de vigencia"
        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);
        doc.setFont('Cambria', 'italic');
        yOffset += lineSpacing;

        yOffset = justifyText('En todos nuestros servicios nos comprometemos y ofrecemos:', yOffset);
        yOffset = justifyText('-> Supervición continua -> uniformes y elementos de protección personal -> cronograma y planificación detallada de limpieza de todos los espacios comunes del edificio -> traslados y reemplazos -> personal capacitado y entrenado en procesos y tareas requeridas.', yOffset);
        yOffset += lineSpacing;

        // Aplicar negrita en "Costo"
        doc.setFont('Cambria', 'bold');
        yOffset = justifyText(`- COSTO: ${payment}`, yOffset);
        doc.setFont('Cambria', 'italic');
        yOffset += lineSpacing;

        yOffset = justifyText(`${escala}`, yOffset);

        doc.setFontSize(fontSize);
        yOffset = justifyText(`Esperamos que el presente presupuesto se ajuste a sus necesidades y sea de su interés. Estamos a su disposición por cualquier consulta, aclaración o modificación del mismo. Atentamente.`, yOffset);

        doc.setFont('Cambria', 'bold');
        doc.text(`Sandra Córdoba\nÁrea Comercial\nTel: 351-2049880`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });

        // Guardar el PDF
        doc.save(finalPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}

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

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO.png'));
        const doc = new jsPDF();

        // Establecer fuente
        doc.setFont('Cambria', 'italic');
        doc.setFontSize(10);

        // Añadir la imagen al PDF
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

        const yOffsetStart = 45;  // Ajuste inicial para bajar los elementos
        const lineSpacing = 1;     // Espacio entre cada línea de texto
        const yOffsetBottom = 10;  // Margen inferior
        const maxWidth = doc.internal.pageSize.width - 20; // Ancho máximo para el texto
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

        // Obtener y formatear la fecha
        const rawDate = document.getElementById('date').value; // Valor en formato 'aaaa-mm-dd'
        let formattedDate = '';
        if (rawDate) {
            const [year, month, day] = rawDate.split('-'); // Dividir el formato ISO
            formattedDate = `${day}/${month}/${year}`; // Reorganizar al formato 'dd/mm/aaaa'
        }
        // Alineación derecha para la fecha
        doc.text(` ${formattedDate}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
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
        yOffset += lineSpacing * 1;

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        yOffset = justifyText(`- TAREAS A REALIZAR: ${tasks}`, yOffset);

        yOffset = justifyText(`- INSUMOS: ${supplies}`, yOffset);

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS. MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.`, yOffset);

        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);
        yOffset += lineSpacing * 1;

        yOffset = justifyText(`En todos nuestros servicios nos comprometemos y ofrecemos:`, yOffset);
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

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO.png'));
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
        yOffset += 1; // Ajusta este valor según necesites



        // Obtener los valores de los inputs
        const date = document.getElementById('date').value;
        const recipient = document.getElementById('recipient').value;
        const serviceSelect = document.getElementById('service').value;
        const addressInput = document.getElementById('address').value;
        const aPartirDe = document.getElementById('aPartirDe').value;
        const tabla = document.getElementById('tablas');
        const tableData = [];


        // Obtener y formatear la fecha
        const rawDate = document.getElementById('date').value; // Valor en formato 'aaaa-mm-dd'
        let formattedDate = '';
        if (rawDate) {
            const [year, month, day] = rawDate.split('-'); // Dividir el formato ISO
            formattedDate = `${day}/${month}/${year}`; // Reorganizar al formato 'dd/mm/aaaa'
        }
        // Alineación derecha para la fecha
        doc.text(` ${formattedDate}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
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

        // Capturar datos de la primera tabla
        const tabla1 = document.getElementById('tabla1');
        const rows1 = tabla1.querySelectorAll('tr');
        const tableData1 = [];

        rows1.forEach((row) => {
            const cells = row.querySelectorAll('td, th');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim());
            tableData1.push(rowData);
        });

        // Dibujar la primera tabla
        doc.autoTable({
            head: [tableData1[0]],
            body: tableData1.slice(1),
            startY: yOffset,
            margin: { top: 10, left: 20, right: 20 },
            styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [255, 165, 0], textColor: [255, 255, 255] },
        });

        yOffset = doc.lastAutoTable.finalY + lineSpacing * 2;

        // Capturar datos de la segunda tabla
        const tabla2 = document.getElementById('tabla2');
        const rows2 = tabla2.querySelectorAll('tr');
        const tableData2 = [];

        rows2.forEach((row) => {
            const cells = row.querySelectorAll('td, th');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim());
            tableData2.push(rowData);
        });

        // Dibujar la segunda tabla
        doc.autoTable({
            head: [tableData2[0]],
            body: tableData2.slice(1),
            startY: yOffset,
            margin: { top: 10, left: 20, right: 20 },
            styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [255, 165, 0], textColor: [255, 255, 255] },
        });

        yOffset = doc.lastAutoTable.finalY + lineSpacing * 2;

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

        const imgData = await loadImage(path.join(__dirname, 'NUEVO FORMULARIO.png'));
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

        // Obtener y formatear la fecha
        const rawDate = document.getElementById('date').value; // Valor en formato 'aaaa-mm-dd'
        let formattedDate = '';
        if (rawDate) {
            const [year, month, day] = rawDate.split('-'); // Dividir el formato ISO
            formattedDate = `${day}/${month}/${year}`; // Reorganizar al formato 'dd/mm/aaaa'
        }
        // Alineación derecha para la fecha
        doc.text(` ${formattedDate}`, doc.internal.pageSize.width - 20, yOffset, { align: "right" });
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
        yOffset += lineSpacing * 1;

        // Imprimir "PROPUESTA ECONÓMICA" y "En: dirección" en la misma línea
        const proposalLine = `- PROPUESTA ECONÓMICA: ${serviceSelect}, En: ${addressInput}.`;
        yOffset = justifyText(proposalLine, yOffset);

        yOffset = justifyText(`- TAREAS A REALIZAR: ${tasks}`, yOffset);

        yOffset = justifyText(`- INSUMOS: ${supplies}`, yOffset);

        doc.setFontSize(10); // Volver al tamaño de fuente normal
        yOffset = justifyText(`- FUNCIONAMIENTO DE EQUIPOS. MAQUINARIAS, HERRAMIENTAS E IMPLEMENTOS: En óptimas condiciones de funcionamiento para el desarrollo de las tareas programadas por nuestra área operativa.`, yOffset);

        yOffset = justifyText(`- DÍAS DE VIGENCIA DEL PRESUPUESTO: ${validity}.`, yOffset);
        yOffset += lineSpacing * 1;

        yOffset = justifyText(`En todos nuestros servicios nos comprometemos y ofrecemos:`, yOffset);
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

function autoExpand(element) {
    // Ajustar el tamaño del textarea de acuerdo a su contenido
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

function generatePDF() {
    // Ajusta el estilo del destinatario para el PDF
    const recipient = document.getElementById('recipient');
    recipient.style.marginTop = '20px';

    const element = document.body;

    // Opciones de html2pdf para ajustar el margen y otros parámetros
    const opt = {
        margin: [10, 0, 0, 0],  // Márgenes superiores, derechos, inferiores, izquierdos
        filename: 'presupuesto.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generar el PDF
    html2pdf().from(element).set(opt).save()
        .then(() => {
            // Restaurar el estilo original después de la generación del PDF
            recipient.style.marginTop = '0';
        });
}

function autoExpand(element) {
    // Ajustar el tamaño del textarea de acuerdo a su contenido
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

document.getElementById('date').addEventListener('input', function () {
    const inputDate = this.value; // Obtiene la fecha en formato yyyy-mm-dd

    if (inputDate) {
        const [year, month, day] = inputDate.split('-'); // Descompón la fecha
        const formattedDate = `${day}/${month}/${year}`; // Cambia el formato a dd/mm/yyyy

        // Asignar la fecha formateada al input
        this.setAttribute('data-formatted', formattedDate);
    }
});

document.getElementById('date').addEventListener('focus', function () {
    // Muestra el formato dd/mm/yyyy cuando el campo esté enfocado
    const formattedDate = this.getAttribute('data-formatted');
    if (formattedDate) {
        this.value = formattedDate.split('/').reverse().join('-'); // Ajusta la fecha al formato de input
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Función para contar los días en los que se han ingresado horas
    function actualizarDiasSemanales() {
        let diasModificados = 0;

        // Recorremos todos los inputs de la columna de "Horas por día"
        const horasInputs = document.querySelectorAll('.hours');

        horasInputs.forEach(input => {
            const valor = parseFloat(input.value) || 0; // Obtenemos el valor de cada input (si está vacío lo tratamos como 0)
            if (valor > 0) {
                diasModificados++; // Si hay horas ingresadas (mayor que 0), incrementamos el contador de días modificados
            }
        });

        // Actualizamos el campo "Días semanales" con el número de días modificados
        document.getElementById('dias-semanales-input').value = diasModificados;
    }

    // Agregar evento para que se actualice cada vez que se modifique un campo de horas
    const horasInputs = document.querySelectorAll('.hours');
    horasInputs.forEach(input => {
        input.addEventListener('input', actualizarDiasSemanales);
    });

    // Ejecutar la función al cargar la página para inicializar el valor
    actualizarDiasSemanales();

    // Función para sumar las horas de todos los días y actualizar el campo "Horas semanales"
    function actualizarHorasSemanales() {
        let totalHoras = 0;

        // Recorremos todos los inputs de la columna de "Horas por día"
        const horasInputs = document.querySelectorAll('.hours');

        horasInputs.forEach(input => {
            // Convertir a número y manejar entradas no válidas como 0
            const valor = parseFloat(input.value.trim()) || 0;
            totalHoras += valor; // Sumar el valor al total
        });

        // Asegurarnos de que el resultado sea un número válido y con formato consistente
        document.getElementById('horas-semanales').value = totalHoras.toFixed(2); // Mostrar con dos decimales
    }

    // Agregar un evento para actualizar la cantidad de días y horas cuando se cambie cualquier input de la tabla
    document.querySelectorAll('.hours').forEach(input => {
        input.addEventListener('input', function () {
            actualizarDiasSemanales(); // Actualizar días semanales
            actualizarHorasSemanales(); // Actualizar horas semanales
        });
    });

});
