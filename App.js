import * as React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import DateWiseDataScreen from './src/screens/DateWiseDataScreens/DateWiseDataScreen';
import ProductWiseDataScreen from './src/screens/ProductWiseDataScreens/ProductWiseDataScreen';
import LabelWiseDataScreen from './src/screens/LabelWiseDataScreens/LabelWiseDataScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddManuallyScreen from './src/screens/AddManuallyScreen';
import PopUpForm from './src/screens/PopUpForm';
import CallLogScreen from './src/screens/CallLogScreen';
import DetailedDateScreen from './src/screens/DateWiseDataScreens/DetailedDateScreen';
import DetailedItemScreen from './src/screens/ProductWiseDataScreens/DetailedItemScreen';
import DetailedLabelScreen from './src/screens/LabelWiseDataScreens/DetailedLabelScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SplashScreen from './src/screens/SplashScreen'; // Import SplashScreen

const Stack = createStackNavigator();

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Home',
            headerRight: () => (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => navigation.navigate('CallLogs')} style={{ paddingHorizontal: 10 }}>
                  <Image
                    source={require('./src/assets/calllog-icon.png')}
                    style={{ height: 35, width: 35 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationsScreen')} style={{ paddingHorizontal: 10 }}>
                  <Image
                    source={require('./src/assets/notifications-icon.png')}
                    style={{ height: 35, width: 35, marginRight: 10 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen name="CallLogs" component={CallLogScreen} />
        <Stack.Screen name="DateWiseData" component={DateWiseDataScreen} />
        <Stack.Screen name="ProductWiseData" component={ProductWiseDataScreen} />
        <Stack.Screen name="LabelWiseData" component={LabelWiseDataScreen} />
        <Stack.Screen name="Downloads" component={DownloadsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AddManually" component={AddManuallyScreen} />
        <Stack.Screen name="popup" component={PopUpForm} />
        <Stack.Screen name="SelectedDateScreen" component={DetailedDateScreen} />
        <Stack.Screen name="SelectedProductScreen" component={DetailedItemScreen} />
        <Stack.Screen name="SelectedLabelScreen" component={DetailedLabelScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
