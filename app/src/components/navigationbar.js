import React, { Component } from 'react';
import Popup from "reactjs-popup";

import StartImage from "../image/start-circle.png";
import StationImage from "../image/station-circle.png";
import EndImage from "../image/end-circle.png";

import './css/popup.css';


class Navigation extends Component{
    constructor(props){
      super(props);
      this.state = {
        runTime: 0,
        openNode: false,
        openImageOption: false,
        openData: false,
        imageFile: null,
        addNodeType: "",
        startname: '',
        stationname: '',
        endname: '',
        entity_name: '',
        gen_fun: 0,
        limit: 0,
        capacity: 0,
        time_func: 0,
        arrowButtonColor: "#2cbebe",
        actionButtonColor: "#2cbebe",

        removeButtonColor: "#ff0000",
        log: null

      }

      this.handleChangeTime = this.handleChangeTime.bind(this)

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

      this.handleClearMode = this.handleClearMode.bind(this);

      this.handleImageUpload = this.handleImageUpload.bind(this);
      this.handleSubmitImage = this.handleSubmitImage.bind(this);
      this.handleCancelImage = this.handleCancelImage.bind(this);
      this.handleDefaultImage = this.handleDefaultImage.bind(this);

      this.onChange = this.onChange.bind(this);

      this.handleSave = this.handleSave.bind(this);
      this.handleLoad = this.handleLoad.bind(this);

      this.handleContainer= this.handleContainer.bind(this);
    }

    onChange(e){
      // console.log(e.target)
      this.setState({ [e.target.name]: e.target.value })
    }

