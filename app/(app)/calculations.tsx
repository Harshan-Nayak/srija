import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CostBreakdown {
  name: string;
  percentage: number;
  color: string;
}

export default function CalculationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { constructionType, area, location } = params;

  // Calculate total cost based on the formula
  const areaInSqFt = Number(area);
  const placeCostPerSqFt = 100; // Example rate, adjust as needed
  const constructionCostPerSqFt = 150;
  const interiorCostPerSqFt = 80;

  const totalEstimatedCost = 
    (placeCostPerSqFt * areaInSqFt) + 
    (constructionCostPerSqFt * areaInSqFt) + 
    (interiorCostPerSqFt * areaInSqFt);

  // Cost breakdown data
  const costBreakdown: CostBreakdown[] = [
    { name: 'Design', percentage: 4, color: '#4CAF50' },
    { name: 'Walls and Stucco', percentage: 11.7, color: '#8BC34A' },
    { name: 'Slab', percentage: 8.6, color: '#FFEB3B' },
    { name: 'Plumbing', percentage: 4, color: '#03A9F4' },
    { name: 'Electrical', percentage: 4, color: '#00BCD4' },
    { name: 'Wall Framing', percentage: 22.6, color: '#9C27B0' },
    { name: 'Roof', percentage: 4, color: '#E91E63' },
    { name: 'Bathroom', percentage: 8, color: '#F44336' },
    { name: 'Kitchen', percentage: 8, color: '#FF5722' },
    { name: 'Demolition', percentage: 5.8, color: '#795548' },
    { name: 'Earthworks', percentage: 6.7, color: '#FF9800' },
    { name: 'Painting', percentage: 9, color: '#FFC107' },
    { name: 'Floor Coverings', percentage: 4, color: '#607D8B' },
  ];

  // Construction cost breakdown table data
  const tableData = [
    { id: 1, material: 'Cement', percentage: 10, amount: Math.round(totalEstimatedCost * 0.10) },
    { id: 2, material: 'Steel', percentage: 15, amount: Math.round(totalEstimatedCost * 0.15) },
    { id: 3, material: 'Sand', percentage: 8, amount: Math.round(totalEstimatedCost * 0.08) },
    { id: 4, material: 'Gravel', percentage: 4, amount: Math.round(totalEstimatedCost * 0.04) },
    { 
      id: 5, 
      material: 'Finishing', 
      subItems: ['Color', 'Tiles', 'Bricks', 'Fittings', 'Windows'], 
      percentage: 9.5, 
      amount: Math.round(totalEstimatedCost * 0.095) 
    },
    { 
      id: 6, 
      material: 'Others', 
      subItems: ['Sanitary', 'Plumbing', 'Electrical'], 
      percentage: 13.5, 
      amount: Math.round(totalEstimatedCost * 0.135) 
    },
  ];

  const materialCost = Math.round(totalEstimatedCost * 0.60);
  const labourCost = Math.round(totalEstimatedCost * 0.30);
  const engineersFee = Math.round(totalEstimatedCost * 0.10);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculations</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.chartContainer}>
          <Text style={styles.basedOnText}>Based on ₹{totalEstimatedCost.toLocaleString()}</Text>
          <View style={styles.legendContainer}>
            {costBreakdown.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name} ({item.percentage}%)</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>House Construction Cost</Text>
          </View>
          
          <View style={styles.columnHeaders}>
            <Text style={styles.columnHeader}>S. No.</Text>
            <Text style={[styles.columnHeader, styles.materialHeader]}>(Material)</Text>
            <Text style={styles.columnHeader}>%</Text>
            <Text style={styles.columnHeader}>Amount</Text>
          </View>

          {tableData.map((row) => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.serialCell}>{row.id}</Text>
              <View style={[styles.tableCell, styles.materialCell]}>
                <Text style={styles.materialText}>{row.material}</Text>
                {row.subItems?.map((item) => (
                  <Text key={item} style={styles.subItem}>• {item}</Text>
                ))}
              </View>
              <Text style={styles.percentageCell}>{row.percentage}</Text>
              <Text style={styles.amountCell}>{row.amount.toLocaleString()}</Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.totalCell, { flex: 3 }]}>Material Cost</Text>
            <Text style={styles.totalCell}>60</Text>
            <Text style={[styles.totalCell, { borderRightWidth: 0 }]}>{materialCost.toLocaleString()} ₹</Text>
          </View>
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.totalCell, { flex: 3 }]}>Labour Cost</Text>
            <Text style={styles.totalCell}>30</Text>
            <Text style={[styles.totalCell, { borderRightWidth: 0 }]}>{labourCost.toLocaleString()} ₹</Text>
          </View>
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.totalCell, { flex: 3 }]}>Engineers Fee</Text>
            <Text style={styles.totalCell}>10</Text>
            <Text style={[styles.totalCell, { borderRightWidth: 0 }]}>{engineersFee.toLocaleString()} ₹</Text>
          </View>
          <View style={[styles.tableRow, styles.grandTotalRow]}>
            <Text style={[styles.grandTotalCell, { flex: 3, textAlign: 'left', paddingLeft: 8 }]}>Total Construction Cost</Text>
            <Text style={[styles.grandTotalCell, { flex: 2 }]}>{totalEstimatedCost.toLocaleString()} ₹</Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  basedOnText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#FFEB3B',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeaderText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  columnHeaders: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  columnHeader: {
    padding: 8,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  materialHeader: {
    flex: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  serialCell: {
    padding: 8,
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  materialCell: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  materialText: {
    fontWeight: '500',
  },
  percentageCell: {
    padding: 8,
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  amountCell: {
    padding: 8,
    flex: 1,
    textAlign: 'right',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  subItem: {
    marginLeft: 10,
    color: '#666',
    marginTop: 2,
  },
  totalRow: {
    backgroundColor: '#FFE0B2',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  totalCell: {
    padding: 8,
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    fontWeight: '500',
  },
  grandTotalRow: {
    backgroundColor: '#FFEB3B',
    borderBottomWidth: 0,
  },
  grandTotalCell: {
    padding: 8,
    fontWeight: '600',
  },
}); 