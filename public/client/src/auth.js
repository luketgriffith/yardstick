import { browserHistory } from 'react-redux';
var Rebase = require('re-base');
import config from './config';
var base = Rebase.createClass(config);

function authenticate(store) {
  base.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    store.dispatch({
      type: 'SET_USER',
      user: user
    });
  } else {
    // No user is signed in.
    store.dispatch({
      type: 'SET_USER',
      user: {}
    });
    browserHistory.push('/')
  }
});


}

export { authenticate };
