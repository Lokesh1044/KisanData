import { PermissionsAndroid, Platform, Linking, Alert } from 'react-native';

export async function requestCallPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                {
                    title: 'Phone Call Permission',
                    message: 'This app needs access to your phone calls to make a direct call.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    } else {
        return true;
    }
}

export async function makeDirectCall(phoneNumber) {
    const hasPermission = await requestCallPermission();
    if (hasPermission) {
        const url = `tel:${phoneNumber}`;
        Linking.openURL(url).catch(console.error);
    }
}

// Function to send a WhatsApp message
export function sendWhatsAppMessage(phoneNumber, message = "Hello Sir/Mam,\nకిసాన్ కృషి ఆగ్రో ఇండస్ట్రీస్ - పవర్ వీడర్స్ డిస్ట్రిబ్యూటర్ విజయవాడ, ఆంధ్ర ప్రదేశం") {
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
}

