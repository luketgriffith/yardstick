import React, { Component } from 'react';
import { connect } from 'react-redux';
import Profile from '../components/welcome/profile';
import { Link } from 'react-router';
import { GoogleMapLoader, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import { default as MarkerClusterer } from "react-google-maps/lib/addons/MarkerClusterer";
import HoverExp from '../components/experiences/expHover';
import { browserHistory } from 'react-router';
import ChangeModal from '../components/welcome/changeModal';
import superagent from 'superagent';

var Rebase = require('re-base');

import config from '../config';

var base = Rebase.createClass(config);

class Welcome extends Component {
  constructor(props) {

    super(props);
    this.hover = this.hover.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.handleMarkerClose = this.handleMarkerClose.bind(this);
    this.changeLocation = this.changeLocation.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.changeUserLocation = this.changeUserLocation.bind(this);
    this.search = this.search.bind(this);
    this.getDistance = this.getDistance.bind(this);
    this.state = {
      showInfo: false,
      changeModal: false,
      searchTerm: '',
      latitude: '',
      longitude: '',
      experiences: []
    }
  }

  componentDidMount() {
    let { dispatch } = this.props;
    if ("geolocation" in navigator) {
      /* geolocation is available */
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        dispatch({
          type: 'SET_LOCATION',
          payload: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        })
      });
    } else {
      console.log('location thing not working')
    }
    // this.ref = base.bindToState(`experiences`, {
    //   context: this,
    //   state: 'experiences',
    //   asArray: true
    // });
      
  }
  componentWillReceiveProps(props) {
    console.log('receiving props...', props)
    if(props.location.latitude !== null && props.location.longitude !== null) {
      this.ref2 = base.fetch(`experiences`, {
        context: this,
        asArray: true,
        then(data) {
          data.forEach((exp) => {
            let distance = this.getDistance(exp.latitude, exp.longitude, props.location.latitude, props.location.longitude)
            if(distance < 100) {
              this.setState({  experiences: this.state.experiences.concat([exp]) })
            }
          })
        }
      })
    }
  }
  componentWillUnmount() {
    // let newArray = this.state.experiences.map((exp) => {
    //   exp.showInfo = false;
    // });

    base.removeBinding(this.ref);
  }

  getDistance(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }


  search(e) {
    e.preventDefault();
    //1. convert search to lat and lng object
    //2. for each exp in state, compute distance between search and exp. If under ~50 miles, push to new array
    //3. set that new array as exp state.
    // var distances = google.maps.geometry.spherical.computeDistanceBetween()

  
  }

  hover(marker) {
    let experiences = this.state.experiences;
    let newArray = experiences.map((exp) => {
      if(exp.key === marker.key) {
        // console.log('found it');
        let newObj = {};
        Object.assign(newObj, exp)
        newObj.showInfo = true;
        return newObj;
      } else {
        return exp;
      }
    });
    this.setState({
      experiences: newArray
    });
  }


  showDetail(marker) {
    return(
      <InfoWindow
        onCloseclick={this.handleMarkerClose.bind(null, marker)}>
        <div className="hoverExp">
          <h5 onClick={() => {
            this.setState({
              experiences: null
            });
            browserHistory.push("/experiences/" + marker.key + '/' + marker.user)
          }
          }>{marker.title}</h5>
          <p>{marker.description}</p>
          <div className="imgRow">
            {marker.images && marker.images.length > 0 ? marker.images.map((img)=>{
              return <img src={img.url} />
            }) : <div>No images</div>}
          </div>
        </div>
      </InfoWindow>
    )
  }

  handleMarkerClose(marker) {
    let experiences = this.state.experiences;

    let newArray = experiences.map((exp) => {
      if(exp.key === marker.key) {
        let newObj = {};
        Object.assign(newObj, exp)
        newObj.showInfo = false;
        return newObj;
      } else {
        return exp;
      }
    });

    this.setState({
      experiences: newArray
    });
  }

  changeLocation() {
    this.setState({
      changeModal: true
    });
  }

  dismiss(){
    this.setState({
      changeModal: false
    });
  }

  changeUserLocation(e) {
    e.preventDefault();
    let { dispatch, form } = this.props;
    var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': form.changeLocation.address.value}, function(res, status) {
        if(status === 'OK') {
          let data = {
            latitude: res[0].geometry.viewport.f.b,
            longitude: res[0].geometry.viewport.b.b,
          }
          dispatch({
            type: 'SET_LOCATION',
            payload: data
          });
        }
    })
    this.setState({
      changeModal: false
    });
  }

  render(){
    let exp;
    let markerSection;


    if(this.state.experiences && this.state.experiences.length > 0) {
      exp = this.state.experiences.map((exp) => {
        return (
          <div key={exp.key}>
            <Link to={"/experiences/" + exp.key }>{exp.title}</Link>
            <div>
              {exp.images.map((img) => <img style={{ maxWidth: '100px', display: 'inline-block' }}src={img.url} />)}
            </div>
            <p>{exp.description}</p>
          </div>
        )
      })
    } else {
      exp = <div>Loading experiences...</div>
    }

    if(this.state.experiences && this.state.experiences.length > 0) {
      markerSection = (
        this.state.experiences.map((marker, index) => {

          let pos = {
            lat: marker.latitude,
            lng: marker.longitude
          }
          return (
            <Marker
            position={pos}
            key={marker._id}
            onMouseover={this.hover.bind(null, marker)}>
            {marker.showInfo ? this.showDetail(marker) : null}
            </Marker>
            );
          })
      )
    } else {
      markerSection = null;
    }

      return(
        <div>
        <ChangeModal
          visible={this.state.changeModal}
          dismiss={this.dismiss}
          changeLocation={this.changeUserLocation}
        />
        <div className="welcomeInfo">
          <p>Welcome! Choose an experience from the list or map below, or add your own! <a href="#" onClick={this.changeLocation}>Change Location</a></p>
        </div>

          <div className="row">

            <div className="col-md-6 col-sm-12 expRow" style={{ padding: '20px' }}>
              <h4>Filter Experiences</h4>
              <form onSubmit={this.search}>
                <label>Search By Zip Code</label>
                <input id="searchField" type="text" placeholder="Zip Code" onChange={(e) => this.setState({ searchTerm: e.target.value })}/>
                <button>Search</button>
              </form>
            {exp}
            </div>

            <div style={{ height: '500px', padding: '20px' }} className="map col-md-6 col-sm-12">
            <GoogleMapLoader
            containerElement={<div style={{ height: `100%`, padding: '5%'  }} />}
            googleMapElement={
              <GoogleMap
              ref={(map) => console.log(map)}
              defaultZoom={7}
              center={{ lat: this.props.location.latitude ? this.props.location.latitude : 35 , lng: this.props.location.longitude ? this.props.location.longitude : -80 }}
              >
              <MarkerClusterer
                averageCenter
                enableRetinaIcons
                gridSize={ 60 }
              >
              {markerSection}
              </MarkerClusterer>
              </GoogleMap>
            }
            />
            </div>

          </div>
        </div>
      )
    }
  }


function mapStateToProps(state) {
  return {
    user: state.auth.user,
    location: state.auth.location,
    experiences: state.experiences.experiences,
    form: state.form
  }
}

export default connect(mapStateToProps)(Welcome);
