'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addClient } from '@/lib/data';
import RidersSection from '@/components/RidersSection';

// --- TRADUCCIONES (DICCIONARIO EN MEMORIA) ---
const translations = {
  es: {
    btn_ingreso: 'INGRESO :',
    btn_cliente: 'A) CLIENTE (Nuevo Registro)',
    btn_colaborador: 'B) COLABORADOR (ERP)',
    menu_bio: 'BIOGRAFÍA', menu_escuelas: 'ESCUELAS', menu_taller: 'TALLER',
    menu_ryders: 'RYDERS', menu_eventos: 'EVENTOS', menu_clases: 'CLASES',
    menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTENIDO',
    menu_contacto: 'CONTACTO', menu_carro: 'CARRO: (0)',
    hero_title: 'SINCE 2015,<br/>todo partió como un sueño y se hizo realidad.',
    hero_subtitle: 'Dedicados a la enseñanza del Skate y Surf, contamos con una amplia trayectoria fomentando el crecimiento deportivo. Creemos en el desarrollo integral, rescatando siempre la cultura y los valores que nacen sobre la tabla.',
    mod_title: 'NUEVO ALUMNO',
    mod_name: 'Nombre Completo', mod_rut: 'RUT', mod_email: 'Correo Electrónico',
    mod_phone: 'Teléfono', mod_submit: 'Registrar Cliente', mod_processing: 'Procesando...',
    mod_success: 'Estudiante registrado correctamente.', mod_error: 'Error al registrar.',
    sec_bio_sub: 'Wave Surf Club: Transformando Vidas a través del Deporte\n\nDesde 2015, lo que comenzó como un sueño de Francisco Luisiño se ha convertido en una realidad que late con fuerza en la costa chilena. En Wave, nuestra pasión va más allá de las olas: somos un motor de nuevos proyectos deportivos y un pilar para la comunidad.\n\nNos movemos por la inclusión, apoyando activamente el deporte para personas con discapacidad y creando lazos con universidades y colegios a través de paseos de curso diseñados para conectar con la naturaleza. Con sedes en Concón, Pichilemu y nuestra reciente inauguración en Punta de Piedra, somos la casa de grandes competidores internacionales y, sobre todo, el lugar donde cada visitante vive una experiencia inolvidable.',
    sec_escuelas_sub: 'S P O T S',
    sec_ryders_sub: 'WAVE FAM: THE NEXT GENERATION',
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
    menu_ryders: 'RYDERS', menu_eventos: 'EVENTS', menu_clases: 'CLASSES',
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
    sec_ryders_sub: 'The talents that make the difference.',
    sec_eventos_sub: 'Local competitions and gatherings.',
    sec_clases_sub: 'Evolve in the water with top-tier instructors.',
    sec_surf_sub: 'Equipment and wave culture.',
    sec_skate_sub: 'Dry land training to master the water.'
  },
  fr: {
    btn_ingreso: 'ACCÈS :', btn_cliente: 'A) CLIENT (Nouveau Inscription)', btn_colaborador: 'B) PERSONNEL (ERP)',
    menu_bio: 'BIOGRAPHIE', menu_escuelas: 'ÉCOLES', menu_taller: 'ATELIER', menu_ryders: 'RYDERS', menu_eventos: 'ÉVÉNEMENTS', menu_clases: 'COURS', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTENU', menu_contacto: 'CONTACT', menu_carro: 'PANIER: (0)',
    hero_title: 'DOMINEZ LES VAGUES.<br/>SIMPLIFIEZ VOTRE EXPÉRIENCE.',
    hero_subtitle: "Découvrez le côté intelligent du surf. Des cours et des équipements gérés avec une technologie de pointe.",
    mod_title: 'NOUVEL ÉLÈVE', mod_name: 'Nom Complet', mod_rut: 'Numéro d\'Identité', mod_email: 'Email', mod_phone: 'Téléphone', mod_submit: 'S\'inscrire', mod_processing: 'Traitement...', mod_success: 'Enregistré avec succès.', mod_error: 'Erreur lors de l\'inscription.',
    sec_bio_sub: 'L\'histoire de la meilleure école de surf du Chili.', sec_escuelas_sub: 'Connectez-vous à nos spots de Reñaca et Concón.', sec_taller_sub: 'Réparation et personnalisation de matériel professionnel.', sec_ryders_sub: 'Les talents qui font la différence.', sec_eventos_sub: 'Compétitions et rassemblements locaux.', sec_clases_sub: 'Évoluez avec des instructeurs de haut niveau.', sec_surf_sub: 'Équipement et culture de la vague.', sec_skate_sub: 'Entraînement au sol pour maîtriser l\'eau.'
  },
  de: {
    btn_ingreso: 'EINTRITT :', btn_cliente: 'A) KUNDE (Neu)', btn_colaborador: 'B) PERSONAL (ERP)',
    menu_bio: 'BIOGRAFIE', menu_escuelas: 'SCHULEN', menu_taller: 'WERKSTATT', menu_ryders: 'RYDERS', menu_eventos: 'VERANSTALTUNGEN', menu_clases: 'KLASSEN', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'INHALT', menu_contacto: 'KONTAKT', menu_carro: 'WAGEN: (0)',
    hero_title: 'BEHERRSCHE DIE WELLEN.<br/>VEREINFACHE DEINE ERFAHRUNG.',
    hero_subtitle: "Entdecke die smarte Seite des Surfens. Kurse und modernste Ausrüstung.",
    mod_title: 'NEUER STUDENT', mod_name: 'Vollständiger Name', mod_rut: 'Personalausweis', mod_email: 'E-Mail', mod_phone: 'Telefon', mod_submit: 'Registrieren', mod_processing: 'Verarbeitung...', mod_success: 'Erfolgreich registriert.', mod_error: 'Fehler bei der Registrierung.',
    sec_bio_sub: 'Geschichte der besten Surfschule in Chile.', sec_escuelas_sub: 'Verbinde dich mit unseren Spots in Reñaca und Concón.', sec_taller_sub: 'Reparatur und Anpassung professioneller Ausrüstung.', sec_ryders_sub: 'Die Talente, die den Unterschied machen.', sec_eventos_sub: 'Lokale Wettbewerbe und Treffen.', sec_clases_sub: 'Entwickle dich weiter mit erstklassigen Instruktoren.', sec_surf_sub: 'Ausrüstung und Wellenkultur.', sec_skate_sub: 'Trockentraining zur Beherrschung des Wassers.'
  },
  pt: {
    btn_ingreso: 'ENTRADA :', btn_cliente: 'A) CLIENTE (Novo)', btn_colaborador: 'B) EQUIPE (ERP)',
    menu_bio: 'BIOGRAFIA', menu_escuelas: 'ESCOLAS', menu_taller: 'OFICINA', menu_ryders: 'RYDERS', menu_eventos: 'EVENTOS', menu_clases: 'AULAS', menu_surf: 'SURF', menu_skate: 'SKATE', menu_contenido: 'CONTEÚDO', menu_contacto: 'CONTATO', menu_carro: 'CARRINHO: (0)',
    hero_title: 'DOMINE AS ONDAS.<br/>SIMPLIFIQUE SUA EXPERIÊNCIA.',
    hero_subtitle: "Descubra o lado inteligente do surfe. Aulas e equipamentos gerenciados com tecnologia de ponta.",
    mod_title: 'NOVO ALUNO', mod_name: 'Nome Completo', mod_rut: 'Identidade (RUT)', mod_email: 'Correio eletrônico', mod_phone: 'Telefone', mod_submit: 'Registrar', mod_processing: 'Processando...', mod_success: 'Registrado com sucesso.', mod_error: 'Erro no registro.',
    sec_bio_sub: 'História da melhor escola de surfe do Chile.', sec_escuelas_sub: 'Conecte-se aos nossos picos em Reñaca e Concón.', sec_taller_sub: 'Reparo e personalização de equipamentos.', sec_ryders_sub: 'Os talentos que fazem a diferença.', sec_eventos_sub: 'Competições locais e encontros.', sec_clases_sub: 'Evolua com instrutores de alto nível.', sec_surf_sub: 'Equipamentos e cultura de ondas.', sec_skate_sub: 'Treinamento em solo para dominar a água.'
  },
  ja: {
    btn_ingreso: 'ログイン :', btn_cliente: 'A) クライアント', btn_colaborador: 'B) スタッフ',
    menu_bio: 'バイオグラフィー', menu_escuelas: '学校', menu_taller: 'ワークショップ', menu_ryders: 'ライダー', menu_eventos: 'イベント', menu_clases: 'クラス', menu_surf: 'サーフ', menu_skate: 'スケート', menu_contenido: 'コンテンツ', menu_contacto: 'お問い合わせ', menu_carro: 'カート: (0)',
    hero_title: '波を支配する。<br/>経験を簡素化する。', hero_subtitle: "最先端のテクノロジーで管理されたクラスと最高級の装備。",
    mod_title: '新入生', mod_name: '氏名', mod_rut: '身分証明書', mod_email: 'メールアドレス', mod_phone: '電話番号', mod_submit: '登録', mod_processing: '処理中...', mod_success: '正常に登録されました。', mod_error: 'エラーが発生しました。',
    sec_bio_sub: 'チリ最高のサーフィンスクールの歴史。', sec_escuelas_sub: 'レニャカとコンコンのスポットとつながろう。', sec_taller_sub: 'プロ用機材の修理とカスタマイズ。', sec_ryders_sub: '違いを生み出す才能。', sec_eventos_sub: '地元の大会や集まり。', sec_clases_sub: 'トップクラスのインストラクターと進化しよう。', sec_surf_sub: '装備と波の文化。', sec_skate_sub: '水上をマスターするための陸上トレーニング。'
  },
  zh: {
    btn_ingreso: '登录 :', btn_cliente: 'A) 客户注册', btn_colaborador: 'B) 员工系统',
    menu_bio: '传记', menu_escuelas: '学校', menu_taller: '车间', menu_ryders: '骑手', menu_eventos: '活动', menu_clases: '课程', menu_surf: '冲浪', menu_skate: '滑板', menu_contenido: '内容', menu_contacto: '接触', menu_carro: '推车: (0)',
    hero_title: '驾驭海浪。<br/>简化您的体验。', hero_subtitle: "探索冲浪的智能一面。通过尖端技术管理课程。",
    mod_title: '新学生', mod_name: '全名', mod_rut: '身份证号', mod_email: '电子邮件', mod_phone: '电话', mod_submit: '注册', mod_processing: '处理中...', mod_success: '注册成功。', mod_error: '发生错误。',
    sec_bio_sub: '智利最好的冲浪学校的历史。', sec_escuelas_sub: '连接我们在雷尼亚卡和孔孔的地点。', sec_taller_sub: '专业设备的维修与定制。', sec_ryders_sub: '创造差异的人才。', sec_eventos_sub: '当地比赛和聚会。', sec_clases_sub: '与顶级教练一起进化。', sec_surf_sub: '装备和海浪文化。', sec_skate_sub: '陆地训练以掌握水上技巧。'
  },
  ru: {
    btn_ingreso: 'ВХОД :', btn_cliente: 'А) КЛИЕНТ', btn_colaborador: 'Б) ПЕРСОНАЛ',
    menu_bio: 'БИОГРАФИЯ', menu_escuelas: 'ШКОЛЫ', menu_taller: 'МАСТЕРСКАЯ', menu_ryders: 'РАЙДЕРЫ', menu_eventos: 'СОБЫТИЯ', menu_clases: 'КЛАССЫ', menu_surf: 'СЕРФ', menu_skate: 'СКЕЙТ', menu_contenido: 'КОНТЕНТ', menu_contacto: 'КОНТАКТЫ', menu_carro: 'КОРЗИНА: (0)',
    hero_title: 'ПОКОРЯЙ ВОЛНЫ.<br/>УПРОСТИ СВОЙ ОПЫТ.', hero_subtitle: "Управляйте занятиями с помощью передовых технологий.",
    mod_title: 'НОВЫЙ УЧЕНИК', mod_name: 'Полное Имя', mod_rut: 'Документ', mod_email: 'Email', mod_phone: 'Телефон', mod_submit: 'Зарегистрироваться', mod_processing: 'Идет обработка...', mod_success: 'Успешная регистрация', mod_error: 'Ошибка регистрации',
    sec_bio_sub: 'История лучшей школы серфинга в Чили.', sec_escuelas_sub: 'Доступ к нашим базам в Реньяке и Конконе.', sec_taller_sub: 'Ремонт и настройка оборудования.', sec_ryders_sub: 'Таланты, которые задают уровень.', sec_eventos_sub: 'Местные соревнования и встречи.', sec_clases_sub: 'Развивайся с лучшими инструкторами.', sec_surf_sub: 'Экипировка и культура волн.', sec_skate_sub: 'Сухопутные тренировки для победы на воде.'
  }
};

