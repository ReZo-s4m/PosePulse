
import * as poseDetection from '@tensorflow-models/pose-detection';

// Key points indices for the MoveNet model
export const KEYPOINT_DICT = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16,
};

// Colors for visualization
export const POSE_CONNECTIONS = [
  // Shoulders to Elbows
  [KEYPOINT_DICT.left_shoulder, KEYPOINT_DICT.left_elbow],
  [KEYPOINT_DICT.right_shoulder, KEYPOINT_DICT.right_elbow],
  // Elbows to Wrists
  [KEYPOINT_DICT.left_elbow, KEYPOINT_DICT.left_wrist],
  [KEYPOINT_DICT.right_elbow, KEYPOINT_DICT.right_wrist],
  // Shoulders to Hips
  [KEYPOINT_DICT.left_shoulder, KEYPOINT_DICT.left_hip],
  [KEYPOINT_DICT.right_shoulder, KEYPOINT_DICT.right_hip],
  // Shoulders
  [KEYPOINT_DICT.left_shoulder, KEYPOINT_DICT.right_shoulder],
];

export const JOINT_CONFIDENCE_THRESHOLD = 0.6;

export function drawKeypoints(
  keypoints: poseDetection.Keypoint[],
  ctx: CanvasRenderingContext2D,
  keypointIndices: number[] = []
) {
  const indices = keypointIndices.length ? keypointIndices : keypoints.map((_, i) => i);
  
  for (let i = 0; i < indices.length; i++) {
    const keypoint = keypoints[indices[i]];
    
    if (keypoint.score && keypoint.score >= JOINT_CONFIDENCE_THRESHOLD) {
      const { x, y } = keypoint;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 153, 255, 0.9)';
      ctx.fill();
    }
  }
}

export function drawConnections(
  keypoints: poseDetection.Keypoint[],
  connections: number[][],
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < connections.length; i++) {
    const [start, end] = connections[i];
    const startPoint = keypoints[start];
    const endPoint = keypoints[end];
    
    if (
      startPoint.score && 
      endPoint.score && 
      startPoint.score >= JOINT_CONFIDENCE_THRESHOLD && 
      endPoint.score >= JOINT_CONFIDENCE_THRESHOLD
    ) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0, 153, 255, 0.8)';
      ctx.stroke();
    }
  }
}

export function drawPose(pose: poseDetection.Pose, ctx: CanvasRenderingContext2D) {
  if (!pose || !pose.keypoints || !pose.keypoints.length) return;
  
  // Clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw pose keypoints
  drawKeypoints(pose.keypoints, ctx);
  
  // Draw connections between keypoints
  drawConnections(pose.keypoints, POSE_CONNECTIONS, ctx);
}

// Calculate angle between three points
export function calculateAngle(
  firstPoint: poseDetection.Keypoint,
  midPoint: poseDetection.Keypoint,
  lastPoint: poseDetection.Keypoint
) {
  if (
    !firstPoint || 
    !midPoint || 
    !lastPoint || 
    !firstPoint.score || 
    !midPoint.score || 
    !lastPoint.score || 
    firstPoint.score < JOINT_CONFIDENCE_THRESHOLD || 
    midPoint.score < JOINT_CONFIDENCE_THRESHOLD || 
    lastPoint.score < JOINT_CONFIDENCE_THRESHOLD
  ) {
    return null;
  }
  
  // Calculate vectors from the midpoint
  const v1 = {
    x: firstPoint.x - midPoint.x,
    y: firstPoint.y - midPoint.y,
  };
  
  const v2 = {
    x: lastPoint.x - midPoint.x,
    y: lastPoint.y - midPoint.y,
  };
  
  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  
  // Calculate magnitudes
  const v1Magnitude = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Magnitude = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  // Calculate the angle in radians
  const angleRad = Math.acos(dotProduct / (v1Magnitude * v2Magnitude));
  
  // Convert to degrees
  const angleDeg = (angleRad * 180) / Math.PI;
  
  return angleDeg;
}
