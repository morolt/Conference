import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import conference_artifacts from '../../build/contracts/Conference.json'

var Conference = contract(conference_artifacts);

var accounts, account;
var myConferenceInstance;

// Initialize
function initializeConference() {
    Conference.setProvider(web3.currentProvider);
    Conference.deployed({from: accounts[0], gas: 3141592}).then(
        function(conf) {
            console.log(conf);
            myConferenceInstance = conf;
            $("#confAddress").html(myConferenceInstance.address);
            checkValues();
        }).catch(function(e){
            console.log(e);
    })
}

// Check Values
function checkValues() {
    myConferenceInstance.quota.call().then(
        function(quota) {
            $("input#confQuota").val(quota);
            return myConferenceInstance.organizer.call();
        }).then(
        function(organizer) {
            $("input#confOrganizer").val(organizer);
            return myConferenceInstance.numRegistrants.call();
        }).then(
        function(num) {
            $("#numRegistrants").html(num.toNumber());
            return myConferenceInstance.organizer.call();
        });
}

// Change Quota
function changeQuota(val) {
    myConferenceInstance.changeQuota(val, {from: accounts[0]}).then(
        function() {
            return myConferenceInstance.quota.call();
        }).then(
        function(quota) {
            if (quota == val) {
                var msgResult;
                msgResult = "Change successful";
            } else {
                msgResult = "Change failed";
            }
            $("#changeQuotaResult").html(msgResult);
        });
}

// buyTicket
function buyTicket(buyerAddress, ticketPrice) {

    myConferenceInstance.buyTicket({ from: buyerAddress, value: ticketPrice }).then(
        function() {
            return myConferenceInstance.numRegistrants.call();
        }).then(
        function(num) {
            $("#numRegistrants").html(num.toNumber());
            return myConferenceInstance.registrantsPaid.call(buyerAddress);
        }).then(
        function(valuePaid) {
            var msgResult;
            if (valuePaid.toNumber() == ticketPrice) {
                msgResult = "Purchase successful";
            } else {
                msgResult = "Purchase failed";
            }
            $("#buyTicketResult").html(msgResult);
        });
}

// refundTicket
function refundTicket(buyerAddress, ticketPrice) {

    var msgResult;

    myConferenceInstance.registrantsPaid.call(buyerAddress).then(
        function(result) {
            if (result.toNumber() == 0) {
                $("#refundTicketResult").html("Buyer is not registered - no refund!");
            } else {
                myConferenceInstance.refundTicket(buyerAddress,
                    ticketPrice, {from: accounts[0]}).then(
                    function() {
                        return myConferenceInstance.numRegistrants.call();
                    }).then(
                    function(num) {
                        $("#numRegistrants").html(num.toNumber());
                        return myConferenceInstance.registrantsPaid.call(buyerAddress);
                    }).then(
                    function(valuePaid) {
                        if (valuePaid.toNumber() == 0) {
                            msgResult = "Refund successful";
                        } else {
                            msgResult = "Refund failed";
                        }
                        $("#refundTicketResult").html(msgResult);
                    });
            }
        });
}

function getBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether');
}

function fundEth(newAddress, amt) {

    console.log("fundEth");

    var fromAddr = accounts[0]; // default owner address of client
    var toAddr = newAddress;
    var valueEth = amt;
    var value = parseFloat(valueEth)*1.0e18;
    var gasPrice = 1000000000000;
    var gas = 50000;
    web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value}, function (err, txhash) {
        if (err) console.log('ERROR: ' + err)
        console.log('txhash: ' + txhash + " (" + amt + " in ETH sent)");
        $("#balance").html(getBalance(toAddr));
    });
}

window.onload = function() {
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3();
        window.web3.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))
        // window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    }

    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }
        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;
        account = accounts[0];

        initializeConference();

        // Set value of wallet to accounts[1]
        $("#buyerAddress").val(accounts[1]);
        $("#refBuyerAddress").val(accounts[1]);
    });

    // Wire up the UI elements
    $("#changeQuota").click(function() {
        var val = $("#confQuota").val();
        changeQuota(val);
    });

    $("#buyTicket").click(function() {
        var val = $("#ticketPrice").val();
        var buyerAddress = $("#buyerAddress").val();
        buyTicket(buyerAddress, web3.toWei(val));
    });

    $("#refundTicket").click(function() {
        var val = $("#ticketPrice").val();
        var buyerAddress = $("#refBuyerAddress").val();
        refundTicket(buyerAddress, web3.toWei(val));
    });

    $("#fundWallet").click(function() {
        var address = $("#wallet").html();
        fundEth(address, 1);
    });

    $("#checkBalance").click(function() {
        var address = $("#wallet").html();
        $("#balance").html(getBalance(address));
    });
};
