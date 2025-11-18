import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import ColorSmash from './components/coloursmash';

export default function App() {
  return (
    <View style={styles.container}>
      <ColorSmash />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});