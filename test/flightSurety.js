
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
      config = await Test.Config(accounts);
      console.log('App Contract', config.flightSuretyApp.address);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    } catch (e) {
        console.log('registerAirline error', e);
    }
    
    let result = await config.flightSuretyData.isAirline(newAirline, {from: config.flightSuretyApp.address}); 
    
    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
  });

  it('(airline) can register the first Airlinen, only once', async () => {
    try {
        await config.flightSuretyApp.registerFirstAirline();
        await config.flightSuretyApp.registerFirstAirline({from:config.neverAirline});
    } catch(e){}

    let result = await config.flightSuretyData.isAirline(config.owner, {from: config.flightSuretyApp.address});
    let result2 = await config.flightSuretyData.isAirline(config.neverAirline, {from: config.flightSuretyApp.address});
    assert.equal(result, true, "First Airline not registred");
    assert.equal(result2, false, "Canno't register for the first time twice");
  });
  
  it('(airline) can register the second Airline', async () => {
    let newAirline = accounts[2];
    try {
        await config.flightSuretyApp.fundAirline({from: config.owner, value: config.airlineFund});
    } catch(e){}
    
    // now register the second airline
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.owner});
    } catch (e) {
        console.log('registerAirline error', e);
    }

    let result = await config.flightSuretyData.isAirline(newAirline, {from: config.flightSuretyApp.address});
    assert.equal(result, true, "Second Airline not registred");
  });
  
  it('(airline) can register third and fourth but no more', async () => {
    let third = accounts[3];
    let fourth = accounts[4];
    let fifth = accounts[5];
    let sixth = accounts[6];
    let seventh = accounts[7];
    // now register the second airline
    try {
        await config.flightSuretyApp.registerAirline(third, {from: config.owner});
        await config.flightSuretyApp.registerAirline(fourth, {from: config.owner});
        await config.flightSuretyApp.registerAirline(fifth, {from: config.owner});
        await config.flightSuretyApp.registerAirline(sixth, {from: config.owner});
        await config.flightSuretyApp.registerAirline(seventh, {from: config.owner});
    } catch (e) {
        console.log('registerAirline', e);
    }

    let result3 = await config.flightSuretyData.isAirline(third, {from: config.flightSuretyApp.address});
    let result4 = await config.flightSuretyData.isAirline(fourth, {from: config.flightSuretyApp.address});
    let result5 = await config.flightSuretyData.isAirline(fifth, {from: config.flightSuretyApp.address});
    let result6 = await config.flightSuretyData.isAirline(fifth, {from: config.flightSuretyApp.address});
    let result7 = await config.flightSuretyData.isAirline(fifth, {from: config.flightSuretyApp.address});

    assert.equal(result3, true, "Second Airline not registred");
    assert.equal(result4, true, "Second Airline not registred");
    assert.equal(result5, false, "Fifth is by votting!");
    assert.equal(result6, false, "Fifth is by votting!");
    assert.equal(result7, false, "Fifth is by votting!");
  });
  
  it('(airline) can\'t repeat vote for new airline registration', async () => {
    let eightth = accounts[8];
    
    // try {
    //     await config.flightSuretyApp.unregisterAirline(eightth);
    // } catch (e) {
    //     console.log('error removeAirline', e);
    // }
    
    try {
        await config.flightSuretyApp.registerAirline(eightth);
    } catch (e) {
        console.log('error registerAirline', e);
    }

    let isRegistred = await config.flightSuretyData.isAirline(eightth, {from: config.flightSuretyApp.address});
    let result = await config.flightSuretyApp.getVotesCount(eightth, {from: config.flightSuretyApp.address});
    
    assert.equal(isRegistred, false, "From fifth airline need to vote for new airlines!");
    assert.equal(result.toNumber(), 1, "Only one vot per registred airline for new registration!");
  });

});