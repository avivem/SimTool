import React, { Component } from 'react';


class Canvas extends Component{
    constructor(props){
        super(props);

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e){
        this.props.handleIteration(e.target.value)
    }

    render(){
        return(
          <main>
          </main>
        );
    }

}

export default Canvas;
