import React, { Component } from 'react';

import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'
import AssestPopUp from './components/asset'


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      startNode: [],
      stationNode: [],
      endNode: [],
      addedStart: false,
      addedStation: false,
      addedEnd: false,
      count: 0,
      arrows: [],
      createArrowMode: false,
      createArrow: false,
      removeMode: false,
      clearMode: false,
      imageStart: null,
      imageStation: null,
      imageEnd: null,
      savedStart: [],
      savedStation: [],
      savedEnd: [],
      savedArrows: [],
      savedNumImage: 0,
      savedContainer: [],
      loadMode: false,
      loadModeMakeArrow: false,
      numImage: 0,
      numLoadedImage: 0,
      numImageToLoad: 0,
      containerMode: false,
      containers: [],

      selectedNodeID: "",
    }

    // numImage keep track of current number of image in model
    // numLoadedImage keep track of number of image loaded in model
    // savedNumImage saved the numImage for load
    // numImageToLoad used in loading to keep track of how many image needed to be load

    this.addNode = this.addNode.bind(this);
    this.confirmAdded = this.confirmAdded.bind(this);

    this.handleChangeNode = this.handleChangeNode.bind(this);

    this.addArrowMode = this.addArrowMode.bind(this);
    this.addArrowState = this.addArrowState.bind(this);

    this.handleRemoveMode = this.handleRemoveMode.bind(this);
    this.handleRemove = this.handleRemove.bind(this);

    this.handleReset= this.handleReset.bind(this);

    this.handleClearMode = this.handleClearMode.bind(this);
    
    this.handleImageUpload = this.handleImageUpload.bind(this);

    this.handleSave = this.handleSave.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.incrNumImage = this.incrNumImage.bind(this);
    this.incrNumLoadedImage = this.incrNumLoadedImage.bind(this);
    this.handleBackendLoadNodes = this.handleBackendLoadNodes.bind(this);

    this.handleContainer = this.handleContainer.bind(this);
    this.addContainer = this.addContainer.bind(this);

    this.openContainerPopup = this.openContainerPopup.bind(this);
    this.closeContainerPopup = this.closeContainerPopup.bind(this);
  }



  /* Add node, determine what node to add by checking nodeType
  nodeType can be start, station, or end */
  addNode(nodeType, data){
    var xPos = 200;
    var yPos = 200;
    switch(nodeType){
      case "start":
        var node = this.state.startNode;
        node.push({
          // this ID needs to be the one set in the add node function
          uid: "start-" + this.state.count,
          type: "START",
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
          name: data.startname,
          entity_name: data.entity_name,
          gen_fun: parseInt(data.gen_fun),
          limit: parseInt(data.limit),
          imageURL: data.imageFile
        });
        this.setState({startNode: node, addedStart: true});
        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          uid: "station-" + this.state.count,
          type: "BASIC",
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
          name:data.stationame,
          capacity: parseInt(data.capacity),
          time_func: parseInt(data.time_func),
          imageURL: data.imageFile
        });
        this.setState({stationNode: node, addedStation: true});
        break;

      case "end":
        var node = this.state.endNode;
        node.push({
          uid: "end-" + this.state.count,
          type: "END",
          x: xPos,
          y: yPos,
          unit: "Second",
          name: data.endname,
          imageURL: data.imageFile
        });
        this.setState({ endNode: node, addedEnd: true});
        break;
    }

    this.setState((state) => ({
      count: state.count + 1,
      createArrowMode: false,
      removeMode: false
    }));
  }

  /*Confirm that the node/arrow was added - which is done by setting the 4 state to false */
  confirmAdded(){
    this.setState({
      addedStation: false,
      addedStart: false,
      addedEnd: false,
      createArrow: false 
    });
  }

  /* 
  Change the unit or rate of the node, the r is used to convert the rate to second,
  so r can be 1, 60, 60 * 60, or 60 * 60 * 24 
  */
  handleChangeNode(change){
    console.log(this.state.startNode);

     switch(change.type){
       case "Start Node":
         // need to change startNode array
         this.state.startNode[0].name = change.startname;
         this.state.startNode[0].entity_name = change.entity_name;
         this.state.startNode[0].gen_fun = change.gen_fun;
         this.state.startNode[0].limit = change.limit;

         // request options to send in post request- START NODE
         const requestOptionsStart = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             // node id is this.state.startNode[0].uid
             uid: change.targetId,
             type: 'START',
             // Change the name value to this.state.name to refer to user input
             name: change.startname,
             entity_name: change.entity_name,
             gen_fun: parseInt(change.gen_fun),
             limit: parseInt(change.limit),

           })
         };

         /**fetch to api */
         fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(res => res.json()).then(gotUser => {
             console.log(gotUser);

        }).catch(function() {
            console.log("Error on change Start Node");
        });


         break;

       case "Station Node":

         // do a for each to grab correct basic node
         var station = this.state.stationNode[0];
         for(var x in this.state.stationNode){
             var uid = this.state.stationNode[x].uid;


             if(uid== this.state.targetId){
                 station = this.state.stationNode[x];
             }
          }
          station.name = change.stationname;
          station.capacity = change.capacity;
          station.time_func = change.time_func; 

         // console.log(this.state.stationNode);

         // request options to send in post request- BASIC NODE
         // placeholder values
         const requestOptionsBasic = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             uid: change.targetId,
             type: 'BASIC',
             // Change the name value to this.state.name to refer to user input
             name:change.stationame,
             capacity: parseInt(change.capacity),
             time_func: parseInt(change.time_func),

           })
         };

         /**fetch to api */
         fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(res => res.json()).then(gotUser => {
             console.log(gotUser);

        }).catch(function() {
            console.log("Error on change Basic Node");
        });

         break;

        case "End Node":
         this.state.endNode[0].name = change.endname;

         // request options to send in post request- END NODE
         // placeholder values
         const requestOptionsEnd = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             uid: change.targetId,
             type: 'END',
             // Change the name value to this.state.name to refer to user input
             name: change.endname,
             // node id is this.state.endNode[0].uid

           })
         };

         /**fetch to api */
         fetch('http://127.0.0.1:5000/api/node/', requestOptionsEnd).then(res => res.json()).then(gotUser => {
             console.log(gotUser);

        }).catch(function() {
            console.log("Error on change End Node");
        });

         break;
       } 
       // take the node, update fields, and push to api
     // we can gain the node info from startNode
     // we are passed the state- which includes all updated fields

     // find node based on type
       // startNode -> use uid to get node

       // apply the changes seen in the state variable that correspond to Start Node

     //fetch api '/api/node/' put request [uid: ..., and what to update]

     // console.log(this.state.startNode);
     // console.log(this.state.stationNode);
     // console.log(this.state.endNode);
  }

  /*State is used to let the click event on the 
  node know that it should not open the popup but to be used to create arrow */
  addArrowMode(){
    if(this.state.createArrowMode){
      this.setState({
        createArrowMode: false,
        removeMode: false,
        containerMode: false
      });
    }
    else{
      this.setState({
        createArrowMode: true,
        removeMode: false,
        containerMode: false
      });
    }   
  }

  /* Add the arrow to the list, this function is passed to 
  canvas where it is called when the to node is determined in 
  the componentDidUpdate. The from and to are the id given to the node */
  addArrowState(from, to){
    var lst = this.state.arrows;

    lst.push({
      uid: "arrow-" + this.state.count,
      from: from,
      to: to
    });
    this.setState({
      arrows: lst, 
      count: this.state.count + 1
    });
    this.setState({createArrow: true});
    console.log(this.state.arrows);
  }

  // Change to remove mode.
  // In remove mode, when click on a node/arrow, it will remove the node/arrow
  handleRemoveMode(e){
    if(this.state.removeMode){
      this.setState({
        removeMode: false,
        createArrowMode: false,
        containerMode: false
      });
    }
    else{
      this.setState({
        removeMode: true,
        createArrowMode: false,
        containerMode: false
      });
      console.log("Handle Remove");
    }

  }

  // Handle removing the node/arrow
  handleRemove(id){
    console.log(id);
    if(id.includes('arrow')){
      // Remove arrow
      var lst = []
      this.state.arrows.forEach(target =>{
        if(target.uid != id){
          lst.push({
            uid: target.uid,
            from: target.from,
            to: target.to
          });
        }
      });
      this.setState({arrows: lst});
    }
    else{
      // Remove node
      var lst = [];
      var original = [];

      // Determine which list to look at 
      if(id.includes('start')){
        original = this.state.startNode;
      }
      if(id.includes('station')){
        original = this.state.stationNode;
      }
      if(id.includes('end')){
        original = this.state.endNode;
      }

      // Remove the given node from the list
      original.forEach(target => {
        if(target.uid != id){
          if(id.includes('end')){
            lst.push({
              uid: target.uid,
              x: target.x,
              y: target.y,
              unit: target.unit,
            });
          }
          else{
            lst.push({
              uid: target.uid,
              x: target.x,
              y: target.y,
              rate: target.rate,
              unit: target.unit,
            });
          }
        }
      })

      if(id.includes('start')){
        this.setState({startNode: lst});
      }
      if(id.includes('station')){
        this.setState({stationNode: lst});
      }
      if(id.includes('end')){
        this.setState({endNode: lst});
      }
      console.log("remove");
    }
  }

  // Reset mode 
  handleReset(){
    this.setState({
      createArrowMode: false, 
      removeMode: false,
      containerMode: false,
    });
  }

  // Clear Canvas
  handleClearMode(){
    if(this.state.clearMode){
      this.setState({clearMode: false});
      console.log("Clear canvas");
    }
    else{
      this.setState({
        clearMode: true,
        arrows: [],
        startNode: [],
        stationNode: [],
        endNode: []
      });

      const requestClean = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }

      // Clear the back end
      fetch('http://127.0.0.1:5000/api/clean/', requestClean).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

      }).catch(function() {
          console.log("Error on clear");
      });

      console.log("Clear store node/arrow");
    }
    
  }

  //Handle upload image
  handleImageUpload(nodeType, image){
    switch(nodeType){
      case "start":
        this.setState({
          imageStart: image
        });
        break;

      case "station":
        this.setState({
          imageStation: image
        });
        break;

      case "end":
        this.setState({
          imageEnd: image
        });
        break;

      default:
        break;
    }
  }

  // Save the current model
  handleSave(){
    var lst1 = this.state.startNode.slice(0);
    var lst2 = this.state.stationNode.slice(0);
    var lst3 = this.state.endNode.slice(0);
    var lst4 = this.state.arrows.slice(0);
    var num = this.state.numImage
    var actions = this.state.containers.slice(0);

    console.log("numImage: " + num);
    
    this.setState({
      savedStart: lst1,
      savedStation: lst2,
      savedEnd: lst3,
      savedArrows: lst4,
      savedNumImage: num,
      savedContainer: actions,
    });
    console.log("Saved current model");  
  }

  // Load saved model
  handleLoad(){
    var makeNode = this.state.loadMode;
    var makeArrow = this.state.loadModeMakeArrow; 

    var lst1 = this.state.savedStart.slice(0);
    var lst2 = this.state.savedStation.slice(0);
    var lst3 = this.state.savedEnd.slice(0);
    var lst4 = this.state.savedArrows.slice(0);
    var num = this.state.savedNumImage;
    var actions = this.state.savedContainer.slice(0);


    if(makeNode == false && makeArrow == false){
      this.setState({
        loadMode: true,
        startNode: lst1,
        stationNode: lst2,
        endNode: lst3,
        numImage: 0,
        numLoadedImage: 0,
        numImageToLoad: num,
        containers: actions,
      });
    }
    else if(makeNode == true && makeArrow == false){
      this.setState({
        loadMode: false,
        loadModeMakeArrow: true,
        arrows: lst4
      });
    }
    else{
      this.setState({
        loadMode: false,
        loadModeMakeArrow: false
      });
    }
    console.log("Load Mode");
  }

  // Increase number of image in the model
  incrNumImage(){  
    this.setState((state) => ({numImage: state.numImage + 1}));
  }

  // Increase number of image loaded in the model
  incrNumLoadedImage(){
    this.setState((state) => ({numLoadedImage: state.numLoadedImage + 1}));
  }

  // Used to add node when loading 
  handleBackendLoadNodes(node){
    console.log("Back end load");
    if(node.uid.includes("start")){
      const requestOptionsStart = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'START',
          name: node.name,
          entity_name: node.entity_name,
          generation: {
            dist: "NORMAL",
            loc: 20,
            scale: 2
          },
          limit: node.limit,
          uid: node.uid
        })
      };

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Start Node");
      });
    }
    else if(node.uid.includes("station")){
      const requestOptionsBasic = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BASIC',
          // Change the name value to this.state.name to refer to user input
          name: node.name,
          capacity: parseInt(node.capacity),
          time_func: parseInt(node.time_func),
          uid: node.uid
        })
      };

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Basic Node");
      });
    }
    else if(node.uid.includes("end")){
      const requestOptionsEnd = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          name: node.name,
          type: "END",
          uid: node.uid
        })
      };

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsEnd).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add End Node");
      });
    }
    else{
      console.log("Invalid node being send to back end")
    }
  }

  //Handle container for the node
  handleContainer(){
    if(this.state.containerMode){
      this.setState({
        containerMode: false,
        createArrowMode: false,
        removeMode: false,
      });
      console.log("Container mode off");
    }
    else{
      this.setState({
        containerMode: true,
        createArrowMode: false,
        removeMode: false,
      });
      console.log("Container mode on");
    }
  }

  // Add interaction/resource to list
  addContainer(selectedNodeID, action, dist, resource, loc, scale, max, constantVal){
    var lst = this.state.containers;
    if(dist == "CONSTANT"){
      lst.push({
        uid: "resource" + this.state.count,
        actionTo: selectedNodeID,
        actionName: action,
        resourceName: resource,
        distribution: dist,
        init: constantVal
      })

      const addcontainer = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          name: action,
          resource: resource,
          intit : {
            init: 0
          },
          capacity: 1,
          uid: "resource" + this.state.count
        })
      };

      /**fetch to api tos set container*/
      fetch('http://127.0.0.1:5000/api/addcontainer/', addcontainer).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Contaier");
      });

    }
    else{
      lst.push({
        uid: "resource" + this.state.count,
        actionTo: selectedNodeID,
        actionName: action,
        resourceName: resource,
        distribution: dist,
        loc: loc,
        scale: scale,
        maxAmount: max      
      });

      const addcontainer = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          name: action,
          resource: resource,
          intit : {
            dist: dist,
            loc: loc,
            scale: scale
          },
          capacity: max,
          uid: "resource" + this.state.count
        })
      };

      /**fetch to api tos set container*/
      fetch('http://127.0.0.1:5000/api/addcontainer/', addcontainer).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Contaier");
      });
  
    }

    this.setState((state) => ({
      containers: lst,
      count: state.count + 1,
    }));

    console.log(lst);
  }

  // Open interaction popup
  openContainerPopup(n){
    this.setState({
        openContainer: true,
        selectedNodeID: n
    });
    console.log("Open Interactive Popup");
  }

  // Open interaction popup
  closeContainerPopup(){
      this.setState({
          openContainer: false
      });
      console.log("Close Interactive Popup");
  }

  render(){
    return (
      <div className="App">
        <div className="head">
          <Navigation 
            handleAddNode={this.addNode}
            createArrowMode={this.state.createArrowMode}
            addArrowMode={this.addArrowMode}
            handleRemoveMode={this.handleRemoveMode}
            removeMode={this.state.removeMode}
            handleReset={this.handleReset} 
            handleClearMode={this.handleClearMode}
            handleImageUpload={this.handleImageUpload}
            handleSave={this.handleSave}
            handleLoad={this.handleLoad}
            containerMode={this.state.containerMode}
            handleContainer={this.handleContainer} />
        </div>
        <div>
          <Canvas 
            startNode={this.state.startNode} 
            stationNode={this.state.stationNode} 
            endNode={this.state.endNode}
            addedStart={this.state.addedStart}
            addedStation={this.state.addedStation}
            addedEnd={this.state.addedEnd}
            confirmAdded={this.confirmAdded}
            handleChangeNode={this.handleChangeNode}

            createArrowMode={this.state.createArrowMode}
            addArrowState={this.addArrowState}
            createArrow={this.state.createArrow}
            arrows={this.state.arrows}

            removeMode={this.state.removeMode}
            handleRemove={this.handleRemove}

            clearMode={this.state.clearMode}
            handleClearMode={this.handleClearMode}

            imageStart={this.state.imageStart}
            imageStation={this.state.imageStation}
            imageEnd={this.state.imageEnd}

            handleLoad={this.handleLoad}
            loadMode={this.state.loadMode}
            loadModeMakeArrow={this.state.loadModeMakeArrow}
            incrNumImage={this.incrNumImage}
            incrNumLoadedImage={this.incrNumLoadedImage}
            numImageToLoad={this.state.numImageToLoad}
            numLoadedImage={this.state.numLoadedImage}
      //      numImage = {this.state.numImage} 
            handleBackendLoadNodes={this.handleBackendLoadNodes}
            
            openContainerPopup={this.openContainerPopup}
            containerMode={this.state.containerMode}
            ></Canvas>
        </div>

        <div>
          <AssestPopUp 
          openContainer={this.state.openContainer}
          handleContainer={this.handleContainer}
          addContainer={this.addContainer}
          closeContainerPopup={this.closeContainerPopup}
          selectedNodeID={this.state.selectedNodeID} />
        </div>
        
          

      </div>
    );
  }

}

export default App;
