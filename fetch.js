'use strict';

const dev = true;
const Web3 = require('web3');
const ethers = require('ethers'); 
const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap-libs/sdk');
var url = "wss://bsc-ws-node.nariox.org:443";
const web3 = new Web3(url);
const abis = require('./pancakeswap-mainnet.json');
const BigNumber = require("bignumber.js");
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed1.binance.org/');
const axios = require("axios");
const fs = require('fs');

const apiKeyBscScan = "000000000000000000000";
const pancakePairAddress = "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16";
const amountInBUSD = web3.utils.toBN(web3.utils.toWei('20000'));
const pancakeRouterAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";


const getAbi = async (name,address) => {

  fs.access('./'+name+'-abis.json', fs.F_OK, (err) => {
    if (err) {
      if(dev) console.log(err);
      const options = {
        method: 'GET',
        url: 'https://api.bscscan.com/api?module=contract&action=getabi&address='+address+'&apikey='+apiKeyBscScan
      };
      
      axios.request(options).then(function (response) {
        if(dev) console.log(response.data.result);
        let data = response.data.result;
        fs.writeFileSync(name+'-abis.json', data);
        return JSON.parse(response.data.result);
      }).catch(function (error) {
        if(dev) console.error(error);
      });
    }else{
      fs.readFile('./'+name+'-abis.json', (err, data) => {
          if (err) throw err;
          let datas = JSON.parse(data);
          if(dev) console.log(datas);
          return datas;

      });
    }
  })
 
};


const tokens = 
  {
    BUSD: {
      name: 'BUSD',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    },
    WBNB: {
      name: 'WBNB',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    },
    RACA: {
      name: 'RACA',
      address: '0x12bb890508c125661e03b09ec06e404bc9289040'
    },
    DAI: {
      name: 'DAI',
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'
    },
  }
;


async function buy(One,Two,WalletAddress) {

  const OneamountIn = ethers.utils.parseUnits('100', 18);
  let amounts = await routerContract.getAmountsOut(OneamountIn, [One, Two]);
  const TwoamountOutMin = amounts[1].sub(amounts[1].div(10));

  if(dev) console.log(ethers.utils.formatEther(OneamountIn));
  if(dev) console.log(ethers.utils.formatEther(TwoamountOutMin));

  const approveTx = await busdContract.approve(
      router,
      OneamountIn
  );
  let returned = await approveTx.wait();
  if(dev) console.log(returned);

  const swapTx = await routerContract.swapExactTokensForTokens(
      OneamountIn,
      TwoamountOutMin,
      [One, Two],
      WalletAddress,
      Date.now() + 1000 * 60 * 10,
      {gasLimit: 250000}
  )

  returned = await swapTx.wait();
  if(dev) console.log(returned);
}


const init = async () => {
  const pancakeSwap = new web3.eth.Contract(
    abis.router.ABI,
    pancakeRouterAddress
  );

  web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
      const exchangeAmount = await new BigNumber(1);
      const shiftedExchangeAmount = await new BigNumber(exchangeAmount).shiftedBy(18);
      // const [inputToken, outputToken] = await Promise.all( [tokens.BUSD.address, tokens.WBNB.address].map(tokenAddress => ( new Token(ChainId.MAINNET,tokenAddress,18))));

      // const pair = await Fetcher.fetchPairData(inputToken, outputToken, provider);
      // console.log("pair >>>>>>>>>>>>>>>>");
      // console.log(inputToken);
      // console.log(outputToken);
      // console.log("pair >>>>>>>>>>>>>>>>");

      //const shiftedPancakeValue = await new BigNumber(bakeOutput[1]).shiftedBy(-18);

      const bakeOutput = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [tokens.BUSD.address, tokens.WBNB.address]).call();
      if(dev) console.log(`PancakeSwap BUSD-WBNB: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput[1].toString())}`);

      const bakeOutput2 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [tokens.WBNB.address, tokens.RACA.address]).call();
      if(dev) console.log(`PancakeSwap WBNB-RACA: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput2[1].toString())}`);
      
      const bakeOutput3 = await pancakeSwap.methods.getAmountsOut(shiftedExchangeAmount, [tokens.RACA.address, tokens.BUSD.address]).call();
      if(dev) console.log(`PancakeSwap RACA-BUSD: ${web3.utils.fromWei(shiftedExchangeAmount.toString())} -> ${web3.utils.fromWei(bakeOutput3[1].toString())}`);

    })
    .on('error', error => {
      if(dev) console.log(error);
    });
}


getAbi(tokens.DAI.name,tokens.DAI.address);
//init();
