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
    }

    this.handleIteration = this.handleIteration.bind(this);
    this.addNode = this.addNode.bind(this);
    this.confirmAdded = this.confirmAdded.bind(this);

    this.handleChangeNode = this.handleChangeNode.bind(this);

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
        console.log("start-" + this.state.startNode.length);
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
        console.log("station-" + this.state.stationNode.length);
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
        console.log("end-" + this.state.endNode.length);
        break;
    }

    this.setState({count: this.state.count + 1});
    
  }

  confirmAdded(){
    this.setState({
      addedStation: false,
      addedStart: false,
      addedEnd: false
    });
  }

  handleChangeNode(id, unit, rate){
    if(id.includes('start')){
      var lst = this.state.startNode;
      lst.forEach(target =>{
        if(target.id == id){
          target.unit = unit;
          target.rate = rate;
        }
      });

      this.setState({startNode: lst});
    }
    if(id.includes('station')){
      var lst = this.state.stationNode;
      lst.forEach(target =>{
        if(target.id == id){
          target.unit = unit;
          target.rate = rate;
        }
      });
      this.setState({stationNode: lst});
    }
    if(id.includes('end')){
      var lst = this.state.endNode;
      lst.forEach(target =>{
        if(target.id == id){
          target.unit = unit;
          target.rate = rate;
        }
      });
      this.setState({endNode: lst});
    }

    console.log(this.state.startNode);
    console.log(this.state.stationNode);
    console.log(this.state.endNode);
  }

  render(){
    return (
      <div className="App">
        <div className="head">
          <Navigation iteration={this.state.iteration} handleIteration={this.handleIteration} handleAddNode={this.addNode} />
        </div>

        <Canvas 
          startNode={this.state.startNode} 
          stationNode={this.state.stationNode} 
          endNode={this.state.endNode}
          addedStart={this.state.addedStart}
          addedStation={this.state.addedStation}
          addedEnd={this.state.addedEnd}
          confirmAdded={this.confirmAdded}
          handleChangeNode={this.handleChangeNode}></Canvas>

      </div>
    );
  }

}

export default App;
