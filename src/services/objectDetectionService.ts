
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Initialize the COCO-SSD model
let model: cocoSsd.ObjectDetection | null = null;

export async function loadObjectDetectionModel() {
  try {
    // Load the model
    console.log('Loading object detection model...');
    model = await cocoSsd.load();
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading object detection model:', error);
    throw error;
  }
}

export async function detectObjects(video: HTMLVideoElement) {
  if (!model) {
    console.error('Model not loaded');
    return [];
  }

  try {
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
