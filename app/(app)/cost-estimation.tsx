import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CostEstimationScreen() {
  const router = useRouter();
  const [constructionType, setConstructionType] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');

  const handleCalculate = () => {
    if (!constructionType || !area || !location) {
      Alert.alert('Missing Information', 'Please fill in all fields before calculating.');
      return;
    }

    router.push({
      pathname: '/(app)/calculations',
      params: {
        constructionType,
        area,
        location
      }
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/images/costbg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              <Text style={styles.label}>Construction Type</Text>
              <TextInput
                style={styles.input}
                placeholder="for eg. industrial construction..."
                placeholderTextColor="#999"
                value={constructionType}
                onChangeText={setConstructionType}
              />

              <Text style={styles.label}>Area (in square feet)</Text>
              <TextInput
                style={styles.input}
                placeholder="enter total sq. ft"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={area}
                onChangeText={setArea}
              />

              <Text style={styles.label}>Select Location</Text>
              <TextInput
                style={styles.input}
                placeholder="enter address"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />

              <TouchableOpacity
                style={styles.calculateButton}
                onPress={handleCalculate}
              >
                <Text style={styles.calculateButtonText}>Calculate Cost</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 32,
    overflow: 'hidden',
    width: width - 40,
  },
  formContent: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  calculateButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 