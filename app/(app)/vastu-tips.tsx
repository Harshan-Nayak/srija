import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const vastuTips = [
  {
    id: 1,
    title: "Check the Shape of the Property",
    content: "According to Vastu, the shape of the room should always be rectangular or square. These shapes are considered auspicious and ensure the smooth flow and balance of energy. If some of the rooms are irregular in shape, consider adding plants to correct the energy flow."
  },
  {
    id: 2,
    title: "Check the Orientation & Entrance of Property",
    content: "Property orientation is crucial in Vastu Shastra. Ideally, a property should have its main entrance facing north, east, or northeast. These directions are considered highly auspicious and are believed to bring prosperity, health, and positive energy into the home."
  },
  {
    id: 3,
    title: "Vastu Tips for Living Room",
    content: "The living room should ideally be located in the north, east or northeast direction. Keep the living room clutter-free. You can use light colour paints like whites, creams and pastels to maintain a light and airy feel. Keep the furniture in the west or southwest direction. If you want to keep the mirror in the living room, place it on the north wall."
  },
  {
    id: 4,
    title: "Vastu Tips for Kitchen",
    content: "Ideally, the kitchen should be placed in the southeast direction of the house. Use yellow, orange, or red colors for the walls, as they are auspicious and enhance the fire element. The stove should be placed in the southeast direction. Never keep the gas stove and water sink on the same platform as water and fire are distinct elements."
  },
  {
    id: 5,
    title: "Vastu Tip for Bathroom",
    content: "According to Vastu, a bathroom in the north or northwest part is the most favourable. Avoid having bathrooms directly facing the kitchen or the main entrance. The toilet should face north-south and should not be located in the northeast or southwest corners. Ensure bathroom doors are always kept closed and use light, soothing colours."
  },
  {
    id: 6,
    title: "Vastu Tips for Dining Area",
    content: "The dining table should be square or rectangular, avoid circular or irregular shapes. Ensure the dining area is well-lit and free from clutter. The dining table can be positioned in the east or southeast part of your home, avoid southwest direction. Pick light colours like beige, peach or cream for a positive atmosphere."
  },
  {
    id: 7,
    title: "Vastu Tips for Balcony",
    content: "Balconies should face north or east to capture the morning sunlight. You can consider adding plants like bamboo, jasmine, and tulsi for peace and prosperity. Use wooden furniture to enhance the earth element. Avoid storing garbage bins or broken items on the balcony."
  },
  {
    id: 8,
    title: "Vastu Tips for Master Bedroom",
    content: "Southwest is the best direction for the master bedroom. The bed should be positioned so that the head points towards the south or west, enhancing quality sleep. Opt for soothing tones like browns, beiges, or greens. Avoid placing mirrors directly opposite the bed."
  },
  {
    id: 9,
    title: "Vastu Tips for Children's Room",
    content: "Children's bedrooms should be located in the west or northwest direction. Use light colors like light green, blue, or yellow to create a calm environment. The study table should face east or north for better concentration. Ensure proper ventilation and natural light."
  },
  {
    id: 10,
    title: "Vastu Tips for Puja Room",
    content: "The puja room should be located in the northeast corner of the house. Face east or north while praying. Use light colors like white, light yellow, or light blue for the walls. Ensure the room is well-ventilated and receives natural light. Keep the space clean and clutter-free."
  },
  {
    id: 11,
    title: "Colors to Use",
    content: "Light colors like white, cream, light yellow, light green, and light blue are considered auspicious in Vastu. These colors promote positive energy, peace, and prosperity. Use these colors for walls, furniture, and decor to maintain harmony in your home."
  },
  {
    id: 12,
    title: "Colors to Avoid",
    content: "Avoid using dark colours like navy blue and black as these colours can attract negative energy. Also avoid using too much red or bright orange in bedrooms as they can cause restlessness and disturb sleep patterns."
  }
];

