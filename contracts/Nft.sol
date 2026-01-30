// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.28;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TestNft is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable {
    /// @custom:storage-location erc7201:myProject.TestNft
    struct TestNftStorage {
        uint256 _nextTokenId;
        string _baseTokenURI;
    }

    // keccak256(abi.encode(uint256(keccak256("myProject.TestNft")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TESTNFT_STORAGE_LOCATION = 0xb9584c701baa830e9337e4a794bd3934b63efa91eff13e0c39a5834de52ef400;

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
        
        TestNftStorage storage $ = _getTestNftStorage();
        $._baseTokenURI = baseURI_;
    }

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
     * @dev Sets the base URI for all tokens
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        TestNftStorage storage $ = _getTestNftStorage();
        $._baseTokenURI = newBaseURI;
    }

    /**
     * @dev Returns the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        TestNftStorage storage $ = _getTestNftStorage();
        return $._baseTokenURI;
    }

    /**
     * @dev Returns the current token ID counter (total minted)
     */
    function totalMinted() public view returns (uint256) {
        TestNftStorage storage $ = _getTestNftStorage();
        return $._nextTokenId;
    }

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
