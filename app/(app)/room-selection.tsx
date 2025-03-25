import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

const MENU_ITEM_HEIGHT = 74;
const VERTICAL_SPACING = 12;

interface RoomCategory {
  name: string;
  subcategories: string[];
}

const styleData: { [key: string]: RoomCategory[] } = {
  'Traditional': [
    {
      name: 'Living Room',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Entertainment & Electronics',
        'Storage & Utility'
      ]
    },
    {
      name: 'Bedroom',
      subcategories: [
        'Furniture',
        'Bedding Essentials',
        'Decor & Accessories',
        'Storage & Organization',
        'Lighting'
      ]
    },
    {
      name: 'Dining Room',
      subcategories: [
        'Furniture',
        'Tableware & Dining Essentials',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Kitchen',
      subcategories: [
        'Major Appliances',
        'Small Appliances',
        'Cookware & Bakeware',
        'Storage & Organization',
        'Dining & Serving',
        'Miscellaneous'
      ]
    },
    {
      name: 'Courtyard',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Gardening & Landscaping'
      ]
    },
    {
      name: 'Study/Home Office',
      subcategories: [
        'Furniture',
        'Tech & Accessories',
        'Office Supplies',
        'Decor'
      ]
    },
    {
      name: 'Entryway/Foyer',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Bathroom',
      subcategories: [
        'Sanitary Fixtures',
        'Storage & Organization',
        'Toiletries & Essentials',
        'Decor & Accessories'
      ]
    },
    {
      name: 'Pooja Room',
      subcategories: [
        'Furniture',
        'Religious Essentials',
        'Storage & Organization',
        'Decor'
      ]
    }
  ],
  'Modern': [
    {
      name: 'Living Room',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Entertainment & Electronics',
        'Smart Gadgets',
        'Storage & Utility'
      ]
    },
    {
      name: 'Bedroom',
      subcategories: [
        'Furniture',
        'Bedding Essentials',
        'Decor & Accessories',
        'Storage & Organization',
        'Lighting',
        'Smart Gadgets & Automation'
      ]
    },
    {
      name: 'Dining Room',
      subcategories: [
        'Furniture',
        'Tableware & Dining Essentials',
        'Decor & Accessories',
        'Lighting',
        'Smart Appliances'
      ]
    },
    {
      name: 'Kitchen',
      subcategories: [
        'Major Appliances',
        'Small Appliances',
        'Cookware & Bakeware',
        'Storage & Organization',
        'Dining & Serving',
        'Miscellaneous'
      ]
    },
    {
      name: 'Courtyard',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Gardening & Landscaping',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Study/Home Office',
      subcategories: [
        'Furniture',
        'Tech & Accessories',
        'Office Supplies',
        'Decor',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Entryway/Foyer',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Bathroom',
      subcategories: [
        'Sanitary Fixtures',
        'Storage & Organization',
        'Toiletries & Essentials',
        'Decor & Accessories',
        'Smart Gadgets',
        'Luxury Accessories'
      ]
    },
    {
      name: 'Pooja Room',
      subcategories: [
        'Furniture',
        'Religious Essentials',
        'Storage & Organization',
        'Decor',
        'Smart Gadgets'
      ]
    }
  ],
  'Industrial': [
    {
      name: 'Living Room',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Entertainment & Electronics',
        'Storage & Utility'
      ]
    },
    {
      name: 'Bedroom',
      subcategories: [
        'Furniture',
        'Bedding Essentials',
        'Decor & Accessories',
        'Storage & Organization',
        'Lighting'
      ]
    },
    {
      name: 'Dining Room',
      subcategories: [
        'Furniture',
        'Tableware & Dining Essentials',
        'Decor & Accessories',
        'Lighting',
        'Smart Appliances'
      ]
    },
    {
      name: 'Kitchen',
      subcategories: [
        'Major Appliances',
        'Small Appliances',
        'Cookware & Bakeware',
        'Storage & Organization',
        'Dining & Serving',
        'Miscellaneous'
      ]
    },
    {
      name: 'Courtyard',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Gardening & Landscaping',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Study/Home Office',
      subcategories: [
        'Furniture',
        'Tech & Accessories',
        'Office Supplies',
        'Decor',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Entryway/Foyer',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Smart Gadgets'
      ]
    },
    {
      name: 'Bathroom',
      subcategories: [
        'Sanitary Fixtures',
        'Storage & Organization',
        'Toiletries & Essentials',
        'Decor & Accessories',
        'Smart Gadgets',
        'Luxury Accessories'
      ]
    },
    {
      name: 'Pooja Room',
      subcategories: [
        'Furniture',
        'Religious Essentials',
        'Storage & Organization',
        'Decor',
        'Smart Gadgets'
      ]
    }
  ],
  'Transitional': [
    {
      name: 'Living Room',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Entertainment & Electronics',
        'Storage & Utility'
      ]
    },
    {
      name: 'Bedroom',
      subcategories: [
        'Furniture',
        'Bedding Essentials',
        'Decor & Accessories',
        'Storage & Organization',
        'Lighting'
      ]
    },
    {
      name: 'Dining Room',
      subcategories: [
        'Furniture',
        'Tableware & Dining Essentials',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Kitchen',
      subcategories: [
        'Major Appliances',
        'Small Appliances',
        'Cookware & Bakeware',
        'Storage & Organization',
        'Dining & Serving',
        'Miscellaneous'
      ]
    },
    {
      name: 'Courtyard',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Gardening & Landscaping'
      ]
    },
    {
      name: 'Study/Home Office',
      subcategories: [
        'Furniture',
        'Tech & Accessories',
        'Office Supplies',
        'Decor'
      ]
    },
    {
      name: 'Entryway/Foyer',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Bathroom',
      subcategories: [
        'Sanitary Fixtures',
        'Storage & Organization',
        'Toiletries & Essentials',
        'Decor & Accessories'
      ]
    },
    {
      name: 'Pooja Room',
      subcategories: [
        'Furniture',
        'Religious Essentials',
        'Storage & Organization',
        'Decor'
      ]
    }
  ],
  'Mid-Century Modern': [
    {
      name: 'Living Room',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting',
        'Entertainment & Electronics',
        'Storage & Utility'
      ]
    },
    {
      name: 'Bedroom',
      subcategories: [
        'Furniture',
        'Bedding Essentials',
        'Decor & Accessories',
        'Storage & Organization',
        'Lighting'
      ]
    },
    {
      name: 'Dining Room',
      subcategories: [
        'Furniture',
        'Tableware & Dining Essentials',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Kitchen',
      subcategories: [
        'Major Appliances',
        'Small Appliances',
        'Cookware & Bakeware',
        'Storage & Organization',
        'Dining & Serving',
        'Miscellaneous'
      ]
    },
    {
      name: 'Courtyard',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Gardening & Landscaping'
      ]
    },
    {
      name: 'Study/Home Office',
      subcategories: [
        'Furniture',
        'Tech & Accessories',
        'Office Supplies',
        'Decor'
      ]
    },
    {
      name: 'Entryway/Foyer',
      subcategories: [
        'Furniture',
        'Decor & Accessories',
        'Lighting'
      ]
    },
    {
      name: 'Bathroom',
      subcategories: [
        'Sanitary Fixtures',
        'Storage & Organization',
        'Toiletries & Essentials',
        'Decor & Accessories'
      ]
    },
    {
      name: 'Pooja Room',
      subcategories: [
        'Furniture',
        'Religious Essentials',
        'Storage & Organization',
        'Decor'
      ]
    }
  ]
};

