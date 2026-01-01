
import React from 'react';
import { CustomProgress } from '@/components/ui/custom-progess';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WorkoutStatsProps {
  duration: number;
  totalReps: number;
  repHistory: { time: number; count: number }[];
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  duration,
  totalReps,
  repHistory
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate stats
  const repsPerMinute = duration > 0
    ? ((totalReps / duration) * 60).toFixed(1)
    : '0.0';
  
  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-md text-white p-4">
      <h3 className="text-lg font-semibold mb-4">Workout Stats</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Duration</span>
            <span className="text-sm font-medium">{formatTime(duration)}</span>
          </div>
          <CustomProgress
            value={duration % 60}
            max={60}
            barColor="bg-blue-500"
            size="md"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Reps per Minute</span>
            <span className="text-sm font-medium">{repsPerMinute}</span>
          </div>
          <CustomProgress
            value={parseFloat(repsPerMinute)}
            max={30}
            barColor="bg-green-500"
            size="md"
          />
        </div>
        
        {repHistory.length > 1 && (
          <div className="h-40 mt-4">
            <p className="text-sm font-medium mb-2">Rep Progress</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(value) => formatTime(value)}
                  label={{ value: 'Time', position: 'insideBottomRight', offset: 0 }}
                  stroke="currentColor"
                />
                <YAxis 
                  label={{ value: 'Reps', angle: -90, position: 'insideLeft' }}
                  stroke="currentColor"
                />
                <Tooltip
                  formatter={(value) => [`${value} reps`, 'Count']}
                  labelFormatter={(label) => `Time: ${formatTime(label as number)}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutStats;