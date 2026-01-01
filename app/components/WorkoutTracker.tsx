/* eslint-disable */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import RepCounter from './RepCounter';
import WorkoutStats from './WorkoutStats';
import { BicepCurlTracker, ExerciseState, ExerciseTracker } from '../lib/repCountingLogic';
import { CustomButton } from '@/components/ui/custom-button';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';


const PoseDetector = dynamic(() => import('./PoseDetector'), { 
  ssr: false 
});

const WorkoutTracker: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPose, setCurrentPose] = useState<any | null>(null);
  
  // Create a bicep curl tracker
  const [exerciseTracker] = useState<ExerciseTracker>(() => new BicepCurlTracker());
  
  const [repCounts, setRepCounts] = useState({ left: 0, right: 0, total: 0 });
  const [armAngles, setArmAngles] = useState({ left: null as number | null, right: null as number | null });
  const [workoutState, setWorkoutState] = useState(ExerciseState.UNKNOWN);
  
  // Workout statistics
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [repHistory, setRepHistory] = useState<{ time: number; count: number }[]>([]);
  
  const isMobile = useIsMobile();
  
  // Handle pose detection results
  const handlePoseDetected = useCallback((pose: any | null) => {
    setCurrentPose(pose);
    
    if (pose && isActive) {
      // Process the pose with the exercise tracker
      const repIncremented = exerciseTracker.processPose(pose);
      
      // Always update state, not just on rep increment
      const newCounts = exerciseTracker.getRepCounts();
      
      // Get angles from the tracker - safely cast to BicepCurlTracker to access getCurrentAngles
      const tracker = exerciseTracker as BicepCurlTracker;
      const newAngles = tracker.getCurrentAngles ? tracker.getCurrentAngles() : { left: null, right: null };
      
      setRepCounts(newCounts);
      setArmAngles(newAngles);
      setWorkoutState(exerciseTracker.getState());
      
      if (repIncremented) {
        // Show toast for rep
        toast.success(`Rep Counted! Total: ${newCounts.total} reps`, {
          duration: 1500,
        });
        
        // Update rep history for chart
        if (startTime) {
          const elapsed = (Date.now() - startTime) / 1000;
          setRepHistory(prev => [
            ...prev,
            { time: elapsed, count: newCounts.total }
          ]);
        }
      }
    }
  }, [isActive, exerciseTracker, startTime]);
  
  // Start/pause workout
  const toggleWorkout = useCallback(() => {
    setIsActive(prevIsActive => {
      const newIsActive = !prevIsActive;
      
      if (newIsActive) {
        // Starting workout
        if (!startTime) {
          setStartTime(Date.now());
          setRepHistory([{ time: 0, count: 0 }]);
        }
        
        toast.info("Workout Started", {
          description: "Position yourself so your body is visible"
        });
      } else {
        // Pausing workout
        toast.warning("Workout Paused", {
          description: `Current total: ${repCounts.total} reps`
        });
      }
      
      return newIsActive;
    });
  }, [startTime, repCounts.total]);
  
  // Reset workout
  const resetWorkout = useCallback(() => {
    setIsActive(false);
    exerciseTracker.reset();
    setRepCounts({ left: 0, right: 0, total: 0 });
    setArmAngles({ left: null, right: null });
    setWorkoutState(ExerciseState.UNKNOWN);
    setDuration(0);
    setStartTime(null);
    setRepHistory([]);
    
    toast.info("Workout Reset", {
      description: "Ready for a new session"
    });
  }, [exerciseTracker]);

  const router = useRouter();

  // Finish workout and save to backend
  const finishWorkout = useCallback(async () => {
    if (repCounts.total <= 0) {
      toast.error('No reps to save');
      return;
    }

    try {
      const payload = {
        exerciseName: 'Bicep Curl',
        totalReps: repCounts.total,
        duration,
        sets: undefined,
      };

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        toast.success('Workout saved');
        // reset after saving
        resetWorkout();
        // Navigate to dashboard to view
        router.push('/dashboard');
      } else {
        toast.error(json.error || 'Failed to save workout');
      }
    } catch (err) {
      console.error('Save workout error', err);
      toast.error('Network error');
    }
  }, [repCounts.total, duration, resetWorkout, router]);
  
  // Update duration when workout is active
  useEffect(() => {
    let intervalId: number;
    
    if (isActive && startTime) {
      intervalId = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, startTime]);
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in bg-black text-foreground rounded-xl">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 rounded-xl">
        <h2 className="text-2xl font-bold tracking-tight text-white">Bicep Curl Tracker</h2>
        
        <div className="flex space-x-3">
          <CustomButton
            onClick={toggleWorkout}
            variant={isActive ? "warning" : "primary"}
            className="flex items-center rounded-xl"
            type="button"
          >
            {isActive ? (
              <>
                <span className="w-4 h-4 mr-2 rounded-xl">⏸</span>
                Pause
              </>
            ) : (
              <>
                <span className="w-4 h-4 mr-2 rounded-xl">▶</span>
                Start
              </>
            )}
          </CustomButton>
          
          <CustomButton
            onClick={resetWorkout}
            variant="secondary"
            className="flex items-center rounded-xl"
            type="button"
          >
            <span className="w-4 h-4 mr-2 rounded-xl">↻</span>
            Reset
          </CustomButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-2 ${isMobile ? 'order-1' : ''}`}>
          <PoseDetector onPoseDetected={handlePoseDetected} isActive={isActive} />
        </div>
        
        <div className={`space-y-6 ${isMobile ? 'order-0' : ''}`}>
          <RepCounter
            leftCount={repCounts.left}
            rightCount={repCounts.right}
            totalCount={repCounts.total}
            state={workoutState}
            leftAngle={armAngles.left}
            rightAngle={armAngles.right}
            exerciseType="Bicep Curl"
          />
          
          <WorkoutStats
            duration={duration}
            totalReps={repCounts.total}
            repHistory={repHistory}
          />

          <div className="flex gap-3">
            <CustomButton onClick={finishWorkout} variant="primary">Finish Workout</CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;