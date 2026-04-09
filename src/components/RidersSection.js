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
<<<<<<< HEAD
          src="/FONDO-RAIDERS.jpg" 
=======
          src="/FONDO-RIDERS.png" 
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
          alt="Fondo Riders Wave Surf Club" 
          className="w-full h-full object-contain"
        />

        {/* Capa de Cuadros Interactivos (Grid invisible encima) */}
        <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] grid grid-cols-2 md:grid-cols-6 gap-2">
          {ridersData.map((rider) => {
            const isVacio = rider.name === "VACÍO";
            const formattedName = rider.name.split('').join(' ');
<<<<<<< HEAD
            const prefix = "R Y D E R";
=======
            const prefix = "R I D E R";
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
            
            return (
              <Link 
                key={rider.id} 
<<<<<<< HEAD
                href={!isVacio ? `/ryders/${rider.slug}` : "#"}
=======
                href={!isVacio ? `/riders/${rider.slug}` : "#"}
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
                className="group relative border border-transparent hover:border-blue-400 transition-all duration-300 overflow-hidden"
              >
                {/* Visualización del Nombre Estandarizado (Ejemplo solicitado) */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/90 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isVacio ? (
                    <>
                      <span className="text-[9px] font-black text-[#38bdf8] mb-1 tracking-[0.2em]">
                        {prefix}
                      </span>
                      <span className="text-[10px] font-black text-black tracking-[0.3em] text-center uppercase">
                        {formattedName}
                      </span>
                    </>
                  ) : (
                    <span className="text-[9px] font-black text-gray-400 tracking-[0.3em]">
                      D I S P O N I B L E
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .grid {
          padding: 2% 5%;
        }
      `}</style>
    </div>
  );
}
