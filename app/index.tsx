import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import Signin from './signin';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function loadApp() {
      // Simulating app loading process (e.g., fetching data, checking auth)
      await new Promise(resolve => setTimeout(resolve, 4000));

      // After loading completes, hide the splash screen
      setIsAppReady(true);
    }

    loadApp();
  }, []);

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <Video
          source={require('../assets/videos/splash.mp4')}  // Ensure this path is correct
          rate={1.3}  // Normal playback speed
          volume={1.0}  // Full volume
          isMuted={false}
          resizeMode="contain"  // Adjust to fit the screen ('contain', 'cover', 'stretch')
          shouldPlay
          isLooping={false}  // Change to true if you want it to repeat
          style={styles.video}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setIsAppReady(true);  // Transition to the next screen after the video finishes
            }
          }}
        />
      </View>
    );
  }

  return <Signin />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
