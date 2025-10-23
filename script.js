// ======================
// VARIABLES GLOBALES
// ======================
let records = JSON.parse(localStorage.getItem('records') || '[]');
let currentSignatureTarget = null; // 'esp' o 'cus'
const enableDeleteButton = true;   // true = activo, false = desactivado
const storageKey = 'records';

// ======================
// AUXILIARES
// ======================
function get(id) { 
    const el = document.getElementById(id);
    return el ? el.value.trim() : ''; 
}
function chk(id) { 
    const el = document.getElementById(id);
    return el && el.checked ? 'Sí' : 'No'; 
}

// Función segura para obtener dataURL de un canvas
function getSignatureData(id) {
    const canvasElement = document.getElementById(id);
    if (canvasElement && canvasElement.tagName === 'CANVAS') {
        return canvasElement.toDataURL();
    }
    return ''; // Devuelve vacío si no existe
}

// ======================
// FOLIO AUTOMÁTICO
// ======================
function generateFolio() {
    const company = get('company') || 'SinEmpresa';
    const now = new Date();
    const y = now.getFullYear(),
          m = String(now.getMonth() + 1).padStart(2, '0'),
          d = String(now.getDate()).padStart(2, '0'),
          h = String(now.getHours()).padStart(2, '0'),
          min = String(now.getMinutes()).padStart(2, '0');
    return `MC_Report-${company}-${y}${m}${d}-${h}${min}`;
}

// ======================
// GUARDAR REGISTRO
// ======================
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('saveBtn').addEventListener('click', () => {
    const record = {
        folio: generateFolio(),
        OT: get('OT'),
        datetime: get('datetime'),
        company: get('company'),
        engineer: get('engineer'),
        phone: get('phone'),
        city: get('city'),
        description: get('description'),
        brand: get('brand'),
        model: get('model'),
        serial: get('serial'),
        controlnum: get('controlnum'),
        status: get('status'),
        ubication: get('ubication'),
        temperature: get('temperature'),
        humidity: get('humidity'),
        info_fail: get('info_fail'),
        if_not_work: get('if_not_work'),
        part_change: get('part_change'),
        act_work: get('act_work'),
        ini_work: get('ini_work'),
        fin_work: get('fin_work'),
        heat_from: get('heat_from'),
        heat_target: get('heat_target'),
        heat_test: chk('heat_test'),
        hum_low: get('hum_low'),
        hum_high: get('hum_high'),
        hum_test: chk('hum_test'),
        temp_high: get('temp_high'),
        temp_low: get('temp_low'),
        cold_test: chk('cold_test'),
        pulldown: get('pulldown'),
        notes: get('notes'),
        name_esp: get('name_esp'),
        name_cus: get('name_cus'),
        signatureEsp: getSignatureData('signaturePreviewEsp'),
        signatureCus: getSignatureData('signaturePreviewCus'),
    };
    records.push(record);
    localStorage.setItem(storageKey, JSON.stringify(records));
    renderTable();
    alert('✅ Registro guardado correctamente');
});

// ======================
// LIMPIAR FORMULARIO
// ======================
document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('reportForm').reset();

    // Limpiar canvas de firmas de forma segura
    ['signaturePreviewEsp', 'signaturePreviewCus'].forEach(id => {
        const ctx = document.getElementById(id)?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, 300, 150);
    });
});

// ======================
// RENDER TABLA
// ======================
function renderTable() {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    body.innerHTML = '';

const columns = [
    'folio',
    'OT',
    'datetime',
    'company',
    'engineer',
    'phone',
    'city',
    'description',
    'brand',
    'model',
    'serial',
    'controlnum',
    'status',
    'ubication',
    'temperature',
    'humidity',
    'info_fail',
    'if_not_work',
    'part_change',
    'act_work',
    'ini_work',
    'fin_work',
    'heat_from',
    'heat_target',
    'heat_test',
    'hum_low',
    'hum_high',
    'hum_test',
    'temp_high',
    'temp_low',
    'cold_test',
    'pulldown',
    'notes',
    'name_esp',
    'name_cus',
    'signatureEsp',
    'signatureCus'
];
    head.innerHTML = columns.map(c => `<th>${c.toUpperCase().replace(/_/g, ' ')}</th>`).join('');

    records.forEach(r => {
        const row = `<tr>${columns.map(c => {
            let data = r[c] || '';
            if (Array.isArray(data)) data = data.filter(v => v).join('<br>');
            return `<td>${data}</td>`;
        }).join('')}</tr>`;
        body.insertAdjacentHTML('beforeend', row);
    });
}

