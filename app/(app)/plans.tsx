
import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import SafeGooglePlacesAutocomplete from '../../components/SafeGooglePlacesAutocomplete';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION: Region = {
  latitude: 17.3850,  // Hyderabad coordinates
  longitude: 78.4867,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const API_KEY = 'AIzaSyAfWzd1B2xm3sFT0K_uogXClq112REL_NE';

export default function PlansScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Region>(INITIAL_REGION);
  const [selectedLocation, setSelectedLocation] = useState<Region | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('PlansScreen: Component rendered');

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        setIsLoading(true);
        await getCurrentLocation();
        await verifyApiKey();
      } catch (error) {
        console.error('PlansScreen: Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScreen();
  }, []);

  const getCurrentLocation = async () => {
    try {
      console.log('PlansScreen: Getting current location');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation: Region = {
        ...INITIAL_REGION,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      setSelectedLocation(newLocation);
      mapRef.current?.animateToRegion(newLocation, 1000);
      console.log('PlansScreen: Location set successfully');
    } catch (error) {
      console.error('PlansScreen: Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location.');
    }
  };

  const verifyApiKey = async () => {
    try {
      console.log('PlansScreen: Verifying API key');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=${API_KEY}`
      );
      const data = await response.json();
      console.log('PlansScreen: API Status:', data.status);
      if (data.status === 'REQUEST_DENIED') {
        console.error('API Key Error:', data.error_message);
        Alert.alert(
          'API Configuration Error',
          'There seems to be an issue with the API configuration. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('PlansScreen: API Verification Error:', error);
    }
  };

  const handleLocationSelect = (data: GooglePlaceData, details: GooglePlaceDetail | null) => {
    try {
      console.log('PlansScreen: Location selected:', data.description);
      if (!details) {
        setSearchError('Location details not found');
        return;
      }
      
      setSearchError(null);
      const newLocation: Region = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setSelectedLocation(newLocation);
      mapRef.current?.animateToRegion(newLocation, 1000);
    } catch (error) {
      console.error('PlansScreen: Error handling location select:', error);
      setSearchError('Error processing location');
    }
  };

  const handleConfirmLocation = () => {
    try {
      console.log('PlansScreen: Confirming location');
      if (!selectedLocation) return;
      
      // Navigate to planners list screen with location data
      router.push({
        pathname: '/(app)/planners-list',
        params: {
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString()
        }
      });
    } catch (error) {
      console.error('PlansScreen: Error confirming location:', error);
      Alert.alert('Error', 'Failed to proceed with selected location.');
    }
  };

  const handlePlacesError = (error: any) => {
    console.error('PlansScreen: GooglePlaces Error:', error);
    Alert.alert(
      'Search Error',
      'There was an error loading places. Please try again later.',
      [{ text: 'OK' }]
    );
  };

  const handlePlacesNotFound = () => {
    console.log('PlansScreen: No places found');
    Alert.alert(
      'No Results',
      'No locations found matching your search.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log('PlansScreen: Back button pressed');
          router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              pinColor="red"
            />
          )}
        </MapView>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <SafeGooglePlacesAutocomplete
              placeholder="Search location (e.g., Pune)"
              onPress={handleLocationSelect}
              onFail={handlePlacesError}
              onNotFound={handlePlacesNotFound}
              apiKey={API_KEY}
              styles={{
                container: {
                  flex: 0,
                  width: width - 90,
                },
                textInput: {
                  height: 50,
                  backgroundColor: '#F0F0F0',
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
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 5,
                  maxHeight: 200,
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
            />
            {searchError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="location" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
            disabled={!selectedLocation || isLoading}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>
              {isLoading ? 'Loading...' : 'Confirm Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  searchWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  mapContainer: {
    height: height * 0.8,
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  errorText: {
    color: '#D00000',
    fontSize: 14,
  },
}); 