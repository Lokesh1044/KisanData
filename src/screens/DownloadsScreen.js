import React, { useEffect, useState } from 'react';
import { View, PermissionsAndroid, Platform, Alert, FlatList, Text, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import XLSX from 'xlsx';
import DatePicker from 'react-native-date-picker';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import DataModel from '../models/DataModel';

const DownloadsScreen = () => {
  const [excelFiles, setExcelFiles] = useState([]);
  const [callData, setCallData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isDownloadAllLoading, setIsDownloadAllLoading] = useState(false);

  useEffect(() => {
    requestStoragePermission();
    listExcelFiles();
    readCallData();
  }, []);

  const downloadsPath = `${RNFS.ExternalStorageDirectoryPath}/Download/testDirectory/downloads`;

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to save files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission granted');
        } else {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const readCallData = async () => {
    try {
      const fileContent = await DataModel.getData();
      setCallData(fileContent);
      console.log('Call data:', fileContent);
    } catch (error) {
      console.error('Error reading call data:', error);
    }
  };

  const autoAdjustColumnWidth = (data, worksheet) => {
    const columnWidths = data[0].map((_, colIndex) => {
      return Math.max(...data.map(row => {
        const cellValue = row[colIndex] ? row[colIndex].toString() : '';
        return cellValue.length;
      }));
    });

    worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));
  };


  const createExcelFile = async () => {
    setIsLoading(true);
    const Path = `${downloadsPath}`;
    try {
      const downloadsDirExists = await RNFS.exists(Path);
      if (!downloadsDirExists) {
        await RNFS.mkdir(Path);
        console.log('Downloads directory created');
      }
    } catch (error) {
      console.error('Error creating downloads directory:', error);
      Alert.alert('Error', 'Failed to create downloads directory.');
      setIsLoading(false);
      return;
    }

    const today = new Date();
    const isStartDateToday = startDate.toDateString() === today.toDateString();

    const adjustedStartDate = isStartDateToday ? new Date(today.setHours(0, 0, 0, 0)) : startDate;
    const adjustedEndDate = new Date(today.setHours(23, 59, 59, 999));

    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    const aggregatedData = {};

    callData.forEach(item => {
      let hasCallHistory = false;
      item.callHistory.forEach(call => {
        const callDate = new Date(call.timestamp);
        if (callDate >= adjustedStartDate && callDate <= adjustedEndDate &&
          (call.type === 'INCOMING' || call.type === 'MISSED' || call.type === 'OUTGOING')) {

          const callDateString = moment(call.timestamp).format('DD-MM-YYYY');
          if (!aggregatedData[callDateString]) {
            aggregatedData[callDateString] = new Set();
          }

          const userKey = `${item.phoneNumber}-${item.selectedItemLabel}`;
          aggregatedData[callDateString].add(userKey);
          hasCallHistory = true;
        }
      });

      if (!hasCallHistory && item.dataSavedDate) {
        const dataSavedDate = new Date(item.dataSavedDate);
        if (dataSavedDate >= adjustedStartDate && dataSavedDate <= adjustedEndDate) {
          const dataSavedDateString = moment(dataSavedDate).format('DD-MM-YYYY');
          if (!aggregatedData[dataSavedDateString]) {
            aggregatedData[dataSavedDateString] = new Set();
          }

          const userKey = `${item.phoneNumber}-${item.selectedItemLabel}`;
          aggregatedData[dataSavedDateString].add(userKey);
        }
      }
    });

    const combinedData = [];

    Object.keys(aggregatedData).forEach(date => {
      aggregatedData[date].forEach(userKey => {
        const [phoneNumber, itemLabel] = userKey.split('-');
        const userLog = callData.find(item => item.phoneNumber === phoneNumber && item.selectedItemLabel === itemLabel);

        const callHistory = userLog.callHistory.filter(call => {
          const callDate = new Date(call.timestamp);
          return callDate >= adjustedStartDate && callDate <= adjustedEndDate &&
            (call.type === 'INCOMING' || call.type === 'MISSED' || call.type === 'OUTGOING');
        });

        combinedData.push({
          Date: date,
          Name: userLog.name,
          PhoneNumber: userLog.phoneNumber,
          Label: userLog.selectedColorLabel,
          Model: userLog.selectedItemLabel,
          RemindDate: userLog.remindDate ? moment(userLog.remindDate).format('DD-MM-YYYY') : '',
          Description: userLog.note,
          FullDateTime: new Date(`${date}T${callHistory.length > 0 ? moment(callHistory[0].timestamp).format('HH:mm:ss') : '00:00:00'}`)
        });
      });
    });

    console.log('Combined Data:', combinedData);

    if (combinedData.length === 0) {
      Alert.alert('No Data', 'No data available for the selected dates.');
      setIsLoading(false);
      return;
    }

    const sortedData = combinedData.sort((a, b) => {
      const dateA = moment(a.Date, 'DD-MM-YYYY').toDate();
      const dateB = moment(b.Date, 'DD-MM-YYYY').toDate();
      return dateA - dateB;
    });
    const finalData = sortedData.map(({ FullDateTime, ...rest }) => rest);

    const data = [
      Object.keys(finalData[0]), // Header row
      ...finalData.map(Object.values) // Data rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    autoAdjustColumnWidth(data, worksheet);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a binary string
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

    const startDateString = moment(startDate).format('DMMM');
    const endDateString = moment(endDate).format('DMMMYYYY');
    const filePath = `${downloadsPath}/${startDateString}-${endDateString}-callData.xlsx`;

    try {
      await RNFS.writeFile(filePath, wbout, 'base64');
      console.log('Excel file created at:', filePath);
      Alert.alert('Success', 'Excel file created successfully!');
      setIsLoading(false);
      setStartDate(new Date());
      setEndDate(new Date());
      listExcelFiles();
    } catch (error) {
      console.error('Error creating Excel file:', error);
      Alert.alert('Error', 'Failed to create Excel file.');
      setIsLoading(false);
    }
  };

  const createAllUsersExcelFile = async () => {
    setIsDownloadAllLoading(true);
    const Path = `${downloadsPath}`;
    try {
      const downloadsDirExists = await RNFS.exists(Path);
      if (!downloadsDirExists) {
        await RNFS.mkdir(Path);
        console.log('Downloads directory created');
      }
    } catch (error) {
      console.error('Error creating downloads directory:', error);
      Alert.alert('Error', 'Failed to create downloads directory.');
      setIsDownloadAllLoading(false);
      return;
    }

    // Extract and filter data based on date range
    const formatDuration = (durationInSeconds) => {
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const aggregatedData = {};

    callData.forEach(item => {
      let hasCallHistory = false;
      item.callHistory.forEach(call => {
        const callDate = new Date(call.timestamp);
        const callDateString = moment(call.timestamp).format('DD-MM-YYYY');
        if (!aggregatedData[callDateString]) {
          aggregatedData[callDateString] = new Set();
        }
        const userKey = `${item.phoneNumber}-${item.selectedItemLabel}`;
        aggregatedData[callDateString].add(userKey);
        hasCallHistory = true;
      });

      if (!hasCallHistory && item.dataSavedDate) {
        const dataSavedDate = new Date(item.dataSavedDate);
        const dataSavedDateString = moment(dataSavedDate).format('DD-MM-YYYY');
        if (!aggregatedData[dataSavedDateString]) {
          aggregatedData[dataSavedDateString] = new Set();
        }
        const userKey = `${item.phoneNumber}-${item.selectedItemLabel}`;
        aggregatedData[dataSavedDateString].add(userKey);
      }
    });

    const combinedData = [];

    Object.keys(aggregatedData).forEach(date => {
      aggregatedData[date].forEach(userKey => {
        const [phoneNumber, itemLabel] = userKey.split('-');
        const userLog = callData.find(item => item.phoneNumber === phoneNumber && item.selectedItemLabel === itemLabel);

        const callHistory = userLog.callHistory.filter(call => {
          const callDate = new Date(call.timestamp);
          return (call.type === 'INCOMING' || call.type === 'MISSED' || call.type === 'OUTGOING');
        });

        combinedData.push({
          Date: date,
          Name: userLog.name,
          PhoneNumber: userLog.phoneNumber,
          Label: userLog.selectedColorLabel,
          Model: userLog.selectedItemLabel,
          RemindDate: userLog.remindDate ? moment(userLog.remindDate).format('DD-MM-YYYY') : '',
          Description: userLog.note,
          FullDateTime: new Date(`${date}T${callHistory.length > 0 ? moment(callHistory[0].timestamp).format('HH:mm:ss') : '00:00:00'}`)
        });
      });
    });

    console.log('Combined Data:', combinedData);

    if (combinedData.length === 0) {
      Alert.alert('No Data', 'No data available.');
      setIsDownloadAllLoading(false);
      return;
    }

    const sortedData = combinedData.sort((a, b) => {
      const dateA = moment(a.Date, 'DD-MM-YYYY').toDate();
      const dateB = moment(b.Date, 'DD-MM-YYYY').toDate();
      return dateA - dateB;
    });

    const finalData = sortedData.map(({ FullDateTime, ...rest }) => rest);

    const data = [
      Object.keys(finalData[0]), // Header row
      ...finalData.map(Object.values) // Data rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    autoAdjustColumnWidth(data, worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

    const filePath = `${Path}/allUsersCallData.xlsx`;

    try {
      await RNFS.writeFile(filePath, wbout, 'base64');
      console.log('Excel file created at:', filePath);
      Alert.alert('Success', 'All users Calldata Excel file created successfully!');
      setIsDownloadAllLoading(false);
      listExcelFiles();
    } catch (error) {
      console.error('Error creating Excel file:', error);
      Alert.alert('Error', 'Failed to create Excel file.');
      setIsDownloadAllLoading(false);
    }
  };


  const listExcelFiles = async () => {
    const Path = `${downloadsPath}`;
    try {
      setLoading(true);
      const files = await RNFS.readDir(Path);
      const excelFiles = files.filter(file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls'));
      const sortedExcelFiles = excelFiles.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
      setExcelFiles(sortedExcelFiles);
      console.log('Filtered Excel files:', excelFiles);
      setLoading(false);
    } catch (error) {
      console.error('Error listing files:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to list files.');
    }
  };

  const openExcelFile = async (filePath) => {
    try {
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch (error) {
      console.error('Error opening Excel file:', error);
      Alert.alert('Error', 'Failed to open Excel file.');
    }
  };


  const handleDateChange = (date, type) => {
    if (type === 'start') {
      setStartDate(date);
    } else if (type === 'end') {
      setEndDate(date);
    }
    setOpenStartDate(false);
    setOpenEndDate(false);
  };

  const deleteExcelFile = async (filePath) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this file?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            try {
              await RNFS.unlink(filePath);
              Alert.alert('Success', 'File deleted successfully!');
              listExcelFiles();
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const deleteAllFiles = async () => {
    setIsLoadingDelete(true);
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete all Downloaded files?',
      [
        {
          text: 'Cancel',
          onPress: () => { console.log('Cancel Pressed'), setIsLoadingDelete(false) },
          style: 'cancel',
        },
        {
          text: 'DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            const Path = `${downloadsPath}`;
            try {
              const files = await RNFS.readDir(Path);
              if (files.length === 0) {
                Alert.alert('No Files', 'There are no files to delete.');
                setIsLoadingDelete(false);
              } else {
                for (const file of files) {
                  await RNFS.unlink(file.path);
                }
                Alert.alert('Success', 'All files deleted successfully!');
                setIsLoadingDelete(false);
                listExcelFiles();
              }
            } catch (error) {
              console.error('Error deleting all files:', error);
              Alert.alert('Error', 'Failed to delete all files.');
              setIsLoadingDelete(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  const renderItem = ({ item }) => (
    <View style={styles.itemOuterContainer}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => openExcelFile(item.path)}
          >
            <Image
              source={require('../assets/open-icon.png')}
              style={styles.calendarCSS}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteExcelFile(item.path)}
          >
            <Image
              source={require('../assets/trash-icon.png')}
              style={styles.calendarCSS}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.calendarPickerContainer}>
        <View style={styles.dateRow}>
          <Text style={styles.label}>From Date:</Text>
          <View style={styles.textImgContainer}>
            <TextInput
              style={styles.dateTextInput}
              value={startDate.toLocaleDateString()}
              onFocus={() => setOpenStartDate(true)}
              showSoftInputOnFocus={false}
            />
            <TouchableOpacity onPress={() => setOpenStartDate(true)}>
              <Image
                source={require('../assets/calender-remind.png')}
                style={styles.calendarCSS}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openStartDate}
              date={startDate}
              onConfirm={(date) => handleDateChange(date, 'start')}
              onCancel={() => setOpenStartDate(false)}
              mode="date"
            />
          </View>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.label}>To Date:</Text>
          <View style={styles.textImgContainer}>
            <TextInput
              style={styles.dateTextInput}
              value={endDate.toLocaleDateString()}
              onFocus={() => setOpenEndDate(true)}
              showSoftInputOnFocus={false}
            />
            <TouchableOpacity onPress={() => setOpenEndDate(true)}>
              <Image
                source={require('../assets/calender-remind.png')}
                style={styles.calendarCSS}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openEndDate}
              date={endDate}
              onConfirm={(date) => handleDateChange(date, 'end')}
              onCancel={() => setOpenEndDate(false)}
              mode="date"
            />
          </View>
        </View>
      </View>
      <View style={styles.deleteAllButtonContainer}>
        <TouchableOpacity onPress={createExcelFile} style={styles.downloadButton}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="white" style={{ alignSelf: "center" }} />
            </View>
          ) : (
            <Text style={styles.downloadText}>Download</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={createAllUsersExcelFile} style={styles.downloadAllButton}>
          {isDownloadAllLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="white" style={{ alignSelf: "center" }} />
            </View>
          ) : (
            <Image
              source={require('../assets/download_all.png')}
              style={styles.calendarCSS}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteAllFiles} style={styles.deleteAllButton}>
          {isLoadingDelete ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="white" style={{ alignSelf: "center" }} />
            </View>
          ) : (
            <Text style={styles.downloadText}>Delete All Files</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>ExcelFiles</Text>
        <Text style={styles.headerText}>Action</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : excelFiles.length === 0 ? (
        <Text style={styles.title}>No Files Exist</Text>
      ) : (
        <>
          <FlatList
            data={excelFiles}
            keyExtractor={(item) => item.path}
            renderItem={renderItem}
            style={styles.listContainer}
          />
        </>
      )
      }
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  itemOuterContainer: {
    marginVertical: 8,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black"
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  deleteButton: {
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  calendarPickerContainer: {
    flexDirection: "row",
    height: "10%"
  },
  dateRow: {
    flexDirection: "column",
    alignItems: 'center',
    width: "50%",
    marginRight: 5,
  },
  label: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: "flex-start",
    fontStyle: "normal",
    marginBottom: 2
  },
  dateTextInput: {
    borderBottomWidth: 1,
    fontSize: 17,
    padding: 5,
    backgroundColor: 'black',
    flex: 1,
    textAlign: "center",
    color: "white"
  },
  calendarCSS: {
    width: 30,
    height: 30,
    marginLeft: 5,
  },
  textImgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 5,
    backgroundColor: "black",
    marginTop: 10
  },
  headerText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    borderRadius: 5
  },
  navigateButton: {
    justifyContent: "center",
    padding: 5,
    borderRadius: 5
  },
  downloadButton: {
    backgroundColor: "black",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 5,
    width: "35%",
    justifyContent: "center"
  },
  downloadAllButton: {
    backgroundColor: "black",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 5,
    width: "15%",
    justifyContent: "center"
  },
  downloadText: {
    color: "white",
    fontSize: 20,
    alignSelf: "center"
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    maxWidth: "65%",
    marginRight: 5,
    color: "black"
  },
  listContainer: {
    width: "100%",
    // marginBottom: 150,
    // marginTop:5
  },
  heading: {
    fontSize: 24,
    color: "black",
    justifyContent: "flex-start",
    marginTop: 5,
    borderBottomWidth: 1
  },
  deleteAllButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10
  },
  deleteAllButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: "50%"
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "black",
    alignSelf: "center",
    marginTop: 10
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DownloadsScreen;
