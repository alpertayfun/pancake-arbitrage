const Web3 = require('web3');
const ethers = require('ethers'); 
const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap-libs/sdk');
var url = "wss://bsc-ws-node.nariox.org:443";
const web3 = new Web3(url);
const abis = require('./pancakeswap-mainnet.json');
const BigNumber = require("bignumber.js");
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed1.binance.org/');


const amountInBUSD = web3.utils.toBN(web3.utils.toWei('20000'));
const busdTokenAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const wbnbTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
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
      const [INPUT_TOKEN, OUTPUT_TOKEN] = await Promise.all(

        [busdTokenAddress, wbnbTokenAddress].map(tokenAddress => (

            new Token(

                ChainId.MAINNET,

                tokenAddress,

                18

            )

        )));

      const pair = await Fetcher.fetchPairData(INPUT_TOKEN, OUTPUT_TOKEN, provider);
      console.log("pair >>>>>>>>>>>>>>>>");
      console.log(INPUT_TOKEN);
      console.log(OUTPUT_TOKEN);
      console.log("pair >>>>>>>>>>>>>>>>");

      const bakeOutput = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [busdTokenAddress, wbnbTokenAddress]).call();
      console.log(bakeOutput);
      const shiftedPancakeValue = await new BigNumber(bakeOutput[1]).shiftedBy(-18);
      console.log( shiftedPancakeValue.toString());

      console.log(`PancakeSwap BUSD-WBNB: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput[1].toString())}`);
      
      const bakeOutput2 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [wbnbTokenAddress, racaTokenAddress]).call();
      console.log(`PancakeSwap WBNB-RACA: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput2[1].toString())}`);

      const bakeOutput3 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [racaTokenAddress, busdTokenAddress]).call();
      console.log(`PancakeSwap RACA-BUSD: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput3[1].toString())}`);

    })
    .on('error', error => {
      console.log(error);
    });
}
init();
