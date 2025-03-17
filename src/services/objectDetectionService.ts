
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Initialize the COCO-SSD model
let model: cocoSsd.ObjectDetection | null = null;
let modelLoadingPromise: Promise<cocoSsd.ObjectDetection> | null = null;

export async function loadObjectDetectionModel() {
  // If model is already loaded, return it
  if (model) {
    return model;
  }
  
  // If model is currently loading, return the promise
  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }
  
  // Start loading the model
  modelLoadingPromise = (async () => {
    try {
      // Make sure TensorFlow.js has a backend (WebGL, WASM, or CPU)
      await tf.ready();
      
      // Try to use WebGL backend first as it's faster
      if (!tf.findBackend('webgl')) {
        try {
          await tf.setBackend('webgl');
          console.log('Using WebGL backend');
        } catch (e) {
          console.warn('WebGL backend not available:', e);
        }
      }
      
      // Fall back to CPU if WebGL is not available
      if (!tf.getBackend()) {
        try {
          await tf.setBackend('cpu');
          console.log('Fallback to CPU backend');
        } catch (e) {
          console.warn('CPU backend not available:', e);
        }
      }
      
      // Confirm we have a backend
      if (!tf.getBackend()) {
        throw new Error('No TensorFlow.js backend available');
      }
      
      // Load the model
      console.log('Loading object detection model...');
      model = await cocoSsd.load();
      console.log('Model loaded successfully');
      return model;
    } catch (error) {
      console.error('Error loading object detection model:', error);
      modelLoadingPromise = null; // Reset loading promise so we can try again
      throw error;
    }
  })();
  
  return modelLoadingPromise;
}

export async function detectObjects(video: HTMLVideoElement) {
  if (!model) {
    console.error('Model not loaded');
    return [];
  }

  try {
    // Check if video is ready
    if (!video.readyState) {
      console.warn('Video not ready for object detection');
      return [];
    }
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video has invalid dimensions');
      return [];
    }
    
    // Perform detection
    const predictions = await model.detect(video);
    return predictions;
  } catch (error) {
    console.error('Error during object detection:', error);
    return [];
  }
}

// Check if detected objects are considered obstacles
export function detectObstacles(predictions: cocoSsd.DetectedObject[], threshold = 0.6) {
  // Define object classes that are considered obstacles
  const obstacleClasses = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck', 'traffic light', 'stop sign'];
  
  // Filter predictions to only include obstacles with high confidence
  const obstacles = predictions.filter(
    prediction => 
      obstacleClasses.includes(prediction.class) && 
      prediction.score >= threshold
  );
  
  return obstacles;
}
