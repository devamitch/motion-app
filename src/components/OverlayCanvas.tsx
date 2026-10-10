import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface OverlayCanvasProps {
  poses: any[];
  ghostPose?: any[];
  mode: 'boxing' | 'dance';
}

const SKELETON_PAIRS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [24, 26], [26, 28], // Lower body
];

export const OverlayCanvas: React.FC<OverlayCanvasProps> = ({ poses, ghostPose, mode }) => {
  const renderSkeleton = (pose: any, color: string, opacity: number = 1) => {
    if (!pose || !pose.keypoints) return null;
    const { keypoints } = pose;

    return (
      <G opacity={opacity}>
        {SKELETON_PAIRS.map(([i, j]) => {
          const p1 = keypoints[i];
          const p2 = keypoints[j];
          if (!p1 || !p2 || (p1.score || 0) < 0.3 || (p2.score || 0) < 0.3) return null;
          return (
            <Line
              key={`line-${i}-${j}`}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}
        {keypoints.map((kp: any, i: number) => {
          if ((kp.score || 0) < 0.3) return null;
          return (
            <Circle
              key={`kp-${i}`}
              cx={kp.x} cy={kp.y}
              r="4"
              fill={color}
            />
          );
        })}
      </G>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${width} ${height}`}>
        {/* Ghost Pose (Reference) */}
        {ghostPose && renderSkeleton(ghostPose[0], 'rgba(255, 255, 255, 0.2)', 0.5)}
        
        {/* Live Pose */}
        {poses.length > 0 && renderSkeleton(poses[0], mode === 'boxing' ? '#FF3B5C' : '#00FF88')}
      </Svg>
    </View>
  );
};
