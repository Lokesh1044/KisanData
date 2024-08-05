import RNFS from 'react-native-fs';

const dirPath = `${RNFS.DownloadDirectoryPath}/testDirectory`;
const itemDataFilePath = `${dirPath}/myData.json`;

class ItemDataModel {
  static async ensureDirExists() {
    try {
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
        console.log('Directory created');
      }
    } catch (error) {
      console.error('Error ensuring directory exists:', error);
    }
  }

  static async getData() {
    try {
      await this.ensureDirExists();
      const fileExists = await RNFS.exists(itemDataFilePath);
      if (fileExists) {
        const fileContents = await RNFS.readFile(itemDataFilePath, 'utf8');
        return JSON.parse(fileContents);
      }
      return [];
    } catch (error) {
      console.error('Error reading data from file:', error);
      return [];
    }
  }

  // Save data to the file
  static async saveData(data) {
    try {
      await this.ensureDirExists();
      await RNFS.writeFile(itemDataFilePath, JSON.stringify(data), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing data to file:', error);
      return false;
    }
  }

  // Add new data to the file
  static async addData(newData) {
    try {
      const fileContents = await this.getData();
      fileContents.push(newData);
      return await this.saveData(fileContents);
    } catch (error) {
      console.error('Error adding data:', error);
      return false;
    }
  }

  // Update existing data in the file
  static async updateData(index, newValue) {
    try {
      const fileContents = await this.getData();
      if (fileContents.length > index) {
        fileContents[index] = newValue;
        return await this.saveData(fileContents);
      }
      return false;
    } catch (error) {
      console.error('Error updating data:', error);
      return false;
    }
  }

  // Delete data from the file
  static async deleteData(index) {
    try {
      const fileContents = await this.getData();
      if (fileContents.length > index) {
        fileContents.splice(index, 1);
        return await this.saveData(fileContents);
      }
      return false;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // Check if an item exists
  static async itemExists(item) {
    try {
      const fileContents = await this.getData();
      return fileContents.includes(item);
    } catch (error) {
      console.error('Error checking item existence:', error);
      return false;
    }
  }
}

export default ItemDataModel;
