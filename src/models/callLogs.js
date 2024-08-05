import { PermissionsAndroid, Platform } from 'react-native';
import CallLogs from 'react-native-call-log';
async function requestCallLogPermission() {
    try {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
                {
                    title: 'Call Log Permission',
                    message: 'This app needs access to your call log to display recent calls.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    } catch (err) {
        console.warn(err);
        return false;
    }
}

export async function getLimitedCallLogs() {
    const permissionGranted = await requestCallLogPermission();
    if (permissionGranted) {
        try {
            const logs = await CallLogs.load(50);
            return logs;
        } catch (error) {
            console.error(error);
            return [];
        }
    } else {
        console.log('Call Log permission denied');
        return [];
    }
}

// Function to fetch call logs
export async function getCallLogs() {
    const permissionGranted = await requestCallLogPermission();
    if (permissionGranted) {
        try {
            const logs = await CallLogs.loadAll();
            return logs;
        } catch (error) {
            console.error(error);
            return [];
        }
    } else {
        console.log('Call Log permission denied');
        return [];
    }
}
