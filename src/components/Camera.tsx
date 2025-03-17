
import React, { useRef, useEffect, useState } from 'react';
import { loadObjectDetectionModel, detectObjects, detectObstacles } from '../services/objectDetectionService';
import { useNavigation } from '../context/NavigationContext';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Camera as CameraIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CameraProps = {
  onObstacleDetected: () => void;
};

const Camera: React.FC<CameraProps> = ({ onObstacleDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const { setObstacleDetected } = useNavigation();

  // Initialize camera and model
  useEffect(() => {
    setupCamera();
  }, []);

  const setupCamera = async () => {
    if (!videoRef.current) return;

    try {
      // First try to initialize the TensorFlow model
      await loadObjectDetectionModel();
      setIsModelLoaded(true);
      
      // Then try to access the camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });
      
      videoRef.current.srcObject = stream;
      setCameraPermission('granted');
      
      // Wait for video to be loaded
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      };

      toast.success('Camera and object detection ready');
      
    } catch (error) {
      console.error('Error setting up camera:', error);
      
      // Handle specific error cases
      if ((error as Error).name === 'NotAllowedError') {
        setCameraPermission('denied');
        setDetectionError('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if ((error as Error).message?.includes('backend')) {
        // TensorFlow backend error
        setDetectionError('Object detection model could not be initialized. This may be due to browser compatibility issues.');
      } else {
        setDetectionError('Could not access camera or initialize detection model.');
      }
      
      toast.error('Camera initialization failed');
    }
  };

  // Cleanup function for camera stream
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Run detection loop
  useEffect(() => {
    let detectionInterval: number;
    
    const runDetection = async () => {
      if (!isModelLoaded || !videoRef.current || !videoRef.current.readyState || cameraPermission !== 'granted') return;
      
      setIsDetecting(true);
      
      try {
        // Detect objects in the video stream
        const predictions = await detectObjects(videoRef.current);
        
        // Check if any obstacles are detected
        const obstacles = detectObstacles(predictions);
        
        if (obstacles.length > 0) {
          console.log('Obstacle detected:', obstacles);
          setObstacleDetected(true);
          onObstacleDetected();
          
          // Show toast alert
          toast.warning(`Obstacle detected: ${obstacles[0].class}`, {
            description: 'Rerouting to avoid obstacle'
          });
        }
      } catch (error) {
        console.error('Detection error:', error);
      } finally {
        setIsDetecting(false);
      }
    };

    if (isModelLoaded && cameraPermission === 'granted') {
      // Run detection every 1 second
      detectionInterval = window.setInterval(runDetection, 1000);
    }

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isModelLoaded, onObstacleDetected, setObstacleDetected, cameraPermission]);

  const handleRetry = () => {
    setDetectionError(null);
    setCameraPermission('pending');
    setupCamera();
  };

  return (
    <div className="relative w-full">
      {detectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{detectionError}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </Alert>
      )}
      
      <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-black">
        <video
          ref={videoRef}
          className="w-full h-60 object-cover"
          playsInline
          muted
        />
        
        {/* Camera UI elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Detection indicator */}
          {isDetecting && (
            <div className="absolute top-4 right-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-soft"></div>
            </div>
          )}
          
          {/* Loading indicator or camera not ready */}
          {(!isModelLoaded || cameraPermission !== 'granted') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              <div className="text-center">
                <CameraIcon className="mx-auto h-12 w-12 mb-2 animate-pulse" />
                <p>Initializing camera...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2 text-center">
        {cameraPermission === 'granted' 
          ? 'Camera is scanning for obstacles' 
          : 'Please allow camera access for obstacle detection'}
      </p>
    </div>
  );
};

export default Camera;
