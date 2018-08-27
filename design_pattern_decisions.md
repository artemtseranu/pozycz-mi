# Design pattern decisions
## Fail early and fail loud
I've always tried to use this pattern in functions which require specific conditions to be executed. This makes the code a lot clearer, and also greatly simplifies testing such functions.
## Restricting access
I've used this pattern for the circuit breaker and contract registry functionality, in a sense that only owner of those contracts can halt / resume execution of other functions via circuit breaker and set contract addresses in a registry. If this functionality was unprotected in this way, malicious actors could use it to easily deny service to other users.
## Auto deprecation
I haven't used this pattern, because there was no need to make any contract available for a limited amount of time.
## Mortal
I haven't used this pattern in a sense that a contract has a "kill" function, specifically designated to trigger selfdestruct, but one of the contracts (`SharingAgreement`) has two functions (`withdrawRefundAndGuarantee` and `claimRewardAndGuarantee`) which trigger selfdestruct in addition to performing other actions, because after any of these functions is executed, there's no other actions that can be performed with this contract.
## Pull over Push Payments
I didn't have a particular need to use this pattern, because I didn't have to protect any functions agains reentrancy attacks, or have to pay unknown number of accounts in after some action, but I've chosen to use pull over push in one case. In business logic there's an ability for the item owner to confirm that the item has been return to them, after this the owner should get a reward and the item borrower should get back a guarantee that he provided to borrow an item and a refund if any. I've decided to split this into two functions, one that is triggered by the owner to get a reward, and one that is triggered by the borrower to get back a refund and a guarantee, for two reasons:
1. In my opinion, two small functions are usually simpler and easier to understand than one big function.
2. Having the borrower to send a transaction to get back a refund and a guarantee, instead of transfering it to them when the owner confirms the item return, because this could be useful for other purposes in the future. For example the borrower in this transaction could also rate / review the item owner (for the reputation system). If the borrower would be payed out automatically, they could be hesitant spend ether just to leave a review.
## Circuit Breaker
I've decided to implement the Circuit Breaker for `confirmRequest` function of the `BorrowRequests` contract, because this function transfers value and deploys `SharingAgreement` contracts which locks up value. If there's a bug in the value transfer code, or `SharingAgreement` functions, it would be important to prevent any more value being transfered incorrectly or locked up in an invalid contract.
## State Machine
I haven't implemented this pattern, because any of the contracts have complex state transitions. Most of the functions that can be executed only in a specific state could be implemented with a simple flag. For example, `withdrawRefundAndGuarantee` function of `SharingAgreement` contract, can only be executed when `returnConfirmed` flag is set (when item's owner confirmed that item has been returned).
## Speed Bump
I haven't found the need for this for this project. I may have to think on this more though.
## Data Segregation
I've decided to put the logic for creating/updating/deleting item offers into a separate contract with as little dependencies on the other contracts as possible, to decrease the possibility of having to update the contract containing this code and therefore having to migrate all of the offer data.
