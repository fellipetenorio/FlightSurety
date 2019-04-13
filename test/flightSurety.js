var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    // You should use .call() to execute constant/view/pure functions that don't modify state variables

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        console.log('flightSurety.js flightSuretyData', config.flightSuretyData.address);
        console.log('flightSurety.js flightSuretyApp', config.flightSuretyApp.address);

        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);

        // register first airline (owner)
        await config.flightSuretyApp.registerFirstAirline();
        console.log('owner is Airline?', await config.flightSuretyData.isAirline.call(config.owner));
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty1) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = false;
        try {
            status = await config.flightSuretyData.isOperational();
        } catch (e) {
            console.log('mult1', e);
        }
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty2) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, {from: accounts[accounts.length - 2]});
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(multiparty3) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty4) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            let account = accounts[39];
            await config.flightSuretyApp.authorizeCaller(account);
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");
        await config.flightSuretyData.setOperatingStatus(true);
    });

    it('(airline1) cannot register an Airline using registerAirline() if it is not funded', async function () {
        // ARRANGE
        let result = true;

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(config.neverAirline);
        } catch (e) {}

        try {
            result = await config.flightSuretyData.isAirline(config.neverAirline);
        } catch (e) {
            console.log('(airline1) isAirline error', e);
        }

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline2) can be funded', async function () {
        let funded = false;
        try {
            await config.flightSuretyApp.fundAirline();
        } catch (e) {
            // console.log('1 - airline2 fundAirline error', e);
        }

        try {
            funded = await config.flightSuretyData.isAirlineFunded.call(config.owner, {from: config.flightSuretyApp.address});
        } catch (e) {
            // console.log('1 - airline2 fundAirline error', e);
        }
        assert.equal(funded, true, "Airline not funded");
    });

    it('(airline2) can register 2th, 3th and 4th Airlines', async function () {
        let airline2 = accounts[20];
        let airline3 = accounts[21];
        let airline4 = accounts[22];

        // now register the second airline
        try {
            await config.flightSuretyApp.registerAirline(airline2);
        } catch (e) {
             //console.log('2 - airline2 fundAirline error', e);
        }        try {
            await config.flightSuretyApp.registerAirline(airline3);
        } catch (e) {
             //console.log('2 - airline2 fundAirline error', e);
        }        try {
            await config.flightSuretyApp.registerAirline(airline4);
        } catch (e) {
             //console.log('2 - airline2 fundAirline error', e);
        }

        let result2 = await config.flightSuretyData.isAirline.call(airline2);
        let result3 = await config.flightSuretyData.isAirline.call(airline2);
        let result4 = await config.flightSuretyData.isAirline.call(airline2);

        assert.equal(result2, true, "Airline2 not registred");
        assert.equal(result3, true, "Airline3 not registred");
        assert.equal(result4, true, "Airline4 not registred");
    });

    it('(airline3) can\'t register 5th', async () => {
        let airline5 = accounts[23];
        // now register the second airline

        try {
            await config.flightSuretyApp.registerAirline(airline5);
        } catch (e) {}

        let result5 = await config.flightSuretyData.isAirline(airline5, {from: config.flightSuretyApp.address});

        assert.equal(result5, false, "Fifth is by votting!");
    });

//   it('(airline) can\'t repeat vote for new airline registration', async () => {
//     let eightth = accounts[8];

//     // try {
//     //     await config.flightSuretyApp.unregisterAirline(eightth);
//     // } catch (e) {
//     //     console.log('error removeAirline', e);
//     // }

//     try {
//         await config.flightSuretyApp.registerAirline(eightth);
//     } catch (e) {
//         console.log('error registerAirline', e);
//     }

//     let isRegistred = await config.flightSuretyData.isAirline(eightth, {from: config.flightSuretyApp.address});
//     let result = await config.flightSuretyApp.getVotesCount(eightth, {from: config.flightSuretyApp.address});

//     assert.equal(isRegistred, false, "From fifth airline need to vote for new airlines!");
//     assert.equal(result.toNumber(), 1, "Only one vot per registred airline for new registration!");
//   });

});