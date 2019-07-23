// import React from 'react';
// import base64url from "base64url";
import CBOR  from 'cbor';
// import base64url from "base64-arraybuffer";
import { generateRandomBuffer } from './Helpers';
import base64url from "../Implementations/base64url-arraybuffer";

let db = {
    'addUser': (email, struct) => {
        let userHandleToEmail = localStorage.getItem('userHandleToEmail');
        if (!userHandleToEmail) {
            userHandleToEmail = '{}';
        }

        userHandleToEmail = JSON.parse(userHandleToEmail);

        userHandleToEmail[struct.id] = email;

        localStorage.setItem(email, JSON.stringify(struct));
        localStorage.setItem('userHandleToEmail', JSON.stringify(userHandleToEmail));
    },
    'userExist': (email) => {
        let userJson = localStorage.getItem(email);
        if (!userJson) {
            return false;
        }
        return true;
    },
    'getUser': (email) => {
        let userJson = localStorage.getItem(email);
        if (!userJson) {
            throw new Error(`User Email ${email} does not exist!`);
        }
        return JSON.parse(userJson);
    },
    'getUserByEmailHandle': (userHandle) => {
        let userHandleToEmail = localStorage.getItem('userHandleToEmail');
        if (!userHandleToEmail) {
            userHandleToEmail = '{}';
        }

        userHandleToEmail = JSON.parse(userHandleToEmail);

        let userEmail = userHandleToEmail[userHandle];

        let userJSON = localStorage.getItem(userEmail);
        if(!userJSON) {
            throw new Error(`Email ${userEmail} does not exist! :/`);
        }

        return JSON.parse(userJSON);
    },
    'updateUser': (email, struct) => {
        let userJSON = localStorage.getItem(email);
        if(!userJSON) {
            throw new Error (`Email ${email} does not exist!`);
        }
        localStorage.setItem(email, JSON.stringify(struct));
    },
    'deleteUser': (email) => {
        localStorage.removeItem(email);
    }

};

let session = {};

//REGISTER STUFF
export let passwordlessRegistration = (payload) => {
    session = {};
    //if user already exist, delete user
    if(db.userExist(payload.email) && db.getUser(payload.email).registrationComplete) { //.registrationComplete?
        return Promise.reject({'status': 'failed', 'errorMessage': 'User already exists!'});
    }

    //encode payload id so no one knows
    payload.id = base64url.encode(generateRandomBuffer(32));
    payload.credentials = [];

    db.addUser(payload.email, payload);

    session.email = payload.email;
    session.uv = true; //just to identify its passwordlessregis;

    return Promise.resolve({'status': 'startFIDOEnrollmentPasswordlessSession'});
};

export let getMakeCredentialChallenge = (options) => {
    //check to see it is there
    if (!session.email) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }
    let user = db.getUser(session.email);

    session.challenge = base64url.encode(generateRandomBuffer(32)); //BUFFER SOURCE

    var publicKey = {
        challenge: session.challenge,
        rp: {
            // id: 'TestCorpsID', //optional id <- can help to make it more secure ...basically the browswer
            name: "TestCorpsName",
        },
        user: {
            id: user.id,
            name: user.email,
            displayName: user.displayName
        },
        pubKeyCredParams: [
            {type: 'public-key', alg: -7}, //ES256
            {type: 'public-key', alg: -257} //RS256
        ],
        //OPTONAL
        // authenticatorSelection: {
        //     'userVerification': 'required'
        // },
        //OPTIONAL
        attestation : 'direct',  //shows fmt data

        status: 'ok'
    };

    if (options) {
        if(!publicKey.authenticatorSelection) {
            publicKey.authenticatorSelection = {};
        }
        if(options.attestation) {
            publicKey.attestation = options.attestation;
        }

        if(options.uv) {
            publicKey.authenticatorSelection.userVerification = 'required';
        }
    }
    return Promise.resolve(publicKey);
};

export let makeCredentialResponse = (payload) => {
    if(!session.email) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }

    let user = db.getUser(session.email);

    user.registrationComplete = true;
    user.credentials.push(payload.id);

    db.updateUser(session.email, user);

    session = {};

    return Promise.resolve({'status': 'ok'});
};

//LOGIN STUFF
export let passwordlessLogin = (payload) => {
    if(!db.userExist(payload.email)) {
        return Promise.reject('Invalid Email...not registered?');
    }
    session.email = payload.email;
    session.uv = true;

    return Promise.resolve({'status': 'startFIDOAuthenticationProcess'});
};

export let  getThatAssertionChallenge = () => {
    // var challenge = new Uint8Array(32);
    // window.crypto.getRandomValues(challenge);


    session.challenge = base64url.encode(generateRandomBuffer(32));

    var publicKey = {
        challenge: session.challenge,
        status: 'ok'
    };

    if (session.email) {
        let user = db.getUser(session.email);
        publicKey.allowCredentials = user.credentials.map((credId) => {
            return { type: 'public-key', id: credId };
        })
    }

    if (session.uv) {
        publicKey.userVerification = 'required';
    }

    return Promise.resolve(publicKey);
};

export let getAssertionResponse = (payload) => {
    if (!session.email && !db.getUserByEmailHandle(payload.response.userHandle)) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }

    session = {};

    return Promise.resolve({'status': 'ok'});
};
