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
            var spec = layer.findOne('#' + e.uid);
            console.log("Position" + yLoc)
            if(spec == undefined){
                console.log("TIME ")
                console.log("Add tabb")
                var label = new Konva.Text({
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
                    id: e.uid,
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

                layer.add(rect, label);
                yLoc = yLoc + label.height();

                label.on('click', () => {
                    this.props.openSpecSelectPopup(e);
                });

                
                
            }
            else{
                yLoc = spec.y() + spec.height() + 10;
            }
        });

        layer.batchDraw();
        console.log(this.props.specs)
    }
    

    render() {
       

        return (
            <div id="sidebar-container" />
       
        );
    }
}

export default SpecSideBar;

