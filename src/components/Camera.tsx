
import React, { useRef, useEffect, useState } from 'react';
import { loadObjectDetectionModel, detectObjects, detectObstacles } from '../services/objectDetectionService';
import { useNavigation } from '../context/NavigationContext';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Camera as CameraIcon } from 'lucide-react';

type CameraProps = {
  onObstacleDetected: () => void;
};

const Camera: React.FC<CameraProps> = ({ onObstacleDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const { setObstacleDetected } = useNavigation();

  // Initialize camera and model
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Use back camera on mobile
          audio: false,
        });
        
        videoRef.current.srcObject = stream;
        
        // Wait for video to be loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };

        // Load the object detection model
        await loadObjectDetectionModel();
        setIsModelLoaded(true);
        toast.success('Camera and object detection ready');
        
      } catch (error) {
        console.error('Error setting up camera:', error);
        setDetectionError('Could not access camera. Please check permissions.');
        toast.error('Could not access camera');
      }
    }

    setupCamera();

    // Cleanup function
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
      if (!isModelLoaded || !videoRef.current || !videoRef.current.readyState) return;
      
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

    if (isModelLoaded) {
      // Run detection every 1 second
      detectionInterval = window.setInterval(runDetection, 1000);
    }

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isModelLoaded, onObstacleDetected, setObstacleDetected]);

  return (
    <div className="relative w-full">
      {detectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{detectionError}</AlertDescription>
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
          {!isModelLoaded && (
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
        Camera is scanning for obstacles
      </p>
    </div>
  );
};

export default Camera;
