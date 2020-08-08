import React, { Component } from 'react';
import Konva from 'konva';

// Called in the canvas.js
// Create the canvas that display the blueprint make
class SpecSideBar extends Component{
    constructor(props) {
        super(props);
        this.state = {
            stage: "",
            layer: ""
          
        };
        
    }
    
    componentDidMount(){
        /** create the stage and layer when page is first loaded */

        var width = 200;
        var height = window.innerHeight;

        var stage = new Konva.Stage({
            width: width,
            height: height,
            container: "sidebar-container",
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                  x: this.absolutePosition().x,
                  y: pos.y,
                };
            },
        });
        var layer = new Konva.Layer();
        
        stage.add(layer);
        

        this.setState({
            stage: stage,
            layer: layer,
            
        });
    }

    componentDidUpdate(prevProps, prevState){
        var layer = this.state.layer;

        var xLoc = 25;          // The x position of the blueprint image is alway the same
        var yLoc = 120;         // The y position of the blueprint image need to be calculated 
                                // base on previous value
        /* Look at all blueprint(spec) and check if they are added to the canvas.
            If not on canvas, add the blueprint to canvas.
            If on canvas then move to the next one */
        this.props.specs.forEach((e) =>{
            // Find blueprint on canvas
            var spec = layer.findOne('#' + e.uid + "-rect");
            if(spec == undefined){
                // blueprint not found so add it to canvas
                
                // Text display for blueprint
                var label = new Konva.Text({
                    id: e.uid + "-text",
                    name: e.uid,
                    x: xLoc,
                    y: yLoc,
                    text:
                      "Name: " + e.name + " \n" + "Resource: " + e.resource,
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fill: '#555',
                    width: 150,
                    padding: 20,
                    align: 'center',
                  });

                // Rect for blueprint
                var rect = new Konva.Rect({
                    id: e.uid + "-rect",
                    name: e.uid,
                    x: xLoc,
                    y: yLoc,
                    stroke: '#555',
                    strokeWidth: 5,
                    fill: '#ddd',
                    width: 150,
                    height: label.height(),
                    shadowColor: 'black',
                    shadowBlur: 10,
                    shadowOffsetX: 10,
                    shadowOffsetY: 10,
                    shadowOpacity: 0.2,
                    cornerRadius: 10,
                });

                // Used to let the user be able to delete blueprint
                var x = new Konva.Text({
                    id: e.uid + "-x",
                    name: e.uid,
                    x: xLoc + 145,
                    y: yLoc,
                    text: "X",
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fill: '#ffffff',
                    align: 'center',
                  });

                // Used to let the user be able to delete blueprint
                var circle = new Konva.Circle({
                    id: e.uid + "-circle",
                    name: e.uid,
                    radius: 8,
                    x: xLoc + 149,
                    y: yLoc + 9,
                    fill: '#ff0000',
                });

                // Used to let the user be able to delete blueprint.
                // Used to cover the x and circle, and it is invisible.
                // Needed because if need to click exactly on the x to remove 
                // or exactly on the circle to remove.
                // But with a cover, you can click on either the circle or x to remove blueprint.
                var cover = new Konva.Circle({
                    id: e.uid + "-cover",
                    name: e.uid,
                    radius: 8,
                    x: xLoc + 149,
                    y: yLoc + 9,
                    opacity: 0
                });

                layer.add(rect, label);
                layer.add(circle, x, cover);

                // Calculate the next blueprint's y position 
                yLoc = yLoc + label.height() + 15;

                label.on('click', () => {
                    // On click label, show popup of blueprint
                    this.props.openSpecSelectPopup(e);
                });

                cover.on('click', () => {
                    // Delete the blueprint whose x mark is clicked.
                    // All of the above Konva object have the same name, 
                    //  which is the uid of the spec(blueprint)
                    var alphaNodes = layer.find(node => {
                        return node.name() == e.uid;
                       });
                    alphaNodes.destroy();
                    layer.batchDraw();

                    // Call function from App.js to remove this blueprint 
                    this.props.deleteSpec(e.uid);
                });
            }
            else{
                // Spec(blueprint) already existed so calculate
                // the next blueprint's y position
                yLoc = spec.y() + spec.height() + 15;
            }
        });

        layer.batchDraw();

        // Clear the canvas when clear button is clicked
        if(this.props.clearMode){
            layer.find('Rect').destroy();
            layer.find('Circle').destroy();
            layer.find('Text').destroy();
            layer.batchDraw();
            this.props.handleClearMode(false);
        }
        
    }
    

    render() {
       

        return (
            <div id="sidebar-container" />
       
        );
    }
}

export default SpecSideBar;

