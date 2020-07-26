import React, { Component } from 'react';
import Popup from "reactjs-popup";
import Select from 'react-select';

class SpecSelectPopup extends Component{
    constructor(props) {
        super(props);
        this.state = {
            selected: []
          
        };
        
        this.handleChange = this.handleChange.bind(this);
        this.addSelectedSpec = this.addSelectedSpec.bind(this);
        
    }

    handleChange(e){
        var lst = [];
        if( e != null){
            e.forEach((n) => {
                lst.push(n.value);
            });
        }


        this.setState({
            selected: lst
        })
        
    }

    addSelectedSpec(){
        this.props.addSpecSelected(this.props.selectedSpec, this.state.selected);
        this.props.closeSpecSelectPopup();
    }

    render(){
        // Collect the possible option for this container, which is now also called a blueprint
        var options = [];
        this.props.startNode.forEach((node) => {
            options.push({ value: node.uid, label: node.name })

        });

        this.props.stationNode.forEach((node)=> {
            options.push({ value: node.uid, label: node.name })
        })

        var spec = this.props.selectedSpec;

        var defaultSelect = [];
        var defaultSelectedName = "";
        
        // Find node already applied to and make a list to show
        this.props.selectedSpecTo.forEach((uid) => {
            var name = "";
            this.props.startNode.forEach((n) => {
                if(n.uid == uid){
                    name = n.name
                }
            });
            if(name == ""){
                this.props.stationNode.forEach((n) => {
                    if(n.uid == uid){
                        name = n.name
                    }
                }); 
            }
            defaultSelectedName = defaultSelectedName == "" ? name : defaultSelectedName + ", " + name;
            defaultSelect.push({ value: uid, label: name })
        });
        

        return (
            <Popup open={this.props.openSpecSelect} closeOnDocumentClick = {true} onClose={this.props.closeSpecSelectPopup}>
                <div>
                    <div>
                        <h1>{spec.name}</h1>
                        <p>Applied to: {defaultSelectedName}</p>
                        <p>Resource: {spec.resourceName}</p>
                        <p>Distribution: {spec.distribution}</p>
                        {spec.distribution == "CONSTANT" ? 
                            <p>Value: {spec.init}</p> 
                            :
                            <div>
                                <p>Mean: {spec.loc} </p>
                                <p>Standard Deviation: {spec.scale} </p>
                                <p>Max Amount: {spec.maxAmount}</p>
                            </div>
                        }    
                    </div>
                    <div>
                        <h5>Apply to:</h5>
                        <Select 
                        defaultValue={defaultSelect}
                        isMulti
                        className="multi-select"
                        classNamePrefix="select"
                        options={options}
                        onChange={this.handleChange}
                        maxMenuHeight = {150}
                        />    
                    </div>
                    <div>
                        <button className="button" onClick={this.addSelectedSpec}>
                            Apply
                        </button>
                    </div>    
                </div>

            </Popup>

        );
    }

}

export default SpecSelectPopup;