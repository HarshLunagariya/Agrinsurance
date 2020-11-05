pragma solidity ^0.5.8;

import "./Policy.sol";

contract PolicyFactory
{
    mapping(address => uint256) public premiumVal;
    mapping(address => Policy) public policyBought;
    mapping(address => bool) public policyCheck;
    mapping(address => uint256) public donation;


    modifier enoughValue (uint256 _count) {
        require((10**18)*(_count)<=msg.value);
        _;
    }

    modifier notBought(){
        require(policyCheck[msg.sender]==false);
        _;
    }

    event policyOwned(address indexed _by,address indexed _policyAddress);
    event donationEvent(address indexed _by,uint256 _amount);
    
    constructor(uint256 _initialSupply) public 
    {
    }
    
    function createPolicy(uint256 _count,uint256 _total,uint256 _coverageRate) enoughValue(_count) notBought() public payable
    {
        Policy policy =  (new Policy)(msg.sender,_count,this,_total,_coverageRate);
        policyBought[msg.sender]=policy;
        premiumVal[msg.sender]=premiumVal[msg.sender]+_count;
        policyCheck[msg.sender]=true;
        emit policyOwned(msg.sender,address(policy));
    }
    
    function sendBenefits(address payable _farmer,uint256 _benefit) public 
    {
        _farmer.transfer((10**18)*_benefit);
    }

    function donate(uint256 _total) enoughValue(_total) public payable
    {
        donation[msg.sender]=donation[msg.sender]+_total;
        emit donationEvent(msg.sender,_total);
    }
}