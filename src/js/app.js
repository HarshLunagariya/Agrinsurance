App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasOwned: false,
  policyFactoryInstance: null,
  init: function() {
    return App.initWeb3();
  },
  
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("PolicyFactory.json", function(policyFactory) {
      App.contracts.PolicyFactory = TruffleContract(policyFactory);
      App.contracts.PolicyFactory.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },  

  initPolicyContract: function() {
    $.getJSON("Policy.json", function(policy) {
      App.contracts.Policy = TruffleContract(policy);
      App.contracts.Policy.setProvider(App.web3Provider);
      return ;
    });
  },  

  listenForEvents: function() {
    App.contracts.PolicyFactory.deployed().then(function(instance) {
      instance.policyOwned({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("Policy Owned Event Triggered", event)
        App.render();
      });
    });
  },

  render: function() {
    var loader = $("#loader");
    var content = $("#content");
    var detail = $("#policyDetails");
    var progress = $("#pbar");

    loader.show();
    content.hide();
    progress.hide();
    detail.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;     
        $("#accountAddress").html("Your Account: " + account);
        //console.log(App.account);
      }
    });

    // Load contract data
    App.contracts.PolicyFactory.deployed().then(function(instance) {
      App.policyFactoryInstance = instance;
      return App.policyFactoryInstance.policyCheck(App.account);
    }).then(function(hasOwned) {
      // Do not allow a user who has already bought the policy
      // console.log("Y/N"+hasOwned);
      if(hasOwned) 
      {

        App.initPolicyContract();
        let policyContract;
        App.policyFactoryInstance.policyBought(App.account).then(function(policyAddress){
        const policyAbi = [{"constant":true,"inputs":[],"name":"premiumVal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"total","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"coverageRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"regTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"farmer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"period","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_farmer","type":"address"},{"name":"_count","type":"uint256"},{"name":"_policyFactory","type":"address"},{"name":"_total","type":"uint256"},{"name":"_coverageRate","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"benefitsReceived","type":"event"},{"constant":false,"inputs":[],"name":"claimBenefits","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnFarmer","outputs":[{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
        policyContract = web3.eth.contract(policyAbi).at(policyAddress);
        
        ////Retrieve
        policyContract.returnFarmer(function(err,res){
          document.getElementById("addressOP").innerHTML = policyAddress;
          document.getElementById("premiumValOP").innerHTML = res[1];
          document.getElementById("regTimeOP").innerHTML = res[2];
          document.getElementById("periodOP").innerHTML = res[3];
          document.getElementById("coverageRateOP").innerHTML = res[4];
          document.getElementById("totalOP").innerHTML = res[5];
          ///NOT WORKING 
          document.getElementById("timeline").item(0).setAttribute('aria-valuenow' , 0);
          console.log(res.toString());
          });     

          policyContract.claimed().then(function(err,res){
          if(res==false)
          {
              $("#claimButton").show();
          }
          else 
          { 
              $("#claimButton").show();
          }
          });  
        });
        content.show();
        $('form').hide();
        progress.show();
        detail.show();
      }
      else
      {
        progress.hide();
        $('form').show();
        detail.hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  buyPolicy: function() {
    App.contracts.PolicyFactory.deployed().then(function(instance) {
      var premiumAmount = document.getElementById("premiumAmount").innerHTML;
      var total = document.getElementById("total").innerHTML;
      var coverageRate = document.getElementById("coverageRate").innerHTML;
      console.log(premiumAmount+" "+total+" "+coverageRate);
       var pAWei = web3.toWei(premiumAmount);
       console.log(pAWei);
      return instance.createPolicy(premiumAmount,total,coverageRate, { from: App.account , value: pAWei });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
      alert("Successful Transaction!!!");
    }).catch(function(err) {
      alert("Unsuccessful Transaction!!!");
      console.error(err);
    });
  },

  donate: function(){
    console.log("Donate***");
    App.contracts.PolicyFactory.deployed().then(function(instance){
      var donationAmount = document.getElementById("donationAmount").value;
      console.log(donationAmount);
      var dAWei = web3.toWei(donationAmount);
      console.log(dAWei);
      return instance.donate(donationAmount,{form: App.account , value: dAWei });
    }).then(function(result){
        alert("Successful Donation!!!");   
    }).catch(function(err){
        alert("Unsuccessful Donation!!!");
        console.err(err);
    });
  },

  processClaim: function() {
  App.policyFactoryInstance.policyBought(App.account).then(function(policyAddress){
        const policyAbi = [{"constant":true,"inputs":[],"name":"premiumVal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"total","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"coverageRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"regTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"farmer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"period","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_farmer","type":"address"},{"name":"_count","type":"uint256"},{"name":"_policyFactory","type":"address"},{"name":"_total","type":"uint256"},{"name":"_coverageRate","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"benefitsReceived","type":"event"},{"constant":false,"inputs":[],"name":"claimBenefits","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnFarmer","outputs":[{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
        policyContract = web3.eth.contract(policyAbi).at(policyAddress); 
        policyContract.claimBenefits(function(err,res){
          if(!err)
          {
            alert("Claimed Successfully!!!");
            console.log("Claimed Successfully!!!");
          }
          else
          {
            alert("Claim Failed!!!");
            console.log("Claim Failed");
          }
        });     
    });
  }


};


$(function() {
  $(window).load(function() {
    App.init();
  });
});
