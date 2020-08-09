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

/* Canvas is called in App.js */
/* This component is the area where the nodes are added to build the simulation.
    It is also connected with what happen when a node is clicked. Ex. update/remove/arrow creation */
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
        
        this.onChange = this.onChange.bind(this);

        this.findToAndFrom = this.findToAndFrom.bind(this);
        this.update = this.update.bind(this);
        this.getConnectorPoints = this.getConnectorPoints.bind(this);

        this.onChange = this.onChange.bind(this);
    }

    // Add listener for change in window width
    componentWillMount() {
        mql.addListener(this.mediaQueryChanged);
    }

    // Remove listener for change in window width 
    componentWillUnmount() {
        mql.removeListener(this.mediaQueryChanged);
    }

    // Show the side bar
    onSetSidebarOpen(open) {
        this.setState({ sidebarOpen: open });
    }

    // Close the side bar
    mediaQueryChanged() {
        this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
    }

    // Change state variables
    onChange(e){
      this.setState({ [e.target.name]: e.target.value })
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
        // the currDir is used to determine whether the clicked node when 
        // creating arrow is the from or to node.
        // currDir == "from" mean the clicked node is from node then the 
        // next clicked node would be to node.
        if(this.state.currDir == "from"){
            // Clicked node is set as the from node
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
                // The second clicked node when adding arrow is not 
                // the same node as the first clicked node.
                // So add arrow if the to and from node are different node
                this.setState({
                    currDir: "from"
                });
                
                // Call function in App.js to add arrow
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

    // Calculation for the arrow direction and length
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

        // Check all arrows to find changes when a node is move
        this.props.arrows.forEach((connect) =>{
            // Get the nodes and arrow from the layer
            var line = layer.findOne('#' + connect.uid);
            var fromNode = layer.findOne('#' + connect.from);
            var toNode = layer.findOne('#' + connect.to);

            
            // Calculate the arrow direction and length using the getConnectorPoints function
            const points = this.getConnectorPoints(
                fromNode.position(),
                toNode.position()
              );
            line.points(points);

        });
        // Draw the arrow
        layer.batchDraw();
    }

    /* Function that add/remove arrows and nodes from the stage.
        Also there are events added to the nodes when clicke.*/
    componentDidUpdate(prevProps, prevState){

        var layer = this.state.canvasLayer;

        // Adding/Loading node
        if(this.props.addedStart || this.props.addedStation || this.props.addedEnd || this.props.loadMode){
            /** New node are added to the end of the array so just needed to look at the end*/
            var lst = [];
            if(this.props.addedStart){
                // new start node
                lst.push(this.props.startNode[this.props.startNode.length - 1]);
            }
            else if(this.props.addedStation){
                // new station node
                lst.push(this.props.stationNode[this.props.stationNode.length - 1]);
            }
            else if(this.props.addedEnd){
                // new end node
                lst.push(this.props.endNode[this.props.endNode.length - 1]);
            }
            else{
                // Add multiple nodes because loading from a file

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
                var url = target.imageURL;     // URL of the image uploaded that is to be use for node icon
                var imageObj = new Image();    // The icon image for the added node
                var offset;                    // Offset for the icon image for that node

                if(target.uid.includes("start")){
                    header = "Start Node";
                    imageObj.src = StartImage;
                    offset = { x: 29, y: 27 };
                }
                if(target.uid.includes("station")){
                    header = "Station Node";
                    imageObj.src = StationImage;
                    offset = { x: 30, y: 28 };
                }
                if(target.uid.includes("end")){
                    header = "End Node";
                    imageObj.src = EndImage;
                    offset = { x: 28, y: 28 };
                } 
                
                if(url == null){
                    // The node image is the default image

                    var radius = 30
                    // Create Node
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
                        fillPatternOffset: offset,
                    });

                    // Name of the node 
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

                    // Send node to api
                    // Call function in App.js
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
            
                        // update the arrows since node where moved
                        this.update();

                        // Draw everything
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
                            // This node is going to be remove so need to first remove all arrows 
                            // the go to and from the node that is going to be remove
                            this.props.arrows.forEach(arrow => {
                                if(arrow.from == target.uid || arrow.to == target.uid){
                                    var arrow_uid = arrow.uid;
                                    var n = layer.findOne('#' + arrow_uid);
                                    n.destroy();
                                    this.props.handleRemove(arrow_uid);
                                }
                            });

                            // Call func in App.js to remove this node from the state that store nodes
                            this.props.handleRemove(target.uid);
                            //remove node and it's label
                            label.destroy();
                            node.destroy();

                            layer.batchDraw();
                        }
                        else{
                            // Open specific popup for the node to change/add details.
                            // This include the node data, containers, and logic components.
                            // Call a function in App.js
                            this.props.openUpdatePopup(target.uid);
                            console.log(target.uid);
                        }
                        
                    });
                    
                    layer.batchDraw();
                }
                else{
                    // Add node with icon that are uploaded from user.

                    // Used to track the number of node that have image from user upload
                    // Increase count by 1
                    // Needed because Image are not created right away, there is a delay,
                    // so need to make sure number of Image added equal the number of image loaded
                    // to avoid error when loading. This error is when loading, node with image from user
                    // is delay when added but the code still more forward to add arrow but the node with 
                    // image may not have been added yet
                    this.props.incrNumImage();

                    Konva.Image.fromURL(url, function (node) {
                        var w = 50;       // node width
                        var h = 50;       // node height
                        // Set image attribute
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

                        // node's name
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
                        
                        // Fetch to api to add node
                        // Call function in App.js
                        t.props.handleBackendLoadNodes(target);

                        // Track the number of image loaded
                        // Increment by 1
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
                                // remove arrows to and from this node
                                t.props.arrows.forEach(arrow => {
                                    if(arrow.from == target.uid || arrow.to == target.uid){
                                        var arrow_uid = arrow.uid;
                                        var n = layer.findOne('#' + arrow_uid);
                                        n.destroy();
                                        t.props.handleRemove(arrow_uid);
                                    }
                                });
    
                                // remove from node from state in App.js
                                t.props.handleRemove(target.uid);
                                //remove node and name
                                node.destroy();
                                label.destroy();
    
                                layer.draw();
                            }
                            else{
                                /*Open popup for the node to change the node data, 
                                  container, logic components */
                                t.props.openUpdatePopup(target.uid);
                                console.log(target.uid);
                            }        
                        });
                        layer.batchDraw();
                    });  
                    

                }
            });

            if(this.props.loadMode){
                // When loading, called to more to next stage of load, which is to load arrows
                this.props.handleLoad()
            }
            else{
                // When adding 1 node, called to confirm node is added
                this.props.confirmAdded();
            }
            
        }
        
        // Create arrows when regular adding arrow and for when loading arrows
        if(this.props.createArrow || (this.props.loadModeMakeArrow && this.props.numLoadedImage == this.props.numImageToLoad)){
            /** New node are added to the end of the array so just needed to look at the end*/
            var lst = []
            if(this.props.createArrow){
                // 1 Arrow are added
                lst.push(this.props.arrows[this.props.arrows.length - 1]);
            }
            else{
                // Arrows are loaded
                this.props.arrows.forEach((elem) => {
                    lst.push(elem);
                });

                
            }
            // lst - list of arrows that can have 1 element when regular adding arrow
            //          or can have multiple elements when loading arrows
            lst.forEach((target) => {
                var line = new Konva.Arrow({
                    id: target.uid,
                    stroke: 'black',
                    fill: 'black',
                });
                layer.add(line);

                const requestOptionsStart = {
                    method: 'PUT',
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
                  fetch(`http://127.0.0.1:5000/api/node/dirto/`, requestOptionsStart).then(gotUser => {
                      console.log(gotUser);
  
                  }).catch(console.log)
    
                line.on('click', () => {
                    if(this.props.removeMode){
                        //remove arrow when in remove mode and arrow is clicked 
                        this.props.handleRemove(target.uid); 
                        line.destroy();
                        layer.draw();
                    }
                });    
            });

            // Update the arrows 
            this.update();

            if(this.props.createArrow){
                // Confirm arrow is added
                this.props.confirmAdded();
            }
            else{
                // Confirm load is finished
                this.props.handleLoad();
            }

        }
        
        // Clear the stage
        if(this.props.clearMode){
            layer.find('Arrow').destroy();
            layer.find('Circle').destroy();
            layer.find('Image').destroy();
            layer.find('Text').destroy();
            layer.draw();

            // Call func in App.js to clear the api
            this.props.handleClearMode();
        }
    }

    render(){
        // Sidebar where the blueprint are show
        var sidebar = <SpecSideBar
                        specs={this.props.specs}
                        openSpecSelectPopup={this.props.openSpecSelectPopup}
                        deleteSpec={this.props.deleteSpec} />

        // Where the canvas will be
        var content = <div className="content">
                        <div id="canvas-container"></div>
                    </div>

        // Style of sidebar
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
            sidebar={sidebar}                           // Sidebar
            children={content}                          // Canvas
            />
    );}
}

export default Canvas;
