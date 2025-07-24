import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Task {
  id: string;
  description: string;
  date: string;
  imageUrl?: string;
  isCompleted: boolean;
  materials?: {
    name: string;
    quantity: string;
    unit: string;
  }[];
}

interface Project {
  id: string;
  name: string;
  tasks: Task[];
}

export default function ProjectProgressScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    materials: [] as { name: string; quantity: string; unit: string }[],
  });
  const [uploadingForTask, setUploadingForTask] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const projectRef = doc(db, 'projects', projectId as string);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        setProject({
          id: projectSnap.id,
          name: data.name,
          tasks: data.tasks || []
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!project) return;

    const completedTasks = project.tasks ? project.tasks.filter(task => task.isCompleted) : [];
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Sort completed tasks by date
    const sortedCompletedTasks = [...completedTasks].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Create detailed task list
    const taskDetails = sortedCompletedTasks.map(task => {
      const materialsText = task.materials?.length 
        ? `\n    Materials: ${task.materials.map(m => `${m.name}-${m.quantity}${m.unit}`).join(', ')}`
        : '';
      return `\n• ${task.date}: ${task.description}${materialsText}`;
    }).join('');

    const shareMessage = 
`Project: ${project.name}
Progress: ${progress}%
Completed Tasks: ${completedTasks.length}/${totalTasks}

Completed Task Details:${taskDetails}`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Project Progress'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share project progress');
    }
  };

  const pickImage = async (taskId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadTaskImage(result.assets[0].uri, taskId);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadTaskImage = async (uri: string, taskId: string) => {
    if (!projectId) return;
    setUploadingForTask(taskId);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const imageRef = ref(storage, `projects/${projectId}/tasks/${taskId}`);
      
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
      
      // Update task image in project
      if (project && project.tasks) {
        const updatedTasks = project.tasks.map(task => 
          task.id === taskId ? { ...task, imageUrl: downloadUrl } : task
        );
        
        const projectRef = doc(db, 'projects', projectId as string);
        await updateDoc(projectRef, { tasks: updatedTasks });
        
        setProject({ ...project, tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingForTask(null);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!project || !projectId || !project.tasks) return;

    const updatedTasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );

    try {
      const projectRef = doc(db, 'projects', projectId as string);
      await updateDoc(projectRef, { 
        tasks: updatedTasks,
        progress: updatedTasks && updatedTasks.length > 0 
          ? Math.round((updatedTasks.filter(t => t.isCompleted).length / updatedTasks.length) * 100)
          : 0
      });
      
      setProject({ ...project, tasks: updatedTasks });
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const addNewTask = async () => {
    if (!project || !projectId || !newTask.description.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      description: newTask.description.trim(),
      date: newTask.date,
      isCompleted: false,
      materials: newTask.materials,
    };

    try {
      const projectRef = doc(db, 'projects', projectId as string);
      const updatedTasks = [...project.tasks, task];
      
      await updateDoc(projectRef, { 
        tasks: updatedTasks,
        progress: updatedTasks && updatedTasks.length > 0 
          ? Math.round((updatedTasks.filter(t => t.isCompleted).length / updatedTasks.length) * 100)
          : 0
      });
      
      setProject({ ...project, tasks: updatedTasks });
      setModalVisible(false);
      setNewTask({ description: '', date: new Date().toISOString().split('T')[0], materials: [] });
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const sortTasksByDate = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }
    return [...tasks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleDatePress = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDatePicker(true);
  };

  const onDateChange = async (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate && selectedTaskId && project && project.tasks) {
      const newDate = selectedDate.toISOString().split('T')[0];
      const updatedTasks = project.tasks.map(task =>
        task.id === selectedTaskId ? { ...task, date: newDate } : task
      );
      
      try {
        const projectRef = doc(db, 'projects', projectId as string);
        await updateDoc(projectRef, { tasks: updatedTasks });
        setProject({ ...project, tasks: updatedTasks });
      } catch (error) {
        console.error('Error updating date:', error);
        Alert.alert('Error', 'Failed to update date');
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      description: task.description,
      date: task.date,
      materials: task.materials || [],
    });
    setModalVisible(true);
  };

  const updateTask = async () => {
    if (!project || !projectId || !editingTask || !project.tasks) return;

    const updatedTask: Task = {
      ...editingTask,
      description: newTask.description.trim(),
      date: newTask.date,
      materials: newTask.materials,
    };

    const updatedTasks = project.tasks.map(task =>
      task.id === editingTask.id ? updatedTask : task
    );

    try {
      const projectRef = doc(db, 'projects', projectId as string);
      await updateDoc(projectRef, { tasks: updatedTasks });
      setProject({ ...project, tasks: updatedTasks });
      setModalVisible(false);
      setEditingTask(null);
      setNewTask({
        description: '',
        date: new Date().toISOString().split('T')[0],
        materials: [],
      });
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Project not found</Text>
      </View>
    );
  }

  const sortedTasks = sortTasksByDate(project.tasks || []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectTitle}>{project.name}</Text>

      <ScrollView style={styles.content}>
        {sortedTasks.map((task) => (
          <View key={task.id} style={styles.taskContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleTaskCompletion(task.id)}
            >
              {task.isCompleted && (
                <Ionicons name="checkmark" size={18} color="#000" />
              )}
            </TouchableOpacity>

            <View style={styles.taskCard}>
              <View style={styles.taskContent}>
                <TouchableOpacity 
                  style={styles.taskImageGrid}
                  onPress={() => pickImage(task.id)}
                >
                  {uploadingForTask === task.id ? (
                    <View style={styles.uploadingContainer}>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  ) : task.imageUrl ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: task.imageUrl }}
                        style={styles.taskImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="camera" size={24} color="#FFF" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="camera" size={24} color="#666" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.taskDetails}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskDate}>{task.date}</Text>
                    <TouchableOpacity onPress={() => handleEditTask(task)}>
                      <Ionicons name="create-outline" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  
                  <View style={styles.materialsContainer}>
                    {task.materials?.map((material, index) => (
                      <Text key={index} style={styles.materialText}>
                        {material.name}-{material.quantity}{material.unit}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setEditingTask(null);
          setNewTask({
            description: '',
            date: new Date().toISOString().split('T')[0],
            materials: [],
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={newTask.description}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
              multiline
            />
            
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}
            >
              <Text style={styles.dateText}>{newTask.date}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setEditingTask(null);
                  setNewTask({
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    materials: [],
                  });
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={editingTask ? updateTask : addNewTask}
              >
                <Text style={[styles.buttonText, styles.confirmText]}>
                  {editingTask ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(selectedTaskId ? 
            project.tasks.find(t => t.id === selectedTaskId)?.date || new Date() :
            new Date()
          )}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
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
  projectTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskContent: {
    flexDirection: 'row',
    height: 150,
  },
  taskImageGrid: {
    width: '40%',
    height: '100%',
    position: 'relative',
  },
  taskImage: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  taskDetails: {
    flex: 1,
    padding: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  materialsContainer: {
    marginTop: 'auto',
  },
  materialText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    padding: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
    marginBottom: 20,
    minHeight: 100,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
}); 