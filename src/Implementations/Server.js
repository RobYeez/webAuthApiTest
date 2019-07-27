import React from 'react';
// import base64url from "base64url";
// import CBOR  from 'cbor';
// import base64url from "base64-arraybuffer";
import { generateRandomBuffer } from './Helpers';
import base64url from "../Implementations/base64url-arraybuffer";
import firebase from '../firebase';

let db = firebase.firestore();

//addUser(payload.email, payload); payload = email, displayname + id, credentials[]
function addUser (email, struct) {
    let newUser = db.collection('users');
    //just add the new user into collection the other parts do the check
    newUser.add({
        email: email,
        displayName: struct.displayName,
        rawID: struct.id,
        credentials: struct.credentials,
    }).then(ref => {
        //just to double check it added
        console.log('Added document with ID onto firebase: ', ref.id);
    })
}
//userExist(payload.email); checks to see if there is that user and returns true/false
function userExist (email) {
    let findUser = db.collection('users');
    findUser.where('email', '==', email).get()
        .then(snapshot => {
            if(snapshot.empty) { //means no matching doc
                console.log('There is no such User for userExist');
                return false;
            }
            else {
                console.log('User does userExist');
                return true;
            }
        })
}
//not 100% sure if this one works need to get it to return as object
//getUser(payload.email); grabs out user as Object
async function getUser (email) {
    let findUser = db.collection('users');
    await findUser.where('email', '==', email).get()
        .then (snapshot => {
            snapshot.forEach(doc => {
                console.log('this is doc data');
                console.log(doc.data());

                // let dataz = await doc.data();
                return doc.data();  // **** <- return value doesnt make it in time...
            })
            // if(snapshot.empty) {
                // console.log('There is no such User for getUser');
                // throw new Error (`There is no such email: ${email}`);
            // }
            // else {
                // console.log('User does Exist getUser');
                // snapshot.forEach(doc => {
                //     console.log(doc.id, '=>', doc.data()); //doc.id is specific to that one id
                //     return doc.data();
                    // console.log(JSON.stringify(doc.data()));
                })
            // }
        // })
}
//have to check this one too
//change email to have updated user object (completetion/credentials) as string
//registrationComplete = true and add on credentials
function updateUser (email, struct) {
    let updateUser = db.collection('users');
    updateUser.where('email', '==', email).get()
        .then(snapshot => {
            if(snapshot.empty) {
                console.log('There is no such User for updateUser');
                throw new Error (`There is no such email: ${email}`);
            }
            else {
                console.log('User does Exist updateUser');
                snapshot.docs.update({registrationComplete:true, credentials:struct.credentials});
            }
        })
}

// function deleteUser (email) {
//     let deleteUser = db.collection('users');
//     deleteUser.where('email', '==', email).get()
//         .then(snapshot => {
//             if(snapshot.empty) {
//                 console.log('There is no such User for updateUser');
//                 throw new Error (`There is no such email: ${email}`);
//             }
//             else {
//                 console.log('User does Exist deleteUser');
//                 snapshot.docs.delete();
//             }
//         })
// }

