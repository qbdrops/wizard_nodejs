const keccak256 = require('js-sha3').keccak256;

let calcLeafIndex = function(tid,height) { // calc leaflocation  
    let index = parseInt(keccak256(tid.toString()).substring(0,12),16);
    //calc the leaf node id
    return (1 << (height - 1)) + Math.abs(index) % (1 << (height - 1));
} 

module.exports = {
    calcLeafIndex: calcLeafIndex
};
