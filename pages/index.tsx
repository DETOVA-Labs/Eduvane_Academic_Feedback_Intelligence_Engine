import dynamic from 'next/dynamic';

// Use dynamic import to prevent SSR issues with browser-only features
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
  return <App />;
}