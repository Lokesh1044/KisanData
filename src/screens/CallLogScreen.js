import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getLimitedCallLogs } from '../models/callLogs';
import { getContacts } from '../models/contacts'; 
import LinearGradient from 'react-native-linear-gradient';
import PopUpForm from './PopUpForm';
import DataModel from '../models/DataModel';

const CallLogScreen = () => {
    const [callLogs, setCallLogs] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPopup, setLoadingPopup] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState('');

    const incomingCallImage = require('../assets/incomingcall-icon.png');
    const outgoingCallImage = require('../assets/outgoingcall-icon.png');
    const missedCallImage = require('../assets/missedcall-icon.png');

    const contactNameCache = useMemo(() => new Map(), [contacts]);

    const findContactName = useCallback((phoneNumber) => {
        if (contactNameCache.has(phoneNumber)) {
            return contactNameCache.get(phoneNumber);
        }
        const contact = contacts.find(contact =>
            contact.phoneNumbers.some(phone => phone.number.replace(/\s/g, '') === phoneNumber.replace(/\s/g, ''))
        );
        const name = contact ? contact.displayName : 'Unknown';
        contactNameCache.set(phoneNumber, name);
        return name;
    }, [contacts, contactNameCache]);

    const isToday = useCallback((someDate) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    }, []);

    const formatDate = useCallback((date) => {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }, []);

    const formatTime = useCallback((date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const formatDuration = useCallback((durationInSeconds) => {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes} min ${seconds} sec`;
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const logs = await getLimitedCallLogs();
            const contacts = await getContacts();
            setCallLogs(logs);
            setContacts(contacts);
            setLoading(false);
        }

        fetchData();
    }, []);

    const handleContactPress = async (phoneNumber) => {
        setLoadingPopup(true);
        const phoneNumberExists = await DataModel.phoneNumberExists(phoneNumber);

        if (phoneNumberExists && findContactName(phoneNumber) !== 'Unknown') {
            Alert.alert(
                'Edit Details',
                'This contact is already saved. Do you want to edit the details?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setLoadingPopup(false)
                    },
                    {
                        text: 'Edit',
                        onPress: () => {
                            setSelectedContact(phoneNumber);
                            setPopupVisible(true);
                            setLoadingPopup(false);
                        }
                    }
                ],
                { cancelable: true }
            );
        } else {
            setSelectedContact(phoneNumber);
            setPopupVisible(true);
            setLoadingPopup(false);
        }
    };

    const handleClosePopup = async () => {
        setPopupVisible(false);
        setLoading(true);
        const logs = await getLimitedCallLogs();
        const contacts = await getContacts();
        setCallLogs(logs);
        setContacts(contacts);
        setLoading(false);
    };

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity onPress={() => handleContactPress(item.phoneNumber)}>
            <View style={styles.callLogItem}>
                <View style={styles.nameContainer}>
                    <Text style={styles.contactName}>{`${findContactName(item.phoneNumber)}`}</Text>
                    <Text style={styles.callLogText}>
                        {isToday(new Date(item.dateTime))
                            ? `Today, ${formatTime(new Date(item.dateTime))}`
                            : `${formatDate(new Date(item.dateTime))}, ${formatTime(new Date(item.dateTime))}`}
                    </Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.callLogText}>{`${item.phoneNumber}`}</Text>
                    <View style={styles.callTypeContainer}>
                        <Text style={styles.callLogText}>{formatDuration(item.duration)}</Text>
                        {item.type === 'INCOMING' && <Image source={incomingCallImage} style={styles.callTypeImage} />}
                        {item.type === 'OUTGOING' && <Image source={outgoingCallImage} style={styles.callTypeImage} />}
                        {item.type === 'MISSED' && <Image source={missedCallImage} style={styles.missedcallTypeImage} />}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    ), [findContactName, formatDate, formatDuration, formatTime, handleContactPress, isToday]);

    return (
        <LinearGradient
            colors={['#26c4d0', '#8bd099', '#e4da67']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View>                
                <Text style={styles.headingCSS}>Recent Call Logs</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#5271ff" />
                ) : (
                    <FlatList
                        data={callLogs}
                        keyExtractor={(item) => item.timestamp.toString()}
                        renderItem={renderItem}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={21}
                        removeClippedSubviews={true}
                        style={{marginBottom:40}}
                    />
                )}
                {loadingPopup && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="black" style={styles.loaderIcon}/>
                    </View>
                )}
                <PopUpForm
                    isVisible={isPopupVisible}
                    onClose={handleClosePopup}
                    detectedNumber={selectedContact}
                />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    headingCSS: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 15,
    },
    callLogItem: {
        backgroundColor: '#5271ff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    contactName: {
        fontSize: 20,
        color: 'black',
        fontWeight: "bold",
        maxWidth:"55%"
    },
    callLogText: {
        fontSize: 16,
        color: 'black',
        fontWeight: "bold"
    },
    callLogDateTime: {
        fontSize: 16,
        color: 'black',
        fontWeight: "bold",
        maxWidth:"45%"
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    callTypeImage: {
        width: 20,
        height: 20,
        marginRight: 5,
        marginLeft: 5
    },
    missedcallTypeImage: {
        width: 25,
        height: 25,
        marginRight: 5,
        marginLeft: 5
    },
    callTypeContainer: {
        flexDirection: "row"
    },
    loaderContainer: {
        flex:1,
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loaderIcon:{
        backgroundColor:"white",
        borderRadius:50
    }
});

export default CallLogScreen;
