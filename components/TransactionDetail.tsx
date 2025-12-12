import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from 'expo-clipboard';
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

interface TransactionDetailProps {
  transaction: {
    id?: string | number;
    transactionId?: string | number; // For crypto transactions
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
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyTransactionId = async (transactionIdToCopy?: string | number) => {
    try {
      // Get the transaction ID - prefer transactionId for crypto, fallback to id
      const idToCopy = transactionIdToCopy || transaction.transactionId || transaction.id;
      // Ensure it's a string for clipboard
      const idString = idToCopy ? String(idToCopy) : '';
      if (!idString) {
        Alert.alert("Error", "Transaction ID not available");
        return;
      }
      await Clipboard.setStringAsync(idString);
      Alert.alert("Copied", "Transaction ID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      Alert.alert("Error", "Failed to copy transaction ID");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "successful":
      case "success":
        return COLORS.green;
      case "pending":
        return COLORS.warning || "#FFA500";
      case "failed":
      case "declined":
      case "unsuccessful":
        return COLORS.red || "#FF0000";
      default:
        return COLORS.greyscale500;
    }
  };

  const renderDetailRow = (label: string, value: string | number | null | undefined, showCopy?: boolean, copyValue?: string | number) => {
    if (value === null || value === undefined || value === "") return null;
    
    const valueString = String(value);
    
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
            {valueString}
          </Text>
          {showCopy && (
            <TouchableOpacity 
              onPress={() => handleCopyTransactionId(copyValue || value)} 
              style={styles.copyButton}
            >
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

  // Determine amount to display and format with + sign for positive amounts
  const rawAmount = transaction.youReceived || transaction.amountNaira || transaction.amountUsd || transaction.amount || "N/A";
  // Determine if this is a credit (positive) transaction
  // Credits: BUY (receiving crypto), RECEIVE, DEPOSIT, rewards, etc.
  // Debits: SELL (selling crypto), WITHDRAW, etc.
  const isCredit = transaction.transactionType === "BUY" || 
                   transaction.transactionType === "RECEIVE" || 
                   transaction.transactionType === "DEPOSIT" ||
                   transaction.tradeType?.toLowerCase().includes("reward") ||
                   transaction.tradeType?.toLowerCase().includes("referral");
  
  // Format amount with + sign for credits
  const displayAmount = rawAmount !== "N/A" && isCredit && !rawAmount.startsWith("+") && !rawAmount.startsWith("-")
    ? `+${rawAmount}`
    : rawAmount;
  
  // Get transaction ID - prefer transactionId for crypto, fallback to id
  const transactionId = transaction.transactionId || transaction.id;
  const transactionIdString = transactionId ? String(transactionId) : "N/A";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon Section - Large green circle with white checkmark */}
      <View style={styles.successIconContainer}>
        <View style={[styles.successCircle, { backgroundColor: isSuccessful ? COLORS.green : COLORS.warning || "#FFA500" }]}>
          <Image
            source={icons.tickMarked}
            style={[styles.successIcon, { tintColor: COLORS.white }]}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.amountSection}>
        <Text style={[styles.amountText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          {displayAmount}
        </Text>
        <Text style={[styles.dateText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      {/* Transaction Summary Section - Grey rectangular section */}
      <View style={[styles.summaryCard, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.grayscale100 }]}>
        {transaction.from && renderDetailRow("Sender's Details", transaction.from)}
        {transaction.youReceived && renderDetailRow("Amount Received", transaction.youReceived)}
        {!transaction.youReceived && transaction.amountNaira && renderDetailRow("Amount Received", transaction.amountNaira)}
        {!transaction.youReceived && !transaction.amountNaira && transaction.amountUsd && renderDetailRow("Amount Received", transaction.amountUsd)}
        {transactionIdString !== "N/A" && renderDetailRow("Transaction ID", transactionIdString, true, transactionId)}
        {renderDetailRow("Transaction Type", transaction.tradeType || transaction.transactionType || "Transaction")}
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
        {(transaction as any).description && renderDetailRow("Description", (transaction as any).description)}
        {(transaction as any).fees && parseFloat((transaction as any).fees) > 0 && renderDetailRow("Fees", `${(transaction as any).currency || ''} ${(transaction as any).fees}`)}
        {(transaction as any).balanceBefore && renderDetailRow("Balance Before", `${(transaction as any).currency || ''} ${(transaction as any).balanceBefore}`)}
        {(transaction as any).balanceAfter && renderDetailRow("Balance After", `${(transaction as any).currency || ''} ${(transaction as any).balanceAfter}`)}
        {(transaction as any).payeeName && renderDetailRow("Payee Name", (transaction as any).payeeName)}
        {(transaction as any).payeeBankCode && renderDetailRow("Bank Code", (transaction as any).payeeBankCode)}
        {(transaction as any).payeeBankAccNo && renderDetailRow("Account Number", (transaction as any).payeeBankAccNo)}
        {(transaction as any).payeePhoneNo && renderDetailRow("Phone Number", (transaction as any).payeePhoneNo)}
        {(transaction as any).billType && renderDetailRow("Bill Type", (transaction as any).billType)}
        {(transaction as any).billProvider && renderDetailRow("Bill Provider", (transaction as any).billProvider)}
        {(transaction as any).billAccount && renderDetailRow("Bill Account", (transaction as any).billAccount)}
        {(transaction as any).billReference && renderDetailRow("Bill Reference", (transaction as any).billReference)}
        {(transaction as any).errorMessage && renderDetailRow("Error Message", (transaction as any).errorMessage)}
      </View>

      {/* Footer Section */}
      {/* <View style={styles.footerSection}>
        <Text style={[styles.footerText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          Issue with this transaction?
        </Text>
        <TouchableOpacity>
          <Text style={styles.reportLink}>Report transaction</Text>
        </TouchableOpacity>
      </View> */}
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
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    width: 60,
    height: 60,
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
    width: "100%",
  },
  footerText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "400",
    marginBottom: 4,
    textAlign: "center",
  },
  reportLink: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    color: COLORS.green,
  },
});

