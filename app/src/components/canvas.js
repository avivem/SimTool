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
            name: "",
            rate: 0,
            unit: "Second",
            from: "",
            currDir: "from",

            startname: "default name",
            gen_fun: 10,
            entity_name: "default entity name",
            limit: 100,

            stationname: "default name",
            capacity: 10,
            time_func: 1,

            endname: "default name",

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

        this.onChange = this.onChange.bind(this);
    }

    onChange(e){
      // console.log(e.target)
      this.setState({ [e.target.name]: e.target.value })
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

        // fetch to api to update node
        console.log("Close Popup");

        console.log(this.state);

        //this.props.handleChangeNode(this.state.targetId, this.state.unit, this.state.rate, r);
        this.props.handleChangeNode(this.state);

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

        if(this.props.addedStart || this.props.addedStation || this.props.addedEnd || this.props.loadMode){
            /** New node are added to the end of the array so just needed to look at the end*/
            var lst = [];
            if(this.props.addedStart){
                lst.push(this.props.startNode[this.props.startNode.length - 1]);
            }
            else if(this.props.addedStation){
                lst.push(this.props.stationNode[this.props.stationNode.length - 1]);
            }
            else if(this.props.addedEnd){
                lst.push(this.props.endNode[this.props.endNode.length - 1]);
            }
            else{
                // Clear the canvas
                layer.find('Arrow').destroy();
                layer.find('Circle').destroy();
                layer.find('Image').destroy();
                layer.draw();

                // Clear the back end
                fetch('http://127.0.0.1:5000/api/clean/').then(res => res.json()).then(gotUser => {
                    console.log(gotUser);

                }).catch(function() {
                    console.log("Error on add Basic Node");
                });

                // Combine all node into one list
                this.props.startNode.forEach((elem) => {
                    lst.push(elem);
                });
                this.props.stationNode.forEach((elem) => {
                    lst.push(elem);
                });
                this.props.endNode.forEach((elem) => {
                    lst.push(elem);
                });

                lst.forEach((node) => {
                    this.props.handleBackendLoadNodes(node);
                })

            }

            var t = this;
            // Go through all of the element in the lst and make the node on the canvas.
            // lst - have many element when loading and 1 element when regular adding node.
            lst.forEach((target) => {
                var colorFill = "";
                var header = "";
                var url = target.imageURL;
                if(target.uid.includes("start")){
                    colorFill = 'red';
                    header = "Start Node";
         //           url = this.props.imageStart;
                }
                if(target.uid.includes("station")){
                    colorFill = 'green';
                    header = "Station Node";
         //           url = this.props.imageStation;
                }
                if(target.uid.includes("end")){
                    colorFill = 'blue';
                    header = "End Node";
         //           url = this.props.imageEnd;
                }

                
                
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
                            this.findToAndFrom(target);
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
                                        type: header,
                                        name: target.name,
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
                    });
                    
                    layer.batchDraw();
                }
                else{
                    
                    this.props.incrNumImage();
                    
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
                    
                        t.props.incrNumLoadedImage();

                        node.on('dragmove', () => {
                            // mutate the state
                            target.x = node.x();
                            target.y = node.y();
                
                            // update nodes from the new state
                            t.update();
                            layer.batchDraw();
                        });
        
                        
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
                        });
                        
                        layer.batchDraw();

                    });  
                    

                }
            });

            if(this.props.loadMode){
                this.props.handleLoad()
            }
            else{
                this.props.confirmAdded();
            }
            
        }
        
        if(this.props.createArrow || (this.props.loadModeMakeArrow && this.props.numLoadedImage == this.props.numImageToLoad)){
            /** New node are added to the end of the array so just needed to look at the end*/
            var lst = []
            if(this.props.createArrow){
                lst.push(this.props.arrows[this.props.arrows.length - 1]);
            }
            else{
                this.props.arrows.forEach((elem) => {
                    lst.push(elem);
                });
                
            }
            
            lst.forEach((target) => {
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
            });

            this.update();
            if(this.props.createArrow){
                this.props.confirmAdded();
            }
            else{
                this.props.handleLoad();
            }

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
        let content;

        var endNode = this.props.endNode[0];
        var startNode = this.props.startNode[0];
        var s = this.props.stationNode[0];
        // need to get node info from props- use ui

        // determine content in popup
        if(this.state.type == "End Node" && endNode != undefined){

            content =   <div>
                        <p>Node Name: {endNode.name}</p>
                        <label className="label">Name:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter node name"
                                name="endname"
                                onChange={this.onChange} />
                        </label></div>
        }else if(this.state.type == "Start Node" && startNode != undefined){

            content =   <div>
                        <p>Node Name: {startNode.name}</p>
                        <p>Entity Name: {startNode.entity_name}</p>
                        <p>Generation Function: {startNode.gen_fun}</p>
                        <p>Limit: {startNode.limit}</p>

                        <label className="label">Name:
                            <input 
                                type="text" 
                                name="startname"
                                placeholder="Enter node name"
                                className="form-control"
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Gen Function:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter generation function"
                                name="gen_fun" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Entity Name:
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Enter entity name"
                                name="entity_name" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Limit:
                            <input 
                                type="text" 
                                placeholder="Enter enter limit"
                                className="form-control"
                                name="limit" 
                                
                                onChange={this.onChange}
                                 />
                        </label></div>
        }else if(this.state.type == "Station Node" && s != undefined){
            
            // do a for each to grab correct basic node
            
            for(var x in this.props.stationNode){
                var uid = this.props.stationNode[x].uid;
                
                if(uid== this.state.targetId){
                    s = this.props.stationNode[x];
                }
            }

            content =   <div>
                        <p>Node Name: {s.name}</p>
                        <p>Capacity: {s.capacity}</p>
                        <p>Time Function: {s.time_func}</p>

                        <label className="label">Name:
                            <input 
                                type="text" 
                                name="stationname"
                                placeholder="Enter node name"
                                className="form-control"
                                
                                onChange={this.onChange}
                            />
                        </label>
                        <label className="label">Capacity:
                            <input 
                                type="text" 
                                placeholder="Enter node capacity"
                                className="form-control"
                                name="capacity" 
                                onChange={this.onChange}
                                 />
                        </label>
                        <label className="label">Time Function:
                            <input 
                                type="text" 
                                placeholder="Enter time function"
                                className="form-control"
                                name="time_func" 
                                onChange={this.onChange}
                                 />
                        </label></div>
        }

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

                        {/*content in popup- start, beginning or end*/}
                        
                        {content}

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
