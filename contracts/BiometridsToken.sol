pragma solidity 0.4.18;

import "./library/ERC233/ERC223BasicToken.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";

contract BiometridsToken is ERC223BasicToken, HasNoEther {
    string public constant name = "Biometrids Token";

    string public constant symbol = "IDS";

    /** Decimals part of the token. The same as Wei (minimal part of the Ether) */
    uint256 public constant decimals = 18;

    /* 1B of tokens will be issued with decimals **/
    uint256 public totalSupply = 10 ** (8 + 18);

    function BiometridsToken() public {
        balances[msg.sender] = totalSupply;
    }
}
