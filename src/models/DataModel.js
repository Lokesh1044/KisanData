import RNFS from 'react-native-fs';

const dirPath = `${RNFS.DownloadDirectoryPath}/testDirectory`;
const callDataFilePath = `${dirPath}/callData.json`;
const itemDataFilePath = `${dirPath}/myData.json`;

class DataModel {
  static async getData() {
    try {
      const fileExists = await RNFS.exists(callDataFilePath);
      if (fileExists) {
        const fileContents = await RNFS.readFile(callDataFilePath, 'utf8');
        return JSON.parse(fileContents);
      }
      return [];
    } catch (error) {
      console.error('Error reading data from file:', error);
      return [];
    }
  }

  static async saveData(data) {
    try {
      await RNFS.mkdir(dirPath);
      await RNFS.writeFile(callDataFilePath, JSON.stringify(data), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing data to file:', error);
      return false;
    }
  }

  static async addData(newData) {
    try {
      let fileContents = await this.getData();
      fileContents.push(newData);
      return await this.saveData(fileContents);
    } catch (error) {
      console.error('Error adding data:', error);
      return false;
    }
  }

  static async addOrUpdateData(newData, isEditMode, detectedNumber) {
    try {
      let fileContents = await this.getData();

      if (isEditMode) {
        const index = fileContents.findIndex((data) => data.phoneNumber === detectedNumber);
        if (index !== -1) {
          fileContents[index] = {
            ...fileContents[index],
            selectedColorLabel: newData.selectedColorLabel,
            selectedItemLabel: newData.selectedItemLabel,
            remindDate: newData.remindDate,
            note: newData.note,
          };
        }
      } else {
        fileContents.push(newData);
      }

      return await this.saveData(fileContents);
    } catch (error) {
      console.error('Error adding or updating data:', error);
      return false;
    }
  }

  static async updateSelectedItemLabel(oldLabel, newLabel) {
    try {
      let fileContents = await this.getData();
      fileContents = fileContents.map((item) => {
        if (item.selectedItemLabel === oldLabel) {
          return {
            ...item,
            selectedItemLabel: newLabel
          };
        }
        return item;
      });
      return await this.saveData(fileContents);
    } catch (error) {
      console.error('Error updating selected item label:', error);
      return false;
    }
  }

  static async itemExists(itemLabel) {
    try {
      const fileContents = await this.getData();
      const itemFound = fileContents.find((data) => data.selectedItemLabel === itemLabel);
      return itemFound !== undefined || '';
    } catch (error) {
      console.error('Error checking item existence:', error);
      return false;
    }
  }

  static async phoneNumberExists(phoneNumber) {
    try {
      const fileContents = await this.getData();
      return fileContents.some((data) => data.phoneNumber === phoneNumber);
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
    }
  }


  static async deleteDirectory() {
    try {
      const dirExists = await RNFS.exists(dirPath);
      if (dirExists) {
        await RNFS.unlink(dirPath);
        console.log('Directory deleted.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting directory:', error);
      return false;
    }
  }

  static async createInitialDataStructure() {
    try {
      await RNFS.mkdir(dirPath);
      const initialData = [];
      await RNFS.writeFile(callDataFilePath, JSON.stringify(initialData), 'utf8');
      console.log('Initial data structure created.');
    } catch (error) {
      console.error('Error creating initial data structure:', error);
    }
  }


  static async clearCallDataFileContent() {
    try {
      await RNFS.writeFile(callDataFilePath, JSON.stringify([]), 'utf8');
      console.log('Call Data File content cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing file content:', error);
      return false;
    }
  }

  static async clearItemDataFileContent() {
    try {
      await RNFS.writeFile(itemDataFilePath, JSON.stringify([]), 'utf8');
      console.log('Item Data File content cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing file content:', error);
      return false;
    }
  }

}

export default DataModel;
