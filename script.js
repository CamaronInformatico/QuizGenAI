// ==========================================
// 1. BANCO DE DATOS INTEGRADO (CARRERAS)
// ==========================================
const CUESTIONARIOS_CARRERAS = [
    {
        id: "carrera-sistemas",
        titulo: "Sistemas Informáticos",
        preguntas: [
            { pregunta: "¿Qué significa SQL?", opciones: ["Structure Query Language", "Simple Queue Linux", "System Quality Log", "Standard Quantify Loop"], correcta: "A" },
            { pregunta: "¿Cuál es una estructura de datos lineal?", opciones: ["Árbol B", "Grafo", "Lista Enlazada", "Matriz Adyacencia"], correcta: "C" }
        ]
    },
    {
        id: "carrera-hotelera",
        titulo: "Operación Hotelera y Restaurantera",
        preguntas: [
            { pregunta: "¿Qué significa el término 'Overbooking'?", opciones: ["Limpieza profunda", "Sobreventa de capacidad", "Check-in rápido", "Inventario de cocina"], correcta: "B" }
        ]
    },
    {
        id: "carrera-cuidado",
        titulo: "Cuidado para Personas Dependientes",
        preguntas: [
            { pregunta: "¿Cuál es un principio clave en la movilización de pacientes?", opciones: ["Fuerza bruta", "Ergonomía y postura recta", "Rapidez extrema", "Cargar sin apoyos"], correcta: "B" }
        ]
    },
    {
        id: "carrera-mecatronica",
        titulo: "Mecatrónica",
        preguntas: [
            { pregunta: "¿Qué componentes integran principalmente la mecatrónica?", opciones: ["Química y Biología", "Mecánica, Electrónica e Informática", "Civil y Arquitectura", "Diseño y Ventas"], correcta: "B" }
        ]
    }
];

let listaCuestionariosCreados = [];
let cuestionarioActivo = null;
let indicePreguntaActual = 0;
let aciertosActuales = 0;

// ==========================================
// 2. DISPARADOR DE ARRANQUE
// ==========================================
window.onload = function() {
    verificarSesionExistente();
    cargarQuizzesDesdeStorage();
    renderizarCuestionariosEspecialidad();
};

function verificarSesionExistente() {
    const usuarioActivo = localStorage.getItem('sesionUsuario');
    if (usuarioActivo) {
        document.getElementById('username').value = usuarioActivo;
        document.getElementById('profile-username').value = usuarioActivo;
        document.getElementById('profile-description').value = localStorage.getItem(`desc_${usuarioActivo}`) || "";
        
        document.getElementById('global-header').classList.remove('hidden');
        showScreen('main-menu');
    }
}

function cargarQuizzesDesdeStorage() {
    const guardados = localStorage.getItem('mis_cuestionarios_quizgen');
    listaCuestionariosCreados = guardados ? JSON.parse(guardados) : [];
    renderizarCuestionariosUsuario();
}

// ==========================================
// 3. SISTEMA DE SEGURIDAD (LOGIN Y REGISTRO)
// ==========================================
function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert("Por favor rellena todos los campos.");

    const passGuardada = localStorage.getItem(`pass_${user}`);
    
    if (passGuardada && passGuardada !== pass) {
        return alert("Contraseña incorrecta.");
    }
    
    // Auto-registro directo si el usuario no existía en el almacenamiento local
    if (!passGuardada) {
        localStorage.setItem(`pass_${user}`, pass);
    }

    conectarUsuario(user);
}

function registrarCuenta() {
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value.trim();

    if (!user || !pass) return alert("Por favor rellena todos los campos para registrarte.");

    localStorage.setItem(`pass_${user}`, pass);
    alert("¡Cuenta registrada con éxito! Entrando al sistema...");
    
    document.getElementById('reg-username').value = "";
    document.getElementById('reg-password').value = "";
    
    conectarUsuario(user);
}

function conectarUsuario(user) {
    localStorage.setItem('sesionUsuario', user);
    document.getElementById('profile-username').value = user;
    document.getElementById('profile-description').value = localStorage.getItem(`desc_${user}`) || "";
    
    document.getElementById('global-header').classList.remove('hidden');
    showScreen('main-menu');
}

function logout() {
    localStorage.removeItem('sesionUsuario');
    document.getElementById('global-header').classList.add('hidden');
    document.getElementById('password').value = "";
    showScreen('auth-screen');
}

