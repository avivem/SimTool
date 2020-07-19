import React, { Component } from 'react';
import Popup from "reactjs-popup";


class AssestPopUp extends Component{
    constructor(props){
        super(props);

        this.state = {
            actionName: "",
            resourceName: "",
            lowerAmount: 0,
            upperAmount: 0,
            maxAmount: 0,
            scale: 0,
            loc: 0,
            distribution: "NORMAL",
            showErrorMessage: false,
            
        }
        
        this.onChange = this.onChange.bind(this);
        this.changeDist = this.changeDist.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeContainerPopup = this.closeContainerPopup.bind(this);
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

     // Handle submit data of the interaction
     submitInteraction(){
        var action = this.state.actionName;
        var resource = this.state.resourceName;
 //       var lower = parseInt(this.state.lowerAmount);
 //       var upper = parseInt(this.state.upperAmount);
        var dist = this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        if(this.props.selectedNodeID.includes("start")){
            if(max > loc){
                this.props.addContainer(this.props.selectedNodeID, action, dist, resource, loc, scale, max);
                this.closeContainerPopup();
            }
            else{
                this.setState({showErrorMessage: true});
            }
        }
        else{
            this.props.addContainer(this.props.selectedNodeID, action, resource, 0, 0, 0);
            this.closeContainerPopup();
        }

        console.log(dist);
    }

    closeContainerPopup(){
        this.setState({
            showErrorMessage: false
        });
        this.props.closeContainerPopup();
    }

    render(){


        return (
            <Popup open={this.props.openContainer} closeOnDocumentClick = {true} onClose={this.closeContainerPopup} >
                <div style={{alignContent: 'center'}}>
                    <h1>Add Resource</h1>
                </div>

                <div className="input-group">                    
                    <label className="label">Action Name:</label>
                    <input 
                        type="text" 
                        placeholder="Enter action name"
                        className="form-control"
                        name="actionName" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                
                    <label className="label">Resource:</label>
                    <input 
                        type="text" 
                        placeholder="Enter the type of resource"
                        className="form-control"
                        name="resourceName" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                </div>
            
                <div className="input-group">                    

                    
            
    {/*                <label className="label">Resource range: </label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="lowerAmount" 
                        onChange={this.onChange} />
                    <span class="input-group-addon">-</span>
                    <input 
                        type="text" 
                        className="form-control"
                        name="upperAmount" 
                        onChange={this.onChange} />
        */}


                    <label className="label">Distribution:&nbsp;
                        <select 
                            className="paymentType" 
                            name="distribution"
                            onChange={this.changeDist} 
                            value={this.state.distribution}>
                            <option value="NORMAL">NORMAL</option>
                            <option value="CONSTANT">CONSTANT</option>
                            <option value="UNIFORM">UNIFORM</option>
                            <option value="RANDOM INT">RANDOM INT</option>
                        </select>
                    </label>
                
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

export default AssestPopUp;
