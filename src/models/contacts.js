import { PermissionsAndroid, Platform } from 'react-native';
import Contacts from 'react-native-contacts';

// Function to request contacts permission
async function requestContactsPermission() {
    try {
        if (Platform.OS === 'android') {
            const readGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    title: 'Contacts Permission',
                    message: 'This app needs access to your contacts to display contact names.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            const writeGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
                {
                    title: 'Contacts Permission',
                    message: 'This app needs access to write contacts.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            return readGranted === PermissionsAndroid.RESULTS.GRANTED && writeGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // For non-Android platforms
    } catch (err) {
        console.warn(err);
        return false;
    }
}

// Function to fetch contacts
export async function getContacts() {
    const permissionGranted = await requestContactsPermission();
    if (permissionGranted) {
        try {
            const contacts = await Contacts.getAll();
            return contacts;
        } catch (error) {
            console.error(error);
            return [];
        }
    } else {
        console.log('Contacts permission denied');
        return [];
    }
}


