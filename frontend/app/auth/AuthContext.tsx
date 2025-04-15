import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Prevents flashing


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const checkUserExists = await fetch(`${BACKEND_URL}/user/get_user?user_id=${storedUserId}`);
        // check if userId is still in DB
        if(!storedUserId || !checkUserExists.ok) {
          await AsyncStorage.removeItem("userId");
          setIsAuthenticated(false);
          setUserId(null);
        } else {
          setUserId(storedUserId);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUserId(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Finish loading
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !userId) {
      console.warn("Invalid session state detected. Resetting session.");
      setIsAuthenticated(false);
    }
  }, [isAuthenticated, userId]);


  const login = async (id: string) => {
    try {
      await AsyncStorage.setItem("userId", id);
      setUserId(id);
      setIsAuthenticated(true);
      console.log("logged in with id: " + id);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      setUserId(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
    finally {
      setUserId(null);
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return null; // Prevent flickering on initial load
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared!");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};

export default AuthProvider;
