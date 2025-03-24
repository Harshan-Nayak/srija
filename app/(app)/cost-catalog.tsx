import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// Using the same API key as plans.tsx
const API_KEY = 'AIzaSyChohq3UosE8u0QBRugqMMxInXQ4WKL2L4';

// Types for supplier data
interface Supplier {
  id: string;
  name: string;
  rating: number;
  distance: number;
  address: string;
  phone: string;
  placeId: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}

export default function CostCatalogScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    verifyApiKey();
  }, []);

  const verifyApiKey = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'REQUEST_DENIED') {
        console.error('API Key Error:', data.error_message);
        Alert.alert(
          'API Configuration Error',
          'There seems to be an issue with the API configuration. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('API Verification Error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedLocation(newLocation);
      await searchNearbySuppliers(newLocation.latitude, newLocation.longitude, searchQuery);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location.');
    }
  };

  const searchNearbySuppliers = async (latitude: number, longitude: number, keyword: string) => {
    try {
      setLoading(true);
      // Append 'suppliers' to the keyword if it's not empty
      const searchKeyword = keyword ? `${keyword} suppliers` : '';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=store&keyword=${encodeURIComponent(searchKeyword)}&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED') {
        Alert.alert('API Error', 'Failed to fetch suppliers. Please try again later.');
        return;
      }
      
      if (data.results) {
        const mappedSuppliers: Supplier[] = await Promise.all(
          data.results.map(async (place: any) => {
            // Get place details for phone number and photos
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,photos&key=${API_KEY}`
            );
            const detailsData = await detailsResponse.json();
            
            // Get photo URL if available
            let photoUrl = '';
            if (place.photos && place.photos[0]) {
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`;
            }
            
            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating || 0,
              distance: calculateDistance(
                latitude,
                longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
              address: place.vicinity,
              phone: detailsData.result?.formatted_phone_number || 'N/A',
              placeId: place.place_id,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              photoUrl,
            };
          })
        );
        setSuppliers(mappedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      Alert.alert('Error', 'Failed to fetch suppliers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Update search when item query changes
  useEffect(() => {
    if (selectedLocation && searchQuery.trim().length > 0) {
      // Removed the minimum length check since we're appending 'suppliers'
      searchNearbySuppliers(selectedLocation.latitude, selectedLocation.longitude, searchQuery.trim());
    }
  }, [searchQuery]);

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber !== 'N/A') {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleDirections = (supplier: Supplier) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${supplier.name}&ll=${supplier.latitude},${supplier.longitude}`,
      android: `${scheme}${supplier.latitude},${supplier.longitude}?q=${supplier.name}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const sortSuppliers = (suppliers: Supplier[]) => {
    return [...suppliers].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return a.distance - b.distance;
    });
  };

  const renderSupplierCard = (supplier: Supplier) => (
    <View key={supplier.id} style={styles.supplierCard}>
      {supplier.photoUrl ? (
        <Image
          source={{ uri: supplier.photoUrl }}
          style={styles.supplierImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.supplierImage, styles.placeholderImage]}>
          <Ionicons name="business" size={40} color="#CCC" />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.supplierHeader}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{supplier.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.supplierInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.infoText}>{supplier.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={16} color="#666" />
            <Text style={styles.infoText}>{supplier.distance.toFixed(1)} km away</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.infoText}>{supplier.phone}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCall(supplier.phone)}
            disabled={supplier.phone === 'N/A'}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.directionsButton]}
            onPress={() => handleDirections(supplier)}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.buttonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cost Catalog</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <GooglePlacesAutocomplete
            placeholder="Search location"
            onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
              if (details) {
                setSelectedLocation({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
                searchNearbySuppliers(
                  details.geometry.location.lat,
                  details.geometry.location.lng,
                  searchQuery
                );
              }
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            query={{
              key: API_KEY,
              language: 'en',
              types: 'geocode',
              components: 'country:in'
            }}
            currentLocation={true}
            currentLocationLabel="Current location"
            nearbyPlacesAPI="GooglePlacesSearch"
            GoogleReverseGeocodingQuery={{}}
            GooglePlacesSearchQuery={{
              rankby: 'distance',
            }}
            filterReverseGeocodingByTypes={['locality', 'administrative_area_level_1']}
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
            styles={{
              container: {
                flex: 0,
                width: width - 90,
              },
              textInput: {
                height: 50,
                backgroundColor: '#F5F5F5',
                borderRadius: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                marginBottom: 5,
              },
              listView: {
                backgroundColor: 'white',
                borderRadius: 12,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 5,
                maxHeight: 200,
                zIndex: 9999,
              },
              row: {
                padding: 13,
                height: 44,
                flexDirection: 'row',
              },
              separator: {
                height: 0.5,
                backgroundColor: '#c8c7cc',
              },
              description: {
                fontSize: 14,
              },
              loader: {
                flexDirection: 'row',
                justifyContent: 'flex-end',
                height: 20,
              },
            }}
            textInputProps={{
              placeholderTextColor: '#666',
              returnKeyType: 'search',
              autoFocus: false,
              selectionColor: '#000',
            }}
            minLength={2}
            debounce={300}
            enableHighAccuracyLocation={true}
            timeout={15000}
            onFail={(error) => {
              console.error('GooglePlaces Error:', error);
              Alert.alert(
                'Search Error',
                'There was an error loading places. Please try again later.',
                [{ text: 'OK' }]
              );
            }}
            onNotFound={() => {
              Alert.alert(
                'No Results',
                'No locations found matching your search.',
                [{ text: 'OK' }]
              );
            }}
          />

          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="location" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.itemSearchInput}
            placeholder="Search items (e.g., Cement, Iron)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (selectedLocation && searchQuery.trim()) {
                searchNearbySuppliers(
                  selectedLocation.latitude,
                  selectedLocation.longitude,
                  searchQuery.trim()
                );
              }
            }}
          />
        </View>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>
            Distance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
            Rating
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : suppliers.length > 0 ? (
          sortSuppliers(suppliers).map(renderSupplierCard)
        ) : (
          <Text style={styles.noResults}>No suppliers found in this area</Text>
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
  searchContainer: {
    padding: 16,
    gap: 12,
    zIndex: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placesContainer: {
    flex: 0,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  searchResults: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  itemSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#000',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  supplierCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  supplierImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 4,
  },
  supplierInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  directionsButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
}); 