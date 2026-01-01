/* eslint-disable */
import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateAngle , KEYPOINT_DICT } from './PoseUtils';

// States for exercise tracking
export enum ExerciseState {
  UNKNOWN = 'UNKNOWN',
  STARTING = 'STARTING',
  DOWN = 'DOWN',
  UP = 'UP',
  PARTIAL = 'PARTIAL'
}

// Exercise types
export enum ExerciseType {
  BICEP_CURL = 'BICEP_CURL',
  SHOULDER_PRESS = 'SHOULDER_PRESS',
  SQUAT = 'SQUAT'
}

// For backward compatibility
export const BicepCurlState = ExerciseState;

// Base configuration for all exercises
export interface BaseExerciseConfig {
  // Minimum confidence needed for reps
  minConfidence: number;
  
  // Minimum time (ms) that needs to pass between reps
  minTimeBetweenReps: number;
}

// Configuration for bicep curl detection
export interface BicepCurlConfig extends BaseExerciseConfig {
  // Angle thresholds for bicep curl states
  downAngleThreshold: number;  // When the arm is extended (larger angle)
  upAngleThreshold: number;    // When the arm is curled (smaller angle)
  // Smoothing factor for angle values (0..1)
  smoothingAlpha?: number;
}

// Configuration for shoulder press detection
export interface ShoulderPressConfig extends BaseExerciseConfig {
  // Angle thresholds for shoulder press states
  downAngleThreshold: number;  // When arms are down (larger angle)
  upAngleThreshold: number;    // When arms are up (smaller angle)
}

// Configuration for squat detection
export interface SquatConfig extends BaseExerciseConfig {
  // Angle thresholds for squat states
  standingAngleThreshold: number;  // When standing (larger angle)
  squattingAngleThreshold: number; // When squatting (smaller angle)
}

// Default configuration values
export const DEFAULT_BICEP_CURL_CONFIG: BicepCurlConfig = {
  downAngleThreshold: 150,  // Arm is considered "down" when angle > 150 degrees
  upAngleThreshold: 70,     // Arm is considered "up" when angle < 70 degrees
  minConfidence: 0.6,       // Minimum confidence for keypoints
  minTimeBetweenReps: 700,  // 700ms minimum between reps to avoid double counting
  smoothingAlpha: 0.35,
};

export const DEFAULT_SHOULDER_PRESS_CONFIG: ShoulderPressConfig = {
  downAngleThreshold: 90,   // Arms considered "down" when angle > 90 degrees 
  upAngleThreshold: 30,     // Arms considered "up" when angle < 30 degrees
  minConfidence: 0.6,
  minTimeBetweenReps: 500,
};

export const DEFAULT_SQUAT_CONFIG: SquatConfig = {
  standingAngleThreshold: 160, // Knees almost straight when standing
  squattingAngleThreshold: 90, // Knees bent when squatting
  minConfidence: 0.6,
  minTimeBetweenReps: 800,     // Slightly longer to avoid double counting
};

// Base exercise tracker class
export class ExerciseTracker {
  protected state: ExerciseState = ExerciseState.UNKNOWN;
  protected leftRepCount: number = 0;
  protected rightRepCount: number = 0;
  protected lastRepTime: number = 0;
  
  constructor() {}
  
  public reset() {
    this.state = ExerciseState.UNKNOWN;
    this.leftRepCount = 0;
    this.rightRepCount = 0;
    this.lastRepTime = 0;
  }
  
  public getRepCounts() {
    return {
      left: this.leftRepCount,
      right: this.rightRepCount,
      total: this.leftRepCount + this.rightRepCount,
    };
  }
  
  public getState() {
    return this.state;
  }
  
  public processPose(pose: poseDetection.Pose): boolean {
    // To be implemented by child classes
    return false;
  }
}

export class BicepCurlTracker extends ExerciseTracker {
  private config: BicepCurlConfig;
  private currentLeftAngle: number | null = null;
  private currentRightAngle: number | null = null;
  private smoothingAlpha: number = 0.35;
  
  constructor(config: Partial<BicepCurlConfig> = {}) {
    super();
    this.config = {
      ...DEFAULT_BICEP_CURL_CONFIG,
      ...config,
    };
    // set smoothing alpha from config if provided
    if (this.config.smoothingAlpha !== undefined) this.smoothingAlpha = this.config.smoothingAlpha;
  }
  
  public reset() {
    super.reset();
    this.currentLeftAngle = null;
    this.currentRightAngle = null;
  }
  
  public getCurrentAngles() {
    return {
      left: this.currentLeftAngle,
      right: this.currentRightAngle,
    };
  }
  
  public processPose(pose: poseDetection.Pose): boolean {
    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return false;
    }
    
    const keypoints = pose.keypoints;
    let repIncremented = false;
    
