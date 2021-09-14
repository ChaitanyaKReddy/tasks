const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const toBN = web3.utils.toBN;

const Token = artifacts.require('./Token.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();  

contract('Testing', (accounts) => {
    let instance;
    before(async() => {
        instance = await Token.new("Mine Token", "MINE", accounts[0], accounts[1], accounts[2]);
    });

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await instance.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })

        it('has name', async() => {
            const name = await instance.name();
            name.should.equal("Mine Token");
        })

        it('has symbol', async() => {
            const name = await instance.symbol();
            name.should.equal("MINE");
        })

        it("has totalSupply of 1 million", async() => {
            const totalSupply = await instance.totalSupply();
            totalSupply.toString().should.equal("1000000000000000000000000");
        })

        it('should mints all tokens to master address', async() => {
            const balance = await instance.balanceOf(accounts[0]);
            balance.toString().should.equal("1000000000000000000000000");
        })

        it('should set allowances to delegator accounts', async() => {
            const allowance1 = await instance.allowance(accounts[0], accounts[1]);
            const allowance2 = await instance.allowance(accounts[0], accounts[2]);
            allowance1.toString().should.equal(allowance2.toString(), "Allowances are equal");
            allowance2.toString().should.equal("1000000000000000000000000", "Allowance set successfully");
        })
    })

    describe('token testing', async() => {
        it('should allow transfers between accounts', async() => {
            const amount = "1000000000000000000";
            await instance.transfer(accounts[3], amount, {from: accounts[0]});
            const balance = await instance.balanceOf(accounts[3]);
            balance.toString().should.equal(amount, "Transfer successful");
            await instance.transfer(accounts[4], amount, {from: accounts[3]});
            const balance1 = await instance.balanceOf(accounts[3]);
            balance1.toString().should.equal("0", "Balance update successful");
        })

        it('should allow transfer from between accounts', async() =>{
            const amount = "1000000000000000000";
            await instance.approve(accounts[3], amount);
            await instance.transferFrom(accounts[0], accounts[4], amount, {from: accounts[3]});
            const balance = await instance.balanceOf(accounts[4]);
            balance.toString().should.equal("2000000000000000000", "Balance updated");
            const allowance = await instance.allowance(accounts[0], accounts[3]);
            allowance.toString().should.equal("0", "Allowance set successful");
        })

        it('should not allow transfer more than user balance', async() => {
            const amount = "4000000000000000000";
            await truffleAssert.reverts(instance.transfer(accounts[3], amount, {from: accounts[4]}), "ERC20: transfer amount exceeds balance");
        })

        it('should not allow transfer from more than allowed balance', async() => {
            const allowed = "1000000000000000000";
            const amount = "10000000000000000000";
            await instance.approve(accounts[3], allowed);
            await truffleAssert.reverts(instance.transferFrom(accounts[0], accounts[4], amount, {from: accounts[3]}), "ERC20: transfer amount exceeds allowance");
        })
        
        it('should not allow to decrease allowance less than 0', async() => {
            const amount = "10000000000000000000";
            await truffleAssert.reverts(instance.decreaseAllowance(accounts[3], amount), "ERC20: decreased allowance below zero");
        })

        it('should transfer 100 tokens when trim returns >= 0 and <= 5', async() => {
            const amount = "100000000000000000000";
            const strings = ["rome", "e", "more"];
            const balance = await instance.balanceOf(accounts[5]);
            balance.toString().should.equal("0");
            const allowance = await instance.allowance(accounts[0], accounts[1]);
            await instance.getRewards(strings, {from: accounts[5]});
            const balance1 = await instance.balanceOf(accounts[5]);
            balance1.toString().should.equal(amount, "Balance updated successfully");
            const allowance1 = await instance.allowance(accounts[0], accounts[1]);
            const newAllowanceDiff = toBN(allowance).sub(allowance1);
            newAllowanceDiff.toString().should.equal(amount, "Allowance updated");
        })

        it('should transfer 1000 tokens when trim returns more than 5', async() => {
            const amount = "1000000000000000000000";
            const strings = ["testmorethan5", "rome", "e", "more"];
            const balance = await instance.balanceOf(accounts[6]);
            balance.toString().should.equal("0");
            const allowance = await instance.allowance(accounts[0], accounts[2]);
            await instance.getRewards(strings, {from: accounts[6]});
            const balance1 = await instance.balanceOf(accounts[6]);
            balance1.toString().should.equal(amount, "Balance updated successfully");
            const allowance1 = await instance.allowance(accounts[0], accounts[2]);
            const newAllowanceDiff = toBN(allowance).sub(allowance1);
            newAllowanceDiff.toString().should.equal(amount, "Allowance updated");
        })
    })
})