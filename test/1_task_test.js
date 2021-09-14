const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

const Task = artifacts.require('./Task.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();  

contract('Testing', (accounts) => {
    let instance;
    before(async() => {
        instance = await Task.new();
    });

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await instance.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    describe('testing', async() => {

        it('should not allow empty strings', async() => {
            await truffleAssert.reverts(instance.trim([]), "Empty array");
        })

        it('should return the same array if length is 1', async() => {
            const returnValue = await instance.trim(["StringLength"]);
            returnValue.should.equal("StringLength", "Returns the same text");
        })

        it('should trim mirroring characters', async() => {
            const strings = ["rome", "e", "more"];
            const returnValue = await instance.trim(strings);
            returnValue.should.equal("e", "Trim successful");
            const strings1 = ["tree", "must", "museum", "ethereum"];
            const returnValue1 = await instance.trim(strings1);
            returnValue1.should.equal("etheresesree", "Trim successfull");
        })
    })
})