import React from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';

interface SafeGooglePlacesAutocompleteProps {
  placeholder: string;
  onPress: (data: GooglePlaceData, details: GooglePlaceDetail | null) => void;
  onFail?: (error: any) => void;
  onNotFound?: () => void;
  apiKey: string;
  styles?: any;
  textInputProps?: any;
  [key: string]: any;
}

const SafeGooglePlacesAutocomplete: React.FC<SafeGooglePlacesAutocompleteProps> = ({
  placeholder,
  onPress,
  onFail,
  onNotFound,
  apiKey,
  styles,
  textInputProps,
  ...props
}) => {
  const handlePress = (data: GooglePlaceData, details: GooglePlaceDetail | null) => {
    try {
      onPress(data, details);
    } catch (error) {
      console.error('SafeGooglePlacesAutocomplete: Error in onPress:', error);
      if (onFail) {
        onFail(error);
      }
    }
  };

  const handleFail = (error: any) => {
    console.error('SafeGooglePlacesAutocomplete: API Error:', error);
    if (onFail) {
      onFail(error);
    }
  };

  const handleNotFound = () => {
    console.log('SafeGooglePlacesAutocomplete: No results found');
    if (onNotFound) {
      onNotFound();
    }
  };

  try {
    return (
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={handlePress}
        fetchDetails={true}
        enablePoweredByContainer={false}
        query={{
          key: apiKey,
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
        predefinedPlaces={[]}
        predefinedPlacesAlwaysVisible={false}
        suppressDefaultStyles={false}
        disableScroll={false}
        styles={styles}
        textInputProps={textInputProps}
        minLength={2}
        debounce={300}
        enableHighAccuracyLocation={true}
        timeout={15000}
        onFail={handleFail}
        onNotFound={handleNotFound}
        {...props}
      />
    );
  } catch (error) {
    console.error('SafeGooglePlacesAutocomplete: Render error:', error);
    return (
      <View style={styles?.container}>
        <Text style={{ color: '#666', padding: 16 }}>
          Search temporarily unavailable. Please try again.
        </Text>
      </View>
    );
  }
};

export default SafeGooglePlacesAutocomplete; 