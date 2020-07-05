import React, { Component } from 'react';

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

import Konva from 'konva';

class Canvas extends Component{
    constructor(props){
        super(props);

        this.state = {
            stage: "",
            layer: ""
        }
    }



    componentDidMount(){
        
        var width = window.innerWidth;
        var height = window.innerHeight;
        var nodeList = [];

        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height,
        });
        var layer = new Konva.Layer();
        stage.add(layer);

        console.log(nodeList);


        nodeList.forEach(target => {
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
                layer.batchDraw();
            });
            
        });        
        layer.batchDraw();

        this.setState({
            stage: stage,
            layer: layer
        });

    }

    componentDidUpdate(prevProps, prevState){
        

        var layer = this.state.layer;
        
        if(this.props.addedStart){
            var target = this.props.startNode[this.props.startNode.length - 1];


            var nodeStart = new Konva.Circle({
                id: target.id,
                fill: 'red',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });

            layer.add(nodeStart);
            nodeStart.on('dragmove', () => {
                // mutate the state
                target.x = nodeStart.x();
                target.y = nodeStart.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });
            
            layer.batchDraw();
            this.props.confirmAdded();

        }

        if(this.props.addedStation){
            var target = this.props.stationNode[this.props.stationNode.length - 1];

            var nodeStation = new Konva.Circle({
                id: target.id,
                fill: 'green',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });

            layer.add(nodeStation);
            nodeStation.on('dragmove', () => {
                // mutate the state
                target.x = nodeStation.x();
                target.y = nodeStation.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });
            
            layer.batchDraw();
            this.props.confirmAdded();

        }

        if(this.props.addedEnd){
            var target = this.props.endNode[this.props.endNode.length - 1];

            var nodeEnd = new Konva.Circle({
                id: target.id,
                fill: 'blue',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });

            layer.add(nodeEnd);
            nodeEnd.on('dragmove', () => {
                // mutate the state
                target.x = nodeEnd.x();
                target.y = nodeEnd.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });
            
            layer.batchDraw();
            this.props.confirmAdded();

        }
        
    }

    render(){



        return(
          <div>
            <p>  .  </p>
            <p> .     </p>
            <p>. </p>
         
            <div id="container"></div>
              
          </div>
        );
    }

}

export default Canvas;
