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

        function updateObjects() {
            nodeList.forEach((target) => {
                var node = layer.findOne('#' + target.id);
                node.x(target.x);
                node.y(target.y);
            });
    //        this.props.stationNode.forEach((target) => {
    //            var node = layer.findOne('#' + target.id);
    //            node.x(target.x);
    //            node.y(target.y);
    //        });
    //        this.props.endNode.forEach((target) => {
    //            var node = layer.findOne('#' + target.id);
    //            node.x(target.x);
    //            node.y(target.y);
     //         });
            
            layer.batchDraw();
          }

          nodeList.forEach((target) => {
            var node = new Konva.Circle({
              id: target.id,
              fill: Konva.Util.getRandomColor(),
              radius: 20 + Math.random() * 20,
              shadowBlur: 10,
              draggable: true,
            });
            layer.add(node);
    
            node.on('dragmove', () => {
              // mutate the state
              target.x = node.x();
              target.y = node.y();
    
              // update nodes from the new state
              updateObjects();
            });
          });
    
        updateObjects();

        
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
