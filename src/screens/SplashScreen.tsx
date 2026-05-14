import React, {useEffect, useRef} from 'react';
import {Animated, StatusBar, StyleSheet, Text, View} from 'react-native';

export default function SplashScreen(): React.JSX.Element {
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.spring(ringScale, {
          bounciness: 8,
          speed: 6,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          duration: 500,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, {
          bounciness: 10,
          speed: 8,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          duration: 400,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, ringOpacity, ringScale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <Animated.View
        style={[
          styles.ringWrap,
          {opacity: ringOpacity, transform: [{scale: ringScale}]},
        ]}>
        <View style={styles.ring}>
          <Animated.View
            style={[
              styles.logoBox,
              {opacity: logoOpacity, transform: [{scale: logoScale}]},
            ]}>
            <Text style={styles.monogram}>SC</Text>
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.View style={{opacity: logoOpacity}}>
        <Text style={styles.appName}>Social Connect</Text>
        <Text style={styles.tagline}>Connect. Share. Belong.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 28,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    flex: 1,
    justifyContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  monogram: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ring: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 9999,
    borderWidth: 2.5,
    height: 108,
    justifyContent: 'center',
    width: 108,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});
