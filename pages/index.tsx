/**
 * Overview: index.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import dynamic from 'next/dynamic';

// Use dynamic import to prevent SSR issues with browser-only features
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
  return <App />;
}