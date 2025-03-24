import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Project {
  id: string;
  name: string;
  createdAt: any;
  userEmail: string;
}

export default function BudgetTrackingScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user?.emailAddresses?.[0]?.emailAddress) {
      setLoading(false);
      return;
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    console.log("Fetching projects for email:", userEmail);
    
    // Create a query against the collection
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(
      projectsRef,
      where('userEmail', '==', userEmail)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
      console.log("Received snapshot with size:", querySnapshot.size);
      const projectsList: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsList.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt,
          userEmail: data.userEmail
        });
      });
      
      // Sort projects by creation date
      projectsList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      
      console.log("Processed projects:", projectsList);
      setProjects(projectsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLoaded, user]);

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
        <Text style={styles.headerTitle}>Budget Tracking</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No projects yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first project to start tracking</Text>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => {
                router.push({
                  pathname: "/(app)/project-details",
                  params: { projectId: project.id }
                });
              }}
            >
              <Text style={styles.projectName}>{project.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          router.push("/add-project");
        }}
      >
        <View style={styles.addButtonContent}>
          <Text style={styles.addButtonText}>Add project</Text>
          <Ionicons name="add" size={24} color="#000" />
        </View>
      </TouchableOpacity>
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
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    padding: 12,
    paddingHorizontal: 20,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
}); 