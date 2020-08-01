import React, { Component } from 'react';
import Konva from 'konva';


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

        var xLoc = 25;
        var yLoc = 120;
        this.props.specs.forEach((e) =>{
            var spec = layer.findOne('#' + e.uid + "-rect");
            if(spec == undefined){
                var label = new Konva.Text({
                    id: e.uid + "-text",
                    name: e.uid,
                    x: xLoc,
                    y: yLoc,
                    text:
                      "Name: " + e.name + " \n" + "Resource: " + e.resourceName,
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fill: '#555',
                    width: 150,
                    padding: 20,
                    align: 'center',
                  });

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

                var circle = new Konva.Circle({
                    id: e.uid + "-circle",
                    name: e.uid,
                    radius: 8,
                    x: xLoc + 149,
                    y: yLoc + 9,
                    fill: '#ff0000',
                });

                var cover = new Konva.Circle({
                    id: e.uid + "-cover",
                    radius: 8,
                    x: xLoc + 149,
                    y: yLoc + 9,
                    opacity: 0
                });

                layer.add(rect, label);
                layer.add(circle, x, cover);
                yLoc = yLoc + label.height() + 15;

                label.on('click', () => {
                    this.props.openSpecSelectPopup(e);
                });

                cover.on('click', () => {
                    var alphaNodes = layer.find(node => {
                        return node.name() == e.uid;
                       });
                    alphaNodes.destroy();
                    layer.batchDraw();

                    this.props.deleteSpec(e.uid);
                });

                
                
            }
            else{
                yLoc = spec.y() + spec.height() + 10;
            }
        });

        layer.batchDraw();

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

