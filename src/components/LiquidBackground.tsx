import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const LiquidBackground = () => {
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb2X = useSharedValue(width);
  const orb2Y = useSharedValue(height * 0.4);
  const orb3X = useSharedValue(width * 0.5);
  const orb3Y = useSharedValue(height);

  useEffect(() => {
    orb1X.value = withRepeat(withTiming(width * 0.7, { duration: 12000 }), -1, true);
    orb1Y.value = withRepeat(withTiming(height * 0.3, { duration: 10000 }), -1, true);
    orb2X.value = withRepeat(withTiming(width * 0.1, { duration: 15000 }), -1, true);
    orb2Y.value = withRepeat(withTiming(height * 0.1, { duration: 11000 }), -1, true);
    orb3X.value = withRepeat(withTiming(width * 0.9, { duration: 20000 }), -1, true);
    orb3Y.value = withRepeat(withTiming(height * 0.5, { duration: 14000 }), -1, true);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb3X.value }, { translateY: orb3Y.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.orb, styles.orbCyan, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orbViolet, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orbPink, orb3Style]} />
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.25 },
  orbCyan: { backgroundColor: '#00D4FF', top: -50, left: -50 },
  orbViolet: { backgroundColor: '#8B5CF6', top: height * 0.3, right: -100 },
  orbPink: { backgroundColor: '#FF00A0', bottom: -100, left: width * 0.2 },
});
