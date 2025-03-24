import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Constants for sizing
const MENU_ITEM_HEIGHT = 74;
const VERTICAL_SPACING = 12;

const designStyles = [
  'Traditional',
  'Modern',
  'Industrial',
  'Transitional',
  'Mid-Century Modern',
];

export default function InteriorDesignScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Interior Design Style</Text>
          <Text style={styles.subtitle}>
            "The best rooms have something to say about the people who live in them"
          </Text>
        </View>

        <View style={styles.stylesContainer}>
          {designStyles.map((style) => (
            <TouchableOpacity 
              key={style} 
              style={styles.styleCard}
              onPress={() => {
                router.push({
                  pathname: '/(app)/room-selection',
                  params: { style }
                });
              }}
            >
              <Text style={styles.styleText}>{style}</Text>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  backButton: {
    padding: 5,
  },
  menuButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '90%',
  },
  stylesContainer: {
    flex: 1,
    gap: VERTICAL_SPACING,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  styleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    width: width - 40,
    height: MENU_ITEM_HEIGHT,
  },
  styleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
}); 