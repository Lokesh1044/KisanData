import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DataModel from '../../models/DataModel';

const timeRanges = [
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 60 Days', value: 60 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Last 180 Days', value: 180 },
  { label: 'Last 365 Days', value: 365 },
];

function ProductWiseDataScreen({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRange, setSelectedRange] = useState(30);

  const loadJSONData = async () => {
    try {
      const jsonData = await DataModel.getData();
      setProductData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJSONData();
  }, []);

  useEffect(() => {
    if (productData.length > 0) {
      filterDataByRange(selectedRange);
    }
  }, [productData, selectedRange]);

  const filterDataByRange = (range) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - range);
  
    const aggregatedItems = {};
  
    productData.forEach(log => {
      const productName = log.selectedItemLabel; 
      const phoneNumber = log.phoneNumber;
      let hasCallHistory = false;
  
      const withinRange = log.callHistory.some(call => {
        const callDate = new Date(call.timestamp);
        if (callDate >= startDate && callDate <= now) {
          hasCallHistory = true;
          return true;
        }
        return false;
      });
  
      if (withinRange && productName) {
        if (!aggregatedItems[productName]) {
          aggregatedItems[productName] = new Set();
        }
        aggregatedItems[productName].add(phoneNumber);
      }
  
      if (!hasCallHistory && productName) {
        const dataSavedDate = new Date(log.dataSavedDate);
        if (dataSavedDate >= startDate && dataSavedDate <= now) {
          if (!aggregatedItems[productName]) {
            aggregatedItems[productName] = new Set();
          }
          aggregatedItems[productName].add(phoneNumber);
        }
      }
    });
  
    const formattedData = Object.keys(aggregatedItems).map(productName => ({
      productName,
      count: aggregatedItems[productName].size,
    }));
  
    setFilteredData(formattedData);
  };
  


  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.headingCSS}>PRODUCT WISE DATA</Text>

      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedRange(value)}
          items={timeRanges}
          placeholder={{}}
          value={selectedRange}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.listContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Product</Text>
          <Text style={styles.headerText}>No.of Users</Text>
          <Text style={styles.headerText}>Action</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : filteredData.length === 0 ? (
          <Text style={styles.title}>No Product Data Available</Text>
        ) : (
          <>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.productName}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <View style={styles.textContainer}>
                    <Text style={styles.itemText}>{item.productName}</Text>
                    <Text style={styles.itemTextCount}>{item.count}</Text>
                  </View>
                  <TouchableOpacity style={styles.navigateButton} onPress={() => navigation.navigate('SelectedProductScreen', { selectedItemLabel: item.productName, timeRange: selectedRange })}>
                    <Text style={styles.buttonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  headingCSS: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  pickerContainer: {
    marginBottom: 5,
    backgroundColor: "black",
    borderRadius: 3
  },
  itemContainer: {
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 7,
    color: 'black',
    fontWeight: '800',
    maxWidth: "50%",
    justifyContent: "flex-start"

  },
  itemTextCount: {
    fontSize: 16,
    marginBottom: 7,
    color: 'black',
    fontWeight: '800',
    maxWidth: "50%",
    alignSelf: "center"
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '800',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 5,
    backgroundColor: 'black',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 5,
  },
  navigateButton: {
    backgroundColor: 'black',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    maxWidth: "50%",
    marginTop: -5,
    height: 40,
    alignSelf: "center"
  },
  listContainer: {
    height: '80%',
  },
  textContainer: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "black",
    alignSelf:"center"
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    color: 'white',
    paddingRight: 30,
    marginLeft: 10
  },
  iconContainer: {
    top: 10,
    right: 12,
    color: "white"
  },
});

export default ProductWiseDataScreen;
