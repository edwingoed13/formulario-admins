// Configuración
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVzZmxvcmVzQGNlcHJldW5hLmVkdS5wZSJ9.TJDxZrXcWCbPiVadus5RmBWVky6MmsYEl5cxs0VXUdU';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUKNXv3DtQ0stpavjB6MyWvVAGlWSxKgYvCnBc3lw9X3BgjuKjYDJMZDOWQqcK1jxqvw/exec';

// Variables para almacenar datos del RUC
let rucActivo = 'No';
let rucHabido = 'No';

// Objetos con las tallas por sexo
const tallas = {
    femenino: {
        casaca: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        pantalon: ['S', 'M(B)', 'L', 'XL', 'XXL', 'XXXL']
    },
    masculino: {
        casaca: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        pantalon: ['S', 'M(B)', 'L', 'XL', 'XXL', 'XXXL']
    }
};

// Función para actualizar las opciones de tallas según el sexo
function actualizarTallas() {
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value;
    const casacaSelect = document.getElementById('talla_casaca');
    const pantalonSelect = document.getElementById('talla_pantalon');
    const guiaFemenino = document.getElementById('guia-femenino');
    const guiaMasculino = document.getElementById('guia-masculino');

    // Limpiar selects
    casacaSelect.innerHTML = '<option value="">Seleccione su talla</option>';
    pantalonSelect.innerHTML = '<option value="">Seleccione su talla</option>';

    // Ocultar todas las guías
    guiaFemenino.style.display = 'none';
    guiaMasculino.style.display = 'none';

    if (sexo === 'F') {
        // Llenar opciones para femenino
        tallas.femenino.casaca.forEach(talla => {
            casacaSelect.innerHTML += `<option value="C-${talla}">${talla}</option>`;
        });
        tallas.femenino.pantalon.forEach(talla => {
            pantalonSelect.innerHTML += `<option value="P-${talla}">${talla}</option>`;
        });
        guiaFemenino.style.display = 'block';
    } else if (sexo === 'M') {
        // Llenar opciones para masculino
        tallas.masculino.casaca.forEach(talla => {
            casacaSelect.innerHTML += `<option value="C-${talla}">${talla}</option>`;
        });
        tallas.masculino.pantalon.forEach(talla => {
            pantalonSelect.innerHTML += `<option value="P-${talla}">${talla}</option>`;
        });
        guiaMasculino.style.display = 'block';
    }
}

// Agrega este event listener para los radio buttons de sexo
document.querySelectorAll('input[name="sexo"]').forEach(radio => {
    radio.addEventListener('change', actualizarTallas);
});

// También llama a la función al cargar la página si ya hay un sexo seleccionado
document.addEventListener('DOMContentLoaded', function() {
    const sexoSeleccionado = document.querySelector('input[name="sexo"]:checked');
    if (sexoSeleccionado) {
        actualizarTallas();
    }
});

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

// Variables globales para manejar actualización
let isUpdateMode = false;
let existingUserData = null;
let originalFormData = {}; // Para comparar cambios

// Validar DNI duplicado usando JSONP
function validarDNI(dni) {
    return new Promise((resolve) => {
        const statusElement = document.getElementById('dni-status');
        const errorElement = document.getElementById('dni-error');
        
        if (dni.length !== 8) {
            statusElement.textContent = '';
            isUpdateMode = false;
            existingUserData = null;
            resolve(true);
            return;
        }
        
        statusElement.textContent = 'Validando DNI...';
        statusElement.className = 'dni-status validando';
        
        // Crear callback único
        const callbackName = 'dniCallback' + Date.now();
        
        // Definir callback global
        window[callbackName] = function(result) {
            // Limpiar
            document.head.removeChild(script);
            delete window[callbackName];
            
            if (!result.success && result.error === 'DNI_ALREADY_EXISTS') {
                statusElement.innerHTML = `
                    <div>✏️ ${result.message}</div>
                    <div style="margin-top: 5px;">
                        <button id="btn-cargar-datos" onclick="cargarDatosExistentes()" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">
                            Cargar Datos
                        </button>
                        <button id="btn-nuevo-registro" onclick="limpiarFormulario()" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                            Nuevo Registro
                        </button>
                    </div>
                `;
                statusElement.className = 'dni-status duplicado';
                errorElement.textContent = `Registrado como: ${result.existingData.nombres} ${result.existingData.apellidos}`;
                
                // Guardar datos existentes
                existingUserData = result.existingData;
                resolve(false);
            } else if (result.success) {
                statusElement.textContent = '✅ DNI disponible';
                statusElement.className = 'dni-status disponible';
                errorElement.textContent = '';
                isUpdateMode = false;
                existingUserData = null;
                resolve(true);
            } else {
                statusElement.textContent = 'Error al validar DNI';
                statusElement.className = 'dni-status error';
                console.error('Error al validar DNI:', result);
                resolve(true);
            }
        };
        
        // Crear script tag para JSONP
        const script = document.createElement('script');
        script.src = `${SCRIPT_URL}?dni=${dni}&callback=${callbackName}`;
        script.onerror = function() {
            statusElement.textContent = 'Error al validar DNI';
            statusElement.className = 'dni-status error';
            document.head.removeChild(script);
            delete window[callbackName];
            resolve(true);
        };
        
        document.head.appendChild(script);
    });
}

