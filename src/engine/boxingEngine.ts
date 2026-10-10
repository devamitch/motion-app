import { MovementAnalyzer, Point } from '../services/movementAnalyzer';

export interface BoxingState {
  jabDetected: boolean;
  hookDetected: boolean;
  guardCorrect: boolean;
  peakVelocity: number;
  score: number;
  lastFeedback: string;
}

export class BoxingEngine {
  private static JAB_ANGLE_THRESHOLD = 160;
  private static GUARD_DISTANCE_THRESHOLD = 0.15; // Normalized
  private static VELOCITY_THRESHOLD = 0.4;

  static analyze(poses: any[], prevPoses: any[], dt: number): BoxingState {
    const state: BoxingState = {
      jabDetected: false, hookDetected: false, guardCorrect: false,
      peakVelocity: 0, score: 0, lastFeedback: 'Keep Guard Up'
    };

    if (!poses || poses.length === 0) return state;

    const current = poses[0].keypoints;
    const previous = prevPoses[0]?.keypoints;

    // 1. Guard Check (Hands near chin)
    const leftWrist = current[15];
    const rightWrist = current[16];
    const nose = current[0];

    const distL = MovementAnalyzer.calculateDistance(leftWrist, nose);
    const distR = MovementAnalyzer.calculateDistance(rightWrist, nose);

    state.guardCorrect = distL < 150 && distR < 150; // Simple pixel threshold check

    // 2. Jab Detection (Left hand extension)
    const leftElbow = current[13];
    const leftShoulder = current[11];
    const elbowAngle = MovementAnalyzer.calculateAngle(leftShoulder, leftElbow, leftWrist);

    if (elbowAngle > this.JAB_ANGLE_THRESHOLD) {
      if (previous) {
        const vel = MovementAnalyzer.calculateVelocity(previous[15], leftWrist, dt);
        state.peakVelocity = vel;
        if (vel > this.VELOCITY_THRESHOLD) {
          state.jabDetected = true;
          state.lastFeedback = 'Solid Jab!';
          state.score = Math.min(100, Math.floor(vel * 20));
        }
      }
    }

    // 3. Hook Detection (Elbow angle near 90 + horizontal travel)
    if (!state.jabDetected && elbowAngle > 70 && elbowAngle < 110) {
      const horizontalTravel = Math.abs(leftWrist.x - (previous?.[15]?.x || leftWrist.x));
      if (horizontalTravel > 50) {
        state.hookDetected = true;
        state.lastFeedback = 'Nice Hook!';
        state.score = 85;
      }
    }

    return state;
  }
}
