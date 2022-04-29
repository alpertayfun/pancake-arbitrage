const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://api.bscscan.com/api?module=contract&action=getabi&address=0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82&apikey=3VIDJWVVU9882AA8YCRUQRTP7DFDNE5XBS'
};

axios.request(options).then(function (response) {
	console.log(JSON.parse(response.data.result));
}).catch(function (error) {
	console.error(error);
});