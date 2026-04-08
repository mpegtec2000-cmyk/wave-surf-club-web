import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata = {
  title: 'WAVE SURF CLUB — ERP & POS | Since 2015',
  description: 'Sistema ERP logístico y Punto de Venta para Wave Surf Club. Gestión de inventario, ventas, clientes y sucursales.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${inter.className}`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
