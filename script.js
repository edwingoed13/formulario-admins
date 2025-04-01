// Configuración
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVzZmxvcmVzQGNlcHJldW5hLmVkdS5wZSJ9.TJDxZrXcWCbPiVadus5RmBWVky6MmsYEl5cxs0VXUdU';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwbnXm6gTCNPC0HooSjYwwrpIL1npAG19wVwXSxv-5EXyokBB_uiRtXZR9M_R1w1cQg8g/exec';

// Variables para almacenar datos del RUC
let rucActivo = 'No';
let rucHabido = 'No';

// Función para mostrar mensajes en el frontend
function mostrarMensaje(tipo, mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-flotante';
    mensajeDiv.className = `mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.bottom = '20px';
    mensajeDiv.style.right = '20px';
    mensajeDiv.style.padding = '15px 20px';
    mensajeDiv.style.borderRadius = '5px';
    mensajeDiv.style.color = 'white';
    mensajeDiv.style.fontWeight = 'bold';
    mensajeDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    mensajeDiv.style.zIndex = '1000';
    mensajeDiv.style.animation = 'fadeIn 0.5s';
    
    if (tipo === 'exito') {
        mensajeDiv.style.backgroundColor = '#4CAF50';
    } else {
        mensajeDiv.style.backgroundColor = '#F44336';
    }
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            document.body.removeChild(mensajeDiv);
        }, 500);
    }, 5000);
}

// Agrega estilos al head del documento
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(style);

// Vista previa de la imagen
function previewImage(input) {
    const preview = document.getElementById('preview');
    const file = input.files[0];
    
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            mostrarMensaje('error', 'La imagen es demasiado grande (máximo 2MB)');
            input.value = '';
            preview.style.display = 'none';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
}

// Convertir imagen a Base64
async function procesarImagen(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve(null);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            base64: reader.result,
            type: file.type
        });
        reader.onerror = error => reject(error);
    });
}

// Validar que solo se ingresen números
function validarSoloNumeros(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

// Validar longitud de campo
function validarLongitud(input, longitud) {
    const errorElement = document.getElementById(`${input.id}-error`);
    
    if (input.value.length > longitud) {
        input.value = input.value.slice(0, longitud);
    }
    
    if (input.value.length !== longitud && input.value.length > 0) {
        errorElement.textContent = `Debe tener exactamente ${longitud} dígitos`;
    } else {
        errorElement.textContent = '';
    }
}

// Consultar API de RUC
async function consultarRUC(ruc) {
    const loadingElement = document.getElementById('ruc-loading');
    const errorElement = document.getElementById('ruc-error');
    const infoElement = document.getElementById('ruc-info');
    const activoElement = document.getElementById('ruc-activo');
    const habidoElement = document.getElementById('ruc-habido');
    
    loadingElement.style.display = 'block';
    errorElement.textContent = '';
    infoElement.style.display = 'none';
    
    try {
        const response = await fetch(`https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${API_TOKEN}`);
        const data = await response.json();
        
        if (data.razonSocial) {
            rucActivo = data.estado === 'ACTIVO' ? 'Si' : 'No';
            rucHabido = data.condicion === 'HABIDO' ? 'Si' : 'No';
            
            infoElement.style.display = 'block';
            activoElement.innerHTML = `<strong>Activo:</strong> ${rucActivo}`;
            habidoElement.innerHTML = `<strong>Habido:</strong> ${rucHabido}`;
        } else {
            errorElement.textContent = 'No se encontraron datos para este RUC';
        }
    } catch (error) {
        errorElement.textContent = 'Error al consultar el RUC. Intente nuevamente.';
        console.error('Error al consultar RUC:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Enviar datos al servidor
async function enviarFormulario(formData) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// Manejador de envío del formulario
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 1. Validaciones
    let isValid = true;
    
    // Validar DNI (8 dígitos)
    const dni = document.getElementById('dni');
    if (dni.value.length !== 8) {
        document.getElementById('dni-error').textContent = 'El DNI debe tener 8 dígitos';
        isValid = false;
    }
    
    // Validar celular (9 dígitos)
    const celular = document.getElementById('celular');
    if (celular.value.length !== 9) {
        document.getElementById('celular-error').textContent = 'El celular debe tener 9 dígitos';
        isValid = false;
    }
    
    // Validar RUC (11 dígitos)
    const ruc = document.getElementById('ruc');
    if (ruc.value.length !== 11) {
        document.getElementById('ruc-error').textContent = 'El RUC debe tener 11 dígitos';
        isValid = false;
    }
    
    // Validar CCI (20 dígitos)
    const cci = document.getElementById('cci');
    if (cci.value.length !== 20) {
        document.getElementById('cci-error').textContent = 'El CCI debe tener 20 dígitos';
        isValid = false;
    }
    
    // Validar cargo (obligatorio)
    const cargo = document.getElementById('cargo').value;
    if (!cargo || cargo.trim() === '') {
        mostrarMensaje('error', 'Por favor, ingrese su cargo');
        isValid = false;
    }
    
    // Validar foto (obligatorio)
    const fotoInput = document.getElementById('foto');
    if (!fotoInput.files[0]) {
        mostrarMensaje('error', 'Por favor, seleccione una foto');
        isValid = false;
    }
    
    if (!isValid) return;

    // 2. Preparar envío
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        // Procesar imagen
        const imagenData = await procesarImagen(fotoInput.files[0]);
        
        // Construir objeto con TODOS los campos
        const formData = {
            nombres: document.getElementById('nombres').value,
            apellido_paterno: document.getElementById('apellido_paterno').value,
            apellido_materno: document.getElementById('apellido_materno').value,
            sexo: document.querySelector('input[name="sexo"]:checked')?.value || '',
            dni: dni.value,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            email: document.getElementById('email').value,
            celular: celular.value,
            direccion: document.getElementById('direccion').value,
            ruc: ruc.value,
            ruc_activo: rucActivo,
            ruc_habido: rucHabido,
            sede: document.getElementById('sede').value || '', // Campo de texto
            turno: document.getElementById('turno').value || '', // Campo de texto
            area: document.getElementById('area').value || '', // Campo de texto
            cargo: cargo,
            banco: document.getElementById('banco').value,
            cci: cci.value,
            padre_familia: document.querySelector('input[name="padre_familia"]:checked')?.value || 'No',
            talla_vestimenta: document.getElementById('talla_vestimenta').value,
            fotoBase64: imagenData?.base64 || '',
            fotoType: imagenData?.type || ''
        };

        console.log('Datos a enviar:', formData); // Para depuración
        
        // 3. Enviar datos
        const resultado = await enviarFormulario(formData);
        
        if (resultado.success) {
            mostrarMensaje('exito', 'Registro completado exitosamente');
            this.reset();
            document.getElementById('preview').style.display = 'none';
            document.getElementById('ruc-info').style.display = 'none';
        } else {
            throw new Error(resultado.error || 'Error al enviar el formulario');
        }
    } catch (error) {
        console.error('Error en el envío:', error);
        mostrarMensaje('error', 'Error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Formulario';
    }
});

// Event listeners para los campos de entrada
document.getElementById('dni').addEventListener('input', function() {
    validarSoloNumeros(this);
    validarLongitud(this, 8);
});

document.getElementById('celular').addEventListener('input', function() {
    validarSoloNumeros(this);
    validarLongitud(this, 9);
});

document.getElementById('ruc').addEventListener('input', function() {
    validarSoloNumeros(this);
    validarLongitud(this, 11);
    if (this.value.length === 11) consultarRUC(this.value);
});

document.getElementById('cci').addEventListener('input', function() {
    validarSoloNumeros(this);
    validarLongitud(this, 20);
});

document.getElementById('foto').addEventListener('change', function() {
    previewImage(this);
});