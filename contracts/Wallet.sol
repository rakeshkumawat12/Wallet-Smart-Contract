// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
//Transaction - from,to,timings,amount
contract Wallet {
    struct Transaction {
        address from;
        address to;
        uint timestamp;
        uint amount;
    }

    Transaction[] public transactionHistory;

    address public owner;
    string public str;
    bool public stop;
    event Transfer(address receiver, uint amount);
    event Receive(address sender, uint amonut);
    event ReceiveUser(address sender, address receiver, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You don't have access");
        _;
    }
    mapping(address => uint) suspiciousUser;

    modifier getSuspiciousUser(address _sender) {
        require(
            suspiciousUser[_sender] < 5,
            "Activity found suspicious, Try later"
        );
        _;
    }

    modifier isEmergencyDeclared() {
        require(stop == false, "Emergency declared");
        _;
    }

    function toggleStop() external onlyOwner {
        stop = !stop;
    }

    function changOwner(address newOwner) public onlyOwner isEmergencyDeclared {
        owner = newOwner;
    }

    /**Contract related functions**/
    function transferToContract(
        uint _startTime
    ) external payable getSuspiciousUser(msg.sender) {
        require(block.timestamp > _startTime, "send after start time");
        transactionHistory.push(
            Transaction({
                from: msg.sender,
                to: address(this),
                timestamp: block.timestamp,
                amount: msg.value
            })
        );
    }

    function transferToUserViaContract(
        address payable _to,
        uint _weiAmount
    ) external onlyOwner {
        require(address(this).balance >= _weiAmount, "Insufficient Balance");
        require(_to != address(0), "Adress format incorrect");
        _to.transfer(_weiAmount);
        transactionHistory.push(
            Transaction({
                from: msg.sender,
                to: _to,
                timestamp: block.timestamp,
                amount: _weiAmount
            })
        );
        emit Transfer(_to, _weiAmount);
    }

    function withdrawFromContract(uint _weiAmount) external onlyOwner {
        require(address(this).balance >= _weiAmount, "Insuffficient balance");
        payable(owner).transfer(_weiAmount);
        transactionHistory.push(
            Transaction({
                from: address(this),
                to: owner,
                timestamp: block.timestamp,
                amount: _weiAmount
            })
        );
    }

    function getContractBalanceInWei() external view returns (uint) {
        return address(this).balance;
    }

    /**User related functions**/
    function transferToUserViaMsgValue(address _to) external payable {
        require(address(this).balance >= msg.value, "Insufficient Balance");
        require(_to != address(0), "Adress format incorrect");
        payable(_to).transfer(msg.value);
        transactionHistory.push(
            Transaction({
                from: msg.sender,
                to: _to,
                timestamp: block.timestamp,
                amount: msg.value
            })
        );
    }

    //event - sender,receiver, amount
    function receiveFromUser() external payable {
        require(msg.value > 0, "Wei Value must be greater than zero");
        payable(owner).transfer(msg.value);
        emit ReceiveUser(msg.sender, owner, msg.value);
        transactionHistory.push(
            Transaction({
                from: msg.sender,
                to: owner,
                timestamp: block.timestamp,
                amount: msg.value
            })
        );
    }

    function getOwnerBalanceInWei() external view returns (uint) {
        return owner.balance;
    }

    receive() external payable {
        transactionHistory.push(
            Transaction({
                from: msg.sender,
                to: address(this),
                timestamp: block.timestamp,
                amount: msg.value
            })
        );
        emit Receive(msg.sender, msg.value);
    }

    function suspiciousActivity(address _sender) public {
        suspiciousUser[_sender] += 1;
    }

    fallback() external {
        suspiciousActivity(msg.sender);
    }

    function getTransactionHistory()
        external
        view
        returns (Transaction[] memory)
    {
        return transactionHistory;
    }

    function emergencyWithdrawl() external {
        require(stop == true, "Emergency not declared");
        payable(owner).transfer(address(this).balance);
    }
}

//Add the following features
//1.Setting and Changing Owner done
//2.Emergency Stop
//3. Emergency Withdrawl
//4. Check for invalid address done
//5. Transaction history - from,to,amount,timestamp done
