// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.28;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TestNftV2 is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable {
    /// @custom:storage-location erc7201:myProject.TestNft
    struct TestNftStorage {
        uint256 _nextTokenId;
        string _baseTokenURI;
    }

    // keccak256(abi.encode(uint256(keccak256("myProject.TestNft")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TESTNFT_STORAGE_LOCATION = 0xb9584c701baa830e9337e4a794bd3934b63efa91eff13e0c39a5834de52ef400;

    // V2 Storage: Custom name and symbol for dynamic updates
    string private _customName;
    string private _customSymbol;

    // V2 Events
    event NameUpdated(string oldName, string newName);
    event SymbolUpdated(string oldSymbol, string newSymbol);
    event BaseURIUpdated(string oldBaseURI, string newBaseURI);
    event TokenURIUpdated(uint256 indexed tokenId, string oldURI, string newURI);
    // Note: BatchMetadataUpdate is defined in IERC4906 (OpenZeppelin)

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the NFT contract with name, symbol, and owner
     * @param name_ The name of the NFT collection
     * @param symbol_ The symbol of the NFT collection
     * @param baseURI_ The base URI for token metadata
     * @param initialOwner The initial owner of the contract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address initialOwner
    ) public initializer {
        __ERC721_init(name_, symbol_);
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        
        _customName = name_;
        _customSymbol = symbol_;
        
        TestNftStorage storage $ = _getTestNftStorage();
        $._baseTokenURI = baseURI_;
    }

    /**
     * @dev Initialize V2 storage variables after upgrade from V1
     * This function should be called immediately after upgrading to V2
     * It copies the current name/symbol from the parent contract to the custom storage
     */
    function initializeV2() public reinitializer(2) {
        // Copy current name and symbol from parent contract to custom storage
        _customName = super.name();
        _customSymbol = super.symbol();
    }

    // ============ MINTING FUNCTIONS ============

    /**
     * @dev Mints a new NFT to the specified address
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the newly minted NFT
     */
    function safeMint(address to) public onlyOwner returns (uint256) {
        TestNftStorage storage $ = _getTestNftStorage();
        uint256 tokenId = $._nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Mints a new NFT with a specific token URI
     * @param to The address to mint the NFT to
     * @param uri The token URI for the NFT metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function safeMintWithURI(address to, string memory uri) public onlyOwner returns (uint256) {
        TestNftStorage storage $ = _getTestNftStorage();
        uint256 tokenId = $._nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Batch mint NFTs to the specified address
     * @param to The address to mint the NFTs to
     * @param amount The number of NFTs to mint
     * @return startTokenId The first token ID in the batch
     */
    function batchMint(address to, uint256 amount) public onlyOwner returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= 100, "Max 100 per batch");
        
        TestNftStorage storage $ = _getTestNftStorage();
        uint256 startTokenId = $._nextTokenId;
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = $._nextTokenId++;
            _safeMint(to, tokenId);
        }
        
        return startTokenId;
    }

    // ============ NAME & SYMBOL UPDATE FUNCTIONS ============

    /**
     * @dev Updates the collection name
     * @param newName The new name for the collection
     */
    function updateName(string memory newName) public onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        
        string memory oldName = _customName;
        _customName = newName;
        
        emit NameUpdated(oldName, newName);
    }

    /**
     * @dev Updates the collection symbol
     * @param newSymbol The new symbol for the collection
     */
    function updateSymbol(string memory newSymbol) public onlyOwner {
        require(bytes(newSymbol).length > 0, "Symbol cannot be empty");
        
        string memory oldSymbol = _customSymbol;
        _customSymbol = newSymbol;
        
        emit SymbolUpdated(oldSymbol, newSymbol);
    }

    /**
     * @dev Updates both collection name and symbol
     * @param newName The new name for the collection
     * @param newSymbol The new symbol for the collection
     */
    function updateCollectionInfo(
        string memory newName,
        string memory newSymbol
    ) public onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        require(bytes(newSymbol).length > 0, "Symbol cannot be empty");
        
        string memory oldName = _customName;
        string memory oldSymbol = _customSymbol;
        
        _customName = newName;
        _customSymbol = newSymbol;
        
        emit NameUpdated(oldName, newName);
        emit SymbolUpdated(oldSymbol, newSymbol);
    }

    // ============ METADATA UPDATE FUNCTIONS ============

    /**
     * @dev Sets the base URI for all tokens
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        TestNftStorage storage $ = _getTestNftStorage();
        string memory oldBaseURI = $._baseTokenURI;
        $._baseTokenURI = newBaseURI;
        
        emit BaseURIUpdated(oldBaseURI, newBaseURI);
    }

    /**
     * @dev Updates the token URI for a specific token
     * @param tokenId The token ID to update
     * @param newURI The new token URI
     */
    function setTokenURI(uint256 tokenId, string memory newURI) public onlyOwner {
        _requireOwned(tokenId);
        
        string memory oldURI = tokenURI(tokenId);
        _setTokenURI(tokenId, newURI);
        
        emit TokenURIUpdated(tokenId, oldURI, newURI);
    }

    /**
     * @dev Batch update token URIs
     * @param tokenIds Array of token IDs to update
     * @param newURIs Array of new URIs
     */
    function batchSetTokenURI(uint256[] calldata tokenIds, string[] calldata newURIs) public onlyOwner {
        require(tokenIds.length == newURIs.length, "Arrays length mismatch");
        require(tokenIds.length <= 100, "Max 100 per batch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _requireOwned(tokenIds[i]);
            _setTokenURI(tokenIds[i], newURIs[i]);
            emit TokenURIUpdated(tokenIds[i], "", newURIs[i]);
        }
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Returns the collection name (override to return custom name)
     */
    function name() public view override(ERC721Upgradeable) returns (string memory) {
        return bytes(_customName).length > 0 ? _customName : super.name();
    }

    /**
     * @dev Returns the collection symbol (override to return custom symbol)
     */
    function symbol() public view override(ERC721Upgradeable) returns (string memory) {
        return bytes(_customSymbol).length > 0 ? _customSymbol : super.symbol();
    }

    /**
     * @dev Returns the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        TestNftStorage storage $ = _getTestNftStorage();
        return $._baseTokenURI;
    }

    /**
     * @dev Returns the base URI (public getter)
     */
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    /**
     * @dev Returns the current token ID counter (total minted)
     */
    function totalMinted() public view returns (uint256) {
        TestNftStorage storage $ = _getTestNftStorage();
        return $._nextTokenId;
    }

    /**
     * @dev Returns the version of the contract
     */
    function version() public pure returns (string memory) {
        return "2.0.0";
    }

    // ============ INTERNAL FUNCTIONS ============

    function _getTestNftStorage() private pure returns (TestNftStorage storage $) {
        assembly { $.slot := TESTNFT_STORAGE_LOCATION }
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
