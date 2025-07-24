import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
// import { Picker } from '@react-native-picker/picker'; // Temporarily commented out
import { generateHouseLayout, validatePrompt, getInstallationInstructions } from '../utils/gemini-service';

const { width } = Dimensions.get('window');

interface FormData {
  // Property & Plot Details
  totalPlotArea: string;
  plotLength: string;
  plotBreadth: string;
  plotShape: string;
  
  // General Building Structure
  numberOfFloors: string;
  
  // Room Selection
  masterBedrooms: string;
  childrenBedrooms: string;
  guestBedrooms: string;
  livingRoom: boolean;
  diningArea: boolean;
  numberOfKitchens: string;
  kitchenType: string;
  numberOfBathrooms: string;
  
  // Special Rooms
  studyRoom: boolean;
  utilityRoom: boolean;
  pujaRoom: boolean;
  homeTheater: boolean;
  gym: boolean;
  balcony: boolean;
  patio: boolean;
  garage: boolean;
  library: boolean;
  walkInCloset: boolean;
  pantry: boolean;
  laundryRoom: boolean;
  
  // Room Sizes
  masterBedroomLength: string;
  masterBedroomBreadth: string;
  childrenBedroomLength: string;
  childrenBedroomBreadth: string;
  guestBedroomLength: string;
  guestBedroomBreadth: string;
  livingRoomLength: string;
  livingRoomBreadth: string;
  diningAreaLength: string;
  diningAreaBreadth: string;
  kitchenLength: string;
  kitchenBreadth: string;
  studyRoomLength: string;
  studyRoomBreadth: string;
  bathroomLength: string;
  bathroomBreadth: string;
  utilityRoomLength: string;
  utilityRoomBreadth: string;
  
  // Orientation & Preferences
  mainEntranceDirection: string;
  mainEntranceLocation: string;
  hallwayWidth: string;
  staircaseLocation: string;
  
  // Outdoor Spaces
  parkingSpaces: string;
  garden: boolean;
  gardenLength: string;
  gardenBreadth: string;
  frontPorch: boolean;
  frontPorchLength: string;
  frontPorchBreadth: string;
  terrace: boolean;
  
  // Special Requirements
  childSafety: boolean;
  petFriendly: boolean;
  houseStyle: string;
  accessibility: string[];
}

const plotShapeOptions = [
  { label: 'Select Plot Shape', value: '', disabled: true },
  { label: 'Rectangular', value: 'rectangular' },
  { label: 'Square', value: 'square' },
  { label: 'L-Shaped', value: 'l-shaped' },
  { label: 'T-Shaped', value: 't-shaped' },
  { label: 'U-Shaped', value: 'u-shaped' },
  { label: 'C-Shaped', value: 'c-shaped' },
  { label: 'Irregular Polygon', value: 'irregular' },
  { label: 'Corner Plot', value: 'corner' },
  { label: 'Trapezoidal', value: 'trapezoidal' },
  { label: 'Triangular', value: 'triangular' }
];

