import React, { Component } from 'react';
import Popup from "reactjs-popup";

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

import './css/nav.css';


class Navigation extends Component{
    constructor(props){
        super(props);
        this.state = {
          open: false
        }

        this.handleChange = this.handleChange.bind(this)
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);

        this.addStart = this.addStart.bind(this);
        this.addStation = this.addStation.bind(this);
        this.addEnd = this.addEnd.bind(this);

      }

    closePopupData(){
      this.setState({
        openData: false
      });
      console.log("Close Popup");
    }

    handleRun(){
      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/run/5000').then(res => res.json()).then(gotUser => {
          console.log(gotUser);
      }).catch(console.log)

      openPopup(){
        this.setState({
          open: true
        });
        console.log("Open Popup");
      }
      
      closePopup(){
        this.setState({
          open: false
        });
        console.log("Close Popup");
      }

    handleChange(e){
        this.props.handleIteration(e.target.value)
    }

    addStart(){
      this.setState({open: false});
      this.props.handleAddNode("start");
    }
    addStation(){
      this.setState({open: false});
      this.props.handleAddNode("station");
    }
    addEnd(){
      this.setState({open: false});
      this.props.handleAddNode("end");
    }

    render(){
      return(
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark navbar-expand ">
         
         {/*navbar*/}
          <div class="collapse navbar-collapse " id="navbarsExampleDefault">
            <ul class="navbar-nav mr-auto ">
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#2cbebe'}} onClick={this.openPopup}>+</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'#2cbebe'}}>→</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'red'}}>x</button>
              </li>
            </ul>

            <ul class="navbar-nav  " style={{float: 'right'}}>
              {/*fix format*/}
              <li class="nav-item">
                <label className="label" style={{color:'white'}}>Iterations: </label>
              </li>
              <li class="nav-item active">    
                <input type="text" id="iteration" className="textbox" value={this.props.iteration} onChange={this.handleChange}></input>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#4CAF50'}}>Start</button>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'red'}}>Stop</button>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Data</button>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Clear</button>
              </li>
            </ul>

          </div>

          <div>
            <Popup open={this.state.open} closeOnDocumentClick = {true} onClose={this.closePopup}>
              <button onClick={this.addStart} >
                <img src={StartImage} alt="start" />
              </button>
              <figcaption>Start</figcaption>

              <button onClick={this.addStation} >
                <img src={StationImage} alt="station" onClick={this.props.handleAddNode} />
              </button>
              <figcaption>Station</figcaption>
              
              <button onClick={this.addEnd} >
                <img src={EndImage} alt="end" onClick={this.props.handleAddNode} />
              </button>
              <figcaption>End</figcaption>

            </Popup>
          </div>
        </nav>
        );
    }

}

export default Navigation;
