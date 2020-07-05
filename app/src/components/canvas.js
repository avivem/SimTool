import React, { Component } from 'react';

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

import Konva from 'konva';
import Popup from "reactjs-popup";


class Canvas extends Component{
    constructor(props){
        super(props);

        this.state = {
            stage: "",
            layer: "",
            open: false,
            targetId: "",
            type: "",
            rate: 0,
            unit: "Second"
        }

        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);

        this.handleChangeUnit = this.handleChangeUnit.bind(this)
        this.handleChangeRate = this.handleChangeRate.bind(this)
        
        this.handleChangeNode = this.handleChangeNode.bind(this);
    
    }

    openPopup(){
        this.setState({
            open: true
        });
        console.log("Open Popup");
    }
      
    closePopup(){
        this.setState({
            open: false
        });
        console.log("Close Popup");
    }

    handleChangeRate(e){
        this.setState({rate: e.target.value});
    }

    handleChangeUnit(e){
        
        switch(e.target.value){
            case "Second":
                this.setState({unit: "Second"});
                break;

            case "Minute":
                this.setState({unit: "Minute"});
                break;

            case "Hour":
                this.setState({unit: "Hour"});
                break;

            case "Day":
                this.setState({unit: "Day"});
                break;
        }
    }

    handleChangeNode(){
        this.setState({
            open: false
        });
        console.log("Close Popup");


        this.props.handleChangeNode(this.state.targetId, this.state.unit, this.state.rate);

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

            nodeStart.on('click', () =>{
                this.setState({
                    unit: target.unit,
                    rate: target.rate,
                    targetId: target.id,
                    type: "Start Node" 
                })
                this.openPopup();
            })
            
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

            nodeStation.on('click', () =>{
                this.setState({
                    unit: target.unit,
                    rate: target.rate,
                    targetId: target.id,
                    type: "Station Node" 
                })
                this.openPopup();
            })
            
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

            nodeEnd.on('click', () =>{
                this.setState({
                    unit: target.unit,
                    rate: target.rate,
                    targetId: target.id,
                    type: "End Node" 
                })
                this.openPopup();
            })
            
            layer.batchDraw();
            this.props.confirmAdded();

        }
        
    }

    render(){
        return(
            <div>

                <p>.</p>
                <p>.</p>
                <p>.</p>
                <div id="container"></div>

                <div>
                    <Popup open={this.state.open} closeOnDocumentClick = {true} onClose={this.closePopup}>
                        <h1>{this.state.type}</h1>
                        <label className="label">Unit:&nbsp;
                            <select 
                            id="unit" 
                            onChange={this.handleChangeUnit} 
                            value={this.state.unit}>
                                <option value="Second">Second</option>
                                <option value="Minute">Minute</option>
                                <option value="Hour">Hour</option>
                                <option value="Day">Day</option>
                            </select>
                        </label><br />

                        {this.state.type !== "End Node" ? 
                        <label className="label">Rate:&nbsp;
                        <input 
                            type="text" 
                            id="rate" 
                            value={this.state.rate} 
                            onChange={this.handleChangeRate} />
                        </label> : <div></div>}

                        <button className="submit-button" onClick={this.handleChangeNode}>
                            Apply
                        </button>
                    </Popup>
                </div>
                
            </div>
        );
    }

}

export default Canvas;
