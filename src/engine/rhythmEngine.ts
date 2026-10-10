export interface RhythmState {
  bpm: number;
  consistency: number;
  onBeat: boolean;
  score: number;
  lastFeedback: string;
}

export class RhythmEngine {
  private static MAX_HISTORY = 10;
  private peakHistory: number[] = [];
  private lastPeakTime = 0;

  public analyze(isPeak: boolean, currentTime: number): RhythmState {
    const state: RhythmState = {
      bpm: 0, consistency: 0, onBeat: false,
      score: 0, lastFeedback: 'Find your rhythm'
    };

    if (isPeak) {
      if (this.lastPeakTime > 0) {
        const delta = currentTime - this.lastPeakTime;
        if (delta > 300 && delta < 2000) { // Valid human rhythmic window
          this.peakHistory.push(delta);
          if (this.peakHistory.length > RhythmEngine.MAX_HISTORY) {
            this.peakHistory.shift();
          }
        }
      }
      this.lastPeakTime = currentTime;
    }

    if (this.peakHistory.length >= 2) {
      const avg = this.peakHistory.reduce((a, b) => a + b, 0) / this.peakHistory.length;
      state.bpm = Math.round(60000 / avg);
      
      // Calculate variance (consistency)
      const variance = this.peakHistory.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / this.peakHistory.length;
      state.consistency = Math.max(0, 100 - Math.sqrt(variance) / 5);
      state.score = state.consistency;

      if (state.consistency > 90) state.lastFeedback = 'Perfect Timing!';
      else if (state.consistency > 70) state.lastFeedback = 'Good Rhythm';
      else state.lastFeedback = 'Slow down / Speed up';
    }

    return state;
  }

  public reset() {
    this.peakHistory = [];
    this.lastPeakTime = 0;
  }
}

export const rhythmEngine = new RhythmEngine();
