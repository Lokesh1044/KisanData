import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PopUpForm from './PopUpForm';
import ItemDataModel from '../models/ItemDataModel';
import DataModel from '../models/DataModel';

const AddManuallyScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const fileData = await ItemDataModel.getData();
      setData(fileData);
    };

    fetchData();
  }, []);

  const handleAddItem = async () => {
    if (inputValue.trim() !== '') {
      if (await ItemDataModel.itemExists(inputValue.trim())) {
        Alert.alert('Item already exists.');
        setInputValue('');
      } else {
        await ItemDataModel.addData(inputValue.trim());
        const updatedData = await ItemDataModel.getData();
        setData(updatedData);
        setInputValue('');
      }
    } else {
      Alert.alert('Input value cannot be empty.');
    }
  };

  const deleteItem = async (index) => {
    const oldData = await ItemDataModel.getData();
    const oldItemLabel = oldData[index];
    const existsInDataModel = await DataModel.itemExists(oldItemLabel);
    if (existsInDataModel) {
      Alert.alert("Failed", 'User exists with this Product and cannot be deleted!');
    } else {
      await ItemDataModel.deleteData(index);
      const updatedData = await ItemDataModel.getData();
      setData(updatedData);
    }
  };

  const handleDeleteItem = (index) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to Delete the Product?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'Delete',
          onPress: () => deleteItem(index),
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditItem = async (index) => {
    setEditIndex(index);
    setInputValue(data[index]);
  };

  const handleSaveEdit = async () => {
    if (inputValue.trim() !== '') {
      const oldData = await ItemDataModel.getData();
      const oldItemLabel = oldData[editIndex];
      if (oldItemLabel) {
        await DataModel.updateSelectedItemLabel(oldItemLabel, inputValue.trim());
      }
      await ItemDataModel.updateData(editIndex, inputValue.trim());
      const updatedData = await ItemDataModel.getData();
      setData(updatedData);
      setInputValue('');
      setEditIndex(-1);
    } else {
      Alert.alert('Input value cannot be empty.');
    }
  };

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.headingCSS}>Add Call Data: </Text>
        <View style={styles.containersCSS}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.buttonText}>Click to ADD CALL DATA</Text>
          </TouchableOpacity>
          <PopUpForm
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          />
        </View>
        <Text style={styles.headingCSS}>Add Item Data: </Text>
        <View style={styles.itemContainersCSS}>
          <View style={styles.addContainer}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter item"
              style={styles.addText}
            />
            {editIndex !== -1 ? (
              <TouchableOpacity onPress={handleSaveEdit} style={{ paddingHorizontal: 10 }}>
                <Image
                  source={require('../assets/edit_icon.png')}
                  style={styles.iconCSS}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleAddItem} style={{ paddingHorizontal: 10 }}>
                <Image
                  source={require('../assets/add-button.png')}
                  style={styles.iconCSS}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.listInnerContainer}>
                  <Text style={styles.listItems}>{item}</Text>
                  <TouchableOpacity onPress={() => handleEditItem(index)} style={{ paddingHorizontal: 10 }}>
                    <Image
                      source={require('../assets/edit-icon.png')}
                      style={styles.iconCSS}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteItem(index)} style={{ paddingHorizontal: 10 }}>
                    <Image
                      source={require('../assets/trash-icon.png')}
                      style={styles.iconCSS}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addText: {
    flex: 1,
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "black"
  },
  iconCSS: {
    height: 30,
    width: 30
  },
  listContainer: {
    padding: 7,
    marginBottom: 100
  },
  listInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    padding: 3,
  },
  listItems: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "black"
  },
  containersCSS: {
    // height: "10%",
  },
  itemContainersCSS: {
    height: "90%"
  },
  headingCSS: {
    fontWeight: "bold",
    fontSize: 20,
    color: "black",
    marginBottom: 3
  },
  addButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default AddManuallyScreen;
