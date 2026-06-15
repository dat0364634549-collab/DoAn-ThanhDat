import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const STORAGE_KEY = '@thanhdat/current-user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setUser(value ? JSON.parse(value) : null))
      .finally(() => setRestoring(false));
  }, []);

  async function persist(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }

  async function login(email, password) {
    const result = await api.login(email.trim(), password);
    await persist(result);
    return result;
  }

  async function register(values) {
    const result = await api.register(values);
    await persist(result);
    return result;
  }

  async function updateProfile(values) {
    const nextUser = { ...user, ...values };
    await api.updateUser(nextUser);
    await persist(nextUser);
  }

  const value = useMemo(
    () => ({ user, restoring, login, register, logout: () => persist(null), updateProfile }),
    [user, restoring]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
