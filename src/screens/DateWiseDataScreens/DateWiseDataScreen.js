import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from 'react-native';
import DatePicker from 'react-native-date-picker';
import DataModel from '../../models/DataModel';

function DateWiseDataScreen({ navigation }) {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredDates, setFilteredDates] = useState([]);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  const loadJSONData = async () => {
    try {
      const jsonData = await DataModel.getData();
      setCallLogs(jsonData);
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
    if (callLogs.length > 0) {
      const aggregatedDates = {};
      const today = new Date();
      const isStartDateToday = startDate.toDateString() === today.toDateString();
  
      const adjustedStartDate = isStartDateToday ? new Date(today.setHours(0, 0, 0, 0)) : new Date(startDate);
      const adjustedEndDate = isStartDateToday ? new Date(today.setHours(23, 59, 59, 999)) : new Date(endDate);
  
      if (adjustedStartDate.getTime() === adjustedEndDate.getTime()) {
        adjustedEndDate.setHours(23, 59, 59, 999);
      }
  
      callLogs.forEach(log => { 
        const phoneNumber = log.phoneNumber;
        let hasCallHistory = false;
  
        log.callHistory.forEach(call => {
          const callDate = new Date(call.timestamp);
          if (callDate >= adjustedStartDate && callDate <= adjustedEndDate && (call.type === 'INCOMING' || call.type === 'MISSED' || call.type === 'OUTGOING')) {
            const callDateString = callDate.toISOString().split('T')[0];
  
            if (!aggregatedDates[callDateString]) {
              aggregatedDates[callDateString] = new Set();
            }
  
            aggregatedDates[callDateString].add(phoneNumber);
            hasCallHistory = true;
          }

        });
        if (!hasCallHistory) {
          console.log(log.dataSavedDate)
          const dataSavedDate = new Date(log.dataSavedDate);
          if (dataSavedDate >= adjustedStartDate && dataSavedDate <= adjustedEndDate && log.callHistory.length === 0) {
            const dataSavedDateString = dataSavedDate.toISOString().split('T')[0];
  
            if (!aggregatedDates[dataSavedDateString]) {
              aggregatedDates[dataSavedDateString] = new Set();
            }
  
            aggregatedDates[dataSavedDateString].add(phoneNumber);
          }
        }
      });
      console.log(aggregatedDates)  
      const formattedDates = Object.keys(aggregatedDates).map(date => ({
        date,
        count: aggregatedDates[date].size,
      }));      
      formattedDates.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFilteredDates(formattedDates);
    }
  }, [startDate, endDate, callLogs]);
  

  const handleDateChange = (date, type) => {
    if (type === 'start') {
      setStartDate(date);
      setOpenStartDate(false);
    } else {
      setEndDate(date);
      setOpenEndDate(false);
    }
  };

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.headingCSS}>DATE WISE DATA</Text>
      <View style={styles.calendarPickerContainer}>
        <View style={styles.dateRow}>
          <Text style={styles.label}>From Date:</Text>
          <View style={styles.textImgContainer}>
            <TextInput
              style={styles.dateTextInput}
              value={startDate.toLocaleDateString()}
              onFocus={() => setOpenStartDate(true)}
              showSoftInputOnFocus={false}
            />
            <TouchableOpacity onPress={() => setOpenStartDate(true)}>
              <Image
                source={require('../../assets/calender-remind.png')}
                style={styles.calendarCSS}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openStartDate}
              date={startDate}
              onConfirm={(date) => handleDateChange(date, 'start')}
              onCancel={() => setOpenStartDate(false)}
              mode="date"
            />
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.label}>To Date:</Text>
          <View style={styles.textImgContainer}>
            <TextInput
              style={styles.dateTextInput}
              value={endDate.toLocaleDateString()}
              onFocus={() => setOpenEndDate(true)}
              showSoftInputOnFocus={false}
            />
            <TouchableOpacity onPress={() => setOpenEndDate(true)}>
              <Image
                source={require('../../assets/calender-remind.png')}
                style={styles.calendarCSS}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openEndDate}
              date={endDate}
              onConfirm={(date) => handleDateChange(date, 'end')}
              onCancel={() => setOpenEndDate(false)}
              mode="date"
            />
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : filteredDates.length === 0 ? (
          <Text style={styles.title}>No Data Available</Text>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Date</Text>
              <Text style={styles.headerText}>No.of Users</Text>
              <Text style={styles.headerText}>Action</Text>
            </View>
            <FlatList
              data={filteredDates}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View style={styles.dateItem}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <Text style={styles.dateText}>{item.count}</Text>
                  <TouchableOpacity style={styles.navigateButton} onPress={() => navigation.navigate('SelectedDateScreen', { selectedDate: item.date })}>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "black"
  },
  dateItem: {
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "center",
    marginBottom: 4
  },
  dateText: {
    fontSize: 16,
    marginBottom: 7,
    color: "black",
    fontWeight: "800",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "800",
  },
  calendarPickerContainer: {
    marginBottom: 10,
    flexDirection: "row",
    height: "10%"
  },
  dateRow: {
    flexDirection: "column",
    alignItems: 'center',
    marginBottom: 10,
    width: "50%",
    marginRight: 5,
  },
  label: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: "flex-start",
    fontStyle: "normal",
    marginBottom: 2
  },
  dateTextInput: {
    borderBottomWidth: 1,
    fontSize: 17,
    padding: 5,
    backgroundColor: 'black',
    flex: 1,
    textAlign: "center",
    color: "white"
  },
  calendarCSS: {
    width: 30,
    height: 30,
    marginLeft: 5,
  },
  textImgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 5,
    backgroundColor: "black"
  },
  headerText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
  },
  navigateButton: {
    backgroundColor: "black",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5
  },
  listContainer: {
    height: "80%"
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "black",
    alignSelf:"center"
  },
});

export default DateWiseDataScreen;
