import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';


const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;


export default function SidebarOverlay({ visible, onClose, children }) {
  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(visible ? 0 : SIDEBAR_WIDTH) }],
  }));


  return (
    visible && (
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback onPress={onClose}>
          <BlurView intensity={50} style={styles.blurOverlay} tint="dark" />
        </TouchableWithoutFeedback>


        <Animated.View style={[styles.sidebar, sidebarStyle]}>
          {children}
        </Animated.View>
      </View>
    )
  );
}


const styles = StyleSheet.create({
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: SIDEBAR_WIDTH,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    padding: 20,
  },
});

