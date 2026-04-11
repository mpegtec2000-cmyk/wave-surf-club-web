export const riders = [
  { id: 1, nombre: "TOMAS BOCK", estado: "DISPONIBLE", ocupado: true, slug: "tomas-bock", cover: "/riders/tomas-bock/tomi-2.png" },
  { id: 2, nombre: "PAULO MUÑOZ", estado: "DISPONIBLE", ocupado: true, slug: "paulo-munoz" },
  { id: 3, nombre: "ANGELO AVELLO", estado: "DISPONIBLE", ocupado: true, slug: "angelo-avello" },
  { id: 4, nombre: "CRISTOBAL LAZCANO", estado: "DISPONIBLE", ocupado: true, slug: "cristobal-lazcano" },
  { id: 5, nombre: "LUCA PENNA", estado: "DISPONIBLE", ocupado: true, slug: "luca-penna", cover: "/riders/luca-penna/2.jpg" },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 6,
    nombre: "VACÍO",
    estado: "DISPONIBLE",
    ocupado: false,
    slug: "disponible"
  }))
];
