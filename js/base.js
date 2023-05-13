'use strict'
const ETHDIV = 10 ** 18;
const CHAINID = 280;
let PROVIDER;
if (window.ethereum) {
    PROVIDER = new ethers.providers.Web3Provider(window.ethereum);
    (async function () {
        let network = await PROVIDER.getNetwork();
        if (network['chainId'] != CHAINID) {
            alert('Network is not ARB. Requesting to change network');
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "280",
                    rpcUrls: ["https://testnet.era.zksync.dev"],
                }],
            });
        }
    })();
} else {
    PROVIDER = new ethers.providers.JsonRpcProvider("https://testnet.era.zksync.dev", {
        name: 'bnbtestnet',
        'chainId': 280
    });
}

const SIGNER = PROVIDER.getSigner();
const ADRS = {};
const ABIS = {};

ADRS['web3'] = "0xb6109F714bc403Ebd2A4e99595Af72559425aC46",
ADRS['factory'] = "0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006";
ADRS['router'] = "0xB3b7fCbb8Db37bC6f572634299A58f51622A847e";
ADRS['chef'] = "0x1Bb0b5585F81e81243498b6FC9417684B30135E1";
ADRS['pairweth'] = '0x7Fc10D69dcB205EF733AC041eA3E3934a3A089fB';
ADRS['weth'] = "0x20b28b1e4665fff290650586ad76e977eab90c5d";
ADRS['zif'] = "0x36e540644b8499A1F00dDc660d5E1C79025E7777";

ABIS['web3'] = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function balanceOfUnderlying(address) view returns (uint256)",
    "function transfer(address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "function ZKSEGGToFragment(uint256) view returns (uint256)",
    
];

ABIS['factory'] = [
    "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

ABIS['router'] = [
    "function getAmountsOut(uint, address[]) view returns (uint[])",
    "function swapExactETHForTokens(uint, address[], address, uint) payable returns (uint[])",
];

ABIS['chef'] = [
    "function totalStaked() view returns (uint256)",
    "function rewardPerBlock() view returns (uint256)",
    "function totalAllocPoint() view returns (uint256)",
    "function poolInfo(uint256) view returns (address, uint256, uint256, uint256)",
    "function pendingReward(uint256, address) view returns (uint256)",
    "function deposit(uint256, uint256)",
    "function withdraw(uint256, uint256)",
    "function claim(uint256, address)",
    "function userInfo(uint256, address) view returns (uint256, uint256, uint256, uint256)",
    "function correctTotalStaked()",
    "function rebaseManual()",
]

const CONTS = {};
const SIGNS = {};

for (let name in ABIS) {
    CONTS[name] = new ethers.Contract(ADRS[name], ABIS[name], PROVIDER);
    SIGNS[name] = CONTS[name].connect(SIGNER);
}

ABIS['token'] = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
];

for (let name of ['weth']) {
    CONTS[name] = new ethers.Contract(ADRS[name], ABIS['token'], PROVIDER);
    SIGNS[name] = CONTS[name].connect(SIGNER);
}

ABIS['pair'] = [
    "function token0() view returns (address)",
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1)",
    "function approve(address, uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
];


for (let name of ['weth']) {
    CONTS[`pair${name}`] = new ethers.Contract(ADRS[`pair${name}`], ABIS['pair'], PROVIDER);
    SIGNS[`pair${name}`] = CONTS[`pair${name}`].connect(SIGNER);
}

let CURBLOCK;
(async () => {
    CURBLOCK = await PROVIDER.getBlockNumber();
})();

////////////////////////////////// base

function INT(n) {
    return parseInt(n);
}

function STR(s) {
    return String(s);
}

function ROUND(v, n = 0) {
    return v.toFixed(n);
}

function BNB(value, n = 4) {
    value = INT(value);
    return ROUND(value / ETHDIV, n);
}

function WRAP(v) {
    return "[" + v + "]";
}

