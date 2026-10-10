import { MovementAnalyzer, Point } from '../services/movementAnalyzer';

export interface DanceState {
  aramandiCorrect: boolean;
  symmetryScore: number;
  elbowSymmetry: number;
  postureScore: number;
  lastFeedback: string;
}

export class DanceEngine {
  private static ARAMANDI_ANGLE = 135;
  private static SYMMETRY_THRESHOLD = 0.9;

  static analyze(poses: any[]): DanceState {
    const state: DanceState = {
      aramandiCorrect: false, symmetryScore: 0, 
      elbowSymmetry: 0, postureScore: 0, 
      lastFeedback: 'Ready for Aramandi?'
    };

    if (!poses || poses.length === 0) return state;

    const current = poses[0].keypoints;

    // 1. Aramandi Check (Knee bend + stance wideness)
    const leftHip = current[23];
    const rightHip = current[24];
    const leftKnee = current[25];
    const rightKnee = current[26];
    const leftAnkle = current[27];
    const rightAnkle = current[28];

    const lKneeAngle = MovementAnalyzer.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rKneeAngle = MovementAnalyzer.calculateAngle(rightHip, rightKnee, rightAnkle);

    const isBent = lKneeAngle < this.ARAMANDI_ANGLE && rKneeAngle < this.ARAMANDI_ANGLE;
    const isWide = MovementAnalyzer.calculateDistance(leftKnee, rightKnee) > 
                   MovementAnalyzer.calculateDistance(leftHip, rightHip) * 1.5;

    state.aramandiCorrect = isBent && isWide;
    if (state.aramandiCorrect) state.lastFeedback = 'Perfect Aramandi!';
    else if (isBent) state.lastFeedback = 'Widen your knees';

    // 2. Arm Symmetry (Shoulder-Elbow-Wrist)
    const center = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const leftWrist = current[15];
    const rightWrist = current[16];
    
    state.symmetryScore = MovementAnalyzer.calculateSymmetry(leftWrist, rightWrist, center);
    
    // 3. Posture (Vertical alignment nose to hips)
    const nose = current[0];
    const verticalDiff = Math.abs(nose.x - center.x);
    state.postureScore = Math.max(0, 1 - verticalDiff / 100); // Inverse error

    return state;
  }
}
