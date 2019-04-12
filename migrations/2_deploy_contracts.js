const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {
    
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    console.log('deploying');
    deployer.deploy(FlightSuretyData)
    .then(() => {
        console.log('Data Contract', FlightSuretyData.address);
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
                .then(() => {
                    console.log('App Contract', FlightSuretyApp.address);
                    let config = {
                        localhost: {
                            url: 'http://127.0.0.1:8545/',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}