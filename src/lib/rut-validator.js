// =============================================
// WAVE SURF CLUB — Chilean RUT Validator
// =============================================

export function cleanRut(rut) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(rut) {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let formatted = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count % 3 === 0 && i > 0) formatted = '.' + formatted;
  }
  return `${formatted}-${dv}`;
}

function calculateDV(rutBody) {
  const digits = rutBody.split('').reverse().map(Number);
  const multipliers = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * multipliers[i % multipliers.length];
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export function validateRut(rut) {
  if (!rut || rut.trim() === '') {
    return { valid: false, formatted: '', error: 'RUT es requerido' };
  }
  const clean = cleanRut(rut);
  if (clean.length < 2) {
    return { valid: false, formatted: '', error: 'RUT demasiado corto' };
  }
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) {
    return { valid: false, formatted: '', error: 'RUT contiene caracteres inválidos' };
  }
  const expectedDV = calculateDV(body);
  if (dv !== expectedDV) {
    return { valid: false, formatted: formatRut(clean), error: 'Dígito verificador inválido' };
  }
  return { valid: true, formatted: formatRut(clean), error: '' };
}
