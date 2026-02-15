import React from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Canvas,
  Rect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { Colors } from '../constants';

/**
 * 수조 배경(부드러운 파란색 그라데이션)을 그리는 메인 Skia Canvas
 */
export function TankCanvas() {
  const { width, height } = useWindowDimensions();

  return (
    <Canvas style={{ flex: 1, width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[Colors.tankGradientTop, Colors.tankGradientBottom]}
        />
      </Rect>
    </Canvas>
  );
}
