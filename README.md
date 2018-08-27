# ConsenSys Academy 2018 Developer Program Final Project: Sharing Platform

## Description

The smart contracts that this project implements, could be used to incentivize individuals to share their stuff with a larger circle of people, by minimizing risk involved in doing this, and allowing them to earn a special token.

## How to set up
### Requirements
* git
* truffle
* ganache-cli
* Browser with Metamask plugin
* IPFS
### Running development server
* Run `ganache-cli` in a separate terminal window or in the background
* Clone the repository
```
git clone https://github.com/artemtseranu/SharingEconomy
```
* Build and deploy contracts<br>
```
cd SharingEconomy
truffle compile && truffle migrate
```
* Install front-end dependencies and run webpack dev server<br>
```
cd client
npm install
npm run start
```
* Configure IPFS CORs to accept requests from `localhost:8081` and run IPFS daemon in the separate terminal window<br>
```
ipfs init
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:8081"]'
ipfs daemon
```
* You can now visit the app in the browser at `localhost:8081`
### Running tests
In order to be able to write better tests for contract functions that depend on block timestamps, an additional contract (`FakeClock`) is deployed if the current network ID is equal to `test`. In order for all tests to pass, they need to be run with:
```
truffle test --network=test
```

## User stories

Unfortunatelly I haven't been able to implement the UI for most of these user
stories in time. Only the underlying smart contract functionality is fully
implemented.

1. As a user I can create an offer to share some item
* Can provide a item's description
* Can upload item's photos
* Can specify a value of the item (in ether), which I expect to keep as guarantee
* Can specify a minimum and maximum amount of time for which I expect to share the item
* Can specify an amount of sharing tokens per unit of time I expect to receive when sharing the item
2. As a user I can create a request to borrow some item
* I can browse a list of all available offers
* I can create a request to borrow a specific item
  - Must specify a guarantee I am willing to provide
  - Must specify a minimum and maximum amount of time I promise to keep the item for
  - Must specify an amount of sharing tokens per unit of time I am willing to give for borrowing the item
  - Must specify an amount of time in which I promise to confirm the request if it's approved
3. As an offer's owner I can approve a request to borrow it
* I can see a list of all requests to borrow this offer
* I can approve a specific request
* After I've approved a request, I can't approve any other requests, unless the time to confirm, specified in the approved request, has expired and request hasn't been confirmed.
4. As an owner of an approved request, I can confirm that I've received the requested item
* After this an amount of my ether corresponding to the guarantee promised in the request, and an amount of my sharing tokens equal to `<maximum sharing time promised in the request> * <tokens per unit of time promised in the request>` is frozen.
5. As the owner of an item, for which the request to borrow it has been confirmed, I can confirm that an item has been returned
* If the borrower held the item for less than the minimum time promised in the request, I get a reward of sharing tokens equal to `<minimum time promised in the request> * <tokens per unit of time promised in the request>`. The rest of the frozen tokens is kept as a refund to the borrower.
* If the borrower held the item for more than the minimum time promised in the request, but less than the maximum time promised in the request, I get a reward of sharing tokens equal to `<time the borrower held the item> * <tokens per unit of time promised in the request>`. The rest of the frozen tokens is kept as a refund to the borrower.
* If the borrower held the item for more that the maximum time promised in the request, I get a reward of sharing tokens equal to `<maximum time promised in the request> * <tokens per unit of time promised in the request>`
6. As the borrower of an item which has been returned, I can withdraw the guarantee, frozen when I confirmed receiving the item
* If I held the item for less then maximum time promised in the request, I also get back a refund of sharing tokens
7. As the owner of an item, for which the request to borrow it has been confirmed, after the maximum amount of time promised in the request has passed, and the borrowed item hasn't been returned, I can claim the reward and guarantee

## Problems

1. Currently the only way to find a relevant offer is to browse the list of all available offers by loading chunks of previous blocks in the blockchain.
Possible solution: implement a way to create offer index off-chain, and use this index to search for offers by specific criteria. The index could be created locally on the user's machine, or hosted and maintained on separate servers (the latter would make the system less decentralized though).
2. Currently malicious user could refuse to accept the borrowed item back, in such a way getting rid of the unneeded item and claiming the reward.
  Possible solutions:
    * Implement a way for the borrower to create a complaint, and create an arbitration system for such complaints
    * Implement a reputation system
