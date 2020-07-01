import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      iteration: 0
    }

    this.handleIteration = this.handleIteration.bind(this);

  }

  handleIteration(e){
    var iter = parseInt(e.target.value, 10);
    if(!isNaN(iter)){
      this.setState({iteration: iter});
    }
    else{
      if(e.target.value == ""){
        this.setState({iteration: 0});
      }
    }
  }

  render(){
    return (
      <div className="App">
        <div className="head">
          <div className="set1">
            <button className="button" style={{backgroundColor:'#2cbebe'}}>+</button>
            <button className="button" style={{backgroundColor:'#2cbebe'}}>→</button>
            <button className="button" style={{backgroundColor:'red'}}>x</button>
          </div>
          <div className="set2">
            <label className="label">Iterations: </label>
            <input type="text" id="iteration" className="textbox" value={this.state.iteration} onChange={this.handleIteration}></input>
            <button className="button" style={{backgroundColor:'#4CAF50'}}>Start</button>
            <button className="button" style={{backgroundColor:'red'}}>Stop</button>
            <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Data</button>
            <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Clear</button>
          </div>
        </div>
        
      </div>
    );
  }

}

export default App;
