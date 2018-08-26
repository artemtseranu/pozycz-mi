const Clock = artifacts.require("Clock");

contract("Clock", () => {
  describe("getTime", () => {
    it("returns some value", async () => {
      const clock = await Clock.deployed();

      assert(await clock.getTime() > 0);
    });
  });
});
