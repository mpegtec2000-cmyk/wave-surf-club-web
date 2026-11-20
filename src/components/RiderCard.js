'use client';

import './RiderCard.css';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const RiderCard = ({ ryder: rider }) => {
  const isVacio = rider.nombre === 'VACÍO';
  const imageSrc = rider.ocupado
    ? (rider.cover || (rider.id === 1 ? '/CARUSEL EQUIPO/tomy-escuela.png' : '/paulo-1.png'))
    : '/CARUSEL/3.jpg';

  return (
    <Link href={!isVacio ? `/riders/${rider.slug}` : '/riders'} className="rc-link">
      <article className="rc-card">
        <div className="rc-media">
          <Image
            src={imageSrc}
            alt={rider.nombre}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="rc-img"
            style={{ objectFit: 'cover', objectPosition: rider.objectPosition || 'center top' }}
          />
          <span className="rc-badge">RIDER</span>
        </div>

        <div className="rc-body">
          <div>
            <span className="rc-status">{rider.estado}</span>
            <h3 className="rc-name">{rider.nombre}</h3>
          </div>
          <span className="rc-arrow">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </article>
    </Link>
  );
};

export default RiderCard;
