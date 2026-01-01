'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
      <Link href="/" className="flex items-center space-x-2">
        <Activity className="w-6 h-6 text-primary animate-pulse" />
        <h1 className="text-xl font-medium tracking-tight">BicepTracker</h1>
      </Link>
      <div className="text-sm font-medium text-muted-foreground">
        Precision Rep Tracking
      </div>
    </header>
  );
};

export default Header;