function getUserByEmailHandle (userHandle) {

}
// let db = {
//     'addUser': (email, struct) => {
//         let userHandleToEmail = localStorage.getItem('userHandleToEmail');
//         if (!userHandleToEmail) { //if return empty
//             userHandleToEmail = '{}'; //make new object
//         }
//
//         userHandleToEmail = JSON.parse(userHandleToEmail); //makes it into JS object
//
//         userHandleToEmail[struct.id] = email; // puts in JS object.id = email
//
//         localStorage.setItem(email, JSON.stringify(struct));  //store into key of EMAIL the string conversion of object STRUCT
//         localStorage.setItem('userHandleToEmail', JSON.stringify(userHandleToEmail)); //store into key of userHandleToEmail the string conversion of object STRUCT
//     },
//     'userExist': (email) => { //return true or false depending on user
//         let userJson = localStorage.getItem(email);
//         if (!userJson) { //returns a string ... if empty then false
//             return false;
//         }
//         return true;
//     },
//     'getUser': (email) => { //return object of found user
//         let userJson = localStorage.getItem(email);
//         if (!userJson) {
//             throw new Error(`User Email ${email} does not exist!`);
//         }
//         return JSON.parse(userJson);
//     },
//     'getUserByEmailHandle': (userHandle) => {
//         let userHandleToEmail = localStorage.getItem('userHandleToEmail');
//         if (!userHandleToEmail) {
//             userHandleToEmail = '{}';
//         }
//
//         userHandleToEmail = JSON.parse(userHandleToEmail);
//
//         let userEmail = userHandleToEmail[userHandle];
//
//         let userJSON = localStorage.getItem(userEmail);
//         if(!userJSON) {
//             throw new Error(`Email ${userEmail} does not exist! :/`);
//         }
//
//         return JSON.parse(userJSON);
//     },
//     'updateUser': (email, struct) => {
//         let userJSON = localStorage.getItem(email);
//         if(!userJSON) { //check to see if it exist
//             throw new Error (`Email ${email} does not exist!`);
//         }
//         localStorage.setItem(email, JSON.stringify(struct)); //change email to have updated user object (completetion/credentials) as string
//     },
//     'deleteUser': (email) => {
//         localStorage.removeItem(email);
//     }
//
// };

let session = {};
// let user;
//REGISTER STUFF
export let passwordlessRegistration = (payload) => {
    session = {};
    //if user already exist (check email) (check registration meaning credentials are made)
    if(userExist(payload.email) && getUser(payload.email).registrationComplete) { //.registrationComplete?
        return Promise.reject({'status': 'failed', 'errorMessage': 'User already exists!'});
    }

    //encode payload id so no one knows
    payload.id = base64url.encode(generateRandomBuffer(32));
    payload.credentials = [];

    addUser(payload.email, payload); //add user to DB

    session.email = payload.email;
    session.uv = true; //just to identify its passwordlessregis;

    console.log('passwordlessRegistration complete');
    return Promise.resolve({'status': 'startFIDOEnrollmentPasswordlessSession'});
};
//*** PROBLEM HERE RN ***
export let getMakeCredentialChallenge = (options) => {
    //check to see it is there
    var publicKey;
    if (!session.email) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }
    let findUser = db.collection('users');
    const user2 = findUser.where('email', '==', session.email).get()
      .then (snapshot => {
          snapshot.forEach(doc => {
              console.log('this is doc data');
              console.log(doc.data());

              const user = doc.data();  // **** <- return value doesnt make it in time...


    session.challenge = base64url.encode(generateRandomBuffer(32)); //BUFFER SOURCE
    console.log('this is user.id');
    // let user = 1;
    console.log(user.rawID);
    console.log(user);
    // console.log(user.email);

     publicKey = {
        challenge: session.challenge,
        rp: {
            // id: 'TestCorpsID', //optional id <- can help to make it more secure ...basically the browswer
            name: "TestCorpsName",
        },
        user: {
            id: user.rawID, //user isnt an object
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
          });

          console.log(publicKey);
      return Promise.resolve(publicKey);

      })
};

export let makeCredentialResponse = (payload) => {
    if(!session.email) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }

    let user = getUser(session.email);

    user.registrationComplete = true;
    user.credentials.push(payload.id);

    updateUser(session.email, user);

    session = {};

    return Promise.resolve({'status': 'ok'});
};

//LOGIN STUFF
export let passwordlessLogin = (payload) => {
    if(!userExist(payload.email)) {
        return Promise.reject('Invalid Email...not registered?');
    }
    session.email = payload.email;
    session.uv = true;

    return Promise.resolve({'status': 'startFIDOAuthenticationProcess'});
};

export let getThatAssertionChallenge = () => {
    // var challenge = new Uint8Array(32);
    // window.crypto.getRandomValues(challenge);


    session.challenge = base64url.encode(generateRandomBuffer(32));

    var publicKey = {
        challenge: session.challenge,
        status: 'ok'
    };

    if (session.email) {
        let user = getUser(session.email);
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
    if (!session.email && !getUserByEmailHandle(payload.response.userHandle)) {
        return Promise.reject({'status': 'failed', 'errorMessage': 'Access denied!'});
    }

    session = {};

    return Promise.resolve({'status': 'ok'});
};
