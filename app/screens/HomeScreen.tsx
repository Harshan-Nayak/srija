import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 