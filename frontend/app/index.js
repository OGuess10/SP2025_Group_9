import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./auth/AuthContext";
import StackNavigator from "./StackNavigator"; // Import your stack navigator

export default function App() {
  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
}
