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
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
          


        {/*navbar*/}
          <div class="collapse navbar-collapse " id="navbarsExampleDefault">
            <ul class="navbar-nav mr-auto ">
              <li class="nav-item active">
                <button className="button" style={{backgroundColor:'#2cbebe'}}>+</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'#2cbebe'}}>→</button>
              </li>
              <li class="nav-item">
                <button className="button" style={{backgroundColor:'red'}}>x</button>
              </li>
            </ul>

            <ul class="navbar-nav  " style={{float: 'right'}}>
              {/*fix format*/}
                <li class="nav-item">
                  <label className="label" style={{color:'white'}}>Iterations: </label>
                </li>
                <li class="nav-item active">    
                  <input type="text" id="iteration" className="textbox" value={this.state.iteration} onChange={this.handleIteration}></input>
                </li>
                <li class="nav-item active">
                  <button className="button" style={{backgroundColor:'#4CAF50'}}>Start</button>
                </li>
                <li class="nav-item active">
                  <button className="button" style={{backgroundColor:'red'}}>Stop</button>
                </li>
                <li class="nav-item active">
                  <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Data</button>
                </li>
                <li class="nav-item active">
                  <button className="button" style={{backgroundColor:'yellow', color:"black"}}>Clear</button>
                </li>
            </ul>

          </div>
        </nav>



              <div className="set1">
                
                
                
              </div>
              <div className="set2">

              
              </div>

 
        </div>
      {/*main content*/}
        <main role="main">
        </main>
      </div>
    );
  }

}

export default App;
