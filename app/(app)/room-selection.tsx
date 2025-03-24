import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MENU_ITEM_HEIGHT = 74;
const VERTICAL_SPACING = 12;

const rooms = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Kitchen',
  'Courtyard',
  'Study/Home Office',
  'Entryway/Foyer',
  'Bathroom',
  'Pooja Room',
];

export default function RoomSelectionScreen() {
  const router = useRouter();
  const { style } = useLocalSearchParams();

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
          <Text style={styles.title}>Which room would you like to design?</Text>
        </View>

        <View style={styles.roomsContainer}>
          {rooms.map((room) => (
            <TouchableOpacity 
              key={room} 
              style={styles.roomCard}
              onPress={() => {
                console.log(`Selected room: ${room} with style: ${style}`);
                // Handle room selection
              }}
            >
              <Text style={styles.roomText}>{room}</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  roomsContainer: {
    flex: 1,
    gap: VERTICAL_SPACING,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    width: width - 40,
    height: MENU_ITEM_HEIGHT,
  },
  roomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
}); 