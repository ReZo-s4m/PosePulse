
import React from 'react';
import { ExerciseState } from '../lib/repCountingLogic';
import { CustomProgress } from '@/components/ui/custom-progess';

interface RepCounterProps {
  leftCount: number;
  rightCount: number;
  totalCount: number;
  state: ExerciseState;
  leftAngle: number | null;
  rightAngle: number | null;
  exerciseType?: string;
}

const RepCounter: React.FC<RepCounterProps> = ({
  leftCount,
  rightCount,
  totalCount,
  state,
  leftAngle,
  rightAngle,
  exerciseType = "Bicep Curl"
}) => {
  // Helper to get state text and color
  const getStateInfo = (state: ExerciseState) => {
    switch (state) {
      case ExerciseState.DOWN:
        return { text: 'Down Position', color: 'bg-blue-100 text-blue-800' };
      case ExerciseState.UP:
        return { text: 'Up Position', color: 'bg-green-100 text-green-800' };
      case ExerciseState.PARTIAL:
        return { text: 'Partial Rep', color: 'bg-yellow-100 text-yellow-800' };
      case ExerciseState.STARTING:
        return { text: 'Get Ready', color: 'bg-purple-100 text-purple-800' };
      case ExerciseState.UNKNOWN:
      default:
        return { text: 'Waiting For Pose', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const stateInfo = getStateInfo(state);
  
  // Format angle to one decimal place
  const formatAngle = (angle: number | null): string => {
    if (angle === null) return 'N/A';
    return `${angle.toFixed(1)}°`;
  };

  // Show different labels based on exercise type
  const getLeftRightLabels = () => {
    if (exerciseType === "Squat") {
      return { left: "Left Knee", right: "Right Knee" };
    }
    return { left: "Left Arm", right: "Right Arm" };
  };

  const labels = getLeftRightLabels();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">{exerciseType} Counter</h3>
      
      <div className="space-y-4">
        {/* Current state */}
        <div 
          className={`${stateInfo.color} px-3 py-2 rounded-md text-center font-medium`}
        >
          {stateInfo.text}
        </div>
        
        {/* Total count */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Reps</p>
          <p className="text-4xl font-bold">{totalCount}</p>
        </div>
        
        {/* Individual arm/leg counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">{labels.left}</p>
            <p className="text-2xl font-semibold">{leftCount}</p>
            <p className="text-xs text-gray-500 mt-1">Angle: {formatAngle(leftAngle)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">{labels.right}</p>
            <p className="text-2xl font-semibold">{rightCount}</p>
            <p className="text-xs text-gray-500 mt-1">Angle: {formatAngle(rightAngle)}</p>
          </div>
        </div>
        
        {/* Arm/leg angles visualization */}
        {(leftAngle !== null || rightAngle !== null) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Angles</p>
            
            {leftAngle !== null && (
              <CustomProgress
                label={labels.left}
                value={leftAngle}
                max={180}
                barColor="bg-blue-500"
                showValue={true}
              />
            )}
            
            {rightAngle !== null && (
              <CustomProgress
                label={labels.right}
                value={rightAngle}
                max={180}
                barColor="bg-green-500"
                showValue={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepCounter;