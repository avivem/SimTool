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
            showErrorMessage: false,
        }
        
        this.onChange = this.onChange.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeContainerPopup = this.closeContainerPopup.bind(this);
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

     // Handle submit data of the interaction
     submitInteraction(){
        var action = this.state.actionName;
        var resource = this.state.resourceName;
        var lower = parseInt(this.state.lowerAmount);
        var upper = parseInt(this.state.upperAmount);
        var max = parseInt(this.state.maxAmount);
        if(this.props.selectedNodeID.includes("start")){
            if(lower < upper && upper <= max){
                this.props.addContainer(this.props.selectedNodeID, action, resource, lower, upper, max);
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

                <div className="input-group">
                    
                    <label className="label">Action Name:</label>
                    <input 
                        type="text" 
                        placeholder="Enter action name"
                        className="form-control"
                        name="actionName" 
                        onChange={this.onChange} />
                
                    <label className="label">Resource:</label>
                    <input 
                        type="text" 
                        placeholder="Enter the type of resource"
                        className="form-control"
                        name="resourceName" 
                        onChange={this.onChange} />
                    
                    <p></p>

                    <label className="label">Resource range: </label>
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
            
                    <label className="label">Max Resource Amount</label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="maxAmount" 
                        onChange={this.onChange} />
                    
                </div>
                <div>
                    {this.state.showErrorMessage ? <p>Enter valid range/max amount</p> : <div></div>}
                    <button className="button" onClick={this.submitInteraction}>
                        Apply
                    </button>
                </div>
            </Popup>
        );
    }

}

export default AssestPopUp;
