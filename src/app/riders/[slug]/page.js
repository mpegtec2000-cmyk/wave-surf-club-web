'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const RIDERS_DATA = {
  'tomas-bock': {
    name: 'Tomas Bock',
    role: 'PRO RIDER',
    title: 'TOMAS BOCK',
    cover: '/riders/tomas-bock/tomi-2.png',
    bio: `
      <p>Originario de Reñaca, Tomás es actualmente uno de los "Riders" más influyentes y talentosos del surf chileno. Desde sus inicios en el Quinto Sector, demostró un estilo explosivo y una lectura de ola superior, lo que lo llevó rápidamente a dominar el circuito nacional juvenil y a convertirse en una pieza clave de la Selección Chilena de Surf.</p>
      <p><strong>Hitos y Carrera</strong><br/>
      <strong>Trayectoria Internacional:</strong> Competidor constante en los Qualifying Series (QS) de la World Surf League (WSL), llevando la bandera chilena a los escenarios más exigentes del mundo.</p>
      <p><strong>Especialidad:</strong> Destaca por su surfing progresivo, con un dominio excepcional de los aéreos y maniobras radicales en secciones críticas de la ola.</p>
      <p><strong>Referente Local:</strong> Múltiple campeón nacional y referente indiscutido en la zona central de Chile.</p>
    `,
    stats: { board: 'Wave Performance 6\'0"', stance: 'Regular', local: 'Reñaca' },
    gallery: [
      '/riders/tomas-bock/tomi-1.jpg',
      '/riders/tomas-bock/tomi-2.png'
    ],
    instagramUrls: [
      'https://www.instagram.com/p/C7ST0ZTvNQE/',
      'https://www.instagram.com/reel/DA_zhg4PxnB/'
    ]
  },
  'paulo-munoz': {
    name: 'Paulo Muñoz',
    role: 'LEGEND / SURF COACH',
    title: 'BIOGRAFÍA: PAULO MUÑOZ',
    cover: '/paulo-1.png',
    bio: `
      <p>Para Paulo, Playa La Boca representa su entorno de formación principal y su base técnica. Motivado desde temprana edad por la cultura de tabla, ha desarrollado un respeto profundo por las disciplinas del surf y el skate, recorriendo diversos escenarios internacionales con el objetivo de integrar las mejores prácticas del deporte global.</p>
      <p>Como <strong>Rider bilingüe certificado por la International Surfing Association (ISA)</strong>, Paulo fusiona una vasta experiencia en terreno con la metodología técnica necesaria para liderar procesos de enseñanza, desde niveles iniciales hasta el perfeccionamiento de maniobras avanzadas.</p>
      <p>Su enfoque integral en el entrenamiento de <strong>Surf y Skate</strong> lo posiciona como un instructor clave para quienes buscan optimizar su performance. Actualmente, Paulo desempeña su labor profesional exclusivamente en <strong>Wave Surf Club</strong>, aportando un estándar de instrucción de clase mundial a la comunidad local.</p>
    `,
    stats: { board: 'Wave Classic 7\'4"', stance: 'Goofy', local: 'Concón' },
    gallery: [
      '/riders/paulo/R1.jpg',
      '/riders/paulo/R2.jpg',
      '/riders/paulo/R3.jpg',
      '/riders/paulo/R4.jpg',
      '/riders/paulo/R5.jpg',
      '/riders/paulo/R6.jpg',
      '/riders/paulo/R7.jpg',
      '/riders/paulo/R8.jpg'
    ],
    magazine: 'https://drive.google.com/drive/folders/1ZXnRizAjEvrCkdoV0tfGwF7esY4g81oK?usp=sharing'
  },
  'martin-cardozo': {
    name: 'Martín Cardozo',
    role: 'SKATE PRO',
    cover: 'https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Martín Cardozo es sinónimo de estilo y técnica en el skate park. Con una visión innovadora de las líneas urbanas, ha logrado posicionarse como uno de los referentes del club para la nueva generación de skaters chilenos.</p>',
    stats: { board: 'Wave Skate 8.25"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80']
  },
  'sofia-renaca': {
    name: 'Sofía Reñaca',
    role: 'SURF AMBASSADOR',
    cover: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Sofía representa la elegancia en el agua. Como embajadora de Wave Surf Club, su misión es inspirar a más mujeres a sumergirse en la cultura del surf, promoviendo el respeto por el océano y la perseverancia deportiva.</p>',
    stats: { board: 'Wave Flow 6\'4"', stance: 'Goofy', local: 'Reñaca' },
    gallery: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80']
  },
  'lucas-pichilemu': {
    name: 'Lucas Pichilemu',
    role: 'JUNIOR TEAM',
    cover: 'https://images.unsplash.com/photo-1518721332565-4d5dcba6676c?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>La joven promesa del surf nacional. Lucas ha crecido entre las olas de Pichilemu, desarrollando una lectura de mar excepcional para su edad que lo proyecta como un competidor de nivel mundial.</p>',
    stats: { board: 'Wave Grom 5\'8"', stance: 'Regular', local: 'Pichilemu' },
    gallery: ['https://images.unsplash.com/photo-1518721332565-4d5dcba6676c?auto=format&fit=crop&w=1200&q=80']
  },
  'mateo-olas': {
    name: 'Mateo Olas',
    role: 'SURF COACH',
    cover: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Especialista en técnica y seguridad. Mateo es fundamental en la formación de nuevos talentos, enfocándose en la metodología técnica necesaria para que cada alumno evolucione de forma constante y segura.</p>',
    stats: { board: 'Wave Coach 7\'2"', stance: 'Goofy', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80']
  },
  'isidora-wave': {
    name: 'Isidora Wave',
    role: 'CONTENT CREATOR',
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Capturando la esencia del club. Isidora fusiona su pasión por el surf con la creación visual, llevando el espíritu de Wave Surf Club a todas las plataformas con una estética premium y auténtica.</p>',
    stats: { board: 'Wave Hybrid 6\'8"', stance: 'Regular', local: 'Zapallar' },
    gallery: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80']
  },
  'benjamin-coast': {
    name: 'Benjamín Coast',
    role: 'SKATE TEAM',
    cover: 'https://images.unsplash.com/photo-1601506521937-0121a7fc7a65?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Benjamín destaca por su creatividad y fluidez en el asfalto. Su estilo combina maniobras técnicas con una velocidad envidiable, siendo una pieza clave del equipo Pro de Skate del club.</p>',
    stats: { board: 'Wave Pro Skate 8.0"', stance: 'Goofy', local: 'Santiago' },
    gallery: ['https://images.unsplash.com/photo-1601506521937-0121a7fc7a65?auto=format&fit=crop&w=1200&q=80']
  },
  'valentina-pacific': {
    name: 'Valentina Pacific',
    role: 'SURF PRO',
    cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Competidora nata. Valentina ha recorrido el circuito nacional con resultados consistentes, destacando por su potencia en el rail y su compromiso con el desarrollo del surf femenino.</p>',
    stats: { board: 'Wave Performance 5\'11"', stance: 'Regular', local: 'Maitencillo' },
    gallery: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80']
  },
  'diego-salt': {
    name: 'Diego Salt',
    role: 'WAVE TALLER',
    cover: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>El guardián de los equipos. Diego conoce cada secreto de las tablas y el equipamiento. Su labor en el taller asegura que cada rider de Wave tenga las herramientas perfectas para dominar el mar.</p>',
    stats: { board: 'Wave Cruiser 8\'0"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80']
  },
  'agustin-flow': {
    name: 'Agustín Flow',
    role: 'SKATE JUNIOR',
    cover: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Talento emergente. Agustín representa la nueva sangre del skate, con una facilidad asombrosa para aprender trucos complejos y una dedicación que lo pone a la cabeza del equipo junior.</p>',
    stats: { board: 'Wave Junior 7.75"', stance: 'Regular', local: 'Viña del Mar' },
    gallery: ['https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=1200&q=80']
  },
  'javiera-reef': {
    name: 'Javiera Reef',
    role: 'SURF GIRL',
    cover: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Pasión por el océano. Javiera es un ejemplo de constancia en el agua, siempre buscando perfeccionar su técnica y disfrutando cada sesión con el espíritu aventurero del club.</p>',
    stats: { board: 'Wave Funboard 7\'0"', stance: 'Goofy', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80']
  },
  'raimundo-point': {
    name: 'Raimundo Point',
    role: 'BIG WAVE RIDER',
    cover: 'https://images.unsplash.com/photo-1414442657444-24584284d720?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Buscador de olas gigantes. Raimundo vive para los swells más potentes, representando el coraje y la preparación técnica extrema que requiere el surf de olas grandes en Chile.</p>',
    stats: { board: 'Wave Gun 9\'6"', stance: 'Regular', local: 'Punta de Lobos' },
    gallery: ['https://images.unsplash.com/photo-1414442657444-24584284d720?auto=format&fit=crop&w=1200&q=80']
  },
  'pascal-shore': {
    name: 'Pascal Shore',
    role: 'LONGBOARD PRO',
    cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Clasicismo y estilo. Pascal domina el longboard con una gracia natural, rescatando las raíces del surf y demostrando que la elegancia sobre la tabla es un arte eterno.</p>',
    stats: { board: 'Wave Long Classic 9\'2"', stance: 'Goofy', local: 'Pichilemu' },
    gallery: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80']
  },
  'gaspar-board': {
    name: 'Gaspar Board',
    role: 'SHAPER',
    cover: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>El artesano de la velocidad. Gaspar diseña y construye las tablas que definen el rendimiento de nuestros riders, fusionando ciencia y arte bajo el sello Wave.</p>',
    stats: { board: 'Wave Master Tool', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80']
  },
  'antonia-tide': {
    name: 'Antonia Tide',
    role: 'JUNIOR GIRLS',
    cover: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Futuro brillante. Antonia destaca por su valentía en condiciones fuertes y su sed de aprendizaje, liderando la nueva camada de surfistas femeninas del club.</p>',
    stats: { board: 'Wave Grom Star 5\'6"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80']
  },
  'emilio-bowl': {
    name: 'Emilio Bowl',
    role: 'PARK SKATE',
    cover: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Dominio total del bowl. Emilio destaca por sus aéreos y su control en las transiciones más verticales, elevando el nivel técnico de cada sesión de entrenamiento.</p>',
    stats: { board: 'Wave Bowl Pro 8.5"', stance: 'Goofy', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80']
  },
  'catalina-spray': {
    name: 'Catalina Spray',
    role: 'SURF ELITE',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Rendimiento máximo. Catalina se enfoca en el perfeccionamiento de maniobras críticas, representando la excelencia deportiva y el espíritu competitivo de Wave Surf Club.</p>',
    stats: { board: 'Wave Elite 5\'10"', stance: 'Regular', local: 'Pichilemu' },
    gallery: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80']
  },
  'felipe-edge': {
    name: 'Felipe Edge',
    role: 'TECH COACH',
    cover: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Maestro de la técnica. Felipe analiza cada movimiento para optimizar el performance de los riders pro, utilizando tecnología y experiencia para alcanzar la perfección.</p>',
    stats: { board: 'Wave Tech 6\'2"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80']
  },
  'angelo-avello': {
    name: 'Angelo Avello',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Angelo Avello se une al equipo para demostrar que el surf es más que un deporte, es una forma de vida. Su estilo fluido y compromiso con la excelencia lo posicionan como un talento a seguir.</p>',
    stats: { board: 'Wave Tech 6\'2"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80']
  },
  'cristobal-lazcano': {
    name: 'Cristobal Lazcano',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Cristobal Lazcano aporta frescura y potencia al equipo. Con una visión técnica impecable, Cristobal representa la nueva ola de deportistas que están redefiniendo el surf nacional.</p>',
    stats: { board: 'Wave Performance 6\'0"', stance: 'Goofy', local: 'Pichilemu' },
    gallery: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80']
  },
  'vicente-pipe': {
    name: 'Vicente Pipe',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>El ojo narrativo. Vicente captura la gloria y el esfuerzo del club, inmortalizando los momentos que definen nuestra historia y la belleza del deporte de tabla.</p>',
    stats: { board: 'Wave Media Hub', stance: 'N/A', local: 'Chile' },
    gallery: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80']
  },
  'lucas-penna': {
    name: 'Lucas Penna',
    role: 'TEAM RIDER',
    title: 'LUCAS PENNA',
    cover: '/riders/lucas-penna/fondo.png',
    bio: `
      <p>Luca se crío en Reñaca, creció con la cultura y las historias de esa playa, su acercamiento al surf viene básicamente desde que nació cuando su padre lo llevaba en brazos al agua con un traje que le quedaba grande porque no habían para niños más pequeños, rodeado de antiguos surfistas que le transmitían la pasión por el surf y por el mar.</p>
      <p>Si bien su camino no ha sido el más fácil, siempre que se lo ve en el agua se le puede ver sonriendo, contando algo que le de risa o buscando como superarse, a su forma de verlo el surf siempre será una gran razón para estar alegre, surfear lo conecta con su historia familiar y lo hace reconciliarse con su propia historia.</p>
    `,
    stats: { board: 'Wave Performance 6\'2"', stance: 'Regular', local: 'Reñaca' },
    gallery: [
      '/riders/lucas-penna/1.png',
      '/riders/lucas-penna/2.png',
      '/riders/lucas-penna/3.png',
      '/riders/lucas-penna/4.png',
      '/riders/lucas-penna/5.png',
      '/riders/lucas-penna/6.png',
      '/riders/lucas-penna/7.png',
      '/riders/lucas-penna/8.png',
      '/riders/lucas-penna/9.png'
    ]
  },
  default: {
    name: 'Wave Rider',
    role: 'TEAM RIDER',
    cover: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80',
    bio: '<p>Nacido entre las olas de la zona central, este rider ha dedicado su vida a perfeccionar la técnica y el estilo que definen a la nueva generación del surf chileno.</p>',
    stats: { board: 'Wave Custom', stance: 'Natural', local: 'Chile' },
    gallery: [
      'https://images.unsplash.com/photo-1533031021462-8e7ac46b1d4c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512413912197-e81882bdc63c?auto=format&fit=crop&w=1200&q=80'
    ]
  }
};

export default function RiderMagazine() {
  const { slug } = useParams();
  const rider = RIDERS_DATA[slug] || RIDERS_DATA.default;
  const [scrolled, setScrolled] = useState(false);
  const [index, setIndex] = useState(0);

  const formatSpaced = (text) => text.toUpperCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (rider.gallery && rider.gallery.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % rider.gallery.length);
      }, 5000);
      return () => interval && clearInterval(interval);
    }
  }, [rider.gallery]);

  return (
    <div className="mag-container">
      <style jsx>{`
        .mag-container {
          background: #ffffff;
          color: #000;
          min-height: 100vh;
          font-family: var(--font-sans);
        }

        /* --- STICKY NAV --- */
        .mag-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 1000;
          transition: all 0.4s;
          background: ${scrolled ? 'rgba(11, 17, 32, 0.9)' : '#ffffff'};
          backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .back-btn {
          color: #000;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* --- HERO COVER --- */
        .mag-hero {
          height: calc(100vh - 95px);
          margin-top: 95px;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px 8%;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: #000 url(${rider.cover}) center/cover no-repeat;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0b1120, transparent 60%);
          z-index: 2;
        }
        .hero-title-box {
          position: relative;
          z-index: 3;
          max-width: 95%;
          display: inline-block;
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border: 1px solid #000;
          box-shadow: 20px 20px 0px rgba(0,0,0,0.1);
        }
        .mag-tag {
          color: #38bdf8;
          font-weight: 800;
          letter-spacing: 4px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: block;
        }
        .mag-name {
          font-size: clamp(24px, 4vw, 56px);
          font-weight: 950;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 15px;
          text-transform: uppercase;
          margin: 0;
          color: #000;
          letter-spacing: -0.02em;
          transform: skewX(-5deg);
          white-space: nowrap;
        }
        .mag-prefix {
          color: #38bdf8;
          letter-spacing: 4px;
        }

        /* --- EDITORIAL SECTIONS --- */
        .mag-content {
          padding: 100px 8%;
        }
        .editorial-row {
          display: flex;
          gap: 60px;
          margin-bottom: 120px;
          align-items: center;
        }
        .text-col { flex: 1; }
        .img-col { flex: 1.5; }
        
        .editorial-title {
          font-family: var(--font-montserrat);
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 30px;
          color: #000;
          text-transform: uppercase;
        }
        .editorial-p {
          font-family: var(--font-inter);
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
          font-weight: 400;
          text-align: justify;
        }
        .editorial-p p {
          margin-bottom: 20px;
        }
        .editorial-p strong {
          color: #000;
          font-weight: 700;
        }
        
        .side-img {
          width: 100%;
          height: auto;
          max-height: 800px;
          object-fit: contain;
          background: #000;
          border-radius: 4px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        
        .carousel-container {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .carousel-image-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.5s ease-in-out, transform 8s ease-out;
          transform: scale(1.1);
        }
        .carousel-image-wrapper.active {
          opacity: 1;
          transform: scale(1);
        }

        .gal-img-wrapper {
          position: relative;
          width: 100%;
          height: 600px;
          background: #000;
          border-radius: 4px;
          overflow: hidden;
        }
        .gal-img-wrapper:nth-child(3n) {
          grid-column: span 2;
          height: 800px;
        }

        /* --- STATS GRID --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 60px;
          margin-top: 60px;
        }
        .stat-item h6 {
          font-size: 11px;
          color: #38bdf8;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 10px;
        }
        .stat-item p {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        /* --- GALLERY --- */
        .mag-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 100px;
        }
        .gal-img {
          width: 100%;
          height: 600px;
          object-fit: contain;
          background: #000;
          border-radius: 4px;
        }
        .gal-img:nth-child(3n) {
          grid-column: span 2;
          height: 800px;
        }

        .instagram-box {
          margin-top: 40px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        @media (max-width: 900px) {
          .editorial-row { flex-direction: column; text-align: center; }
          .stats-grid { grid-template-columns: 1fr; }
          .mag-gallery { grid-template-columns: 1fr; }
          .gal-img:nth-child(3n) { grid-column: span 1; }
          .editorial-p {
            font-size: 14px;
            text-align: left;
          }
          .editorial-title {
            font-size: 24px;
          }
        }

        /* --- DOWNLOAD BUTTON --- */
        .download-btn-container {
          margin-top: 40px;
          display: flex;
          justify-content: flex-start;
        }
        .mag-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 800;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
        }
        .mag-download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(14, 165, 233, 0.4);
          background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%);
        }
        .mag-download-btn span {
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>

      <Navbar />

      <header className="mag-hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-title-box">
          <h1 className="mag-name">
            <span className="mag-prefix">R I D E R</span> 
            <span>/</span>
            <span>{formatSpaced(rider.name)}</span>
          </h1>
        </div>
      </header>

      <main className="mag-content">
        <div className="editorial-row">
          <div className="text-col">
            <h2 className="editorial-title">
              {rider.title || 'LA ESENCIA DEL RIDER'}
            </h2>
            <div 
              className="editorial-p" 
              dangerouslySetInnerHTML={{ __html: rider.bio }} 
            />
            {/* INSTAGRAM VIDEOS */}
            {(rider.instagramUrls || (rider.instagramUrl && [rider.instagramUrl])).map((url, i) => (
              <div key={i} className="instagram-box">
                <iframe 
                  src={`${url.replace(/\/$/, '')}/embed/`} 
                  width="100%" 
                  height="720" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowTransparency="true"
                  style={{ borderRadius: '4px', border: '1px solid #eee', background: '#fff' }}
                />
              </div>
            ))}

            {rider.magazine && (
              <div className="download-btn-container">
                <a 
                  href={rider.magazine} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mag-download-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  descargar REVISTA PAULO
                </a>
              </div>
            )}
          </div>
          <div className="img-col">
            <div className="carousel-container">
              {rider.gallery.map((img, i) => (
                <div key={i} className={`carousel-image-wrapper ${i === index ? 'active' : ''}`}>
                  <Image 
                    src={img} 
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    priority={i === 0}
                    style={{ objectFit: 'cover' }}
                    alt={`Rider ${i}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <footer style={{ padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px' }}>WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
