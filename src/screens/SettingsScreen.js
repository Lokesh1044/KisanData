import * as React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ClearFileContentButton from '../utils/ClearFileContentButton';

function SettingsScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#26c4d0', '#8bd099', '#e4da67']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View>
        <ClearFileContentButton />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 5,
  },
})


export default SettingsScreen;
