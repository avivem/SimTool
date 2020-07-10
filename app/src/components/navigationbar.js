import React, { Component } from 'react';
import Popup from "reactjs-popup";

import StartImage from "../image/start-circle.png";
import StationImage from "../image/station-circle.png";
import EndImage from "../image/end-circle.png";

import './css/nav.css';


class Navigation extends Component{
    constructor(props){
      super(props);
      this.state = {
        openNode: false,
        openData: false,
      }

      this.handleChange = this.handleChange.bind(this)
      this.openPopupNode = this.openPopupNode.bind(this);
      this.closePopupNode = this.closePopupNode.bind(this);
      this.openPopupData = this.openPopupData.bind(this);
      this.closePopupData = this.closePopupData.bind(this);


      this.addStart = this.addStart.bind(this);
      this.addStation = this.addStation.bind(this);
      this.addEnd = this.addEnd.bind(this);

      this.addArrowMode = this.addArrowMode.bind(this);

      this.handleRemoveMode = this.handleRemoveMode.bind(this);

      this.handleReset = this.handleReset.bind(this);

      this.handleClearMode = this.handleClearMode.bind(this);

    }

    // Open popup for adding node
    openPopupNode(){
      this.setState({
        openNode: true
      });
      console.log("Open Popup Node");
    }
    
    // Close popup for adding node
    closePopupNode(){
      this.setState({
        openNode: false
      });
      console.log("Close Popup");
    }

    openPopupData(){
      this.setState({
        openData: true
      });
      console.log("Open Popup Data");
    }

    closePopupData(){
      this.setState({
        openData: false
      });
      console.log("Close Popup");
    }

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

    // add start node
    addStart(){
      this.setState({openNode: false});
      this.props.handleAddNode("start");
    }

    // add station node
    addStation(){
      this.setState({openNode: false});
      this.props.handleAddNode("station");
    }

    // add end node
    addEnd(){
      this.setState({openNode: false});
      this.props.handleAddNode("end");
    }

    // Change to add arrow mode
    addArrowMode(){
      this.props.addArrowMode();
    }

    // Change to remove node/arrow mode
    handleRemoveMode(){
      this.props.handleRemoveMode();
    }

    handleReset(){
      this.props.handleReset();
    }

    handleClearMode(){
      this.props.handleClearMode();
    }

    render(){
      return(
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark navbar-expand ">
         
         {/*navbar*/}
          <div class="collapse navbar-collapse " id="navbarsExampleDefault">
            <ul class="navbar-nav mr-auto ">
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#2cbebe'}} onClick={this.openPopupNode}>+</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'#2cbebe'}} onClick={this.addArrowMode}>→</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'red'}} onClick={this.handleRemoveMode}>x</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'red'}} onClick={this.handleReset}>Reset</button>
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
                <button className="button" style={{backgroundColor:'#4CAF50'}} >Start</button>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'red'}}>Stop</button>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}} onClick={this.openPopupData}>Data</button>
              </li>
             <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleClearMode}>Clear</button>
              </li>
            </ul>

          </div>

          <div>
            {/*Popup for user to select node to add*/}
            <Popup open={this.state.openNode} closeOnDocumentClick = {true} onClose={this.closePopupNode}>
              <button onClick={this.addStart} >
                <img src={StartImage} alt="start" />
                <figcaption>Start</figcaption>
              </button>
              

              <button onClick={this.addStation} >
                <img src={StationImage} alt="station" onClick={this.props.handleAddNode} />
                <figcaption>Station</figcaption>
              </button>
              
              
              <button onClick={this.addEnd} >
                <img src={EndImage} alt="end" onClick={this.props.handleAddNode} />
                <figcaption>End</figcaption>
              </button>


            </Popup>
          </div>
          <div>
            <Popup open={this.state.openData} closeOnDocumentClick = {true} onClose={this.closePopupData}>
              <p>This is where the log should go</p>
              <button onClick={this.closePopupData} >Close</button>
            </Popup>
          </div>
        </nav>
        );
    }

}

export default Navigation;
