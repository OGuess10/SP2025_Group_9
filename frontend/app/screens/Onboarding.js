import React from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ route, navigation }) => {
  const { user_id } = route.params;
  return (
    <Swiper
      loop={false}
      dotColor="#ccc"
      activeDotColor="#2E7D32"
      showsButtons={false}
      paginationStyle={{ bottom: 0 }}
    >
      <Image
        source={require('../../assets/tutorial/1.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/2.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/3.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/4.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/5.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/6.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/7.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/8.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/9.png')}
        style={styles.image}
      />
      <Image
        source={require('../../assets/tutorial/10.png')}
        style={styles.image}
      />

      <View style={{ width, height }}>
        <Image
          source={require('../../assets/tutorial/11.png')}
          style={styles.image}
        />
        <TouchableOpacity
          onPress={() => navigation.replace('Home', { user_id: user_id })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    width,
    height,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // this makes it zoom/crop to fill
  },
  button: {
    position: 'absolute',
    bottom: height * 0.38,
    alignSelf: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: "Nunito_700Bold"
  },
});

export default OnboardingScreen;
