# 🎯 Cách Update Token Info trên Sepolia Testnet

## ✅ Phát hiện quan trọng:

**Update Token Info button CÓ SẴN trên Sepolia testnet!** Nhưng bạn phải **verify address ownership** trước.

---

## 📋 Quy Trình Hoàn Chỉnh

### Bước 1: Tạo/Login Etherscan Account

1. Vào https://sepolia.etherscan.io/
2. Click **Sign In** (góc trên bên phải)
3. Nếu chưa có account: Click **"Don't have an account? Click to Sign Up"**
4. Điền thông tin và verify email

---

### Bước 2: Verify Address Ownership (CHỈ LÀM 1 LẦN)

**⚠️ Bước quan trọng nhất! Nếu không làm bước này, sẽ không thấy "Update Token Info" button.**

#### 2.1. Vào Verified Address Page

1. **Login** vào Etherscan account
2. **Hover** chuột lên username (góc trên bên phải)
3. Click **"Verified Address"** trong dropdown menu

#### 2.2. Add Your Contract Address

1. Click button **"Add Address"** (góc trên bên phải)
2. Paste contract address của bạn: `0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a`
3. Click **"Continue"**

#### 2.3. Sign Message với MetaMask (Recommended)

**Option A: Sign with Web3 (MetaMask) - RECOMMENDED**

1. Click **"Connect to Web3"**
2. MetaMask popup sẽ mở → Click **"Connect"**
3. Chọn account deployer của bạn: `0x0ef303a549722d0DDe364c430512E10C907cD510`
4. Review message và click **"Sign"** trong MetaMask
5. Sau khi sign xong, click **"Click to Proceed"** trên Etherscan
6. Click **"Verify Ownership"**
7. ✅ Done! Bạn sẽ thấy confirmation page

**Option B: Sign Manually (Alternative)**

1. Click **"Sign Message Manually"**
2. Copy message template
3. Vào https://app.mycrypto.com/sign-message
4. Connect wallet và sign message
5. Copy signature hash
6. Paste vào Etherscan và verify

---

### Bước 3: Update Token Information

Sau khi verify ownership xong:

#### 3.1. Navigate to Update Form

**Method 1: From Verified Address Page**
1. Vào **Verified Address** page (như bước 2.1)
2. Bạn sẽ thấy contract address đã được list
3. Click **"Update Token Information"**

**Method 2: From Token Page**
1. Vào token page: https://sepolia.etherscan.io/token/0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a
2. Click vào token ticker (ticker hiện tại: **MTK**)
3. Click **"More"** → **"Update Token Info"**

#### 3.2. Fill Token Update Form

1. **Request Type:** Chọn **"Existing Token Info Update"** (vì bạn đã update trước đó)

2. **Token Details:**
   - **Token Name:** `LEVO`
   - **Token Symbol:** `VL`
   - **Description:** (Update nếu cần)
   - **Official Site:** (Update nếu cần)
   - **Official Email:** (Update nếu cần)

3. **Update Reason (Comments):**
   ```
   Token has been upgraded to V2 which includes updatable name and symbol functionality.
   
   Name and symbol have been updated on-chain:
   - Old Name: testToken → New Name: LEVO
   - Old Symbol: MTK → New Symbol: VL
   
   Upgrade Transaction: 0x04c98f29ede154617652feff8c9acf6feadb9369c287d7cb1a5b9368bddf4dac
   Block Number: 10154438
   
   You can verify the on-chain values by calling name() and symbol() functions:
   https://sepolia.etherscan.io/address/0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a#readProxyContract
   ```

4. Click **"Submit"**

#### 3.3. Wait for Approval

- Etherscan team sẽ review submission
- Thời gian: **1-3 business days**
- Bạn sẽ nhận email khi được approve

---

## 🔍 Verify On-Chain Data Ngay Bây Giờ

Trong khi đợi Etherscan approve, bạn có thể verify on-chain data:

### Method 1: Using Script (Fastest)

```bash
yarn verify:token
```

Output:
```
📊 On-Chain Data (Direct from Blockchain):
Name: LEVO ✅
Symbol: VL ✅
Version: 2.0.0 ✅
```

### Method 2: Manual Verification on Etherscan

1. Vào proxy contract: https://sepolia.etherscan.io/address/0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a
2. Click tab **"Contract"**
3. Click **"Read as Proxy"**
4. Gọi các functions:
   - Call `name()` → Returns: **LEVO** ✅
   - Call `symbol()` → Returns: **VL** ✅
   - Call `version()` → Returns: **2.0.0** ✅

---

## ⚠️ Quan Trọng

### Tại Sao Cần Verify Ownership?

- **Security:** Chỉ owner mới có thể update token info
- **Prevent Hijacking:** Ngăn người khác thay đổi thông tin token của bạn
- **One-Time Process:** Chỉ cần verify 1 lần, sau đó có thể update bao nhiêu lần cũng được

### Request Type Options

- **New/First Time Token Update:** Token chưa bao giờ update
- **Existing Token Info Update:** Token đã update trước đó, muốn thay đổi info ← **Chọn cái này**
- **Token/Contract Migration:** Token migrate sang contract address mới

---

## 📊 So Sánh

| Method | Availability | Time | Approval Needed |
|--------|--------------|------|-----------------|
| **Verify Ownership + Update Form** | ✅ Testnets & Mainnet | 1-3 days | Yes |
| **Contact Support Form** | ✅ Testnets & Mainnet | 1-3 days | Yes |
| **Update Button (No Verify)** | ❌ Mainnet Only | N/A | Yes |

---

## 🎯 Tóm Tắt

1. ✅ **Verify ownership** của contract address (1 lần duy nhất)
2. ✅ **Submit update form** với new name/symbol
3. ⏳ **Đợi approval** từ Etherscan (1-3 ngày)
4. 🎉 **Token info sẽ được update** trên Etherscan UI

**Current Status:**
- ✅ On-chain: LEVO (VL) - Version 2.0.0
- ⏳ Etherscan UI: testToken (MTK) - Pending update approval

---

## 📚 References

- Official Guide: https://info.etherscan.com/how-to-verify-address-ownership/
- Update Token Info: https://info.etherscan.com/how-to-update-token-information-on-token-page/
- Your Token: https://sepolia.etherscan.io/token/0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a
- Upgrade Tx: https://sepolia.etherscan.io/tx/0x04c98f29ede154617652feff8c9acf6feadb9369c287d7cb1a5b9368bddf4dac
