import * as FileSystem from 'expo-file-system';
import { initLlama, LlamaContext } from 'llama.rn';
import { useHistoryStore } from '../store/historyStore';

const MODEL_URI = 'https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat-GGUF/resolve/main/qwen1_5-0_5b-chat-q4_k_m.gguf';
const MODEL_NAME = 'qwen1_5-0_5b-chat-q4_k_m.gguf';

export type CoachMode = 'fitness' | 'dance' | 'yoga' | 'martial_arts' | 'rehabilitation';

const COACH_PROFILES: Record<CoachMode, string> = {
  fitness: 'You are an expert fitness coach. Analyze body positioning and give crisp, actionable feedback on form, posture, and alignment. Focus on injury prevention.',
  dance: 'You are a professional dance instructor. Analyze movement flow, rhythm, and body lines. Give feedback on grace, timing, and expression.',
  yoga: 'You are a certified yoga instructor. Analyze pose alignment, breathing cues, and balance. Focus on proper form and mindful movement.',
  martial_arts: 'You are a martial arts sensei. Analyze stance, guard position, strike form, and footwork. Focus on power generation and defense.',
  rehabilitation: 'You are a physical therapist. Analyze movement range, compensatory patterns, and symmetry. Focus on safe progression and pain avoidance.',
};

export class CoachService {
  private context: LlamaContext | null = null;
  public isReady = false;
  public currentMode: CoachMode = 'fitness';
  private sessionStart: number = 0;

  public async downloadModel(onProgress: (progress: number) => void): Promise<string> {
    const dest = `${FileSystem.documentDirectory}${MODEL_NAME}`;
    const fileInfo = await FileSystem.getInfoAsync(dest);

    if (fileInfo.exists) {
      onProgress(100);
      return dest;
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      MODEL_URI,
      dest,
      {},
      (downloadProgress) => {
        const progress = (downloadProgress.totalBytesWritten || 0) / (downloadProgress.totalBytesExpectedToWrite || 1e9);
        onProgress(Math.min(progress * 100, 100));
      }
    );

    const result = await downloadResumable.downloadAsync();
    return result?.uri || dest;
  }

  public async initialize(modelPath: string) {
    if (this.context) {
      try { await this.context.release(); } catch(e) {}
    }

    const cleanPath = modelPath.replace('file://', '');
    this.context = await initLlama({
      model: cleanPath,
      use_mlock: true,
      n_ctx: 1024,
      n_gpu_layers: 0,
    });
    this.isReady = true;
    this.sessionStart = Date.now();
  }

  public setMode(mode: CoachMode) {
    this.currentMode = mode;
  }

  public async getFeedback(motionData: string[]): Promise<string> {
    if (!this.context) throw new Error('Coach engine not loaded');

    const analysisContext = motionData.join(' ');
    const systemPrompt = COACH_PROFILES[this.currentMode];

    const response = await this.context.completion({
      messages: [
        { role: 'system', content: systemPrompt + ' Give a single, punchy 10-word sentence of feedback.' },
        { role: 'user', content: `Motion data: ${analysisContext}\nGive me my coaching tip.` },
      ],
      n_predict: 30,
      temperature: 0.2,
      stop: ['</s>', '<|end|>', '<|im_end|>', '<|eot_id|>'],
    });

    const feedback = response.text.trim();

    // Record session entry in persistent store
    useHistoryStore.getState().addSession({
      timestamp: Date.now(),
      mode: this.currentMode,
      feedback,
    });

    return feedback;
  }

  public getHistory() {
    return useHistoryStore.getState().history;
  }

  public getStats() {
    const history = useHistoryStore.getState().history;
    const total = history.length;
    const byMode: Record<string, number> = {};
    for (const entry of history) {
      byMode[entry.mode] = (byMode[entry.mode] || 0) + 1;
    }
    return { 
      totalFeedbacks: total, 
      byMode, 
      sessionDuration: Math.floor((Date.now() - this.sessionStart) / 1000) 
    };
  }

  public async release() {
    if (this.context) {
      await this.context.release();
      this.context = null;
    }
    this.isReady = false;
  }
}

export const coachService = new CoachService();
