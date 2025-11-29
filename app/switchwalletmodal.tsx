import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    Pressable,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const walletOptions = [
    {
        id: 'naira',
        name: 'Naira Wallet',
        description: 'Switch to your Naira wallet',
        icon: images.vector49,
    },
    {
        id: 'crypto',
        name: 'Crypto Wallet',
        description: 'Switch to your crypto wallet',
        icon: images.bitcoinTransaction,
    },
];

const SwitchWalletModal = () => {
    const { dark } = useTheme();
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState<string>('naira');

    const handleSelect = (walletId: string) => {
        setSelectedWallet(walletId);
        // TODO: Handle wallet switch logic
        // Close modal after a short delay
        setTimeout(() => {
            router.back();
        }, 300);
    };

    return (
        <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => router.back()}
        >
            <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <SafeAreaView
                        style={[
                            styles.container,
                            dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
                        ]}
                        edges={['top']}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                                Switch Wallet
                            </Text>
                        </View>

                        {/* Wallet Options */}
                        <View style={styles.walletOptionsSection}>
                            {walletOptions.map((wallet) => (
                                <TouchableOpacity
                                    key={wallet.id}
                                    style={[
                                        styles.walletCard,
                                        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                                    ]}
                                    onPress={() => handleSelect(wallet.id)}
                                >
                                    {/* Icon */}
                                    <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                                        <Image
                                            source={wallet.icon}
                                            style={styles.walletIcon}
                                            contentFit="contain"
                                        />
                                    </View>

                                    {/* Text Content */}
                                    <View style={styles.walletTextContainer}>
                                        <Text style={[styles.walletName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                                            {wallet.name}
                                        </Text>
                                        <Text style={[styles.walletDescription, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                                            {wallet.description}
                                        </Text>
                                    </View>

                                    {/* Radio Button */}
                                    <View style={styles.radioButtonContainer}>
                                        <View
                                            style={[
                                                styles.radioButton,
                                                selectedWallet === wallet.id
                                                    ? { borderColor: COLORS.primary, backgroundColor: COLORS.primary }
                                                    : { borderColor: '#E5E5E5', backgroundColor: COLORS.white },
                                            ]}
                                        >
                                            {selectedWallet === wallet.id && (
                                                <View style={styles.radioButtonInner} />
                                            )}`
                                            ```
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </SafeAreaView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default SwitchWalletModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '34%',
    },
    dragHandleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E5E5',
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: isTablet ? 18 : 13,
        fontWeight: '700',
        color: COLORS.black,
    },
    walletOptionsSection: {
        gap: 12,
    },
    walletCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 0.5,
        borderColor: '#D4D4D4',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    walletIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.white,
    },
    walletTextContainer: {
        flex: 1,
    },
    walletName: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 4,
    },
    walletDescription: {
        fontSize: isTablet ? 12 : 10,
        fontWeight: '400',
        color: COLORS.greyscale600,
    },
    radioButtonContainer: {
        marginLeft: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.white,
    },
});

