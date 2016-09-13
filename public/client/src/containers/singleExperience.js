import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Datetime from 'react-datetime';
import moment from 'moment';
import { GoogleMapLoader, GoogleMap, Marker } from "react-google-maps";
import ExperienceActions from '../actions/experiences';
var Rebase = require('re-base');
import config from '../config';

var base = Rebase.createClass(config);

class SingleExperience extends Component {
  constructor(props) {
    super(props)

    this.state = { experience: null, host: null }
    this.selectDate = this.selectDate.bind(this);
    this.validDate = this.validDate.bind(this);
    this.reserve = this.reserve.bind(this);
  }

  componentDidMount() {
    let { dispatch, params } = this.props;
    base.syncState(`experiences/` + params.experienceId, {
      context: this,
      state: 'experience',
      asArray: false
    });
    base.syncState(`users/` + params.userId, {
      context: this,
      state: 'host',
      asArray: false
    });
  }

  componentWillUnmount() {
    let { dispatch, params } = this.props;
    dispatch({
      type: 'SINGLE_EXP_FLUSH',
      payload: {}
    })
  }

  selectDate(e) {
    let { dispatch } = this.props;
    let date = e._d.toString();
    dispatch(ExperienceActions.selectDate(date));
  }


  validDate(current) {
    // let newA = this.state.experience.unavailableDates.find((date) => {
    //   return Datetime.moment(current._d).isSame(date, 'day')
    // });
    //
    // if(newA) {
    //   return false;
    // } else {
    //   return true;
    // }
    return true;
  }

  reserve() {
    let { dispatch, reservation, user, params } = this.props;
    let experience = this.state.experience;
    experience.key = params.experienceId;
    let data = {
      user: user.uid,
      experience: experience,
      host: experience.user,
      date: reservation.selectedDate
    }
    dispatch(ExperienceActions.reserve(data));
  }

  render(){
    let exp;
    let images;
    if(this.state.experience && this.state.experience.images) {
      images = this.state.experience.images.map((img) => {
        return <img src={img.url} />
      })
    } else { images = <div></div>}

    if(this.state.experience && this.state.host) {

      exp = (
        <div>
          <div className="singleExp">
          <h4>{this.state.experience.title}- {this.state.experience.city}, {this.state.experience.state}</h4>
          <div className="imageGallery">
            {images}
          </div>
          <p>{this.state.experience.description}</p>
          <div className="userDetails">
            <h5>{this.state.host.firstName} {this.state.host.lastName}</h5>
          </div>
          </div>

            <div style={{ height: 300 }} className="singleMap">
              <GoogleMapLoader
                containerElement={
                  <div style={{ height: `100%`  }} />
                }
                googleMapElement={
                  <GoogleMap
                    ref={(map) => console.log(map)}
                    defaultZoom={12}
                    defaultCenter={{ lat: this.state.experience.latitude, lng: this.state.experience.longitude }}
                  >
                  </GoogleMap>
                }
              />
            </div>
          <div className="availableDates">
            <h5>Available Dates</h5>
            <Datetime onChange={this.selectDate} isValidDate={this.validDate} input={false} open={true}/>
          </div>
          <div>
            <h5>Book This Experience!</h5>
            <button className="btn btn-primary" onClick={this.reserve}>Book</button>
          </div>
        </div>
        )
    } else {
      exp = <div>Loading...</div>
    }

    return(
      <div>
      {exp}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
    experiences: state.experiences,
    dates: state.experiences.singleExperience.dates,
    reservation: state.reservation
  }
}

export default connect(mapStateToProps)(SingleExperience);
