import React, { Component } from 'react';

import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'
import AssetPopUp from './components/asset'
import UpdatePopUp from './components/update'
import ContainerPopup from './components/container';
import SpecSelectPopup from './components/SpecSelectPopup';


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
      updateMode: true,
      
      containers: [],
      specs: [],

      openSpec: false,
      openContainer: false,
      openSpecSelect: false,    // For popup to select start node to app spec to 
      selectedSpec: {},

      selectedNodeID: "",

      logics: [],
      
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
    this.handleResetSim = this.handleResetSim.bind(this);
    
    this.handleImageUpload = this.handleImageUpload.bind(this);

    this.handleSave = this.handleSave.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.incrNumImage = this.incrNumImage.bind(this);
    this.incrNumLoadedImage = this.incrNumLoadedImage.bind(this);
    this.handleBackendLoadNodes = this.handleBackendLoadNodes.bind(this);

    this.closeContainerPopup = this.closeContainerPopup.bind(this);
    this.submitContainer = this.submitContainer.bind(this);
    this.deleteContainer = this.deleteContainer.bind(this);

    this.openUpdatePopup = this.openUpdatePopup.bind(this);
    this.closeUpdatePopup = this.closeUpdatePopup.bind(this);

    this.openSpecPopup = this.openSpecPopup.bind(this);
    this.closeSpecPopup = this.closeSpecPopup.bind(this);
    this.addSpec = this.addSpec.bind(this);

    this.openSpecSelectPopup = this.openSpecSelectPopup.bind(this);
    this.closeSpecSelectPopup = this.closeSpecSelectPopup.bind(this);
    this.useBlueprintMakeContainer = this.useBlueprintMakeContainer.bind(this);
    this.editSpec = this.editSpec.bind(this);
    this.deleteSpec = this.deleteSpec.bind(this);
    
    this.submitLogic = this.submitLogic.bind(this);
    this.createLogic = this.createLogic.bind(this);
    this.createConditionGroup = this.createConditionGroup.bind(this);
    this.createCondition = this.createCondition.bind(this);
    this.createAction = this.createAction.bind(this);
    this.submitEditLogic = this.submitEditLogic.bind(this);
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
          dist: data.dist,
          loc: parseInt(data.loc),
          scale: parseInt(data.scale),
          limit: parseInt(data.limit),
          imageURL: data.imageFile,
          logic: data.logic
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
         // need to change startNode array
         this.state.startNode[0].name = change.startname;
         this.state.startNode[0].entity_name = change.entity_name;
         this.state.startNode[0].dist = change.dist;
         this.state.startNode[0].loc = change.loc;
         this.state.startNode[0].scale = change.scale;
         this.state.startNode[0].limit = change.limit;

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
             uid: uid,
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
             uid: uid,
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
            dist: node.dist,
            loc: node.loc,
            scale: node.scale
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

      const requestOptionsStartLogic = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: node.uid,
          split_policy: node.logic
        })
      };

      fetch('http://127.0.0.1:5000/api/node/logic/', requestOptionsStartLogic).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add Start Logic");
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

  // Add interaction/resource to list
  addSpec(specName, dist, resource, loc, scale, max, constantValue,capacity,value){
    var lst = this.state.specs;
    lst.push({
      uid: "spec-" + this.state.count,
  //    specTo: [],
      name: specName,
      resourceName: resource,
      distribution: dist,
      loc: loc,
      scale: scale,
      capacity: max,
      constantValue: constantValue
    });

    var addcontainerspec;
    if(dist == "CONSTANT"){
      if(capacity == 0){
        if(value == -1){
          console.log("ticket");
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
                init: value
              },
              uid: "spec-" + this.state.count
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

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/container/blueprint/', addcontainerspec).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add Contaier");
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
  submitContainer(selectedNode, name, resource, loc, scale, dist, capacity, constantValue){
    var lst = this.state.containers;
    lst.push({
      uid: "container-" + this.state.count,
      selectedNode: selectedNode,
      name: name + "-" + this.state.count,
      resourceName: resource,
      loc: loc,
      scale: scale,
      distribution: dist,
      capacity: capacity,
      constantValue: constantValue
    });

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

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/container/blueprint/', addblue).then(res => res.json()).then(gotUser => {
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

  // Open interaction popup
  openSpecPopup(){
    this.setState({
        openSpec: true,
    });
    console.log("Open spec Popup");
  }

  // close interaction popup
  closeSpecPopup(){
      this.setState({
          openSpec: false
      });
      console.log("Close spec Popup");
  }

  // Open interaction popup
  openUpdatePopup(n){
    this.setState({
        openUpdate: true,
        selectedNodeID: n
    });
    console.log("Open Interactive Popup");
  }

  // Open interaction popup
  closeUpdatePopup(){
      this.setState({
          openUpdate: false
      });
      console.log("Close Interactive Popup");
  }

  // This is passed to the sidebarr which is called when a spec is clicked on, the spec is the selected spec
  openSpecSelectPopup(spec){
    this.setState({
      openSpecSelect: true,
      selectedSpec: spec,
     // selectedSpecTo: spec.specTo
    })
  }
  
  // Close the popup to select start node to apply the selected spec to, called in t he SoecSelectPopup.js
  closeSpecSelectPopup(){
    this.setState({
      openSpecSelect: false,
      selectedSpec: {},
   //   selectedSpecTo: []
    });
  }

  // Make container for the selected list of nodes
  useBlueprintMakeContainer(spec, nodes){
    var containers = this.state.containers;
    var count = this.state.count;

    // Create container for each of node
    nodes.lst.forEach((uid) => {
      
      containers.push({
        uid: "container-" + count,
        selectedNode: uid,
        name: spec.name + "-" + count,
        resourceName: spec.resourceName,
        loc: spec.loc,
        scale: spec.scale,
        distribution: spec.distribution,
        capacity: spec.capacity,
        constantValue: spec.constantValue
      });
      count = count + 1;

    });


/*
    var specs = this.state.specs;
    specs.forEach((s) => {
      if(s.uid == spec.uid){
        s.specTo = nodes;
      }
    });

    this.setState({
      specs: specs
    });
*/

    this.setState({
      containers: containers,
      count: count
    });

    console.log(nodes);

    // multiple nodes
      var assignSpec = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            owner: nodes.lst[0],
            blueprint: spec.uid,
          })
      };

      /**fetch to api tos set container*/
      fetch('http://127.0.0.1:5000/api/node/container/', assignSpec).then(res => res.json()).then(gotUser => {
          console.log(gotUser);

      }).catch(function() {
          console.log("Error on add container from spec");
      });
  }
  
  // Edit the selected spec, selectedSpec is a dict
  editSpec(selectedSpec, specName, dist, resource, loc, scale, max, constantValue){
    var specs = this.state.specs;
    
    specs.forEach((s) => {
      if(s.uid == selectedSpec.uid){
          s.name = specName;
          s.resourceName = resource;
          s.distribution = dist;
          s.loc = loc;
          s.scale = scale;
          s.maxAmount = max;  
          s.constantValue = constantValue;
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

    console.log(specs);
  }

  

  // status - new/edit, if new then add new logic, if edit then edit an existing logic
  // cond - el==, el<=, el<, el>=, el>
  // condAmount/actionAmount - should be a number
  // resource - should be a resource from an assign container
  // action - ADD or SUB
  // passPath/failPath - UID of node of path to go
  // selectedNodeID - UID of the selected node 
  submitLogic(status, cond, condAmount, resource, action, actionAmount, passPath, passName, failPath, failName, selectedNodeID){
    var lst = this.state.logics;
    if(status == "new"){
      lst.push({
        uid: "logic-" + this.state.count,
        applyTo: selectedNodeID,
        resource: resource,
        cond: cond,
        condAmount: condAmount,
        action: action,
        actionAmount: actionAmount,
        passPath: passPath,
        passName: passName,
        failPath: failPath,
        failName: failName,
      });
    }
    else{
      lst.forEach((l) => {
        if(selectedNodeID == l.applyTo){
          l.resource= resource;
          l.cond= cond;
          l.condAmount= condAmount;
          l.action= action;
          l.actionAmount= actionAmount;
          l.passPath= passPath;
          l.passName= passName;
          l.failPath= failPath;
          l.failName= failName;
        }
      })
    }


    this.setState((state) => ({
      count: state.count + 1,
      logics: lst
    }))

    console.log(lst);
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
  // passOath/failPath  - array of nodes UID
  // passName/failName - array of string of nodes Name 
  // Ex: where passName[1] would be name for node at passNode[1]
  createConditionGroup(selectedNodeID, groupName, passPath, passName, failPath, failName){
    var lst = this.state.logics;
    lst.forEach((l) => {
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.push({
          name: groupName,
          conditions: [],
          actions: [],
          passPath: passPath,
          passName: passName,
          failPath: failPath,
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

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/logic/condition_group/', condGroup).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });

  }

  // Add a condition to the group with the groupName
  createCondition(selectedNodeID, groupName, name, entityName, nodeName, check, val){
    var lst = this.state.logics;
    lst.forEach((l) => {
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          if(group.name == groupName){
            // Add new condition to group
            group.conditions.push({
              name: name,
              encon_name: entityName,
              nodecon_name: nodeName,
              check: check,
              val: val
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
          nodecon_name: nodeName,
          op: check,
          val: val
        })
    };

    /**fetch to api tos set container*/
    fetch('http://127.0.0.1:5000/api/node/logic/condition_group/condition/', cond).then(res => res.json()).then(gotUser => {
        console.log(gotUser);

    }).catch(function() {
        console.log("Error on add condition group");
    });
  }

  // Add a condition to the group with the groupName 
  createAction(selectedNodeID, groupName, name, entityName, nodeName, op, val){
    var lst = this.state.logics;
    lst.forEach((l) => {
      if(l.applyTo == selectedNodeID){
        l.conditionsActionsGroup.forEach((group) => {
          if(group.name == groupName){
            // Add new condition to group
            group.actions.push({
              name: name,
              encon_name: entityName,
              nodecon_name: nodeName,
              op: op,
              val: val
            });
          }
        });
      }
    });
    this.setState({
      logics: lst
    });
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
            handleResetSim={this.handleResetSim}
            handleImageUpload={this.handleImageUpload}
            handleSave={this.handleSave}
            handleLoad={this.handleLoad}
            updateMode={this.state.updateMode}
            handleContainer={this.handleContainer} 
            openSpecPopup={this.openSpecPopup}/>
            
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
            handleResetSim={this.handleResetSim}

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
            handleBackendLoadNodes={this.handleBackendLoadNodes}
            
            openUpdatePopup={this.openUpdatePopup}
            updateMode={this.state.updateMode}

            specs={this.state.specs}
            openSpecSelectPopup={this.openSpecSelectPopup}
            deleteSpec={this.deleteSpec}
            />
        </div>

        <div>
          <AssetPopUp 
          openSpec={this.state.openSpec}
          addSpec={this.addSpec}
          closeSpecPopup={this.closeSpecPopup}
           />
        </div>

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
          submitLogic={this.submitLogic}
          logics={this.state.logics}
          specs={this.state.specs}
          createLogic={this.createLogic}
          createConditionGroup={this.createConditionGroup}
          createCondition={this.createCondition}
          createAction={this.createAction}
          
          useBlueprintMakeContainer={this.useBlueprintMakeContainer}

          submitEditLogic={this.submitEditLogic}
          />
        </div>
        
        <div>
          <ContainerPopup
          selectedNodeID={this.state.selectedNodeID}
          openContainer= {this.state.openContainer}
          closeContainerPopup={this.closeContainerPopup}
          submitContainer={this.submitContainer}
          />
        </div>
        
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
