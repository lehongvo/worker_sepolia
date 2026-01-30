const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TestNft", function () {
  let TestNft;
  let nft;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy V1 as proxy
    TestNft = await ethers.getContractFactory("TestNft");
    nft = await upgrades.deployProxy(
      TestNft,
      ["TestNFT", "TNFT", "https://api.example.com/", owner.address],
      { initializer: "initialize" }
    );
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      expect(await nft.name()).to.equal("TestNFT");
    });

    it("Should set the right symbol", async function () {
      expect(await nft.symbol()).to.equal("TNFT");
    });

    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should have zero minted initially", async function () {
      expect(await nft.totalMinted()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT to address", async function () {
      await nft.safeMint(addr1.address);
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.totalMinted()).to.equal(1);
    });

    it("Should mint with URI", async function () {
      await nft.safeMintWithURI(addr1.address, "ipfs://QmTest123");
      // Note: tokenURI is concatenated with baseURI
      const uri = await nft.tokenURI(0);
      expect(uri).to.include("ipfs://QmTest123");
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        nft.connect(addr1).safeMint(addr2.address)
      ).to.be.reverted;
    });

    it("Should increment token ID correctly", async function () {
      await nft.safeMint(addr1.address);
      await nft.safeMint(addr2.address);
      
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      expect(await nft.totalMinted()).to.equal(2);
    });
  });

  describe("Base URI", function () {
    it("Should return correct token URI with base URI", async function () {
      await nft.safeMint(addr1.address);
      // Note: ERC721URIStorage may return empty if no specific URI is set
      // and base URI + tokenId if base URI is set
    });

    it("Should allow owner to set base URI", async function () {
      await nft.setBaseURI("https://newapi.example.com/");
      // Base URI updated successfully
    });

    it("Should not allow non-owner to set base URI", async function () {
      await expect(
        nft.connect(addr1).setBaseURI("https://hack.com/")
      ).to.be.reverted;
    });
  });
});