function guardarPerfil() {
    const userActivo = localStorage.getItem('sesionUsuario');
    const nuevoNombre = document.getElementById('profile-username').value.trim();
    const nuevaDesc = document.getElementById('profile-description').value.trim();

    if(!nuevoNombre) return alert("El nombre no puede estar vacío.");

    if (nuevoNombre !== userActivo) {
        const pass = localStorage.getItem(`pass_${userActivo}`);
        localStorage.setItem(`pass_${nuevoNombre}`, pass);
        localStorage.removeItem(`pass_${userActivo}`);
        localStorage.removeItem(`desc_${userActivo}`);
        localStorage.setItem('sesionUsuario', nuevoNombre);
    }

    localStorage.setItem(`desc_${nuevoNombre}`, nuevaDesc);
    alert("¡Perfil guardado de forma permanente!");
    showScreen('main-menu');
}

// ==========================================
// 4. ROUTER / INTERRUPTOR DE PANTALLAS
// ==========================================
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    if(target) target.classList.add('active');
}

// ==========================================
// 5. MOTOR DE INTEGRACIÓN CON GEMINI
// ==========================================
function abrirCreadorAI() {
    document.getElementById('gemini-raw-input').value = "";
    showScreen('ai-creator-screen');
}

function linkToGemini() {
    window.open('https://gemini.google.com', '_blank', 'width=700,height=700,noopener,noreferrer');
}

function procesarTextoGemini() {
    const rawText = document.getElementById('gemini-raw-input').value.trim();
    if(!rawText) return alert("Pega el texto que generó Gemini.");

    try {
        const lineas = rawText.split('\n');
        let titulo = "Quiz de Inteligencia Artificial";
        let preguntas = [];

        lineas.forEach(linea => {
            if(linea.toLowerCase().startsWith('título:')) {
                titulo = linea.split(':')[1].trim();
            } else if (linea.toUpperCase().startsWith('P')) {
                const partes = linea.split('|');
                const preguntaTexto = partes[0].split(':')[1].trim();
                const opA = partes[1].split(':')[1].trim();
                const opB = partes[2].split(':')[1].trim();
                const opC = partes[3].split(':')[1].trim();
                const opD = partes[4].split(':')[1].trim();
                const correcta = partes[5].split(':')[1].trim().toUpperCase();

                preguntas.push({
                    pregunta: preguntaTexto,
                    opciones: [opA, opB, opC, opD],
                    correcta: correcta
                });
            }
        });

        if(preguntas.length === 0) throw new Error();

        const nuevoQuiz = { id: "quiz_" + Date.now(), titulo: titulo, preguntas: preguntas };
        listaCuestionariosCreados.push(nuevoQuiz);
        localStorage.setItem('mis_cuestionarios_quizgen', JSON.stringify(listaCuestionariosCreados));
        
        renderizarCuestionariosUsuario();
        alert(`¡Quiz "${titulo}" estructurado correctamente desde Gemini!`);
        showScreen('main-menu');

    } catch (e) {
        alert("Formato incorrecto. Asegúrate de copiar la respuesta de Gemini de manera íntegra, tal cual la estructura solicitada.");
    }
}

// ==========================================
// 6. MOTOR DE CREACIÓN MANUAL
// ==========================================
function addManualQuestion() {
    const container = document.getElementById('questions-container');
    const box = document.createElement('div');
    box.className = "question-box-card";
    box.innerHTML = `
        <input type="text" class="q-text" placeholder="Pregunta">
        <div class="options-grid">
            <input type="text" class="q-opA" placeholder="Opción A">
            <input type="text" class="q-opB" placeholder="Opción B">
            <input type="text" class="q-opC" placeholder="Opción C">
            <input type="text" class="q-opD" placeholder="Opción D">
        </div>
        <select class="q-correcta">
            <option value="">-- Selecciona la respuesta correcta --</option>
            <option value="A">Opción A</option>
            <option value="B">Opción B</option>
            <option value="C">Opción C</option>
            <option value="D">Opción D</option>
        </select>
    `;
    container.appendChild(box);
}

function guardarCuestionarioManual() {
    const titulo = document.getElementById('manual-quiz-title').value.trim();
    if(!titulo) return alert("Escribe un título para tu cuestionario.");

    const cajas = document.querySelectorAll('#questions-container .question-box-card');
    const preguntas = [];

    for(let caja of cajas) {
        const texto = caja.querySelector('.q-text').value.trim();
        const opA = caja.querySelector('.q-opA').value.trim();
        const opB = caja.querySelector('.q-opB').value.trim();
        const opC = caja.querySelector('.q-opC').value.trim();
        const opD = caja.querySelector('.q-opD').value.trim();
        const correcta = caja.querySelector('.q-correcta').value;

        if(!texto || !opA || !opB || !opC || !opD || !correcta) {
            return alert("Completa todas las casillas del cuestionario.");
        }
        preguntas.push({ pregunta: texto, opciones: [opA, opB, opC, opD], correcta: correcta });
    }

    const nuevoQuiz = { id: "quiz_" + Date.now(), titulo: titulo, preguntas: preguntas };
    listaCuestionariosCreados.push(nuevoQuiz);
    localStorage.setItem('mis_cuestionarios_quizgen', JSON.stringify(listaCuestionariosCreados));
    
    renderizarCuestionariosUsuario();
    alert("¡Cuestionario guardado con éxito!");
    showScreen('main-menu');
}

