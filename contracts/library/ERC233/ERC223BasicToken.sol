pragma solidity 0.4.18;


import './interfaces/ERC223ReceivingContract.sol';
import "../../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../../../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol";


/**
 * @title ERC223 partly impementation. We've want to be sure that contract could receive this tokens.
 */
contract ERC223BasicToken is StandardToken {
    /**
     * @dev Transfer the specified amount of tokens to the specified address.
     *      This function works the same with the previous one
     *      but doesn't contain `_data` param.
     *      Added due to backwards compatibility reasons.
     *
     * @param _to    Receiver address.
     * @param _value Amount of tokens that will be transferred.
     * @param _data bytes additional data for token fallback
     * @return bool is succed
     */
    function transfer(address _to, uint256 _value, bytes _data) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);
      
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        
        tryContractTokenFallback(_to, msg.sender, _value, _data);
        
        Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
    * @dev Transfer tokens from one address to another
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amount of tokens to be transferred
    * @param _data bytes additional data for token fallback
    * @return bool is succeed
    */
   function transferFrom(address _from, address _to, uint256 _value, bytes _data) public returns (bool) {
       require(_to != address(0));
       require(_value <= balances[_from]);
       require(_value <= allowed[_from][msg.sender]);

       tryContractTokenFallback(_to, _from, _value, _data);

       balances[_from] = balances[_from].sub(_value);
       balances[_to] = balances[_to].add(_value);
       allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
       Transfer(_from, _to, _value);
       return true;
   }

    /**
    * @dev Try to call token fallback if receiver is contract
    * @param _to address The address which you want to transfer to
    * @param _from address The address which you want to send tokens from
    * @param _value uint256 the amount of tokens to be transferred
    * @param _data bytes additional data for token fallback
    */
   function tryContractTokenFallback(address _to, address _from, uint256 _value, bytes _data) internal {
     if (isContract(_to)) {
         ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
         receiver.tokenFallback(_from, _value, _data);
     }
   }

    /**
    * @dev Check is passed address is contract
    * @param _addr address The address which you want to check
    */
   function isContract(address _addr) internal returns (bool) {
       uint256 length;
       assembly {
         //retrieve the size of the code on target address, this needs assembly
         length := extcodesize(_addr)
       } 
        
       return length > 0;
   } 
}
