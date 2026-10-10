import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn, SlideInDown, useAnimatedStyle,
} from 'react-native-reanimated';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { OverlayCanvas } from './OverlayCanvas';

const { width, height } = Dimensions.get('window');

interface CameraViewProps {
  mode: 'boxing' | 'dance';
  poses: any[];
  feedback: string;
  score: number;
  bpm: number;
  fps: number;
  isCorrect: boolean;
  pulseScale: Animated.SharedValue<number>;
  scoreScale: Animated.SharedValue<number>;
  onExit: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  mode, poses, feedback, score, bpm, fps, isCorrect,
  pulseScale, scoreScale, onExit,
}) => {
  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    borderColor: isCorrect ? '#00FF88' : '#FF3B5C',
    opacity: pulseScale.value > 1.1 ? 0.5 : 0,
  }));

  return (
    <View style={styles.container}>
      <ExpoCameraView style={styles.camera} facing="front" />
      <OverlayCanvas poses={poses} mode={mode} />
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      <Animated.View entering={FadeIn.delay(200)} style={styles.topHud}>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitText}>← EXIT</Text>
        </TouchableOpacity>
        <BlurView intensity={40} tint="dark" style={styles.fpsBadge}>
          <Text style={styles.fpsText}>{fps} FPS</Text>
        </BlurView>
      </Animated.View>

      <Animated.View entering={SlideInDown.delay(200).duration(600)} style={styles.bottomHud}>
        <BlurView
          intensity={50}
          tint={isCorrect ? 'light' : 'dark'}
          style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardDefault]}
        >
          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={[styles.modeTag, isCorrect && { color: 'rgba(5,5,16,0.5)' }]}>{mode.toUpperCase()}</Text>
              <Text style={[styles.fbText, isCorrect && { color: '#050510' }]}>{feedback}</Text>
            </View>
            <Animated.View style={[styles.scoreCircle, scoreStyle]}>
              <Text style={[styles.scoreVal, isCorrect && { color: '#050510' }]}>{score}</Text>
              <Text style={styles.scoreLbl}>PTS</Text>
            </Animated.View>
          </View>
          {bpm > 0 && (
            <View style={styles.rhythmRow}>
              <View style={[styles.rhythmBar, { backgroundColor: isCorrect ? '#050510' : '#FF3B5C' }]} />
              <Text style={{ color: isCorrect ? '#050510' : '#FF3B5C', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 }}>
                {bpm} BPM
              </Text>
            </View>
          )}
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  pulseRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 6, top: height / 2 - 110, left: width / 2 - 110 },
  topHud: { position: 'absolute', top: 60, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exitBtn: { backgroundColor: 'rgba(255,59,92,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 22 },
  exitText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  fpsBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, overflow: 'hidden' },
  fpsText: { color: '#00D4FF', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  bottomHud: { position: 'absolute', bottom: 44, left: 20, right: 20 },
  card: { borderRadius: 32, padding: 24, overflow: 'hidden', borderWidth: 2 },
  cardDefault: { borderColor: 'rgba(255,59,92,0.3)' },
  cardCorrect: { borderColor: '#00FF88' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textWrap: { flex: 1, marginRight: 16 },
  modeTag: { fontSize: 10, fontWeight: '800', letterSpacing: 3, color: 'rgba(255,255,255,0.35)', marginBottom: 6 },
  fbText: { fontSize: 22, fontWeight: '900', color: '#FFF', lineHeight: 28 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scoreVal: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  scoreLbl: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.3)' },
  rhythmRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  rhythmBar: { height: 4, flex: 1, borderRadius: 2, opacity: 0.4, marginRight: 12 },
});
