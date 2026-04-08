'use client';

import Link from 'next/link';

const RyderCard = ({ ryder }) => {
  const isVacio = ryder.nombre === "VACÍO";
  
  // Imagen de placeholder si no hay ocupado
  const imageSrc = ryder.ocupado 
    ? (ryder.id === 1 ? '/tomy-escuela.png' : ryder.id === 2 ? '/paulo-1.png' : `/img/ryders/${ryder.id}.jpg`)
    : "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80";

  return (
    <Link href={!isVacio ? `/ryders/${ryder.slug}` : "#"} className="card-link">
      <div className="ryder-card group">
        <div className="img-container">
          <img 
            src={imageSrc} 
            alt={ryder.nombre}
            className="ryder-img"
          />
        </div>

        <div className="info-container">
          <p className="prefix">RYDER |</p>
          <h3 className="name">{ryder.nombre}</h3>
          <p className="status">{ryder.estado}</p>
        </div>
        
        {ryder.ocupado && <div className="overlay" />}
      </div>

      <style jsx>{`
        .card-link {
          text-decoration: none;
          display: block;
        }
        .ryder-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          aspect-ratio: 1 / 1;
        }
        .ryder-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-4px);
        }

        .img-container {
          width: 100%;
          height: 66.66%;
          background: #f1f5f9;
          overflow: hidden;
          border-bottom: 1px solid #f1f5f9;
        }
        .ryder-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s ease;
        }
        .ryder-card:hover .ryder-img {
          transform: scale(1.05);
        }

        .info-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 33.33%;
          padding: 1rem;
          text-align: center;
        }

        .prefix {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #2563eb;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .name {
          font-size: 14px;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
          line-height: 1.2;
          margin: 0;
        }
        .status {
          font-size: 9px;
          color: #94a3b8;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: -0.025em;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.05);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ryder-card:hover .overlay {
          opacity: 1;
        }

        @media (min-width: 768px) {
          .name { font-size: 16px; }
        }
      `}</style>
    </Link>
  );
};

export default RyderCard;
