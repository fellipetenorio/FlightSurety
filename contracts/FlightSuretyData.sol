pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => uint) authorizedContracts;                    // register authorizedContracts

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;
    uint256 public balance = 0;

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }
    mapping(address => Airline) airlines;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

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
        _;
        // All modifiers require an "_" which indicates where the function body will be added
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

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() external view returns (bool)
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

    function authorizeCaller(address dataContract) external requireIsOperational requireContractOwner {
        authorizedContracts[dataContract] = 1;
    }

    function unauthorizeCaller(address dataContract) external requireIsOperational requireContractOwner {
        authorizedContracts[dataContract] = 0;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    //region airline
    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function unregisterAirline
    (address airline)
    external
    requireIsOperational
    isCallerAuthorized
    {
        airlines[airline] = Airline({isRegistered : false, isFunded : false});
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline
    (address airline)
    external
    requireIsOperational
    isCallerAuthorized
    {
        airlines[airline] = Airline({isRegistered : true, isFunded : false});
    }

    /**
     * @dev Verify if an address is a Airline
     *
     */
    function isAirline (address airline) external view requireIsOperational returns (bool)
    {
        return airlines[airline].isRegistered;
    }

    function isAirlineRegistred(address airline) external view requireIsOperational isCallerAuthorized returns (bool) {
        return airlines[airline].isRegistered;
    }

    function isAirlineFunded(address airline) external view
    requireIsOperational
    isCallerAuthorized
    returns (bool) {
        return airlines[airline].isFunded;
    }

    function updateAirlineFundState(address airline, bool newState) external
    requireIsOperational
    isCallerAuthorized {
        airlines[airline].isFunded = newState;
    }

    function setAirlineUnfunded(address airline) external
    requireIsOperational isCallerAuthorized {
        airlines[airline].isFunded = false;
    }

    //endregion

    //region Flight
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
    function fundAirline (address owner) public payable
        requireIsOperational
        isCallerAuthorized
    {
        balance = balance.add(msg.value);
        airlines[owner].isFunded = true;
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    pure
    internal
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }
    //endregion
    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
    external
    payable
    requireIsOperational
    isCallerAuthorized
    {
        fundAirline(msg.sender);
    }
}

