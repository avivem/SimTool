import React, { Component } from 'react';

import StartImage from "../image/start.png";
import StationImage from "../image/station.png";
import EndImage from "../image/end.png";

// import Test from "./start.png"

import Konva from 'konva';
import Sidebar from "react-sidebar";


import './css/popup.css';
import './css/sidebar.css';
import SpecSideBar from './SpecSideBar';


const mql = window.matchMedia(`(min-width: 800px)`);


class Canvas extends Component{
    constructor(props){
        super(props);

        this.state = {
            sidebarDocked: mql.matches,
            sidebarOpen: true,

            stage: "",
            canvasLayer: "",
            targetId: "",
            type: "",
            name: "",
            rate: 0,
            unit: "Second",
            from: "",
            currDir: "from",

            startname: "default name",
            dist: "NORMAL",
            loc: 0,
            scale: 0,
            entity_name: "default entity name",
            limit: 100,

            stationname: "default name",
            capacity: 10,
            time_func: 1,

            endname: "default name",
        }

        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);

        this.closePopup = this.closePopup.bind(this);

        this.handleChangeUnit = this.handleChangeUnit.bind(this)
        this.handleChangeRate = this.handleChangeRate.bind(this)
        
        this.onChange = this.onChange.bind(this);

        this.findToAndFrom = this.findToAndFrom.bind(this);
        this.update = this.update.bind(this);
        this.getConnectorPoints = this.getConnectorPoints.bind(this);

        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        mql.addListener(this.mediaQueryChanged);
    }

    componentWillUnmount() {
        mql.removeListener(this.mediaQueryChanged);
    }

    onSetSidebarOpen(open) {
        this.setState({ sidebarOpen: open });
    }

    mediaQueryChanged() {
        this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
    }

    // Change state variables
    onChange(e){
      this.setState({ [e.target.name]: e.target.value })
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

    componentDidMount(){
        /** create the stage and layer when page is first loaded */

        var width = window.innerWidth;
        var height = window.innerHeight;

        var stage = new Konva.Stage({
            container: 'canvas-container',
            width: width,
            height: height,
            draggable: true
        });
        var canvasLayer = new Konva.Layer();
        
        stage.add(canvasLayer);
        

        this.setState({
            stage: stage,
            canvasLayer: canvasLayer,
            
        });
    }

    // Determine the To and From node, once determine pass it to a 
    // function in App.js to add the arrow to the list
    findToAndFrom(target){
        var layer = this.state.canvasLayer;
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

                this.props.addArrowState(this.state.from, target.uid);
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
        var layer = this.state.canvasLayer;

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

        var layer = this.state.canvasLayer;

        // Adding/Loading node
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

                // Clear the back end
                fetch('http://127.0.0.1:5000/api/clean/').then(res => res.json()).then(gotUser => {
                    console.log(gotUser);

                }).catch(function() {
                    console.log("Error on clean");
                }); 

                // Clear the canvas
                layer.find('Arrow').destroy();
                layer.find('Circle').destroy();
                layer.find('Image').destroy();
                layer.find('Text').destroy();

                layer.draw();

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

            }

            var t = this;
            // Go through all of the element in the lst and make the node on the canvas.
            // lst - have many element when loading and 1 element when regular adding node.
            lst.forEach((target) => {
                var header = "";
                var url = target.imageURL;
                var imageObj = new Image();
                if(target.uid.includes("start")){
                    header = "Start Node";
                    imageObj.src = StartImage;
                }
                if(target.uid.includes("station")){
                    header = "Station Node";
                    imageObj.src = StationImage;
                }
                if(target.uid.includes("end")){
                    header = "End Node";
                    imageObj.src = EndImage;
                } 
                
                if(url == null){
                    var radius = 30
                    var node = new Konva.Circle({
                        id: target.uid,
                        radius: radius,
                        shadowBlur: 10,
                        stroke:"black",
                        strokeWidth: 5,
                        draggable: true,
                        x: target.x,
                        y: target.y,
                        fillPatternImage: imageObj,
                        fillPatternOffset: { x: 35, y: 32 },
                    });

                    var label = new Konva.Text({
                        id: "name-" + target.uid,
                        text: target.name,
                        fontFamily: 'Calibri',
                        fontSize: 18,
                        padding: 5,
                        fill: 'black',
                        x: target.x,
                        y: target.y + radius
                      });
    
                    
                    layer.add(node);
                    layer.add(label);

                    // Send to api
                    this.props.handleBackendLoadNodes(target);

                    node.on('dragmove', () => {
                        // Store the shift
                        var xChange = node.x() - target.x;
                        var yChange = node.y() - target.y;
                        
                        // mutate the state
                        target.x = node.x();
                        target.y = node.y();

                        // Move the label
                        label.move({
                            x: xChange,
                            y: yChange
                        });
            
                        // update nodes from the new state
                        this.update();
                        layer.batchDraw();
                    });

                    /** Node is click so open popup*/
                    node.on('click', () =>{

                        if(this.props.createArrowMode){
                            // Help determine the to and from node. Once determine the arrow is 
                            //added to the list of arrows in App.js
                            this.findToAndFrom(target);
                        }
                        else if(this.props.removeMode){
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
                            label.destroy();
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
                                this.props.openUpdatePopup(target.uid);
                            }else if(target.type == 'BASIC'){
                                this.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: target.name
                                })
                                this.props.openUpdatePopup(target.uid);
                            }else{
                                this.setState({
                                    unit: target.unit,
                                    rate: target.rate,
                                    targetId: target.uid,
                                    type: target.name
                                })
                                this.props.openUpdatePopup(target.uid);
                            }

                        }
                        
                    });
                    
                    layer.batchDraw();
                }
                else{
                    
                    this.props.incrNumImage();

                    Konva.Image.fromURL(url, function (node) {
                        var w = 50;
                        var h = 50;
                        
                        node.setAttrs({
                            id: target.uid,
                            x: target.x,
                            y: target.y,
                            shadowBlur: 10,
                            stroke:"black",
                            strokeWidth: 5,
                            draggable: true,
                            width: w,
                            height: h,    
                        });

                        var label = new Konva.Text({
                            text: target.name,
                            fontFamily: 'Calibri',
                            fontSize: 18,
                            padding: 5,
                            fill: 'black',
                            x: target.x,
                            y: target.y + h,
                            
                          });
                        
                        layer.add(node);
                        layer.add(label)
                        
                    

                        // Fetch to api
                        t.props.handleBackendLoadNodes(target);

                        // Track the number of image loaded
                        t.props.incrNumLoadedImage();

                        node.on('dragmove', () => {
                            // Store the shift
                            var xChange = node.x() - target.x;
                            var yChange = node.y() - target.y;
                            
                            // mutate the state
                            target.x = node.x();
                            target.y = node.y();

                            // Move the label
                            label.move({
                                x: xChange,
                                y: yChange
                            });
                
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
                            else if(t.props.removeMode){
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
                                label.destroy();
    
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
                                this.props.openUpdatePopup(target.uid);
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
        
        // Create arrow and load arrow
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

                const requestOptionsStart = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
     
                      // from and to nodes
                      from: target.from,
                      to: target.to
                    })
                  };
                  
                  console.log(requestOptionsStart);
                  // fetch to api to create connection
                  // should prob move this to App.js
                  fetch(`http://127.0.0.1:5000/api/dirto/`, requestOptionsStart).then(gotUser => {
                      console.log(gotUser);
  
                  }).catch(console.log)
    
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
            layer.find('Text').destroy();
            layer.draw();
            this.props.handleClearMode(false);
        }


    }

    render(){
        var sidebar = <SpecSideBar
                        clearMode={this.props.clearMode}
                        handleClearMode={this.props.handleClearMode}
                        specs={this.props.specs}
                        openSpecSelectPopup={this.props.openSpecSelectPopup}
                        deleteSpec={this.props.deleteSpec} />

        var content = <div className="content">
                        <p>.</p>
                        <p>.</p>
                        <p>.</p>
                        <div id="canvas-container"></div>
                    </div>


        const sidebarStyles = {
            sidebar: {
                backgroundColor: '#707070',
                width: '200px'
            }
        }

        return(
            <Sidebar
            styles={sidebarStyles}
            open={this.state.sidebarOpen}
            docked={this.state.sidebarDocked}
            onSetOpen={this.onSetSidebarOpen}
            sidebar={sidebar}
            children={content}
            />
                
             
    );}
}

export default Canvas;
