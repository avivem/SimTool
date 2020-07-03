import React, { Component } from 'react';
import './css/nav.css';


class Navigation extends Component{
    constructor(props){
        super(props);

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e){
        this.props.handleIteration(e.target.value)
    }

    render(){
        return(
            <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark navbar-expand ">
          


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
                  <input type="text" id="iteration" className="textbox" value={this.props.iteration} onChange={this.handleChange}></input>
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
        );
    }

}

export default Navigation;