function COMMA(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function SHORTADR(adr) {
    return adr.slice(0, 6) + '..' + adr.slice(-4);;
}

function KEYS(dict) {
    return Object.keys(dict);
}

function ADELAY(milSec) {
    return new Promise(r => setTimeout(r, milSec));
}

function DELAY(milSec) {
    var start = new Date().getTime();
    var end = 0;
    while ((end - start) < milSec) {
        end = new Date().getTime();
    }
}

///////////////////////////////// html

function HREF(link, txt) {
    return `<a href="${link}">${txt}</a>`;
}


function makeElem(elemType, elemId = null, elemClass = null) {
    let elem = document.createElement(elemType);
    if (elemId) {
        elem.setAttribute('id', elemId);
    }
    if (elemClass) {
        elem.setAttribute('class', elemClass);
    }

    return elem;
}
let nullDiv = makeElem('div', 'NULL', null);
nullDiv.style.width = '1px';
nullDiv.style.display = 'none';
document.body.append(nullDiv);

function select(el, all = false) {
    el = el.trim();
    let elms = [...document.querySelectorAll(el)];
    if (elms.length == 0) {
        elms = [document.querySelector('#NULL')]; // how to erase inner?
    }

    if (all) {
        return elms;
    }

    return elms[0];
}

function displayText(el, text) {
    let els = select(el, true);
    if (els == null) {
        return;
    }

    for (var idx = 0; idx < els.length; idx++) {
        els[idx].innerHTML = text;
    }
}



function setCookie(name, value, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}




function copy(value) {
    const input = document.createElement('textarea');
    input.value = value;
    document.body.appendChild(input);

    var isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

    if (isiOSDevice) {

        var editable = input.contentEditable;
        var readOnly = input.readOnly;

        input.contentEditable = true;
        input.readOnly = false;

        var range = document.createRange();
        range.selectNodeContents(input);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        input.setSelectionRange(0, 999999);
        input.contentEditable = editable;
        input.readOnly = readOnly;

    } else {
        // document.body.appendChild(input);
        input.select();

    }

    document.execCommand('copy');
    //if (!isiOSDevice) {
    document.body.removeChild(input);
    //}
}

function swapComma(id, isOn) {
    var $input = $("#" + id);

    if (isOn == false) {
        $input.off("keyup");
        return;
    }

    $input.on("keyup", function (event) {

        // 1.
        var selection = window.getSelection().toString();
        if (selection !== '') {
            return;
        }

        // 2.
        if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) {
            return;
        }

        // 3
        var $this = $(this);
        var input = $this.val();

        // 4
        var input = input.replace(/[\D\s\._\-]+/g, "");

        // 5
        input = input ? parseInt(input, 10) : 0;

        // 6
        $this.val(function () {
            return (input === 0) ? "" : input.toLocaleString("en-US");
        });

    });
}


let inputHandlerBuy = function (e) {
    (async function () {
        valueIn = e.target.value;
        valueIn = valueIn.replace(/,/g, '');
        result = select('#buy-output');
        if (valueIn == 0) {
            result.value = 0;
            return;
        }

        valueIn = ethers.utils.parseEther(valueIn);
        valueOut = valueIn.mul(3330000);

        valueOut_ = ethers.utils.formatEther(valueOut);
        valueOut_ = parseInt(valueOut_);
        valueOut_ = numberWithCommas(valueOut_);
        result.value = valueOut_;

    })();
}




///////////////////////////////// web3

function BSC(type, txt) {
    return `https://bscscan.com/${type}/${txt}`;
}


function BIG(s, decimals = 18) {
    if (decimals == 18) {
        return ethers.utils.parseEther(s);
    } else {
        return ethers.utils.parseUnits(s, decimals);
    }
}

function ETH(big, decimals = 18) {
    if (decimals == 18) {
        return ethers.utils.formatEther(big);
    } else {
        return ethers.utils.formatUnits(big, decimals);
    }
}



function ADR(address) {
    let checksumAdr;
    try {
        checksumAdr = ethers.utils.getAddress(address);
    } catch (error) {
        alert('Wrong Format Address: [' + address + ']');

        return '';
    }
    return checksumAdr;
}




async function getBalance(adr) {
    let balance = await PROVIDER.getBalance(adr);

    return balance;
}


const getEthPrice = async () => {
    try {
        const response = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
        //const response = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot");
        const data = await response.json();
        //return data.data.amount;
        return data.USD;
    } catch (error) {
        console.log(error);
        return null;
    }
}

getEthPrice().then(price => {
    if (price) {
        //console.log(`Current ETH price: $${price}`);
        return price;
    } else {
        console.log("Failed to get ETH price");
    }
});


async function getPrice(name) {

    return 2000;
    let ca = "0x7afd064DaE94d73ee37d19ff2D264f5A2903bBB0";
    CONTS[`wethpair`] = new ethers.Contract(ca, ABIS['pair'], PROVIDER);
    let r = await CONTS[`wethpair`].getReserves();
    let t0 = await CONTS[`wethpair`].token0();

    if (t0 != ADRS[name]) {
        r = [r[1], r[0]]; // usdc, eth
    }

    return (r[0] / r[1]) / 1e12; // usdc / eth
}



