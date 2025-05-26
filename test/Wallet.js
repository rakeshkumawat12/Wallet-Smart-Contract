const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wallet Contract", function () {
  let wallet;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy();
    await wallet.waitForDeployment(); // For Ethers v6
  });

  it("should set the owner correctly", async () => {
    expect(await wallet.owner()).to.equal(owner.address);
  });

  it("should accept ether via transferToContract", async () => {
    const startTime = Math.floor(Date.now() / 1000) - 10;
    await wallet.connect(addr1).transferToContract(startTime, {
      value: ethers.parseEther("1"),
    });

    const balance = await ethers.provider.getBalance(wallet.target);
    expect(balance).to.equal(ethers.parseEther("1"));

    const history = await wallet.getTransactionHistory();
    expect(history.length).to.equal(1);
  });

  it("should reject transferToContract if timestamp is not passed", async () => {
    const futureTime = Math.floor(Date.now() / 1000) + 60;
    await expect(
      wallet.connect(addr1).transferToContract(futureTime, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("send after start time");
  });

  it("should emit Transfer on transferToUserViaContract", async () => {
    await wallet.connect(addr1).transferToContract(Math.floor(Date.now() / 1000) - 10, {
      value: ethers.parseEther("1"),
    });

    await expect(wallet.transferToUserViaContract(addr1.address, ethers.parseEther("0.5")))
      .to.emit(wallet, "Transfer")
      .withArgs(addr1.address, ethers.parseEther("0.5"));
  });

  it("should allow owner to withdraw", async () => {
    await wallet.connect(addr1).transferToContract(Math.floor(Date.now() / 1000) - 10, {
      value: ethers.parseEther("1"),
    });

    await wallet.withdrawFromContract(ethers.parseEther("0.5"));

    const balance = await ethers.provider.getBalance(wallet.target);
    expect(balance).to.equal(ethers.parseEther("0.5"));
  });

  it("should block blacklisted users", async () => {
    await wallet.blacklistUser(addr1.address);
    await expect(
      wallet.connect(addr1).transferToContract(Math.floor(Date.now() / 1000) - 10, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Address is blacklisted");
  });

  it("should toggle emergency state", async () => {
    await wallet.toggleStop("Test");
    expect(await wallet.stop()).to.be.true;
  });

  it("should transfer ETH to user via msg.value", async () => {
    const amount = ethers.parseEther("1");
    const prevBalance = await ethers.provider.getBalance(addr2.address);

    await wallet.connect(addr1).transferToUserViaMsgValue(addr2.address, {
      value: amount,
    });

    const newBalance = await ethers.provider.getBalance(addr2.address);
    expect(newBalance - prevBalance).to.equal(amount);
  });

  it("should allow receiveFromUser and emit events", async () => {
    await expect(wallet.connect(addr1).receiveFromUser({ value: ethers.parseEther("0.1") }))
      .to.emit(wallet, "ReceiveUser")
      .withArgs(addr1.address, owner.address, ethers.parseEther("0.1"));
  });

  it("should mark user suspicious on fallback", async () => {
    const fallbackTx = {
      to: wallet.target,
      data: "0x12345678", // anyy random data to trigger fallback
    };

    for (let i = 0; i < 5; i++) {
      await addr1.sendTransaction(fallbackTx);
    }

    await expect(
      wallet.connect(addr1).transferToContract(Math.floor(Date.now() / 1000) - 10, {
        value: ethers.parseEther("0.1"),
      })
    ).to.be.revertedWith("Activity found suspicious, Try later");
  });

  it("should allow emergency withdrawal", async () => {
    await wallet.connect(addr1).transferToContract(Math.floor(Date.now() / 1000) - 10, {
      value: ethers.parseEther("1"),
    });

    await wallet.toggleStop("Emergency");
    await wallet.emergencyWithdrawl();

    const balance = await ethers.provider.getBalance(wallet.target);
    expect(balance).to.equal(0n);
  });
});