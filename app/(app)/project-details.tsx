import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Material {
  description: string;
  cost: number;
}

interface Project {
  id: string;
  name: string;
  materials: Material[];
}

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ description: '', cost: '' });
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(db, 'projects', projectId as string);
    
    const unsubscribe = onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        const projectData = doc.data();
        setProject({
          id: doc.id,
          name: projectData.name,
          materials: projectData.materials || []
        });
        
        // Calculate total cost
        const total = (projectData.materials || []).reduce(
          (sum: number, material: Material) => sum + material.cost,
          0
        );
        setTotalCost(total);
      }
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleAddMaterial = async () => {
    if (!newMaterial.description.trim() || !newMaterial.cost) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const cost = parseFloat(newMaterial.cost);
      if (isNaN(cost)) {
        Alert.alert('Error', 'Please enter a valid cost');
        return;
      }

      const projectRef = doc(db, 'projects', projectId as string);
      await updateDoc(projectRef, {
        materials: arrayUnion({
          description: newMaterial.description.trim(),
          cost: cost
        })
      });

      setModalVisible(false);
      setNewMaterial({ description: '', cost: '' });
    } catch (error) {
      console.error('Error adding material:', error);
      Alert.alert('Error', 'Failed to add material');
    }
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>Project Name: {project.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>S.No</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Cost</Text>
          </View>

          {project.materials?.map((material, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{material.description}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>₹{material.cost.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ₹{totalCost.toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Material</Text>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Material</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newMaterial.description}
              onChangeText={(text) => setNewMaterial(prev => ({ ...prev, description: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cost"
              value={newMaterial.cost}
              onChangeText={(text) => setNewMaterial(prev => ({ ...prev, cost: text }))}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewMaterial({ description: '', cost: '' });
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddMaterial}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  projectHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeaderCell: {
    padding: 10,
    fontWeight: '600',
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
}); 