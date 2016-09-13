import React, { Component } from 'react';
import { connect } from 'react-redux';
import SignIn from '../components/auth/signIn';
import SignUp from '../components/auth/signUp';
import { Link, browserHistory } from 'react-router';
import superagent from 'superagent';
import 'react-google-maps';
import config from '../config';
// var validator = require('mailgun-validate-email')()
let jsonp = require('superagent-jsonp');

require('../stylesheets/main.scss');
var Rebase = require('re-base');
var base = Rebase.createClass(config);

class Home extends Component{
  constructor(props) {
    super(props);

    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.toggleSignIn = this.toggleSignIn.bind(this);
    this.toggleSignUp = this.toggleSignUp.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.state= {
      signIn: false,
      signUp: false,
      logInBtn: true,
      signUpBtn: true,
      invalidEmail: false,
      invalidPassword: false
    }
  }

  dismiss() {
    this.setState({
      signIn: false,
      signUp: false,
      logInBtn: true,
      signUpBtn: true
    })
  }

  toggleSignIn() {
    this.setState({
      signIn: true,
      signUp: false,
      logInBtn: false,
      signUpBtn: false
    });
  }

  toggleSignUp() {
    this.setState({
      signIn: false,
      signUp: true,
      logInBtn: false,
      signUpBtn: false
    });
  }
  validatePassword() {
    let password = this.props.form.signUp.password.value;
    let re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    let valid = re.test(password);
    console.log('valid??? ', valid)
    if(!valid) {
      this.setState({ invalidPassword: true });
    } else {
      this.setState({ invalidPassword: false });
    }
  }
  validateEmail() {
    let email = this.props.form.signUp.email.value;
    // console.log('the email: ', email);
    if(!email.length) {
      return;
    } else {
      superagent
      .get('https://api.mailgun.net/v3/address/validate')
      .auth('api', 'pubkey-252bed34819a680c8b154bf61ba4128b')
      .use(jsonp)
      .query({
        address: email
      })
      .end((err, res) => {
        console.log(err, res);
        if(!res.body.isValid) {
          this.setState({ invalidEmail: true })
        } else {
          this.setState({ invalidEmail: false })
        }
      });
    }
  }


  signIn(e) {
    e.preventDefault();
    let { dispatch, form } = this.props;
    let user = {
      email: form.signIn.email.value,
      password: form.signIn.password.value
    }
    base.auth().signInWithEmailAndPassword(user.email, user.password).catch(function(error) {
      var errorMessage = error.message;
      if(errorMessage) {
        alert(errorMessage)
      }
    }).then(function() {
      browserHistory.push('/welcome');
    });
  }

  signUp(e) {
    e.preventDefault();

    let { form } = this.props;
    let email = form.signUp.email.value;
    let password = form.signUp.password.value;
    let firstName = form.signUp.firstName.value;
    let lastName = form.signUp.lastName.value;

    if(this.state.invalidEmail || this.state.invalidPassword) {
      return;
    } else {
      base.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorMessage = error.message;
        if(errorMessage) {
          alert(errorMessage)
        }
      }).then(function(user) {
        user.updateProfile({
          displayName: firstName
        });

        base.database().ref('users/' + user.uid).set({
          firstName: firstName,
          lastName: lastName
        });
        
        browserHistory.push('/welcome')
      });
    }








  }

  render() {
      return (
        <div>
          <Link to="/about" className="about-link">More Info</Link>
          <div className="homePage">
            <h3>Outdoors</h3>
            <p>Outdoors exists to help people enjoy the great outdoors in new ways, by connecting hosts (private property owners 
              with a unique experience to share) with people who want to get outside.</p>
            <div className="home-buttons">
              <button onClick={this.toggleSignIn} style={{ display: this.state.logInBtn ? "inline-block" : "none" }}>Log In</button>
              <button onClick={this.toggleSignUp} style={{ display: this.state.signUpBtn ? "inline-block" : "none" }}>Sign Up</button>

            </div>
            <div className="signInForm" style={{ display: this.state.signIn ? "block" : "none" }}>
              <SignIn signIn={this.signIn} dismiss={this.dismiss}/>
            </div>
            <div className="signUpForm" style={{ display: this.state.signUp ? "block" : "none" }}>
              <SignUp signUp={this.signUp} dismiss={this.dismiss} validateEmail={this.validateEmail} validatePassword={this.validatePassword} invalidPassword={this.state.invalidPassword} invalidEmail={this.state.invalidEmail}/>
            </div>
          </div>
        </div>
      )

  }
}

function mapStateToProps(state) {
  return {
    form: state.form
  }
}

export default connect(mapStateToProps)(Home);