let CURADR = null;
async function getCurAdr() {
    try {
        CURADR = await SIGNER.getAddress();
    } catch (err) {
        console.log('not connected yet');
        CURADR = null;
    }
}



function displayAccountInformation() {
    let shortAdrStr = SHORTADR(CURADR);

    displayText('.connect-wallet', shortAdrStr);

    getBalance(CURADR)
        .then((res) => {
            displayText('#balance-number', BNB(res, 4));
        });

    return;
}



async function handleAccountsChanged(accounts) {
    if (accounts.length == 0) {
        displayText("connectResult", 'Please Connect Metamask');
        return;
    }

    if (accounts.length == 0) {
        console.log('no acount');
        CURADR = null;
        return;
    }
    CURADR = ADR(accounts[0]);
    displayAccountInformation();
}

async function conn(func = null, popup = false) {
    try {
        /* CURADR = await PROVIDER.send("eth_requestAccounts", []) */
        ;
        let accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        }); // eth_requestAccounts
        await handleAccountsChanged(accounts);
        await doAfterConnect();
        if (func != null) {
            await func();
        }

    } catch (err) {
        if (err == 'ReferenceError: ethereum is not defined') {
            alert('Use Dapp to connect wallet!');
            return;
        }

        console.log(err);
        if ('message' in err) {
            err = err['message'];
        }

        if (popup) {
            alert(JSON.stringify(err));
        }
    }
}

async function doAfterConnect() { // dummy
}

function handleChainChanged(_chainId) {
    // Reload the page
    window.location.reload();
}





////////////////////////////////// tx

async function ERR(err) {
    let result = err;

    if (!('code' in err)) {
        console.log('no code', err);
        return result;
    }

    if (err['code'] == -32603) {
        if (!('data' in err)) {
            console.log('no data', err);
            return result;
        }

        let data = err['data'];
        if (!('code' in data)) {
            console.log('no code data', err);
            return result;
        }

        if (data['code'] == 3) {
            msg = data['message'];
            result = msg;
            return result;
        }

        if (data['code'] == -32000) {
            msg = data['message'];
            result = msg;
            return result;
        }
    }

    return result;
}

async function SIGN(name, msg, bin = false) {
    if (bin == true) {
        msg = ethers.utils.arrayify(msg);
    }
    return await SIGNS[name].signMessage(msg);
}


async function SEND_ETH(from = ADRS["fund"], to = ADRS["fund"], value = '0.0') {
    const data = {
        from: from,
        to: to,
        value: BIG(value),
        /* nonce: window.ethersProvider.getTransactionCount(send_account, "latest"),
            gasLimit: ethers.utils.hexlify(gas_limit), // 100000
            gasPrice: gas_price, */
    };

    try {
        let result = await SIGNER.sendTransaction(data);
        console.log('result', result);
        return [false, result];
    } catch (err) {
        err = await ERR(err);
        return [true, err];
    }
}

async function READ_TX(name, method, args, from = "0xe7F0704b198585B8777abe859C3126f57eB8C989") {
    const overrides = {
        from: from,
    };

    try {
        let result = await CONTS[name][method](...args, overrides);
        console.log('result', result);
        return [false, result];
    } catch (err) {
        err = await ERR(err);
        return [true, err];
    }

}

async function GAS(name, method, args, value = null) {
    let overrides = {};
    if (value != null) {
        overrides['value'] = BIG(value);
    }
    let result;
    try {
        result = await SIGNS[name].estimateGas[method](...args, overrides);
        //console.log('result', result);
        return [false, result];
    } catch (err) {
        result = await ERR(err);
        return [true, result];
    };
}

async function SEND_TX(name, method, args, value = null, check = true) {
    let overrides = {};
    if (value != null) {
        overrides['value'] = BIG(value);
    }
    if (check == true) {
        let [res, data] = await GAS(name, method, args, value);
        if (res == true) {
            console.log(res);
            return [true, data];
        }
        // use gas result
        //console.log('gas', res, INT(data));
        overrides['gasLimit'] = INT(data * 1.2);
    }
    try {
        let result;
        result = await SIGNS[name][method](...args, overrides);
        const receipt = await result.wait();
        if (receipt) {
            getData();
            await updataData_dashbord();
            await updateData_staked();
            await updateData_stakedlp();
            await updateData_approve()
        }
        //console.log('hash', result['hash']);
        //console.log('result', result);
        return [false, result];

        // if (wait == true) {
        //   let txResult = await result.wait();
        //   console.log('txResult', txResult);
        //   return [ false, txResult ];
        //   // event, eventSignature
        // } else {

        // }
        /* console.log(tx.hash); */
        // wait()
        // receipt.events
    } catch (err) {
        err = await ERR(err);
        return [true, err];
    }
}


