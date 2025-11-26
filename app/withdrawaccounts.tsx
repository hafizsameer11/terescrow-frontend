import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy accounts data
const accountsData = [
    {
        id: '1',
        accountName: 'Qmardeen Malik',
        accountNumber: '1239584226',
        bankName: 'Access Bank',
        isDefault: true,
    },
    {
        id: '2',
        accountName: 'Qmardeen Malik',
        accountNumber: '1239584226',
        bankName: 'Access Bank',
        isDefault: false,
    },
    {
        id: '3',
        accountName: 'Qmardeen Malik',
        accountNumber: '1239584226',
        bankName: 'Access Bank',
        isDefault: false,
    },
];

const WithdrawAccounts = () => {
    const { dark } = useTheme();
    const router = useRouter();
    const { navigate } = useNavigation<NavigationProp<any>>();
    const [accounts, setAccounts] = useState(accountsData);
    const [defaultAccountId, setDefaultAccountId] = useState('1');

    const handleSetDefault = (accountId: string) => {
        setDefaultAccountId(accountId);
        setAccounts(accounts.map(acc => ({
            ...acc,
            isDefault: acc.id === accountId,
        })));
    };

    const handleCopyAccountNumber = async (accountNumber: string) => {
        await Clipboard.setStringAsync(accountNumber);
        Alert.alert('Copied', 'Account number copied to clipboard');
    };

    const handleEdit = (accountId: string) => {
        const account = accounts.find(acc => acc.id === accountId);
        navigate('addwithdrawaccount', {
            accountId: accountId,
            accountName: account?.accountName,
            accountNumber: account?.accountNumber,
            bankName: account?.bankName,
            isEdit: true,
        });
    };

    const handleDelete = (accountId: string) => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete this account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (accounts.find(acc => acc.id === accountId)?.isDefault && accounts.length > 1) {
                            // If deleting default, set first remaining as default
                            const remaining = accounts.filter(acc => acc.id !== accountId);
                            if (remaining.length > 0) {
                                setDefaultAccountId(remaining[0].id);
                                setAccounts(remaining.map((acc, index) => ({
                                    ...acc,
                                    isDefault: index === 0,
                                })));
                            }
                        } else {
                            setAccounts(accounts.filter(acc => acc.id !== accountId));
                        }
                    },
                },
            ]
        );
    };

    const handleAddNew = () => {
        navigate('addwithdrawaccount', { isEdit: false });
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
            ]}
            edges={['top']}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Image
                        source={icons.arrowBack}
                        style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                    Accounts
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {accounts.map((account) => (
                    <View key={account.id} style={styles.accountRow}>
                        {/* Radio Button - Separate on the left */}
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => handleSetDefault(account.id)}
                        >
                            <View
                                style={[
                                    styles.radioCircle,
                                    account.isDefault && styles.radioCircleFilled,
                                ]}
                            >
                                {account.isDefault && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        {/* Account Card */}
                        <View
                            style={[
                                styles.accountCard,
                                account.isDefault
                                    ? { backgroundColor: '#E8F8F3' }
                                    : dark
                                        ? { backgroundColor: COLORS.dark2, borderWidth: 1, borderColor: '#E5E5E5' }
                                        : { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5E5E5' },
                            ]}
                        >
                            {/* Account Details */}
                            <View style={styles.accountDetails}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text
                                        style={[
                                            styles.accountLabel,
                                            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                                        ]}
                                    >
                                        Account name:
                                    </Text>
                                    <Text style={[styles.accountValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>{account.accountName}</Text>
                                </View>
                                <View style={styles.accountNumberRow}>
                                    <Text
                                        style={[
                                            styles.accountLabel,
                                            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                                        ]}
                                    >
                                        Account number:
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.accountValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>{account.accountNumber}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleCopyAccountNumber(account.accountNumber)}
                                            style={styles.copyButton}
                                        >
                                            <Image
                                                source={images.copy}
                                                style={styles.copyIcon}
                                                contentFit="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text
                                    style={[
                                        styles.accountLabel,
                                        dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                                    ]}
                                >
                                    Bank name:
                                </Text>
                                <Text style={[styles.accountValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>{account.bankName}</Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        onPress={() => handleEdit(account.id)}
                                        style={styles.actionButton}
                                    >
                                        <Image
                                            source={images.vector47}
                                            style={styles.actionIcon}
                                            contentFit="contain"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(account.id)}
                                        style={styles.actionButton}
                                    >
                                        <Image
                                            source={images.vector48}
                                            style={styles.actionIcon}
                                            contentFit="contain"
                                        />
                                    </TouchableOpacity>
                                    {account.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>Default</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add New Button */}
            <TouchableOpacity
                style={styles.addNewButton}
                onPress={handleAddNew}
            >
                <Text style={styles.addNewButtonText}>Add New</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default WithdrawAccounts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        fontSize: isTablet ? 20 : 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    radioButton: {
        marginRight: 12,
        justifyContent: 'flex-start',
        paddingTop: 8,
    },
    accountCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#147341',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleFilled: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.white,
    },
    accountDetails: {
        flex: 1,
    },
    accountLabel: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '400',
        marginBottom: 8,
    },
    accountValue: {
        fontWeight: '600',
    },
    accountNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    copyButton: {
        marginLeft: 8,
        padding: 4,
    },
    copyIcon: {
        width: 16,
        height: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    actionIcon: {
        width: 20,
        height: 20,
    },
    defaultBadge: {
        backgroundColor: '#92F2BF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 'auto',
    },
    defaultBadgeText: {
        color: '#147341',
        fontSize: isTablet ? 14 : 12,
        fontWeight: '400',
    },
    addNewButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 100,
    },
    addNewButtonText: {
        color: COLORS.white,
        fontSize: isTablet ? 18 : 16,
        fontWeight: '700',
    },
});

