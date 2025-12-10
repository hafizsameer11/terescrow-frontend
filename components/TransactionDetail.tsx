import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from 'expo-clipboard';
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

interface TransactionDetailProps {
  transaction: {
    id: string;
    transactionType?: string;
    status?: string;
    currency?: string;
    blockchain?: string;
    createdAt?: string;
    updatedAt?: string;
    tradeType?: string;
    cryptocurrencyType?: string;
    from?: string;
    to?: string;
    amount?: string;
    amountUsd?: string;
    amountNaira?: string;
    youReceived?: string;
    rate?: string | null;
    txHash?: string | null;
    // For SWAP transactions
    fromCurrency?: string;
    toCurrency?: string;
    fromAmount?: string;
    toAmount?: string;
    fromAmountUsd?: string;
    toAmountUsd?: string;
    gasFee?: string;
    gasFeeUsd?: string;
    totalAmount?: string;
    totalAmountUsd?: string;
  };
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
  const { dark } = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyTransactionId = async () => {
    try {
      await Clipboard.setStringAsync(transaction.id);
      Alert.alert("Copied", "Transaction ID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "successful":
      case "success":
        return COLORS.green;
      case "pending":
        return COLORS.orange || "#FFA500";
      case "failed":
      case "declined":
      case "unsuccessful":
        return COLORS.red || "#FF0000";
      default:
        return COLORS.greyscale500;
    }
  };

  const renderDetailRow = (label: string, value: string | null | undefined, showCopy?: boolean) => {
    if (value === null || value === undefined || value === "") return null;
    
    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          {label}
        </Text>
        <View style={styles.detailValueContainer}>
          <Text
            style={[
              styles.detailValue,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {value}
          </Text>
          {showCopy && (
            <TouchableOpacity onPress={handleCopyTransactionId} style={styles.copyButton}>
              <Image source={icons.copy} style={styles.copyIcon} contentFit="contain" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const transactionType = transaction.transactionType || transaction.tradeType || "Transaction";
  const isSwap = transactionType === "SWAP" || transaction.transactionType === "SWAP";
  const isSuccessful = transaction.status?.toLowerCase() === "successful" || transaction.status?.toLowerCase() === "success";

  // Determine amount to display
  const displayAmount = transaction.youReceived || transaction.amountNaira || transaction.amountUsd || transaction.amount || "N/A";
  const isDebit = transaction.transactionType === "SELL" || transaction.transactionType === "BUY";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon Section */}
      <View style={styles.successIconContainer}>
        <View style={[styles.successCircle, { backgroundColor: isSuccessful ? "#E8F8F3" : "#FFF4E6" }]}>
          <Image
            source={icons.tickMarked}
            style={[styles.successIcon, { tintColor: isSuccessful ? COLORS.green : COLORS.orange }]}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.amountSection}>
        <Text style={[styles.amountText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          {isDebit && transaction.transactionType === "SELL" ? "" : "-"}{displayAmount}
        </Text>
        <Text style={[styles.dateText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      {/* Transaction Summary Section */}
      <View style={[styles.summaryCard, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.grayscale100 }]}>
        {transaction.from && renderDetailRow("Sender's Details", transaction.from)}
        {transaction.youReceived && renderDetailRow("Amount Received", transaction.youReceived)}
        {!transaction.youReceived && transaction.amountNaira && renderDetailRow("Amount Received", transaction.amountNaira)}
        {!transaction.youReceived && !transaction.amountNaira && transaction.amountUsd && renderDetailRow("Amount Received", transaction.amountUsd)}
        {renderDetailRow("Transaction ID", transaction.id, true)}
        {renderDetailRow("Transaction Type", transaction.tradeType || transaction.transactionType)}
        {renderDetailRow("Transaction Status", transaction.status?.toUpperCase() || "PENDING")}
      </View>

      {/* Account/Wallet Details Section */}
      <View style={[styles.accountCard, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.grayscale100 }]}>
        {transaction.to && renderDetailRow("Account Name", transaction.to)}
        {transaction.cryptocurrencyType && renderDetailRow("Currency", transaction.cryptocurrencyType)}
        {transaction.blockchain && renderDetailRow("Blockchain", transaction.blockchain)}
        {transaction.currency && !transaction.cryptocurrencyType && renderDetailRow("Currency", transaction.currency)}
        {transaction.rate && renderDetailRow("Rate", transaction.rate)}
        {transaction.txHash && renderDetailRow("Transaction Hash", transaction.txHash)}
      </View>

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <Text style={[styles.footerText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          Issue with this transaction?
        </Text>
        <TouchableOpacity>
          <Text style={styles.reportLink}>Report transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TransactionDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  successIconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    width: 50,
    height: 50,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  amountText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  dateText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "400",
  },
  summaryCard: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  accountCard: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyscale300,
  },
  detailLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "500",
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  detailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "400",
    textAlign: "right",
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.greyscale600,
  },
  footerSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "400",
    marginBottom: 8,
  },
  reportLink: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    color: COLORS.green,
  },
});

