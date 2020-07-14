import React, { Component } from 'react';
import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'


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
      savedArrows: []
    }

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
  }



  /* Add node, determine what node to add by checking nodeType
  nodeType can be start, station, or end */
  addNode(nodeType,data){
    var xPos = 200;
    var yPos = 200;
    switch(nodeType){
      case "start":
        var node = this.state.startNode;
        node.push({
          // this ID needs to be the one set in the add node function
          uid: "start-" + this.state.count,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
          name: data.startname,
          entity_name: data.entity_name,
          gen_fun: parseInt(data.gen_fun),
          limit: parseInt(data.limit),
          imageURL: this.state.imageStart
        });
        this.setState({startNode: node, addedStart: true});

        // request options to send in post request- START NODE
        const requestOptionsStart = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'START',
            // Change the name value to this.state.name to refer to user input
            name: data.startname,
            entity_name: data.entity_name,
            gen_fun: parseInt(data.gen_fun),
            limit: parseInt(data.limit),
            // node id is this.state.startNode[0].uid
            uid: "start-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)


        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          uid: "station-" + this.state.count,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
          name:data.stationame,
          capacity: parseInt(data.capacity),
          time_func: parseInt(data.time_func),
          imageURL: this.state.imageStation
        });
        this.setState({stationNode: node, addedStation: true});

        // request options to send in post request- BASIC NODE
        // placeholder values
        const requestOptionsBasic = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'BASIC',
            // Change the name value to this.state.name to refer to user input
            name:data.stationame,
            capacity: parseInt(data.capacity),
            time_func: parseInt(data.time_func),
            uid: "station-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)

        break;

      case "end":
        var node = this.state.endNode;
        node.push({
          uid: "end-" + this.state.count,
          x: xPos,
          y: yPos,
          unit: "Second",
          name: data.endname,
          imageURL: this.state.imageEnd
        });
        this.setState({ endNode: node, addedEnd: true});

        // request options to send in post request- END NODE
        // placeholder values
        const requestOptionsEnd = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            name: data.endname,
            type: "END",
            // node id is this.state.endNode[0].uid
            uid: "end-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsEnd).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)

        break;
    }

    this.setState({
      count: this.state.count + 1,
      createArrowMode: false,
      removeMode: false
    });

    
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

    console.log(change);

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
            type: 'START',
            // node id is this.state.startNode[0].uid
            uid: change.targetId,
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

        }).catch(console.log)


        break;

      case "Station Node":


        // request options to send in post request- BASIC NODE
        // placeholder values
        const requestOptionsBasic = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'BASIC',
            // Change the name value to this.state.name to refer to user input
            name:change.stationame,
            capacity: parseInt(change.capacity),
            time_func: parseInt(change.time_func),
            uid: "station-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsBasic).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)

        break;

      case "End Node":


        // request options to send in post request- END NODE
        // placeholder values
        const requestOptionsEnd = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Change the name value to this.state.name to refer to user input
            name: change.endname,
            type: "END",
            // node id is this.state.endNode[0].uid
            uid: "end-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsEnd).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)

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
        removeMode: false
      });
    }
    else{
      this.setState({
        createArrowMode: true,
        removeMode: false
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
        createArrowMode: false
      });
    }
    else{
      this.setState({
        removeMode: true,
        createArrowMode: false
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
      console.log(this.state.arrows);
      console.log(this.state.stationNode);
      console.log(this.state.startNode);
      console.log(this.state.endNode);

    }
  }

  // Reset mode 
  handleReset(){
    this.setState({
      createArrowMode: false, 
      removeMode: false
    });
  }

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
    this.setState({
      savedStart: this.state.startNode,
      savedStation: this.state.stationNode,
      savedEnd: this.state.startEnd,
      savedArrows: this.state.arrows
    });
    console.log("Saved current model");
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
            handleSave={this.handleSave}/>
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
            imageEnd={this.state.imageEnd}></Canvas>
        </div>

        
          

      </div>
    );
  }

}

export default App;