    // Open popup for adding node
    openPopupNode(){
      this.setState({
        openNode: true,
        arrowButtonColor: "#2cbebe",
        removeButtonColor: "#ff0000"
      });
      this.props.handleReset();
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

    // Run function
    handleRun(){
      /**fetch to api */
      var url = 'http://127.0.0.1:5000/api/run/' + this.state.runTime;
      console.log(url);
      fetch(url).then(res => res.json()).then(gotUser => {
          console.log(gotUser);
          this.setState({
            log: gotUser
          });

      }).catch(console.log)

    } 

    handleChangeTime(e){
      var iter = parseInt(e.target.value, 10);
      if(!isNaN(iter)){
        this.setState({runTime: iter});
      }
      else{
        if(e.target.value == ""){
          this.setState({runTime: 0});
        }
      }
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
      if(this.props.createArrowMode){
        this.setState({
          actionButtonColor: "#2cbebe",
          arrowButtonColor: "#2cbebe",
          removeButtonColor: "#ff0000"
        });
      }
      else{
        this.setState({
          actionButtonColor: "#2cbebe",
          arrowButtonColor: "#1e8080",
          removeButtonColor: "#ff0000"
        });
      }
      this.props.addArrowMode();  

    }

    // Change to remove node/arrow mode
    handleRemoveMode(){
      if(this.props.removeMode){
        this.setState({
          actionButtonColor: "#2cbebe",
          removeButtonColor: "#ff0000",
          arrowButtonColor: "#2cbebe"
        });
      }
      else{
        this.setState({
          actionButtonColor: "#2cbebe",
          removeButtonColor: "#cc0000",
          arrowButtonColor: "#2cbebe"

        });
      }

      this.props.handleRemoveMode();
    }

    // Clear canvas
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
          // fetch to api to create node
          this.props.handleAddNode("start",this.state);
          break;
      
        case "station":
          this.props.handleImageUpload("station", this.state.imageFile)
          this.props.handleAddNode("station",this.state);
          break;
    
        case "end":
          this.props.handleImageUpload("end", this.state.imageFile)
          this.props.handleAddNode("end",this.state);
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

    // default image
    handleDefaultImage(){
      this.setState({
        openImageOption: false,
      });

      switch(this.state.addNodeType){
        case "start":
          this.props.handleAddNode("start",this.state, null);
          break;
      
        case "station":
          this.props.handleAddNode("station",this.state, null);
          break;
    
        case "end":
          this.props.handleAddNode("end",this.state, null);
          break;

        default:
          break;
      }
    }

    // Save the current model
    handleSave(){
      this.props.handleSave();
    }

    // Load the save
    handleLoad(){
      this.props.handleLoad();
    }

    // Turn on container mode
    handleContainer(){
      if(this.props.containerMode){
        this.setState({
          actionButtonColor: "#2cbebe",
          arrowButtonColor: "#2cbebe",
          removeButtonColor: "#ff0000"
        });
      }
      else{
        this.setState({
          actionButtonColor: "#1e8080", 
          arrowButtonColor: "#2cbebe",
          removeButtonColor: "#ff0000"
        });
      }
      
      this.props.handleContainer();
    }

    render(){
        let content;
        // console.log(this.state)
        // determine content in popup
        if(this.state.addNodeType == "end"){
            content =   <div class="container">
                        <label className="label">Name:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter node name"
                                name="endname"
                                onChange={this.onChange} />
                        </label></div>
        }else if(this.state.addNodeType == "start"){
            content =   <div class="container">
                        <label className="label">Name:
                            <input 
                                type="text" 
                                name="startname"
                                placeholder="Enter node name"
                                className="form-control"
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Gen Function:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter generation function"
                                name="gen_fun" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Entity Name:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter entity name"
                                name="entity_name" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Limit:
                            <input 
                                type="text" 
                                placeholder="Enter enter limit"
                                className="form-control"
                                name="limit" 
                                
                                onChange={this.onChange}
                                 />
                        </label></div>
        }else{
            content =   <div class="container">
                        <label className="label">Name:
                            <input 
                                type="text" 
                                name="stationame"
                                placeholder="Enter node name"
                                className="form-control"
                                
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Capacity:
                            <input 
                                type="text" 
                                placeholder="Enter node capacity"
                                className="form-control"
                                name="capacity" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Time Function:
                            <input 
                                type="text" 
                                placeholder="Enter time function"
                                className="form-control"
                                name="time_func" 
                                onChange={this.onChange}
                                 />
                        </label></div>
        }

      // var log = '';
      // for(var x in this.state.log){
      //   log = log.concat('<p>', JSON.stringify(this.state.log[x]),'</p>','<br>');
      // }
      // console.log(log);

      // this.state.log = log;
      // console.log(this.state.log);

      return(
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark navbar-expand ">
         
         {/*navbar*/}
          <div class="collapse navbar-collapse " id="navbarsExampleDefault">
            <ul class="navbar-nav mr-auto ">
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#2cbebe'}} onClick={this.openPopupNode}>+</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:this.state.arrowButtonColor}} onClick={this.addArrowMode}>→</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:this.state.actionButtonColor}} onClick={this.handleContainer}>Assets</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:this.state.removeButtonColor}} onClick={this.handleRemoveMode}>x</button>
              </li>
            </ul>

            <ul class="navbar-nav  " style={{float: 'right'}}>
              {/*fix format*/}
              <li class="nav-item">
                <label className="label" style={{color:'white'}}>Run Until: </label>
              </li>
              <li class="nav-item active">    
                <input type="text" id="runTime" className="textbox" value={this.state.runTime} onChange={this.handleChangeTime}></input>
              </li>
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#4CAF50'}} onClick={this.handleRun}>Run</button>
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
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleSave}>Save</button>
              </li>
             <li class="nav-item active">
                <button className="button" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleLoad}>Load</button>
              </li>
            </ul>

          </div>

          <div>
            {/*Popup for user to select node to add*/}
            <Popup open={this.state.openNode} closeOnDocumentClick = {true} onClose={this.closePopupNode}>
               
              <button onClick={this.addStart} className="nodeButton">
                <img src={StartImage} alt="start" />
                <figcaption>Start</figcaption>
              </button>
              
              <button onClick={this.addStation} className="nodeButton">
                <img src={StationImage} alt="station" onClick={this.props.handleAddNode} />
                <figcaption>Station</figcaption>
              </button>
              
              <button onClick={this.addEnd} className="nodeButton">
                <img src={EndImage} alt="end" onClick={this.props.handleAddNode} />
                <figcaption>End</figcaption>
              </button>

            </Popup>
          </div>
          
          <div>
            {/*Popup for log */}
            <Popup open={this.state.openData} closeOnDocumentClick = {true} onClose={this.closePopupData}>
              <p>{this.state.log}</p>
              <button onClick={this.closePopupData} >Close</button>
            </Popup>
          </div>

          <div>
            {/*Popup for uploading image */}
            <Popup open={this.state.openImageOption} closeOnDocumentClick = {true} onClose={this.closePopupImage}>
              <div class="container">
              <div>

                {content}

                <h3>Upload image file for node icon: </h3>
                {/*Change this so it is a specific size */}
                <input type="file" accept=".jpg, .jpeg, .png" onChange={this.handleImageUpload} />
                
              </div>
              <div>
                <button className="button" onClick={this.handleSubmitImage}>Submit</button>
                {/*<button className="button" onClick={this.handleDefaultImage}>Default</button>*/} 
                <button className="button" onClick={this.handleCancelImage}>Cancel</button>
              </div>
              </div>
            </Popup>
          </div>

        </nav>
        );
    }

}

export default Navigation;
