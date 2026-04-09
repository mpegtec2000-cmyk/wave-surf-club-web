'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n-context';
import { addClient } from '@/lib/data';
import EquipoSection from '@/components/EquipoSection';

// --- TRADUCCIONES (DICCIONARIO EN MEMORIA) ---
// Nota: Algunas traducciones se manejan vía i18n-context, pero mantenemos este objeto para compatibilidad local
const translations = {
  es: {
    btn_ingreso: 'INGRESO :',
    btn_cliente: 'CLIENTE (Nuevo Registro)',
    btn_colaborador: 'COLABORADOR (Portal)',
    menu_inicio: 'INICIO',
    menu_bio: 'BIOGRAFÍA', menu_escuelas: 'ESCUELAS', menu_servicios: 'SERVICIOS', menu_equipo: 'EQUIPO', menu_taller: 'TALLER',
    menu_riders: 'RIDERS', menu_tienda: 'TIENDA', menu_contenido: 'CONTENIDO', menu_agenda: 'AGENDA TU CLASE',
    menu_contacto: 'CONTACTO', menu_eventos: 'EVENTOS', menu_carro: 'CARRO: (0)',
    hero_title: 'SINCE 2015,<br/>todo partió como un sueño y se hizo realidad.',
    hero_subtitle: 'Dedicados a la enseñanza del Skate y Surf, contamos con una amplia trayectoria fomentando el crecimiento deportivo. Creemos en el desarrollo integral, rescatando siempre la cultura y los valores que nacen sobre la tabla.',
    mod_title: 'NUEVO ALUMNO',
    mod_name: 'Nombre Completo', mod_rut: 'RUT', mod_email: 'Correo Electrónico',
    mod_phone: 'Teléfono', mod_submit: 'Registrar Cliente', mod_processing: 'Procesando...',
    mod_success: 'Estudiante registrado correctamente.', mod_error: 'Error al registrar.',
    sec_bio_sub: 'Wave Surf Club: Transformando Vidas a través del Deporte\n\nDesde 2015, lo que comenzó como un sueño de Francisco Luisiño se ha convertido en una realidad que late con fuerza en la costa chilena. En Wave, nuestra pasión va más allá de las olas: somos un motor de nuevos proyectos deportivos y un pilar para la comunidad.\n\nNos movemos por la inclusión, apoyando activamente el deporte para personas con discapacidad y creando lazos con universidades y colegios a través de paseos de curso diseñados para conectar con la naturaleza. Con sedes en Concón, Pichilemu y nuestra reciente inauguración en Punta de Piedra, somos la casa de grandes competidores internacionales y, sobre todo, el lugar donde cada visitante vive una experiencia inolvidable.',
    sec_escuelas_sub: 'S P O T S',
    sec_riders_sub: 'WAVE FAM: THE NEXT GENERATION',
    sec_taller_sub: 'Reparación y customización de equipos profesionales.',
    sec_eventos_sub: 'Competencias y encuentros locales.',
    sec_clases_sub: 'Evoluciona en el agua con instructores del más alto nivel.',
    sec_surf_sub: 'Equipamiento y cultura de ola.',
    sec_skate_sub: 'Entrenamiento en tierra firme para dominar el agua.'
  },
  en: {
    btn_ingreso: 'LOGIN :',
    btn_cliente: 'A) CLIENT (New Registration)',
    btn_colaborador: 'B) STAFF (ERP)',
    menu_bio: 'BIOGRAPHY', menu_escuelas: 'SCHOOLS', menu_taller: 'WORKSHOP',
    menu_riders: 'RIDERS', menu_eventos: 'EVENTS', menu_clases: 'CLASSES',
    menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTENT',
    menu_contacto: 'CONTACT', menu_carro: 'CART: (0)',
    hero_title: 'RULE THE WAVES.<br/>SIMPLIFY YOUR EXPERIENCE.',
    hero_subtitle: 'Discover the smart side of surfing. Classes, premium gear, and a thriving community, all managed with cutting-edge tech so your only concern is the ocean.',
    mod_title: 'NEW STUDENT',
    mod_name: 'Full Name', mod_rut: 'National ID/RUT', mod_email: 'Email Address',
    mod_phone: 'Phone Number', mod_submit: 'Register Client', mod_processing: 'Processing...',
    mod_success: 'Student registered successfully.', mod_error: 'Error setting up client.',
    sec_bio_sub: 'History of the best surf school in Chile.',
    sec_escuelas_sub: 'Connect with our spots in Reñaca and Concón.',
    sec_taller_sub: 'Professional gear repair and customization.',
    sec_riders_sub: 'The talents that make the difference.',
    sec_eventos_sub: 'Local competitions and gatherings.',
    sec_clases_sub: 'Evolve in the water with top-tier instructors.',
    sec_surf_sub: 'Equipment and wave culture.',
    sec_skate_sub: 'Dry land training to master the water.'
  },
  fr: {
    btn_ingreso: 'ACCÈS :', btn_cliente: 'A) CLIENT (Nouveau Inscription)', btn_colaborador: 'B) PERSONNEL (ERP)',
    menu_bio: 'BIOGRAPHIE', menu_escuelas: 'ÉCOLES', menu_taller: 'ATELIER', menu_riders: 'RIDERS', menu_eventos: 'ÉVÉNEMENTS', menu_clases: 'COURS', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTENU', menu_contacto: 'CONTACT', menu_carro: 'PANIER: (0)',
    hero_title: 'DOMINEZ LES VAGUES.<br/>SIMPLIFIEZ VOTRE EXPÉRIENCE.',
    hero_subtitle: "Découvrez le côté intelligent du surf. Des cours et des équipements gérés avec une technologie de pointe.",
    mod_title: 'NOUVEL ÉLÈVE', mod_name: 'Nom Complet', mod_rut: 'Numéro d\'Identité', mod_email: 'Email', mod_phone: 'Téléphone', mod_submit: 'S\'inscrire', mod_processing: 'Traitement...', mod_success: 'Enregistré avec succès.', mod_error: 'Erreur lors de l\'inscription.',
    sec_bio_sub: 'L\'histoire de la meilleure école de surf du Chili.', sec_escuelas_sub: 'Connectez-vous à nos spots de Reñaca et Concón.', sec_taller_sub: 'Réparation et personnalisacion de matériel professionnel.', sec_riders_sub: 'Les talents qui font la diferencia.', sec_eventos_sub: 'Compétitions et rassemblements locaux.', sec_clases_sub: 'Évoluez avec des instructeurs de haut niveau.', sec_surf_sub: 'Équipement et culture de la vague.', sec_skate_sub: 'Entraînement au sol pour maîtriser l\'eau.'
  },
  de: {
    btn_ingreso: 'EINTRITT :', btn_cliente: 'A) KUNDE (Neu)', btn_colaborador: 'B) PERSONAL (ERP)',
    menu_bio: 'BIOGRAFIE', menu_escuelas: 'SCHULEN', menu_taller: 'WERKSTATT', menu_riders: 'RIDERS', menu_eventos: 'VERANSTALTUNGEN', menu_clases: 'KLASSEN', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'INHALT', menu_contacto: 'KONTAKT', menu_carro: 'WAGEN: (0)',
    hero_title: 'BEHERRSCHE DIE WELLEN.<br/>VEREINFACHE DEINE ERFAHRUNG.',
    hero_subtitle: "Entdecke die smarte Seite des Surfens. Kurse und modernste Ausrüstung.",
    mod_title: 'NEUER STUDENT', mod_name: 'Vollständiger Name', mod_rut: 'Personalausweis', mod_email: 'E-Mail', mod_phone: 'Telefon', mod_submit: 'Registrieren', mod_processing: 'Verarbeitung...', mod_success: 'Erfolgreich registriert.', mod_error: 'Fehler bei der Registrierung.',
    sec_bio_sub: 'Geschichte der besten Surfschule in Chile.', sec_escuelas_sub: 'Verbinde dich mit unseren Spots in Reñaca und Concón.', sec_taller_sub: 'Reparatur und Anpassung professioneller Ausrüstung.', sec_riders_sub: 'Die Talente, die den Unterschied machen.', sec_eventos_sub: 'Lokale Wettbewerbe und Treffen.', sec_clases_sub: 'Entwickle dich weiter mit erstklassigen Instruktoren.', sec_surf_sub: 'Ausrüstung und Wellenkultur.', sec_skate_sub: 'Trockentraining zur Beherrschung des Wassers.'
  },
  pt: {
    btn_ingreso: 'ENTRADA :', btn_cliente: 'A) CLIENTE (Novo)', btn_colaborador: 'B) EQUIPE (ERP)',
    menu_bio: 'BIOGRAFIA', menu_escuelas: 'ESCOLAS', menu_taller: 'OFICINA', menu_riders: 'RIDERS', menu_eventos: 'EVENTOS', menu_clases: 'AULAS', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTEÚDO', menu_contacto: 'CONTATO', menu_carro: 'CARRINHO: (0)',
    hero_title: 'DOMINE AS ONDAS.<br/>SIMPLIFIQUE SUA EXPERIÊNCIA.',
    hero_subtitle: "Descubra o lado inteligente do surfe. Aulas e equipamentos gerenciados com tecnologia de ponta.",
    mod_title: 'NOVO ALUNO', mod_name: 'Nome Completo', mod_rut: 'Identidade (RUT)', mod_email: 'Correio eletrônico', mod_phone: 'Telefone', mod_submit: 'Registrar', mod_processing: 'Processando...', mod_success: 'Registrado com sucesso.', mod_error: 'Erro no registro.',
    sec_bio_sub: 'História da mejor escola de surfe do Chile.', sec_escuelas_sub: 'Conecte-se aos nossos picos em Reñaca y Concón.', sec_taller_sub: 'Reparo e personalização de equipamentos.', sec_riders_sub: 'Os talents que fazem a diferença.', sec_eventos_sub: 'Competições locais e encontros.', sec_clases_sub: 'Evolua com instrutores de alto nivel.', sec_surf_sub: 'Equipamentos e cultura de ondas.', sec_skate_sub: 'Treinamento em solo para dominar a água.'
  }
};

