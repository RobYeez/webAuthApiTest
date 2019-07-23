import React from 'react';
import './App.css';
import  Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { passwordlessRegistration, getMakeCredentialChallenge, makeCredentialResponse, passwordlessLogin, getThatAssertionChallenge, getAssertionResponse } from "./Implementations/Server.js";
import { performatMakeCredRequest, publicKeyCredentialToJSON , performatGetAssertRequest} from "./Implementations/Helpers";
// import CBOR from 'borc';
// import CBOR from 'cbor';
import CBOR from './Implementations/cbor.js';
// import base64url from './Implementations/base64url-arraybuffer.js'
import base64url from 'base64url';
import { parseAuthData, bufferToString, bufToHex } from './Implementations/Helpers';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state  = {
      email : "",
      displayName: "",
    };
    this.handleSubmitRegistration = this.handleSubmitRegistration.bind(this);
    this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
  }

  //make credentials
  handleSubmitRegistration(event) {
    event.preventDefault();

    if(this.state.email && this.state.displayName) {
      console.log('registrationLoopCheckCorrect');
      let email = this.state.email;
      let displayName = this.state.displayName;
      passwordlessRegistration({email, displayName})
          .then((serverResponse) => {
            if (serverResponse.status !== 'startFIDOEnrollmentPasswordlessSession') {
              throw new Error('Error registering user! Server returned: ' + serverResponse.errorMessage);
            }
            return getMakeCredentialChallenge({'uv': true});
          })
          .then((makeCredChallenge) => {

            console.log('before preformat MkeCRED');
            console.log(makeCredChallenge);

            makeCredChallenge = performatMakeCredRequest(makeCredChallenge);

            console.log('after preformat MkeCred');
            console.log(makeCredChallenge);

            return navigator.credentials.create({'publicKey': makeCredChallenge}); //takes in object required for creating Web Authn and returns PublicKeyCredential

          })
          .then((newCredentialInfo) => {
            alert('Open your browser console!');
            console.log('SUCCESS', newCredentialInfo)
            console.log('ClientDataJSON: ', bufferToString(newCredentialInfo.response.clientDataJSON));
            let attestationObject = CBOR.decode(newCredentialInfo.response.attestationObject);
            console.log('AttestationObject: ', attestationObject);
            let authData = parseAuthData(attestationObject.authData);
            console.log('AuthData: ', authData);
            console.log('CredID: ', bufToHex(authData.credID));
            console.log('AAGUID: ', bufToHex(authData.aaguid));
            console.log('PublicKey', CBOR.decode(authData.COSEPublicKey.buffer));

            console.log('This is how the newCredentialInfo looks before JSON');
            console.log(newCredentialInfo);


            newCredentialInfo = publicKeyCredentialToJSON(newCredentialInfo);

            console.log('This is how the newCredtialInfo Looks After JSON');
            console.log(newCredentialInfo);
            //
            // // //test parse more for Attestation Object <-left off here
            // let attestationObjectBuffer = base64url.toBuffer(newCredentialInfo.response.attestationObject);
            // let ctapMakeCredResp  = CBOR.decodeAllSync(attestationObjectBuffer)[0];
            // // let ctapMakeCredResp = CBOR.decodeAllSync(newCredentialInfo.response.attestationObject)[0];
            // console.log('medium test version');
            // console.log(ctapMakeCredResp);
            // const decodedAttestationObj = CBOR.decode(
            //     newCredentialInfo.response.attestationObject)[0];
            //
            // console.log(decodedAttestationObj);


            return makeCredentialResponse(newCredentialInfo);


          })
          .then((serverResponse) => {
            if (serverResponse.status !== 'ok') {
              throw new Error ('Error registering user! Server returned: ' + serverResponse.errorMessage);
            }
            alert('Success!');
          })
          .catch((error) => {
            alert('FAIL' + error);
            console.log('FAIL', error);
          });
    }
  }

  handleSubmitLogin(event) {
    event.preventDefault();
    if(this.state.email) {
      console.log('LoginLoopCheckCorrect');
      let email = this.state.email;
      passwordlessLogin({email})
          .then((serverResponse) => {
            if(serverResponse.status !== 'startFIDOAuthenticationProcess')
              throw new Error('Error logging in! Server returned: ' + serverResponse.errorMessage);

            return getThatAssertionChallenge();
          })
          .then((getAssertionChallenge) => {

            console.log('this is before preformatting');
            console.log(getAssertionChallenge);

            getAssertionChallenge = performatGetAssertRequest(getAssertionChallenge);

            console.log('this is after preformatting');
            console.log(getAssertionChallenge);

            return navigator.credentials.get({ 'publicKey': getAssertionChallenge });


          })
          .then((newCredentialInfo) => {

            console.log('this is before newCred into JSON');
            console.log(newCredentialInfo);

            // //PARSE HERE
            // //test parse for auth data
            // const {authData} = newCredentialInfo;
            //
            // // get the length of the credential ID
            // const dataView = new DataView(
            //     new ArrayBuffer(2));
            // const idLenBytes = authData.slice(53, 55);
            // idLenBytes.forEach(
            //     (value, index) => dataView.setUint8(
            //         index, value));
            // const credentialIdLength = dataView.getUint16();
            //
            // // get the credential ID
            // const credentialId = authData.slice(
            //     55, credentialIdLength);
            //
            // // get the public key object
            // const publicKeyBytes = authData.slice(
            //     55 + credentialIdLength);
            //
            // // the publicKeyBytes are encoded again as CBOR
            // const publicKeyObject = CBOR.decode(
            //     publicKeyBytes.buffer);
            // console.log('this is publicKeyObject');
            // console.log(publicKeyObject);
            // console.log('this is credential ID');
            // console.log(credentialId);
            // console.log('this is publicKeyBytes');
            // console.log(publicKeyBytes);

            // document.getElementById("pubKey").innerHTML = credentialId;
            //

            newCredentialInfo = publicKeyCredentialToJSON(newCredentialInfo);

             console.log('this is after cred to json');
             console.log(newCredentialInfo);

            document.getElementById("rawID").innerHTML = newCredentialInfo.rawId;
            document.getElementById("pubKey").innerHTML = newCredentialInfo.response.authenticatorData;



            return getAssertionResponse(newCredentialInfo);
          })
          .then((serverResponse) => {
            if(serverResponse.status !== 'ok')
              throw new Error('Error registering user! Server returned: ' + serverResponse.errorMessage);
            alert('Success!');
          })
          .catch((error) => {
            alert('FAIL' + error);
            console.log('FAIL', error);
          })
    }
  }

  Display() {
    return (
        <Container>
          <Row>
            <Col>
              <h1>Registration</h1>
              <Form id="Registration">
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control required type="text" value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} placeholder="Enter email"/> {/* value={this.state.email} */}
                  <Form.Text className="text-muted">
                    Dw I won't spam you
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="formBasicDisplayName">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control required type="text" value={this.state.displayName} onChange={(e) => {this.setState({displayName: e.target.value})}}placeholder="Enter preferred display name"/> {/*value={this.state.displayName}*/}
                  <Form.Text className="text-muted">
                    Input a display name
                  </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" onClick={this.handleSubmitRegistration}> {/*input onlick function here */}
                  Submit
                </Button>
              </Form>
            </Col>
            <Col>
              <h1>Login</h1>
              <Form id="Login">
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control required type="email" value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} placeholder="Enter email"/> {/* value={this.state.email}*/}
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmitLogin}> {/*input onlick function here */}
                  Submit
                </Button>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>
              <h1> DB results </h1>
              <h4>Raw ID</h4>
              <p id="rawID"></p>
              <h4>Authenticator Data (used to get public Key, etc.)</h4>
              <p id="pubKey"></p>
            </Col>
          </Row>
        </Container>

    );
  }

  render() {
    return this.Display();
  }
}

export default App;
