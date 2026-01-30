const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TestTokenV2", function () {
  let TestToken;
  let TestTokenV2;
  let token;
  let tokenV2;
  let owner;
  let recipient;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, recipient, addr1, addr2] = await ethers.getSigners();

    // Deploy V1 as proxy
    TestToken = await ethers.getContractFactory("TestToken");
    token = await upgrades.deployProxy(
      TestToken,
      ["InitialToken", "ITK", recipient.address, owner.address],
      { initializer: "initialize" }
    );
    await token.waitForDeployment();

    // Upgrade to V2
    TestTokenV2 = await ethers.getContractFactory("TestTokenV2");
    tokenV2 = await upgrades.upgradeProxy(await token.getAddress(), TestTokenV2);
    await tokenV2.waitForDeployment();
  });

  describe("Upgrade", function () {
    it("Should preserve token state after upgrade", async function () {
      const name = await tokenV2.name();
      const symbol = await tokenV2.symbol();
      const totalSupply = await tokenV2.totalSupply();
      const recipientBalance = await tokenV2.balanceOf(recipient.address);

      expect(name).to.equal("InitialToken");
      expect(symbol).to.equal("ITK");
      expect(totalSupply).to.equal(recipientBalance);
    });

    it("Should have version function in V2", async function () {
      const version = await tokenV2.version();
      expect(version).to.equal("2.0.0");
    });

    it("Should preserve owner after upgrade", async function () {
      expect(await tokenV2.owner()).to.equal(owner.address);
    });
  });

  describe("Update Name", function () {
    it("Should allow owner to update name", async function () {
      await tokenV2.connect(owner).updateName("NewTokenName");
      expect(await tokenV2.name()).to.equal("NewTokenName");
    });

    it("Should emit NameUpdated event", async function () {
      // First update: oldName will be empty string (not initialized yet)
      await expect(tokenV2.connect(owner).updateName("NewTokenName"))
        .to.emit(tokenV2, "NameUpdated")
        .withArgs("", "NewTokenName");
    });

    it("Should not allow non-owner to update name", async function () {
      // OpenZeppelin v5 uses custom errors
      await expect(
        tokenV2.connect(addr1).updateName("HackedName")
      ).to.be.reverted;
    });

    it("Should not allow empty name", async function () {
      await expect(
        tokenV2.connect(owner).updateName("")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Update Symbol", function () {
    it("Should allow owner to update symbol", async function () {
      await tokenV2.connect(owner).updateSymbol("NEW");
      expect(await tokenV2.symbol()).to.equal("NEW");
    });

    it("Should emit SymbolUpdated event", async function () {
      // First update: oldSymbol will be empty string (not initialized yet)
      await expect(tokenV2.connect(owner).updateSymbol("NEW"))
        .to.emit(tokenV2, "SymbolUpdated")
        .withArgs("", "NEW");
    });

    it("Should not allow non-owner to update symbol", async function () {
      // OpenZeppelin v5 uses custom errors
      await expect(
        tokenV2.connect(addr1).updateSymbol("HACK")
      ).to.be.reverted;
    });

    it("Should not allow empty symbol", async function () {
      await expect(
        tokenV2.connect(owner).updateSymbol("")
      ).to.be.revertedWith("Symbol cannot be empty");
    });
  });

  describe("Update Token Info (Batch)", function () {
    it("Should allow owner to update both name and symbol", async function () {
      await tokenV2.connect(owner).updateTokenInfo("BatchUpdate", "BATCH");
      
      expect(await tokenV2.name()).to.equal("BatchUpdate");
      expect(await tokenV2.symbol()).to.equal("BATCH");
    });

    it("Should emit both events", async function () {
      const tx = await tokenV2.connect(owner).updateTokenInfo("BatchUpdate", "BATCH");
      const receipt = await tx.wait();
      
      // Check both events were emitted
      const nameEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "NameUpdated"
      );
      const symbolEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "SymbolUpdated"
      );
      
      expect(nameEvent).to.not.be.undefined;
      expect(symbolEvent).to.not.be.undefined;
    });

    it("Should not allow non-owner to update", async function () {
      // OpenZeppelin v5 uses custom errors
      await expect(
        tokenV2.connect(addr1).updateTokenInfo("Hack", "HCK")
      ).to.be.reverted;
    });

    it("Should not allow empty name", async function () {
      await expect(
        tokenV2.connect(owner).updateTokenInfo("", "VALID")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow empty symbol", async function () {
      await expect(
        tokenV2.connect(owner).updateTokenInfo("ValidName", "")
      ).to.be.revertedWith("Symbol cannot be empty");
    });
  });

  describe("Token Functionality After Name/Symbol Update", function () {
    beforeEach(async function () {
      // Update name and symbol
      await tokenV2.connect(owner).updateTokenInfo("UpdatedToken", "UPD");
    });

    it("Should still transfer tokens correctly", async function () {
      const transferAmount = ethers.parseEther("100");

      await tokenV2
        .connect(recipient)
        .transfer(addr1.address, transferAmount);

      expect(await tokenV2.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should still mint tokens correctly", async function () {
      const mintAmount = ethers.parseEther("1000");
      const balanceBefore = await tokenV2.balanceOf(addr1.address);

      await tokenV2.connect(owner).mint(addr1.address, mintAmount);

      const balanceAfter = await tokenV2.balanceOf(addr1.address);
      expect(balanceAfter - balanceBefore).to.equal(mintAmount);
    });

    it("Should maintain correct total supply", async function () {
      const decimals = await tokenV2.decimals();
      const expectedSupply = ethers.parseUnits("1000000000", decimals);
      
      expect(await tokenV2.totalSupply()).to.equal(expectedSupply);
    });

    it("Should show updated name in view function", async function () {
      expect(await tokenV2.name()).to.equal("UpdatedToken");
    });

    it("Should show updated symbol in view function", async function () {
      expect(await tokenV2.symbol()).to.equal("UPD");
    });
  });

  describe("Multiple Updates", function () {
    it("Should allow updating name multiple times", async function () {
      await tokenV2.connect(owner).updateName("First");
      expect(await tokenV2.name()).to.equal("First");

      await tokenV2.connect(owner).updateName("Second");
      expect(await tokenV2.name()).to.equal("Second");

      await tokenV2.connect(owner).updateName("Third");
      expect(await tokenV2.name()).to.equal("Third");
    });

    it("Should allow updating symbol multiple times", async function () {
      await tokenV2.connect(owner).updateSymbol("ONE");
      expect(await tokenV2.symbol()).to.equal("ONE");

      await tokenV2.connect(owner).updateSymbol("TWO");
      expect(await tokenV2.symbol()).to.equal("TWO");
    });
  });
});
