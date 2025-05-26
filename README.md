# 🪙 Wallet Smart Contract

A secure Ethereum smart contract to handle Ether transfers, manage blacklisted users, track suspicious activity, and enable emergency controls.

---

## 🚀 Features

- 🔐 Owner-restricted fund transfers
- 💸 Deposit & withdraw ETH
- 🧾 Full transaction history
- 🚨 Emergency stop toggle & emergency withdrawal
- ⚠️ Blacklist system for malicious users
- 🕵️‍♂️ Suspicious activity detection via fallback
- 📢 Emit detailed events for all operations

---

## 📦 Tech Stack

- **Solidity**: ^0.8.26
- **Hardhat**: Development environment
- **Node.js**: Use LTS version (e.g., v18)  
  ⚠️ Avoid Node.js v20+ (Hardhat compatibility issues)

---

## 🧠 Contract Overview

### 🔐 Access Control

- `onlyOwner`: Only contract owner can execute
- `isEmergencyDeclared`: Prevent action if emergency is active
- `notBlackListed`: Block calls from blacklisted users
- `getSuspiciousUser`: Throttle users marked suspicious

### 📚 Core Functions

| Function | Description |
| ------- | ----------- |
| `transferToContract(_startTime)` | User deposits ETH after `_startTime` |
| `transferToUserViaContract(_to, _amount)` | Owner sends ETH to a user |
| `withdrawFromContract(_amount)` | Owner withdraws ETH |
| `receiveFromUser()` | Sends ETH to owner directly |
| `toggleStop(reason)` | Toggles emergency mode |
| `changeOwner(newOwner)` | Updates owner |
| `blacklistUser(addr)` / `removeFromBlacklist(addr)` | Manages blacklist |
| `emergencyWithdrawl()` | Withdraw all ETH during emergency |

---

### Testing (Hardhat)
```
# Install dependencies
npm install

# Compile
npx hardhat compile

# Run tests
npx hardhat test
```