// Cargar datos existentes en el formulario
function cargarDatosExistentes() {
    if (!existingUserData) return;
    
    const data = existingUserData;
    
    // Llenar campos básicos
    document.getElementById('nombres').value = data.nombres || '';
    document.getElementById('apellido_paterno').value = data.apellido_paterno || '';
    document.getElementById('apellido_materno').value = data.apellido_materno || '';
    
    // Seleccionar sexo
    const sexoRadio = document.querySelector(`input[name="sexo"][value="${data.sexo}"]`);
    if (sexoRadio) {
        sexoRadio.checked = true;
        actualizarTallas(); // Actualizar las opciones de tallas
    }
    
    // Otros campos (arreglar formato de fecha)
    if (data.fecha_nacimiento) {
        console.log('Fecha recibida:', data.fecha_nacimiento, typeof data.fecha_nacimiento);
        
        let fechaNacimiento = data.fecha_nacimiento;
        
        if (fechaNacimiento instanceof Date) {
            // Si es objeto Date
            fechaNacimiento = fechaNacimiento.toISOString().split('T')[0];
        } else if (typeof fechaNacimiento === 'string') {
            // Limpiar la fecha
            fechaNacimiento = fechaNacimiento.trim();
            
            if (fechaNacimiento.includes('/')) {
                // Formato DD/MM/YYYY a YYYY-MM-DD
                const partes = fechaNacimiento.split('/');
                if (partes.length === 3) {
                    fechaNacimiento = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
            } else if (fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Ya está en formato YYYY-MM-DD, no hacer nada
                fechaNacimiento = fechaNacimiento;
            } else if (fechaNacimiento.includes('T')) {
                // Formato ISO con tiempo, tomar solo la fecha
                fechaNacimiento = fechaNacimiento.split('T')[0];
            }
        }
        
        console.log('Fecha procesada:', fechaNacimiento);
        document.getElementById('fecha_nacimiento').value = fechaNacimiento;
    }
    document.getElementById('email').value = data.email || '';
    document.getElementById('celular').value = data.celular || '';
    document.getElementById('direccion').value = data.direccion || '';
    document.getElementById('ruc').value = data.ruc || '';
    
    // Campos laborales
    document.getElementById('sede').value = data.sede || '';
    document.getElementById('turno').value = data.turno || '';
    document.getElementById('area').value = data.area || '';
    document.getElementById('cargo').value = data.cargo || '';
    
    // Datos bancarios
    document.getElementById('banco').value = data.banco || '';
    document.getElementById('cci').value = data.cci || '';
    
    // Padre de familia
    const padreRadio = document.querySelector(`input[name="padre_familia"][value="${data.padre_familia}"]`);
    if (padreRadio) padreRadio.checked = true;
    
    // Actualizar variables de RUC si están disponibles
    if (data.ruc_activo) rucActivo = data.ruc_activo;
    if (data.ruc_habido) rucHabido = data.ruc_habido;
    
    // Tallas (después de actualizar las opciones)
    setTimeout(() => {
        document.getElementById('talla_casaca').value = data.talla_casaca || '';
        document.getElementById('talla_pantalon').value = data.talla_pantalon || '';
        console.log('Tallas cargadas:', {
            casaca: data.talla_casaca,
            pantalon: data.talla_pantalon
        });
        
        // IMPORTANTE: Guardar datos originales DESPUÉS de que todo esté cargado
        let fechaParaComparar = data.fecha_nacimiento;
        if (fechaParaComparar instanceof Date) {
            fechaParaComparar = fechaParaComparar.toISOString().split('T')[0];
        } else if (typeof fechaParaComparar === 'string') {
            fechaParaComparar = fechaParaComparar.trim();
            if (fechaParaComparar.includes('/')) {
                const partes = fechaParaComparar.split('/');
                if (partes.length === 3) {
                    fechaParaComparar = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
            } else if (fechaParaComparar.includes('T')) {
                fechaParaComparar = fechaParaComparar.split('T')[0];
            }
        }
        
        originalFormData = {
            nombres: data.nombres || '',
            apellido_paterno: data.apellido_paterno || '',
            apellido_materno: data.apellido_materno || '',
            sexo: data.sexo || '',
            fecha_nacimiento: fechaParaComparar || '',
            email: data.email || '',
            celular: data.celular || '',
            direccion: data.direccion || '',
            ruc: data.ruc || '',
            sede: data.sede || '',
            turno: data.turno || '',
            area: data.area || '',
            cargo: data.cargo || '',
            banco: data.banco || '',
            cci: data.cci || '',
            padre_familia: data.padre_familia || 'No',
            talla_casaca: data.talla_casaca || '',
            talla_pantalon: data.talla_pantalon || ''
        };
        
        console.log('Datos originales guardados:', originalFormData);
    }, 200); // Aumentar tiempo para asegurar que todo esté cargado
    
    // Cambiar a modo actualización
    isUpdateMode = true;
    
    // Actualizar el estado visual
    const statusElement = document.getElementById('dni-status');
    statusElement.innerHTML = '📝 Modo actualización - Puede modificar y enviar';
    statusElement.className = 'dni-status actualizando';
    
    // Cambiar texto del botón
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Actualizar Registro';
    
    // Actualizar texto de la foto para que sea opcional
    const fotoLabel = document.querySelector('label[for="foto"]');
    if (fotoLabel) {
        fotoLabel.innerHTML = `Foto personal para credencial <span style="color: #28a745; font-size: 12px;">(Opcional - Solo si desea cambiar la foto actual)</span>`;
    }
    
    // IMPORTANTE: Quitar el atributo required del campo foto
    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.removeAttribute('required');
        console.log('Campo foto marcado como opcional para actualización');
    }
    
    // Actualizar el texto del área de subida de archivo
    const fileUploadText = document.querySelector('.file-upload-btn p');
    if (fileUploadText) {
        fileUploadText.textContent = 'Haz clic solo si deseas cambiar tu foto';
    }
    
    // Actualizar el texto pequeño
    const fileUploadSmall = document.querySelector('.file-upload-btn small');
    if (fileUploadSmall) {
        fileUploadSmall.innerHTML = 'Opcional: JPG, PNG (Máx. 2MB)<br><em>Si no seleccionas nada, se mantendrá tu foto actual</em>';
    }
    
    mostrarMensaje('exito', 'Datos cargados correctamente. Puede modificar los campos y actualizar.');
}

// Limpiar formulario y salir del modo actualización
function limpiarFormulario() {
    document.getElementById('registroForm').reset();
    document.getElementById('preview').style.display = 'none';
    document.getElementById('ruc-info').style.display = 'none';
    document.getElementById('dni-status').textContent = '';
    document.getElementById('dni-status').className = 'dni-status';
    document.getElementById('dni-error').textContent = '';
    
    // Resetear variables
    isUpdateMode = false;
    existingUserData = null;
    rucActivo = 'No';
    rucHabido = 'No';
    
    // Restaurar texto del botón
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Enviar Formulario';
    
    // Restaurar textos originales de la foto y required
    const fotoLabel = document.querySelector('label[for="foto"]');
    if (fotoLabel) {
        fotoLabel.innerHTML = 'Foto personal para credencial <span class="required"></span>';
    }
    
    // IMPORTANTE: Restaurar el atributo required del campo foto
    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.setAttribute('required', '');
        console.log('Campo foto marcado como obligatorio para nuevo registro');
    }
    
    const fileUploadText = document.querySelector('.file-upload-btn p');
    if (fileUploadText) {
        fileUploadText.textContent = 'Haz clic para subir tu foto';
    }
    
    const fileUploadSmall = document.querySelector('.file-upload-btn small');
    if (fileUploadSmall) {
        fileUploadSmall.innerHTML = 'Formatos aceptados: JPG, PNG (Máx. 2MB)';
    }
    
    mostrarMensaje('exito', 'Formulario limpiado. Puede crear un nuevo registro.');
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
        
        // Con no-cors, asumimos que fue exitoso si no hubo error
        return { success: true };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// Manejador de envío del formulario
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 1. Mostrar confirmación si es modo actualización
    if (isUpdateMode) {
        const confirmacion = await showConfirmationModal();
        
        if (!confirmacion) {
            mostrarMensaje('info', 'Actualización cancelada. Puede revisar los datos antes de enviar.');
            return;
        }
    }
    
    // 2. Validaciones
    let isValid = true;
    
    // Validar DNI (8 dígitos)
    const dni = document.getElementById('dni');
    if (dni.value.length !== 8) {
        document.getElementById('dni-error').textContent = 'El DNI debe tener 8 dígitos';
        isValid = false;
    } else if (!isUpdateMode) {
        // Solo validar duplicados si NO estamos en modo actualización
        const dniDisponible = await validarDNI(dni.value);
        if (!dniDisponible) {
            mostrarMensaje('error', 'No se puede registrar: DNI ya existe en el sistema');
            isValid = false;
        }
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
    
    // Validar foto (obligatorio solo para nuevo registro)
    const fotoInput = document.getElementById('foto');
    if (!isUpdateMode && !fotoInput.files[0]) {
        mostrarMensaje('error', 'Por favor, seleccione una foto para el nuevo registro');
        isValid = false;
    } else if (isUpdateMode && fotoInput.files[0]) {
        // Mostrar mensaje informativo si está actualizando la foto
        console.log('Actualizando foto en modo edición');
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
            talla_casaca: document.getElementById('talla_casaca').value,
            talla_pantalon: document.getElementById('talla_pantalon').value,
            fotoBase64: imagenData?.base64 || '',
            fotoType: imagenData?.type || '',
            isUpdate: isUpdateMode // Flag para indicar si es actualización
        };

        console.log('Datos a enviar:', formData); // Para depuración
        
        // 3. Enviar datos
        const resultado = await enviarFormulario(formData);
        
        if (resultado.success) {
            const mensajeExito = isUpdateMode ? 'Datos actualizados exitosamente' : 'Registro completado exitosamente';
            mostrarMensaje('exito', mensajeExito);
            
            // Limpiar formulario después de éxito
            this.reset();
            document.getElementById('preview').style.display = 'none';
            document.getElementById('ruc-info').style.display = 'none';
            document.getElementById('dni-status').textContent = '';
            
            // Si estaba en modo actualización, volver a pantalla de verificación
            const wasUpdateMode = isUpdateMode;
            
            // Resetear variables de modo
            isUpdateMode = false;
            existingUserData = null;
            originalFormData = {};
            
            if (wasUpdateMode) {
                setTimeout(() => {
                    document.getElementById('dni-verification-screen').style.display = 'block';
                    document.getElementById('registroForm').style.display = 'none';
                }, 2000);
            }
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
    
    // Validar DNI duplicado cuando tenga 8 dígitos
    if (this.value.length === 8) {
        validarDNI(this.value);
    } else {
        document.getElementById('dni-status').textContent = '';
        document.getElementById('dni-status').className = 'dni-status';
    }
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

// ==================== FUNCIONES PARA DETECTAR CAMBIOS Y MODAL ====================

// Mapeo de nombres amigables para los campos
const fieldLabels = {
    nombres: 'Nombres',
    apellido_paterno: 'Apellido Paterno',
    apellido_materno: 'Apellido Materno',
    sexo: 'Sexo',
    fecha_nacimiento: 'Fecha de Nacimiento',
    email: 'Email',
    celular: 'Celular',
    direccion: 'Dirección',
    ruc: 'RUC',
    sede: 'Sede',
    turno: 'Turno',
    area: 'Área',
    cargo: 'Cargo',
    banco: 'Banco',
    cci: 'CCI',
    padre_familia: 'Padre de Familia',
    talla_casaca: 'Talla Casaca',
    talla_pantalon: 'Talla Pantalón'
};

// Función para obtener datos actuales del formulario
function getCurrentFormData() {
    return {
        nombres: document.getElementById('nombres').value,
        apellido_paterno: document.getElementById('apellido_paterno').value,
        apellido_materno: document.getElementById('apellido_materno').value,
        sexo: document.querySelector('input[name="sexo"]:checked')?.value || '',
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        email: document.getElementById('email').value,
        celular: document.getElementById('celular').value,
        direccion: document.getElementById('direccion').value,
        ruc: document.getElementById('ruc').value,
        sede: document.getElementById('sede').value,
        turno: document.getElementById('turno').value,
        area: document.getElementById('area').value,
        cargo: document.getElementById('cargo').value,
        banco: document.getElementById('banco').value,
        cci: document.getElementById('cci').value,
        padre_familia: document.querySelector('input[name="padre_familia"]:checked')?.value || 'No',
        talla_casaca: document.getElementById('talla_casaca').value,
        talla_pantalon: document.getElementById('talla_pantalon').value
    };
}

// Función para normalizar valores para comparación
function normalizeValue(value) {
    if (value === null || value === undefined) return '';
    return value.toString().trim();
}

// Función para detectar cambios
function detectChanges() {
    const currentData = getCurrentFormData();
    const changes = [];
    
    console.log('=== DETECCIÓN DE CAMBIOS ===');
    console.log('Datos originales:', originalFormData);
    console.log('Datos actuales:', currentData);
    
    for (const field in originalFormData) {
        const originalValue = normalizeValue(originalFormData[field]);
        const currentValue = normalizeValue(currentData[field]);
        
        console.log(`Campo ${field}:`);
        console.log(`  Original: "${originalValue}" (${typeof originalFormData[field]})`);
        console.log(`  Actual: "${currentValue}" (${typeof currentData[field]})`);
        console.log(`  ¿Son diferentes? ${originalValue !== currentValue}`);
        
        // Solo agregar si realmente son diferentes
        if (originalValue !== currentValue) {
            console.log(`✅ CAMBIO CONFIRMADO en ${field}`);
            changes.push({
                field: field,
                label: fieldLabels[field] || field,
                oldValue: originalValue,
                newValue: currentValue
            });
        } else {
            console.log(`❌ Sin cambio en ${field}`);
        }
    }
    
    console.log('=== RESUMEN DE CAMBIOS ===');
    console.log('Total de cambios detectados:', changes.length);
    changes.forEach((change, index) => {
        console.log(`${index + 1}. ${change.label}: "${change.oldValue}" → "${change.newValue}"`);
    });
    
    return changes;
}

// Función para mostrar el modal de confirmación
function showConfirmationModal() {
    return new Promise((resolve) => {
        const changes = detectChanges();
        const fotoInput = document.getElementById('foto');
        const hasNewPhoto = fotoInput.files[0];
        
        // Si hay foto nueva, agregar a los cambios
        if (hasNewPhoto) {
            changes.push({
                field: 'foto',
                label: 'Foto',
                oldValue: 'Foto actual',
                newValue: 'Nueva foto seleccionada'
            });
        }
        
        if (changes.length === 0) {
            mostrarMensaje('info', 'No se detectaron cambios en los datos');
            resolve(false);
            return;
        }
        
        // Llenar el modal con los cambios (filtrar cambios válidos)
        const validChanges = changes.filter(change => change.oldValue !== change.newValue);
        
        if (validChanges.length === 0) {
            mostrarMensaje('info', 'No se detectaron cambios válidos en los datos');
            resolve(false);
            return;
        }
        
        const changesList = document.getElementById('changes-list');
        changesList.innerHTML = validChanges.map(change => `
            <div class="change-item">
                <div class="field-name">${change.label}:</div>
                <div class="change-values">
                    <span class="old-value">${change.oldValue || 'Sin datos'}</span>
                    <span class="new-value">${change.newValue || 'Sin datos'}</span>
                </div>
            </div>
        `).join('');
        
        // Mostrar fecha original
        document.getElementById('original-date').textContent = 
            new Date(existingUserData.fechaRegistro).toLocaleDateString();
        
        // Mostrar modal
        document.getElementById('confirmation-modal').style.display = 'flex';
        
        // Event listeners
        document.getElementById('cancel-update').onclick = () => {
            document.getElementById('confirmation-modal').style.display = 'none';
            resolve(false);
        };
        
        document.getElementById('confirm-update').onclick = () => {
            document.getElementById('confirmation-modal').style.display = 'none';
            resolve(true);
        };
        
        // Cerrar con ESC
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.getElementById('confirmation-modal').style.display = 'none';
                document.removeEventListener('keydown', handleKeyPress);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    });
}

// ==================== FUNCIONALIDAD PANTALLA DE VERIFICACIÓN ====================

// Variables para la pantalla de verificación
let currentUserData = null;

// Función para verificar DNI en pantalla inicial
function verificarDNIInicial(dni) {
    return new Promise((resolve) => {
        const statusElement = document.getElementById('verification-status');
        
        if (dni.length !== 8) {
            statusElement.innerHTML = '<div style="color: #e74c3c;">El DNI debe tener 8 dígitos</div>';
            resolve(null);
            return;
        }
        
        statusElement.innerHTML = '<div style="color: #3498db;">🔍 Verificando DNI...</div>';
        
        // Crear callback único
        const callbackName = 'verifyCallback' + Date.now();
        
        // Definir callback global
        window[callbackName] = function(result) {
            // Limpiar
            document.head.removeChild(script);
            delete window[callbackName];
            
            statusElement.innerHTML = '';
            resolve(result);
        };
        
        // Crear script tag para JSONP
        const script = document.createElement('script');
        script.src = `${SCRIPT_URL}?dni=${dni}&callback=${callbackName}`;
        script.onerror = function() {
            statusElement.innerHTML = '<div style="color: #e74c3c;">Error al verificar DNI</div>';
            document.head.removeChild(script);
            delete window[callbackName];
            resolve(null);
        };
        
        document.head.appendChild(script);
    });
}

// Función para mostrar información del usuario existente
function mostrarUsuarioExistente(userData) {
    currentUserData = userData;
    const userDetails = document.getElementById('user-details');
    const userPhoto = document.getElementById('existing-photo');
    
    // Limpiar placeholders y botones anteriores
    const existingPlaceholders = document.querySelectorAll('.photo-placeholder, .photo-button');
    existingPlaceholders.forEach(element => element.remove());
    
    userDetails.innerHTML = `
        <div><strong>Nombre:</strong> ${userData.nombres}</div>
        <div><strong>Apellidos:</strong> ${userData.apellido_paterno} ${userData.apellido_materno}</div>
        <div><strong>DNI:</strong> ${userData.dni}</div>
        <div><strong>Email:</strong> ${userData.email || 'No registrado'}</div>
        <div><strong>Celular:</strong> ${userData.celular || 'No registrado'}</div>
        <div><strong>Fecha de Registro:</strong> ${new Date(userData.fechaRegistro).toLocaleDateString()}</div>
    `;
    
    // Mostrar foto si existe
    if (userData.fotoUrl && userData.fotoUrl.trim() !== '') {
        // Para Google Drive, mostrar un botón elegante en lugar de intentar cargar la imagen
        if (userData.fotoUrl.includes('drive.google.com')) {
            userPhoto.style.display = 'none';
            
            // Crear botón elegante para ver foto
            const photoButton = document.createElement('div');
            photoButton.className = 'photo-button';
            photoButton.innerHTML = `
                <div class="photo-icon">📷</div>
                <div class="photo-text">
                    <strong>Foto Registrada</strong><br>
                    <small>Click para visualizar</small>
                </div>
            `;
            photoButton.style.cssText = `
                width: 150px; 
                height: 150px; 
                border: 2px solid #007bff; 
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                color: #007bff; 
                border-radius: 8px;
                background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
                text-align: center;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,123,255,0.1);
                margin: 15px auto;
            `;
            
            // Efectos hover
            photoButton.onmouseover = function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 4px 8px rgba(0,123,255,0.2)';
                this.style.borderColor = '#0056b3';
            };
            
            photoButton.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 2px 4px rgba(0,123,255,0.1)';
                this.style.borderColor = '#007bff';
            };
            
            photoButton.onclick = function() {
                window.open(userData.fotoUrl, '_blank');
            };
            
            // Agregar estilos específicos para los elementos internos
            const icon = photoButton.querySelector('.photo-icon');
            icon.style.cssText = 'font-size: 40px; margin-bottom: 5px;';
            
            const text = photoButton.querySelector('.photo-text');
            text.style.cssText = 'line-height: 1.2;';
            
            document.querySelector('.user-photo').appendChild(photoButton);
            
        } else {
            // Para otras URLs, intentar mostrar la imagen normalmente
            userPhoto.onload = function() {
                console.log('Foto cargada correctamente:', userData.fotoUrl);
                this.style.display = 'block';
            };
            
            userPhoto.onerror = function() {
                console.warn('No se pudo cargar la imagen:', userData.fotoUrl);
                this.style.display = 'none';
                
                const placeholder = document.createElement('div');
                placeholder.className = 'photo-placeholder';
                placeholder.innerHTML = '📷 Foto no disponible<br><small>Click para ver enlace</small>';
                placeholder.style.cssText = `
                    width: 150px; 
                    height: 150px; 
                    border: 2px dashed #ddd; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #666; 
                    border-radius: 8px;
                    background: #f8f9fa;
                    text-align: center;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 15px auto;
                `;
                placeholder.onclick = function() {
                    window.open(userData.fotoUrl, '_blank');
                };
                this.parentNode.appendChild(placeholder);
            };
            
            userPhoto.src = userData.fotoUrl;
        }
        
    } else {
        userPhoto.style.display = 'none';
        
        // Mostrar placeholder si no hay foto
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-placeholder';
        placeholder.innerHTML = '📷 Sin foto registrada';
        placeholder.style.cssText = `
            width: 150px; 
            height: 150px; 
            border: 2px dashed #ddd; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: #666; 
            border-radius: 8px;
            background: #f8f9fa;
            margin: 15px auto;
        `;
        document.querySelector('.user-photo').appendChild(placeholder);
    }
    
    document.getElementById('verification-result').style.display = 'block';
    document.getElementById('new-user-result').style.display = 'none';
}

// Función para mostrar usuario nuevo
function mostrarUsuarioNuevo() {
    currentUserData = null;
    document.getElementById('verification-result').style.display = 'none';
    document.getElementById('new-user-result').style.display = 'block';
}

// Event listeners para la pantalla de verificación

// Validar solo números en input de verificación
document.getElementById('dni-verificacion').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 8) {
        this.value = this.value.slice(0, 8);
    }
});

