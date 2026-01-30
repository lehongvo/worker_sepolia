const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken", function () {
  let TestToken;
  let testToken;
  let owner;
  let recipient;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, recipient, addr1, addr2] = await ethers.getSigners();

    // Deploy TestToken
    TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();
    await testToken.deployed();
  });

  describe("Initialization", function () {
    it("Should initialize the token correctly", async function () {
      await testToken.initialize(recipient.address, owner.address);

      expect(await testToken.name()).to.equal("testToken");
      expect(await testToken.symbol()).to.equal("MTK");
      expect(await testToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to recipient on initialization", async function () {
      await testToken.initialize(recipient.address, owner.address);

      const decimals = await testToken.decimals();
      const expectedSupply = ethers.BigNumber.from("1000000000").mul(
        ethers.BigNumber.from(10).pow(decimals)
      );
      const balance = await testToken.balanceOf(recipient.address);
      expect(balance).to.equal(expectedSupply);
    });

    it("Should set correct total supply", async function () {
      await testToken.initialize(recipient.address, owner.address);

      const decimals = await testToken.decimals();
      const expectedSupply = ethers.BigNumber.from("1000000000").mul(
        ethers.BigNumber.from(10).pow(decimals)
      );
      expect(await testToken.totalSupply()).to.equal(expectedSupply);
    });

    it("Should not allow double initialization", async function () {
      await testToken.initialize(recipient.address, owner.address);

      await expect(
        testToken.initialize(recipient.address, owner.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await testToken.initialize(recipient.address, owner.address);
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      const balanceBefore = await testToken.balanceOf(addr1.address);

      await testToken.connect(owner).mint(addr1.address, mintAmount);

      const balanceAfter = await testToken.balanceOf(addr1.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");

      await expect(
        testToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should increase total supply when minting", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      const totalSupplyBefore = await testToken.totalSupply();

      await testToken.connect(owner).mint(addr1.address, mintAmount);

      const totalSupplyAfter = await testToken.totalSupply();
      expect(totalSupplyAfter.sub(totalSupplyBefore)).to.equal(mintAmount);
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await testToken.initialize(recipient.address, owner.address);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther("100");

      await testToken
        .connect(recipient)
        .transfer(addr1.address, transferAmount);

      const addr1Balance = await testToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialBalance = await testToken.balanceOf(addr1.address);
      const transferAmount = initialBalance.add(1);

      await expect(
        testToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should update balances after transfers", async function () {
      const transferAmount = ethers.utils.parseEther("50");

      const recipientBalanceBefore = await testToken.balanceOf(
        recipient.address
      );
      const addr1BalanceBefore = await testToken.balanceOf(addr1.address);

      await testToken
        .connect(recipient)
        .transfer(addr1.address, transferAmount);

      const recipientBalanceAfter = await testToken.balanceOf(
        recipient.address
      );
      const addr1BalanceAfter = await testToken.balanceOf(addr1.address);

      expect(recipientBalanceAfter).to.equal(
        recipientBalanceBefore.sub(transferAmount)
      );
      expect(addr1BalanceAfter).to.equal(
        addr1BalanceBefore.add(transferAmount)
      );
    });
  });

  describe("Ownership", function () {
    beforeEach(async function () {
      await testToken.initialize(recipient.address, owner.address);
    });

    it("Should allow owner to transfer ownership", async function () {
      await testToken.connect(owner).transferOwnership(addr1.address);
      expect(await testToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        testToken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
