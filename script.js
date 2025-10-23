// ======================
// VARIABLES GLOBALES
// ======================
let records = JSON.parse(localStorage.getItem('records') || '[]');
let currentSignatureTarget = null;
const enableDeleteButton = true;
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
function getSignatureData(id) {
  const canvasElement = document.getElementById(id);
  return canvasElement && canvasElement.tagName === 'CANVAS'
    ? canvasElement.toDataURL()
    : '';
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

      ['signaturePreviewEsp', 'signaturePreviewCus'].forEach(id => {
          const ctx = document.getElementById(id)?.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, 300, 150);
      });
  });

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
  };

  renderTable(); // Render inicial
}); // 👈 Aquí se cierra correctamente el DOMContentLoaded

// ======================
// FUNCIONES FUERA DEL DOM (no dependen del HTML cargado)
// ======================
function renderTable() {
  const head = document.getElementById('tableHead');
  const body = document.getElementById('tableBody');
  if (!head || !body) return;
  body.innerHTML = '';

  const columns = [
    'folio','OT','datetime','company','engineer','phone','city','description',
    'brand','model','serial','controlnum','status','ubication','temperature',
    'humidity','info_fail','if_not_work','part_change','act_work','ini_work',
    'fin_work','heat_from','heat_target','heat_test','hum_low','hum_high',
    'hum_test','temp_high','temp_low','cold_test','pulldown','notes',
    'name_esp','name_cus','signatureEsp','signatureCus'
  ];

  head.innerHTML = columns.map(c => `<th>${c.toUpperCase().replace(/_/g, ' ')}</th>`).join('');
  records.forEach(r => {
    const row = `<tr>${columns.map(c => `<td>${Array.isArray(r[c]) ? r[c].join('<br>') : r[c] || ''}</td>`).join('')}</tr>`;
    body.insertAdjacentHTML('beforeend', row);
  });
}
