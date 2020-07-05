import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './components/navigationbar'


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      iteration: 0,
      startNode: [],
      stationNode: [],
      endNode: []
    }

    this.handleIteration = this.handleIteration.bind(this);
    this.addNode = this.addNode.bind(this);

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
    var xPos = 30;
    var yPos = 30;
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
        this.setState({startNode: node});
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
        this.setState({stationNode: node});
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
        this.setState({endNode: node});
        console.log("end-" + this.state.endNode.length);
        break;
    }
    
  }

  render(){
    return (
      <div className="App">
        <div className="head">
          <Navigation iteration={this.state.iteration} handleIteration={this.handleIteration} handleAddNode={this.addNode} />
        </div>
      {/*main content*/}
        <main role="main">
  
        </main>
      </div>
    );
  }

}

export default App;
