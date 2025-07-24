import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MENU_OPTIONS = [
  {
    id: 1,
    title: 'See Planners',
    subtitle: 'Find nearby construction planners and architects',
    icon: 'people-outline' as const,
    route: '/(app)/plans'
  },
  {
    id: 2,
    title: 'Check Sample Layouts',
    subtitle: 'Generate personalized house layouts based on your requirements',
    icon: 'home-outline' as const,
    route: '/(app)/sample-layouts'
  },
  {
    id: 3,
    title: 'Know Your Vastu',
    subtitle: 'Learn essential Vastu tips for your new home',
    icon: 'compass-outline' as const,
    route: '/(app)/vastu-tips'
  }
];

export default function PlansMenuScreen() {
  const router = useRouter();

  const handleOptionPress = (route: string, title: string) => {
    console.log(`PlansMenu: Navigating to ${title}`);
    router.push(route as any);
  };

  const MenuOption = ({ title, subtitle, icon, route }: typeof MENU_OPTIONS[0]) => (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={() => handleOptionPress(route, title)}
    >
      <View style={styles.optionContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color="#000" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans & Layouts</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Plans & Layouts</Text>
          <Text style={styles.welcomeSubtitle}>Choose from the options below to start planning your dream home</Text>
        </View>

        <View style={styles.optionsContainer}>
          {MENU_OPTIONS.map((option) => (
            <MenuOption 
              key={option.id} 
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
              route={option.route}
            />
          ))}
        </View>
      </View>
    </View>
    </>
  );
}

const HEADER_HEIGHT = 80;
const WELCOME_SECTION_HEIGHT = 120;
const OPTION_HEIGHT = 100;
const OPTION_GAP = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    height: WELCOME_SECTION_HEIGHT,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    gap: OPTION_GAP,
  },
  optionCard: {
    height: OPTION_HEIGHT,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F4F8',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
}); 