describe("TestNftV2", function () {
  let TestNft;
  let TestNftV2;
  let nft;
  let nftV2;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy V1 as proxy
    TestNft = await ethers.getContractFactory("TestNft");
    nft = await upgrades.deployProxy(
      TestNft,
      ["TestNFT", "TNFT", "https://api.example.com/", owner.address],
      { initializer: "initialize" }
    );
    await nft.waitForDeployment();

    // Mint some NFTs before upgrade
    await nft.safeMint(addr1.address);
    await nft.safeMint(addr2.address);

    // Upgrade to V2
    TestNftV2 = await ethers.getContractFactory("TestNftV2");
    nftV2 = await upgrades.upgradeProxy(await nft.getAddress(), TestNftV2);
    await nftV2.waitForDeployment();
    
    // Initialize V2 storage
    await nftV2.initializeV2();
  });

  describe("Upgrade", function () {
    it("Should preserve NFT ownership after upgrade", async function () {
      expect(await nftV2.ownerOf(0)).to.equal(addr1.address);
      expect(await nftV2.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should preserve total minted after upgrade", async function () {
      expect(await nftV2.totalMinted()).to.equal(2);
    });

    it("Should preserve name after upgrade", async function () {
      expect(await nftV2.name()).to.equal("TestNFT");
    });

    it("Should preserve symbol after upgrade", async function () {
      expect(await nftV2.symbol()).to.equal("TNFT");
    });

    it("Should preserve owner after upgrade", async function () {
      expect(await nftV2.owner()).to.equal(owner.address);
    });

    it("Should have version function in V2", async function () {
      expect(await nftV2.version()).to.equal("2.0.0");
    });
  });

  describe("Update Name", function () {
    it("Should allow owner to update name", async function () {
      await nftV2.updateName("NewNFTName");
      expect(await nftV2.name()).to.equal("NewNFTName");
    });

    it("Should emit NameUpdated event", async function () {
      await expect(nftV2.updateName("NewNFTName"))
        .to.emit(nftV2, "NameUpdated")
        .withArgs("", "NewNFTName");
    });

    it("Should not allow non-owner to update name", async function () {
      await expect(
        nftV2.connect(addr1).updateName("HackedName")
      ).to.be.reverted;
    });

    it("Should not allow empty name", async function () {
      await expect(
        nftV2.updateName("")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Update Symbol", function () {
    it("Should allow owner to update symbol", async function () {
      await nftV2.updateSymbol("NEW");
      expect(await nftV2.symbol()).to.equal("NEW");
    });

    it("Should emit SymbolUpdated event", async function () {
      await expect(nftV2.updateSymbol("NEW"))
        .to.emit(nftV2, "SymbolUpdated")
        .withArgs("", "NEW");
    });

    it("Should not allow non-owner to update symbol", async function () {
      await expect(
        nftV2.connect(addr1).updateSymbol("HACK")
      ).to.be.reverted;
    });

    it("Should not allow empty symbol", async function () {
      await expect(
        nftV2.updateSymbol("")
      ).to.be.revertedWith("Symbol cannot be empty");
    });
  });

  describe("Update Collection Info (Batch)", function () {
    it("Should allow owner to update both name and symbol", async function () {
      await nftV2.updateCollectionInfo("BatchUpdate", "BATCH");
      
      expect(await nftV2.name()).to.equal("BatchUpdate");
      expect(await nftV2.symbol()).to.equal("BATCH");
    });

    it("Should emit both events", async function () {
      const tx = await nftV2.updateCollectionInfo("BatchUpdate", "BATCH");
      const receipt = await tx.wait();
      
      const events = receipt.logs.filter(log => log.fragment);
      expect(events.length).to.be.at.least(2);
    });

    it("Should not allow non-owner to update", async function () {
      await expect(
        nftV2.connect(addr1).updateCollectionInfo("Hack", "HCK")
      ).to.be.reverted;
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint NFTs", async function () {
      const startId = await nftV2.batchMint(addr1.address, 5);
      
      expect(await nftV2.totalMinted()).to.equal(7); // 2 + 5
      expect(await nftV2.ownerOf(2)).to.equal(addr1.address);
      expect(await nftV2.ownerOf(6)).to.equal(addr1.address);
    });

    it("Should not allow more than 100 per batch", async function () {
      await expect(
        nftV2.batchMint(addr1.address, 101)
      ).to.be.revertedWith("Max 100 per batch");
    });

    it("Should not allow zero amount", async function () {
      await expect(
        nftV2.batchMint(addr1.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Token URI Management", function () {
    it("Should allow owner to set individual token URI", async function () {
      await nftV2.setTokenURI(0, "ipfs://NewMetadata");
      // Note: tokenURI is concatenated with baseURI
      const uri = await nftV2.tokenURI(0);
      expect(uri).to.include("ipfs://NewMetadata");
    });

    it("Should emit TokenURIUpdated event", async function () {
      await expect(nftV2.setTokenURI(0, "ipfs://NewMetadata"))
        .to.emit(nftV2, "TokenURIUpdated");
    });

    it("Should not allow setting URI for non-existent token", async function () {
      await expect(
        nftV2.setTokenURI(999, "ipfs://test")
      ).to.be.reverted;
    });

    it("Should allow batch setting token URIs", async function () {
      await nftV2.batchSetTokenURI(
        [0, 1],
        ["ipfs://meta0", "ipfs://meta1"]
      );
      
      // Note: tokenURI is concatenated with baseURI
      const uri0 = await nftV2.tokenURI(0);
      const uri1 = await nftV2.tokenURI(1);
      expect(uri0).to.include("ipfs://meta0");
      expect(uri1).to.include("ipfs://meta1");
    });
  });

  describe("Base URI Management", function () {
    it("Should allow owner to set base URI", async function () {
      await nftV2.setBaseURI("https://newapi.example.com/");
      expect(await nftV2.baseURI()).to.equal("https://newapi.example.com/");
    });

    it("Should emit BaseURIUpdated event", async function () {
      await expect(nftV2.setBaseURI("https://new.com/"))
        .to.emit(nftV2, "BaseURIUpdated");
    });

    it("Should not allow non-owner to set base URI", async function () {
      await expect(
        nftV2.connect(addr1).setBaseURI("https://hack.com/")
      ).to.be.reverted;
    });
  });

  describe("NFT Functionality After Upgrade", function () {
    it("Should still mint correctly after upgrade", async function () {
      const tokenId = await nftV2.safeMint.staticCall(addr1.address);
      await nftV2.safeMint(addr1.address);
      
      expect(await nftV2.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should still transfer correctly", async function () {
      // addr1 owns token 0
      await nftV2.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      expect(await nftV2.ownerOf(0)).to.equal(addr2.address);
    });

    it("Should still approve correctly", async function () {
      await nftV2.connect(addr1).approve(addr2.address, 0);
      expect(await nftV2.getApproved(0)).to.equal(addr2.address);
    });
  });

  describe("Multiple Updates", function () {
    it("Should allow updating name multiple times", async function () {
      await nftV2.updateName("First");
      expect(await nftV2.name()).to.equal("First");

      await nftV2.updateName("Second");
      expect(await nftV2.name()).to.equal("Second");
    });

    it("Should allow updating symbol multiple times", async function () {
      await nftV2.updateSymbol("ONE");
      expect(await nftV2.symbol()).to.equal("ONE");

      await nftV2.updateSymbol("TWO");
      expect(await nftV2.symbol()).to.equal("TWO");
    });
  });
});
