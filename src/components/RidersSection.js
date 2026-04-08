import Link from 'next/link';

const ridersData = [
  { id: 1, name: "TOMAS BOCK", slug: "tomas-bock" },
  { id: 2, name: "PAULO MUÑOZ", slug: "paulo-munoz" },
  { id: 3, name: "ANGELO AVELLO", slug: "angelo-avello" },
  { id: 4, name: "CRISTOBAL LAZCANO", slug: "cristobal-lazcano" },
  { id: 5, name: "VACÍO", slug: "disponible" },
  { id: 6, name: "VACÍO", slug: "disponible" },
  { id: 7, name: "VACÍO", slug: "disponible" },
  { id: 8, name: "VACÍO", slug: "disponible" },
  { id: 9, name: "VACÍO", slug: "disponible" },
  { id: 10, name: "VACÍO", slug: "disponible" },
  { id: 11, name: "VACÍO", slug: "disponible" },
  { id: 12, name: "VACÍO", slug: "disponible" },
  { id: 13, name: "VACÍO", slug: "disponible" },
  { id: 14, name: "VACÍO", slug: "disponible" },
];

export default function RidersSection() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start bg-black">
      
      {/* Contenedor de la Imagen y los Links */}
      <div className="relative w-full max-w-[1200px] aspect-[4/3] sm:aspect-video">
        
        {/* Imagen de Fondo desde tu carpeta public */}
        <img 
          src="/FONDO RAIDERS.jpg" 
          alt="Fondo Riders Wave Surf Club" 
          className="w-full h-full object-contain"
        />

        {/* Capa de Cuadros Interactivos (Grid invisible encima) */}
        <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] grid grid-cols-2 md:grid-cols-6 gap-2">
          {ridersData.map((rider) => (
            <Link 
              key={rider.id} 
              href={rider.name !== "VACÍO" ? `/riders/${rider.slug}` : "#"}
              className="group relative border border-transparent hover:border-blue-400 transition-all duration-300"
              title={rider.name}
            >
              {/* Overlay sutil al pasar el mouse */}
              <div className="w-full h-full bg-blue-500/0 group-hover:bg-blue-500/10 flex items-end justify-center pb-2">
                {rider.name !== "VACÍO" && (
                  <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 bg-black/50 px-2 rounded">
                    VER PERFIL
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Ajuste para que los cuadros calcen con la imagen */
        .grid {
          /* Estos valores los puedes ajustar si los cuadros no calzan exacto */
          padding: 2% 5%;
        }
      `}</style>
    </div>
  );
}
