import React, { Component } from 'react';
import Popup from "reactjs-popup";


class BlueprintPopUp extends Component{
    constructor(props){
        super(props);

        this.state = {
            // blueprint variables
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
        this.closeBlueprintPopup = this.closeBlueprintPopup.bind(this);

        this.addBlueprint = this.addBlueprint.bind(this);
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

    // change for distribution
    changeDist(e){
        this.setState({
            distribution: e.target.value,
        });
    }

     // Handle submit blueprint data
    addBlueprint(){
        // variables to be passed to props
        var specName = this.state.specName;
        var resource = this.state.resourceName;
        var dist = this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        var init = parseInt(this.state.constantValue);
        var capacity = parseInt(this.state.capacity);
        var value = parseInt(this.state.value);

        // max cannot be less than loc
        if(max >= loc){
            this.props.addBlueprint(specName, dist, resource, loc, scale, max, init, capacity, value);
            this.closeBlueprintPopup();

            this.state.value = -1;
            this.state.capacity = 0;
        }else{
            this.setState({showErrorMessage: true});
        }
    }

    closeBlueprintPopup(){
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
        this.props.closeBlueprintPopup();
    }

    render(){
        // form when distribution is constant
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

        // form when distribution is anything but constant
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
            <Popup open={this.props.openBlue} closeOnDocumentClick = {true} onClose={this.closeBlueprintPopup} >
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
                    <button type="button" className="button btn btn-primary" onClick={this.addBlueprint}>
                        Apply
                    </button>
                </div>
            </Popup>
        );
    }

}

export default BlueprintPopUp;
