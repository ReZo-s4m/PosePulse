/* eslint-disable */
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export default function DietSuggestion() {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setDietPlan(null);

    try {
      const response = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch diet plan: ${response.statusText}`);
      }

      const result = await response.json();
      setDietPlan(result);
    } catch (error) {
      console.error("Error fetching diet plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row py-36 min-h-screen bg-black text-white p-6 space-y-6 md:space-y-0 md:space-x-10">
      {/* Input Section */}
      <div className="space-y-4 w-full md:w-1/3">
        <h1 className="text-2xl font-bold mb-6">Personalized Diet Suggestion</h1>

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <Input
            type="text"
            placeholder="Age"
            {...register("age", { required: true })}
            className={`bg-gray-800 py-4 w-[350px] text-white rounded-xl border-gray-700 ${errors.age ? 'border-red-500' : ''}`}
          />
          {errors.age && <p className="text-red-500 mt-1">Age is required.</p>}

          <Input
            type="text"
            placeholder="Height (cm)"
            {...register("height", { required: true })}
            className={`bg-gray-800 w-[350px] text-white rounded-xl py-4 border-gray-700 ${errors.height ? 'border-red-500' : ''}`}
          />
          {errors.height && <p className="text-red-500 mt-1">Height is required.</p>}

          <Input
            type="text"
            placeholder="Weight (kg)"
            {...register("weight", { required: true })}
            className={`bg-gray-800 w-[350px] text-white rounded-xl py-4 border-gray-700 ${errors.weight ? 'border-red-500' : ''}`}
          />
          {errors.weight && <p className="text-red-500 mt-1">Weight is required.</p>}

          <Button type="submit" disabled={loading} className={`w-[250px] rounded-xl py-3 bg-blue-${loading ? '400' : '600'} text-white mt-4`}>
            {!loading ? "Get Diet Plan" : (
              <>
                Loading...
                <Loader size={16} className="ml-2 animate-spin" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Diet Plan Section */}
      <div className="flex-1">
        {loading ? (
          <div className="animate-pulse bg-gray-700 h-64 rounded-lg w-full max-w-md p-6"></div>
        ) : dietPlan ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(dietPlan).map(([day, meals]: any) => (
              <div key={day} className="bg-[#212126] p-6 rounded-xl shadow-lg text-white">
                <h3 className="text-lg font-bold capitalize mb-2">{day}</h3>
                <p><strong>Breakfast:</strong> {meals.breakfast}</p>
                <p><strong>Lunch:</strong> {meals.lunch}</p>
                <p><strong>Dinner:</strong> {meals.dinner}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Enter your details to get a personalized diet plan.</p>
        )}
      </div>
    </div>
  );
}
