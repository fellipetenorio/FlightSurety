
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0xffcf8fdee72ac11b5c542428b35eef5769c409f0",
        "0x22d491bde2303f2f43325b2108d26f1eaba1e32b",
        "0xe11ba2b4d45eaed5996cd0823791e0c93114882d",
        "0xd03ea8624c8c5987235048901fb614fdca89b117",
        "0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc",
        "0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9",
        "0x28a8746e75304c0780e011bed21c72cd78cd535e",
        "0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e",
        "0x1df62f291b2e969fb0849d99d9ce41e2f137006e",
        "0x610bb1573d1046fcb8a70bbbd395754cd57c2b60",
        "0x855fa758c77d68a04990e992aa4dcdef899f654a",
        "0xfa2435eacf10ca62ae6787ba2fb044f8733ee843",
        "0x64e078a8aa15a41b85890265648e965de686bae6",
        "0x2f560290fef1b3ada194b6aa9c40aa71f8e95598",
        "0xf408f04f9b7691f7174fa2bb73ad6d45fd5d3cbe",
        "0x66fc63c2572bf3add0fe5d44b97c2e614e35e9a3",
        "0xf0d5bc18421fa04d0a2a2ef540ba5a9f04014be3",
        "0x325a621dea613bcfb5b1a69a7aced0ea4afbd73a",
        "0x3fd652c93dfa333979ad762cf581df89baba6795",
        "0x73eb6d82cfb20ba669e9c178b718d770c49bb52f",
        "0x9d8e5fac117b15daced7c326ae009dfe857621f1",
        "0x982a8cbe734cb8c29a6a7e02a3b0e4512148f6f9",
        "0xcdc1e53bdc74bbf5b5f715d6327dca5785e228b4",
        "0xf5d1eaf516ef3b0582609622a221656872b82f78",
        "0xf8ea26c3800d074a11bf814db9a0735886c90197",
        "0x2647116f9304abb9f0b7ac29abc0d9ad540506c8",
        "0x80a32a0e5ca81b5a236168c21532b32e3cbc95e2",
        "0x47f55a2ace3b84b0f03717224dbb7d0df4351658",
        "0xc817898296b27589230b891f144dd71a892b0c18",
        "0x0d38e653ec28bdea5a2296fd5940aab2d0b8875c",
        "0x1b569e8f1246907518ff3386d523dcf373e769b6",
        "0xcbb025e7933fadfc7c830ae520fb2fd6d28c1065",
        "0xddeea4839bbed92bdad8ec79ae4f4bc2be1a3974",
        "0xbc2cf859f671b78ba42ebb65deb31cc7fec07019",
        "0xf75588126126ddf76bdc8aba91a08f31d2567ca5",
        "0x369109c74ea7159e77e180f969f7d48c2bf19b4c",
        "0xa2a628f4eee25f5b02b0688ad9c1290e2e9a3d9e",
        "0x693d718ccfade6f4a1379051d6ab998146f3173f",
        "0x845a0f9441081779110fee40e6d5d8b90ce676ef",
        "0xc7739909e08a9a0f303a010d46658bdb4d5a6786",
        "0x99cce66d3a39c2c2b83afceff04c5ec56e9b2a58",
        "0x4b930e7b3e491e37eab48ecc8a667c59e307ef20",
        "0x02233b22860f810e32fb0751f368fe4ef21a1c05",
        "0x89c1d413758f8339ade263e6e6bc072f1d429f32",
        "0x61bbb5135b43f03c96570616d6d3f607b7103111",
        "0x8c4ce7a10a4e38ee96fed47c628be1ffa57ab96e",
        "0x25c1230c7efc00cfd2fcaa3a44f30948853824bc",
        "0x709f7ae06fe93be48fbb90ffddd69e2746fa8506",
        "0xc0514c03d097fcbb77a74b4da5b594ba473b6ce1",
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new();

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};