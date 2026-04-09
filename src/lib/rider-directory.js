export const riders = [
  { id: 1, nombre: "TOMAS BOCK", estado: "DISPONIBLE", ocupado: true, slug: "tomas-bock" },
  { id: 2, nombre: "PAULO MUÑOZ", estado: "DISPONIBLE", ocupado: true, slug: "paulo-munoz" },
  { id: 3, nombre: "ANGELO AVELLO", estado: "DISPONIBLE", ocupado: true, slug: "angelo-avello" },
  { id: 4, nombre: "CRISTOBAL LAZCANO", estado: "DISPONIBLE", ocupado: true, slug: "cristobal-lazcano" },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 5,
    nombre: "VACÍO",
    estado: "DISPONIBLE",
    ocupado: false,
    slug: "disponible"
  }))
];
