import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LiquidBackground } from '../components/LiquidBackground';
import { useCoachStore } from '../store/coachStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const MODES = [
  { key: 'boxing' as const, emoji: '🥊', label: 'Boxing', desc: 'Jab • Hook • Guard' },
  { key: 'dance' as const, emoji: '💃', label: 'Bharatanatyam', desc: 'Aramandi • Mudra • Symmetry' },
];

export default function DashboardScreen() {
  const { selectedMode, setMode, llmStatus, sessionCount, totalScore } = useCoachStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const avgScore = sessionCount > 0 ? Math.round(totalScore / sessionCount) : 0;

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(800)} style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Kinetic</Text>
              <Text style={styles.subtitle}>AI MOTION COACH</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Nav */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('History')}>
              <Text style={styles.navBtnText}>📋 History</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Selector */}
          <Text style={styles.sectionLabel}>SELECT MODE</Text>
          <View style={styles.modeGrid}>
            {MODES.map((mode, i) => (
              <Animated.View key={mode.key} entering={FadeInUp.delay(i * 120).duration(600)}>
                <TouchableOpacity
                  style={[styles.modeCard, selectedMode === mode.key && styles.activeCard]}
                  onPress={() => setMode(mode.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <Text style={[styles.modeLabel, selectedMode === mode.key && styles.activeLabel]}>
                    {mode.label}
                  </Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Start Button */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Coach', { mode: selectedMode })}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Start Training →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInUp.delay(600).duration(600)}>
            <BlurView intensity={20} tint="dark" style={styles.statsCard}>
              <Text style={styles.statsTitle}>Session Stats</Text>
              <View style={styles.statRow}>
                <StatItem label="Sessions" value={`${sessionCount}`} />
                <StatItem label="Avg Score" value={`${avgScore}%`} />
                <StatItem label="Engine" value={llmStatus === 'READY' ? 'ON' : 'OFF'} />
              </View>
            </BlurView>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050510' },
  content: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 48, fontWeight: '900', color: '#FFF', letterSpacing: -2 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 6, marginTop: 2 },
  settingsIcon: { fontSize: 24, padding: 4 },
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 4, fontWeight: '800', marginBottom: 14 },
  navRow: { marginBottom: 30, flexDirection: 'row', gap: 10 },
  navBtn: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  navBtnText: { color: '#00D4FF', fontSize: 13, fontWeight: '700' },
  modeGrid: { flexDirection: 'row', gap: 14, marginBottom: 36 },
  modeCard: { width: (width - 62) / 2, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 28, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  activeCard: { backgroundColor: 'rgba(0,212,255,0.08)', borderColor: '#00D4FF' },
  modeEmoji: { fontSize: 36, marginBottom: 10 },
  modeLabel: { fontSize: 15, fontWeight: '800', color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  activeLabel: { color: '#00D4FF' },
  modeDesc: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: 0.5 },
  primaryBtn: { backgroundColor: '#00D4FF', height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#00D4FF', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  primaryBtnText: { fontSize: 18, fontWeight: '900', color: '#050510', letterSpacing: 0.5 },
  statsCard: { marginTop: 36, borderRadius: 28, padding: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statsTitle: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
