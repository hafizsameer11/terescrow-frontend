import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface QuickActionIcon {
    id: string;
    label: string;
    icon: any;
    onPress?: () => void;
}

const QuickActionIcons = () => {
    const { dark } = useTheme();
    const { navigate } = useNavigation<NavigationProp<any>>();

    const quickActions: QuickActionIcon[] = [
        {
            id: 'sell',
            label: 'Sell',
            icon: icons.firsticon, // Paper airplane / send icon
            onPress: () => navigate('selectasset' as any, { forSell: 'true' }),
        },
        {
            id: 'buy',
            label: 'Buy',
            icon: icons.secondicon, // Downward arrow into box
            onPress: () => navigate('selectasset' as any, { forBuy: 'true' }),
        },
        {
            id: 'receive',
            label: 'Receive',
            icon: icons.thirdicon, // Upward arrow into box
            onPress: () => navigate('selectasset' as any, { forReceive: 'true' }),
        },
        {
            id: 'swap',
            label: 'Swap',
            icon: icons.fourthicon, // Two opposing arrows
            onPress: () => navigate('selectasset' as any, { forReceive: 'false' }),
        },
        {
            id: 'assets',
            label: 'Assets',
            icon: icons.fifthicon, // Stack of coins
            onPress: () => navigate('allassets'),
        },
    ];

    return (
        <View style={styles.container}>
            {quickActions.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    style={styles.iconContainer}
                    onPress={action.onPress}
                >
                    <View
                        style={[
                            styles.iconCircle,
                            { backgroundColor: '#E8F5E9' }, // Light green background
                        ]}
                    >
                        <View style={{backgroundColor: '#147341', padding: 7, borderRadius: 35}}>
                            <Image
                                source={action.icon}
                                style={styles.icon}
                                contentFit="contain"
                            />
                        </View>
                    </View>
                    <Text
                        style={[
                            styles.label,
                            { color: dark ? COLORS.white : COLORS.black },
                        ]}
                    >
                        {action.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default QuickActionIcons;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    iconContainer: {
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: isTablet ? 70 : 61,
        height: isTablet ? 70 : 61,
        borderRadius: isTablet ? 35 : 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        width: isTablet ? 28 : 24,
        height: isTablet ? 28 : 24,
        // tintColor: '#147341', // Dark green icon
    },
    label: {
        fontSize: isTablet ? 14 : 12,
        fontWeight: '500',
        textAlign: 'center',
    },
});

