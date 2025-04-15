import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../app/auth/AuthContext";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;
const SIDEBAR_HEIGHT = height * 0.8;

const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";

const NavBar = ({ user }) => {
  const navigation = useNavigation();
  const [scaleAnim] = useState(new Animated.Value(1));
  const { logout } = useAuth();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    setSidebarVisible(true);
    setOverlayVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 120,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        useNativeDriver: true,
        damping: 20,
        stiffness: 100,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOverlayVisible(false);
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          navigation.navigate("Splash");
        },
      },
    ]);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const buttons = [
    { name: "Home", icon: <MaterialCommunityIcons name="tree" size={28} />, route: "Home" },
    { name: "Leaderboard", icon: <MaterialIcons name="show-chart" size={28} />, route: "Leaderboard" },
    { name: "Activity", icon: <AntDesign name="pluscircleo" size={24} />, route: "Activity" },
    { name: "Friends", icon: <MaterialIcons name="people" size={28} />, route: "Friends" },
  ];

  return (
    <>
      {overlayVisible && (
        <Animated.View
          pointerEvents={sidebarVisible ? "auto" : "none"}
          style={styles.overlayWrapper}
        >
          {/* Blur */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: blurOpacity, zIndex: 1 }]}>
            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
          </Animated.View>

          {/* Tap to Close */}
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 2 }]} onPress={closeSidebar} />

          {/* Sidebar */}
          <View style={styles.sidebarWrapper} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.sidebar,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.sidebarContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sidebarTitle}>Menu</Text>
                  {/* Add any sidebar menu items here if needed */}
                </View>

                {/* Sleek Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <View style={styles.innerGlow} />
                  <FontAwesome name="sign-out" size={20} color="#333" style={{ marginRight: 10 }} />
                  <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
              </View>

              {/* Right buffer to prevent edge bounce */}
              <View style={styles.sidebarRightBuffer} />
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Bottom NavBar */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={styles.navBarWrapper}>
          <View style={tw`flex flex-row items-center justify-between w-5/6 bg-white shadow-lg rounded-full px-5 py-3`}>
            {buttons.map(({ name, icon, route }) => {
              const currentRoute = useRoute();
              const isActive = route === currentRoute.name;

              return (
                <Animated.View key={name} style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    style={[tw`p-2 rounded-lg`, isActive && { backgroundColor: pastelGreenLight }]}
                    onPress={() => navigation.navigate(route, { user })}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    {React.cloneElement(icon, { color: isActive ? "#2E7D32" : "black" })}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={tw`p-2 rounded-lg`}
                onPress={openSidebar}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <FontAwesome name="bars" size={28} color="black" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 20,
  },
  sidebarWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 3,
  },
  sidebar: {
    height: SIDEBAR_HEIGHT,
    width: SIDEBAR_WIDTH + 20,
    flexDirection: "row",
  },
  sidebarContent: {
    flex: 1,
    justifyContent: "space-between",
    width: SIDEBAR_WIDTH,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarRightBuffer: {
    width: 20,
    backgroundColor: "white",
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  navBarWrapper: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
    zIndex: 0,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#DDD", // crisp edge
  },  
  logoutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  innerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },  
});

export default NavBar;