let buyTxhashData;
async function privateBuy() {
    let buyAmount = select('#buy-input').value;
    let {
        res,
        data
    } = await SEND_ETH(CURADR, ADRS['fund'], buyAmount);
    if (res == true) {
        // err
        return [true, data];
    }

    let buyResult = select('#buy-result');
    buyResult.innerHTML = 'Success';
    let buyTxhash = select('#buy-txhash');
    buyTxhash.innerHTML = HREF(BSC('tx', data.hash), SHORTADR(data.hash));
    buyTxhashData = data.hash;
}


/* 
await CONTS[name].balanceOf(adr)
 */

/* SIGNS[name].transfer(adr, balance); */

/* CONTS[name].on("Transfer", (from, to, amount, event) => {
  console.log(`${ from } sent ${ formatEther(amount) } to ${ to}`);
      // The event object contains the verbatim log data, the
    // EventFragment and functions to fetch the block,
    // transaction and receipt and event functions
})
 */
// filter

// while (true) {
// 	if (isScriptLoaded == SCRIPTS.length) {
//     break;
//   }

//   DELAY(100);
// }


(async () => {
    if (window.ethereum) {
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);
    }
})();

async function updataData_dashbord() {
    let totalSupply = await CONTS['web3'].totalSupply() / ETHDIV;
    //let balchef = await CONTS['web3'].balanceOf(ADRS["chef"]);
    let balchefOfUnderlying = await CONTS['web3'].balanceOfUnderlying(ADRS["chef"]);
    let zif = await CONTS['web3'].balanceOf(ADRS["zif"]);
    let circulatingSupply = totalSupply;
    let mcap = price * circulatingSupply;
    displayText("#cirSupply", `${COMMA(ROUND(circulatingSupply, 2))}`);
    displayText("#stakedRate", `$${COMMA(ROUND(balchefOfUnderlying / (10 ** 24) / circulatingSupply * 100, 2))}%`);
    displayText("#zif", `${COMMA(ROUND(zif / ETHDIV, 2))}`);    
    displayText("#mcap", `$${COMMA(ROUND(mcap),2)}`);
}

async function updateData_approve() {
    let allowance = await CONTS['pairweth'].allowance(CURADR, ADRS['chef']);
    if (allowance > 0) {
        select('#approve').style.display = "none";
    } else {
        select('#stakelp').style.display = "none";
    }
}

async function updateData_staked() {
    balance = await CONTS['web3'].balanceOf(CURADR);
    balance = balance / ETHDIV;
    let data_staked = await CONTS['chef'].userInfo(0, CURADR);
    stakedAmount = data_staked[0];
    //let rewardDebt_staked = data_staked[1];
    a = data_staked[3];         //zEGGsScalingFactorWhenStake
    displayText("#staked", `${COMMA(ROUND(Number(stakedAmount * a / (10 ** 24) / ETHDIV), 2))}`);
    displayText("#stakedInUsd", `$${COMMA(ROUND(Number(stakedAmount * a / (10 ** 24) / ETHDIV * price), 2))}`);
    let pending_staked = await CONTS['chef'].pendingReward(0, CURADR);
    pending_staked = pending_staked / ETHDIV;
    displayText("#pending", `${COMMA(INT(pending_staked, 3))}`);
    displayText("#balance", `${COMMA(INT(balance, 3))} $zEGG`);
    displayText("#balanceInUsd", `$${COMMA(INT(balance * price, 3))}`);
}

async function updateData_stakedlp() {
    balancelp = await CONTS['pairweth'].balanceOf(CURADR);
    balancelp = balancelp / ETHDIV;

    let data_stakedlp = await CONTS['chef'].userInfo(1, CURADR);
    stakedlpAmount = data_stakedlp[0];
    //let rewardDebt_stakedlp = data_stakedlp[1];
    displayText("#stakedlp", `${COMMA(ROUND(Number(stakedlpAmount / ETHDIV), 2))} $LPs`);
    displayText("#balancelp", `${COMMA(INT(balancelp, 2))} $LPs`);
    displayText("#balancelpInUsd", `$${COMMA(ROUND((await CONTS['web3'].balanceOf(ADRS['pairweth']) / await CONTS['pairweth'].totalSupply()) * balance * price, 2))}`);
    updateData_approve();
    let pending_stakedlp = await CONTS['chef'].pendingReward(1, CURADR);
    pending_stakedlp = pending_stakedlp / ETHDIV;
    displayText("#pendinglp", `${COMMA(INT(pending_stakedlp, 3))}`);
}

