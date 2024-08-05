import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Linking, PermissionsAndroid, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DataModel from '../../models/DataModel';
import { makeDirectCall,sendWhatsAppMessage } from '../../utils/CallAndWhatsAppUtils';

const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return { startDate, endDate };
};

const parseDate = (dateString) => {
    return new Date(dateString);
};

function DetailedItemScreen({ route }) {
    const { selectedItemLabel, timeRange } = route.params || {};

    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailedLogs, setDetailedLogs] = useState([]);

    const label_green = require('../../assets/label-green.png');
    const label_black = require('../../assets/label-black.png');
    const label_red = require('../../assets/label-red.png');

    // Load JSON data
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
        if (callLogs.length > 0 && selectedItemLabel && timeRange) {
          const daysRange = parseInt(timeRange, 10);
      
          if (!isNaN(daysRange)) {
            const { startDate, endDate } = getDateRange(daysRange);
      
            console.log(`Filtering from ${startDate} to ${endDate}`);
      
            const detailedLogsForItem = callLogs
              .filter(log => log.selectedItemLabel === selectedItemLabel)
              .map(log => {
                const incomingCallsInRange = log.callHistory.filter(call => {
                  const callDate = parseDate(call.timestamp);
                  return callDate >= startDate && callDate <= endDate && (call.type === 'INCOMING' || call.type === 'MISSED' || call.type === 'OUTGOING');
                });
      
                if (incomingCallsInRange.length > 0) {
                  return {
                    name: log.name,
                    phoneNumber: log.phoneNumber,
                    colorLabel: log.selectedColorLabel,
                    itemLabel: log.selectedItemLabel,
                    incomingCallCount: incomingCallsInRange.length,
                    time:log.dataSavedDate
                  };
                } else {
                  const dataSavedDate = new Date(log.dataSavedDate);
                  if (dataSavedDate >= startDate && dataSavedDate <= endDate) {
                    return {
                      name: log.name,
                      phoneNumber: log.phoneNumber,
                      colorLabel: log.selectedColorLabel,
                      itemLabel: log.selectedItemLabel,
                      incomingCallCount: 0,  // No call history but within dataSavedDate range
                      dataSavedDate: dataSavedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
                      time:log.dataSavedDate
                    };
                  }
                }
                return null;
              })
              .filter(item => item !== null);
              detailedLogsForItem.sort((a, b) => new Date(b.time) - new Date(a.time));
            setDetailedLogs(detailedLogsForItem);
          } else {
            setDetailedLogs([]);
          }
        }
      }, [selectedItemLabel, timeRange, callLogs]);
      

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
                    <Text style={styles.title}>Records on Product: {selectedItemLabel}</Text>
                    <FlatList
                        data={detailedLogs}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.logItem}>
                                <View style={styles.nameContainer}>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.logTextBold}>{item.name}</Text>
                                        <Text style={styles.logTextBold}>{item.phoneNumber}</Text>
                                        <View style={styles.labelsContainer}>
                                            <Text style={styles.logText}>Label:</Text>
                                            {item.colorLabel === 'Red' && <Image source={label_red} style={styles.labelCSS} />}
                                            {item.colorLabel === 'Black' && <Image source={label_black} style={styles.labelCSS} />}
                                            {item.colorLabel === 'Green' && <Image source={label_green} style={styles.labelCSS} />}
                                        </View>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "black"
    },
    logItem: {
        padding: 10,
        backgroundColor: "#5271ff",
        marginBottom: 10,
        width: "100%",
        borderRadius: 10
    },
    logText: {
        fontSize: 16,
        fontWeight: "700",
        color: "black",
    },
    logTextBold: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    logTextCount: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        backgroundColor: "black",
        borderRadius: 3,
        padding: 3,
        marginTop: -3,
    },
    labelsContainer: {
        flexDirection: "row"
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    callCSS: {
        height: 30,
        width: 30,
        marginRight: 10
    },
    imageContainer: {
        flexDirection: "row"
    },
    labelCSS: {
        height: 20,
        width: 30,
        marginRight: 5,
        marginTop:3,
        marginLeft:3
    },
    labelModelContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    detailsContainer:{
        maxWidth:"70%"
      }
});

export default DetailedItemScreen;
