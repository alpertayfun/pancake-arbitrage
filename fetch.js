const Web3 = require('web3');
var url = "wss://bsc-ws-node.nariox.org:443";
const web3 = new Web3(url);
const abis = require('./pancakeswap-mainnet.json');
const BigNumber = require("bignumber.js");


const amountInBUSD = web3.utils.toBN(web3.utils.toWei('20000'));
const busdTokenAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const bakeTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const racaTokenAddress = "0x12bb890508c125661e03b09ec06e404bc9289040";

const init = async () => {
  const pancakeSwap = new web3.eth.Contract(
    abis.router.ABI,
    "0x10ED43C718714eb63d5aA57B78B54704E256024E"
  );

  web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
      const exchangeAmount = await new BigNumber(1);
      const shiftedExchangeAmount = await new BigNumber(exchangeAmount).shiftedBy(18);

      const bakeOutput = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [busdTokenAddress, bakeTokenAddress]).call();
      console.log(bakeOutput);
      const shiftedPancakeValue = await new BigNumber(bakeOutput[1]).shiftedBy(-18);
      console.log( shiftedPancakeValue.toString());

      console.log(`PancakeSwap BUSD-WBNB: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput[1].toString())}`);
      
      const bakeOutput2 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [bakeTokenAddress, racaTokenAddress]).call();
      console.log(`PancakeSwap WBNB-RACA: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput2[1].toString())}`);

      const bakeOutput3 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [racaTokenAddress, busdTokenAddress]).call();
      console.log(`PancakeSwap RACA-BUSD: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput3[1].toString())}`);

    })
    .on('error', error => {
      console.log(error);
    });
}
init();
