import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import splash from '../assets/images/splash.gif';
const SplashSteam = () => {
    return (
        <View style={styles.container}>
            <Image
                source={splash} // Ensure the correct path
                style={styles.splashImage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    splashImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default SplashSteam;
