# Avoiding common attacks
## Reentrancy attacks
I haven't found many places in this project's contracts where reentrancy attacks are possible, because I don't have functions that call any untrusted contracts. There're two functions (`withdrawRefundAndGuarantee` and `claimRewardAndGuarantee` in `SharingAgreement` contract) which send ether to an external account. In these cases I made sure that this would be the last action performed in a function, after all of the changes to the contract state already took place.
## Transaction Ordering
I don't think there's any functionality in the project's contracts, that would be attractive enough for the attackers in terms of reward / resources expended to game by manipulating transaction order.
## Timestamp Dependence
There're a few functions that are using timestamps. In most cases this is fine, because business logic considers time at the scale of hours and 30 second window in which miners can manipulate timestamps, wouldn't make much of a difference. There's one place where I found this to be problematic though. `confirmReturn` function in `SharingAgreement` contract, when calculating the amount of tokens to transfer to the item's owner as a reward, rounds the timestamp up to the nearest hour, so the additional microsecond could be an hour worth of tokens difference. In the future version this could be improved by working at the scale of microseconds instead of hours in this case.
## Integer overflow / underflow
I'm using `SafeMath` library in places which I found to be vulnerable to this type of attack. An example of such vulnerability would be setting causing integer overflow by setting very high values for the `minHours` or `maxHours` fields of `BorrowRequest`, which are multiplied by `60 * 60 * 1000` to get microseconds when determining item owner's reward, which in turn can cause integer overflow and result in smaller reward.
## Denial of service with gas limit
I haven't found any code that is vulnerable to this. There's no functions that have an unbounded operation in them.
## Force sending Ether
I haven't found any code that is vulnerable to this. There's no functions that makes decisions based on the contract's Ether balance.
