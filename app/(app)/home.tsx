import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MENU_ITEMS = [
  { id: 1, title: 'Plans', icon: 'document-text-outline' as const },
  { id: 2, title: 'Interior Design', icon: 'home-outline' as const },
  { id: 3, title: 'Cost Estimation', icon: 'calculator-outline' as const },
  { id: 4, title: 'Budget Tracking', icon: 'wallet-outline' as const },
  { id: 5, title: 'Progress Tracking', icon: 'bar-chart-outline' as const },
  { id: 6, title: 'Material catalog', icon: 'cube-outline' as const },
  { id: 7, title: 'Cost Catalog', icon: 'cash-outline' as const },
] as const;

type MenuItemProps = {
  title: string;
  icon: typeof MENU_ITEMS[number]['icon'];
};

export default function HomeScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/screens/SignInScreen');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const MenuItem = ({ title, icon }: MenuItemProps) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => {
        console.log(`MenuItem pressed: ${title}`);
        try {
          if (title === 'Plans') {
            console.log('Navigating to Plans menu screen');
            router.push('/(app)/plans-menu');
          } else if (title === 'Interior Design') {
            console.log('Navigating to Interior Design screen');
            router.push('/(app)/interior-design');
          } else if (title === 'Cost Estimation') {
            console.log('Navigating to Cost Estimation screen');
            router.push('/(app)/cost-estimation');
          } else if (title === 'Budget Tracking') {
            console.log('Navigating to Budget Tracking screen');
            router.push('/(app)/budget-tracking');
          } else if (title === 'Progress Tracking') {
            console.log('Navigating to Progress Tracking screen');
            router.push('/(app)/progress-tracking');
          } else if (title === 'Material catalog') {
            console.log('Navigating to Material catalog screen');
            router.push('/(app)/material-catalog');
          } else if (title === 'Cost Catalog') {
            console.log('Navigating to Cost Catalog screen');
            router.push('/(app)/cost-catalog');
          }
        } catch (error) {
          console.error(`Error navigating to ${title}:`, error);
        }
      }}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={icon} size={24} color="#000" style={styles.menuIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#000" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ConneX</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <MenuItem key={item.id} title={item.title} icon={item.icon} />
        ))}
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity 
              style={styles.menuDropdownItem}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#000" />
              <Text style={styles.menuDropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const HEADER_MARGIN_TOP = 40; // Margin top for header
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.08; // Reduced from 0.12 to 0.08 to compensate for margin top
const MENU_CONTAINER_HEIGHT = SCREEN_HEIGHT - (HEADER_HEIGHT + HEADER_MARGIN_TOP); // Adjusted height calculation
const ITEM_GAP = 12;
const TOTAL_GAP_HEIGHT = ITEM_GAP * 6;
const MENU_ITEM_HEIGHT = (MENU_CONTAINER_HEIGHT - 40 - TOTAL_GAP_HEIGHT) / 7;

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
    marginTop: HEADER_MARGIN_TOP,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  menuContainer: {
    height: MENU_CONTAINER_HEIGHT,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: ITEM_GAP,
  },
  menuItem: {
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    height: MENU_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuDropdownText: {
    fontSize: 16,
    color: '#000',
  },
  card: {
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    height: MENU_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
}); 