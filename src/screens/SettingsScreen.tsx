import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LiquidBackground } from '../components/LiquidBackground';
import { useCoachStore } from '../store/coachStore';
import { useHistoryStore } from '../store/historyStore';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { llmStatus, sessionCount, totalScore } = useCoachStore();
  const { clearHistory, history } = useHistoryStore();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <GlassSection title="Engine Status">
            <SettingsRow label="Pose Detection" value="BlazePose (TFJS)" color="#00D4FF" />
            <SettingsRow label="On-Device LLM" value={llmStatus} color={llmStatus === 'READY' ? '#00FF88' : '#FFB800'} />
            <SettingsRow label="Kinematics Engine" value="ACTIVE" color="#00FF88" />
          </GlassSection>

          <GlassSection title="Statistics">
            <SettingsRow label="Total Sessions" value={`${sessionCount}`} color="#FFF" />
            <SettingsRow label="History Entries" value={`${history.length}`} color="#FFF" />
            <SettingsRow label="Avg Score" value={sessionCount > 0 ? `${Math.round(totalScore / sessionCount)}%` : '—'} color="#00D4FF" />
          </GlassSection>

          <GlassSection title="Data">
            <TouchableOpacity style={styles.dangerBtn} onPress={clearHistory}>
              <Text style={styles.dangerBtnText}>Clear All Training Data</Text>
            </TouchableOpacity>
          </GlassSection>

          <View style={styles.footer}>
            <Text style={styles.footerLine}>Kinetic • AI Motion Coach</Text>
            <Text style={styles.footerSub}>v1.0.0 • On-Device ML • Expo SDK 54</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const GlassSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <BlurView intensity={20} tint="dark" style={styles.glassCard}>
      {children}
    </BlurView>
  </View>
);

const SettingsRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050510' },
  content: { flex: 1 },
  header: { padding: 24, paddingTop: 10 },
  backText: { color: '#00D4FF', fontWeight: '800', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  scroll: { padding: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  glassCard: { borderRadius: 24, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' },
  value: { fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  dangerBtn: { backgroundColor: 'rgba(255,59,92,0.08)', padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,92,0.15)' },
  dangerBtnText: { color: '#FF3B5C', fontWeight: '800', fontSize: 14 },
  footer: { marginTop: 50, alignItems: 'center' },
  footerLine: { color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: '700' },
  footerSub: { color: 'rgba(255,255,255,0.08)', fontSize: 11, marginTop: 4 },
});
