# **XRPL Token Management and Lending System**

## **Overview**
This project is a blockchain-based token management and lending system built on the **XRPL (XRP Ledger)**. It enables users to:
- Mint custom tokens (e.g., CST).
- Establish trust lines for token transactions.
- Deposit and withdraw tokens.
- Transfer tokens between accounts.
- Check account balances for tokens.

The project leverages XRPL's robust payment infrastructure to create a decentralized, low-cost solution for token issuance and management.

---

## **Features**
- **Token Minting**: Issue custom tokens from an issuer account.
- **Trust Line Management**: Establish trust lines between accounts to allow token transactions.
- **Token Deposits**: Deposit tokens to a receiving account and update balances.
- **Token Withdrawals**: Withdraw tokens from a receiving account and update balances.
- **Token Transfers**: Transfer tokens between accounts.
- **Balance Query**: Check the token balance for a specific account.

---

## **Technologies Used**
- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building APIs.
- **XRPL.js**: XRP Ledger client library for blockchain interactions.
- **dotenv**: Manage environment variables securely.

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd xrpl-lending
