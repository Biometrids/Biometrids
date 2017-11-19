pragma solidity 0.4.18;


import "./interfaces/TokenInterface.sol";
import "./library/ERC233/ERC223BasicToken.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";

contract BiometridsToken is TokenInterface, ERC223BasicToken, HasNoEther, Claimable {
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
        return 18;
    }

    function isToken() public constant returns (bool) {
        return true;
    }
}
