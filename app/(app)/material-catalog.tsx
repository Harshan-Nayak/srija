import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';

const CATALOG_ITEMS = [
  { id: 1, title: 'Elevation Catalog', path: 'catalogs/elevation.pdf' },
  { id: 2, title: 'Electrical Catalog', path: 'catalogs/electrical.pdf' },
  { id: 3, title: 'Plumbing Catalog', path: 'catalogs/plumbing.pdf' },
  { id: 4, title: 'Door Catalog', path: 'catalogs/door.pdf' },
  { id: 5, title: 'Colors Catalog', path: 'catalogs/colors.pdf' },
  { id: 6, title: 'Roof Catalog', path: 'catalogs/roof.pdf' },
  { id: 7, title: 'Floor Catalog', path: 'catalogs/floor.pdf' },
  { id: 8, title: 'Safety Catalog', path: 'catalogs/safety.pdf' },
];

export default function MaterialCatalogScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openPDF = async (downloadUrl: string) => {
    try {
      // Use WebBrowser to open the PDF directly from the URL
      await WebBrowser.openBrowserAsync(downloadUrl);
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Could not open the PDF. Please make sure you have a PDF viewer installed.');
    }
  };

  const handleDownloadPDF = async (path: string, title: string) => {
    try {
      setLoading(true);
      const storage = getStorage();
      const fileRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(fileRef);

      // Open the PDF directly using the download URL
      await openPDF(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to open the catalog');
    } finally {
      setLoading(false);
      setSelectedId(null);
    }
  };

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

      <ScrollView style={styles.content}>
        {CATALOG_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.catalogItem,
              selectedId === item.id && styles.selectedItem
            ]}
            onPress={() => {
              setSelectedId(item.id);
              handleDownloadPDF(item.path, item.title);
            }}
            disabled={loading}
          >
            <Text style={[
              styles.catalogTitle,
              selectedId === item.id && styles.selectedTitle
            ]}>
              {item.title}
            </Text>
            {loading && selectedId === item.id && (
              <ActivityIndicator size="small" color={selectedId === item.id ? "#FFF" : "#000"} />
            )}
          </TouchableOpacity>
        ))}
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
  content: {
    flex: 1,
    padding: 16,
  },
  catalogItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#000',
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedTitle: {
    color: '#FFF',
  },
}); 