const Clock = artifacts.require("Clock");

contract("Clock", () => {
  // Test that 'getTime' function executes successfully and returns a non-zero
  // value
  describe("getTime", () => {
    it("returns some value", async () => {
      const clock = await Clock.deployed();

      assert(await clock.getTime() > 0);
    });
  });
});
