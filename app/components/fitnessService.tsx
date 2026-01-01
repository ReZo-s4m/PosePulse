"use client";

import Link from "next/link";
import { Dumbbell, Utensils, Activity } from "lucide-react";

export default function FitnessServices() {
    return (
        <div className="bg-transparent text-white py-16 px-10">
            <h2 className="text-4xl font-bold mb-10">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col">
                    <Dumbbell className="text-cyan-400 w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold">Guides & Workouts</h3>
                    <p className="text-gray-400 mt-2">
                        Access expert-curated workout guides designed to help you achieve your fitness goals effectively.
                    </p>
                    <Link href="/guide" className="text-white font-semibold mt-3 hover:underline">
                        Learn more →
                    </Link>
                </div>

                <div className="flex flex-col">
                    <Utensils className="text-purple-400 w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold">Diet & Nutrition Plans</h3>
                    <p className="text-gray-400 mt-2">
                        Personalized AI powered meal plans tailored to your fitness goals, ensuring optimal nutrition and performance.
                    </p>
                    <Link href="/diet" className="text-white font-semibold mt-3 hover:underline">
                        Learn more →
                    </Link>
                </div>
                <div className="flex flex-col">
                    <Activity className="text-orange-400 w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold">Live Exercise Tracking</h3>
                    <p className="text-gray-400 mt-2">
                        Track your workouts in real-time with insights with Machine learning models, ensuring maximum efficiency.
                    </p>
                    <Link href="/exercise" className="text-white font-semibold mt-3 hover:underline">
                        Learn more →
                    </Link>
                </div>
            </div>
        </div>
    );
}
