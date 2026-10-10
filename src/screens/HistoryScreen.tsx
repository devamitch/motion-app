import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LiquidBackground } from '../components/LiquidBackground';
import { useHistoryStore, SessionEntry } from '../store/historyStore';
import { useNavigation } from '@react-navigation/native';

export default function HistoryScreen() {
  const { history } = useHistoryStore();
  const navigation = useNavigation();

  const renderItem = ({ item, index }: { item: SessionEntry; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(500)}>
      <BlurView intensity={20} tint="dark" style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.modeTag}>
            {item.mode === 'boxing' ? '🥊' : '💃'} {item.mode.toUpperCase()}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.feedbackText}>{item.feedback}</Text>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Training History</Text>
          <Text style={styles.countText}>{history.length} sessions</Text>
        </View>
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏃‍♂️</Text>
              <Text style={styles.emptyText}>No sessions yet</Text>
              <Text style={styles.emptySubtext}>Start training to see your history</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050510' },
  content: { flex: 1 },
  header: { padding: 24, paddingTop: 10 },
  backText: { color: '#00D4FF', fontWeight: '800', fontSize: 15, marginBottom: 12 },
  title: { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  countText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: '700', letterSpacing: 1 },
  list: { padding: 20, paddingTop: 0 },
  historyCard: { borderRadius: 24, padding: 20, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  modeTag: { color: '#00D4FF', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  dateText: { color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '600' },
  feedbackText: { color: '#FFF', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  empty: { height: 400, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '800' },
  emptySubtext: { color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 6 },
});
