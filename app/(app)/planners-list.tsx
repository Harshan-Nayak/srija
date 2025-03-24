import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_KEY = 'AIzaSyChohq3UosE8u0QBRugqMMxInXQ4WKL2L4';

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  photos?: {
    photo_reference: string;
  }[];
  rating?: number;
  user_ratings_total?: number;
}

export default function PlannersListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { latitude, longitude } = params;
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNearbyPlaces();
  }, [latitude, longitude]);

  const fetchNearbyPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      // Search for construction companies and real estate developers
      const types = ['real_estate_agency', 'general_contractor'];
      const radius = 5000; // 5km radius
      
      const promises = types.map(type =>
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${API_KEY}`
        ).then(res => res.json())
      );

      const responses = await Promise.all(promises);
      
      // Combine and deduplicate results
      const allPlaces = responses.flatMap(response => {
        if (response.status === 'OK') {
          return response.results;
        }
        if (response.status === 'ZERO_RESULTS') {
          return [];
        }
        throw new Error(response.status);
      });

      // Remove duplicates based on place_id
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.place_id, place])).values()
      );

      setPlaces(uniquePlaces);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to load nearby planners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
  };

  const handleDirections = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleWebsite = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.result?.website) {
        Linking.openURL(data.result.website);
      } else {
        console.log('No website available');
      }
    } catch (err) {
      console.error('Error fetching website:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Planners</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Finding nearby planners...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchNearbyPlaces}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>No planners found in this area</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {places.map((place) => (
            <View key={place.place_id} style={styles.plannerCard}>
              <Image
                source={
                  place.photos?.[0]
                    ? { uri: getPhotoUrl(place.photos[0].photo_reference) }
                    : require('../../assets/images/placeholder.jpg')
                }
                style={styles.plannerImage}
                defaultSource={require('../../assets/images/placeholder.jpg')}
              />
              <View style={styles.plannerInfo}>
                <Text style={styles.plannerName}>{place.name}</Text>
                <Text style={styles.plannerAddress}>{place.vicinity}</Text>
                {place.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {place.rating.toFixed(1)} ({place.user_ratings_total})
                    </Text>
                  </View>
                )}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleWebsite(place.place_id)}
                  >
                    <Ionicons name="globe-outline" size={20} color="#000" />
                    <Text style={styles.actionButtonText}>Website</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDirections(place.vicinity)}
                  >
                    <Ionicons name="navigate-outline" size={20} color="#000" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
    fontSize: 18,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#D00000',
    textAlign: 'center',
    marginBottom: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  plannerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plannerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  plannerInfo: {
    flex: 1,
  },
  plannerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  plannerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#000',
  },
}); 