import base64url from './base64url-arraybuffer';
// import base64url from 'base64url';

//PArsing AUth DATA
export var parseAuthData = (buffer) => {
    let rpIdHash      = buffer.slice(0, 32);            buffer = buffer.slice(32);
    let flagsBuf      = buffer.slice(0, 1);             buffer = buffer.slice(1);
    let flagsInt      = flagsBuf[0];
    let flags = {
        up: !!(flagsInt & 0x01),
        uv: !!(flagsInt & 0x04),
        at: !!(flagsInt & 0x40),
        ed: !!(flagsInt & 0x80),
        flagsInt
    };

    let counterBuf    = buffer.slice(0, 4);             buffer = buffer.slice(4);
    let counter       = readBE32(counterBuf);

    let aaguid        = undefined;
    let credID        = undefined;
    let COSEPublicKey = undefined;

    if(flags.at) {
        aaguid           = buffer.slice(0, 16);          buffer = buffer.slice(16);
        let credIDLenBuf = buffer.slice(0, 2);           buffer = buffer.slice(2);
        let credIDLen    = readBE16(credIDLenBuf);
        credID           = buffer.slice(0, credIDLen);   buffer = buffer.slice(credIDLen);
        COSEPublicKey    = buffer;
    }

    return {rpIdHash, flagsBuf, flags, counter, counterBuf, aaguid, credID, COSEPublicKey}
};

//PArsing AUth DATA

var readBE16 = (buffer) => {
    if(buffer.length !== 2)
        throw new Error('Only 2byte buffer allowed!');

    if(getEndian() !== 'big')
        buffer = buffer.reverse();

    return new Uint16Array(buffer.buffer)[0]
};

//PArsing AUth DATA

var readBE32 = (buffer) => {
    if(buffer.length !== 4)
        throw new Error('Only 4byte buffers allowed!');

    if(getEndian() !== 'big')
        buffer = buffer.reverse();

    return new Uint32Array(buffer.buffer)[0]
};

//PArsing AUth DATA

var getEndian = () => {
    let arrayBuffer = new ArrayBuffer(2);
    let uint8Array = new Uint8Array(arrayBuffer);
    let uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte

    if(uint16array[0] === 0xBBAA)
        return 'little';
    else
        return 'big';
};

//PArsing AUth DATA

export var bufferToString = (buff) => {
    var enc = new TextDecoder(); // always utf-8
    return enc.decode(buff);
};

//PArsing AUth DATA

export var bufToHex = (buffer) => { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

export var generateRandomBuffer = (length) => { // this way of writing functions already assume this.object
    if(!length) {
        length = 32;
    }

    var randomBuff = new Uint8Array(length);
    window.crypto.getRandomValues(randomBuff);
    return randomBuff;
};


export var publicKeyCredentialToJSON = (publicKeyCred) => {
    if (publicKeyCred instanceof Array) {
        let arr = [];
        for (let i of publicKeyCred) {
            arr.push(publicKeyCredentialToJSON(i));
        }
        return arr;
    }

    if (publicKeyCred instanceof ArrayBuffer) {
        return base64url.encode(publicKeyCred);
    }

    if(publicKeyCred instanceof Object) {
        let obj = {};

        for (let key in publicKeyCred) {
            obj[key] = publicKeyCredentialToJSON(publicKeyCred[key]);
        }

        return obj;
    }
    return publicKeyCred;
};


//REGISTRATION

export var performatMakeCredRequest = (makeCredRequest) => {
    makeCredRequest.challenge = base64url.decode(makeCredRequest.challenge);
    makeCredRequest.user.id   = base64url.decode(makeCredRequest.user.id);
    //DOESN"t WORK
    // makeCredRequest.challenge =
    // let test;
    // makeCredRequest.forEach(function(element) {
    //     test = test.concat(String.fromCharCode(element));
    // });
    // console.log(test);
    return makeCredRequest;
};


//LOGIN

export var performatGetAssertRequest = (assertReq) => {
    assertReq.challenge = base64url.decode(assertReq.challenge);

    for (let allowCred of assertReq.allowCredentials) {
        allowCred.id = base64url.decode(allowCred.id);
    }

    return assertReq;
};
