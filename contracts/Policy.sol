pragma solidity ^0.5.8;

import "./PolicyFactory.sol";

contract Policy  
{
    address payable public farmer;
    PolicyFactory policyFactory;
    uint256 public premiumVal;
    uint256 public coverageRate;
    uint256 public total;
    uint256 public regTime;
    uint256 public period;
    bool claimed;
    
    modifier enoughTime(){
        require(now >= regTime + period );
        _;
    }

    modifier notClaimed(){
        require(now >= regTime + period );
        _;
    }
    
    event benefitsReceived(address indexed _to,uint _value);

    constructor(address payable _farmer,uint256 _count,PolicyFactory _policyFactory,uint256 _total,uint256 _coverageRate) public payable {
        policyFactory=_policyFactory;
        premiumVal+=_count;
        farmer=_farmer;
        coverageRate=_coverageRate;
        total=_total;
        regTime = now;
        period = 0;
        claimed=false;
    }
    
    function claimBenefits() enoughTime() notClaimed() public {
        ///some query and condition checking 
        if(true)
        {
            policyFactory.sendBenefits(farmer,total*(coverageRate/100));
            emit benefitsReceived(msg.sender,total*(coverageRate/100));
        }
        else
        {
            emit benefitsReceived(msg.sender,0);
        }
        claimed=true;
    }

    function returnFarmer() view public returns(address,uint,uint,uint,uint,uint) {
        return (farmer,premiumVal,regTime,period,coverageRate,total); 
    }
}