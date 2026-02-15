import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TankCanvas } from './src/components';
import { useFishStore } from './src/store';

export default function App() {
  useFishStore((s) => s.status);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <TankCanvas />
        <StatusBar style="dark" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
});
