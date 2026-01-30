# Upgrade Examples

## Scenario 1: Update Both Name and Symbol

**Current Token:**
- Name: `testToken`
- Symbol: `MTK`

**Goal:** Change to `MyNewToken` (MNT)

**Configuration (.env):**
```env
TOKEN_NAME_V2=MyNewToken
TOKEN_SYMBOL_V2=MNT
```

**Result after upgrade:**
- Name: `MyNewToken` ✏️ Changed
- Symbol: `MNT` ✏️ Changed

---

## Scenario 2: Update Only Symbol (Keep Name)

**Current Token:**
- Name: `testToken`
- Symbol: `MTK`

**Goal:** Keep name, change symbol to `TKN`

**Configuration (.env):**
```env
# TOKEN_NAME_V2=              # Don't set or leave empty
TOKEN_SYMBOL_V2=TKN
```

**Result after upgrade:**
- Name: `testToken` ✓ Kept
- Symbol: `TKN` ✏️ Changed

---

## Scenario 3: Update Only Name (Keep Symbol)

**Current Token:**
- Name: `testToken`
- Symbol: `MTK`

**Goal:** Change name to `BetterToken`, keep symbol

**Configuration (.env):**
```env
TOKEN_NAME_V2=BetterToken
# TOKEN_SYMBOL_V2=            # Don't set or leave empty
```

**Result after upgrade:**
- Name: `BetterToken` ✏️ Changed
- Symbol: `MTK` ✓ Kept

---

## Scenario 4: Upgrade Logic Only (No Name/Symbol Change)

**Current Token:**
- Name: `testToken`
- Symbol: `MTK`

**Goal:** Just upgrade to V2 contract (get new features), keep name/symbol

**Configuration (.env):**
```env
# TOKEN_NAME_V2=              # Don't set
# TOKEN_SYMBOL_V2=            # Don't set
```

**Result after upgrade:**
- Name: `testToken` ✓ Kept
- Symbol: `MTK` ✓ Kept
- Contract: `TestTokenV2` ✅ Upgraded (new features available)

---

## How It Works

The upgrade script uses this logic:

```javascript
// For name
if (TOKEN_NAME_V2 is set in .env) {
  Use TOKEN_NAME_V2
} else {
  Keep current name from deployments/network.json
}

// For symbol  
if (TOKEN_SYMBOL_V2 is set in .env) {
  Use TOKEN_SYMBOL_V2
} else {
  Keep current symbol from deployments/network.json
}
```

## Upgrade Output Examples

### Example: Only Symbol Changed

```
=== Token Info Update ===
Current Name: testToken
New Name: testToken
  ✓ No change

Current Symbol: MTK
New Symbol: TKN
  ✏️  Will be updated

=== Upgrading to TestTokenV2 ===
✅ Proxy upgraded successfully!

=== Updating Token Name and Symbol ===
✅ Token info updated successfully!

=== Verifying Updated Token Info ===
Name: testToken
Symbol: TKN
Version: 2.0.0
```

### Example: Both Changed

```
=== Token Info Update ===
Current Name: testToken
New Name: MyNewToken
  ✏️  Will be updated

Current Symbol: MTK
New Symbol: MNT
  ✏️  Will be updated

=== Upgrading to TestTokenV2 ===
✅ Proxy upgraded successfully!

=== Updating Token Name and Symbol ===
✅ Token info updated successfully!

=== Verifying Updated Token Info ===
Name: MyNewToken
Symbol: MNT
Version: 2.0.0
```

## Commands

```bash
# 1. Configure in .env (choose scenario above)
nano .env

# 2. Run upgrade
yarn upgrade:token
```

## Tips

💡 **Test Locally First:**
```bash
# Deploy V1 locally
yarn deploy:local

# Then upgrade locally
yarn upgrade:token
```

💡 **Incremental Updates:**
You can upgrade multiple times:
1. First upgrade: Change symbol
2. Later: Upgrade again to change name
3. Each upgrade updates `deployments/network.json`

💡 **Version Tracking:**
Check contract version on-chain:
```javascript
const version = await token.version();
console.log(version); // "2.0.0"
```