// Verificar DNI al presionar Enter
document.getElementById('dni-verificacion').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('btn-verificar-dni').click();
    }
});

// Botón verificar DNI
document.getElementById('btn-verificar-dni').addEventListener('click', async function() {
    const dni = document.getElementById('dni-verificacion').value;
    
    if (dni.length !== 8) {
        document.getElementById('verification-status').innerHTML = '<div style="color: #e74c3c;">Por favor ingrese 8 dígitos</div>';
        return;
    }
    
    const result = await verificarDNIInicial(dni);
    
    if (result && !result.success && result.error === 'DNI_ALREADY_EXISTS') {
        mostrarUsuarioExistente(result.existingData);
    } else if (result && result.success) {
        mostrarUsuarioNuevo();
    } else {
        document.getElementById('verification-status').innerHTML = '<div style="color: #e74c3c;">Error al verificar DNI</div>';
    }
});

// Botón actualizar datos
document.getElementById('btn-actualizar-datos').addEventListener('click', function() {
    if (!currentUserData) return;
    
    // Cambiar a modo actualización
    isUpdateMode = true;
    existingUserData = currentUserData;
    
    // Mostrar formulario
    document.getElementById('dni-verification-screen').style.display = 'none';
    document.getElementById('registroForm').style.display = 'block';
    
    // Prellenar DNI
    document.getElementById('dni').value = currentUserData.dni;
    
    // Cargar todos los datos
    cargarDatosExistentes();
    
    mostrarMensaje('exito', 'Datos cargados. Puede modificar los campos necesarios.');
});

