import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { TankCanvas } from './src/components';

export default function App() {
  return (
    <View style={styles.container}>
      <TankCanvas />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
