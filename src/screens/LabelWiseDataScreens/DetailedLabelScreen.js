import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DataModel from '../../models/DataModel';
import { makeDirectCall, sendWhatsAppMessage } from '../../utils/CallAndWhatsAppUtils';

function DetailedLabelScreen({ route }) {
  const { selectedLabel } = route.params;
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState([]);
  const [detailedLogs, setDetailedLogs] = useState([]);

  const loadCallData = async () => {
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
    loadCallData();
  }, []);

  useEffect(() => {
    if (callLogs.length > 0 && selectedLabel) {
      const detailedLogsForLabel = callLogs.map(log => {
        const incomingCalls = log.callHistory.filter(call => call.type === 'INCOMING');

        if (log.selectedColorLabel === selectedLabel) {
          return {
            name: log.name,
            phoneNumber: log.phoneNumber,
            colorLabel: log.selectedColorLabel,
            selectedItemLabel: log.selectedItemLabel,
            incomingCallCount: incomingCalls.length,
            time: log.dataSavedDate
          };
        }
        return null;
      }).filter(item => item !== null);
      detailedLogsForLabel.sort((a, b) => new Date(b.time) - new Date(a.time));
      setDetailedLogs(detailedLogsForLabel);
    }
  }, [selectedLabel, callLogs]);

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : detailedLogs.length === 0 ? (
        <Text style={styles.title}>No Data Available</Text>
      ) : (
        <>
          <View style={styles.header}>
            {selectedLabel === 'Red' ? (
              <Text style={styles.headerText}>HOT LEADS</Text>
            ) : selectedLabel === 'Green' ? (
              <Text style={styles.headerText}>COLD LEADS</Text>
            ) : (
              <Text style={styles.headerText}>WARM LEADS</Text>
            )}
          </View>
          <FlatList
            data={detailedLogs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <View style={styles.nameContainer}>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.logTextBold}>{item.name}</Text>
                    <Text style={styles.logTextBold}>{item.phoneNumber}</Text>
                    <Text style={styles.logText}>Model: {item.selectedItemLabel}</Text>
                    <View style={styles.labelModelContainer}>
                      <Text style={styles.logText}>No.of Calls: </Text>
                      <Text style={styles.logTextCount}>{item.incomingCallCount}</Text>
                    </View>

                  </View>
                  <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => makeDirectCall(item.phoneNumber)}>
                      <Image
                        source={require('../../assets/phone-call-icon.png')}
                        style={styles.callCSS}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sendWhatsAppMessage(item.phoneNumber)}>
                      <Image
                        source={require('../../assets/whatsapp-icon.png')}
                        style={styles.callCSS}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  logItem: {
    padding: 12,
    backgroundColor: '#5271ff',
    marginBottom: 10,
    width: '100%',
    borderRadius: 10,
  },
  logText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  logTextBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  logTextCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'black',
    borderRadius: 3,
    padding: 3,
    marginTop: -3,
  },
  labelsContainer: {
    flexDirection: 'row',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callCSS: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  labelCSS: {
    height: 20,
    width: 30,
    marginTop: 1,
  },
  labelModelContainer: {
    flexDirection: 'row',
  },
  detailsContainer:{
    maxWidth:"70%"
  }
});

export default DetailedLabelScreen;
