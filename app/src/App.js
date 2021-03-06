import React, { Component } from 'react';

import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'
import BlueprintPopUp from './components/blueprint'
import UpdatePopUp from './components/update'

import SpecSelectPopup from './components/SpecSelectPopup';

import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

import { store } from 'react-notifications-component';

// Main component that connect all of the other components like popup,
// sidebar, navigation bar, canvas. All functions that modified the 
// state of nodes, logic, arrows, containers, blueprint are in this component.
class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      // node arrays
      startNode: [],
      stationNode: [],
      endNode: [],

      // variables to determine if start, station or end node has been added
      addedStart: false,
      addedStation: false,
      addedEnd: false,

      count: 0,

      // determine which modes are turned on
      createArrowMode: false,
      createArrow: false,
      removeMode: false,
      clearMode: false,

      // arrays for saved states
      savedStart: [],
      savedStation: [],
      savedEnd: [],
      savedArrows: [],
      savedNumImage: 0,
      savedContainer: [],
      savedSpecs: [],
      savedLogics: [],
      loadMode: false,
      loadModeMakeArrow: false,
      numImage: 0,
      numLoadedImage: 0,
      numImageToLoad: 0,

      // arrow array
      arrows: [],
      
      // blueprint array, container array, logic array
      specs: [],
      containers: [],
      logics: [],
      selectedSpec: {},

      // variables to determine if pop ups are open or not
      openBlue: false,
      openContainer: false,
      openSpecSelect: false,    // For popup to select start node to app spec to 
      updateMode: true,

      selectedNodeID: "",

      // variable to determine the stepping through the model
      stepperPos: -1,
      stepLst: [],
      stepOldLst: [],
      stepCommand: false,
    }

    // numImage keep track of current number of image in model
    // numLoadedImage keep track of number of image loaded in model
    // savedNumImage saved the numImage for load
    // numImageToLoad used in loading to keep track of how many image needed to be load

    // adding new node
    this.addNode = this.addNode.bind(this);
    this.confirmAdded = this.confirmAdded.bind(this);
    this.handleChangeNode = this.handleChangeNode.bind(this);
    this.handleBackendLoadNodes = this.handleBackendLoadNodes.bind(this);

    // handing arrow mode functions
    this.addArrowMode = this.addArrowMode.bind(this);
    this.addArrowState = this.addArrowState.bind(this);

    // removinf noodes
    this.handleRemoveMode = this.handleRemoveMode.bind(this);
    this.handleRemove = this.handleRemove.bind(this);

    // resetting the canvas, clearing canvas, resetting environment
    this.handleReset= this.handleReset.bind(this);
    this.handleClearMode = this.handleClearMode.bind(this);
    this.handleResetSim = this.handleResetSim.bind(this);
    
    // image upolad
    this.incrNumLoadedImage = this.incrNumLoadedImage.bind(this);

    // handle saving anf loading
    this.handleSave = this.handleSave.bind(this);
    this.handleLoadFromFile = this.handleLoadFromFile.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.incrNumImage = this.incrNumImage.bind(this);
    this.incrNumLoadedImage = this.incrNumLoadedImage.bind(this);
    this.handleBackendLoadNodes = this.handleBackendLoadNodes.bind(this);
    this.handleBackendLoadSpecs = this.handleBackendLoadSpecs.bind(this);
    this.handleBackendLoadContainers = this.handleBackendLoadContainers.bind(this);
    this.handleBackendLoadLogics = this.handleBackendLoadLogics.bind(this);

    // adding new container from blueprint, deleting container
    this.submitContainer = this.submitContainer.bind(this);
    this.deleteContainer = this.deleteContainer.bind(this);

    // open/close update/settings popup
    this.openUpdatePopup = this.openUpdatePopup.bind(this);
    this.closeUpdatePopup = this.closeUpdatePopup.bind(this);

    // add new blueprint, open/close blueprint popup
    this.openBlueprintPopup = this.openBlueprintPopup.bind(this);
    this.closeBlueprintPopup = this.closeBlueprintPopup.bind(this);
    this.addBlueprint = this.addBlueprint.bind(this);
    this.useBlueprintMakeContainer = this.useBlueprintMakeContainer.bind(this);

    // open blueprint pop up from sidebar 
    this.openSpecSelectPopup = this.openSpecSelectPopup.bind(this);
    this.closeSpecSelectPopup = this.closeSpecSelectPopup.bind(this);
    this.editSpec = this.editSpec.bind(this);
    this.deleteSpec = this.deleteSpec.bind(this);
    
    this.createLogic = this.createLogic.bind(this);
    this.createConditionGroup = this.createConditionGroup.bind(this);
    this.createActionGroup = this.createActionGroup.bind(this);
    this.createCondition = this.createCondition.bind(this);
    this.createAction = this.createAction.bind(this);
    this.editConditionGroup = this.editConditionGroup.bind(this);
    this.editActionGroup = this.editActionGroup.bind(this);
    this.editCondition = this.editCondition.bind(this);
    this.editAction = this.editAction.bind(this);

    // This logic is a field in the nodes
    this.submitEditLogic = this.submitEditLogic.bind(this);

    // function for stepper
    this.makeStepperLst = this.makeStepperLst.bind(this);
    this.stepper = this.stepper.bind(this);
  }

  /* Add node, determine what node to add by checking nodeType
  nodeType can be start, station, or end */
  // Only start node have a container to be use in the logic
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
          dist: data.dist,
          loc: parseInt(data.loc),
          scale: parseInt(data.scale),
          limit: parseInt(data.limit),
          imageURL: data.imageFile,
          logic: data.logic,
          containers: []
        });
        this.setState({startNode: node, addedStart: true});
        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          uid: "station-" + this.state.count,
          type: "STATION",
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
          name:data.stationame,
          capacity: parseInt(data.capacity),
          time_func: parseInt(data.time_func),
          imageURL: data.imageFile,
          logic: data.logic
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
  handleChangeNode(change,uid,type){

     switch(type){
       case "Start Node":
         //update the state that store this node         
         var lst = this.state.startNode;
         lst.forEach((n) => {
           if(uid == n.uid){
            n.name = change.startname;
            n.entity_name = change.entity_name;
            n.dist = change.dist;
            n.loc = change.loc;
            n.scale = change.scale;
            n.limit = change.limit;
           }
         });

         this.setState({ startNode: lst });


         // request options to send in post request- START NODE
         const requestOptionsStart = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             // node id is this.state.startNode[0].uid
             uid: uid,
             type: 'START',
             // Change the name value to this.state.name to refer to user input
             name: change.startname,
             entity_name: change.entity_name,
             generation: {
               dist: change.dist,
               loc: parseInt(change.loc),
               scale: parseInt(change.scale),
             },
             limit: parseInt(change.limit),

           })
         };

         console.log(requestOptionsStart);

         /**fetch to api */
         fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(res => res.json()).then(gotUser => {
             console.log(gotUser);

        }).catch(function() {
            console.log("Error on change Start Node");
        });


         break;

       case "Station Node":

         //update the state that store this node
         var lst = this.state.stationNode;
         lst.forEach((n) => {
           if(uid == n.uid){
            n.name = change.stationname;
            n.capacity = change.capacity;
            n.time_func = change.time_func;              
           }
         });

         this.setState({ stationNode: lst });

         // console.log(this.state.stationNode);

         // request options to send in post request- BASIC NODE
         // placeholder values
         const requestOptionsBasic = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             uid: uid,
             type: 'STATION',
             // Change the name value to this.state.name to refer to user input
             name:change.stationame,
             capacity: parseInt(change.capacity),
             time_func: parseInt(change.time_func),

           })
         };

         console.log(requestOptionsBasic);

         /**fetch to api */
         fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(res => res.json()).then(gotUser => {
             console.log(gotUser);

        }).catch(function() {
            console.log("Error on change Basic Node");
        });

         break;

        case "End Node":
          //update the state that store this node
          var lst = this.state.endNode;
          lst.forEach((n) => {
            if(uid == n.uid){
              n.name = change.endname;
            }
          })

          this.setState({ endNode: lst});
          
         // request options to send in post request- END NODE
         // placeholder values
         const requestOptionsEnd = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             uid: uid,
             type: 'END',
             // Change the name value to this.state.name to refer to user input
             name: change.endname,
             // node id is this.state.endNode[0].uid

           })
         };

         console.log(requestOptionsEnd);

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
        updateMode: false
      });
    }
    else{
      this.setState({
        createArrowMode: true,
        removeMode: false,
        updateMode: false
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
        updateMode: false
      });
    }
    else{
      this.setState({
        removeMode: true,
        createArrowMode: false,
        updateMode: false
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
      updateMode: false
    });
  }

  // Clear Canvas
  handleClearMode(v){
    if(!v){
      this.setState({clearMode: v});
      console.log("Clear canvas");
    }
    else{
      this.setState({
        clearMode: v,
        arrows: [],
        startNode: [],
        stationNode: [],
        endNode: [],
        containers: [],
        specs: [],
        stepperPos: -1,
        stepLst: [],
        stepOldLst: [],
        stepCommand: false,
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

  // Reset Simulation to run again
  handleResetSim(){
    const requestReset = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }

    //Send request to backend to reset the simulation timer.
    //Aviv: I am keeping the gotUser syntax but this should be renamed with everything else.
    fetch('http://127.0.0.1:5000/api/reset/', requestReset).then(res => res.json()).then(gotUser => {
      console.log(gotUser);
    }).catch(function() {
      console.log("Error on reset. Check backend.");
    });

    console.log("Simulation has been reset.")
  }

  // Save the current model
  handleSave(){
    var lst1 = this.state.startNode;
    var lst2 = this.state.stationNode;
    var lst3 = this.state.endNode;
    var lst4 = this.state.arrows;
    var num = this.state.numImage
    var containers = this.state.containers;
    
    var specs = this.state.specs;
    var logics = this.state.logics;

    var obj = {
      startNode: lst1,
      stationNode: lst2,
      endNode: lst3,
      arrows: lst4,
      numImage: num,
      containers: containers,
      specs: specs,
      logics: logics,
    }

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "model.json";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
    
    console.log("Saved current model");  
  }

  // Load the saved file part to the saved statement 
  handleLoadFromFile(file){
    fetch(file).then(response => response.json()).then((loadedData) => {
      console.log(typeof(loadedData.startNode));

      // Set the data from file to specific statement
      // This happen because when image is upload for image
      // there is a call back to display the node. This create a conflict
      // when connection are being created when node is currently not on the 
      // stage yet. 
      this.setState({
        savedStart: loadedData.startNode,
        savedStation: loadedData.stationNode,
        savedEnd: loadedData.endNode,
        savedArrows: loadedData.arrows,
        savedNumImage: loadedData.numImage,
        savedContainer: loadedData.containers,
        savedSpecs: loadedData.specs,
        savedLogics: loadedData.logics,
      });

      // Clear the stage
      this.handleClearMode(true);

      // Handle the load 
      this.handleLoad();

    }).catch((error) => {console.log(error)});
  }

  // Load saved model
  handleLoad(){
    var makeNode = this.state.loadMode;
    var makeArrow = this.state.loadModeMakeArrow; 

    var lst1 = this.state.savedStart;
    var lst2 = this.state.savedStation;
    var lst3 = this.state.savedEnd;
    var lst4 = this.state.savedArrows;
    var num = this.state.savedNumImage;
    var containers = this.state.savedContainer;
    var specs = this.state.savedSpecs;
    var logics = this.state.savedLogics;

    if(makeNode == false && makeArrow == false){
      this.setState({
        loadMode: true,
        startNode: lst1,
        stationNode: lst2,
        endNode: lst3,
        numImage: 0,
        numLoadedImage: 0,
        numImageToLoad: num,
        containers: containers,
        specs: specs,
        logics: logics
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

      /* TODO: CREATE THE handleBackendLoadContainers and handleBackendLoadSpecs */
      this.handleBackendLoadSpecs();
      this.handleBackendLoadContainers();
      this.handleBackendLoadLogics();
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
  // Also used for regular adding node
  handleBackendLoadNodes(node){
    console.log("Back end load");

    // if a start node is created
    if(node.uid.includes("start")){
      //Create start node on backend
      const requestOptionsStart = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'START',
          name: node.name,
          entity_name: node.entity_name,
          generation: {
            dist: node.dist,
            loc: node.loc,
            scale: node.scale
          },
          limit: node.limit,
          uid: node.uid
        })
      };

      console.log(requestOptionsStart);

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Start Node");

          store.addNotification({
            title: "Error on add Start Node",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
      });


      // can start nodes have to have logic? ie. NONE
      const requestOptionsStartLogic = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: node.uid,
          split_policy: node.logic
        })
      };

      console.log(requestOptionsStartLogic);

      fetch('http://127.0.0.1:5000/api/node/logic/', requestOptionsStartLogic).then(gotUser => {
          console.log(gotUser);

          store.addNotification({
            title: "Start Node Added Successfully",
            message: " ",
            type: "success",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });

      }).catch(function() {
          console.log("Error on add Start Logic");

          store.addNotification({
            title: "Error on add Start Node",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
      });

    }
    // if a station node is created
    else if(node.uid.includes("station")){
      //Create station node on backend
      const requestOptionsBasic = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATION',
          
          name: node.name,
          capacity: parseInt(node.capacity),
          time_func: parseInt(node.time_func),
          uid: node.uid
        })
      };

      console.log(requestOptionsBasic);

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Basic Node");

          store.addNotification({
            title: "Error on add Station Node",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
      });

      // create logic if needed
      if(node.logic != "NONE"){
        console.log(node.logic);
        const requestOptionsStartLogic = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner: node.uid,
            split_policy: node.logic
          })
        };

        console.log(requestOptionsStartLogic);

        fetch('http://127.0.0.1:5000/api/node/logic/', requestOptionsStartLogic).then(gotUser => {
            console.log(gotUser);

            store.addNotification({
              title: "Station Node Added Successfully",
              message: " ",
              type: "success",
              insert: "top",
              container: "bottom-right",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 5000,
                onScreen: true
              }
            });

        }).catch(function() {
            console.log("Error on add Station Logic");

          store.addNotification({
            title: "Error on add Station Node",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
        });
      }else{
          store.addNotification({
              title: "Station Node Added Successfully",
              message: " ",
              type: "success",
              insert: "top",
              container: "bottom-right",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 5000,
                onScreen: true
              }
          });
      }
    }
    // if an end node is created
    else if(node.uid.includes("end")){
      //Create end node on backend
      const requestOptionsEnd = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: node.name,
          type: "END",
          uid: node.uid
        })
      };

      console.log(requestOptionsEnd);

      /**fetch to api */
      fetch('http://127.0.0.1:5000/api/node/', requestOptionsEnd).then(gotUser => {
          console.log(gotUser);

        store.addNotification({
          title: "End Node Added Successfully",
          message: " ",
          type: "success",
          insert: "top",
          container: "bottom-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            onScreen: true
          }
        });

      }).catch(function() {
          console.log("Error on add End Node");

          store.addNotification({
            title: "Error on add End Node",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
      });

    }//invalid
    else{
      console.log("Invalid node being send to back end")
    }
  }

  // Use to add specs when loading
  handleBackendLoadSpecs(){
    var specs = this.state.specs;
    specs.forEach((s) => {
      var uid = s.uid;
      var name = s.name;
      var resource = s.resource;
      var dist = s.distribution;
      var loc = s.loc;
      var scale = s.scale;
      var capacity = s.capacity;
      var init = s.init


      var addcontainerspec;
      if(dist == "CONSTANT"){
        if(capacity == 0){
          if(init == -1){
            addcontainerspec = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // Change the name value to this.state.name to refer to user input
                name: name,
                resource: resource,
                init : {
                  init: "inf"
                },
                uid: uid
              })
            };
          }else{
            addcontainerspec = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // Change the name value to this.state.name to refer to user input
                name: name,
                resource: resource,
                init : {
                  init: init
                },
                uid: uid
              })
            };
          }

        }else{
          console.log("attendee");
          addcontainerspec = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              name: name,
              resource: resource,
              init : {
                init: capacity
              },
              capacity: capacity,
              uid: uid
            })
          };
        }
      }else{
        addcontainerspec = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            name: name,
            resource: resource,
            init : {
              dist: dist,
              loc: loc,
              scale: scale
            },
            capacity: capacity,
            uid: uid
          })
        };  
      }

      /**fetch to api to set container*/
      fetch('http://127.0.0.1:5000/api/container/blueprint/', addcontainerspec).then(gotUser => {
        console.log(gotUser);

        store.addNotification({
            title: "Continer Added Successfully",
            message: " ",
            type: "success",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });

      }).catch(function() {
          console.log("Error on add Contaier");
      });

    });

  }

  // Used to add containers to backend when loading from file
  handleBackendLoadContainers(){
    var containers = this.state.containers;

    // Make the container
    containers.forEach((c) => {
      //TODO: THIS WILL NOT WORK IF THE CONTAINER WAS NOT MADE FROM A BLUEPRINT
      //c.fromBluePrint can be No or something spec/blueprint uid
      
      const addcontainer = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          owner: c.selectedNode,
          blueprint: c.fromBluePrint
        })
      };

      fetch('http://127.0.0.1:5000/api/node/container/', addcontainer).then(gotUser => {
        console.log(gotUser);

        //   store.addNotification({
        //     title: "Arrow Mode On",
        //     message: " ",
        //     type: "success",
        //     insert: "top",
        //     container: "bottom-right",
        //     animationIn: ["animated", "fadeIn"],
        //     animationOut: ["animated", "fadeOut"],
        //     dismiss: {
        //       duration: 5000,
        //       onScreen: true
        //     }
        // });

      }).catch(function() {
          console.log("Error on add container from spec");
      });

    })

  }

  // Use to add logic to backend when loading from file
  handleBackendLoadLogics(){
    var logics = this.state.logics;

    // Loop to all logics
    logics.forEach((l) => {
      var group = l.conditionsActionsGroup;
      //Loop to all group in the current logic to create all condition group and action group
      group.forEach((condGroup) => {
        var data = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            owner: l.applyTo,
            name: condGroup.name,
            pass_paths: condGroup.pass_paths,
            fail_paths: condGroup.fail_paths
          })
        };
        /**fetch to api tos set condition group*/
        fetch('http://127.0.0.1:5000/api/node/logic/cond_group/', data).then(gotUser => {
          console.log(gotUser);

          store.addNotification({
              title: "Condition Group Successfully Added",
              message: " ",
              type: "success",
              insert: "top",
              container: "bottom-right",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 5000,
                onScreen: true
              }
          });

        }).catch(function() {
            console.log("Error on add condition group");


            store.addNotification({
                title: "Error on Adding Condition Group",
                message: " ",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
          });
        });

        // Create action group
        var actGroup= {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
          owner: l.applyTo,
          cond_group: condGroup.name,
          name: condGroup.actionGroup.name
          })
        };

        /**fetch to api tos set action group*/
        fetch('http://127.0.0.1:5000/api/node/logic/cond_group/action_group/', actGroup).then(gotUser => {
          console.log(gotUser);

          store.addNotification({
              title: "Action Group Successfully Added",
              message: " ",
              type: "success",
              insert: "top",
              container: "bottom-right",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 5000,
                onScreen: true
              }
          });

        }).catch(function() {
            console.log("Error on add condition group");

            store.addNotification({
                title: "Error on Adding Action Group",
                message: " ",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
            });
        });
      });

      // Loop to all group and create the conditions and actions
      group.forEach((condGroup) => {
        // Loop to all conditions in the group
        condGroup.conditions.forEach((c) => {
          var cond= {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              owner: l.applyTo,
              cond_group: condGroup.name,
              name: c.name,
              encon_name: c.encon_name,
              nodecon_name: c.nodecon_name,
              op: c.check,
              val: c.val
            })
          };

          /**fetch to api tos set condition*/
          fetch('http://127.0.0.1:5000/api/node/logic/cond_group/condition/', cond).then(gotUser => {
            console.log(gotUser);


            store.addNotification({
                title: "Condition Successfully Added",
                message: " ",
                type: "success",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
            });

          }).catch(function() {
            console.log("Error on add condition");

            store.addNotification({
                title: "Error on Adding Condition",
                message: " ",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
            });
          });

        });

        // Loop to all actions in the group
        condGroup.actionGroup.actions.forEach((a) => {
          var action= {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
            owner: l.applyTo,
            cond_group: condGroup.name,
            name: a.name,
            encon_name: a.encon_name,
            nodecon_name: a.nodecon_name,
            op: a.op,
            val: a.val
            })
          };

          /**fetch to api tos set container*/
          fetch('http://127.0.0.1:5000/api/node/logic/cond_group/action_group/action/', action).then(gotUser => {
            console.log(gotUser);

            store.addNotification({
                title: "Action Successfully Added",
                message: " ",
                type: "success",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
            });

          }).catch(function() {
            console.log("Error on add action");

            store.addNotification({
                title: "Error on Adding Action",
                message: " ",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 5000,
                  onScreen: true
                }
            });
          });

        });
      })

    })
  }


  // Add blueprint to the state that hold all of the blueprint and send it to backend
  addBlueprint(specName, dist, resource, loc, scale, max, init, capacity){
    var lst = this.state.specs;
    lst.push({
      uid: "spec-" + this.state.count,
      name: specName,
      resource: resource,
      distribution: dist,
      loc: loc,
      scale: scale,
      capacity: (dist == "CONSTANT" ? capacity : max),
      //constantValue: constantValue,
      init: init
    });

    var addcontainerspec;
    // constant distribution
    if(dist == "CONSTANT"){
      // if capacity is zero
      if(capacity == 0){
        // if init is not chosen -infinity
        if(init == -1){
          addcontainerspec = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              name: specName,
              resource: resource,
              init : {
                init: "inf"
              },
              uid: "spec-" + this.state.count
            })
          };
        // else- defined init
        }else{
          console.log("rev");
          addcontainerspec = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              name: specName,
              resource: resource,
              init : {
                init: init
              },
              uid: "spec-" + this.state.count
            })
          };
        }

      }else{
      // max capacity and init
        addcontainerspec = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            name: specName,
            resource: resource,
            init : {
              init: max
            },
            capacity: capacity,
            uid: "spec-" + this.state.count
          })
        };
      }
    }else{
      // not a constant distrivution
      addcontainerspec = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          name: specName,
          resource: resource,
          init : {
            dist: dist,
            loc: loc,
            scale: scale
          },
          capacity: max,
          uid: "spec-" + this.state.count
        })
      };  
    }

    console.log(addcontainerspec);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/blueprint/', addcontainerspec).then(gotUser => {
        console.log(gotUser);

        store.addNotification({
            title: "Blueprint Added Successfully",
            message: " ",
            type: "success",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });

    }).catch(function() {
        console.log("Error on add Contaier");

        store.addNotification({
            title: "Error on Adding Blueprint",
            message: " ",
            type: "danger",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });
    });

    this.setState((state) => ({
      specs: lst,
      count: state.count + 1,
    }));

    console.log("Add spec")
    console.log(lst);
  }

  // close interaction popup
  closeContainerPopup(){
      this.setState({
          openContainer: false
      });
      console.log("Close container Popup");
  }

  // Add a new container
  // Currently, the code that use this func is commented out. The code is in update.js
  submitContainer(selectedNode, name, resource, loc, scale, dist, capacity, init){
    // TODO: can just call addBlueprint and useBlueprintMakeContainer
    var lst = this.state.containers;
    lst.push({
      uid: "container-" + this.state.count,
      selectedNode: selectedNode,
      name: name,
      resource: resource,
      loc: loc,
      scale: scale,
      distribution: dist,
      capacity: capacity,
      init: init,
      fromBluePrint: "No" 
    });

    // Create a list of containers name that are applied to the start node
    if(selectedNode.includes("start")){
      var startNode = this.state.startNode;
      startNode.forEach((n) => {
        if(n.uid == selectedNode){
          n.containers.push(name);
        }
      });

      this.setState({ startNode: startNode});
    }

    const addblue = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Change the name value to this.state.name to refer to user input
        name: name,
        resource: resource,
        init : {
          dist: dist,
          loc: loc,
          scale: scale
        },
        capacity: capacity,
        uid: selectedNode
      })
    };

    console.log(addblue);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/container/blueprint/', addblue).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add Contaier");
    });

    const addcontainer = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Change the name value to this.state.name to refer to user input
        owner: selectedNode,
        blueprint: name
      })
    };

    console.log(addcontainer);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/container/', addcontainer).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add Contaier");
    });

    this.setState((state) => ({
      count: state.count + 1 
    }));

    console.log("Added container");
    console.log(lst);

  }

  // Delete the given container
  deleteContainer(containerUID){
    var containers = []
    this.state.containers.forEach((c) => {
      if(c.uid !== containerUID){
        containers.push(c);
      }
    });

    this.setState({ containers: containers });

    console.log(containers);
  }

  // Open blueprint popup
  openBlueprintPopup(){
    this.setState({
        openBlue: true,
    });
    console.log("Open blueprint Popup");
  }

  // close blueprint popup
  closeBlueprintPopup(){
      this.setState({
          openBlue: false
      });
      console.log("Close blueprint Popup");
  }

  // Open update popup
  openUpdatePopup(n){
    this.setState({
        openUpdate: true,
        selectedNodeID: n
    });
    console.log("Open update Popup");
    console.log(n);
  }

  // close update popup
  closeUpdatePopup(){
      this.setState({
          openUpdate: false
      });
      console.log("Close update Popup");
  }

  // This is passed to the sidebar which is called when a blueprint 
  // is clicked on, the blueprint is the selected spec
  // Used to open the popup for the blueprint clicked on the sidebar
  openSpecSelectPopup(spec){
    this.setState({
      openSpecSelect: true,
      selectedSpec: spec,
     // selectedSpecTo: spec.specTo
    })
    console.log("open spec select")
  }
  
  // Close the popup that allow user to select start/station node to apply the
  // selected spec to, called in the SpecSelectPopup.js. Popup also allow
  // user to edit the blueprint. 
  closeSpecSelectPopup(){
    this.setState({
      openSpecSelect: false,
      selectedSpec: {},
   //   selectedSpecTo: []
    });
  }

  // Make container for the selected list of nodes
  useBlueprintMakeContainer(blueprint, nodes){
    var containers = this.state.containers;
    var count = this.state.count;
    var startNode = this.state.startNode;

    // Create container for each of node
    nodes.lst.forEach((uid) => {   
      containers.push({
        uid: "container-" + count,
        selectedNode: uid,
        name: blueprint.name,
        resource: blueprint.resource,
        loc: blueprint.loc,
        scale: blueprint.scale,
        distribution: blueprint.distribution,
        capacity: blueprint.capacity,
        init: blueprint.init,
        fromBluePrint: blueprint.uid
      });

      // Create a list of containers name that are applied to the start node
      if(uid.includes("start")){
        startNode.forEach((n) => {
          if(n.uid == uid){
            n.containers.push(blueprint.name);
          }
        })

        // multiple nodes
        var assignBlue = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              owner: nodes.lst[0],
              blueprint: blueprint.uid,
            })
        };

        console.log(assignBlue);

        /**fetch to api tos set container from blueprint*/
        fetch('http://127.0.0.1:5000/api/node/blueprint/', assignBlue).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(function() {
            console.log("Error on add container from blueprint");
        });
      }else{
        // multiple nodes
        var assignBlue = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Change the name value to this.state.name to refer to user input
              owner: nodes.lst[0],
              blueprint: blueprint.uid,
            })
        };

        console.log(assignBlue);

        /**fetch to api tos set container from blueprint*/
        fetch('http://127.0.0.1:5000/api/node/container/blueprint/', assignBlue).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(function() {
            console.log("Error on add container from blueprint");
        });
      }
      count = count + 1;
    });

    this.setState({
      containers: containers,
      count: count,
      startNode: startNode
    });
  }
  
  // Edit the selected spec, selectedSpec is a dict
  editSpec(selectedSpec, specName, dist, resource, loc, scale, max, init){
    var specs = this.state.specs;
    
    specs.forEach((s) => {
      if(s.uid == selectedSpec.uid){
          s.name = specName;
          s.resource = resource;
          s.distribution = dist;
          s.loc = loc;
          s.scale = scale;
          s.maxAmount = max;  
          s.init = init;
      }
    });

    this.setState({
      specs: specs
    });

    // fetch to edit spec
  }

  // Delete the given spec
  deleteSpec(specUID){
    var specs = [];

    // Create new list of specs 
    this.state.specs.forEach((s) => {
      if(s.uid !== specUID){
        specs.push(s);
      }
    });

    this.setState({ specs: specs });

    // fetch to delete spec
  }


  // Create the logic for selected node
  createLogic(selectedNodeID){
    var lst = this.state.logics;
    lst.push({
      uid: "logic-" + this.state.count,
      applyTo: selectedNodeID,
      conditionsActionsGroup: []
    })

    this.setState((state) => ({
      logics: lst,
      count: state.count + 1 
    }));
  }

  // Add the condition group which will include the conditions and actions
  // selectedNodeID - uid of the selected node
  // passPath/failPath  - array of nodes UID
  // passName/failName - array of string of nodes Name 
  // Ex: where passName[1] would be name for node at passNode[1]
  createConditionGroup(selectedNodeID, groupName, passPath, passName, failPath, failName){
    var lst = this.state.logics;

    console.log(passPath);
    console.log(failPath);

    lst.forEach((l) => {
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.push({
          name: groupName,
          conditions: [],
          actionGroup: {
            name: "",
            actions: []
          },
          pass_paths: passPath,
          passName: passName,
          fail_paths: failPath,
          failName: failName
        });
      }
    });

    this.setState({
      logics: lst
    });


    var condGroup = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          owner: selectedNodeID,
          name: groupName,
          pass_paths: passPath,
          fail_paths: failPath
        })
    };

    console.log(condGroup);

    /**fetch to api tos set condition group*/
    fetch('http://127.0.0.1:5000/api/node/logic/cond_group/', condGroup).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });

  }

  // Add a condition to the condition group that have the name groupName
  createCondition(selectedNodeID, groupName, name, entityName, nodeContainerName, check, val){

    var lst = this.state.logics;
    lst.forEach((l) => {
      // find logic of selected node
      if(l.applyTo == selectedNodeID){ 
        l.conditionsActionsGroup.forEach((group) => {
          // find condition group with the give name groupName
          if(group.name == groupName){
            // Add new condition to group
            group.conditions.push({
              name: name,
              encon_name: entityName,
              nodecon_name: nodeContainerName,
              check: check,
              val: parseInt(val)
            });
          }
        });
      }
    });

    this.setState({
      logics: lst
    });

    var cond= {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
          owner: selectedNodeID,
          cond_group: groupName,
          name: name,
          encon_name: entityName,
          nodecon_name: nodeContainerName,
          op: check,
          val: parseInt(val)
        })
      };

    console.log(cond);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/logic/cond_group/condition/', cond).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });
  }

  // Create Action group 
  createActionGroup(selectedNodeID, conditionGroupName, actionGroupName){
    var lst = this.state.logics;
    lst.forEach((l) => {
      // find logic object of the selected node
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          // find condition group with the name conditionGroupName
          if(group.name == conditionGroupName){
            // Add new condition to group
            group.actionGroup.name = actionGroupName;
          }
        });
      }
    });
    this.setState({
      logics: lst
    });


    var actGroup= {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
        owner: selectedNodeID,
        cond_group: conditionGroupName,
        name: actionGroupName
        })
    };

    console.log(actGroup);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/logic/cond_group/action_group/', actGroup).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });

    console.log(lst);
  }

  // Add a condition to the group with the groupName 
  createAction(selectedNodeID, groupName, name, entityName, nodeContainerName, op, val, agn){
    var lst = this.state.logics;


    lst.forEach((l) => {
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          if(group.name == groupName){
            // Add new action to group
            group.actionGroup.actions.push({
              name: name,
              encon_name: entityName,
              nodecon_name: nodeContainerName,
              op: op,
              val: parseInt(val)
            });
          }
        });
      }
    });
    this.setState({
      logics: lst
    });

    var action= {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change the name value to this.state.name to refer to user input
        owner: selectedNodeID,
        cond_group: groupName,
        name: name,
        encon_name: entityName,
        nodecon_name: nodeContainerName,
        op: op,
        val: parseInt(val)
        })
    };

    console.log(action);

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/logic/cond_group/action_group/action/', action).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });

  }

  // Update to the condition group
  // oldGroup is an dict of old value of action group
  editConditionGroup(selectedNodeID, groupName, passPath, passName, failPath, failName, oldGroup){
    var lst = this.state.logics;
    var oldName = oldGroup.name;

    lst.forEach((l) => {
      // find logic obj of the selected node
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          // find the condition group with the old group name
          if(group.name == oldName){
            group.name = groupName;
            group.pass_paths = passPath;
            group.passName = passName;
            group.fail_paths = failPath;
            group.failName = failName
          }
        });

      }
    });

    this.setState({ logics: lst });

    // fetch to edit cond
  }
  
  // Update to the action group
  // oldActionGroup is an array of 2 element group [group name, old value of action group]
  editActionGroup(selectedNodeID, groupName, oldActionGroup){
    var lst = this.state.logics;
    var oldName = oldActionGroup[0];

    lst.forEach((l) => {
      // find logic obj of the selected node
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          // find condition group with the old group name
          if(group.name == oldName){
            group.actionGroup.name = groupName;
          }
        });
      }
    });

    this.setState({ logics: lst});
    console.log(lst);

    // fetch to edit action

  }

  // Update to the condition
  // oldCondition is an array of 2 element group [group name, old value of condition]
  editCondition(selectedNodeID, groupName, name, entityName, nodeContainerName, check, val, oldCondition){
    var lst = this.state.logics;
    var oldGroupName = oldCondition[0];

    // When editing condition, user can change the condition group it belong to.
    // If condition group change, then need to remove condition from old group then add
    // new condition to the new condition group.
    // If condition group did not change, then find the old condition and modify it.
    if(groupName != oldGroupName){
      // Remove condition from this group
      lst.forEach((l) => {
        // find logic obj of the selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
            // find condition group with the old group name
            if(group.name == oldGroupName){
              var condLst = [];
              group.conditions.forEach((c) => {
                // Remove the changed condition
                if(c.name !== oldCondition[1].name){
                  condLst.push(c);
                }
              });
              group.conditions = condLst;
            }
          });
        }
      });
      // Make the new condition in new group
      lst.forEach((l) => {
        // find logic obj of the selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
          // find condition group with the old group name
            if(group.name == groupName){
              group.conditions.push({
                name: name,
                encon_name: entityName,
                nodecon_name: nodeContainerName,
                check: check,
                val: parseInt(val)
              });
            }
          });
        }
      });

    }
    else{
      // Condition remain in same group, just value are changed
      lst.forEach((l) => {
        // find logic obj of the selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
            // find condition group with the old group name
            if(group.name == groupName){
              group.conditions.forEach((c) => {
                // Find the old condition to modify
                if(c.name == oldCondition[1].name){
                  c.name = name;
                  c.encon_name = entityName;
                  c.nodecon_name = nodeContainerName;
                  c.check = check;
                  c.val = parseInt(val);
                }
              });
            }
          });
        }
      });

    }

    this.setState({ logics: lst });
    console.log(lst);

    // fetch to edit cond
  }

  // Update to the action
  // oldActionGroup is an array of 2 element group [group name, old value of action]
  editAction(selectedNodeID, groupName, name, entityName, nodeContainerName, op, val, agn, oldAction){
    var lst = this.state.logics;
    var oldGroupName = oldAction[0];
    
    // When editing action, user can change the condition group it belong to.
    // If condition group change, then need to remove action from old group then add
    // new action to the new condition group.
    // If condition group did not change, then find the old action and modify it.
    if(groupName != oldGroupName){

      // Remove condition from this group
      lst.forEach((l) => {
        // find logic obj of the selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
            // find condition group with the old group name
            if(group.name == oldGroupName){
              var lstAction = [];
              group.actionGroup.actions.forEach((a) => {
                // Remove the changed action
                if(a.name != oldAction[1].name){
                  lstAction.push(a);
                }
              });
              group.actionGroup.actions = lstAction
            }
          });
        }
      });

      // Create action in new group
      lst.forEach((l) => {
        // find logic obj of the selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
            // find condition group with the old group name
            if(group.name == groupName){
              // Add action to group
              group.actionGroup.actions.push({
                name: name,
                encon_name: entityName,
                nodecon_name: nodeContainerName,
                op: op,
                val: parseInt(val)
              });
            }
          });
        }
      });
    }
    else{
      // Action remain in same group, just data are changed
      lst.forEach((l) => {
        // find logic object of selected node
        if(l.applyTo == selectedNodeID){
          l.conditionsActionsGroup.forEach((group) => {
            // find condition group with the old group name
            if(group.name == oldGroupName){
              group.actionGroup.actions.forEach((a) => {  
                // Change old action value
                if(a.name == oldAction[1].name){
                  a.name = name;
                  a.encon_name = entityName;
                  a.nodecon_name = nodeContainerName;
                  a.op = op;
                  a.val = parseInt(val);
                }
              });
            }
          });
        }
      });
    }

    this.setState({ logics: lst });
    console.log(lst);

    // fetch to edit action
  }


  // Change the logic of a node
  submitEditLogic(nodeUID, logic){
    var lst = []; 
    if(nodeUID.includes("start")){
      lst = this.state.startNode;
    }
    else if(nodeUID.includes("station")){
      lst = this.state.stationNode;
    }
    else if(nodeUID.includes("end")){
      lst = this.state.endNode;
    }

    lst.forEach((n) => {
      if(n.uid == nodeUID){
        n.logic = logic;
      }
    })

    if(nodeUID.includes("start")){
      this.setState({ startNode: lst })
    }
    else if(nodeUID.includes("station")){
      this.setState({ stationNode: lst })
    }
    else if(nodeUID.includes("end")){
      this.setState({ endNode: lst })
    }
  }

  // Create a list of node the stepper will go through 
  makeStepperLst(){
    // Save the previous list, will be use to clear mark on the canvas
    var currentStepLst = this.state.stepLst;
    this.setState({ stepOldLst: currentStepLst });

    // Make the new list
    var start = this.state.startNode;
    var current = start[Math.floor(Math.random() * start.length)].uid;
    var paths = this.state.arrows;
    var lst = [current];
    // make the step list
    while(!current.includes("end")){
      var findNext = "";
      paths.forEach((p) => {
        if(p.from == current){
          findNext = p.to;
        }
      });
      lst.push(findNext);
      current = findNext;
    }

    this.setState({ 
      stepLst: lst,
      stepperPos: -1,
    });
  }

  // Use to tell the stepper to go forward
  stepper(){
    var cmd = this.state.stepCommand;
    if(!cmd && this.state.stepLst.length !== 0){
      // do the step
      cmd = true;
      this.setState((state) => ({
        stepperPos: state.stepperPos + 1 
      }));
    }
    else{
      // Step is done
      cmd = false;
    }

    this.setState({ stepCommand: cmd });

  }

  render(){
    return (
      <div className="App">

        <ReactNotification />
        {/* Navigation Bar */}
        <div className="head">
          <Navigation 
            handleAddNode={this.addNode}
            createArrowMode={this.state.createArrowMode}
            addArrowMode={this.addArrowMode}
            handleRemoveMode={this.handleRemoveMode}
            removeMode={this.state.removeMode}
            handleReset={this.handleReset} 
            handleClearMode={this.handleClearMode}
            handleResetSim={this.handleResetSim}
            handleSave={this.handleSave}
            handleLoadFromFile={this.handleLoadFromFile}
            updateMode={this.state.updateMode}
            handleContainer={this.handleContainer} 
            openBlueprintPopup={this.openBlueprintPopup}

            makeStepperLst={this.makeStepperLst}
            stepper={this.stepper}
            stepperPos={this.state.stepperPos}
            stepLst={this.state.stepLst}
            stepCommand={this.state.stepCommand}
            />
        </div>

        {/* Canvas */}
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
            handleResetSim={this.handleResetSim}

            handleLoad={this.handleLoad}
            loadMode={this.state.loadMode}
            loadModeMakeArrow={this.state.loadModeMakeArrow}
            incrNumImage={this.incrNumImage}
            incrNumLoadedImage={this.incrNumLoadedImage}
            numImageToLoad={this.state.numImageToLoad}
            numLoadedImage={this.state.numLoadedImage}
            handleBackendLoadNodes={this.handleBackendLoadNodes}
            
            openUpdatePopup={this.openUpdatePopup}
            updateMode={this.state.updateMode}

            specs={this.state.specs}
            openSpecSelectPopup={this.openSpecSelectPopup}
            deleteSpec={this.deleteSpec}

            stepper={this.stepper}
            stepperPos={this.state.stepperPos}
            stepLst={this.state.stepLst}
            stepOldLst={this.state.stepOldLst}
            stepCommand={this.state.stepCommand}
            />
        </div>

        {/* Blueprint Popup from NavBar */}
        <div>
          <BlueprintPopUp 
          openBlue={this.state.openBlue}
          addBlueprint={this.addBlueprint}
          closeBlueprintPopup={this.closeBlueprintPopup}
           />
        </div>

        {/* Update PopUp from Node*/}
        <div>
          <UpdatePopUp 
          openUpdate={this.state.openUpdate}
          closeUpdatePopup={this.closeUpdatePopup}
          selectedNodeID={this.state.selectedNodeID}
          startNode={this.state.startNode}
          stationNode={this.state.stationNode} 
          endNode={this.state.endNode}
          handleChangeNode={this.handleChangeNode}

          submitContainer = {this.submitContainer}
          deleteContainer = {this.deleteContainer}
          
          arrows={this.state.arrows}
          containers={this.state.containers}
          logics={this.state.logics}
          specs={this.state.specs}
          createLogic={this.createLogic}
          createConditionGroup={this.createConditionGroup}
          createActionGroup={this.createActionGroup}
          createCondition={this.createCondition}
          createAction={this.createAction}
          editConditionGroup={this.editConditionGroup}
          editActionGroup={this.editActionGroup}
          editCondition={this.editCondition}
          editAction={this.editAction}
          
          useBlueprintMakeContainer={this.useBlueprintMakeContainer}
          submitEditLogic={this.submitEditLogic}
          />
        </div>
        
        {/* Blueprint pop up from sidebaar */}
        <div>
          <SpecSelectPopup
          openSpecSelect= {this.state.openSpecSelect}
          startNode={this.state.startNode}
          stationNode={this.state.stationNode}
          selectedSpec={this.state.selectedSpec}
          closeSpecSelectPopup={this.closeSpecSelectPopup}
          useBlueprintMakeContainer={this.useBlueprintMakeContainer}
          editSpec={this.editSpec}
          />
        </div>
      </div>
    );
  }
}

export default App;