// Botón ver datos (solo lectura)
document.getElementById('btn-ver-datos').addEventListener('click', function() {
    if (!currentUserData) return;
    
    // Cambiar a modo solo lectura
    isUpdateMode = false;
    existingUserData = currentUserData;
    
    // Mostrar formulario
    document.getElementById('dni-verification-screen').style.display = 'none';
    document.getElementById('registroForm').style.display = 'block';
    
    // Prellenar DNI
    document.getElementById('dni').value = currentUserData.dni;
    
    // Cargar todos los datos
    cargarDatosExistentes();
    
    // Deshabilitar todos los campos
    const inputs = document.querySelectorAll('#registroForm input, #registroForm select, #registroForm textarea');
    inputs.forEach(input => input.disabled = true);
    
    // Ocultar botón de envío
    document.querySelector('button[type="submit"]').style.display = 'none';
    
    mostrarMensaje('exito', 'Datos cargados en modo solo lectura.');
});

// Botón nuevo registro
document.getElementById('btn-nuevo-registro').addEventListener('click', function() {
    // Cambiar a modo registro nuevo
    isUpdateMode = false;
    existingUserData = null;
    currentUserData = null;
    
    // Mostrar formulario vacío
    document.getElementById('dni-verification-screen').style.display = 'none';
    document.getElementById('registroForm').style.display = 'block';
    
    // Prellenar el DNI verificado
    document.getElementById('dni').value = document.getElementById('dni-verificacion').value;
    
    // Asegurar que la foto sea obligatoria para nuevo registro
    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.setAttribute('required', '');
    }
    
    mostrarMensaje('exito', 'Puede proceder con el registro de nuevo usuario.');
});

