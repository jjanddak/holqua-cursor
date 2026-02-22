import { StyleSheet, View, Text } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

/** 웹 전용: Skia(CanvasKit WASM) 로드 후 앱 렌더링 */
export default function App() {
  return (
    <WithSkiaWeb
      getComponent={() => import('./AppContent').then((m) => ({ default: m.default }))}
      fallback={
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>로딩 중...</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
  },
});
