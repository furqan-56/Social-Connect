import React from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {store} from './src/store/store';
import {ThemeProvider} from './src/theme/ThemeContext';
import {ToastProvider} from './src/components/Toast';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
