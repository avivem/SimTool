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
      removeMode: false
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
          id: "start-" + this.state.count,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
        });
        this.setState({startNode: node, addedStart: true});
        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          id: "station-" + this.state.count,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "Second",
        });
        this.setState({stationNode: node, addedStation: true});
        break;

      case "end":
        var node = this.state.endNode;
        node.push({
          id: "end-" + this.state.count,
          x: xPos,
          y: yPos,
          unit: "Second",
        });
        this.setState({ endNode: node, addedEnd: true});
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
        if(target.id == id){
          target.unit = unit;
          target.rate = rate / r;
        }
      });

      this.setState({startNode: lst});
    }
    if(id.includes('station')){
      var lst = this.state.stationNode;
      lst.forEach(target =>{
        if(target.id == id){
          target.unit = unit;
          target.rate = rate / r;
        }
      });
      this.setState({stationNode: lst});
    }
    if(id.includes('end')){
      var lst = this.state.endNode;
      lst.forEach(target =>{
        if(target.id == id){
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
      id: "arrow-" + this.state.count,
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
        if(target.id != id){
          lst.push({
            id: target.id,
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
        if(target.id != id){
          if(id.includes('end')){
            lst.push({
              id: target.id,
              x: target.x,
              y: target.y,
              unit: target.unit,
            });
          }
          else{
            lst.push({
              id: target.id,
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

  handleReset(){
    this.setState({
      createArrowMode: false, 
      removeMode: false
    });
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
            handleReset={this.handleReset} />
        </div>

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
          handleRemove={this.handleRemove} ></Canvas>

      </div>
    );
  }

}

export default App;
