
import React from 'react';
// import logo from './logo.svg';
// import '../StyleSheets/SignUp.css';
import {BrowserRouter as  Router, Route, Link} from "react-router-dom";
import {CreateUser, GetUserData, GetUser, SendTokenToServer} from "../User/UserFunctions.js"
import {Form} from 'react-bootstrap'
import {Button} from 'react-bootstrap'
import {Container} from 'react-bootstrap'
import Navbarin from '../components/Navbarin.js';
import Navbarout from '../components/Navbarout.js';

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            User: null,
            User_Loaded: false,
            User_Firstname: "",
            User_Lastname: "",
            User_Email: "",
            // User_Friends: "friend_bot",
            User_Friends: [],
            User_Token: "",
            User_Favorites: [],
            User_FriendsCnt: 0,

            firstname: "",
            lastname: "",
            email: "",
            password: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.LoggedInPage = this.LoggedInPage.bind(this);
        this.LoggedOutPage = this.LoggedOutPage.bind(this);
        this.UpdateUserData = this.UpdateUserData.bind(this);
    }


    componentDidMount() {
        //document.title = "DJ-IRS";

        this.timerID = setInterval(
            () => this.UpdateUserData(),
            100
        ); //updates every 100 ms
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }


    UpdateUserData() {
        var user = GetUser();

        if( (user && !this.state.User_Loaded) || (!user && this.state.User_Loaded) ) {
            SendTokenToServer();
            GetUserData(this);
            this.forceUpdate();
        }
    }


    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        //changed to look for all categories (previously ignores check for firstname/lastname)
        if(this.state.firstname &&
            this.state.lastname &&
            this.state.email &&
            this.state.password) {
            CreateUser( this.state.firstname, this.state.lastname, this.state.email, this.state.password, this.props)
        }
        else {
            if (this.state.firstname === "") {
                alert("Missing First Name");
            }
            else if (this.state.lastname === "") {
                alert("Missing Last Name");
            }
            else if (this.state.email === "") {
                alert("Missing Email");
            }
            else if (this.state.password === "") {
                alert("Missing Password");
            }
        }

        // CreateUser( this.state.firstname, this.state.lastname, this.state.email, this.state.password, this.props)

        //alert("A sign up was submitted: " + this.state.firstname + ", " + this.state.lastname + ", " + this.state.email + ", " + this.state.password);

        // this.setState({
        //   firstname: "",
        //   lastname: "",
        //   email: "",
        //   password: "",
        // });

        event.preventDefault();

    }

    LoggedInPage() {
        return (
            <div>
                <Navbarin />
                <div>
                    You are already signed up!
                </div>
            </div>
        );
    }

    LoggedOutPage() {
        return (
            <div>
                <Navbarout />

                <div>
                    <br/>
                    <Container>
                        <h1>Create an Account</h1>
                        <br/>

                        <Form className="login-form">

                            <Form.Group controlId="firstname">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control required name="firstname" type="text" value={this.state.firstname} onChange={this.handleChange} placeholder="Enter first name" />
                            </Form.Group>

                            <Form.Group controlId="lastname">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control required name="lastname" type="text" value={this.state.lastname} onChange={this.handleChange} placeholder="Enter last name" />
                            </Form.Group>

                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control required name="email" type="text" value={this.state.email} onChange={this.handleChange} placeholder="Enter email" />
                            </Form.Group>

                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control required name="password" type="password" value={this.state.password} onChange={this.handleChange} placeholder="Create password" />
                            </Form.Group>

                            <Button variant="primary" type="submit" name="submit" onClick={this.handleSubmit}>
                                Submit
                            </Button>

                        </Form>
                    </Container>
                </div>
            </div>
        );
    }


    render() {
        if (this.state.User) {
            // User is signed in.
            return this.LoggedInPage();
        }
        else {
            // No user is signed in.
            return this.LoggedOutPage();
        }
    }

}
