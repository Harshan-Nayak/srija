import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo';

export default function AddProjectScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) {
      console.log('User email not found:', user);
      Alert.alert('Error', 'User email not found');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to add project:', {
        name: projectName.trim(),
        userEmail,
      });

      // Add project to Firestore
      const docRef = await addDoc(collection(db, 'projects'), {
        name: projectName.trim(),
        userEmail: userEmail,
        createdAt: serverTimestamp(),
        userId: user.id // Adding Clerk user ID for additional reference
      });

      console.log('Project added successfully:', docRef.id);
      router.back();
    } catch (error) {
      console.error('Error adding project:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      });
      Alert.alert('Error', 'Failed to add project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Please sign in to add projects</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Project</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Project Name</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Enter project name"
          placeholderTextColor="#666"
          autoFocus
        />

        <TouchableOpacity
          style={[styles.addButton, !projectName.trim() && styles.addButtonDisabled]}
          onPress={handleAddProject}
          disabled={loading || !projectName.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.addButtonText}>Create Project</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
}); 