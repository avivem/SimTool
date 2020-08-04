import React, { Component } from 'react';
import Popup from "reactjs-popup";

import StartImage from "../image/start-circle.png";
import StationImage from "../image/station-circle.png";
import EndImage from "../image/end-circle.png";

// import './css/popup.css';


class Navigation extends Component{
    constructor(props){
      super(props);
      this.state = {
        runTime: 1000,
        openNode: false,
        openImageOption: false,
        openData: false,
        imageFile: null,
        addNodeType: "",
        startname: '',
        stationname: '',
        endname: '',
        entity_name: '',
        dist: "NORMAL",
        logic: "NONE",
        loc: 0,
        scale: 0,
        limit: 0,
        capacity: 0,
        time_func: 0,
        arrowButtonColor: "#2cbebe",
        updateButtonColor: "#2cbebe",
        actionButtonColor: "#2cbebe",
        
        removeButtonColor: "#ff0000",
        
        log: null,
        displayType: "Summary",
        summaryContent: '<div></div>',

        openPopupLoad: false,
        loadedFile: null,

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
      this.handleResetSim = this.handleResetSim.bind(this);

      this.handleImageUpload = this.handleImageUpload.bind(this);
      this.handleSubmitImage = this.handleSubmitImage.bind(this);
      this.handleCancelImage = this.handleCancelImage.bind(this);
      this.handleDefaultImage = this.handleDefaultImage.bind(this);

      this.onChange = this.onChange.bind(this);

      this.handleSave = this.handleSave.bind(this);
      this.openLoad = this.openLoad.bind(this);
      this.closeLoad = this.closeLoad.bind(this);
      this.handleLoadModel = this.handleLoadModel.bind(this);
      this.submitLoad = this.submitLoad.bind(this);

      this.openBlueprintPopup = this.openBlueprintPopup.bind(this);

      this.showInformation = this.showInformation.bind(this);
    }

    onChange(e){
      this.setState({ [e.target.name]: e.target.value })
    }

    // Open popup for adding node
    openPopupNode(){
      this.setState({
        openNode: true,
        arrowButtonColor: "#2cbebe",
        removeButtonColor: "#ff0000",
        actionButtonColor: "#2cbebe",
      });
      this.props.handleReset();
      console.log("Open Popup Node");
    }
    
    // Close popup for adding node
    closePopupNode(){
      this.setState({
        openNode: false,
        
      });
      console.log("Close Popup");
    }

    // Open popup for changing data
    openPopupData(){
      this.setState({
        openData: true
      });

      // Get summary if have not gotten summary for this run before
      if(this.state.summaryContent == '<div></div>'){
        fetch('http://127.0.0.1:5000/api/run/summary').then(res => res.json()).then(gotUser => {
          console.log(gotUser);
          
          var data = gotUser;
          var endnode = data["End Nodes"];
          var endInfo = [<h3>End Nodes</h3>];
          for(var key in endnode){
            endInfo.push(<div>
              <p>Name: {endnode.key["name"]}</p>
              <p>Number of Entities: {endnode.key["number of caught entities"]}</p>
            </div>)
          }
          
          
          var startnode = data["Starting Nodes"];
          var startInfo = [<h3>Start Nodes</h3>];
          for(var key in startnode){
            startInfo.push(<div>
              <p>{startnode.key["name"]}: {startnode.key["number of entities created"]} entities</p>
            </div>)
          }
          
          
          var stationnode = data["Station Nodes"];
          var stationInfo = [<h3>Station Nodes</h3>];
          for(var key in stationnode){
            var n = stationnode.key; 
            if(n["container summaries"] !== {}){
              var containerInfo = stationnode.key["container summaries"];
              for(var k in containerInfo){
                stationInfo.push(<div>
                  <p>Owner: {containerInfo.k["owner"]}</p>
                  <p>Resource: {containerInfo.k["resource"]}</p>
                  <p>Amount: {containerInfo.k["level"]}</p>
                </div>)
              }
            }
          }
          
          var runInfo = data["run_info"]
          
          var averageWaitTime = runInfo["avg_entity_duration_by_start"]
          var infoTimeSpend = []
          for(var key in averageWaitTime){
            infoTimeSpend.push(<p>{key} : {averageWaitTime.key}</p>);
          }
          
          var summaryContent = 
            <div>
              <p>Simulation Runtime: {runInfo["sim_end_time"]}</p>
              <p>Number of Entities: {runInfo["num_spawned_entities"]}</p>
              <p>Number of Entities Completed Run: {runInfo["num_completed_entities"]}</p>
              <h3>Average Entity Run Time: </h3>
              {infoTimeSpend}
              {startInfo}
              {stationInfo}
              {endInfo}
            </div>

          this.setState({
            log: gotUser,
            summaryContent: summaryContent
          });
  
        }).catch(console.log)
      }

      console.log("Open Popup Data");
    }

    // Close popup for changing data
    closePopupData(){
      this.setState({
        openData: false,
        displayType: "Summary"
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
        addNodeType: "",
        imageFile: null,
        addNodeType: "",
        startname: '',
        stationname: '',
        endname: '',
        entity_name: '',
        dist: "NORMAL",
        loc: 0,
        scale: 0,
        limit: 0,
        capacity: 0,
        time_func: 0,
      });
      console.log("Close Popup");
    }

    // Run function
    handleRun(){
      /**fetch to api */
      var url = 'http://127.0.0.1:5000/api/run/' + this.state.runTime;
      fetch(url).then(res => res.json()).then(gotUser => {
          console.log("Finish Running");

          // Reset the summaryContent since new run
          this.setState({ summaryContent: '<div></div>' });
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
          removeButtonColor: "#ff0000",
          updateButtonColor: "#2cbebe",
        });
      }
      else{
        this.setState({
          actionButtonColor: "#2cbebe",
          arrowButtonColor: "#1e8080",
          removeButtonColor: "#ff0000",
          updateButtonColor: "#2cbebe",
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
          arrowButtonColor: "#2cbebe",
          updateButtonColor: "#2cbebe",
        });
      }
      else{
        this.setState({
          actionButtonColor: "#2cbebe",
          removeButtonColor: "#cc0000",
          arrowButtonColor: "#2cbebe",
          updateButtonColor: "#2cbebe",

        });
      }

      this.props.handleRemoveMode();
    }

