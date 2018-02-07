var Conference = artifacts.require("./Conference.sol");

contract('Conference', function(accounts) {
    it("Initial conference settings should match", async () => {
        try{
            let instance = await Conference.deployed({from: accounts[0]});
            let quota = await
            instance.quota.call();
            assert.equal(quota, 500, "Quota doesn't match!");
            let num = await
            instance.numRegistrants.call();
            assert.equal(num, 0, "Registrants should be zero!");
            let organizer = await
            instance.organizer.call();
            assert.equal(organizer, accounts[0], "Owner doesn't match!");
        }catch(err){
            console.log(err);
        }
    });

    it("Should update quota", async () => {
        try{
            let instance = await Conference.deployed({from:accounts[0]});
            let quota = await instance.quota.call();
            assert.equal(quota, 500, "Quota doesn't match!");
            let result = await instance.changeQuota(300);
            console.log(result);// if you were to print this out it’d be long hex - the transaction hash
            let newQuota = await instance.quota.call();
            assert.equal(newQuota, 300, "New quota is not correct!");
        }catch(err){
            console.log(err)
        }
    });

    it("Should let you buy a ticket", async () => {
        try{
            let instance = await Conference.deployed({from:accounts[0]});
            var ticketPrice = web3.toWei(.05, 'ether');
            var initialBalance = web3.eth.getBalance(instance.address).toNumber();
            await instance.buyTicket({ from: accounts[1], value: ticketPrice });

            var newBalance = web3.eth.getBalance(instance.address).toNumber();
            var difference = newBalance - initialBalance;
            assert.equal(difference, ticketPrice, "Difference should be what was sent");

            let num = await instance.numRegistrants.call();
            assert.equal(num, 1, "there should be 1 registrant");

            let amount = await instance.registrantsPaid.call(accounts[1]);
            assert.equal(amount.toNumber(), ticketPrice, "Sender's paid but is not listed");

        }catch(err){
            console.log(err);
        }
    });

    it("Should issue a refund by owner only", async () => {
        try{
            let instance = await Conference.deployed({from:accounts[0]});

            var ticketPrice = web3.toWei(.05, 'ether');
            var initialBalance = web3.eth.getBalance(instance.address).toNumber();
            await instance.buyTicket({ from: accounts[1], value: ticketPrice });

            var newBalance = web3.eth.getBalance(instance.address).toNumber();
            var difference = newBalance - initialBalance;
            assert.equal(difference, ticketPrice, "Difference should be what was sent");  // same as before up to here
            // Now try to issue refund as second user - should fail

            await instance.refundTicket(accounts[1], ticketPrice, {from: accounts[0]});

            var balance = web3.eth.getBalance(instance.address).toNumber();
            assert.equal(web3.toBigNumber(balance), ticketPrice, "Balance should be unchanged");
            await instance.refundTicket(accounts[1], ticketPrice, {from: accounts[0]});

            var postRefundBalance = web3.eth.getBalance(instance.address).toNumber();
            assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");

        }catch(err){
            console.log(err);
        }
    });
});

