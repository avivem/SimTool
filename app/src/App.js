import React, { Component } from 'react';
import logo from './logo.svg';
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
    }

    this.handleIteration = this.handleIteration.bind(this);
    this.addNode = this.addNode.bind(this);
    this.confirmAdded = this.confirmAdded.bind(this);

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

  addNode(nodeType){
    var xPos = 500;
    var yPos = 300;
    switch(nodeType){
      case "start":
        var node = this.state.startNode;
        node.push({
          id: "start-" + node.length,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "second",
        });
        this.setState({startNode: node, addedStart: true});
        console.log("start-" + this.state.startNode.length);
        break;

      case "station":
        var node = this.state.stationNode;
        node.push({
          id: "station-" + node.length,
          x: xPos,
          y: yPos,
          rate: 0,
          unit: "second",
        });
        this.setState({stationNode: node, addedStation: true});
        console.log("station-" + this.state.stationNode.length);
        break;

      case "end":
        var node = this.state.endNode;
        node.push({
          id: "end-" + node.length,
          x: xPos,
          y: yPos,
          unit: "second",
        });
        this.setState({endNode: node, addedEnd: true});
        console.log("end-" + this.state.endNode.length);
        break;
    }
    
  }

  confirmAdded(){
    this.setState({
      addedStation: false,
      addedStart: false,
      addedEnd: false
    });
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
          confirmAdded={this.confirmAdded}></Canvas>

      </div>
    );
  }

}

export default App;
