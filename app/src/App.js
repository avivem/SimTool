import React, { Component } from 'react';
import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      iteration: 0,
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
      
    }

    this.handleIteration = this.handleIteration.bind(this);
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
  }

  handleIteration(val){
    var iter = parseInt(val, 10);
    if(!isNaN(iter)){
      this.setState({iteration: iter});
    }
    else{
      if(val == ""){
        this.setState({iteration: 0});
      }
    }
  }

  /* Add node, determine what node to add by checking nodeType
  nodeType can be start, station, or end */
  addNode(nodeType){
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
        });
        this.setState({startNode: node, addedStart: true});

        // request options to send in post request- START NODE
        const requestOptionsStart = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'START',
            // Change the name value to this.state.name to refer to user input
            name:'Hotel',
            entity_name: 'Person',
            gen_fun: 10,
            limit: 200,
            // node id is this.state.startNode[0].uid
            uid: "start-" + this.state.count
          })
        };

        /**fetch to api */
        fetch('http://127.0.0.1:5000/api/node/', requestOptionsStart).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)

        console.log(this.state.startNode);


        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          uid: "station-" + this.state.count,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
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
            name:'Line',
            capacity: 50,
            time_func: 1000,
            // node id is this.state.stationNode[0].uid
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
        });
        this.setState({ endNode: node, addedEnd: true});

        // request options to send in post request- END NODE
        // placeholder values
        const requestOptionsEnd = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'BASIC',
            // Change the name value to this.state.name to refer to user input
            name: "Convention",
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
  handleChangeNode(id, unit, rate, r){
    if(id.includes('start')){
      var lst = this.state.startNode;
      lst.forEach(target =>{
        if(target.uid == id){
          target.unit = unit;
          target.rate = rate / r;
        }
      });

      this.setState({startNode: lst});
    }
    if(id.includes('station')){
      var lst = this.state.stationNode;
      lst.forEach(target =>{
        if(target.uid == id){
          target.unit = unit;
          target.rate = rate / r;
        }
      });
      this.setState({stationNode: lst});
    }
    if(id.includes('end')){
      var lst = this.state.endNode;
      lst.forEach(target =>{
        if(target.uid == id){
          target.unit = unit;
        }
      });
      this.setState({endNode: lst});
    }

    console.log(this.state.startNode);
    console.log(this.state.stationNode);
    console.log(this.state.endNode);
  }

  /*State is used to let the click event on the 
  node know that it should not open the popup but to be used to create arrow */
  addArrowMode(){
    this.setState({createArrowMode: true});
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
    this.setState({
      removeMode: true,
      createArrowMode: false
    });
    console.log("Handle Remove");
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

  render(){
    return (
      <div className="App">
        <div className="head">
          <Navigation 
            iteration={this.state.iteration} 
            handleIteration={this.handleIteration} 
            handleAddNode={this.addNode}
            addArrowMode={this.addArrowMode}
            handleRemoveMode={this.handleRemoveMode}
            handleReset={this.handleReset} 
            handleClearMode={this.handleClearMode}
            handleImageUpload={this.handleImageUpload}/>
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
