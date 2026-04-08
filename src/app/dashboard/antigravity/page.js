import AntigravityPlayground from '@/components/AntigravityPlayground';

export const metadata = {
  title: 'Antigravity Playground | Wave Surf ERP',
  description: 'Procesamiento y evaluación de agentes inteligentes.',
};

export default function AntigravityPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <AntigravityPlayground />
    </div>
  );
}
