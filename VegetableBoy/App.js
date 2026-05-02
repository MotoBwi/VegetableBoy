import React, {useState, useEffect, createContext, useContext} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import {userAuthApi} from './src/services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAuthApi
      .me()
      .then(u => setUser(u))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthContext.Provider value={{user, setUser, loading}}>
        <AppNavigator />
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}
