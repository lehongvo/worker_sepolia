// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.28;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TestTokenV2 is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    // Storage for upgradeable name and symbol
    string private _customName;
    string private _customSymbol;

    // Events
    event NameUpdated(string oldName, string newName);
    event SymbolUpdated(string oldSymbol, string newSymbol);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        address recipient,
        address initialOwner
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(initialOwner);

        // Store custom name and symbol
        _customName = name;
        _customSymbol = symbol;

        _mint(recipient, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Updates the token name
     * @param newName The new name for the token
     */
    function updateName(string memory newName) public onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        
        string memory oldName = _customName;
        _customName = newName;
        
        emit NameUpdated(oldName, newName);
    }

    /**
     * @dev Updates the token symbol
     * @param newSymbol The new symbol for the token
     */
    function updateSymbol(string memory newSymbol) public onlyOwner {
        require(bytes(newSymbol).length > 0, "Symbol cannot be empty");
        
        string memory oldSymbol = _customSymbol;
        _customSymbol = newSymbol;
        
        emit SymbolUpdated(oldSymbol, newSymbol);
    }

    /**
     * @dev Updates both token name and symbol
     * @param newName The new name for the token
     * @param newSymbol The new symbol for the token
     */
    function updateTokenInfo(
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

    /**
     * @dev Returns the name of the token (override to return custom name)
     */
    function name() public view virtual override returns (string memory) {
        return bytes(_customName).length > 0 ? _customName : super.name();
    }

    /**
     * @dev Returns the symbol of the token (override to return custom symbol)
     */
    function symbol() public view virtual override returns (string memory) {
        return bytes(_customSymbol).length > 0 ? _customSymbol : super.symbol();
    }

    /**
     * @dev Returns the version of the token contract
     */
    function version() public pure returns (string memory) {
        return "2.0.0";
    }
}
