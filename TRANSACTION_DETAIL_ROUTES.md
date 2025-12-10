# Transaction Detail Routes Documentation

This document provides complete information about transaction detail routes for frontend integration.

## Table of Contents
1. [Crypto Transactions](#1-crypto-transactions)
2. [Wallet/Fiat Transactions](#2-walletfiat-transactions)
3. [Gift Card Orders](#3-gift-card-orders)
4. [Bill Payments](#4-bill-payments)

---

## 1. Crypto Transactions

### List Transactions
**Route:** `GET /api/v2/crypto/transactions`

**Query Parameters:**
- `type` (optional): Filter by transaction type
  - Values: `BUY`, `SELL`, `SEND`, `RECEIVE`, `SWAP`
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```
GET /api/v2/crypto/transactions?type=BUY&limit=20&offset=0
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Crypto transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 123,
        "transactionId": "BUY-1765357258830-12-vjd7f336e",
        "transactionType": "BUY",
        "status": "successful",
        "currency": "USDT_TRON",
        "blockchain": "tron",
        "symbol": "/icons/usdt.png",
        "tradeType": "Crypto Buy",
        "cryptocurrencyType": "Tether",
        "from": "0xe5090999686896869FeJkld90",
        "to": "Your Crypto wallet",
        "amount": "0.001USDT_TRON",
        "amountUsd": "$1.00",
        "amountNaira": "NGN1500.00",
        "rate": "NGN118/$",
        "rateNgnToUsd": "118",
        "rateUsdToCrypto": "1.00",
        "txHash": "0xabc123def456...",
        "createdAt": "2025-12-10T09:00:58.838Z",
        "updatedAt": "2025-12-10T09:00:58.838Z"
      },
      {
        "id": 124,
        "transactionId": "SELL-1765357258831-12-vjd7f336f",
        "transactionType": "SELL",
        "status": "successful",
        "currency": "BTC",
        "blockchain": "bitcoin",
        "symbol": "/icons/btc.png",
        "tradeType": "Crypto Sell",
        "cryptocurrencyType": "Bitcoin",
        "from": "Your Crypto wallet",
        "to": "Tercescrow",
        "amount": "0.001BTC",
        "amountUsd": "$100.00",
        "youReceived": "NGN11800.00",
        "rate": "NGN118/$",
        "rateCryptoToUsd": "100000",
        "rateUsdToNgn": "118",
        "txHash": "0xdef456ghi789...",
        "createdAt": "2025-12-10T10:00:58.838Z",
        "updatedAt": "2025-12-10T10:00:58.838Z"
      },
      {
        "id": 125,
        "transactionId": "SEND-1765357258832-12-vjd7f336g",
        "transactionType": "SEND",
        "status": "successful",
        "currency": "ETH",
        "blockchain": "ethereum",
        "symbol": "/icons/eth.png",
        "tradeType": "Crypto Transfer",
        "cryptocurrencyType": "Ethereum",
        "from": "0x1234567890abcdef",
        "to": "0xabcdef1234567890",
        "amount": "0.1ETH",
        "amountUsd": "$250.00",
        "amountNaira": "NGN29500.00",
        "rate": "NGN118/$",
        "txHash": "0xghi789jkl012...",
        "networkFee": "0.001",
        "createdAt": "2025-12-10T11:00:58.838Z",
        "updatedAt": "2025-12-10T11:00:58.838Z"
      },
      {
        "id": 126,
        "transactionId": "RECEIVE-1765357258833-12-vjd7f336h",
        "transactionType": "RECEIVE",
        "status": "successful",
        "currency": "USDT_TRON",
        "blockchain": "tron",
        "symbol": "/icons/usdt.png",
        "tradeType": "Crypto Deposit",
        "cryptocurrencyType": "Tether",
        "from": "0x9876543210fedcba",
        "to": "Your Crypto wallet",
        "amount": "100USDT_TRON",
        "amountUsd": "$100.00",
        "amountNaira": "NGN11800.00",
        "rate": "NGN118/$",
        "txHash": "0xjkl012mno345...",
        "confirmations": 12,
        "createdAt": "2025-12-10T12:00:58.838Z",
        "updatedAt": "2025-12-10T12:00:58.838Z"
      },
      {
        "id": 127,
        "transactionId": "SWAP-1765357258834-12-vjd7f336i",
        "transactionType": "SWAP",
        "status": "successful",
        "currency": "BTC",
        "blockchain": "bitcoin",
        "symbol": "/icons/btc.png",
        "tradeType": "Crypto Swap",
        "cryptocurrencyType": "Bitcoin",
        "from": "Your Crypto wallet",
        "to": "Your Crypto wallet",
        "fromCurrency": "BTC",
        "fromBlockchain": "bitcoin",
        "fromAmount": "0.01BTC",
        "fromAmountUsd": "$1000.00",
        "toCurrency": "ETH",
        "toBlockchain": "ethereum",
        "toAmount": "2.5ETH",
        "toAmountUsd": "$1000.00",
        "gasFee": "0.0001BTC",
        "gasFeeUsd": "$10.00",
        "totalAmount": "0.0101BTC",
        "totalAmountUsd": "$1010.00",
        "txHash": "0xmno345pqr678...",
        "createdAt": "2025-12-10T13:00:58.838Z",
        "updatedAt": "2025-12-10T13:00:58.838Z"
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0,
    "isMockData": false
  }
}
```

### Get Transaction Detail
**Route:** `GET /api/v2/crypto/transactions/:transactionId`

**Path Parameters:**
- `transactionId` (required): The transaction ID from the list response (e.g., `"BUY-1765357258830-12-vjd7f336e"`)

**Example Request:**
```
GET /api/v2/crypto/transactions/BUY-1765357258830-12-vjd7f336e
```

**Sample Response:**

#### For BUY Transactions:
```json
{
  "status": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 123,
    "transactionId": "BUY-1765357258830-12-vjd7f336e",
    "transactionType": "BUY",
    "status": "successful",
    "currency": "USDT_TRON",
    "blockchain": "tron",
    "symbol": "/icons/usdt.png",
    "tradeType": "Crypto Buy",
    "cryptocurrencyType": "Tether",
    "from": "0xe5090999686896869FeJkld90",
    "to": "Your Crypto wallet",
    "amount": "0.001USDT_TRON",
    "amountUsd": "$1.00",
    "amountNaira": "NGN1500.00",
    "rate": "NGN118/$",
    "rateNgnToUsd": "118",
    "rateUsdToCrypto": "1.00",
    "txHash": "0xabc123...",
    "createdAt": "2025-12-10T09:00:58.838Z",
    "updatedAt": "2025-12-10T09:00:58.838Z"
  }
}
```

#### For SELL Transactions:
```json
{
  "status": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 124,
    "transactionId": "SELL-1765357258831-12-vjd7f336f",
    "transactionType": "SELL",
    "status": "successful",
    "currency": "BTC",
    "blockchain": "bitcoin",
    "symbol": "/icons/btc.png",
    "tradeType": "Crypto Sell",
    "cryptocurrencyType": "Bitcoin",
    "from": "Your Crypto wallet",
    "to": "Tercescrow",
    "amount": "0.001BTC",
    "amountUsd": "$100.00",
    "youReceived": "NGN11800.00",
    "rate": "NGN118/$",
    "rateCryptoToUsd": "100000",
    "rateUsdToNgn": "118",
    "txHash": "0xdef456...",
    "createdAt": "2025-12-10T10:00:58.838Z",
    "updatedAt": "2025-12-10T10:00:58.838Z"
  }
}
```

#### For SEND Transactions:
```json
{
  "status": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 125,
    "transactionId": "SEND-1765357258832-12-vjd7f336g",
    "transactionType": "SEND",
    "status": "successful",
    "currency": "ETH",
    "blockchain": "ethereum",
    "symbol": "/icons/eth.png",
    "tradeType": "Crypto Transfer",
    "cryptocurrencyType": "Ethereum",
    "from": "0x1234567890abcdef",
    "to": "0xabcdef1234567890",
    "amount": "0.1ETH",
    "amountUsd": "$250.00",
    "amountNaira": "NGN29500.00",
    "rate": "NGN118/$",
    "txHash": "0xghi789...",
    "networkFee": "0.001",
    "createdAt": "2025-12-10T11:00:58.838Z",
    "updatedAt": "2025-12-10T11:00:58.838Z"
  }
}
```

#### For RECEIVE Transactions:
```json
{
  "status": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 126,
    "transactionId": "RECEIVE-1765357258833-12-vjd7f336h",
    "transactionType": "RECEIVE",
    "status": "successful",
    "currency": "USDT_TRON",
    "blockchain": "tron",
    "symbol": "/icons/usdt.png",
    "tradeType": "Crypto Deposit",
    "cryptocurrencyType": "Tether",
    "from": "0x9876543210fedcba",
    "to": "Your Crypto wallet",
    "amount": "100USDT_TRON",
    "amountUsd": "$100.00",
    "amountNaira": "NGN11800.00",
    "rate": "NGN118/$",
    "txHash": "0xjkl012...",
    "confirmations": 12,
    "createdAt": "2025-12-10T12:00:58.838Z",
    "updatedAt": "2025-12-10T12:00:58.838Z"
  }
}
```

#### For SWAP Transactions:
```json
{
  "status": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 127,
    "transactionId": "SWAP-1765357258834-12-vjd7f336i",
    "transactionType": "SWAP",
    "status": "successful",
    "currency": "BTC",
    "blockchain": "bitcoin",
    "symbol": "/icons/btc.png",
    "tradeType": "Crypto Swap",
    "cryptocurrencyType": "Bitcoin",
    "from": "Your Crypto wallet",
    "to": "Your Crypto wallet",
    "fromCurrency": "BTC",
    "fromBlockchain": "bitcoin",
    "fromAmount": "0.01BTC",
    "fromAmountUsd": "$1000.00",
    "toCurrency": "ETH",
    "toBlockchain": "ethereum",
    "toAmount": "2.5ETH",
    "toAmountUsd": "$1000.00",
    "gasFee": "0.0001BTC",
    "gasFeeUsd": "$10.00",
    "totalAmount": "0.0101BTC",
    "totalAmountUsd": "$1010.00",
    "txHash": "0xmno345...",
    "createdAt": "2025-12-10T13:00:58.838Z",
    "updatedAt": "2025-12-10T13:00:58.838Z"
  }
}
```

**Transaction Types:**
- `BUY`: Purchase cryptocurrency
- `SELL`: Sell cryptocurrency
- `SEND`: Send cryptocurrency to another address
- `RECEIVE`: Receive cryptocurrency from another address
- `SWAP`: Swap one cryptocurrency for another

**Status Values:**
- `pending`: Transaction is pending
- `processing`: Transaction is being processed
- `successful`: Transaction completed successfully
- `failed`: Transaction failed
- `cancelled`: Transaction was cancelled

### Get Virtual Account Transactions
**Route:** `GET /api/v2/crypto/assets/:virtualAccountId/transactions`

**Path Parameters:**
- `virtualAccountId` (required): The virtual account ID (integer)

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```
GET /api/v2/crypto/assets/123/transactions?limit=20&offset=0
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Virtual account transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 123,
        "transactionId": "BUY-1765357258830-12-vjd7f336e",
        "transactionType": "BUY",
        "status": "successful",
        "currency": "USDT_TRON",
        "blockchain": "tron",
        "symbol": "/icons/usdt.png",
        "tradeType": "Crypto Buy",
        "cryptocurrencyType": "Tether",
        "from": "0xe5090999686896869FeJkld90",
        "to": "Your Crypto wallet",
        "amount": "0.001USDT_TRON",
        "amountUsd": "$1.00",
        "amountNaira": "NGN1500.00",
        "rate": "NGN118/$",
        "rateNgnToUsd": "118",
        "rateUsdToCrypto": "1.00",
        "txHash": "0xabc123def456...",
        "createdAt": "2025-12-10T09:00:58.838Z",
        "updatedAt": "2025-12-10T09:00:58.838Z"
      },
      {
        "id": 126,
        "transactionId": "RECEIVE-1765357258833-12-vjd7f336h",
        "transactionType": "RECEIVE",
        "status": "successful",
        "currency": "USDT_TRON",
        "blockchain": "tron",
        "symbol": "/icons/usdt.png",
        "tradeType": "Crypto Deposit",
        "cryptocurrencyType": "Tether",
        "from": "0x9876543210fedcba",
        "to": "Your Crypto wallet",
        "amount": "100USDT_TRON",
        "amountUsd": "$100.00",
        "amountNaira": "NGN11800.00",
        "rate": "NGN118/$",
        "txHash": "0xjkl012mno345...",
        "confirmations": 12,
        "createdAt": "2025-12-10T12:00:58.838Z",
        "updatedAt": "2025-12-10T12:00:58.838Z"
      }
    ],
    "total": 50,
    "limit": 20,
    "offset": 0,
    "isMockData": false
  }
}
```

**Note:** This route returns transactions for a specific virtual account (asset). The response structure is the same as the main crypto transactions list, but filtered to only include transactions for the specified virtual account.

---

## 2. Wallet/Fiat Transactions

### List Transactions
**Route:** `GET /api/v2/wallets/transactions`

**Query Parameters:**
- `type` (optional): Filter by transaction type
  - Values: `DEPOSIT`, `WITHDRAW`, `BILL_PAYMENT`, `TRANSFER`
  - **Note:** Omit this parameter to get all transaction types (for "All" tab)
- `currency` (optional): Filter by currency (e.g., `NGN`, `USD`)
- `status` (optional): Filter by status (e.g., `pending`, `completed`, `failed`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of transactions per page (default: 20)

**Example Requests:**
```
GET /api/v2/wallets/transactions?type=BILL_PAYMENT&page=1&limit=20
GET /api/v2/wallets/transactions?page=1&limit=20
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "uuid-123-456-789",
        "userId": 12,
        "walletId": "wallet-uuid-123",
        "type": "DEPOSIT",
        "status": "completed",
        "currency": "NGN",
        "amount": "5000.00",
        "fees": "0.00",
        "totalAmount": "5000.00",
        "balanceBefore": "0.00",
        "balanceAfter": "5000.00",
        "palmpayOrderId": null,
        "palmpayOrderNo": null,
        "palmpayStatus": null,
        "description": "Wallet deposit",
        "payeeName": null,
        "payeeBankCode": null,
        "payeeBankAccNo": null,
        "payeePhoneNo": null,
        "billType": null,
        "billProvider": null,
        "billAccount": null,
        "billAmount": null,
        "billReference": null,
        "errorMessage": null,
        "createdAt": "2025-12-10T08:00:00.000Z",
        "updatedAt": "2025-12-10T08:00:05.123Z",
        "completedAt": "2025-12-10T08:00:05.123Z",
        "wallet": {
          "id": "wallet-uuid-123",
          "currency": "NGN"
        }
      },
      {
        "id": "uuid-123-456-790",
        "userId": 12,
        "walletId": "wallet-uuid-123",
        "type": "BILL_PAYMENT",
        "status": "completed",
        "currency": "NGN",
        "amount": "1000.00",
        "fees": "0.00",
        "totalAmount": "1000.00",
        "balanceBefore": "5000.00",
        "balanceAfter": "4000.00",
        "palmpayOrderId": "order-123",
        "palmpayOrderNo": "PALM-123456",
        "palmpayStatus": "2",
        "description": "Airtime purchase - MTN",
        "payeeName": null,
        "payeeBankCode": null,
        "payeeBankAccNo": null,
        "payeePhoneNo": null,
        "billType": "airtime",
        "billProvider": "MTN",
        "billAccount": "08154462953",
        "billAmount": "1000.00",
        "billReference": "REF-123456",
        "errorMessage": null,
        "createdAt": "2025-12-10T09:00:58.838Z",
        "updatedAt": "2025-12-10T09:01:15.123Z",
        "completedAt": "2025-12-10T09:01:15.123Z",
        "wallet": {
          "id": "wallet-uuid-123",
          "currency": "NGN"
        }
      },
      {
        "id": "uuid-123-456-791",
        "userId": 12,
        "walletId": "wallet-uuid-123",
        "type": "WITHDRAW",
        "status": "completed",
        "currency": "NGN",
        "amount": "2000.00",
        "fees": "50.00",
        "totalAmount": "2050.00",
        "balanceBefore": "4000.00",
        "balanceAfter": "1950.00",
        "palmpayOrderId": "withdraw-123",
        "palmpayOrderNo": "WITHDRAW-123456",
        "palmpayStatus": "2",
        "description": "Withdrawal to bank account",
        "payeeName": "John Doe",
        "payeeBankCode": "058",
        "payeeBankAccNo": "1234567890",
        "payeePhoneNo": "08154462953",
        "billType": null,
        "billProvider": null,
        "billAccount": null,
        "billAmount": null,
        "billReference": null,
        "errorMessage": null,
        "createdAt": "2025-12-10T10:00:00.000Z",
        "updatedAt": "2025-12-10T10:00:30.456Z",
        "completedAt": "2025-12-10T10:00:30.456Z",
        "wallet": {
          "id": "wallet-uuid-123",
          "currency": "NGN"
        }
      },
      {
        "id": "uuid-123-456-792",
        "userId": 12,
        "walletId": "wallet-uuid-123",
        "type": "TRANSFER",
        "status": "completed",
        "currency": "NGN",
        "amount": "500.00",
        "fees": "0.00",
        "totalAmount": "500.00",
        "balanceBefore": "1950.00",
        "balanceAfter": "1450.00",
        "palmpayOrderId": null,
        "palmpayOrderNo": null,
        "palmpayStatus": null,
        "description": "Transfer to another wallet",
        "payeeName": null,
        "payeeBankCode": null,
        "payeeBankAccNo": null,
        "payeePhoneNo": null,
        "billType": null,
        "billProvider": null,
        "billAccount": null,
        "billAmount": null,
        "billReference": null,
        "errorMessage": null,
        "createdAt": "2025-12-10T11:00:00.000Z",
        "updatedAt": "2025-12-10T11:00:10.789Z",
        "completedAt": "2025-12-10T11:00:10.789Z",
        "wallet": {
          "id": "wallet-uuid-123",
          "currency": "NGN"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Get Transaction Detail
**Note:** There is no specific detail route for fiat transactions. Use the transaction data from the list response. The transaction `id` field (UUID) can be used to identify a specific transaction, but you'll need to fetch it from the list or store it locally.

**Transaction Types:**
- `DEPOSIT`: Money deposited into wallet
- `WITHDRAW`: Money withdrawn from wallet
- `BILL_PAYMENT`: Bill payment transaction (airtime, data, betting)
- `TRANSFER`: Transfer between wallets

**Status Values:**
- `pending`: Transaction is pending
- `processing`: Transaction is being processed
- `completed`: Transaction completed successfully
- `failed`: Transaction failed
- `cancelled`: Transaction was cancelled

---

## 3. Gift Card Orders

### List Orders
**Route:** `GET /api/v2/giftcards/orders`

**Query Parameters:**
- `status` (optional): Filter by order status
  - Values: `pending`, `processing`, `completed`, `failed`, `cancelled`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of orders per page (default: 20)

**Example Request:**
```
GET /api/v2/giftcards/orders?status=completed&page=1&limit=20
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "orderId": "order_123",
        "reloadlyOrderId": 456789,
        "reloadlyTransactionId": 123456,
        "status": "completed",
        "productName": "Amazon US $25",
        "brandName": "Amazon",
        "productImage": "https://reloadly.com/images/amazon.png",
        "faceValue": 25.00,
        "totalAmount": 22.50,
        "fees": 2.50,
        "currencyCode": "USD",
        "quantity": 1,
        "cardType": "PHYSICAL",
        "countryCode": "US",
        "paymentMethod": "wallet",
        "paymentStatus": "completed",
        "recipientEmail": "user@example.com",
        "createdAt": "2025-12-10T09:00:58.838Z",
        "updatedAt": "2025-12-10T09:01:15.123Z",
        "completedAt": "2025-12-10T09:01:15.123Z"
      },
      {
        "orderId": "order_124",
        "reloadlyOrderId": 456790,
        "reloadlyTransactionId": 123457,
        "status": "processing",
        "productName": "Steam US $50",
        "brandName": "Steam",
        "productImage": "https://reloadly.com/images/steam.png",
        "faceValue": 50.00,
        "totalAmount": 45.00,
        "fees": 5.00,
        "currencyCode": "USD",
        "quantity": 1,
        "cardType": "ECODE",
        "countryCode": "US",
        "paymentMethod": "wallet",
        "paymentStatus": "completed",
        "recipientEmail": "user@example.com",
        "createdAt": "2025-12-10T10:00:00.000Z",
        "updatedAt": "2025-12-10T10:00:30.456Z",
        "completedAt": null
      },
      {
        "orderId": "order_125",
        "reloadlyOrderId": 456791,
        "reloadlyTransactionId": 123458,
        "status": "failed",
        "productName": "iTunes US $10",
        "brandName": "iTunes",
        "productImage": "https://reloadly.com/images/itunes.png",
        "faceValue": 10.00,
        "totalAmount": 9.00,
        "fees": 1.00,
        "currencyCode": "USD",
        "quantity": 1,
        "cardType": "ECODE",
        "countryCode": "US",
        "paymentMethod": "wallet",
        "paymentStatus": "completed",
        "recipientEmail": "user@example.com",
        "createdAt": "2025-12-10T11:00:00.000Z",
        "updatedAt": "2025-12-10T11:00:15.789Z",
        "completedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### Get Order Detail
**Route:** `GET /api/v2/giftcards/orders/:orderId`

**Path Parameters:**
- `orderId` (required): The order ID from the list response (e.g., `"order_123"`)

**Example Request:**
```
GET /api/v2/giftcards/orders/order_123
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Order retrieved successfully",
  "data": {
    "orderId": "order_123",
    "reloadlyOrderId": 456789,
    "reloadlyTransactionId": 123456,
    "status": "completed",
    "productName": "Amazon US $25",
    "brandName": "Amazon",
    "productImage": "https://reloadly.com/images/amazon.png",
    "faceValue": 25.00,
    "totalAmount": 22.50,
    "fees": 2.50,
    "currencyCode": "USD",
    "quantity": 1,
    "cardType": "PHYSICAL",
    "countryCode": "US",
    "paymentMethod": "wallet",
    "paymentStatus": "completed",
    "recipientEmail": "user@example.com",
    "createdAt": "2025-12-10T09:00:58.838Z",
    "updatedAt": "2025-12-10T09:01:15.123Z",
    "completedAt": "2025-12-10T09:01:15.123Z"
  }
}
```

### Get Card Details (Code, PIN, Expiry)
**Route:** `GET /api/v2/giftcards/orders/:orderId/card-details`

**Path Parameters:**
- `orderId` (required): The order ID from the list response (e.g., `"order_123"`)

**Note:** Only available for orders with status `completed` or `processing`.

**Example Request:**
```
GET /api/v2/giftcards/orders/order_123/card-details
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Card details retrieved successfully",
  "data": {
    "orderId": "order_123",
    "cardCode": "ABC123XYZ789",
    "pin": "1234",
    "expiryDate": "2025-12-31"
  }
}
```

**Status Values:**
- `pending`: Order is pending
- `processing`: Order is being processed
- `completed`: Order completed successfully
- `failed`: Order failed
- `cancelled`: Order was cancelled

**Card Types:**
- `PHYSICAL`: Physical gift card
- `ECODE`: Digital gift card (code sent via email)

---

## 4. Bill Payments

### List Bill Payment History
**Route:** `GET /api/v2/bill-payments/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of transactions per page (default: 20)
- `sceneCode` (optional): Filter by scene code
  - Values: `airtime`, `data`, `betting`
- `billerId` (optional): Filter by biller ID (e.g., `MTN`, `GLO`, `Airtel`)
- `status` (optional): Filter by status
  - Values: `pending`, `processing`, `completed`, `failed`, `cancelled`

**Example Requests:**
```
GET /api/v2/bill-payments/history?sceneCode=airtime&page=1&limit=20
GET /api/v2/bill-payments/history?sceneCode=betting&page=1&limit=20
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Bill payment history retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "bill-payment-uuid-123",
        "transactionId": "fiat-tx-uuid-456",
        "sceneCode": "airtime",
        "billType": "airtime",
        "billerId": "MTN",
        "billerName": "MTN",
        "itemId": "5267001812",
        "itemName": "MTN Airtime",
        "rechargeAccount": "08154462953",
        "amount": "1000.00",
        "currency": "NGN",
        "status": "completed",
        "palmpayOrderId": "order-123",
        "palmpayOrderNo": "PALM-123456",
        "palmpayStatus": "2",
        "billReference": "REF-123456",
        "errorMessage": null,
        "createdAt": "2025-12-10T09:00:58.838Z",
        "updatedAt": "2025-12-10T09:01:15.123Z",
        "completedAt": "2025-12-10T09:01:15.123Z"
      },
      {
        "id": "bill-payment-uuid-124",
        "transactionId": "fiat-tx-uuid-457",
        "sceneCode": "data",
        "billType": "data",
        "billerId": "GLO",
        "billerName": "GLO",
        "itemId": "5267001813",
        "itemName": "GLO Data 2GB",
        "rechargeAccount": "08154462954",
        "amount": "500.00",
        "currency": "NGN",
        "status": "completed",
        "palmpayOrderId": "order-124",
        "palmpayOrderNo": "PALM-123457",
        "palmpayStatus": "2",
        "billReference": "REF-123457",
        "errorMessage": null,
        "createdAt": "2025-12-10T10:00:00.000Z",
        "updatedAt": "2025-12-10T10:00:20.456Z",
        "completedAt": "2025-12-10T10:00:20.456Z"
      },
      {
        "id": "bill-payment-uuid-125",
        "transactionId": "fiat-tx-uuid-458",
        "sceneCode": "betting",
        "billType": "betting",
        "billerId": "Bet9ja",
        "billerName": "Bet9ja",
        "itemId": "5267001814",
        "itemName": "Bet9ja Top-up",
        "rechargeAccount": "08154462955",
        "amount": "2000.00",
        "currency": "NGN",
        "status": "pending",
        "palmpayOrderId": "order-125",
        "palmpayOrderNo": "PALM-123458",
        "palmpayStatus": "1",
        "billReference": null,
        "errorMessage": null,
        "createdAt": "2025-12-10T11:00:00.000Z",
        "updatedAt": "2025-12-10T11:00:10.789Z",
        "completedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Get Bill Payment Detail
**Route:** `GET /api/v2/bill-payments/order-status`

**Query Parameters (Option 1 - Recommended):**
- `billPaymentId` (required): The bill payment ID from the list response (e.g., `"bill-payment-uuid-123"`)

**Query Parameters (Option 2 - Alternative):**
- `sceneCode` (required): Scene code (e.g., `airtime`, `data`, `betting`)
- `orderNo` (optional): PalmPay platform order number
- `outOrderNo` (optional): Merchant order number

**Example Requests:**
```
GET /api/v2/bill-payments/order-status?billPaymentId=bill-payment-uuid-123
GET /api/v2/bill-payments/order-status?sceneCode=airtime&orderNo=PALM-123456
```

**Sample Response:**
```json
{
  "status": 200,
  "message": "Order status retrieved successfully",
  "data": {
    "orderStatus": {
      "outOrderNo": "order-123",
      "orderNo": "PALM-123456",
      "billerId": "MTN",
      "itemId": "5267001812",
      "orderStatus": 2,
      "amount": 1000.00,
      "sceneCode": "airtime",
      "currency": "NGN",
      "completedTime": 1733821275123
    },
    "billPayment": {
      "id": "bill-payment-uuid-123",
      "status": "completed",
      "sceneCode": "airtime",
      "billType": "airtime",
      "billerId": "MTN",
      "rechargeAccount": "08154462953",
      "amount": "1000.00",
      "currency": "NGN"
    }
  }
}
```

**Scene Codes:**
- `airtime`: Airtime top-up
- `data`: Data bundle purchase
- `betting`: Betting account top-up

**Order Status Values (from PalmPay):**
- `1`: Pending
- `2`: Completed
- `3`: Failed
- `4`: Cancelled

**Status Values (Local):**
- `pending`: Transaction is pending
- `processing`: Transaction is being processed
- `completed`: Transaction completed successfully
- `failed`: Transaction failed
- `cancelled`: Transaction was cancelled

---

## Summary

### Quick Reference

| Transaction Type | List Route | Detail Route | ID Field |
|-----------------|------------|--------------|----------|
| **Crypto** | `GET /api/v2/crypto/transactions` | `GET /api/v2/crypto/transactions/:transactionId` | `transactionId` (string) |
| **Crypto (Asset)** | `GET /api/v2/crypto/assets/:virtualAccountId/transactions` | `GET /api/v2/crypto/transactions/:transactionId` | `transactionId` (string) |
| **Wallet/Fiat** | `GET /api/v2/wallets/transactions` | Use list data (no separate detail route) | `id` (UUID) |
| **Gift Cards** | `GET /api/v2/giftcards/orders` | `GET /api/v2/giftcards/orders/:orderId` | `orderId` (string) |
| **Bill Payments** | `GET /api/v2/bill-payments/history` | `GET /api/v2/bill-payments/order-status?billPaymentId=xxx` | `id` (UUID) or `billPaymentId` |

### Transaction Type Filters

**Crypto Transactions:**
- `BUY` - Purchase cryptocurrency
- `SELL` - Sell cryptocurrency
- `SEND` - Send cryptocurrency
- `RECEIVE` - Receive cryptocurrency
- `SWAP` - Swap cryptocurrencies

**Wallet/Fiat Transactions:**
- `DEPOSIT` - Deposit money
- `WITHDRAW` - Withdraw money
- `BILL_PAYMENT` - Bill payment
- `TRANSFER` - Transfer between wallets

**Bill Payment Scene Codes:**
- `airtime` - Airtime top-up
- `data` - Data bundle purchase
- `betting` - Betting account top-up

### Common Status Values

All transaction types use similar status values:
- `pending` - Transaction is pending
- `processing` - Transaction is being processed
- `completed` - Transaction completed successfully
- `failed` - Transaction failed
- `cancelled` - Transaction was cancelled

---

## Frontend Integration Notes

1. **Crypto Transactions:**
   - Use `transactionId` from the list response to fetch detail
   - Different transaction types (BUY, SELL, SEND, RECEIVE, SWAP) have different response structures
   - Check `transactionType` field to determine which fields are available

2. **Wallet/Fiat Transactions:**
   - No separate detail route exists
   - Use the full transaction object from the list response
   - Filter by `type` parameter: `DEPOSIT`, `WITHDRAW`, `BILL_PAYMENT`, `TRANSFER`
   - For "All" tab, omit the `type` parameter

3. **Gift Card Orders:**
   - Use `orderId` from the list response to fetch detail
   - For completed orders, fetch card details using `/card-details` endpoint
   - Check `cardType` to determine if PIN is required

4. **Bill Payments:**
   - Use `id` (billPaymentId) from the list response to fetch detail
   - Alternative: Use `orderNo` or `outOrderNo` with `sceneCode`
   - Status updates are fetched from PalmPay, so the detail endpoint also updates local status

5. **Tab Filtering Implementation:**

   **For Wallet Transactions Tabs:**
   - **Gift Cards tab**: 
     - Use `GET /api/v2/giftcards/orders` (separate endpoint, not wallet transactions)
     - Gift cards are NOT part of wallet transactions endpoint
   - **Bill Payments tab**: 
     - Use `GET /api/v2/wallets/transactions?type=BILL_PAYMENT` 
     - OR use `GET /api/v2/bill-payments/history` for more detailed bill payment data
     - **Note:** Use `type=BILL_PAYMENT` (uppercase, underscore), NOT `type=bill`
   - **Wallet/All tab**: 
     - Use `GET /api/v2/wallets/transactions` (omit `type` parameter to get all wallet transaction types: DEPOSIT, WITHDRAW, BILL_PAYMENT, TRANSFER)

   **For Crypto Transactions Tabs:**
   - **Crypto tab**: 
     - Use `GET /api/v2/crypto/transactions` 
     - Optionally filter by `type`: `BUY`, `SELL`, `SEND`, `RECEIVE`, `SWAP`
   - **All tab (crypto)**: 
     - Use `GET /api/v2/crypto/transactions` (omit `type` parameter to get all crypto transaction types)

**Important Notes:**
- Gift cards are **NOT** part of wallet transactions. They have a separate endpoint: `/api/v2/giftcards/orders`
- For bill payments in wallet transactions, use `type=BILL_PAYMENT` (uppercase with underscore), NOT `type=bill` or `type=BILL`
- Valid wallet transaction types: `DEPOSIT`, `WITHDRAW`, `BILL_PAYMENT`, `TRANSFER`
- Valid crypto transaction types: `BUY`, `SELL`, `SEND`, `RECEIVE`, `SWAP`
- All type parameters are case-sensitive and should match exactly as shown above