const kitchenTypeOptions = [
  { label: 'Select Kitchen Type', value: '', disabled: true },
  { label: 'Modular', value: 'modular' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' }
];

const entranceDirectionOptions = [
  { label: 'Select Direction', value: '', disabled: true },
  { label: 'North', value: 'north' },
  { label: 'East', value: 'east' },
  { label: 'South', value: 'south' },
  { label: 'West', value: 'west' }
];

const entranceLocationOptions = [
  { label: 'Select Location', value: '', disabled: true },
  { label: 'Center Front', value: 'center-front' },
  { label: 'Left Front', value: 'left-front' },
  { label: 'Right Front', value: 'right-front' },
  { label: 'Side Left', value: 'side-left' },
  { label: 'Side Right', value: 'side-right' },
  { label: 'Corner', value: 'corner' }
];

const houseStyleOptions = [
  { label: 'Select House Style', value: '', disabled: true },
  { label: 'Modern', value: 'modern' },
  { label: 'Traditional', value: 'traditional' },
  { label: 'Minimalist', value: 'minimalist' },
  { label: 'Contemporary', value: 'contemporary' },
  { label: 'Colonial', value: 'colonial' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Ranch', value: 'ranch' },
  { label: 'Victorian', value: 'victorian' },
  { label: 'Farmhouse', value: 'farmhouse' }
];

export default function SampleLayoutsScreen() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [currentPickerOptions, setCurrentPickerOptions] = useState<any[]>([]);
  const [currentPickerCallback, setCurrentPickerCallback] = useState<((value: string) => void) | null>(null);
  const [currentPickerValue, setCurrentPickerValue] = useState('');
  const [formData, setFormData] = useState<FormData>({
    totalPlotArea: '',
    plotLength: '',
    plotBreadth: '',
    plotShape: '',
    numberOfFloors: '1',
    masterBedrooms: '1',
    childrenBedrooms: '0',
    guestBedrooms: '0',
    livingRoom: true,
    diningArea: true,
    numberOfKitchens: '1',
    kitchenType: '',
    numberOfBathrooms: '1',
    studyRoom: false,
    utilityRoom: false,
    pujaRoom: false,
    homeTheater: false,
    gym: false,
    balcony: false,
    patio: false,
    garage: false,
    library: false,
    walkInCloset: false,
    pantry: false,
    laundryRoom: false,
    masterBedroomLength: '',
    masterBedroomBreadth: '',
    childrenBedroomLength: '',
    childrenBedroomBreadth: '',
    guestBedroomLength: '',
    guestBedroomBreadth: '',
    livingRoomLength: '',
    livingRoomBreadth: '',
    diningAreaLength: '',
    diningAreaBreadth: '',
    kitchenLength: '',
    kitchenBreadth: '',
    studyRoomLength: '',
    studyRoomBreadth: '',
    bathroomLength: '',
    bathroomBreadth: '',
    utilityRoomLength: '',
    utilityRoomBreadth: '',
    mainEntranceDirection: '',
    mainEntranceLocation: '',
    hallwayWidth: '',
    staircaseLocation: '',
    parkingSpaces: '0',
    garden: false,
    gardenLength: '',
    gardenBreadth: '',
    frontPorch: false,
    frontPorchLength: '',
    frontPorchBreadth: '',
    terrace: false,
    childSafety: false,
    petFriendly: false,
    houseStyle: '',
    accessibility: []
  });

  const updateFormData = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleBoolean = (key: keyof FormData) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateLayoutPrompt = () => {
    const specialRooms = [];
    if (formData.studyRoom) specialRooms.push('study room/home office');
    if (formData.utilityRoom) specialRooms.push('utility/storage room');
    if (formData.pujaRoom) specialRooms.push('puja room');
    if (formData.homeTheater) specialRooms.push('home theater');
    if (formData.gym) specialRooms.push('gym');
    if (formData.balcony) specialRooms.push('balcony');
    if (formData.patio) specialRooms.push('patio');
    if (formData.garage) specialRooms.push('garage');
    if (formData.library) specialRooms.push('library');
    if (formData.walkInCloset) specialRooms.push('walk-in closet');
    if (formData.pantry) specialRooms.push('pantry');
    if (formData.laundryRoom) specialRooms.push('laundry room');

    return `Generate a detailed architectural floor plan layout image for a house with the following specifications:

PROPERTY DETAILS:
- Total Plot Area: ${formData.totalPlotArea} sq.ft
- Plot Dimensions: ${formData.plotLength} ft x ${formData.plotBreadth} ft
- Plot Shape: ${formData.plotShape}
- Number of Floors: ${formData.numberOfFloors}

ROOM CONFIGURATION:
- Master Bedrooms: ${formData.masterBedrooms}
- Children Bedrooms: ${formData.childrenBedrooms}
- Guest Bedrooms: ${formData.guestBedrooms}
- Living Room: ${formData.livingRoom ? 'Yes' : 'No'}
- Dining Area: ${formData.diningArea ? 'Yes' : 'No'}
- Kitchens: ${formData.numberOfKitchens} (Type: ${formData.kitchenType})
- Bathrooms: ${formData.numberOfBathrooms}

SPECIAL ROOMS: ${specialRooms.length > 0 ? specialRooms.join(', ') : 'None'}

ROOM DIMENSIONS:
${parseInt(formData.masterBedrooms) > 0 && formData.masterBedroomLength && formData.masterBedroomBreadth ? 
  `- Master Bedroom: ${formData.masterBedroomLength} ft x ${formData.masterBedroomBreadth} ft` : ''}
${parseInt(formData.childrenBedrooms) > 0 && formData.childrenBedroomLength && formData.childrenBedroomBreadth ? 
  `- Children Bedroom: ${formData.childrenBedroomLength} ft x ${formData.childrenBedroomBreadth} ft` : ''}
${parseInt(formData.guestBedrooms) > 0 && formData.guestBedroomLength && formData.guestBedroomBreadth ? 
  `- Guest Bedroom: ${formData.guestBedroomLength} ft x ${formData.guestBedroomBreadth} ft` : ''}
${formData.livingRoom && formData.livingRoomLength && formData.livingRoomBreadth ? 
  `- Living Room: ${formData.livingRoomLength} ft x ${formData.livingRoomBreadth} ft` : ''}
${formData.diningArea && formData.diningAreaLength && formData.diningAreaBreadth ? 
  `- Dining Area: ${formData.diningAreaLength} ft x ${formData.diningAreaBreadth} ft` : ''}
${formData.kitchenLength && formData.kitchenBreadth ? 
  `- Kitchen: ${formData.kitchenLength} ft x ${formData.kitchenBreadth} ft` : ''}
${formData.studyRoom && formData.studyRoomLength && formData.studyRoomBreadth ? 
  `- Study Room: ${formData.studyRoomLength} ft x ${formData.studyRoomBreadth} ft` : ''}
${formData.bathroomLength && formData.bathroomBreadth ? 
  `- Bathroom: ${formData.bathroomLength} ft x ${formData.bathroomBreadth} ft` : ''}
${formData.utilityRoom && formData.utilityRoomLength && formData.utilityRoomBreadth ? 
  `- Utility Room: ${formData.utilityRoomLength} ft x ${formData.utilityRoomBreadth} ft` : ''}

LAYOUT & CIRCULATION:
- Main Entrance Direction: ${formData.mainEntranceDirection}
- Main Entrance Location: ${formData.mainEntranceLocation}
${formData.hallwayWidth ? `- Hallway Width: ${formData.hallwayWidth} ft` : ''}
${formData.staircaseLocation ? `- Staircase Location: ${formData.staircaseLocation}` : ''}

OUTDOOR SPACES:
${parseInt(formData.parkingSpaces) > 0 ? `- Parking Spaces: ${formData.parkingSpaces} cars` : ''}
${formData.garden ? `- Garden: ${formData.gardenLength} ft x ${formData.gardenBreadth} ft` : ''}
${formData.frontPorch && formData.frontPorchLength && formData.frontPorchBreadth ? 
  `- Front Porch: ${formData.frontPorchLength} ft x ${formData.frontPorchBreadth} ft` : 
  (formData.frontPorch ? '- Front Porch: Yes' : '')}
${formData.terrace ? '- Terrace: Yes' : ''}

SPECIAL REQUIREMENTS:
${formData.childSafety ? '- Child Safety Features' : ''}
${formData.petFriendly ? '- Pet-friendly Features' : ''}
${formData.accessibility.length > 0 ? `- Accessibility: ${formData.accessibility.join(', ')}` : ''}
- House Style: ${formData.houseStyle}

Please create a professional architectural floor plan drawing showing:
1. Accurate room layouts and dimensions as specified
2. Door and window placements optimized for the layout
3. Proper room labels and annotations
4. Scale measurements and proportional spacing
5. Compass direction indicator showing entrance orientation
6. Clear circulation paths and hallways
7. All special rooms and features mentioned above
8. Architectural symbols for fixtures and fittings
9. Professional technical drawing style suitable for construction
10. Top-view perspective with clean lines and proper scaling`;
  };

  const generateLayout = async () => {
    // Basic validation
    if (!formData.totalPlotArea || !formData.plotLength || !formData.plotBreadth || !formData.plotShape) {
      Alert.alert('Validation Error', 'Please fill in all required plot details.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = generateLayoutPrompt();
      console.log('🏠 Generated Prompt for Gemini 2.5 Pro:', prompt);
      
      // Validate the prompt
      if (!validatePrompt(prompt)) {
        Alert.alert('Invalid Input', 'Please fill in more details to generate a proper layout.');
        setIsGenerating(false);
        return;
      }

      // Generate layout using Gemini 2.5 Pro
      const result = await generateHouseLayout({
        prompt: prompt
      });

      if (result.success && result.imageUri) {
        setGeneratedImageUri(result.imageUri);
        Alert.alert(
          'Success! 🎉',
          'Your house layout has been generated using Gemini 2.5 Pro AI!',
          [{ text: 'View Layout', style: 'default' }]
        );
      } else {
        // Show installation instructions if needed
        const instructions = getInstallationInstructions();
        Alert.alert(
          'Setup Required',
          result.error || 'Failed to generate layout.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Setup Instructions', 
              onPress: () => {
                console.log(instructions);
                Alert.alert('Setup Instructions', instructions);
              }
            }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Error generating layout:', error);
      Alert.alert('Error', error.message || 'Failed to generate layout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImageUri) return;
    
    setIsDownloading(true);
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please grant storage permission to download images.');
        return;
      }

      console.log('📥 Starting image download...');
      
      // Check if it's a data URI (base64) or regular URL
      if (generatedImageUri.startsWith('data:')) {
        // Handle base64 data URI
        console.log('📋 Processing base64 data URI...');
        
        const fileName = `house_layout_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Extract base64 data from data URI
        const base64Data = generatedImageUri.split(',')[1];
        
        // Write base64 data to file
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('💾 File saved to:', fileUri);
        
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('House Layouts', asset, false);
        
        console.log('✅ Image saved to gallery!');
        
        Alert.alert(
          'Success! 🎉', 
          'House layout downloaded successfully to your gallery!',
          [{ text: 'OK', style: 'default' }]
        );
        
      } else {
        // Handle regular URL (fallback for external URLs)
        console.log('🌐 Processing regular URL...');
        
        const fileName = `house_layout_${Date.now()}.jpg`;
        const downloadResumable = FileSystem.createDownloadResumable(
          generatedImageUri,
          FileSystem.documentDirectory + fileName
        );

        const downloadResult = await downloadResumable.downloadAsync();
        if (downloadResult?.uri) {
          // Save to media library
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          await MediaLibrary.createAlbumAsync('House Layouts', asset, false);
          
          Alert.alert(
            'Success! 🎉', 
            'House layout downloaded successfully to your gallery!',
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error downloading image:', error);
      Alert.alert('Error', `Failed to download image: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = () => {
    generateLayout();
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderTextInput = (
    label: string, 
    value: string, 
    onChangeText: (text: string) => void, 
    placeholder?: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, { paddingHorizontal: 12 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  const openPickerModal = (
    options: { label: string; value: string; disabled?: boolean }[],
    currentValue: string,
    callback: (value: string) => void
  ) => {
    setCurrentPickerOptions(options);
    setCurrentPickerValue(currentValue);
    setCurrentPickerCallback(() => callback);
    setShowPickerModal(true);
  };

  const renderPicker = (
    label: string,
    selectedValue: string,
    onValueChange: (value: string) => void,
    options: { label: string; value: string; disabled?: boolean }[]
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => openPickerModal(options, selectedValue, onValueChange)}
      >
        <Text style={styles.pickerButtonText}>
          {options.find(opt => opt.value === selectedValue)?.label || options[0]?.label || 'Select'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderCheckbox = (label: string, value: boolean, onToggle: () => void) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
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
        <Text style={styles.headerTitle}>Sample Layouts</Text>
        <View style={styles.headerButton} />
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>House Layout Generator</Text>
            <Text style={styles.introSubtitle}>
              Fill in your requirements to generate a personalized house layout
            </Text>
          </View>

          {/* Property & Plot Details */}
          {renderSectionHeader('Property & Plot Details')}
          {renderTextInput(
            'Total Plot Area (sq.ft)*', 
            formData.totalPlotArea, 
            (text) => updateFormData('totalPlotArea', text),
            'Enter area in sq.ft',
            'numeric'
          )}
          {renderTextInput(
            'Plot Length (ft)*', 
            formData.plotLength, 
            (text) => updateFormData('plotLength', text),
            'Enter length in feet',
            'numeric'
          )}
          {renderTextInput(
            'Plot Breadth (ft)*', 
            formData.plotBreadth, 
            (text) => updateFormData('plotBreadth', text),
            'Enter breadth in feet',
            'numeric'
          )}
          {renderPicker(
            'Plot Shape*',
            formData.plotShape,
            (value) => updateFormData('plotShape', value),
            plotShapeOptions
          )}

          {/* General Building Structure */}
          {renderSectionHeader('General Building Structure')}
          {renderPicker(
            'Number of Floors',
            formData.numberOfFloors,
            (value) => updateFormData('numberOfFloors', value),
            [
              { label: '1 Floor', value: '1' },
              { label: '2 Floors', value: '2' },
              { label: '3 Floors', value: '3' }
            ]
          )}

          {/* Room Selection */}
          {renderSectionHeader('Room Selection')}
          {renderTextInput(
            'Master Bedrooms', 
            formData.masterBedrooms, 
            (text) => updateFormData('masterBedrooms', text),
            'Number of master bedrooms',
            'numeric'
          )}
          {renderTextInput(
            'Children Bedrooms', 
            formData.childrenBedrooms, 
            (text) => updateFormData('childrenBedrooms', text),
            'Number of children bedrooms',
            'numeric'
          )}
          {renderTextInput(
            'Guest Bedrooms', 
            formData.guestBedrooms, 
            (text) => updateFormData('guestBedrooms', text),
            'Number of guest bedrooms',
            'numeric'
          )}
          
          {renderCheckbox('Living Room', formData.livingRoom, () => toggleBoolean('livingRoom'))}
          {renderCheckbox('Dining Area', formData.diningArea, () => toggleBoolean('diningArea'))}
          
          {renderTextInput(
            'Number of Kitchens', 
            formData.numberOfKitchens, 
            (text) => updateFormData('numberOfKitchens', text),
            'Number of kitchens',
            'numeric'
          )}
          {renderPicker(
            'Kitchen Type',
            formData.kitchenType,
            (value) => updateFormData('kitchenType', value),
            kitchenTypeOptions
          )}
          {renderTextInput(
            'Number of Bathrooms', 
            formData.numberOfBathrooms, 
            (text) => updateFormData('numberOfBathrooms', text),
            'Number of bathrooms',
            'numeric'
          )}

          {/* Special Rooms */}
          {renderSectionHeader('Special Rooms')}
          {renderCheckbox('Study Room/Home Office', formData.studyRoom, () => toggleBoolean('studyRoom'))}
          {renderCheckbox('Utility/Storage Room', formData.utilityRoom, () => toggleBoolean('utilityRoom'))}
          {renderCheckbox('Puja Room', formData.pujaRoom, () => toggleBoolean('pujaRoom'))}
          {renderCheckbox('Home Theater', formData.homeTheater, () => toggleBoolean('homeTheater'))}
          {renderCheckbox('Gym', formData.gym, () => toggleBoolean('gym'))}
          {renderCheckbox('Balcony', formData.balcony, () => toggleBoolean('balcony'))}
          {renderCheckbox('Patio', formData.patio, () => toggleBoolean('patio'))}
          {renderCheckbox('Garage', formData.garage, () => toggleBoolean('garage'))}
          {renderCheckbox('Library', formData.library, () => toggleBoolean('library'))}
          {renderCheckbox('Walk-in Closet', formData.walkInCloset, () => toggleBoolean('walkInCloset'))}
          {renderCheckbox('Pantry', formData.pantry, () => toggleBoolean('pantry'))}
          {renderCheckbox('Laundry Room', formData.laundryRoom, () => toggleBoolean('laundryRoom'))}

          {/* Room Sizes */}
          {renderSectionHeader('Room Sizes (Length x Breadth in feet)')}
          {parseInt(formData.masterBedrooms) > 0 && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Master Bedroom</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.masterBedroomLength, 
                  (text) => updateFormData('masterBedroomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.masterBedroomBreadth, 
                  (text) => updateFormData('masterBedroomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {parseInt(formData.childrenBedrooms) > 0 && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Children Bedroom</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.childrenBedroomLength, 
                  (text) => updateFormData('childrenBedroomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.childrenBedroomBreadth, 
                  (text) => updateFormData('childrenBedroomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {parseInt(formData.guestBedrooms) > 0 && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Guest Bedroom</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.guestBedroomLength, 
                  (text) => updateFormData('guestBedroomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.guestBedroomBreadth, 
                  (text) => updateFormData('guestBedroomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {formData.livingRoom && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Living Room</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.livingRoomLength, 
                  (text) => updateFormData('livingRoomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.livingRoomBreadth, 
                  (text) => updateFormData('livingRoomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {formData.diningArea && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Dining Area</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.diningAreaLength, 
                  (text) => updateFormData('diningAreaLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.diningAreaBreadth, 
                  (text) => updateFormData('diningAreaBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          <View style={styles.roomSizeRow}>
            <Text style={styles.roomSizeTitle}>Kitchen</Text>
            <View style={styles.roomSizeInputs}>
              {renderTextInput(
                'Length', 
                formData.kitchenLength, 
                (text) => updateFormData('kitchenLength', text),
                'Length',
                'numeric'
              )}
              {renderTextInput(
                'Breadth', 
                formData.kitchenBreadth, 
                (text) => updateFormData('kitchenBreadth', text),
                'Breadth',
                'numeric'
              )}
            </View>
          </View>

          {formData.studyRoom && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Study Room</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.studyRoomLength, 
                  (text) => updateFormData('studyRoomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.studyRoomBreadth, 
                  (text) => updateFormData('studyRoomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {formData.bathroomLength && formData.bathroomBreadth && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Bathroom</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.bathroomLength, 
                  (text) => updateFormData('bathroomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.bathroomBreadth, 
                  (text) => updateFormData('bathroomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {formData.utilityRoom && formData.utilityRoomLength && formData.utilityRoomBreadth && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Utility Room</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.utilityRoomLength, 
                  (text) => updateFormData('utilityRoomLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.utilityRoomBreadth, 
                  (text) => updateFormData('utilityRoomBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}

          {/* Orientation & Preferences */}
          {renderSectionHeader('Orientation & Preferences')}
          {renderPicker(
            'Main Entrance Direction',
            formData.mainEntranceDirection,
            (value) => updateFormData('mainEntranceDirection', value),
            entranceDirectionOptions
          )}
          {renderPicker(
            'Main Entrance Location',
            formData.mainEntranceLocation,
            (value) => updateFormData('mainEntranceLocation', value),
            entranceLocationOptions
          )}
          {renderTextInput(
            'Hallway/Passage Width (ft)', 
            formData.hallwayWidth, 
            (text) => updateFormData('hallwayWidth', text),
            'Enter width in feet',
            'numeric'
          )}
          {renderTextInput(
            'Staircase Location', 
            formData.staircaseLocation, 
            (text) => updateFormData('staircaseLocation', text),
            'Enter location (e.g., center-front, side-left)',
            'default'
          )}

          {/* Outdoor Spaces */}
          {renderSectionHeader('Outdoor and Special Spaces')}
          {renderTextInput(
            'Parking Spaces Needed', 
            formData.parkingSpaces, 
            (text) => updateFormData('parkingSpaces', text),
            'Number of cars',
            'numeric'
          )}
          {renderCheckbox('Garden/Backyard', formData.garden, () => toggleBoolean('garden'))}
          {formData.garden && (
            <View style={styles.roomSizeRow}>
              <Text style={styles.roomSizeTitle}>Garden Size</Text>
              <View style={styles.roomSizeInputs}>
                {renderTextInput(
                  'Length', 
                  formData.gardenLength, 
                  (text) => updateFormData('gardenLength', text),
                  'Length',
                  'numeric'
                )}
                {renderTextInput(
                  'Breadth', 
                  formData.gardenBreadth, 
                  (text) => updateFormData('gardenBreadth', text),
                  'Breadth',
                  'numeric'
                )}
              </View>
            </View>
          )}
          {renderCheckbox('Front Porch', formData.frontPorch, () => toggleBoolean('frontPorch'))}
          {renderCheckbox('Terrace', formData.terrace, () => toggleBoolean('terrace'))}

          {/* Special Requirements */}
          {renderSectionHeader('Special Requirements & Style')}
          {renderCheckbox('Child Safety Features', formData.childSafety, () => toggleBoolean('childSafety'))}
          {renderCheckbox('Pet-friendly Features', formData.petFriendly, () => toggleBoolean('petFriendly'))}
          {renderPicker(
            'Preferred House Style',
            formData.houseStyle,
            (value) => updateFormData('houseStyle', value),
            houseStyleOptions
          )}
          {renderPicker(
            'Accessibility Features',
            formData.accessibility.join(', '),
            (value) => updateFormData('accessibility', value.split(',').map(item => item.trim())),
            [
              { label: 'None', value: '' },
              { label: 'Wheelchair Accessible', value: 'wheelchair accessible' },
              { label: 'Sloped Ramps', value: 'sloped ramps' },
              { label: 'Wide Doors', value: 'wide doors' },
              { label: 'Elevator', value: 'elevator' },
              { label: 'Stair-free Entry', value: 'stair-free entry' },
              { label: 'Grab Bars', value: 'grab bars' },
              { label: 'Accessible Bathroom', value: 'accessible bathroom' },
              { label: 'Accessible Kitchen', value: 'accessible kitchen' },
              { label: 'Accessible Bedroom', value: 'accessible bedroom' },
              { label: 'Accessible Living Room', value: 'accessible living room' },
              { label: 'Accessible Dining Area', value: 'accessible dining area' },
              { label: 'Accessible Study Room', value: 'accessible study room' },
              { label: 'Accessible Utility Room', value: 'accessible utility room' },
              { label: 'Accessible Pantry', value: 'accessible pantry' },
              { label: 'Accessible Laundry Room', value: 'accessible laundry room' },
              { label: 'Accessible Walk-in Closet', value: 'accessible walk-in closet' },
              { label: 'Accessible Balcony', value: 'accessible balcony' },
              { label: 'Accessible Patio', value: 'accessible patio' },
              { label: 'Accessible Garage', value: 'accessible garage' },
              { label: 'Accessible Library', value: 'accessible library' },
            ]
          )}

          <TouchableOpacity 
            style={[styles.submitButton, isGenerating && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Generating Layout...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Generate Layout with AI</Text>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {generatedImageUri && (
            <View style={styles.generatedImageSection}>
              <Text style={styles.generatedImageTitle}>Generated Layout</Text>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: generatedImageUri }} 
                  style={styles.generatedImage}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity 
                style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
                onPress={downloadImage}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.downloadButtonText}>Downloading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download Layout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal
        visible={showPickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {currentPickerOptions.filter(option => !option.disabled).map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    option.value === currentPickerValue && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    if (currentPickerCallback) {
                      currentPickerCallback(option.value);
                    }
                    setShowPickerModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    option.value === currentPickerValue && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {option.value === currentPickerValue && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 80,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  introSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  roomSizeRow: {
    marginBottom: 20,
  },
  roomSizeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  roomSizeInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  generatedImageSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  generatedImageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: '#28A745',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
}); 