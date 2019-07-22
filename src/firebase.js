import * as firebase from 'firebase';

let firebaseConfig = {
    apiKey: "AIzaSyBYdOhh4ejgORrXSq8Q1xMh8vZGvZ7MyRs",
    authDomain: "demoauth-7eec5.firebaseapp.com",
    databaseURL: "https://demoauth-7eec5.firebaseio.com",
    projectId: "demoauth-7eec5",
    storageBucket: "demoauth-7eec5.appspot.com",
    messagingSenderId: "884560266623",
    appId: "1:884560266623:web:adafc9b6396287f3"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
