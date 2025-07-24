import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Task {
  id: string;
  description: string;
  date: string;
  imageUrl?: string;
  isCompleted: boolean;
}

interface Project {
  id: string;
  name: string;
  imageUrl?: string;
  progress: number;
  startDate: any;
  endDate: any;
  userEmail: string;
  tasks?: Task[];
}

export default function ProgressTrackingScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingForProject, setUploadingForProject] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.emailAddresses?.[0]?.emailAddress) {
      setLoading(false);
      return;
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(
      projectsRef,
      where('userEmail', '==', userEmail)
    );

    const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
      const projectsList: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const tasks = data.tasks || [];
        const progress = tasks && tasks.length > 0 
          ? Math.round((tasks.filter((t: any) => t.isCompleted).length / tasks.length) * 100)
          : 0;

        projectsList.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
          progress: progress,
          startDate: data.startDate,
          endDate: data.endDate,
          userEmail: data.userEmail,
          tasks: tasks
        });
      });
      
      setProjects(projectsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLoaded, user]);

  const pickImage = async (projectId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri, projectId);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string, projectId: string) => {
    setUploadingForProject(projectId);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const imageRef = ref(storage, `projects/${projectId}/image`);
      
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        imageUrl: downloadUrl
      });
      
      Alert.alert('Success', 'Project image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingForProject(null);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date.toDate();
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit'
    })},${d.getFullYear()}`;
  };

  const getDateRangeString = (tasks: Task[] = []) => {
    if (tasks.length === 0) return '';
    
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = sortedTasks[0].date;
    const lastDate = sortedTasks[sortedTasks.length - 1].date;
    
    return `${firstDate} - ${lastDate}`;
  };

  if (!isLoaded || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Please sign in to view your projects</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No projects yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first project to start tracking progress</Text>
          </View>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <TouchableOpacity
                style={styles.cardImageContainer}
                onPress={() => pickImage(project.id)}
              >
                {uploadingForProject === project.id ? (
                  <View style={[styles.projectImage, styles.uploadingContainer]}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : project.imageUrl ? (
                  <Image
                    source={{ uri: project.imageUrl }}
                    style={styles.projectImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.projectImage, styles.placeholderImage]}>
                    <Ionicons name="camera" size={32} color="#666" />
                    <Text style={styles.uploadText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => {
                  router.push({
                    pathname: "/(app)/project-progress",
                    params: { projectId: project.id }
                  });
                }}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.dateRangeText}>
                    {getDateRangeString(project.tasks)}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${project.progress}%` }]} />
                    <View style={styles.progressBarOverlay} />
                  </View>
                  <Text style={styles.dateText}>
                    {formatDate(project.startDate)}
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{project.progress}%</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    height: 120,
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 16,
  },
  cardImageContainer: {
    width: 120,
    height: '100%',
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  placeholderImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  uploadingContainer: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  projectInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    justifyContent: 'center',
    paddingLeft: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
}); 