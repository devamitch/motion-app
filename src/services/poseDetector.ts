import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

const MODEL_CONFIG = {
  runtime: 'tfjs', 
  modelType: 'full',
  enableSmoothing: true,
};

export class PoseDetectorService {
  private detector: poseDetection.PoseDetector | null = null;
  public isReady = false;

  public async initialize(): Promise<void> {
    await tf.ready();
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      MODEL_CONFIG as any
    );
    this.isReady = true;
  }

  public async estimatePoses(imageTensor: tf.Tensor3D, flipHorizontal: boolean = true): Promise<poseDetection.Pose[]> {
    if (!this.detector) return [];
    return this.detector.estimatePoses(imageTensor, { flipHorizontal });
  }

  public getDetector() {
    return this.detector;
  }
}

export const poseDetectorService = new PoseDetectorService();