renderTable();

// ======================
// EXPORTAR EXCEL
// ======================
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!records.length) return alert('No hay registros para exportar.');
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
    XLSX.writeFile(wb, 'Registro_de_arranques.xlsx');
});

// ======================
// BORRAR REGISTROS
// ======================
const deleteBtn = document.getElementById('deleteAllBtn');
deleteBtn.style.display = enableDeleteButton ? 'inline-block' : 'none';
deleteBtn.onclick = () => {
    if (!enableDeleteButton) return;
    if (confirm('¿Borrar todos los registros guardados?')) {
        localStorage.removeItem(storageKey);
        records = [];
        renderTable();
    }
}

// ======================
// FIRMA
// ======================
const modal = document.getElementById('signatureModal');
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

function openSignature(target){
    currentSignatureTarget = target;
    modal.classList.add('active');
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

document.getElementById('openSignatureEsp').addEventListener('click',()=>openSignature('esp'));
document.getElementById('openSignatureCus').addEventListener('click',()=>openSignature('cus'));

document.getElementById('closeSignature').addEventListener('click',()=>modal.classList.remove('active'));
document.getElementById('clearSignature').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));
document.getElementById('saveSignature').addEventListener('click',()=>{
    const dataURL = canvas.toDataURL();
    let preview = currentSignatureTarget==='esp'?document.getElementById('signaturePreviewEsp'):document.getElementById('signaturePreviewCus');
    // Se agrega una verificación si 'preview' existe antes de obtener el contexto
    if (!preview) {
        console.error("No se encontró el canvas de vista previa para la firma.");
        modal.classList.remove('active');
        return;
    }
    
    const pctx = preview.getContext('2d');
    const img = new Image();
    img.onload = ()=>{pctx.clearRect(0,0,300,150); pctx.drawImage(img,0,0,300,150)};
    img.src = dataURL;
    modal.classList.remove('active');
});

// ======================
// DIBUJO CANVAS
// ======================
const getTouchPos = (canvasDom, touchEvent) => {
    const rect = canvasDom.getBoundingClientRect();
    // Obtiene la posición del primer toque (touch) y ajusta por el scroll y la posición del canvas
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
};

// Eventos del Mouse
canvas.addEventListener('mousedown', e => {
    e.preventDefault();
    drawing = true; 
    ctx.beginPath(); 
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mouseup', () => { drawing = false; });
canvas.addEventListener('mouseout', () => { drawing = false; });
canvas.addEventListener('mousemove', e => {
    if (!drawing) return; 
    ctx.lineWidth = 2; 
    ctx.lineCap = 'round'; 
    ctx.strokeStyle = '#000'; 
    ctx.lineTo(e.offsetX, e.offsetY); 
    ctx.stroke();
});

// Eventos Táctiles (para móviles)
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    drawing = true;
    const touch = getTouchPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(touch.x, touch.y);
}, false);

canvas.addEventListener('touchend', () => { drawing = false; });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!drawing) return;
    const touch = getTouchPos(canvas, e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(touch.x, touch.y);
    ctx.stroke();
}, false);
const seccion = document.getElementById('section-headerx');

if (seccion) {
  // Para ocultarla
  seccion.style.display = 'none';
  
  // Para volver a mostrarla más tarde (por ejemplo, al hacer clic en un botón)
  // seccion.style.display = 'block'; 
}
// Sección de semáforos
function setEstado(num, color) {
  const colores = ['roja', 'amarilla', 'verde'];
  colores.forEach(c => {
    document.getElementById(c + num).classList.remove('activa');
  });
  document.getElementById(color + num).classList.add('activa');
}
