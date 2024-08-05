import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DataModel from '../models/DataModel';
import moment from 'moment';
import { makeDirectCall, sendWhatsAppMessage } from '../utils/CallAndWhatsAppUtils';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);

  const label_green = require('../assets/label-green.png');
  const label_black = require('../assets/label-black.png');
  const label_red = require('../assets/label-red.png');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await DataModel.getData();

        const filteredNotifications = data.filter(item => {
          const today = moment().format('MM/DD/YY');
          const remindDate = moment(item.remindDate, 'MM/DD/YY').format('MM/DD/YY');
          return remindDate === today;
        });

        setNotifications(filteredNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item: notification }) => (
    // <View style={styles.logItemContainer} key={notification.id}>
    <View key={notification.id} style={styles.logItem}>
      <View style={styles.nameContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.logTextBold}>{notification.name}</Text>
          <Text style={styles.logTextBold}>{notification.phoneNumber}</Text>
          <View style={styles.labelsContainer}>
            <Text style={styles.logText}>Label:</Text>
            {notification.selectedColorLabel === 'Red' && <Image source={label_red} style={styles.labelCSS} />}
            {notification.selectedColorLabel === 'Black' && <Image source={label_black} style={styles.labelCSS} />}
            {notification.selectedColorLabel === 'Green' && <Image source={label_green} style={styles.labelCSS} />}
          </View>
          <View style={styles.labelModelContainer}>
            <Text style={styles.logText}>Model: {notification.selectedItemLabel}</Text>
          </View>
          {notification.note !== '' &&
            <Text style={styles.logTextBold}>Note:- {notification.note}</Text>}
        </View>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => makeDirectCall(notification.phoneNumber)}>
            <Image
              source={require('../assets/phone-call-icon.png')}
              style={styles.callCSS}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sendWhatsAppMessage(notification.phoneNumber)}>
            <Image
              source={require('../assets/whatsapp-icon.png')}
              style={styles.callCSS}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    // </View>
  );

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {notifications.length > 0 && (
        <Text style={styles.notificationsText}>Reminders for {moment().format('DD/MM/YY')}</Text>
      )}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.phoneNumber.toString()}
        ListEmptyComponent={<Text style={styles.noNotificationsText}>No Reminders scheduled</Text>}
        contentContainerStyle={styles.notificationsContainer}
      />

      {/* {notifications.length === 0 && (
          <Text style={styles.noNotificationsText}>No reminders for {moment().format('DD/MM/YY')}</Text>
        )} */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  textContainer: {
    maxWidth: "70%"
  },
  noNotificationsText: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  textCSS: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black"
  },
  subTextCSS: {
    fontSize: 16,
    fontWeight: "800",
    color: "black"
  },
  notificationsText: {
    fontSize: 24,
    color: 'black',
    marginBottom: 10,
    fontWeight: "bold"
  },
  logItem: {
    padding: 10,
    backgroundColor: "#5271ff",
    marginBottom: 10,
    width: "100%",
    borderRadius: 10,
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
    maxWidth: "100%",
    // backgroundColor:"blue"
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
    marginTop: 1
  },
  labelModelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notificationsContainer: {
    marginTop: 5,
    marginBottom: 5
  },
});

export default NotificationsScreen;