export default function RoomSelectionScreen() {
  const router = useRouter();
  const { style } = useLocalSearchParams();
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleCategoryPress = async (category: string) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      setImages([]); // Clear previous images
      setLoadingProgress(0);
      setImageModalVisible(true); // Show modal immediately with loading state

      const storagePath = `categories/${style}/${expandedRoom}/${category}`;
      console.log('Fetching from path:', storagePath);

      const categoryRef = ref(storage, storagePath);
      const foldersList = await listAll(categoryRef);
      
      console.log('Total folders found:', foldersList.prefixes.length);
      console.log('Folder names:', foldersList.prefixes.map(prefix => prefix.name));

      const totalFolders = foldersList.prefixes.length;
      let processedFolders = 0;
      const imageUrls: string[] = [];

      // Process each main folder
      for (const folderRef of foldersList.prefixes) {
        try {
          console.log('Processing main folder:', folderRef.name);
          const folderContents = await listAll(folderRef);

          // Case 1: Direct images in the folder
          if (folderContents.items.length > 0) {
            console.log(`Found ${folderContents.items.length} direct images in:`, folderRef.name);
            const directImageUrls = await Promise.all(
              folderContents.items.map(async (imageRef) => {
                try {
                  const url = await getDownloadURL(imageRef);
                  console.log('Got direct image URL from:', folderRef.name);
                  return url;
                } catch (error) {
                  console.error('Error getting direct image URL:', error);
                  return null;
                }
              })
            );
            imageUrls.push(...directImageUrls.filter((url): url is string => url !== null));
          }

          // Case 2: Check for nested folders (including those with spaces)
          for (const nestedRef of folderContents.prefixes) {
            console.log('Checking nested folder:', nestedRef.name, 'in', folderRef.name);
            try {
              const nestedContents = await listAll(nestedRef);
              const nestedImageUrls = await Promise.all(
                nestedContents.items.map(async (imageRef) => {
                  try {
                    const url = await getDownloadURL(imageRef);
                    console.log('Got nested image URL from:', folderRef.name, '/', nestedRef.name);
                    return url;
                  } catch (error) {
                    console.error('Error getting nested image URL:', error);
                    return null;
                  }
                })
              );
              imageUrls.push(...nestedImageUrls.filter((url): url is string => url !== null));
            } catch (error) {
              console.error('Error processing nested folder:', nestedRef.name, error);
            }
          }

          processedFolders++;
          const progress = (processedFolders / totalFolders) * 100;
          setLoadingProgress(progress);
          setImages([...imageUrls]); // Update images as they load
          
          console.log(`Processed ${folderRef.name}: Current total images: ${imageUrls.length}`);
        } catch (error) {
          console.error('Error processing folder:', folderRef.name, error);
          processedFolders++;
          setLoadingProgress((processedFolders / totalFolders) * 100);
        }
      }

      console.log('Final total images loaded:', imageUrls.length);

    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
      setLoadingProgress(100);
    }
  };

  const toggleRoom = (roomName: string) => {
    setExpandedRoom(expandedRoom === roomName ? null : roomName);
  };

  const NoImagesMessage = () => (
    <View style={styles.noImagesContainer}>
      <Ionicons name="images-outline" size={48} color="#666" />
      <Text style={styles.noImagesText}>No images available for this category</Text>
    </View>
  );

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Loading images... {Math.round(loadingProgress)}%</Text>
    </View>
  );

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
          <Text style={styles.selectedStyle}>Selected Style: {style}</Text>
        </View>

        <View style={styles.roomsContainer}>
          {styleData[style as keyof typeof styleData]?.map((room) => (
            <View key={room.name}>
              <TouchableOpacity 
                style={[
                  styles.roomCard,
                  expandedRoom === room.name && styles.expandedCard
                ]}
                onPress={() => toggleRoom(room.name)}
              >
                <Text style={styles.roomText}>{room.name}</Text>
                <Ionicons 
                  name={expandedRoom === room.name ? "chevron-down" : "chevron-forward"} 
                  size={24} 
                  color="#000" 
                />
              </TouchableOpacity>

              {expandedRoom === room.name && (
                <View style={styles.subcategoriesContainer}>
                  {room.subcategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.categoryCard}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text style={styles.categoryText}>{category}</Text>
                      {loading && selectedCategory === category ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Ionicons name="images-outline" size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setImageModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedCategory}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.imagesGrid}>
            {loading && images.length === 0 ? (
              <LoadingIndicator />
            ) : images.length > 0 ? (
              images.map((url, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: url }}
                    style={styles.gridImage}
                    resizeMode="cover"
                    onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                  />
                  {loading && index === images.length - 1 && (
                    <ActivityIndicator 
                      style={styles.loadingMore} 
                      size="small" 
                      color="#000" 
                    />
                  )}
                </View>
              ))
            ) : (
              <NoImagesMessage />
            )}
          </ScrollView>
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
    marginBottom: 8,
  },
  selectedStyle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roomsContainer: {
    flex: 1,
    gap: VERTICAL_SPACING,
    paddingBottom: 20,
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
  expandedCard: {
    backgroundColor: '#E8E8E8',
  },
  roomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  subcategoriesContainer: {
    paddingLeft: 20,
    paddingTop: 8,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
    width: (width - 32) / 2,
    height: (width - 32) / 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  noImagesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  noImagesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingMore: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
}); 