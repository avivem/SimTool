import React, { Component } from 'react';

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

import Konva from 'konva';
import Popup from "reactjs-popup";

import './css/popup.css';



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
        this.onChange = this.onChange.bind(this);

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
        var r = parseInt(e.target.value, 10);
        if(!isNaN(r)){
            this.setState({rate: r});
        }
        else{
            if(e.target.value == ""){
            this.setState({rate: 0});
            }
        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
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

    }

    componentDidMount(){
        /** create the stage and layer when page is first loaded */

        var width = window.innerWidth;
        var height = window.innerHeight;

        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height,
            draggable: true
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
                from: target.uid,
                currDir: "to"
            });

            //outline of the From node change to yellow to show that the node is selected
            var fromNode = layer.findOne('#' + target.uid);
            fromNode.stroke("yellow");
            fromNode.strokeWidth(5);
            fromNode.draw();
        }
        else{
            if(this.state.from !== target.uid){
                this.setState({
                    currDir: "from"
                });

                this.props.addArrowState(this.state.from, target.uid)

                // request options to send in connection request
                const requestOptionsStart = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
   
                    // from and to nodes
                    from: this.state.from,
                    to: target.uid
                  })
                };
                console.log(this.state.from)
                console.log(target.uid)
                // fetch to api to create connection
                fetch(`http://127.0.0.1:5000/api/dirto/`, requestOptionsStart).then(gotUser => {
                    console.log(gotUser);

                }).catch(console.log)
            }
            else{
                this.setState({
                    currDir: "from"
                });
            }
            //Change outline of the From node back to normal, meaning that it is unselected
            var fromNode = layer.findOne('#' + this.state.from);
            fromNode.stroke("black");
            fromNode.strokeWidth(5);
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
            var line = layer.findOne('#' + connect.uid);
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


        if(this.props.addedStart || this.props.addedStation || this.props.addedEnd){
            /** New node are added to the end of the array so just needed to look at the end*/
            var target;
            if(this.props.addedStart){
                target = this.props.startNode[this.props.startNode.length - 1];
            }
            if(this.props.addedStation){
                target = this.props.stationNode[this.props.stationNode.length - 1];
            }
            if(this.props.addedEnd){
                target = this.props.endNode[this.props.endNode.length - 1];
            }

            var colorFill = "";
            var header = "";
            var url = "";
            if(this.props.addedStart){
                colorFill = 'red';
                header = "Start Node";
                url = this.props.imageStart;
            }
            if(this.props.addedStation){
                colorFill = 'green';
                header = "Station Node";
                url = this.props.imageStation;
            }
            if(this.props.addedEnd){
                colorFill = 'blue';
                header = "End Node";
                url = this.props.imageEnd;
            }
            var node = new Konva.Circle({
                id: target.uid,
                fill: colorFill,
                radius: 20,
                shadowBlur: 10,
                stroke:"black",
                strokeWidth: 5,
                draggable: true,
                x: target.x,
                y: target.y
            });

            var t = this;
            // console.log("Test");
            // console.log(url);
            // console.log("Test");
            if(url == null){
                var node = new Konva.Circle({
                    id: target.uid,
                    fill: colorFill,
                    radius: 20,
                    shadowBlur: 10,
                    stroke:"black",
                    strokeWidth: 5,
                    draggable: true,
                    x: target.x,
                    y: target.y
                });

                layer.add(node);

                node.on('dragmove', () => {
                    // mutate the state
                    target.x = node.x();
                    target.y = node.y();
        
                    // update nodes from the new state
                    this.update();
                    layer.batchDraw();
                });

                /** Node is click so open popup*/
                node.on('click', () =>{
                    if(this.props.createArrowMode){
                        /* Help determine the to and from node. Once determine the arrow is 
                        added to the list of arrows in App.js */
                        t.findToAndFrom(target);
                    }
                    else{
                        if(this.props.removeMode){
                            // remove arrows
                            this.props.arrows.forEach(arrow => {
                                if(arrow.from == target.uid || arrow.to == target.uid){
                                    var arrow_uid = arrow.uid;
                                    var n = layer.findOne('#' + arrow_uid);
                                    n.destroy();
                                    this.props.handleRemove(arrow_uid);
                                }
                            });

                            //remove node
                            this.props.handleRemove(target.uid);
                            node.destroy();

                            layer.draw();
                        }
                        else{
                            /*Open speficif popup for the node to change details*/
                            if(target.type == 'START'){
                                this.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: header
                                })
                                this.openPopup();
                            }else if(target.type == 'BASIC'){
                                this.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: header
                                })
                                this.openPopup();
                            }else{
                                this.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: header
                                })
                                this.openPopup();
                            }

                        }
                    }
                })
                
                layer.batchDraw();
            }
            else{
                Konva.Image.fromURL(url, function (node) {
                    node.setAttrs({
                        id: target.uid,
                        x: target.x,
                        y: target.y,
                        shadowBlur: 10,
                        stroke:"black",
                        strokeWidth: 5,
                        draggable: true,    
                    });
                    layer.add(node);
    
                    node.on('dragmove', () => {
                        // mutate the state
                        target.x = node.x();
                        target.y = node.y();
            
                        // update nodes from the new state
                        t.update();
                        layer.batchDraw();
                    });
    
                    /** Node is click so open popup*/
                    node.on('click', () =>{
                        if(t.props.createArrowMode){
                            /* Help determine the to and from node. Once determine the arrow is 
                            added to the list of arrows in App.js */
                            t.findToAndFrom(target);
                        }
                        else{
                            if(t.props.removeMode){
                                // remove arrows
                                t.props.arrows.forEach(arrow => {
                                    if(arrow.from == target.uid || arrow.to == target.uid){
                                        var arrow_uid = arrow.uid;
                                        var n = layer.findOne('#' + arrow_uid);
                                        n.destroy();
                                        t.props.handleRemove(arrow_uid);
                                    }
                                });
    
                                //remove node
                                t.props.handleRemove(target.uid);
                                node.destroy();
    
                                layer.draw();
                            }
                            else{
                                /*Open popup for the node to change the rate/unit */
                                t.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: header
                                })
                                t.openPopup();
                            }
                        }
                    })
                    
                    layer.batchDraw();
                });    
            }

            this.props.confirmAdded();
        }
        
        if(this.props.createArrow){
            /** New node are added to the end of the array so just needed to look at the end*/
            var target = this.props.arrows[this.props.arrows.length - 1];

            var line = new Konva.Arrow({
                id: target.uid,
                stroke: 'black',
                fill: 'black',
            });
            layer.add(line);

            line.on('click', () => {
                if(this.props.removeMode){
                    //remove node
                    this.props.handleRemove(target.uid); 
                    line.destroy();
                    layer.draw();
                }
            });

            this.update();
            this.props.confirmAdded();

        }

        if(this.props.clearMode){
            layer.find('Arrow').destroy();
            layer.find('Circle').destroy();
            layer.find('Image').destroy();
            layer.draw();
            this.props.handleClearMode();
        }

    }

    render(){
        // let content;
        // console.log(this.state)
        // // determine content in popup
        // if(this.state.type == "End Node"){
        //     content =   <div><label className="label">Name:
        //                     <input 
        //                         type="text" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeName} />
        //                 </label></div>
        // }else if(this.state.type == "Start Node"){
        //     content =   <div><label className="label">Name:
        //                     <input 
        //                         type="text" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeName}
        //                          />
        //                 </label>
        //                 <label className="label">Gen Function:
        //                     <input 
        //                         type="number" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeGen}
        //                          />
        //                 </label>
        //                 <label className="label">Limit:
        //                     <input 
        //                         type="number" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeLimit}
        //                          />
        //                 </label></div>
        // }else{
        //     content =   <div><label className="label">Name:
        //                     <input 
        //                         type="text" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeName}
        //                          />
        //                 </label>
        //                 <label className="label">Capacity:
        //                     <input 
        //                         type="number" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeCapa}
        //                          />
        //                 </label>
        //                 <label className="label">Time Function:
        //                     <input 
        //                         type="number" 
        //                         className="form-control"
        //                         id="rate" 
        //                         onchange={this.handleChangeName}
        //                          />
        //                 </label></div>
        // }

        return(
            <div>
                <p>.</p>
                <p>.</p>
                <p>.</p>
                <div id="container" style={{backgroundColor:'grey'}}></div>

                <div>
                    {/*Popup for the node*/ }
                    <Popup open={this.state.open} closeOnDocumentClick = {true} onClose={this.closePopup}>
                        <h1>{this.state.type}</h1>

                        {/*content in popup- start, beginning or end*/}
                        {/*{content}*/}

                        <button className="button" onClick={this.handleChangeNode}>
                            Apply
                        </button>
                    </Popup>
                </div>
                
            </div>
        );
    }

}

export default Canvas;
