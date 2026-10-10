export interface Point {
  x: number;
  y: number;
  z?: number;
  score?: number;
}

export class MovementAnalyzer {
  /**
   * Calculates the angle between three points (A, B, C) where B is the vertex.
   * angle = arccos( (AB · BC) / (|AB| |BC|) )
   */
  static calculateAngle(a: Point, b: Point, c: Point): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return angle;
  }

  /**
   * Calculates velocity (pixels per ms) between two points over a time delta.
   */
  static calculateVelocity(p1: Point, p2: Point, dt: number): number {
    if (dt <= 0) return 0;
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return distance / dt;
  }

  /**
   * Calculates the Euclidean distance between two points.
   */
  static calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Normalizes points to a standard box [0, 1] for pose matching.
   */
  static normalizePoints(points: Point[]): Point[] {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    return points.map(p => ({
      x: (p.x - minX) / (maxX - minX || 1),
      y: (p.y - minY) / (maxY - minY || 1),
      z: p.z,
      score: p.score
    }));
  }

  /**
   * Computes symmetry score (0-1) between left and right side points.
   * e.g. Left Elbow height vs Right Elbow height relative to shoulders.
   */
  static calculateSymmetry(left: Point, right: Point, center: Point): number {
    const dLeft = this.calculateDistance(left, center);
    const dRight = this.calculateDistance(right, center);
    const diff = Math.abs(dLeft - dRight);
    const max = Math.max(dLeft, dRight);
    return Math.max(0, 1 - diff / (max || 1));
  }
}