    // Process left arm
    const leftShoulder = keypoints[KEYPOINT_DICT.left_shoulder];
    const leftElbow = keypoints[KEYPOINT_DICT.left_elbow];
    const leftWrist = keypoints[KEYPOINT_DICT.left_wrist];
    
    // Process right arm
    const rightShoulder = keypoints[KEYPOINT_DICT.right_shoulder];
    const rightElbow = keypoints[KEYPOINT_DICT.right_elbow];
    const rightWrist = keypoints[KEYPOINT_DICT.right_wrist];
    
    // Calculate raw arm angles
    const rawLeft = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rawRight = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Apply simple exponential smoothing to reduce jitter
    if (rawLeft !== null) {
      this.currentLeftAngle = this.currentLeftAngle === null ? rawLeft : (this.currentLeftAngle * (1 - this.smoothingAlpha) + rawLeft * this.smoothingAlpha);
    } else {
      this.currentLeftAngle = null;
    }

    if (rawRight !== null) {
      this.currentRightAngle = this.currentRightAngle === null ? rawRight : (this.currentRightAngle * (1 - this.smoothingAlpha) + rawRight * this.smoothingAlpha);
    } else {
      this.currentRightAngle = null;
    }
    
    // Check if angles are valid
    const leftValid = this.currentLeftAngle !== null;
    const rightValid = this.currentRightAngle !== null;
    
    // Process left arm rep
    if (leftValid) {
      repIncremented = this.processArmRep(
        this.currentLeftAngle!,
        true,
        () => this.leftRepCount++
      ) || repIncremented;
    }
    
    // Process right arm rep
    if (rightValid) {
      repIncremented = this.processArmRep(
        this.currentRightAngle!,
        false,
        () => this.rightRepCount++
      ) || repIncremented;
    }
    
    return repIncremented;
  }
  
  private processArmRep(
    angle: number, 
    isLeftArm: boolean, 
    incrementRep: () => void
  ): boolean {
    const now = Date.now();
    let repIncremented = false;
    
    // Check if enough time has passed since the last rep
    const timeSinceLastRep = now - this.lastRepTime;
    const canCountNewRep = timeSinceLastRep > this.config.minTimeBetweenReps;
    
    // Update state based on the angle
    if (this.state === ExerciseState.UNKNOWN || this.state === ExerciseState.STARTING) {
      if (angle > this.config.downAngleThreshold) {
        this.state = ExerciseState.DOWN;
      }
    } else if (this.state === ExerciseState.DOWN) {
      if (angle < this.config.upAngleThreshold) {
        this.state = ExerciseState.UP;
        
        if (canCountNewRep) {
          incrementRep();
          this.lastRepTime = now;
          repIncremented = true;
        }
      }
    } else if (this.state === ExerciseState.UP) {
      if (angle > this.config.downAngleThreshold) {
        this.state = ExerciseState.DOWN;
      }
    }
    
    return repIncremented;
  }
}

export class ShoulderPressTracker extends ExerciseTracker {
  private config: ShoulderPressConfig;
  private currentLeftAngle: number | null = null;
  private currentRightAngle: number | null = null;
  
  constructor(config: Partial<ShoulderPressConfig> = {}) {
    super();
    this.config = {
      ...DEFAULT_SHOULDER_PRESS_CONFIG,
      ...config,
    };
  }
  
  public reset() {
    super.reset();
    this.currentLeftAngle = null;
    this.currentRightAngle = null;
  }
  
  public getCurrentAngles() {
    return {
      left: this.currentLeftAngle,
      right: this.currentRightAngle,
    };
  }
  
  public processPose(pose: poseDetection.Pose): boolean {
    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return false;
    }
    
    const keypoints = pose.keypoints;
    let repIncremented = false;
    
    // For shoulder press, we look at the angle between shoulder, elbow, and wrist
    // Process left arm
    const leftShoulder = keypoints[KEYPOINT_DICT.left_shoulder];
    const leftElbow = keypoints[KEYPOINT_DICT.left_elbow];
    const leftWrist = keypoints[KEYPOINT_DICT.left_wrist];
    
    // Process right arm
    const rightShoulder = keypoints[KEYPOINT_DICT.right_shoulder];
    const rightElbow = keypoints[KEYPOINT_DICT.right_elbow];
    const rightWrist = keypoints[KEYPOINT_DICT.right_wrist];
    
    // Calculate shoulder angles
    this.currentLeftAngle = calculateAngle(leftWrist, leftElbow, leftShoulder);
    this.currentRightAngle = calculateAngle(rightWrist, rightElbow, rightShoulder);
    
    // Check if angles are valid
    const leftValid = this.currentLeftAngle !== null;
    const rightValid = this.currentRightAngle !== null;
    
    // Process left arm rep
    if (leftValid) {
      repIncremented = this.processArmRep(
        this.currentLeftAngle!,
        true,
        () => this.leftRepCount++
      ) || repIncremented;
    }
    
