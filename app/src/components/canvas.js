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

    /** Open popup */
    openPopup(){
        this.setState({
            open: true
        });
        console.log("Open Popup");
    }
      
    /** Close popup */
    closePopup(){
        this.setState({
            open: false
        });
        console.log("Close Popup");
    }

    /** Keep track of the rate entered */
    handleChangeRate(e){
        this.setState({rate: e.target.value});
    }

    /**Keep track of the unit selected in the dropdown menu */
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

            default:
                break;
        }
    }

    /**Handle changing the unit/rate for a node when the Apply button in the popup is clicked */
    handleChangeNode(){
        this.setState({
            open: false
        });
        console.log("Close Popup");

        /**Call a function in App.js to change a node unit/rate */
        var r = 1
        switch(this.state.unit){
            case "Minute":
                r = 60;
                break;

            case "Hour":
                r = 60 * 60; 
                break;

            case "Day":
                r = 60 * 60 * 24;
                this.setState({unit: "Day"});
                break;

            default:
                break;
        }
        this.props.handleChangeNode(this.state.targetId, this.state.unit, this.state.rate, r);

    }

    componentDidMount(){
        /** create the stage and layer when page is first loaded */

        var width = window.innerWidth;
        var height = window.innerHeight;

        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height,
        });
        var layer = new Konva.Layer();
        stage.add(layer);

        this.setState({
            stage: stage,
            layer: layer
        });

    }

    componentDidUpdate(prevProps, prevState){
        

        var layer = this.state.layer;
        
        /*if user added a start node, then add it to the canvas and deal with moving the object*/
        if(this.props.addedStart){
            
            /**fetch to api */
            fetch('http://127.0.0.1:5000/api/start').then(res => res.json()).then(gotUser => {
                console.log(gotUser);

            }).catch(console.log)


            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.startNode[this.props.startNode.length - 1];

            /** Draw shape for node, need to change to an icon */
            var nodeStart = new Konva.Circle({
                id: target.id,
                fill: 'red',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });


            layer.add(nodeStart);

            /** Node is drag*/
            nodeStart.on('dragmove', () => {
                // mutate the state
                target.x = nodeStart.x();
                target.y = nodeStart.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });

            /** Node is click so open popup*/
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

        /*if user added a station node, then add it to the canvas and deal with moving the object*/
        if(this.props.addedStation){
            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.stationNode[this.props.stationNode.length - 1];

            /** Draw shape for node, need to change to an icon */
            var nodeStation = new Konva.Circle({
                id: target.id,
                fill: 'green',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });

            layer.add(nodeStation);

            /**Node is drag */
            nodeStation.on('dragmove', () => {
                // mutate the state
                target.x = nodeStation.x();
                target.y = nodeStation.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });

            /** Node is click so open popup*/
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

        /*if user added a end node, then add it to the canvas and deal with moving the object*/
        if(this.props.addedEnd){
            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.endNode[this.props.endNode.length - 1];

            /** Draw shape for node, need to change to an icon */
            var nodeEnd = new Konva.Circle({
                id: target.id,
                fill: 'blue',
                radius: 20,
                shadowBlur: 10,
                draggable: true,
            });

            layer.add(nodeEnd);

            /**Node is drag */
            nodeEnd.on('dragmove', () => {
                // mutate the state
                target.x = nodeEnd.x();
                target.y = nodeEnd.y();
       
                // update nodes from the new state
                layer.batchDraw();
            });

            /** Node is click so open popup*/
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
                    {/*Popup for the node*/ }
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
