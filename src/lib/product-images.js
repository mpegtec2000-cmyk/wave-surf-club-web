// Resolves a product image using the updated storefront catalog artwork
// under /public/TIENDA/actualizacion/ (and clean photo fallbacks for merch/other items).
export function resolveProductImage(prod) {
  if (prod?.imagen_url && String(prod.imagen_url).trim().length > 0) {
    return prod.imagen_url;
  }

  const name = String(prod?.nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const cat = String(
    prod?.categorias_tienda?.slug || prod?.categorias_tienda?.nombre || prod?.tipo || ''
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Exact product matches -> /TIENDA/actualizacion/
  if (name.includes('aleta')) {
    return '/TIENDA/actualizacion/Aletas%20azules%20sobre%20roca%20marina.png';
  }
  if (name.includes('equipo completo') && name.includes('bodyboard')) {
    return '/TIENDA/actualizacion/Equipo%20completo%20de%20bodyboard.png';
  }
  if (name.includes('equipo completo') && name.includes('surf')) {
    return '/TIENDA/actualizacion/Equipo%20completo%20de%20surf%20y%20olas.png';
  }
  if (name.includes('tabla') && (name.includes('bodyboard') || name.includes('skate'))) {
    return '/TIENDA/actualizacion/Arriendo%20de%20Tablas%20Wave%20Surf%20Club.png';
  }
  if (name.includes('traje') && (name.includes('tabla') || name.includes('full day'))) {
    return '/TIENDA/actualizacion/Equipo%20completo%20de%20surf%20y%20olas.png';
  }
  if (name.includes('traje')) {
    return '/TIENDA/actualizacion/Arriendo%20de%20trajes%20de%20surf.png';
  }
  if (name.includes('bodega') && (name.includes('15') || name.includes('quince'))) {
    return '/TIENDA/actualizacion/Bodega%20de%20tablas%2015%20d%C3%ADas.png';
  }
  if (name.includes('bodega') || cat.includes('bodega')) {
    return '/TIENDA/actualizacion/Bodega%20de%20tablas%20por%2030%20d%C3%ADas.png';
  }
  if (name.includes('pack 3') || name.includes('3 clases')) {
    return '/TIENDA/actualizacion/Pack%20de%203%20clases_%20Surf%2C%20Bodyboard%20y%20Skate.png';
  }
  if (name.includes('personalizada') || name.includes('individual')) {
    return '/TIENDA/actualizacion/Clase%20personalizada%20de%20surf.png';
  }
  if (name.includes('colectiva') || name.includes('grupal')) {
    return '/TIENDA/7.PNG';
  }
  if (name.includes('pack 5') || name.includes('5 clases')) {
    return '/TIENDA/actualizacion/Pack%205%20Clases%20Surf%20Skate.png';
  }
  if (name.includes('skate') || name.includes('mega ramp') || cat.includes('skate')) {
    return '/TIENDA/IMG_5779.jpeg';
  }
  if (name.includes('taller') || name.includes('repar') || name.includes('shaping') || cat.includes('taller')) {
    return '/Taller/2.jpg';
  }
  if (name.includes('clase') || cat.includes('clase')) {
    return '/TIENDA/actualizacion/Clase%20personalizada%20de%20surf.png';
  }
  if (name.includes('tabla') || cat.includes('arriendo')) {
    return '/TIENDA/actualizacion/Arriendo%20de%20Tablas%20Wave%20Surf%20Club.png';
  }
  if (name.includes('hoodie') || name.includes('poler') || cat.includes('ropa')) {
    return '/TIENDA/6.PNG';
  }

  return '/TIENDA/actualizacion/Equipo%20completo%20de%20surf%20y%20olas.png';
}