const LANGUAGES = [
  { code: 'es', label: 'Español' }, { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' }, { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' }, { code: 'ru', label: 'Русский' }
];

export default function LandingPage() {
  const [lang, setLang] = useState('es');
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);


  const formatSpaced = (text) => text.toUpperCase().split('').join(' ');


  // Mobile Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [rydersData, setRydersData] = useState([]);

  useEffect(() => {
    fetch('/api/antigravity/ryders')
      .then(res => res.json())
      .then(data => setRydersData(data))
      .catch(err => console.error('Error fetching ryders:', err));
  }, []);
  const [showModal, setShowModal] = useState(false);
  
  // Registration Form
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await addClient({ rut, name, email, phone });
      if (error) throw error;
      setMsg({ type: 'success', text: t.mod_success });
      setTimeout(() => {
        setShowModal(false);
        setMsg(null);
        setRut(''); setName(''); setEmail(''); setPhone('');
      }, 2000);
    } catch (err) {
      setMsg({ type: 'error', text: t.mod_error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-landing">
      <style jsx>{`
        .dark-landing {
          min-height: 100vh;
          background: #0b1120;
          color: #f8fafc;
          font-family: var(--font-sans);
          overflow-x: hidden;
        }

        /* --- NAVBAR --- */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 80px;
          background: url('/fondo-logo.png') center/cover no-repeat;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          z-index: -1;
        }

        /* Nav Layout */
        .nav-left, .nav-right {
          flex: 1;
          display: flex;
          align-items: center;
        }
        .nav-left { justify-content: flex-start; gap: 24px; }
        
        /* Mobile menu button */
        .mobile-btn {
          display: none;
          background: transparent;
          border: none;
          color: #1e293b;
          font-size: 24px;
          cursor: pointer;
        }

        .nav-center {
          flex: 4;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .nav-right { justify-content: flex-end; }

        .logo-img { height: 60px; width: auto; object-fit: contain; display: block; content: url('/logo-pag.png'); }

        /* Dropdowns */
        .dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-trigger {
          background: transparent;
          color: #1e293b;
          border: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 10px 0;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .dropdown-trigger:hover { color: #0ea5e9; }

        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          background: #0f172a;
          min-width: 250px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s;
        }
        .dropdown:hover .dropdown-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-content button, .dropdown-content a {
          display: block;
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          color: #94a3b8;
          text-decoration: none;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropdown-content button:hover, .dropdown-content a:hover {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          padding-left: 28px;
        }

        /* Lang Dropdown (Right aligned) */
        .lang-dropdown .dropdown-content { left: auto; right: 0; min-width: 150px; }

        /* Center Menu Massive */
        .massive-menu {
          display: flex;
          flex-wrap: nowrap;
          white-space: nowrap;
          align-items: center;
          list-style: none;
          margin: 0; padding: 0;
          gap: 12px;
        }
        .massive-menu li a {
          color: #475569;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          transition: color 0.3s;
        }
        .massive-menu li a:hover { color: #0ea5e9; }
        .slash { color: #cbd5e1; font-size: 11px; margin: 0 4px; }

        /* --- RESPONSIVE CSS --- */
        @media (max-width: 1200px) {
          .nav-center { display: none; }
          .mobile-btn { display: block; }
          .nav-left { gap: 12px; }
          .header { padding: 0 20px; }
        }

        /* Mobile Flyout Menu */
        .mobile-flyout {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 17, 32, 0.95);
          backdrop-filter: blur(20px);
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        .mobile-flyout a {
          color: #f8fafc;
          text-decoration: none;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* --- PARALLAX SECTIONS --- */
        .px-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .px-bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        /* Overaly for sections (slightly darker for content readability) */
        .px-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11, 17, 32, 0.6), rgba(11, 17, 32, 0.95));
          z-index: 2;
        }
        .px-content {
          position: relative;
          z-index: 3;
          max-width: 1200px;
          padding: 80px 24px;
        }
        
        /* Fluid Typography using clamp for responsiveness */
        .hero-text h1 {
          font-family: var(--font-playfair), serif;
          font-size: clamp(48px, 6vw, 80px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 24px;
          color: #f8fafc;
        }
        .hero-subtitle {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: clamp(20px, 2.5vw, 26px);
          color: #ffffff;
          line-height: 1.6;
          max-width: 900px;
          margin: 0 auto;
          font-weight: 400;
          white-space: pre-line;
          text-shadow: 0 4px 15px rgba(0, 0, 0, 0.9);
        }
        .section-marker {
          font-size: clamp(40px, 5vw, 60px);
          font-weight: 800;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 8px;
          opacity: 1;
          margin-bottom: 16px;
        }

        /* --- Escuelas Grid CSS --- */
        .schools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: 1300px;
          margin: 40px auto 0;
          width: 100%;
          text-align: left;
        }
        .school-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 32px;
          transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
          cursor: pointer;
          display: block;
          text-decoration: none;
        }
        .school-card:hover {
          transform: translateY(-8px);
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
        }
        .school-card h3 {
          font-family: var(--font-playfair), serif;
          font-size: 26px;
          color: #ffffff;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .school-card h3 span {
          font-family: var(--font-inter), sans-serif;
          font-size: 14px;
          color: #94a3b8;
          font-weight: 400;
          letter-spacing: 0;
          margin-left: 6px;
          vertical-align: middle;
        }
        .school-card .slogan {
          color: #38bdf8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }
        .school-card p {
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .school-card ul {
          list-style: none;
          padding: 0; margin: 0;
        }
        .school-card li {
          color: #94a3b8;
          font-size: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .school-card li strong {
          color: #f8fafc;
          font-weight: 600;
        }
        .school-card li::before {
          content: '→';
          color: #38bdf8;
          font-size: 16px;
          line-height: 1.2;
        }

        /* --- Placeholders --- */
        .bg-hero { background-image: url('/fondo-web-1.png'); background-position: center; }
        .bg-biografia { background-image: url('/fondo-pag.png'); background-position: center; }
        .bg-escuelas { background-image: url('/fondo-escuela.png'); background-position: center; }
        .bg-taller { background-image: url('/paulo-1.png'); }
        .bg-eventos { background-image: url('/fondo-logo.png'); }
        .bg-clases { background-image: url('/wave-light.jpeg'); }
        .bg-surf { background-image: url('/hero-ryder.jpeg'); }
        .bg-skate { background-image: url('/tomi-bock-fondo.png'); }

        /* --- RYDERS GRID --- */
        .ryders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 40px;
          width: 100%;
          max-width: 1400px;
        }
        .ryder-card {
          position: relative;
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          align-items: flex-end;
        }
        .ryder-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: #38bdf8;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(56, 189, 248, 0.2);
        }
        .ryder-img-wrapper {
          position: absolute;
          inset: 0;
          transition: transform 0.8s ease;
          opacity: 0.6;
        }
        .ryder-card:hover .ryder-img-wrapper {
          transform: scale(1.1);
          opacity: 0.8;
        }
        .ryder-info {
          position: relative;
          z-index: 2;
          padding: 24px 20px;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          text-align: left;
        }
        .ryder-prefix {
          color: #38bdf8;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-right: 8px;
        }
        .ryder-name {
          font-size: 13px;
          font-weight: 800;
          color: #000;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          line-height: 1.4;
        }
        .view-mag {
          margin-top: 12px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #94a3b8;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.3s;
        }
        .ryder-card:hover .view-mag {
          color: #38bdf8;
        }

        /* --- MODAL --- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 24px;
          cursor: pointer;
        }
        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 24px;
          text-align: center;
        }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-label {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          color: #f8fafc;
          padding: 12px 16px;
          border-radius: 6px;
          outline: none;
          transition: border 0.3s;
          font-size: 16px;
        }
        .form-input:focus { border-color: #38bdf8; }
        .btn-submit {
          width: 100%;
          background: #38bdf8;
          color: #0f172a;
          border: none;
          padding: 14px;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 1px;
          border-radius: 6px;
          cursor: pointer;
          text-transform: uppercase;
          transition: background 0.3s;
        }
        .btn-submit:hover { background: #0ea5e9; }
        
        .msg { padding: 12px; border-radius: 6px; font-size: 13px; text-align: center; margin-bottom: 20px; }
        .msg.error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .msg.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
      `}</style>

      {/* --- CABECERA --- */}
      <header className="header">
        <div className="nav-left">
          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <Link href="/">
            <img src="/logo-pag.png" alt="Logo Wave" className="logo-img" />
          </Link>
          <div className="dropdown">
            <button className="dropdown-trigger">{t.btn_ingreso}</button>
            <div className="dropdown-content">
              <button onClick={() => setShowModal(true)}>{t.btn_cliente}</button>
              <Link href="/login">{t.btn_colaborador}</Link>
            </div>
          </div>
        </div>

        <div className="nav-center">
          <ul className="massive-menu">
            <li><a href="#biografia">{t.menu_bio}</a></li> <span className="slash">/</span>
            <li><a href="#escuelas">{t.menu_escuelas}</a></li> <span className="slash">/</span>
            <li><a href="#taller">{t.menu_taller}</a></li> <span className="slash">/</span>
            <li><Link href="/ryders">{t.menu_ryders}</Link></li> <span className="slash">/</span>
            <li><a href="#eventos">{t.menu_eventos}</a></li> <span className="slash">/</span>
            <li><a href="#clases">{t.menu_clases}</a></li> <span className="slash">/</span>
            <li><a href="#surf">{t.menu_surf}</a></li> <span className="slash">/</span>
            <li><a href="#skate">{t.menu_skate}</a></li> <span className="slash">/</span>
            <li><a href="#contenido">{t.menu_contenido}</a></li> <span className="slash">/</span>
            <li><a href="#contacto">{t.menu_contacto}</a></li> <span className="slash">/</span>
            <li><a style={{ color: '#38bdf8' }}>{t.menu_carro}</a></li>
          </ul>
        </div>

        <div className="nav-right">
          <div className="dropdown lang-dropdown">
            <button className="dropdown-trigger">{LANGUAGES.find(l => l.code === lang)?.code.toUpperCase()} ▼</button>
            <div className="dropdown-content">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FLYOUT MENU */}
      {menuOpen && (
        <div className="mobile-flyout">
          <a href="#biografia" onClick={() => setMenuOpen(false)}>{t.menu_bio}</a>
          <a href="#escuelas" onClick={() => setMenuOpen(false)}>{t.menu_escuelas}</a>
          <a href="#taller" onClick={() => setMenuOpen(false)}>{t.menu_taller}</a>
          <a href="#ryders" onClick={() => setMenuOpen(false)}>{t.menu_ryders}</a>
          <a href="#eventos" onClick={() => setMenuOpen(false)}>{t.menu_eventos}</a>
          <a href="#clases" onClick={() => setMenuOpen(false)}>{t.menu_clases}</a>
          <a href="#surf" onClick={() => setMenuOpen(false)}>{t.menu_surf}</a>
          <a href="#skate" onClick={() => setMenuOpen(false)}>{t.menu_skate}</a>
          <a href="#contenido" onClick={() => setMenuOpen(false)}>{t.menu_contenido}</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>{t.menu_contacto}</a>
          <a style={{ color: '#38bdf8' }}>{t.menu_carro}</a>
        </div>
      )}

      {/* --- SECCIONES PARALLAX --- */}

      <section className="px-section" id="hero">
        <div className="px-bg-wrapper">
          <Image 
            src="/portada.png" 
            alt="Hero Background" 
            fill 
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="px-overlay" style={{ background: 'linear-gradient(to bottom, transparent, rgba(11, 17, 32, 1))'}} />
        <div className="px-content">
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.hero_title }} />
          <p className="hero-subtitle">{t.hero_subtitle}</p>
        </div>
      </section>

      <section className="px-section" id="biografia">
        <div className="px-bg-wrapper">
          <Image src="/logo-black.png" alt="Biografia" fill style={{ objectFit: 'contain', opacity: 0.1 }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <div className="seccion-biografia">
            <h2 className="titulo-bio">{t.menu_bio}</h2>
            <p className="texto-bio">{t.sec_bio_sub}</p>
          </div>
        </div>
      </section>

      <section className="px-section" id="escuelas">
        <div className="px-bg-wrapper">
          <Image src="/tomy-escuela.png" alt="Escuelas" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" style={{ background: 'rgba(11, 17, 32, 0.2)' }} />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_escuelas}</h2>
          <p className="hero-subtitle">{t.sec_escuelas_sub}</p>

          <div className="schools-grid">
            <Link href="/spots/concon" style={{ textDecoration: 'none' }}>
              <div className="school-card">
                <h3>SEDE CONCÓN <span>(Sede Matriz)</span></h3>
                <div className="slogan">El corazón de Wave Surf Club.</div>
                <p>Nuestra base histórica y el punto de encuentro principal. Ubicada estratégicamente para ofrecer las mejores condiciones de enseñanza en la zona central de Chile.</p>
                <ul>
                  <li><strong>Mirador Privado:</strong> Vista privilegiada al lineup para análisis de olas.</li>
                  <li><strong>Zona de Confort:</strong> Camarines equipados, Baños y Duchas con agua caliente.</li>
                  <li><strong>Skate Park Interno:</strong> Rampas técnicas para progresión fuera del agua.</li>
                  <li><strong>Área Lounge:</strong> Espacio de hidratación y descanso para alumnos y Ryders.</li>
                </ul>
              </div>
            </Link>
            
            <Link href="/spots/pichilemu" style={{ textDecoration: 'none' }}>
              <div className="school-card">
                <h3>SEDE PICHILEMU <span>(Capital del Surf)</span></h3>
                <div className="slogan">Donde viven las leyendas.</div>
                <p>Ubicada en la meca del surf chileno, nuestra sede ofrece una experiencia de inmersión total en la cultura de tabla más potente del país.</p>
                <ul>
                  <li><strong>Infraestructura Pro:</strong> Diseñada para grupos grandes (universidades y colegios).</li>
                  <li><strong>Entrenamiento Funcional:</strong> Espacio dedicado a la preparación física específica.</li>
                  <li><strong>Vestidores Premium:</strong> Máxima comodidad tras sesiones de frío intenso.</li>
                  <li><strong>Acceso Directo:</strong> Ubicación clave para entrar al agua sin distracciones.</li>
                </ul>
              </div>
            </Link>
            
            <Link href="/spots/punta-piedra" style={{ textDecoration: 'none' }}>
              <div className="school-card">
                <h3>SEDE PUNTA PIEDRA <span>(Inauguración 2026)</span></h3>
                <div className="slogan">El futuro del deporte extremo.</div>
                <p>Nuestra sede más moderna y tecnológica. Un proyecto de vanguardia diseñado para elevar el estándar de las escuelas de surf en Chile.</p>
                <ul>
                  <li><strong>Arquitectura 360°:</strong> Mirador de última generación con vista panorámica.</li>
                  <li><strong>Rampas de Skate Pro:</strong> Bowl y secciones de Street de alta competencia.</li>
                  <li><strong>Accesibilidad Universal:</strong> Baños y accesos diseñados para la inclusión total.</li>
                  <li><strong>Showroom Wave:</strong> Espacio para ver las últimas tendencias en equipo y tablas.</li>
                </ul>
              </div>
            </Link>
          </div>

        </div>
      </section>

      <section className="px-section" id="taller">
        <div className="px-bg-wrapper">
          <Image src="/paulo-1.png" alt="Taller" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_taller}</h2>
          <p className="hero-subtitle">{t.sec_taller_sub}</p>
        </div>
      </section>

      <section className="px-section" id="ryders" style={{ minHeight: 'auto', padding: '120px 40px' }}>
        <div className="px-bg-wrapper">
          <Image 
            src="/fondo-escuela.png" 
            alt="Ryders Background" 
            fill 
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="px-overlay" style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))' }} />
        <div className="px-content" style={{ maxWidth: '100%', margin: '0' }}>
          <h2 className="section-marker" style={{ marginBottom: '8px', color: '#000' }}>{t.menu_ryders}</h2>
          <p className="hero-subtitle" style={{ marginBottom: '60px', color: '#000', textShadow: 'none' }}>{t.sec_ryders_sub}</p>
          
          <RidersSection />
        </div>
      </section>

      <section className="px-section" id="eventos">
        <div className="px-bg-wrapper">
          <Image src="/fondo-logo.png" alt="Eventos" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_eventos}</h2>
          <p className="hero-subtitle">{t.sec_eventos_sub}</p>
        </div>
      </section>

      <section className="px-section" id="clases">
        <div className="px-bg-wrapper">
          <Image src="/wave-light.jpeg" alt="Clases" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_clases}</h2>
          <p className="hero-subtitle">{t.sec_clases_sub}</p>
        </div>
      </section>

      <section className="px-section" id="surf">
        <div className="px-bg-wrapper">
          <Image src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80" alt="Surf" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_surf}</h2>
          <p className="hero-subtitle">{t.sec_surf_sub}</p>
        </div>
      </section>

      <section className="px-section" id="skate">
        <div className="px-bg-wrapper">
          <Image src="https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1920&q=80" alt="Skate" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h2 className="section-marker">{t.menu_skate}</h2>
          <p className="hero-subtitle">{t.sec_skate_sub}</p>
        </div>
      </section>

      {/* --- MODAL REGISTRO CLIENTE --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 className="modal-title">{t.mod_title}</h3>
            
            {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleRegisterClient}>
              <div className="form-group">
                <label className="form-label">{t.mod_name}</label>
                <input required type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.mod_rut}</label>
                <input required type="text" className="form-input" value={rut} onChange={e => setRut(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.mod_email}</label>
                <input required type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.mod_phone}</label>
                <input required type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t.mod_processing : t.mod_submit}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