export default function LandingPage() {
  const { lang, setLang } = useTranslation();
  const [t, setT] = useState(translations.es);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', rut: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setT(translations[lang] || translations.es);
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await addClient(formData);
      if (result.success) {
        setMessage({ type: 'success', text: t.mod_success });
        setFormData({ name: '', rut: '', email: '', phone: '' });
        setTimeout(() => setShowModal(false), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setMessage({ type: 'error', text: t.mod_error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-white selection:bg-[#FACC15] selection:text-black">
      
      {/* ── HEADER / NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-3 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          
          <Link href="/" className="group relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-[#EAB308] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <span className="text-black font-black text-2xl">W</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tighter transition-colors group-hover:text-[#FACC15]">WAVE SURF CLUB</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-white/70 hover:text-[#FACC15] font-bold text-xs uppercase tracking-widest transition-colors">{t.menu_inicio}</Link>
            <Link href="/servicios" className="text-white/70 hover:text-[#FACC15] font-bold text-xs uppercase tracking-widest transition-colors">{t.menu_servicios}</Link>
            <Link href="/taller" className="text-white/70 hover:text-[#FACC15] font-bold text-xs uppercase tracking-widest transition-colors">{t.menu_taller}</Link>
            <Link href="/riders" className="text-white/70 hover:text-[#FACC15] font-bold text-xs uppercase tracking-widest transition-colors">{t.menu_riders}</Link>
            <Link href="/agenda" className="px-6 py-2.5 bg-[#FACC15] hover:bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              {t.menu_agenda}
            </Link>

            <div className="h-4 w-[1px] bg-white/20 mx-2"></div>

            <div className="flex items-center gap-3">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg border border-white/10 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="es" className="bg-black text-white">ES</option>
                <option value="en" className="bg-black text-white">EN</option>
                <option value="pt" className="bg-black text-white">PT</option>
                <option value="de" className="bg-black text-white">DE</option>
                <option value="fr" className="bg-black text-white">FR</option>
              </select>
              <Link href="/login" className="text-white hover:text-[#FACC15] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              </Link>
            </div>
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white hover:text-[#FACC15] transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <Image 
          src="/PORTADA.jpg" 
          alt="Hero Background" 
          fill 
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full pt-20">
          <div className="max-w-4xl space-y-10">
            <div className="w-20 h-1 bg-[#FACC15]"></div>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]" dangerouslySetInnerHTML={{ __html: t.hero_title }}></h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-medium leading-relaxed">
              {t.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link href="/agenda" className="px-10 py-5 bg-[#FACC15] hover:bg-white text-black font-black text-sm uppercase tracking-widest rounded-full transition-all duration-500 shadow-2xl hover:scale-105 text-center">
                {t.menu_agenda}
              </Link>
              <button 
                onClick={() => setShowModal(true)}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all duration-500 backdrop-blur-md border border-white/20 text-center"
              >
                {t.btn_cliente}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Scroll Down</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* ── BIO SECTION (HISTORY) ── */}
      <section className="bg-black py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-[#FACC15] font-black text-sm uppercase tracking-[0.5em]">Historia</h2>
              <div className="space-y-6">
                <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter">WAVE SURF CLUB</h3>
                <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line font-light italic">
                  {t.sec_bio_sub}
                </p>
              </div>
              <div className="pt-8 flex items-center gap-6">
                <div className="h-[2px] w-24 bg-[#FACC15]"></div>
                <span className="text-white font-bold tracking-widest text-xs uppercase">Since 2015</span>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl group">
              <Image src="/logo1.png" alt="Wave Logo" fill className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPOTS / ESCUELAS ── */}
      <section id="escuelas" className="bg-[#0A0A0A] py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-24">
          <h2 className="text-[#FACC15] font-black text-sm uppercase tracking-[0.5em] mb-6">Nuestras Sedes</h2>
          <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter">S P O T S</h3>
        </div>
        
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-3 gap-1 px-4">
          {[
            { id: '1', name: 'CONCÓN', img: '/SECTOR-CONCON.jpg', slug: 'concon' },
            { id: '2', name: 'PICHILEMU', img: '/PICHILEMU.JPG', slug: 'pichilemu' },
            { id: '3', name: 'PUNTA DE PIEDRA', img: '/PUNTA-DE-PIEDRA.jpg', slug: 'punta-de-piedra' }
          ].map((spot) => (
            <Link key={spot.id} href={`/spots/${spot.slug}`} className="group relative h-[600px] overflow-hidden">
              <Image src={spot.img} alt={spot.name} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10 transform group-hover:scale-110 transition-transform duration-700">
                  <h4 className="text-4xl md:text-6xl font-black text-white tracking-widest drop-shadow-2xl">{spot.name}</h4>
                  <div className="h-1 w-0 group-hover:w-full bg-[#FACC15] mx-auto mt-4 transition-all duration-700"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-12 translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                <span className="text-[#FACC15] font-black tracking-widest text-xs">EXPLORAR SEDE →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white py-24 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-black font-black text-3xl">W</span>
              </div>
              <span className="text-4xl font-black tracking-tighter uppercase">WAVE SURF CLUB</span>
            </div>
            <p className="text-gray-500 text-sm max-w-md tracking-wide font-medium">SINCE 2015. Transformando la cultura del surf a través del deporte, la inclusión y la excelencia técnica.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <nav className="flex flex-wrap justify-center gap-8 text-[11px] font-black tracking-[0.2em] uppercase text-white/40">
              <Link href="/" className="hover:text-white transition-colors">{t.menu_inicio}</Link>
              <Link href="/servicios" className="hover:text-white transition-colors">{t.menu_servicios}</Link>
              <Link href="/riders" className="hover:text-white transition-colors">{t.menu_riders}</Link>
              <Link href="/taller" className="hover:text-white transition-colors">{t.menu_taller}</Link>
            </nav>
            <div className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-medium pt-4">© 2026 WAVE SURF CLUB | ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </footer>
      
      {/* ── MODAL DE REGISTRO ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-[#111] w-full max-w-xl p-10 md:p-16 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="space-y-12">
              <div className="text-center">
                <h3 className="text-white text-4xl font-black uppercase tracking-tighter mb-4">{t.mod_title}</h3>
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Únete a la familia Wave Surf Club</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {['name', 'rut', 'email', 'phone'].map((field) => (
                  <div key={field} className="relative group">
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      required
                      placeholder={t[`mod_${field}`]}
                      className="w-full bg-[#1A1A1A] border-none text-white px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#FACC15]/50 transition-all font-bold group-hover:bg-[#222]"
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    />
                  </div>
                ))}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#FACC15] hover:bg-white text-black font-black py-5 rounded-2xl transition-all duration-500 shadow-2xl hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50"
                >
                  {loading ? t.mod_processing : t.mod_submit}
                </button>
              </form>

              {message.text && (
                <div className={`p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col p-12 text-center">
          <button onClick={() => setIsMenuOpen(false)} className="self-end text-white p-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex-1 flex flex-col justify-center gap-10">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white hover:text-[#FACC15] transition-colors">{t.menu_inicio}</Link>
            <Link href="/servicios" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white hover:text-[#FACC15] transition-colors">{t.menu_servicios}</Link>
            <Link href="/taller" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white hover:text-[#FACC15] transition-colors">{t.menu_taller}</Link>
            <Link href="/riders" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white hover:text-[#FACC15] transition-colors">{t.menu_riders}</Link>
            <Link href="/agenda" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-[#FACC15]">{t.menu_agenda}</Link>
          </div>
        </div>
      )}

    </div>
  );
}
