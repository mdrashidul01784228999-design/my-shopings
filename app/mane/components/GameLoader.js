'use client';
import dynamic from 'next/dynamic';
const Game = dynamic(() => import('./Game'), { ssr: false, loading: () => <div style={{ padding: 40 }}>লোড হচ্ছে...</div> });
export default function GameLoader() { return <Game />; }
