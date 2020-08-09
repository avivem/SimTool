import React, { Component } from 'react';
import Popup from "reactjs-popup";

// Called in the App.js
// This create a popup that allow the user to create a blueprint(spec)
class BlueprintPopUp extends Component{
    constructor(props){
        super(props);

        this.state = {
            specName: "",
            resourceName: "",
            lowerAmount: 0,
            upperAmount: 0,
            maxAmount: 0,
            scale: 0,
            loc: 0,
            distribution: "NORMAL",
            showErrorMessage: false,
            value: -1,
            capacity: 0,
            constantValue: 0,
            
        }
        
        this.onChange = this.onChange.bind(this);
        this.changeDist = this.changeDist.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeSpecPopup = this.closeSpecPopup.bind(this);
    }

    // Change state
    onChange(e){
        this.setState({ [e.target.name]: e.target.value })
    }

    // change for distribution
    // e is {value: ..., label: ...}
    changeDist(e){
        this.setState({
            distribution: e.target.value,
        });
    }

     // Handle submit data of the blueprint(spec)
     // Create new blueprint by calling a func in App.js
    submitInteraction(){
        var specName = this.state.specName;
        var resource = this.state.resourceName;
 //       var lower = parseInt(this.state.lowerAmount);
 //       var upper = parseInt(this.state.upperAmount);

        // these are not being set
        var dist =  this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        var capacity = parseInt(this.state.capacity);
        var init = parseInt(this.state.value);
        if(max >= loc){
            // Create blueprint if max value is greater than the mean
            this.props.addBlueprint(specName, dist, resource, loc, scale, max, init, capacity);
            this.closeSpecPopup();
            this.state.value = -1;
            this.state.capacity = 0;
        }
        else{
            // Show error message
            this.setState({showErrorMessage: true});
        }
    }

    // Close the popup and reset all state that hold the fields' value
    closeSpecPopup(){
        this.setState({
            specName: "",
            resourceName: "",
            lowerAmount: 0,
            upperAmount: 0,
            maxAmount: 0,
            scale: 0,
            loc: 0,
            distribution: "NORMAL",
            showErrorMessage: false,
        });
        this.props.closeSpecPopup();
    }

    render(){
        // Content of popup when the distribution is Constant
        let contentConstant =
            <div className="container input-group">        
                <label className="label">Optional Value: </label> 
                <input 
                    type="text" 
                    className="form-control"
                    name="value" 
                    onChange={this.onChange} />

                <label className="label">Optional Capacity: </label> 
                <input 
                    type="text" 
                    className="form-control"
                    name="capacity" 
                    value={this.state.capacity}
                    onChange={this.onChange} />
            </div>

        // Content of popup when the distribution is not Constant
        let content =
                <div className="container input-group">        
                    <label className="label">Scale: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="scale" 
                        onChange={this.onChange} />
                    
                    <label className="label">Loc: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="loc" 
                        onChange={this.onChange} />

                    <label className="label">Max Resource Amount: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="maxAmount" 
                        onChange={this.onChange} />
                </div>           

        return (
            <Popup open={this.props.openBlue} closeOnDocumentClick = {true} onClose={this.closeSpecPopup} >
                <div style={{alignContent: 'center'}}>
                    <h1>Add Blueprint</h1>
                </div>

                <div className="container input-group">                    
                    <label className="label">Specification Name:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="specName" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                
                    <label className="label">Resource:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="resourceName" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                </div>

                <div className="container input-group">  

                    <label className="label">Distribution:&nbsp;
                        <select 
                            className="paymentType" 
                            name="distribution"
                            onChange={this.changeDist} 
                            value={this.state.distribution}>
                            <option value="NORMAL">NORMAL</option>
                            <option value="UNIFORM">UNIFORM</option>
                            <option value="CONSTANT">CONSTANT</option>
                            <option value="RANDOM INT">RANDOM INT</option>
                        </select>
                    </label>

               </div>

               {this.state.distribution == "CONSTANT" ? contentConstant : content}
                
                <div>
                    {this.state.showErrorMessage ? <p>Max can't be smaller than the mean</p> : <div></div>}
                    <button className="button" onClick={this.submitInteraction}>
                        Apply
                    </button>
                </div>
            </Popup>
        );
    }

}

export default BlueprintPopUp;
