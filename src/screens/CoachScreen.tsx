import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming,
  SlideInDown, FadeIn,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';

import { OverlayCanvas } from '../components/OverlayCanvas';
import { BoxingEngine } from '../engine/boxingEngine';
import { DanceEngine } from '../engine/danceEngine';
import { rhythmEngine } from '../engine/rhythmEngine';
import { useCoachStore, CoachMode } from '../store/coachStore';
import { useHistoryStore } from '../store/historyStore';

const { width, height } = Dimensions.get('window');

// Simulated pose data for demo until TFJS model loads
// In production, this is replaced by the usePose hook
const DEMO_KEYPOINTS = Array.from({ length: 33 }, (_, i) => ({
  x: width * 0.3 + Math.sin(i * 0.5) * 80,
  y: 100 + i * 20,
  score: 0.9,
  name: `kp_${i}`,
}));

export default function CoachScreen() {
  const { mode } = useRoute().params as { mode: CoachMode };
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const { addScore } = useCoachStore();

  // HUD state
  const [feedback, setFeedback] = useState('Get into position...');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [bpm, setBpm] = useState(0);
  const [fps, setFps] = useState(0);

  // Reanimated values
  const pulse = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  // Frame tracking
  const frameRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // Simulated analysis loop (runs at ~10fps)
  useEffect(() => {
    const interval = setInterval(() => {
      frameRef.current++;
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      setFps(Math.round(1000 / Math.max(1, dt)));

      // Generate slightly varying demo poses
      const jitter = () => (Math.random() - 0.5) * 20;
      const demoPoses = [{
        keypoints: DEMO_KEYPOINTS.map(kp => ({
          ...kp,
          x: kp.x + jitter(),
          y: kp.y + jitter(),
        })),
      }];

      if (mode === 'boxing') {
        const result = BoxingEngine.analyze(demoPoses, demoPoses, dt);
        setFeedback(result.lastFeedback);
        setScore(result.score);
        setIsCorrect(result.jabDetected || result.guardCorrect);
        const rhythm = rhythmEngine.analyze(result.jabDetected, now);
        setBpm(rhythm.bpm);
      } else {
        const result = DanceEngine.analyze(demoPoses);
        setFeedback(result.lastFeedback);
        const s = Math.floor(result.postureScore * 100);
        setScore(s);
        setIsCorrect(result.aramandiCorrect);
        const rhythm = rhythmEngine.analyze(result.aramandiCorrect, now);
        setBpm(rhythm.bpm);
      }

      // Pulse animation on correct detection
      if (isCorrect) {
        scoreScale.value = withSequence(withSpring(1.25), withSpring(1));
        pulse.value = withSequence(withTiming(1.4, { duration: 80 }), withTiming(1, { duration: 250 }));
      }
    }, 100);

    return () => {
      clearInterval(interval);
      // Save session on exit
      if (score > 0) {
        addScore(score);
        useHistoryStore.getState().addSession({
          mode, feedback, timestamp: Date.now(),
        });
      }
    };
  }, [mode, isCorrect]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    borderColor: isCorrect ? '#00FF88' : '#FF3B5C',
    opacity: pulse.value > 1.1 ? 0.5 : 0,
  }));

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  // Request camera permission
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Camera Layer */}
      {permission?.granted && (
        <ExpoCameraView style={styles.camera} facing="front" />
      )}

      {/* Skeleton Overlay */}
      <OverlayCanvas
        poses={[{ keypoints: DEMO_KEYPOINTS }]}
        mode={mode}
      />

      {/* Pulse Ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      {/* Top HUD */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.topHud}>
        <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.exitText}>← EXIT</Text>
        </TouchableOpacity>
        <BlurView intensity={40} tint="dark" style={styles.fpsBadge}>
          <Text style={styles.fpsText}>{fps} FPS</Text>
        </BlurView>
      </Animated.View>

      {/* Bottom Feedback Card */}
      <Animated.View entering={SlideInDown.delay(200).duration(600)} style={styles.bottomHud}>
        <BlurView
          intensity={50}
          tint={isCorrect ? 'light' : 'dark'}
          style={[styles.feedbackCard, isCorrect ? styles.correctCard : styles.defaultCard]}
        >
          <View style={styles.feedbackRow}>
            <View style={styles.feedbackTextArea}>
              <Text style={[styles.modeTag, isCorrect && styles.modeTagCorrect]}>
                {mode.toUpperCase()}
              </Text>
              <Text style={[styles.feedbackText, isCorrect && styles.feedbackTextCorrect]}>
                {feedback}
              </Text>
            </View>
            <Animated.View style={[styles.scoreCircle, scoreAnimStyle, isCorrect && styles.scoreCircleCorrect]}>
              <Text style={[styles.scoreVal, isCorrect && styles.scoreValCorrect]}>{score}</Text>
              <Text style={[styles.scoreLbl, isCorrect && styles.scoreLblCorrect]}>PTS</Text>
            </Animated.View>
          </View>
          {bpm > 0 && (
            <View style={styles.rhythmRow}>
              <View style={[styles.rhythmBar, { backgroundColor: isCorrect ? '#050510' : '#FF3B5C' }]} />
              <Text style={[styles.bpmText, { color: isCorrect ? '#050510' : '#FF3B5C' }]}>
                {bpm} BPM
              </Text>
            </View>
          )}
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  pulseRing: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    borderWidth: 6, top: height / 2 - 110, left: width / 2 - 110,
  },
  topHud: {
    position: 'absolute', top: 60, left: 24, right: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  exitBtn: {
    backgroundColor: 'rgba(255,59,92,0.8)', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 22,
  },
  exitText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  fpsBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, overflow: 'hidden' },
  fpsText: { color: '#00D4FF', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  bottomHud: { position: 'absolute', bottom: 44, left: 20, right: 20 },
  feedbackCard: { borderRadius: 32, padding: 24, overflow: 'hidden', borderWidth: 2 },
  defaultCard: { borderColor: 'rgba(255,59,92,0.3)' },
  correctCard: { borderColor: '#00FF88' },
  feedbackRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedbackTextArea: { flex: 1, marginRight: 16 },
  modeTag: { fontSize: 10, fontWeight: '800', letterSpacing: 3, color: 'rgba(255,255,255,0.35)', marginBottom: 6 },
  modeTagCorrect: { color: 'rgba(5,5,16,0.5)' },
  feedbackText: { fontSize: 22, fontWeight: '900', color: '#FFF', lineHeight: 28 },
  feedbackTextCorrect: { color: '#050510' },
  scoreCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreCircleCorrect: { borderColor: '#050510', backgroundColor: 'rgba(5,5,16,0.12)' },
  scoreVal: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  scoreValCorrect: { color: '#050510' },
  scoreLbl: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.3)' },
  scoreLblCorrect: { color: 'rgba(5,5,16,0.5)' },
  rhythmRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  rhythmBar: { height: 4, flex: 1, borderRadius: 2, opacity: 0.4, marginRight: 12 },
  bpmText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
});
