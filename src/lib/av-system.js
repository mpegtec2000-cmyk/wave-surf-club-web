// =============================================
// WAVE SURF CLUB — AV Health System
// =============================================

import { AV_LEVELS } from './constants';

export function calculateAV(entryDate) {
  const now = new Date();
  const entry = new Date(entryDate);
  const diffMs = now - entry;
  const months = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  let avData;
  if (months < 3) avData = AV_LEVELS.AV1;
  else if (months < 6) avData = AV_LEVELS.AV2;
  else if (months < 9) avData = AV_LEVELS.AV3;
  else avData = AV_LEVELS.URGENTE;

  return { ...avData, months: Math.floor(months) };
}

export function filterInventoryByRole(items, role) {
  return items
    .map(item => ({ ...item, av: calculateAV(item.entry_date) }))
    .filter(item => {
      if (role === 'asistente') {
        return item.av.level === 'AV1' || item.av.level === 'AV2';
      }
      return true;
    });
}

export function canRentItem(item) {
  const av = item.av || calculateAV(item.entry_date);
  if (av.level === 'URGENTE') {
    return { allowed: false, reason: `⚠️ Ítem ${item.item_code} VENCIDO (${av.months} meses). Arriendo bloqueado.` };
  }
  if (item.is_rented) {
    return { allowed: false, reason: `Ítem ${item.item_code} ya está arrendado.` };
  }
  return { allowed: true, reason: '' };
}
