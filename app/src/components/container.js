import React, { Component } from 'react';
import Popup from "reactjs-popup";

class ContainerPopup extends Component{
    constructor(props){
        super(props);
        this.state = {
            containerName: "",
            containerResource: "",
            initial: 0,
            capacity: 0,
            showErrorMessage: false
        }

        this.onChange = this.onChange.bind(this);
        this.submitContainer = this.submitContainer.bind(this);
        this.closeContainerPopup = this.closeContainerPopup.bind(this);


    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

    submitContainer(){
        this.props.submitContainer(this.props.selectedNodeID,
            this.state.containerName, this.state.containerResource,
            this.state.initial, this.state.capacity);

        this.props.closeContainerPopup();
    }

    closeContainerPopup(){
        this.props.closeContainerPopup();
    }

    render(){
        return (
            <Popup open={this.props.openContainer} closeOnDocumentClick = {true} onClose={this.closeContainerPopup} >
                <div style={{alignContent: 'center'}}>
                    <h1>Add Container</h1>
                </div>

                <div className="input-group">                    
                    <label className="label">Name:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="containerName" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                
                    <label className="label">Resource:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="containerResource" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                </div>
                <div className="input-group">
                    <label className="label">initial Value:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="initial" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                    <label className="label">Capacity:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="capacity" 
                        style={{width: '150px'}}
                        onChange={this.onChange} />
                </div>
                <div>
                    {this.state.showErrorMessage ? <p>Please enter a number for Initial Value/Capacity</p> : <div></div>}
                    <button className="button" onClick={this.submitContainer}>
                        Apply
                    </button>
                </div>
            </Popup>
        );
    }
}
export default ContainerPopup;
