import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    Pressable,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getWalletOverview, getCryptoAssets } from '@/utils/queries/accountQueries';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const WALLET_STORAGE_KEY = 'selectedWallet';

const SwitchWalletModal = () => {
    const { dark } = useTheme();
    const router = useRouter();
    const { token } = useAuth();
    const [selectedWallet, setSelectedWallet] = useState<string>('naira');

    // Load saved wallet selection
    useEffect(() => {
        const loadWalletSelection = async () => {
            try {
                const saved = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
                if (saved) {
                    setSelectedWallet(saved);
                }
            } catch (error) {
                console.log('Error loading wallet selection:', error);
            }
        };
        loadWalletSelection();
    }, []);

    // Fetch wallet overview (fiat balance)
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['walletOverview'],
        queryFn: () => getWalletOverview(token),
        enabled: !!token,
    });

    // Fetch crypto assets
    const { data: cryptoAssetsData, isLoading: cryptoLoading } = useQuery({
        queryKey: ['cryptoAssets'],
        queryFn: () => getCryptoAssets(token),
        enabled: !!token,
    });

    const nairaBalance = walletData?.data?.totalBalance || 0;
    const currency = walletData?.data?.currency || 'NGN';
    const cryptoTotalUsd = parseFloat(cryptoAssetsData?.data?.totals?.totalUsd || '0');
    const cryptoTotalNairaRaw = parseFloat(cryptoAssetsData?.data?.totals?.totalNaira || '0');
    // If cryptoTotalNaira is 0 or not available, calculate from USD (assuming 1 USD = 1500 NGN)
    const cryptoTotalNaira = cryptoTotalNairaRaw > 0 ? cryptoTotalNairaRaw : (cryptoTotalUsd * 1500);

    const formatBalance = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleSelect = async (walletId: string) => {
        setSelectedWallet(walletId);
        // Save wallet selection
        try {
            await AsyncStorage.setItem(WALLET_STORAGE_KEY, walletId);
        } catch (error) {
            console.log('Error saving wallet selection:', error);
        }
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
                        edges={['top', 'bottom']}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                                    Switch Wallet
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    style={[
                                        styles.closeButton,
                                        dark ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                                    ]}
                                >
                                    <Text style={[
                                        styles.closeIconText,
                                        { color: dark ? COLORS.white : COLORS.black }
                                    ]}>
                                        ×
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
                                        {walletLoading || cryptoLoading ? (
                                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 4 }} />
                                        ) : (
                                            <View style={styles.balanceContainer}>
                                                {wallet.id === 'crypto' ? (
                                                    <>
                                                        <Text style={[styles.balanceMain, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                                                            ${formatBalance(cryptoTotalUsd)}
                                                        </Text>
                                                        <Text style={[styles.balanceSecondary, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                                                            ≈ N{formatBalance(cryptoTotalNaira)}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text style={[styles.balanceMain, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                                                            {currency} {formatBalance(nairaBalance)}
                                                        </Text>
                                                        <Text style={[styles.balanceSecondary, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                                                            ≈ ${formatBalance(nairaBalance / 1500)}
                                                        </Text>
                                                    </>
                                                )}
                                            </View>
                                        )}
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
                                            )}
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
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
        maxHeight: '60%',
        minHeight: 200,
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
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: isTablet ? 18 : 13,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        marginLeft: 'auto',
        borderRadius: 20,
        width: isTablet ? 40 : 36,
        height: isTablet ? 40 : 36,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
    },
    closeIconText: {
        fontSize: isTablet ? 32 : 28,
        fontWeight: '300',
        lineHeight: isTablet ? 40 : 36,
        textAlign: 'center',
        includeFontPadding: false,
        height: isTablet ? 40 : 36,
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
    balanceContainer: {
        marginTop: 4,
    },
    balanceMain: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    balanceSecondary: {
        fontSize: isTablet ? 12 : 10,
        fontWeight: '400',
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

