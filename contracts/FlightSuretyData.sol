pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => uint256) authorizedContracts;                    // register authorizedContracts
    uint256 airlineVotingThreshold = 4;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;
    struct Airline {
        bool isRegistered;
        bool isFunded;
    }
    mapping(address => Airline) airlines;
    // handle consesus to register airline
    mapping(address => address[]) airlineConsensus; // newAirline => registredAirline[]
    uint256 airlineCount = 0;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineRegistred(address airline);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier isCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Unauthorized access (Caller)");
        _;
    }

    modifier isRegistredAirline(address registredAirline) {
        require(airlineCount == 0 || airlines[msg.sender].isRegistered, "Airline not registred");
        _;
    }

    modifier isNewAirline(address airline) {
        require(!airlines[airline].isRegistered, "Airline already registred");
        _;
    }

    // Airline only fund once
    modifier isAirlineNotFunded(address airline) {
        require(airlines[airline].isRegistered, "Airline not registred");
        require(!airlines[airline].isFunded, "Airline already funded");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function authorizeCaller(address dataContract) external requireContractOwner {
        authorizedContracts[dataContract] = 1;
    }

    function unauthorizeCaller(address dataContract) external requireContractOwner {
        authorizedContracts[dataContract] = 0;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (address airline, address registredAirline)
                            external
                            isCallerAuthorized
                            isRegistredAirline(registredAirline)
                            isNewAirline(airline)
                            returns(bool, bool)
    {
        if(airlineCount <= airlineVotingThreshold) {
            airlines[airline] = Airline({isRegistered: true, isFunded: false});
            airlineCount = airlineCount.add(1);

            return (true, true);
        }

        // need consensus (half of registred airline  to approve)
        // count consensus
        bool isDuplicate = false;
        for(uint c=0; c<airlineConsensus[airline].length; c++) {
            if(airlineConsensus[airline][c] == msg.sender) {
                isDuplicate = true;
                break;
            }
        }
        require(!isDuplicate, "Registred Airline already voted for this new Consesus");

        // check if can register airlinbe
        if(airlineConsensus[airline].length >= airlineCount.div(2)) {
            // for concurrency purposes will check again
            require(!airlines[airline].isRegistered, "Airline already registred");

            airlines[airline] = Airline({isRegistered: true, isFunded: false});

            // register airline
            airlineCount = airlineCount.add(1);

            emit AirlineRegistred(airline);
        }

    }

    // function airlineSubmitFunds(address airline) 
    //     external payable 
    //     isCallerAuthorized
    //     isAirlineRegistred
    // {
        
    // }

   /**
    * @dev Verify if an address is a Airline
    *
    */   
    function isAirline
                            (address airline
                            )
                            public
                            view
                            isCallerAuthorized
                            returns (bool)
    {
        return airlines[airline].isRegistered;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

