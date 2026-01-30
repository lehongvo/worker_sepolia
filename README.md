# Lotus Test Proxy - Hardhat Project

Dự án Hardhat với upgradeable ERC20 Token contract sử dụng OpenZeppelin.

## Yêu cầu

- Node.js v22.x (sử dụng nvm)
- Yarn v1.22.x
- Sepolia testnet ETH (lấy từ [faucet](https://sepoliafaucet.com/))

## Cài đặt

```bash
# Sử dụng Node.js 22
nvm use 22

# Cài đặt dependencies
yarn install

# Copy file .env.example và điền thông tin
cp .env.example .env
```

## Cấu hình Environment Variables

Tạo file `.env` và điền các thông tin sau:

```env
# Token Configuration
TOKEN_NAME=YourTokenName
TOKEN_SYMBOL=YTK

# Network Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Etherscan API Key (để verify contract)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Lấy thông tin cần thiết:

1. **Private Key**: Export từ MetaMask (Settings > Security & Privacy > Show Private Key)
2. **Sepolia RPC URL**: 
   - Tạo app miễn phí tại [Alchemy](https://www.alchemy.com/) hoặc [Infura](https://infura.io/)
   - Copy Sepolia RPC endpoint
3. **Etherscan API Key**: Đăng ký miễn phí tại [Etherscan](https://etherscan.io/myapikey)

## Các lệnh cơ bản

```bash
# Kiểm tra cấu hình .env
yarn check

# Compile contracts
yarn compile

# Run tests
yarn test

# Deploy lên Localhost (testing)
yarn deploy:local

# Deploy lên Sepolia (tự động verify)
yarn deploy:sepolia

# Clean artifacts và cache
yarn clean
```

### Hoặc dùng npx:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat clean
```

## Deploy lên Sepolia

```bash
# 1. Kiểm tra cấu hình trước
yarn check

# 2. Đảm bảo đã có SepoliaETH trong wallet
# 3. Chạy lệnh deploy:
yarn deploy:sepolia

# Hoặc dùng npx:
npx hardhat run scripts/deploy.js --network sepolia
```

Deploy script sẽ tự động:
- ✅ Deploy Proxy và Implementation contracts
- ✅ Initialize token với name và symbol từ .env
- ✅ Verify contracts trên Etherscan
- ✅ Hiển thị các địa chỉ contract và links

## Smart Contract: TestToken

Contract `TestToken` là một upgradeable ERC20 token với các tính năng:

### Đặc điểm chính:
- ✅ **Upgradeable**: Sử dụng OpenZeppelin Upgrades plugin
- ✅ **ERC20 Standard**: Token chuẩn với name/symbol từ .env
- ✅ **Ownable**: Chỉ owner mới có quyền mint tokens
- ✅ **Initial Supply**: 1 tỷ tokens được mint khi khởi tạo
- ✅ **Proxy Pattern**: Deploy qua TransparentUpgradeableProxy

### Functions:
- `initialize(name, symbol, recipient, owner)` - Khởi tạo token (chỉ gọi 1 lần)
- `mint(to, amount)` - Mint thêm tokens (onlyOwner)
- Standard ERC20: `transfer`, `balanceOf`, `approve`, `transferFrom`, etc.

## Cấu trúc thư mục

```
lotus_test_proxy/
├── contracts/
│   └── Token.sol              # Upgradeable ERC20 Token
├── scripts/
│   └── deploy.js              # Deploy + Verify script
├── test/
│   └── Token.js               # Tests cho Token contract
├── .env                       # Environment variables (gitignored)
├── .env.example               # Template cho .env
├── hardhat.config.js          # Cấu hình Hardhat + Networks
├── package.json               # Dependencies
└── README.md                  # File này
```

## Deploy Output Example

```
=== Token Configuration ===
Name: MyToken
Symbol: MTK

Deploying proxy...

=== Deployment Successful ===
Proxy Address: 0x1234...
Implementation Address: 0x5678...
Admin Address: 0x9abc...

=== Token Details ===
Name: MyToken
Symbol: MTK
Total Supply: 1000000000.0 MTK

=== Verifying Contracts on Etherscan ===
✅ Implementation verified!
✅ Proxy verified!

View on Etherscan:
Proxy: https://sepolia.etherscan.io/address/0x1234...
Implementation: https://sepolia.etherscan.io/address/0x5678...
```

## Upgrade Contract

Để upgrade contract sau này:

```javascript
const TestTokenV2 = await ethers.getContractFactory("TestTokenV2");
const upgraded = await upgrades.upgradeProxy(proxyAddress, TestTokenV2);
console.log("Upgraded to:", await upgraded.getAddress());
```

## Verify Contract thủ công (nếu cần)

```bash
# Verify Implementation
npx hardhat verify --network sepolia IMPLEMENTATION_ADDRESS

# Verify Proxy (thường tự động)
npx hardhat verify --network sepolia PROXY_ADDRESS
```

## Công nghệ sử dụng

- Hardhat v2.28.4
- Solidity ^0.8.28
- Ethers.js v6.16.0
- OpenZeppelin Contracts v5.4.0
- OpenZeppelin Contracts Upgradeable v5.4.0
- OpenZeppelin Hardhat Upgrades v3.9.1
- Hardhat Verify v3.0.8
- dotenv v17.2.3

## Security Notes

- ⚠️ **KHÔNG** commit file `.env` lên git
- ⚠️ **KHÔNG** share private key với ai
- Constructor có `_disableInitializers()` để ngăn implementation contract bị khởi tạo
- Sử dụng `initializer` modifier để đảm bảo initialize chỉ gọi 1 lần
- Owner có quyền mint unlimited tokens - cần thận trọng trong production

## Troubleshooting

**Lỗi: "insufficient funds for intrinsic transaction cost"**
- Cần thêm SepoliaETH vào wallet từ faucet

**Lỗi: "Invalid API Key"**
- Kiểm tra ETHERSCAN_API_KEY trong file .env

**Lỗi: "Already Verified"**
- Contract đã được verify rồi, không cần verify lại

## Links hữu ích

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
# worker_sepolia
