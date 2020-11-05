const Web3 = require('web3')
const rpcURL = 'http://127.0.0.1:7545'
const web3 = new Web3(rpcURL)

web3 eth getBlock('latest', (err,result) => {console log(result)} )