async function getData() {
    ethPrice = await getEthPrice();
    totalSupply = await CONTS['web3'].totalSupply() / ETHDIV;
    balanceOfchef = await CONTS['web3'].balanceOf(ADRS["chef"]);
    
    let liqReserves = await CONTS['pairweth'].getReserves();
    price = liqReserves[0] / liqReserves[1] * ethPrice;
    displayText("#price", `$${COMMA(ROUND(price, 10))}`);
    await getCurAdr();
    if (CURADR == null) {
        // connect wallet button
        return;
    }
    await doAfterConnect();

    let rewardPerBlock = await CONTS['chef'].rewardPerBlock();
    let totalAllocPoint = await CONTS['chef'].totalAllocPoint();

    //staked             
    let poolinfo = await CONTS['chef'].poolInfo(0);
    let allocPoint_s = poolinfo[1];
    let staked = await CONTS['web3'].balanceOf(ADRS["chef"]);
    let ra = rewardPerBlock / staked * allocPoint_s / totalAllocPoint;
    let apy = ((ra) * ((60 / 12) * 60 * 24 * 365)) * 100;
    let dailyroi = (ra) * ((60 / 12) * 60 * 24) * 100;
    displayText("#apy", `${COMMA(ROUND(apy, 2))}%`);
    displayText("#dailyroi", `Daily ROI ${COMMA(ROUND(dailyroi, 2))}%`);

    //stakedlp
    let poolinfolp = await CONTS['chef'].poolInfo(1);
    let allocPoint_lp = poolinfolp[1];
    let stakedlp = await CONTS['pairweth'].balanceOf(ADRS["chef"]);
    stakedlp = stakedlp * (await CONTS['web3'].balanceOf(ADRS['pairweth']) / await CONTS['pairweth'].totalSupply());
    let ralp = rewardPerBlock / staked * allocPoint_lp / totalAllocPoint;
    let apy_lp = ((ralp) * ((60 / 12) * 60 * 24 * 365)) * 100;
    let dailyroi_lp = (ralp) * ((60 / 12) * 60 * 24) * 100;
    displayText("#apylp", `${COMMA(ROUND(apy_lp, 2))}%`);
    displayText("#dailyroilp", `Daily ROI ${COMMA(ROUND(dailyroi_lp, 2))}%`);

    await updateData_approve();
}

async function stake(amount) {
    amount = amount * 10 ** 18;
    amount = amount.toLocaleString();
    amount = amount.toString().replace(/\$|,/g, '');
    await SEND_TX('chef', 'deposit', [0, amount]);
}

async function withdraw(amount) {
    amount = amount * 10 ** 18;
    amount = amount / a * 10 ** 24;
    amount = amount.toLocaleString();
    amount = amount.toString().replace(/\$|,/g, '');
    await SEND_TX('chef', 'withdraw', [0, amount]);
}

async function claim(address) {
    await SEND_TX('chef', 'claim', [0, address]);
}

async function stakelp(amount) {
    amount = amount * 10 ** 18;
    amount = amount.toLocaleString();
    amount = amount.toString().replace(/\$|,/g, '');
    await SEND_TX('chef', 'deposit', [1, amount]);
}

async function withdrawlp(amount) {
    amount = amount * 10 ** 18;
    amount = amount.toLocaleString();
    amount = amount.toString().replace(/\$|,/g, '');
    await SEND_TX('chef', 'withdraw', [1, amount]);
}

async function claimlp(address) {
    await SEND_TX('chef', 'claim', [1, address]);
}

async function approve() {
    await SEND_TX('pairweth', 'approve', [ADRS["chef"], "115792089237316195423570985008687907853269984665640564039457584007913129639935"]);
}

async function doAfterConnect() {
    displayText('#connect', SHORTADR(CURADR));
    await updataData_dashbord();
    await updateData_staked();
    await updateData_stakedlp();
}

async function rebase() {
    await SEND_TX('chef', 'rebaseManual', []);
}

async function correct() {
    await SEND_TX('chef', 'correctTotalStaked', []);
}
