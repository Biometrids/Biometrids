pragma solidity 0.4.18;


import "./interfaces/TokenInterface.sol";
import "./library/ERC233/ERC223BasicToken.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";


contract BiometridsToken is TokenInterface, ERC223BasicToken, HasNoEther {
    function BiometridsToken() public {
        totalSupply = 10 ** (8 + decimals());
        balances[msg.sender] = totalSupply;
    }

    function name() public constant returns (string) {
        return "Biometrids Token";
    }

    function symbol() public constant returns (string) {
        return "IDS";
    }

    function decimals() public constant returns (uint256) {
        return 1;
    }

    function isToken() public constant returns (bool) {
        return true;
    }
}
