import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TankCanvas } from './src/components';
import { useFishStore } from './src/store';

/** 네이티브/웹 공통 실제 앱 UI (Skia 사용) */
export default function AppContent() {
  useFishStore((s) => s.status);
  // Reanimated 네이티브 모듈이 준비된 뒤에 TankCanvas 마운트 (시뮬레이터 "runtime not ready" 방지)
  const [reanimatedReady, setReanimatedReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReanimatedReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {reanimatedReady ? <TankCanvas /> : null}
        <StatusBar style="dark" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
});
