import Image from 'next/image';
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
      <div className="relative w-full max-w-[1200px] aspect-[4/3] sm:aspect-video">
        <Image
          src="/rider fondo.jpg"
          alt="Fondo Riders Wave Surf Club"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-contain"
        />

        <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] grid grid-cols-2 md:grid-cols-6 gap-2 p-[2%_5%]">
          {ridersData.map((rider) => {
            const isVacio = rider.name === "VACÍO";
            const formattedName = rider.name.split('').join(' ');
            const prefix = "R I D E R";

            return (
              <Link
                key={rider.id}
                href={!isVacio ? `/riders/${rider.slug}` : "#"}
                className="group relative border border-transparent hover:border-white transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/95 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isVacio ? (
                    <>
                      <span className="text-[9px] font-black text-neutral-500 mb-1 tracking-[0.2em]">
                        {prefix}
                      </span>
                      <span className="text-[10px] font-black text-black tracking-[0.3em] text-center uppercase">
                        {formattedName}
                      </span>
                    </>
                  ) : (
                    <span className="text-[9px] font-black text-neutral-400 tracking-[0.3em]">
                      D I S P O N I B L E
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
