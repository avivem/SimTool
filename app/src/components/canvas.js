import React, { Component } from 'react';

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

import Konva from 'konva';

class Canvas extends Component{
    constructor(props){
        super(props);
    }



    componentDidMount(){
        
        var width = window.innerWidth;
        var height = window.innerHeight;
        var nodeList = this.props.startNode

        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height,
        });
        var layer = new Konva.Layer();
        stage.add(layer);

        

        
    }

    render(){



        return(
          <div>
             
                <p>  .  </p>
            <p> .     </p>
            <p>. </p>
            <div id="drag-items">
                <img src={StartImage} draggable="true" alt="start"/>
                <img src={EndImage} draggable="true" alt="end"/>
            </div>
            <div id="container"></div>
              
          </div>
        );
    }

}

export default Canvas;
