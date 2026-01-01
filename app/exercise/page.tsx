
'use client';

import React from 'react';
import WorkoutTracker from '../components/WorkoutTracker';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-1">
        <div className='h-20'></div>
        <WorkoutTracker />
      </main>
    </div>
  );
}
