/* eslint-disable */
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { drawPose, JOINT_CONFIDENCE_THRESHOLD } from '../lib/PoseUtils';
interface PoseDetectorProps {
  onPoseDetected: (pose: any | null) => void;
  isActive: boolean;
}

const PoseDetector: React.FC<PoseDetectorProps> = ({ onPoseDetected, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    async function initializeDetector() {
      try {
        setIsLoading(true);
        console.log("Initializing TensorFlow and detector...");

        const tf = await import('@tensorflow/tfjs');
        const poseDetection = await import('@tensorflow-models/pose-detection');
        
        await tf.ready();
        await tf.setBackend('webgl');
        console.log("TensorFlow backend set:", tf.getBackend());
        
        // Use the higher-accuracy MoveNet Thunder model and enable smoothing
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
            enableSmoothing: true,
          }
        );
        console.log("Pose detector created successfully");
        
        console.log("Pose detector created successfully");
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing pose detector:', err);
        setError('Failed to initialize pose detection. Please try again or check console for details.');
        setIsLoading(false);
      }
    }
    
    initializeDetector();
    

    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, []);
  

  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;
      
      try {
        console.log("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        
        console.log("Camera access granted");
        // Store stream in ref so we can stop it on cleanup
        streamRef.current = stream;
        videoRef.current.srcObject = streamRef.current;
        
        if (videoRef.current.readyState < 2) {
          await new Promise<void>((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                console.log("Video metadata loaded");
                resolve();
              };
            }
          });
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Unable to access your camera. Please check permissions and try again.');
      }
    }
    
    setupCamera();
      // Cleanup helper to stop camera and release hardware
      function stopCamera() {
        try {
          const s = streamRef.current ?? (videoRef.current?.srcObject as MediaStream | null);
          if (s) {
            s.getTracks().forEach((t) => {
              try { t.stop(); } catch (e) { /* ignore */ }
            });
          }
        } finally {
          if (videoRef.current) {
            try { videoRef.current.srcObject = null; } catch (e) { /* ignore */ }
          }
          streamRef.current = null;
        }
      }

      // Ensure camera is stopped on unmount, route change, refresh or page hide
      const handleBeforeUnload = () => stopCamera();
      const handlePageHide = () => stopCamera();
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') stopCamera();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        // Stop detection camera when the component unmounts
        stopCamera();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);
  
  useEffect(() => {
    function resizeCanvas() {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      console.log("Canvas resized to:", canvas.width, "x", canvas.height);
    }
    
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', resizeCanvas);
    }
    
    return () => {
      if (video) {
        video.removeEventListener('loadeddata', resizeCanvas);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      return;
    }
    
    async function detectPose() {
      if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
        requestAnimationFrameRef.current = requestAnimationFrame(detectPose);
        return;
      }
      
      try {
        if (videoRef.current.readyState >= 2) {
          // Detect pose
          const poses = await detectorRef.current.estimatePoses(videoRef.current);
          const pose = poses.length > 0 ? poses[0] : null;
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (pose) {
              // Compute average keypoint confidence and filter noisy poses
              const avgScore = pose.keypoints.reduce((s: number, k: any) => s + (k.score ?? 0), 0) / pose.keypoints.length;
              if (avgScore >= JOINT_CONFIDENCE_THRESHOLD) {
                drawPose(pose, ctx);
                onPoseDetected(pose);
              } else {
                // If overall confidence is low, treat as no pose
                onPoseDetected(null);
              }
            } else {
              onPoseDetected(null);
            }
          } else {
            onPoseDetected(pose);
          }
        }
      } catch (err) {
        console.error('Error during pose detection:', err);
      }
      
      requestAnimationFrameRef.current = requestAnimationFrame(detectPose);
    }
    
    if (!requestAnimationFrameRef.current) {
      console.log("Starting pose detection loop");
      requestAnimationFrameRef.current = requestAnimationFrame(detectPose);
    }
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, [isActive, onPoseDetected]);
  
  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10 rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading pose detection model...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10 rounded-lg">
          <div className="bg-card p-4 rounded-lg shadow-lg max-w-xs text-center">
            <p className="text-destructive font-medium mb-2">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              className="mt-3 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{transform: 'scaleX(-1)'}}
        />
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{transform: 'scaleX(-1)'}}
        />
      </div>
    </div>
  );
};

export default PoseDetector;