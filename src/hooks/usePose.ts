import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from 'expo-camera';
import { Platform } from 'react-native';
import { poseDetectorService } from '../services/poseDetector';

export function usePose() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [poses, setPoses] = useState<poseDetection.Pose[]>([]);
  const [fps, setFps] = useState(0);

  const requestPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  useEffect(() => {
    async function init() {
      await requestPermission();
      await poseDetectorService.initialize();
      setIsTfReady(poseDetectorService.isReady);
    }
    init();
  }, []);

  const handleCameraStream = useCallback(
    async (images: IterableIterator<tf.Tensor3D>, updatePreview: any, gl: any) => {
      const loop = async () => {
        if (!poseDetectorService.isReady) return;

        const nextImageTensor = images.next().value;
        if (!nextImageTensor) return;

        const start = Date.now();
        const detectedPoses = await poseDetectorService.estimatePoses(
          nextImageTensor, 
          Platform.OS === 'ios' ? false : true
        );
        
        const end = Date.now();
        setFps(Math.round(1000 / (Math.max(1, end - start))));
        setPoses(detectedPoses);

        tf.dispose(nextImageTensor);
        requestAnimationFrame(loop);
      };

      loop();
    },
    []
  );

  return {
    isTfReady,
    hasPermission,
    poses,
    fps,
    handleCameraStream,
  };
}