    // Process right arm rep
    if (rightValid) {
      repIncremented = this.processArmRep(
        this.currentRightAngle!,
        false,
        () => this.rightRepCount++
      ) || repIncremented;
    }
    
    return repIncremented;
  }
  
  private processArmRep(
    angle: number, 
    isLeftArm: boolean, 
    incrementRep: () => void
  ): boolean {
    const now = Date.now();
    let repIncremented = false;
    
    // Check if enough time has passed since the last rep
    const timeSinceLastRep = now - this.lastRepTime;
    const canCountNewRep = timeSinceLastRep > this.config.minTimeBetweenReps;
    
    // Update state based on the angle
    if (this.state === ExerciseState.UNKNOWN || this.state === ExerciseState.STARTING) {
      if (angle > this.config.downAngleThreshold) {
        this.state = ExerciseState.DOWN;
      }
    } else if (this.state === ExerciseState.DOWN) {
      if (angle < this.config.upAngleThreshold) {
        this.state = ExerciseState.UP;
        
        if (canCountNewRep) {
          incrementRep();
          this.lastRepTime = now;
          repIncremented = true;
        }
      }
    } else if (this.state === ExerciseState.UP) {
      if (angle > this.config.downAngleThreshold) {
        this.state = ExerciseState.DOWN;
      }
    }
    
    return repIncremented;
  }
}

export class SquatTracker extends ExerciseTracker {
  private config: SquatConfig;
  private currentLeftKneeAngle: number | null = null;
  private currentRightKneeAngle: number | null = null;
  
  constructor(config: Partial<SquatConfig> = {}) {
    super();
    this.config = {
      ...DEFAULT_SQUAT_CONFIG,
      ...config,
    };
  }
  
  public reset() {
    super.reset();
    this.currentLeftKneeAngle = null;
    this.currentRightKneeAngle = null;
  }
  
  public getCurrentAngles() {
    return {
      left: this.currentLeftKneeAngle,
      right: this.currentRightKneeAngle,
    };
  }
  
  public processPose(pose: poseDetection.Pose): boolean {
    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return false;
    }
    
    const keypoints = pose.keypoints;
    let repIncremented = false;
    
    // For squats, we focus on the knee angle between hip, knee, and ankle
    const leftHip = keypoints[KEYPOINT_DICT.left_hip];
    const leftKnee = keypoints[KEYPOINT_DICT.left_knee];
    const leftAnkle = keypoints[KEYPOINT_DICT.left_ankle];
    
    const rightHip = keypoints[KEYPOINT_DICT.right_hip];
    const rightKnee = keypoints[KEYPOINT_DICT.right_knee];
    const rightAnkle = keypoints[KEYPOINT_DICT.right_ankle];
    
    // Calculate knee angles
    this.currentLeftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    this.currentRightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // For squats, we'll use the average of both knees for better tracking
    const averageKneeAngle = this.calculateAverageKneeAngle();
    
    if (averageKneeAngle !== null) {
      repIncremented = this.processSquatRep(averageKneeAngle);
    }
    
    return repIncremented;
  }
  
  private calculateAverageKneeAngle(): number | null {
    // If both knee angles are valid, use the average
    if (this.currentLeftKneeAngle !== null && this.currentRightKneeAngle !== null) {
      return (this.currentLeftKneeAngle + this.currentRightKneeAngle) / 2;
    } 
    // If only one knee angle is valid, use that one
    else if (this.currentLeftKneeAngle !== null) {
      return this.currentLeftKneeAngle;
    } 
    else if (this.currentRightKneeAngle !== null) {
      return this.currentRightKneeAngle;
    }
    
    // No valid knee angles
    return null;
  }
  
  private processSquatRep(kneeAngle: number): boolean {
    const now = Date.now();
    let repIncremented = false;
    
    // Check if enough time has passed since the last rep
    const timeSinceLastRep = now - this.lastRepTime;
    const canCountNewRep = timeSinceLastRep > this.config.minTimeBetweenReps;
    
    // Update state based on the angle
    if (this.state === ExerciseState.UNKNOWN || this.state === ExerciseState.STARTING) {
      if (kneeAngle > this.config.standingAngleThreshold) {
        this.state = ExerciseState.UP; // Standing position
      }
    } else if (this.state === ExerciseState.UP) { // Standing
      if (kneeAngle < this.config.squattingAngleThreshold) {
        this.state = ExerciseState.DOWN; // Squatting position
      }
    } else if (this.state === ExerciseState.DOWN) { // Squatting
      if (kneeAngle > this.config.standingAngleThreshold) {
        this.state = ExerciseState.UP; // Back to standing
        
        if (canCountNewRep) {
          // For squats, we count as a single rep since both legs work together
          this.leftRepCount++;
          this.rightRepCount++;
          this.lastRepTime = now;
          repIncremented = true;
        }
      }
    }
    
    return repIncremented;
  }
}
