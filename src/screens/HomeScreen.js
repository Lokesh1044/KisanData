import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CallDetectorManager from 'react-native-call-detection';
import RNFS from 'react-native-fs';
import { getCallLogs } from '../models/callLogs';
import PopUpForm from './PopUpForm';

function HomeScreen() {
  const navigation = useNavigation();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [detectedNumber, setDetectedNumber] = useState('');

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          ]);
        } catch (error) {
          console.error("Failed to request permissions: ", error);
        }
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {

    const callDetector = new CallDetectorManager(
      async (event, number) => {
        console.log("event:" + event)
        console.log("number:" + number)
        if (
          event === 'Incoming' ||
          event === 'Disconnected' ||
          event === 'Missed' ||
          event === 'Idle' ||
          event === 'Ringing' ||
          event === 'Ended' ||
          event === 'Rejected' ||
          event === 'Blocked' ||
          event === 'Voicemail') {
          if (number) {
            setDetectedNumber(number);
            setPopupVisible(true);
          }
          await updateCallHistory();
        }
        else if (event === 'Offhook') {
          if (number) {
            setDetectedNumber(number);
            setPopupVisible(true);
          }
          await updateCallHistory();
        }
      },
      true,
      () => { },
      {
        title: 'Phone State Permission',
        message: 'This app needs access to your phone state to detect incoming calls.',
      }
    );
    return () => {
      callDetector && callDetector.dispose();
    };
  }, []);

  useEffect(() => {
    const intervalTime = 10000;
    const interval = setInterval(async () => {
      await updateCallHistory();
      console.log("intervel" + interval)
    }, intervalTime);
    return () => clearInterval(interval);
  }, []);



  const updateCallHistory = async () => {
    const dirPath = `${RNFS.DownloadDirectoryPath}/testDirectory`;
    const filePath = `${dirPath}/callData.json`;

    try {
      const jsonData = await RNFS.readFile(filePath, 'utf8');
      const callData = JSON.parse(jsonData);
      const callLogs = await getCallLogs();

      callData.forEach(entry => {
        const { phoneNumber } = entry;
        const existingHistory = entry.callHistory || [];

        const newLogs = callLogs.filter(log =>
          log.phoneNumber === phoneNumber &&
          (log.type === 'INCOMING' || log.type === 'MISSED' || log.type === 'OUTGOING')
        );

        const updatedHistory = [
          ...existingHistory,
          ...newLogs.map(log => ({
            timestamp: log.dateTime,
            duration: log.duration,
            type: log.type,
            date: new Date(log.dateTime).toLocaleDateString(),
          }))
        ];

        // Ensure there are no duplicates based on timestamp
        entry.callHistory = Array.from(new Set(updatedHistory.map(log => log.timestamp)))
          .map(timestamp => updatedHistory.find(log => log.timestamp === timestamp));

        entry.count = entry.callHistory.length;
      });

      await RNFS.writeFile(filePath, JSON.stringify(callData), 'utf8');
      console.log("Successfully updated call history.");
    } catch (error) {
      console.error("Failed to update call history: ", error);
    }
  };





  const handleImagePress = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setDetectedNumber('');
  };

  const { width } = Dimensions.get('window');
  const imageSize = (width - 40) / 2.3;

  const data = [
    { id: '1', name: 'DATE WISE DATA', source: require('../assets/datecal.png'), screen: 'DateWiseData' },
    { id: '2', name: 'PRODUCT WISE DATA', source: require('../assets/product-icon.png'), screen: 'ProductWiseData' },
    { id: '3', name: 'LABEL WISE DATA', source: require('../assets/label-icon.jpeg'), screen: 'LabelWiseData' },
    { id: '4', name: 'DOWNLOADS', source: require('../assets/downloads.png'), screen: 'Downloads' },
    { id: '5', name: 'SETTINGS', source: require('../assets/settings.png'), screen: 'Settings' },
    { id: '6', name: 'ADD MANUALLY', source: require('../assets/add_icon.png'), screen: 'AddManually' },
  ];

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.row}>
          {data.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemContainer}
              onPress={() => handleImagePress(item.screen)}
            >
              <Image
                source={item.source}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="contain"
              />
              <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {data.slice(2, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemContainer}
              onPress={() => handleImagePress(item.screen)}
            >
              <Image
                source={item.source}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="contain"
              />
              <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {data.slice(4, 6).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemContainer}
              onPress={() => handleImagePress(item.screen)}
            >
              <Image
                source={item.source}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="contain"
              />
              <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <PopUpForm isVisible={isPopupVisible} onClose={handleClosePopup} detectedNumber={detectedNumber} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0, // Adjust as needed
    paddingHorizontal: 5, // Adjust as needed
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    marginTop: 5,
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
