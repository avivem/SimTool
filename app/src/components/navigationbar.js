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
        openImageOption: false,
        openData: false,
        imageFile: null,
        addNodeType: ""
      }

      this.handleChange = this.handleChange.bind(this)
      this.openPopupNode = this.openPopupNode.bind(this);
      this.closePopupNode = this.closePopupNode.bind(this);
      this.openPopupData = this.openPopupData.bind(this);
      this.closePopupData = this.closePopupData.bind(this);
      this.openPopupImage = this.openPopupImage.bind(this);
      this.closePopupImage = this.closePopupImage.bind(this);
      this.handleRun = this.handleRun.bind(this);


      this.addStart = this.addStart.bind(this);
      this.addStation = this.addStation.bind(this);
      this.addEnd = this.addEnd.bind(this);

      this.addArrowMode = this.addArrowMode.bind(this);

      this.handleRemoveMode = this.handleRemoveMode.bind(this);

      this.handleReset = this.handleReset.bind(this);

      this.handleClearMode = this.handleClearMode.bind(this);

      this.handleImageUpload = this.handleImageUpload.bind(this);
      this.handleSubmitImage = this.handleSubmitImage.bind(this);
      this.handleCancelImage = this.handleCancelImage.bind(this);
      this.handleDefaultImage = this.handleDefaultImage.bind(this);
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

    // Open popup for changing data
    openPopupData(){
      this.setState({
        openData: true
      });
      console.log("Open Popup Data");
    }

    // Close popup for changing data
    closePopupData(){
      this.setState({
        openData: false
      });
      console.log("Close Popup");
    }

    // Open popup for uploading image
    openPopupImage(){
      this.setState({
        openImageOption: true
      });
      console.log("Open Popup Data");
    }

    // Close popup for uploading image
    closePopupImage(){
      this.setState({
        openImageOption: false,
        imageFile: null,
        addNodeType: ""
      });
      console.log("Close Popup");
    }

    handleRun(){
      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/run/5000').then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(console.log)
    }

      

    handleChange(e){
        this.props.handleIteration(e.target.value)
    }

    // add start node
    addStart(){
      this.setState({
        openNode: false,
        openImageOption: true,
        addNodeType: "start"
      });
    }

    // add station node
    addStation(){
      this.setState({
        openNode: false,
        openImageOption: true,
        addNodeType: "station"
      });
    }

    // add end node
    addEnd(){
      this.setState({
        openNode: false,
        openImageOption: true,
        addNodeType: "end"
      });
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

    // Upload the image file
    handleImageUpload(e){
      if(e.target.files[0] !== undefined){
        this.setState({
          imageFile: URL.createObjectURL(e.target.files[0])
        });
        console.log("Upload file");          
      }
    }

    // Submit image upload and add node
    handleSubmitImage(){
      this.setState({
        openImageOption: false,
      });

      switch(this.state.addNodeType){
        case "start":
          this.props.handleImageUpload("start", this.state.imageFile)
          this.props.handleAddNode("start");
          break;
      
        case "station":
          this.props.handleImageUpload("station", this.state.imageFile)
          this.props.handleAddNode("station");
          break;
    
        case "end":
          this.props.handleImageUpload("end", this.state.imageFile)
          this.props.handleAddNode("end");
          break;

        default:
          break;
      }

    }

    // Cancel upload
    handleCancelImage(){
      this.setState({
        openNode: true,
        openImageOption: false,
        imageFile: null,
        addNodeType: ""
      });
      console.log("Cancel upload");
    }

    handleDefaultImage(){
      this.setState({
        openImageOption: false,
      });

      switch(this.state.addNodeType){
        case "start":
          this.props.handleAddNode("start");
          break;
      
        case "station":
          this.props.handleAddNode("station");
          break;
    
        case "end":
          this.props.handleAddNode("end");
          break;

        default:
          break;
      }
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
                <button className="button" style={{backgroundColor:'#4CAF50'}} onClick={this.handleRun}>Start</button>
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
            {/*Popup for log */}
            <Popup open={this.state.openData} closeOnDocumentClick = {true} onClose={this.closePopupData}>
              <p>This is where the log should go</p>
              <button onClick={this.closePopupData} >Close</button>
            </Popup>
          </div>

          <div>
            {/*Popup for uploading image */}
            <Popup open={this.state.openImageOption} closeOnDocumentClick = {true} onClose={this.closePopupImage}>
              
              <label>Upload image file for the icon</label>
              <input type="file" accept=".jpg, .jpeg, .png" onChange={this.handleImageUpload} />
              <button onClick={this.handleSubmitImage}>Submit</button>
              <button onClick={this.handleCancelImage}>Cancel</button>
              <button onClick={this.handleDefaultImage}>Default</button>
              
            </Popup>
          </div>

        </nav>
        );
    }

}

export default Navigation;
