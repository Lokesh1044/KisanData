import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import DataModel from '../../models/DataModel';

function LabelWiseDataScreen({ navigation }) {
  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labelCounts, setLabelCounts] = useState([]);

  const label_green = require('../../assets/label-green.png');
  const label_black = require('../../assets/label-black.png');
  const label_red = require('../../assets/label-red.png');

  const loadCallData = async () => {
    try {
      const jsonData = await DataModel.getData();
      setCallData(jsonData);
      aggregateCallCounts(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCallData();
  }, []);

  const aggregateCallCounts = (data) => {
    const userCounts = {};

    data.forEach(log => {
      const label = log.selectedColorLabel;
      const phoneNumber = log.phoneNumber; 
  
      if (label) {
        if (!userCounts[label]) {
          userCounts[label] = new Set();
        }
        userCounts[label].add(phoneNumber);
      }
    });
  
    const formattedData = Object.keys(userCounts).map(label => ({
      label,
      count: userCounts[label].size,
    }));
  
    setLabelCounts(formattedData);
  };

  const renderLabelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.navigateButton}
      onPress={() => navigation.navigate('SelectedLabelScreen', { selectedLabel: item.label })}
    >
      <View style={styles.itemContainer}>
        <View>
          {item.label === 'Red' ? (
            <Text style={styles.itemText}>HOT LEADS</Text>
          ) : item.label === 'Green' ? (
            <Text style={styles.itemText}>COLD LEADS</Text>
          ) : (
            <Text style={styles.itemText}>WARM LEADS</Text>
          )}
          {item.label === 'Red' && <Image source={label_red} style={styles.labelCSS} />}
          {item.label === 'Black' && <Image source={label_black} style={styles.labelCSS} />}
          {item.label === 'Green' && <Image source={label_green} style={styles.labelCSS} />}
        </View>
        <Text style={styles.itemText}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.heading}>Label Wise Data</Text>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : labelCounts.length === 0 ? (
          <Text style={styles.title}>No Label Data Available</Text>
        ) : (
          <FlatList
            data={labelCounts}
            keyExtractor={(item) => item.label}
            renderItem={renderLabelItem}
          />
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  listContainer: {
    height: '80%',
  },
  itemContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
    backgroundColor: "#5271ff",
    marginBottom: 10,
    borderRadius: 10,
    paddingRight: 25
  },
  itemText: {
    fontSize: 18,
    color: 'black',
    fontWeight: "bold"
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '800',
  },
  navigateButton: {
    justifyContent: 'center',
    borderRadius: 5,
  },
  labelCSS: {
    height: 50,
    width: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "black",
    alignSelf: "center"
  },
});

export default LabelWiseDataScreen;
