import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Root Navigation
import RootNavigator from "./navigation/RootNavigator";

// Contexts
import { AuthProvider } from "./context/AuthContext";

// Demo mode context
const DemoModeContext = React.createContext();
export const useDemoMode = () => React.useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true); // Set to true for offline demo
  return <DemoModeContext.Provider value={{ isDemoMode, setIsDemoMode }}>{children}</DemoModeContext.Provider>;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DemoModeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </DemoModeProvider>
    </SafeAreaProvider>
  );
}
