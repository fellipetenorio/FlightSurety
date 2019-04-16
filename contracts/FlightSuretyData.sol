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
    uint256 public constant FLIGHT_MAX_PRICE = 1 ether;
    uint256 public balance = 0;

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }
    mapping(address => Airline) airlines;
    mapping(address => uint256) airlineFunds;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        bool isInsured;
    }
    mapping(bytes32 => Flight) private flights;
    mapping(bytes32 => uint256) flightKeySurety;

    event FlightRegistered(bytes32 indexed account);

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
        airlines[msg.sender] = Airline({isRegistered : true, isFunded : false});
    }

    // modifiers
    modifier requireIsOperational() { require(operational, "Contract is currently not operational"); _;}
    modifier requireContractOwner() {require(msg.sender == contractOwner, "Caller is not contract owner"); _;}
    modifier isCallerAuthorized() { require(authorizedContracts[msg.sender] == 1, "Unauthorized access (Caller)"); _;}
    modifier requireFlightSuretyPrice() { require(msg.value <= FLIGHT_MAX_PRICE, "Max price is 1 ether"); _; }

    // Utils
    function isOperational() external view returns (bool) { return operational; }
    function setOperatingStatus (bool mode) external requireContractOwner { operational = mode; }
    function authorizeCaller(address dataContract) external requireIsOperational requireContractOwner {
        authorizedContracts[dataContract] = 1;
    }
    function unauthorizeCaller(address dataContract) external requireIsOperational requireContractOwner {
        authorizedContracts[dataContract] = 0;
    }

    // airline
    function unregisterAirline (address airline) external requireIsOperational isCallerAuthorized {
        airlines[airline] = Airline({isRegistered : false, isFunded : false});
    }

    function registerAirline (address airline) external requireIsOperational isCallerAuthorized {
        airlines[airline] = Airline({isRegistered : true, isFunded : false});
    }

    function isAirline (address airline) external view requireIsOperational isCallerAuthorized returns (bool) {
        return airlines[airline].isRegistered;
    }

    function isAirlineRegistred(address airline) external view requireIsOperational isCallerAuthorized returns (bool) {
        return airlines[airline].isRegistered;
    }

    function isAirlineFunded(address airline) external view requireIsOperational isCallerAuthorized returns (bool) {
        return airlines[airline].isFunded;
    }

    function updateAirlineFundState(address airline, bool newState) external requireIsOperational isCallerAuthorized {
        airlines[airline].isFunded = newState;
    }

    function setAirlineUnfunded(address airline) external requireIsOperational isCallerAuthorized {
        airlines[airline].isFunded = false;
    }

    function fundAirline (address owner) public 
    /*payable requireIsOperational isCallerAuthorized */ {
        // TODO
        //balance = balance.add(msg.value);
        airlines[owner].isFunded = true;
    }

    // fligth
    function buy (address buyer, string flightID) external payable 
        requireIsOperational requireFlightSuretyPrice requireContractOwner {
        bytes32 key = keccak256(abi.encodePacked(buyer, flightID));
        require(!flights[key].isInsured, "Flight already isured");
        flightKeySurety[key] = msg.value;
    }

    function creditInsurees () external pure {
        // TODO
    }

    function pay () external pure {
        // TODO
    }

    function getFlightKey (address airline, string memory flight, uint256 timestamp) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }
    
    // fallback
    function() external
    /*payable requireIsOperational isCallerAuthorized */ {
        fundAirline(msg.sender);
    }
}