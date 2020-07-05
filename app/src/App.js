import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Navigation from './components/navigationbar'
import Canvas from './components/canvas'


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      iteration: 0
    }

    this.handleIteration = this.handleIteration.bind(this);

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

  render(){
    return (
      <div className="App">
        <div className="head">
          <Navigation iteration={this.state.iteration} handleIteration={this.handleIteration} />
        </div>

        <Canvas></Canvas>

      </div>
    );
  }

}

export default App;
