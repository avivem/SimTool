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
            unit: "Second",
            from: "",
            currDir: "from"
        }

        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);

        this.handleChangeUnit = this.handleChangeUnit.bind(this)
        this.handleChangeRate = this.handleChangeRate.bind(this)
        
        this.handleChangeNode = this.handleChangeNode.bind(this);
        this.handlePeriod = this.handlePeriod.bind(this);

        this.findToAndFrom = this.findToAndFrom.bind(this);
        this.update = this.update.bind(this);
        this.getConnectorPoints = this.getConnectorPoints.bind(this);
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

    // handles the period changed by the user
    handlePeriod(){
        // post request options
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period: 'exmaple value',
          })
        };

        // post request here to connect to api
        fetch('http://127.0.0.1:5000/api/basic', requestOptions).then(res => res.json()).then(gotUser => {
            console.log(gotUser);

        }).catch(console.log)
    }

    /**Handle changing the unit/rate for a node when the Apply button in the popup is clicked */
    handleChangeNode(){

        this.setState({
            open: false
        });
        console.log("Close Popup");

        /**Call a function in App.js to change a node unit/rate */
        var r = 1
/*        switch(this.state.unit){
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
*/
        //this.props.handleChangeNode(this.state.targetId, this.state.unit, this.state.rate, r);
        this.props.handleChangeNode(this.state.targetId, "void", this.state.rate, r);

        // handle period data 
        this.handlePeriod()
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

    // Determine the To and From node, once determine pass it to a 
    // function in App.js to add the arrow to the list
    findToAndFrom(target){
        var layer = this.state.layer;
        if(this.state.currDir == "from"){
            this.setState({
                from: target.id,
                currDir: "to"
            });

            //outline of the From node change to yellow to show that the node is selected
            var fromNode = layer.findOne('#' + target.id);
            fromNode.stroke("yellow");
            fromNode.strokeWidth(2);
            fromNode.draw();
        }
        else{
            if(this.state.from !== target.id){
                this.setState({
                    currDir: "from"
                });
                this.props.addArrowState(this.state.from, target.id)
            }
            else{
                this.setState({
                    currDir: "from"
                });
            }
            //Change outline of the From node back to normal, meaning that it is unselected
            var fromNode = layer.findOne('#' + this.state.from);
            fromNode.stroke("black");
            fromNode.strokeWidth(2);
            layer.draw();
        }
        
    }

    // Calculation for the arrow 
    getConnectorPoints(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        let angle = Math.atan2(-dy, dx);

        const radius = 50;

        return [
          from.x + -radius * Math.cos(angle + Math.PI),
          from.y + radius * Math.sin(angle + Math.PI),
          to.x + -radius * Math.cos(angle),
          to.y + radius * Math.sin(angle),
        ];
      }

    // Change arrow as the node are dragged.
    update(){
        var layer = this.state.layer;

        this.props.arrows.forEach((connect) =>{
            // Get the node
            var line = layer.findOne('#' + connect.id);
            var fromNode = layer.findOne('#' + connect.from);
            var toNode = layer.findOne('#' + connect.to);
            
            // Calculate the arrow using the getConnectorPoints function
            const points = this.getConnectorPoints(
                fromNode.position(),
                toNode.position()
              );
            line.points(points);

        });
        layer.batchDraw();
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
                stroke:"black",
                strokeWidth: 2,
                draggable: true,
            });


            layer.add(nodeStart);

            /** Node is drag*/
            nodeStart.on('dragmove', () => {
                // mutate the state
                target.x = nodeStart.x();
                target.y = nodeStart.y();
       
                // update nodes from the new state
                this.update();
                layer.batchDraw();
            });

            /** Node is click so open popup*/
            nodeStart.on('click', () =>{
                if(this.props.createArrowMode){
                    /* Help determine the to and from node. Once determine the arrow is 
                    added to the list of arrows in App.js */
                    this.findToAndFrom(target);
                }
                else{
                    if(this.props.removeMode){
                        // remove arrows
                        this.props.arrows.forEach(arrow => {
                            if(arrow.from == target.id || arrow.to == target.id){
                                var arrow_id = arrow.id;
                                var n = layer.findOne('#' + arrow_id);
                                n.destroy();
                                this.props.handleRemove(arrow_id);
                            }
                        });

                        //remove node
                        this.props.handleRemove(target.id);
                        nodeStart.destroy();

                        layer.draw();
                    }
                    else{
                        /*Open popup for the node to change the rate/unit */
                        this.setState({
                            unit: target.unit,
                            rate: target.rate,
                            targetId: target.id,
                            type: "Start Node" 
                        })
                        this.openPopup();
                    }
                }
            })
            
            layer.batchDraw();
            this.props.confirmAdded();

        }

        /*if user added a station node, then add it to the canvas and deal with moving the object*/
        if(this.props.addedStation){

            /**fetch to api */
            fetch('http://127.0.0.1:5000/api/basic').then(res => res.json()).then(gotUser => {
                console.log(gotUser);

            }).catch(console.log)

            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.stationNode[this.props.stationNode.length - 1];

            /** Draw shape for node, need to change to an icon */
            var nodeStation = new Konva.Circle({
                id: target.id,
                fill: 'green',
                radius: 20,
                shadowBlur: 10,
                stroke:"black",
                strokeWidth: 2,
                draggable: true,
            });

            layer.add(nodeStation);

            /**Node is drag */
            nodeStation.on('dragmove', () => {
                // mutate the state
                target.x = nodeStation.x();
                target.y = nodeStation.y();
       
                // update nodes from the new state
                this.update();
                layer.batchDraw();
            });

            /** Node is click so open popup*/
            nodeStation.on('click', () =>{
                if(this.props.createArrowMode){
                    // Determine to and from
                    this.findToAndFrom(target);
                }
                else{
                    if(this.props.removeMode){
                        // remove arrows
                        var lstOfArrows = this.props.arrows;
                        lstOfArrows.forEach(arrow => {
                            if(arrow.from == target.id || arrow.to == target.id){
                                var arrow_id = arrow.id;
                                console.log(arrow_id);
                                var n = layer.findOne('#' + arrow_id);
                                n.destroy();
                                this.props.handleRemove(arrow_id);
                            }
                        });

                        // remove node
                        this.props.handleRemove(target.id);
                        nodeStation.destroy();
                        layer.draw();
                    }
                    else{
                    /* Open popup of the node */
                        this.setState({
                            unit: target.unit,
                            rate: target.rate,
                            targetId: target.id,
                            type: "Station Node" 
                        })
                        this.openPopup();
                    }
                }
            });
            
            layer.batchDraw();
            this.props.confirmAdded();

        }

        /*if user added a end node, then add it to the canvas and deal with moving the object*/
        if(this.props.addedEnd){

            /**fetch to api */
            fetch('http://127.0.0.1:5000/api/end').then(res => res.json()).then(gotUser => {
                console.log(gotUser);

            }).catch(console.log)

            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.endNode[this.props.endNode.length - 1];

            /** Draw shape for node, need to change to an icon */
            var nodeEnd = new Konva.Circle({
                id: target.id,
                fill: 'blue',
                radius: 20,
                shadowBlur: 10,
                stroke:"black",
                strokeWidth: 2,
                draggable: true,
            });

            layer.add(nodeEnd);

            /**Node is drag */
            nodeEnd.on('dragmove', () => {
                // mutate the state
                target.x = nodeEnd.x();
                target.y = nodeEnd.y();
       
                // update nodes from the new state
                this.update();
                layer.batchDraw();
            });

            /** Node is click so open popup*/
            nodeEnd.on('click', () =>{
                if(this.props.createArrowMode){
                    // Determine to and from
                    this.findToAndFrom(target);
                }
                else{
                    if(this.props.removeMode){
                        
                        // Remove arrows
                        var lstOfArrows = this.props.arrows
                        lstOfArrows.forEach(arrow => {
                            if(arrow.from == target.id || arrow.to == target.id){
                                var arrow_id = arrow.id;
                                var n = layer.findOne('#' + arrow_id);
                                n.destroy();
                                this.props.handleRemove(arrow_id);
                            }
                        });

                        //remove node 
                        this.props.handleRemove(target.id);
                        nodeEnd.destroy();

                        layer.draw();
                    }
                    else{
                        //open popup for node
                        this.setState({
                            unit: target.unit,
                            targetId: target.id,
                            type: "End Node" 
                        })
                        this.openPopup();    
                    }
                }
            })
            
            layer.batchDraw();
            this.props.confirmAdded();

        }
        
        if(this.props.createArrow){
            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.arrows[this.props.arrows.length - 1];

            var line = new Konva.Arrow({
                id: target.id,
                stroke: 'black',
                fill: 'black',
            });
            layer.add(line);

            line.on('click', () => {
                if(this.props.removeMode){
                    //remove node
                    this.props.handleRemove(target.id); 
                    line.destroy();
                    layer.draw();
                }
            });

            this.update();
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
 {//                       <label className="label">Unit:&nbsp;
  //                          <select 
  //                          id="unit" 
  //                          onChange={this.handleChangeUnit} 
  //                          value={this.state.unit}>
  //                              <option value="Second">Second</option>
  //                              <option value="Minute">Minute</option>
  //                              <option value="Hour">Hour</option>
  //                              <option value="Day">Day</option>
  //                          </select>
  //                      </label><br />
    }
                        {this.state.type !== "End Node" ? 
                        <label className="label">Period:&nbsp;
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
