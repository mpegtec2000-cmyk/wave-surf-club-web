import { Inter, Syne, Space_Grotesk, Space_Mono, Playfair_Display, Montserrat, Archivo_Black } from 'next/font/google';
import './globals.css';
import StyledJsxRegistry from '@/lib/styled-jsx-registry';
import { I18nProvider } from '@/lib/i18n-context';
import { CartProvider } from '@/lib/cart-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const archivo = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo' });

export const metadata = {
  title: 'WAVE SURF CLUB® — Surf, Skate & Ocean Culture | Since 2015',
  description: 'Wave Surf Club Chile. Escuela de surf, Mega Ramp skate, taller de shaping sustentable en Agave y tienda oficial en Concón, Pichilemu y Punta de Piedra.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${syne.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${playfair.variable} ${montserrat.variable} ${archivo.variable} ${spaceGrotesk.className} antialiased`}>
        <StyledJsxRegistry>
          <I18nProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </I18nProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
