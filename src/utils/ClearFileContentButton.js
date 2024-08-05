import React from 'react';
import { Button, View, Alert, TouchableOpacity, StyleSheet, Text } from 'react-native';
import DataModel from '../models/DataModel';

const handleClearCallDataFileContent = async () => {
    const success = await DataModel.clearCallDataFileContent();
    if (success) {
        Alert.alert('Success', 'Call File content cleared successfully');
    } else {
        Alert.alert('Error', 'Failed to clear call file content');
    }
};

const handleClearItemDataFileContent = async () => {
    const success = await DataModel.clearItemDataFileContent();
    if (success) {
        Alert.alert('Success', 'Item File content cleared successfully');
    } else {
        Alert.alert('Error', 'Failed to clear item file content');
    }
};


const handleDeleteAndCreateDataStructure = async () => {
    const success = await DataModel.deleteDirectory();
    if (success) {
        Alert.alert('Success', 'Directory and file deleted successfully.');
        DataModel.createInitialDataStructure();
    } else {
        Alert.alert('Error', 'Failed to delete directory.');
    }
};

const confirmClearCallDataFileContent = () => {
    Alert.alert(
        'Confirm Clear',
        'Are you sure you want to clear the file content?',
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                style: 'destructive',
                text: 'CLEAR',
                onPress: handleClearCallDataFileContent,
            },
        ],
        { cancelable: false }
    );
};


const confirmClearItemDataFileContent = () => {
    Alert.alert(
        'Confirm Clear',
        'Are you sure you want to clear the file content?',
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'CLEAR',
                onPress: handleClearItemDataFileContent,
            },
        ],
        { cancelable: false }
    );
};


const handleDeleteAndRecreate = () => {
    Alert.alert(
        'Confirm Clear',
        'Are you sure you want to Delete and Recreated the Data Structure?',
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'DELETE',
                onPress: handleDeleteAndCreateDataStructure,
            },
        ],
        { cancelable: false }
    );
};

const ClearFileContentButton = () => {

    return (
        <View style={styles.parentContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Clear Call Data: </Text>
                <Text style={styles.noteMsg}>
                    "By clicking clear, all data in your Call Data file will be erased. Proceed?"</Text>
            </View>
            <TouchableOpacity onPress={confirmClearCallDataFileContent} style={styles.buttonCSS}>
                <Text style={styles.buttonText}>Clear Call Data</Text>
            </TouchableOpacity>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Clear Item Data: </Text>
                <Text style={styles.noteMsg}>
                    "By clicking clear, all data in your Item Data file will be erased. Proceed?"</Text>
            </View>
            <TouchableOpacity onPress={confirmClearItemDataFileContent} style={styles.buttonCSS}>
                <Text style={styles.buttonText}>Clear Item Data</Text>
            </TouchableOpacity>
            <View>
                <Text style={styles.OrCSS}>OR</Text>
            </View>
            <View style={styles.labelContainer}>
                <Text style={styles.noteMsg}>
                    "By clicking, Delete the Folder and File And Recreate the Structure."</Text>
            </View>
            <TouchableOpacity onPress={handleDeleteAndRecreate} style={styles.buttonCSS}>
                <Text style={styles.buttonText}>Delete & Create Data Structure</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    parentContainer: {
    },
    buttonCSS: {
        backgroundColor: "black",
        padding: 8,
        width: "70%",
        alignSelf: "center",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "center"
    },
    noteMsg: {
        color: "red",
        fontSize: 16,
        fontStyle: "italic",
        overflow: "hidden",
        flex: 1,
        flexWrap: "wrap",
    },
    labelText: {
        color: "black",
        fontSize: 17,
        fontWeight: "bold",
    },
    labelContainer: {
        flexDirection: "row",
        width: "98%",
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
        alignSelf: "center",
        textAlign: "justify",
        overflow: "hidden",
        flexWrap: "wrap",
    },
    marginCSS: {
        borderBottomColor: "black",
        borderBottomWidth: 1,
        marginTop: 10,
        maxWidth: "95%",
        alignSelf: "center"
    },
    OrCSS:{
        color:"black",
        fontSize:24,
        alignSelf:"center",
        marginTop:5
    }
})

export default ClearFileContentButton;