// ==========================================
// 7. RENDERIZADORES DE TABLEROS
// ==========================================
function renderizarCuestionariosUsuario() {
    const container = document.getElementById('user-quizzes-container');
    container.innerHTML = "";
    if(listaCuestionariosCreados.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; color: gray;'>No has creado cuestionarios aún.</p>";
        return;
    }
    listaCuestionariosCreados.forEach(q => {
        const div = document.createElement('div');
        div.className = "quiz-card";
        div.innerHTML = `<h4>📌 ${q.titulo}</h4><p>${q.preguntas.length} preguntas</p>`;
        div.onclick = () => comenzarJuego(q);
        container.appendChild(div);
    });
}

function renderizarCuestionariosEspecialidad() {
    const container = document.getElementById('career-quizzes-container');
    container.innerHTML = "";
    CUESTIONARIOS_CARRERAS.forEach(q => {
        const div = document.createElement('div');
        div.className = "quiz-card";
        div.innerHTML = `<h4>🎓 ${q.titulo}</h4><p>${q.preguntas.length} preguntas</p>`;
        div.onclick = () => comenzarJuego(q);
        container.appendChild(div);
    });
}

// ==========================================
// 8. EJECUCIÓN DE TRIVIA (MECÁNICA KAHOOT)
// ==========================================
function comenzarJuego(quiz) {
    cuestionarioActivo = quiz;
    indicePreguntaActual = 0;
    aciertosActuales = 0;
    showScreen('game-play-screen');
    presentarPregunta();
}

function presentarPregunta() {
    const dataPregunta = cuestionarioActivo.preguntas[indicePreguntaActual];
    document.getElementById('game-progress').textContent = `Pregunta ${indicePreguntaActual + 1} de ${cuestionarioActivo.preguntas.length}`;
    document.getElementById('game-question-text').textContent = dataPregunta.pregunta;

    const btnContainer = document.getElementById('game-options-container');
    btnContainer.innerHTML = "";

    const coloresKahoot = ["btn-red", "btn-blue", "btn-yellow", "btn-green"];
    const incisos = ["A", "B", "C", "D"];

    dataPregunta.opciones.forEach((opcion, i) => {
        const btn = document.createElement('button');
        btn.className = `kahoot-btn ${coloresKahoot[i]}`;
        btn.textContent = `${incisos[i]}) ${opcion}`;
        btn.onclick = () => evaluarRespuesta(incisos[i]);
        btnContainer.appendChild(btn);
    });
}

function evaluarRespuesta(seleccionado) {
    const correcta = cuestionarioActivo.preguntas[indicePreguntaActual].correcta;
    if(seleccionado === correcta) {
        aciertosActuales++;
        alert("¡Respuesta Correcta! 🟥 🟦 🟨 🟩");
    } else {
        alert(`Incorrecto. La respuesta correcta era la: ${correcta}`);
    }

    indicePreguntaActual++;
    if(indicePreguntaActual < cuestionarioActivo.preguntas.length) {
        presentarPregunta();
    } else {
        alert(`¡Fin del juego!\nPuntuación final: ${aciertosActuales} de ${cuestionarioActivo.preguntas.length}`);
        showScreen('main-menu');
    }
}

// Función para alternar entre modo claro y oscuro
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    const btn = document.getElementById('dark-mode-btn');
    
    // Comprobamos si se activó el modo oscuro
    if (body.classList.contains('dark-mode')) {
        btn.innerHTML = "☀️ Modo Claro";
        localStorage.setItem('theme', 'dark'); // Guarda la preferencia
    } else {
        btn.innerHTML = "🌙 Modo Oscuro";
        localStorage.setItem('theme', 'light'); // Guarda la preferencia
    }
}

// Al cargar la página, comprueba si el usuario ya tenía el modo oscuro activado
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('dark-mode-btn');
        if (btn) {
            btn.innerHTML = "☀️ Modo Claro";
        }
    }
});