const benefits = [
  {
    icon: 'heart-outline',
    title: 'Improves Relationships',
    description: 'Proper directions and room placements improve relationships among family members by balancing energies within the home.'
  },
  {
    icon: 'fitness-outline',
    title: 'Promotes Good Health & Wellbeing',
    description: 'By ensuring positive energy flow, Vastu improves physical and mental well-being, leading to superior health.'
  },
  {
    icon: 'happy-outline',
    title: 'Reduces Stress & Negativity',
    description: 'A proper vastu-compliant home minimizes negative energies, helping reduce stress and improve quality of life.'
  },
  {
    icon: 'leaf-outline',
    title: 'Boosts Spiritual Growth',
    description: 'Strategic positioning of the indoor temple and entrances improve spiritual practices and foster tranquillity.'
  }
];

export default function VastuTipsScreen() {
  const router = useRouter();

  const renderTipCard = (tip: typeof vastuTips[0]) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipNumber}>
          <Text style={styles.tipNumberText}>{tip.id}</Text>
        </View>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>
      <Text style={styles.tipContent}>{tip.content}</Text>
    </View>
  );

  const renderBenefitCard = (benefit: typeof benefits[0], index: number) => (
    <View key={index} style={styles.benefitCard}>
      <View style={styles.benefitIcon}>
        <Ionicons name={benefit.icon as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitDescription}>{benefit.description}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vastu Tips</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>15 Important Vastu Tips for New House</Text>
            <Text style={styles.heroSubtitle}>
              Vastu Shastra, an ancient Indian science, offers a profound framework for arranging your home to bring prosperity, happiness, and positive energy.
            </Text>
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Important Vastu Tips for House</Text>
            {vastuTips.map(renderTipCard)}
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Is Vastu Important For a New Home?</Text>
            <Text style={styles.benefitsIntro}>
              A vastu-compliant home creates a harmonious and peaceful living environment. It promotes positivity and the flow of good energy within the house.
            </Text>
            {benefits.map(renderBenefitCard)}
          </View>

          <View style={styles.expertQuote}>
            <View style={styles.quoteIcon}>
              <Ionicons name="chatbubble-outline" size={32} color="#007AFF" />
            </View>
            <Text style={styles.quoteText}>
              "We all want our house to be positive and happy. We pay attention to every detail of them but forget to imply Vastu for house guidelines. It affects our life negatively. How does Vastu Shastra work? In Vastu Shastra, energy plays a big role. This energy encircles us and lies within and around us. This invisible energy is called Cosmic Energy. Any imbalance in this energy due to Vastu defects, causes negative results in our lives and brings adversity."
            </Text>
            <Text style={styles.quoteAuthor}>- Tushar Bhangalre, Vastu Expert, Marathon Realty</Text>
          </View>

          <View style={styles.conclusion}>
            <Text style={styles.conclusionTitle}>Conclusion</Text>
            <Text style={styles.conclusionText}>
              Applying vastu tips for the house when setting up your new home helps make it a place of peace and happiness. By following these ancient vastu-for-house principles, you can create an environment that supports both your well-being and prosperity.
            </Text>
          </View>

          <View style={styles.sourceSection}>
            <Text style={styles.sourceTitle}>Source</Text>
            <Text style={styles.sourceText}>
              Content adapted from Marathon Realty's comprehensive guide on Vastu tips for new homes.
            </Text>
            <Text style={styles.sourceLink}>
              Original article: marathon.in/home-buying-guide/important-vastu-tips-for-new-house/
            </Text>
          </View>
        </View>
      </ScrollView>
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
  heroSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  tipsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tipCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
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
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    lineHeight: 24,
  },
  tipContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  benefitsSection: {
    marginTop: 40,
  },
  benefitsIntro: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
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
  benefitIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F4F8',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  expertQuote: {
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 24,
    marginTop: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  quoteIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  conclusion: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  conclusionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  conclusionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  sourceSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  sourceLink: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
}); 