    // Clear canvas
    handleClearMode(){
      this.props.handleClearMode(true);
    }

    //Reset Simulation
    handleResetSim(){
      this.props.handleResetSim();
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

      switch(this.state.addNodeType){
        case "start":
          this.props.handleImageUpload("start", this.state.imageFile)

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

      this.setState({
        openImageOption: false,
        addNodeType: "",
        startname: '',
        stationname: '',
        endname: '',
        entity_name: '',
        dist: "NORMAL",
        loc: 0,
        scale: 0,
        limit: 0,
        capacity: 0,
        time_func: 0,
      });

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

    // Open the popup to look for savd model
    openLoad(){
      this.setState({ openPopupLoad: true})
    }

    closeLoad(){
      this.setState({ 
        openPopupLoad: false,
        loadedFile: null,
      })
    }

    handleLoadModel(e){
      if(e.target.files[0] !== undefined){
        this.setState({
          loadedFile: URL.createObjectURL(e.target.files[0])
        });
        console.log("Upload file");          
      }
    }

    // Submit the loaded file
    submitLoad(){
      if(this.state.loadedFile !== null){
        this.props.handleLoadFromFile(this.state.loadedFile);
        this.closeLoad();
      }
    }

    openBlueprintPopup(){
      this.setState({
        arrowButtonColor: "#2cbebe",
        removeButtonColor: "#ff0000",
        actionButtonColor: "#2cbebe",
      })

      this.props.handleReset();
      this.props.openBlueprintPopup()
    }

    // Show the type of information
    showInformation(){
      if(this.state.displayType == "Data"){
        this.setState({ displayType: "Summary" });
      }
      else{
        this.setState({ displayType: "Data" });
      }
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
                        <label className="label">Gen Function dist:
                          <select name="dist" className="form-control" onChange={this.onChange}>
                            <option value="NORMAL">Normal</option>
                            <option value="CONSTANT">Constant</option>
                          </select>
                        </label>
                        <label className="label">Gen Function loc:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter generation function"
                                name="loc" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Gen Function scale:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter generation function"
                                name="scale" 
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
                        </label>
                        <label className="label">Logic:
                          <select name="logic" className="form-control" onChange={this.onChange}>
                            <option value="NONE"></option>
                            <option value="NONE">NONE</option>
                            <option value="BOOL">BOOL</option>
                            <option value="RAND">RAND</option>
                            <option value="ALPHA_SEQ">ALPHA_SEQ</option>
                          </select>
                        </label>

                        </div>
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
                        </label>
                        <label className="label">Logic:
                          <select name="logic" className="form-control" onChange={this.onChange}>
                            <option value="NONE"></option>
                            <option value="NONE">NONE</option>
                            <option value="BOOL">BOOL</option>
                            <option value="RAND">RAND</option>
                            <option value="ALPHA_SEQ">ALPHA_SEQ</option>
                          </select>
                        </label>
                        </div>
        }





      return(
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark navbar-expand ">
         
         {/*navbar- might re-do*/}
          <div class="collapse navbar-collapse">
            <ul class="row navbar-nav mr-auto">
              <li class="col-sm-2 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'#2cbebe'}} onClick={this.openPopupNode}>+</button>
              </li>
              <li class="col-sm-2 nav-item">
                <button type="button" className="button btn btn-primary"  style={{backgroundColor:this.state.arrowButtonColor}} onClick={this.addArrowMode}>→</button>
              </li>
              <li class="col-sm-4 nav-item">
                <button type="button" className="button btn btn-primary" style={{backgroundColor: "#2cbebe"}} onClick={this.openBlueprintPopup}>Blueprint</button>
              </li>
              <li class="col-sm-2 nav-item">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:this.state.removeButtonColor}} onClick={this.handleRemoveMode}>x</button>
              </li>
            </ul>

            <ul class="row navbar-nav" style={{float: 'right'}}>
              <li class="col-md-5 nav-item active">    
                <label className="label" style={{color:'white', padding: "10px"}}>Run Until: </label>
                <input type="text" id="runTime"  className=" textbox" value={this.state.runTime} onChange={this.handleChangeTime}></input>
              </li>
              <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-secondary" style={{backgroundColor:'#4CAF50'}} onClick={this.handleRun}>Run</button>
              </li>
              <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'yellow', color:"black"}} onClick={this.openPopupData}>Data</button>
              </li>
              <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleResetSim}>Reset</button>
              </li>
              <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleClearMode}>Clear</button>
              </li>
              <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'yellow', color:"black"}} onClick={this.handleSave}>Save</button>
              </li>
             <li class="col-sm-1 nav-item active">
                <button type="button" className="button btn btn-primary" style={{backgroundColor:'yellow', color:"black"}} onClick={this.openLoad}>Load</button>
              </li>
            </ul>

          </div>

          <div>
            {/*Popup for user to select node to add*/}
            <Popup 
            open={this.state.openNode} 
            closeOnDocumentClick 
            onClose={this.closePopupNode}
            contentStyle={{textAlign: "center"}}>
              <h2>Create New Node</h2>  
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
            <Popup 
            open={this.state.openData} 
            closeOnDocumentClick 
            onClose={this.closePopupData}
            contentStyle={{height: 400, overflow: "auto"}}>
              {this.state.displayType == "Summary" && 
              <div>
                <h3 style={{textAlign: "center"}}>Data</h3>
                <p>{this.state.log}</p>
              </div>
              }
              {this.state.displayType == "Data" && 
              <div>
                <h3 style={{textAlign: "center"}}>Summary</h3>
                {this.state.summaryContent}
              </div>}
              <div style={{ position: "absolute", left: "35%"}}>
                <button className="button" style={{width: '100px'}} onClick={this.closePopupData} >Close</button>
                <button className="button" style={{width: '100px'}} onClick={this.showInformation}> {this.state.displayType} </button>
              </div>
            </Popup>
          </div>

          <div>
            {/*Popup for uploading image */}
            <Popup open={this.state.openImageOption} closeOnDocumentClick onClose={this.closePopupImage}>
              <div class="container">
                <h3>Add Node </h3>

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
            </Popup>
          </div>
          <div>
            <Popup open={this.state.openPopupLoad} closeOnDocumentClick onClose={this.closeLoad}>
              <div>
                <h3>Load the saved model:</h3>
                <input type="file" accept=".json" onChange={this.handleLoadModel} />
              </div>              
              <div>
                <button className="button" onClick={this.submitLoad}>Load</button>
                <button className="button" onClick={this.closeLoad}>Cancel</button>
              </div>
            </Popup>
          </div>

        </nav>
        );
    }

}

export default Navigation;
