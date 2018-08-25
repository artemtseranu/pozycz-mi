const FakeClock = artifacts.require("FakeClock");

contract("FakeClock", (accounts) => {
  it("allows setting and getting time", async () => {
    const fakeClock = await FakeClock.deployed();
    const expectedTime = 1535226616963;
    await fakeClock.setTime.sendTransaction(expectedTime, {from: accounts[0]});
    const actualTime = await fakeClock.getTime();
    assert.equal(actualTime, expectedTime);
  });
});
