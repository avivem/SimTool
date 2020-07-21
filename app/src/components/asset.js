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
            constantValue: 0,
            distribution: "",
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

        // these are not being set
        var dist = this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        var constantVal = parseInt(this.state.constantValue)
        if(this.props.selectedNodeID.includes("start")){
            if(max >= loc || dist == "CONSTANT"){
                this.props.addContainer(this.props.selectedNodeID, action, dist, resource, loc, scale, max, constantVal);
                this.closeContainerPopup();
            }
            else{
                this.setState({showErrorMessage: true});
            }
        }
        else{
            this.props.addContainer(this.props.selectedNodeID, action, "NORMAL", resource, 0, 0, 0);
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


        let content;
        if(this.state.distribution == "CONSTANT"){
            this.state.distribution = "CONSTANT"
            content = 
                <div className="input-group">        
                    <label className="label">Value: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="constantValue" 
                        onChange={this.onChange} />
                </div>

        }
        else{
            content =
                <div className="input-group">        
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

        }

        return (
            <Popup open={this.props.openContainer} closeOnDocumentClick = {true} onClose={this.closeContainerPopup} >
                <div style={{alignContent: 'center'}}>
                    <h1>Add Entity Container Specification</h1>
                </div>

                <div className="input-group">                    
                    <label className="label">Specification Name:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="actionName" 
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
                <div className="input-group">  

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

               </div>

               {content}
                
                    
                 
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
