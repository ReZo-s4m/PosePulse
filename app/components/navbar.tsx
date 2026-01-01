"use client";

import Link from 'next/link';
import { useState, useEffect } from "react";

export default function Navbar() {
    
    const [currentPath, setCurrentPath] = useState('/');

    useEffect(() => {
        if (typeof window !== 'undefined') setCurrentPath(window.location.pathname);
    }, []);

    return (
        <div className={`${currentPath === '/' ? 'bg-muted' : 'bg-black'} top-0 z-50 w-full left-0 right-0 absolute py-3`}>
            <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center">
                <div className="flex justify-between items-center w-full md:w-auto">
                    <div className="text-xl md:text-2xl flex items-center text-white font-extrabold"> 
                        <Link href='/' className="hover:opacity-90">PosePulse</Link>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center w-full mt-4 md:mt-0 md:justify-center md:ml-8 ">
                    <Link href='/dashboard' className="mx-5 my-1 text-sm lg:text-base text-white hover:text-gray-400">Dashboard</Link>
                    <Link href='/guide' className="mx-5 my-1 text-sm lg:text-base text-white hover:text-gray-400">Guide</Link>
                    <Link href='/diet' className="mx-5 my-1 text-sm lg:text-base text-white hover:text-gray-400">Diet Plans</Link>
                    <Link href='/exercise' className="mx-5 my-1 text-sm lg:text-base text-white hover:text-gray-400">Exercise</Link>
                    <Link href='/' className="mx-5 my-1 text-sm lg:text-base text-white hover:text-gray-400">Pricing</Link>
                </div>
            </div>
        </div>
    );
}