// Botón volver a verificación
document.getElementById('btn-volver-verificacion').addEventListener('click', function() {
    // Limpiar formulario
    document.getElementById('registroForm').reset();
    document.getElementById('preview').style.display = 'none';
    document.getElementById('ruc-info').style.display = 'none';
    document.getElementById('dni-status').textContent = '';
    document.getElementById('dni-error').textContent = '';
    
    // Habilitar todos los campos
    const inputs = document.querySelectorAll('#registroForm input, #registroForm select, #registroForm textarea');
    inputs.forEach(input => input.disabled = false);
    
    // Mostrar botón de envío
    document.querySelector('button[type="submit"]').style.display = 'inline-block';
    
    // Resetear variables
    isUpdateMode = false;
    existingUserData = null;
    currentUserData = null;
    rucActivo = 'No';
    rucHabido = 'No';
    
    // Limpiar pantalla de verificación
    document.getElementById('dni-verificacion').value = '';
    document.getElementById('verification-status').innerHTML = '';
    document.getElementById('verification-result').style.display = 'none';
    document.getElementById('new-user-result').style.display = 'none';
    
    // Limpiar elementos de foto
    const photoElements = document.querySelectorAll('.photo-placeholder, .photo-button');
    photoElements.forEach(element => element.remove());
    
    // Mostrar pantalla de verificación
    document.getElementById('dni-verification-screen').style.display = 'block';
    document.getElementById('registroForm').style.display = 'none';
    
    // Restaurar texto del botón
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Enviar Formulario';
    
    // Restaurar textos originales de la foto y required
    const fotoLabel = document.querySelector('label[for="foto"]');
    if (fotoLabel) {
        fotoLabel.innerHTML = 'Foto personal para credencial <span class="required"></span>';
    }
    
    // IMPORTANTE: Restaurar el atributo required del campo foto
    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.setAttribute('required', '');
        console.log('Campo foto marcado como obligatorio para nuevo registro');
    }
    
    const fileUploadText = document.querySelector('.file-upload-btn p');
    if (fileUploadText) {
        fileUploadText.textContent = 'Haz clic para subir tu foto';
    }
    
    const fileUploadSmall = document.querySelector('.file-upload-btn small');
    if (fileUploadSmall) {
        fileUploadSmall.innerHTML = 'Formatos aceptados: JPG, PNG (Máx. 2MB)';
    }
});
