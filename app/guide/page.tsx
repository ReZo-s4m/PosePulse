/* eslint-disable */
"use client";
import React, { useState } from "react";
import { Dumbbell, ChevronRight, Search, X } from "lucide-react";
import { excercise } from "../lib/excercise";

const exercises = {
  chest: excercise.chest,
  back: excercise.back,
  legs: excercise.legs,
  shoulders: excercise.shoulders,
  arms: excercise.arms,
  core: excercise.core,
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = Object.keys(exercises) as Array<keyof typeof exercises>;
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof exercises>("chest");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const filteredExercises = exercises[selectedCategory].filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <header className="pt-28 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-cyan-400" />
              <h1 className="ml-3 text-2xl font-bold text-white">Exercise Library</h1>
            </div>
            <div className="relative">
            <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search exercises..."
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
            <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
            >
            {category}
            </button>
        ))}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-[#121213]  rounded-xl shadow-sm overflow-hidden hover:shadow-md  cursor-pointer p-4 hover:scale-[1.03] transition ease-in-out duration-200"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white py-2">{exercise.name}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {exercise.muscle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-[#121213] p-6 rounded-xl max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedExercise(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-white">{selectedExercise?.name}</h2>
            <div className="aspect-video bg-gray-100">
              <img src={selectedExercise?.gif_url} alt={selectedExercise?.name} className="w-full h-full object-contain" />
            </div>
            <div className="mt-4 space-y-2 text-white">
              <p>{` 1. ${selectedExercise?.description1}`}</p>
              <p>{` 2. ${selectedExercise?.description2}`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
