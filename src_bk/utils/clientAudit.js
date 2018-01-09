const keccak256 = require('js-sha3').keccak256;

let auditSlice = function(slice, orderHashSet, order) {
    let tid = order.tid || '';
    let contentUser = order.orderCipherUser || '';
    let contentCp = order.orderCipherCp || '';
    let mergeT = '';
    let leftChild = '';
    let rightChild = '';
    let hashed = keccak256(contentUser.concat(contentCp));

    if(orderHashSet.indexOf(hashed) >= 0) {// order的hash存在於一堆肉粽中？
        for( let i = 0 ; i < orderHashSet.length ; i++){
            mergeT = mergeT.concat(orderHashSet[i]);// 串肉粽
        }
        let digest = keccak256(mergeT);// 算串肉粽hash
        if(digest === slice[0] || digest === slice[1]) { // 稽核切片
            while(slice.length > 1) {
                leftChild = slice.shift();
                rightChild = slice.shift();
                if(!keccak256(leftChild.concat(rightChild)) === slice[0] && !keccak256(leftChild.concat(rightChild)) === slice[1]) {
                    //return 'auditing have problem at : ' + leftChild + ' and ' + rightChild;
                    console.log('ERR:left right error');
                    return false;
                }
            }
            //return tid+' slice audit ........ ok!';
            return true;
        } else {
            //return 'Leaf hash error, data incorrect.';
            console.log('ERR:data incorrect');
            return false;
        }
    } else {
        //return tid+' order check ........ order hash not in the leaf.';
        console.log('ERR:order hash not in the leaf');
        return false;
    }
};

let getHieght = function(slice) {
    return slice.length/2 + 1;
}

module.exports = {
    auditSlice: auditSlice
};
