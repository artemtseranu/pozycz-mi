const Clock = artifacts.require("Clock");

contract("Clock", () => {
  describe("getTime", () => {
    it("current time", async () => {
      const clock = await Clock.deployed();
      const time = await clock.getTime();
      const block = await web3.eth.getBlock(web3.eth.blockNumber);
      assert.equal(time, block.timestamp);
    });
  });
});
