import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-date-picker';
import DataModel from '../models/DataModel';
import ItemDataModel from '../models/ItemDataModel';
import Contacts from 'react-native-contacts';
import { getContacts } from '../models/contacts';

const dataLabel = ['Red', 'Green', 'Black'];

const PopUpForm = ({ isVisible, onClose, detectedNumber }) => {
  console.log("detected number:", detectedNumber)
  const [itemData, setItemData] = useState([]);
  const [selectedValueItem, setSelectedValueItem] = useState(itemData[0] || '');
  const [selectedValueLabel, setSelectedValueLabel] = useState(dataLabel[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const jsonFileExists = await ItemDataModel.getData();
        setItemData(jsonFileExists);
        if (jsonFileExists.length > 0) {
          setSelectedValueItem(jsonFileExists[0]);
        }
        console.log("_-------------->", jsonFileExists)
        console.log("_-------------->", selectedValueItem)
      } catch (error) {
        console.error('Error reading item data from file:', error);
      }
    };
    fetchItemData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const callFileContents = await DataModel.getData();
        console.log("callFileContents",callFileContents)
        if (callFileContents) {
          const existingData = callFileContents.find((data) => data.phoneNumber === detectedNumber);
          if (existingData) {
            setSelectedValueItem(existingData.selectedItemLabel);
            setSelectedValueLabel(existingData.selectedColorLabel);
            setSelectedDate(existingData.remindDate ? new Date(existingData.remindDate) : null);
            setPhoneNumber(existingData.phoneNumber);
            setName(existingData.name);
            setNote(existingData.note);
            setIsEditMode(true);
          } else {
            resetForm();
          }
        } else {
          resetForm();
        }
      } catch (error) {
        console.error('Error reading data from file:', error);
      }
    };

    if (isVisible) {
      fetchData();
      setPhoneNumber(detectedNumber);
    } else {
      resetForm();
    }
  }, [isVisible, detectedNumber]);

  const resetForm = () => {
    setSelectedValueItem(itemData[0] || '');
    setSelectedValueLabel(dataLabel[0]);
    setSelectedDate(null);
    setPhoneNumber(detectedNumber || '');
    setName('');
    setNote('');
    setPhoneNumberError(false);
    setIsEditMode(false);
  };


  const handlePhoneNumberChange = (number) => {
    const cleanedNumber = number.replace(/[^\d]/g, '');
    if (cleanedNumber.length === 10) {
      const formattedNumber = '+91' + cleanedNumber;
      setPhoneNumber(formattedNumber);
      setPhoneNumberError(false);
    } else {
      setPhoneNumberError(cleanedNumber.length > 0);
      setPhoneNumber(cleanedNumber);
    }
  };



  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  const handleCancel = () => {
    if (!isEditMode) {
      setSelectedDate(null);
      hideDatePicker();
    }
    else {
      hideDatePicker();
    }
  };

  const handleSubmit = async () => {
    if (phoneNumberError || !name || !phoneNumber) {
      alert('Please fill all required fields correctly.');
      return;
    }

    if (itemData.length == 0) {
      Alert.alert('Add Item', "Please add Item Data first!");
      onClose();
      return;
    }

    // if (!isEditMode) {
    //   setSelectedValueItem(itemData[0])
    // }

    setIsLoading(true);

    const newData = {
      name: name,
      phoneNumber: phoneNumber,
      selectedColorLabel: selectedValueLabel,
      callHistory: [],
      count: 1,
      remindDate: selectedDate ? selectedDate.toLocaleDateString() : null,
      selectedItemLabel: selectedValueItem,
      note: note,
      dataSavedDate: new Date()
    };

    console.log("newData" + JSON.stringify(newData))

    const saveContact = async (name, phoneNumber) => {
      try {
        const contacts = await getContacts();
        const existingContact = contacts.find(contact =>
          contact.phoneNumbers.some(number => number.number === phoneNumber)
        );

        if (existingContact) {
          Alert.alert('Contact already exists', 'The contact already exists in your phone.');
          onClose();
          return false;
        }

        const newContact = {
          givenName: name,
          phoneNumbers: [
            {
              label: 'mobile',
              number: phoneNumber,
            },
          ],
        };

        await Contacts.addContact(newContact);
        Alert.alert('Success', 'Contact saved successfully.');
        return true; // Contact saved successfully
      } catch (error) {
        console.error('Error saving contact:', error);
        Alert.alert('Error', 'Failed to save contact.');
        return false; // Error saving contact
      }
    };

    try {
      const contactSaved = isEditMode || await saveContact(name, phoneNumber);
      if (!contactSaved && !isEditMode) {
        setIsLoading(false);
        return; 
      }

      const isSaved = await DataModel.addOrUpdateData(newData, isEditMode, phoneNumber);
      if (isSaved) {
        alert(isEditMode ? 'Data updated successfully.' : 'Data saved successfully.');
        onClose();
      } else {
        alert('Failed to save data.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data.');
    } finally {
      setIsLoading(false); 
    }
  };


  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.closeContainer}>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('../assets/delete_icon.png')}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.modalTextInput]}
              placeholder="NAME"
              placeholderTextColor="white"
              value={name}
              onChangeText={setName}
              editable={!isEditMode}
            />
            <TextInput
              style={[styles.modalTextInput, phoneNumberError && styles.inputError]}
              placeholder="PHONE NO"
              placeholderTextColor="white"
              keyboardType="numeric"
              onChangeText={handlePhoneNumberChange}
              value={phoneNumber}
              editable={!isEditMode}
            />
          </View>

          <View style={styles.dropdownsContainer}>
            <View style={styles.labelDropdown}>
              <RNPickerSelect
                onValueChange={(itemValue) => setSelectedValueLabel(itemValue)}
                items={dataLabel.map((item) => ({ label: item, value: item }))}
                value={selectedValueLabel}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Image
                    source={require('../assets/arrow-down.png')}
                    style={styles.dropdownIcon}
                    resizeMode="contain"
                  />
                )}
              />
            </View>

            <View style={styles.labelDropdown}>
              <RNPickerSelect
                onValueChange={(itemValue) => setSelectedValueItem(itemValue)}
                items={itemData.map((item) => ({ label: item, value: item }))}
                value={selectedValueItem}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Image
                    source={require('../assets/arrow-down.png')}
                    style={styles.dropdownIcon}
                    resizeMode="contain"
                  />
                )}
              />
            </View>

            <View style={styles.calenderContainer}>
              <TouchableOpacity onPress={showDatePicker}>
                <Image
                  source={require('../assets/calender-remind.png')}
                  style={styles.calenderCSS}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {selectedDate && (
            <Text style={styles.selectedDateCSS}>Selected Remind Date: {selectedDate.toLocaleDateString()}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TextInput
              style={[styles.noteTextInput]}
              placeholder="NOTE"
              placeholderTextColor="white"
              value={note}
              onChangeText={setNote}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.6}
              onPress={handleSubmit}
            >
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {isEditMode ? 'UPDATE' : 'SUBMIT'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Modal
            visible={isDatePickerVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={hideDatePicker}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainerCal}>
                <DatePicker
                  date={selectedDate || new Date()}
                  onDateChange={handleConfirm}
                  mode="date"
                  locale="en"
                  minimumDate={new Date()}
                  maximumDate={new Date(2100, 11, 31)}
                  androidVariant="nativeAndroid"
                  is24hourSource="locale"
                  textColor='black'
                  style={styles.datePickerCSS}
                />
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity onPress={handleCancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={hideDatePicker}>
                    <Text style={styles.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalTextInput: {
    backgroundColor: 'black',
    width: '50%',
    color: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  noteTextInput: {
    backgroundColor: 'black',
    width: '100%',
    color: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  inputError: {
    borderColor: 'red',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#5271ff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  modalButton: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: 'black',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderColor: "white"
  },
  textInputContainer: {
    flexDirection: 'row',
  },
  buttonContainer: {
    width: '100%',
  },
  closeContainer: {
    width: '100%',
    flexDirection: 'row-reverse',
    padding: 3,
    marginBottom: 7,
    marginRight: 25,
    marginTop: -10,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  dropdownsContainer: {
    flexDirection: 'row',
    height: 40,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  labelDropdown: {
    flex: 1,
    height: '100%',
    padding: 1,
    justifyContent: 'center',
  },
  calenderContainer: {
    width: '20%',
    height: '100%',
    padding: 1,
    justifyContent: 'center',
  },
  calenderCSS: {
    width: '100%',
    height: '100%',
  },
  modalContainerCal: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '50%',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
  },
  confirmText: {
    color: 'blue',
    fontSize: 18,
  },
  cancelText: {
    color: 'red',
    fontSize: 18,
  },
  selectedDateCSS: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 20,
    marginTop: 10,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  loaderContainer: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -12 }], // Center the loader
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 'bold',
    borderRadius: 15,
    color: 'black',
    textAlign: 'center',
    maxWidth: '70%',
  },
  placeholder: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

export default PopUpForm;
