import React, { Component } from 'react';
import Popup from "reactjs-popup";
import Select from 'react-select';

class SpecSelectPopup extends Component{
    constructor(props) {
        super(props);
        this.state = {
            selected: [],

            showEditSpec: false,
            showErrorMessage: false,

            specName: "",
            resourceName: "", 
            maxAmount: 0,
            scale: 0,
            loc: 0,
            distribution: "Normal",
          
        };

        this.onChange = this.onChange.bind(this);
        this.changeDist = this.changeDist.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addSelectedSpec = this.addSelectedSpec.bind(this);

        this.showEditSpec = this.showEditSpec.bind(this);
        this.submitEdit = this.submitEdit.bind(this);
        
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

    // Handle change for the dropdown for nodes to apply to
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
        this.props.useBlueprintMakeContainer(this.props.selectedSpec, this.state.selected);
        this.props.closeSpecSelectPopup();
    }

    showEditSpec(){
        if(this.state.showEditSpec){
            this.setState({showEditSpec: false});
        }
        else{
            // Show field to edit specs
            var spec = this.props.selectedSpec;
            this.setState({
                showErrorMessage: false,
                showEditSpec: true,
                specName: spec.name,
                resourceName: spec.resourceName,
                distribution: spec.distribution,
                maxAmount: spec.maxAmount,
                scale: spec.scale,
                loc: spec.loc,
            });

        }
    }

    submitEdit(){
        var specName = this.state.specName;
        var resource = this.state.resourceName;
        var dist = this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        if(specName != "" && resource != "" && dist != ""){
            this.props.editSpec(this.props.selectedSpec, specName, dist, resource, loc, scale, max);
            this.showEditSpec();
        }
        else{
            this.setState({showErrorMessage: true})
        }
        
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
/*
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

*/
       

        var content = 
            <div>
                <div className="container input-group">                    
                    <label className="label">Specification Name:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="specName" 
                        style={{width: '150px'}}
                        value = {this.state.specName} 
                        onChange={this.onChange} />
                
                    <label className="label">Resource:</label>
                    <input 
                        type="text" 
                        className="form-control"
                        name="resourceName" 
                        style={{width: '150px'}}
                        value = {this.state.resourceName} 
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
                            <option value="RANDOM INT">RANDOM INT</option>
                        </select>
                    </label>

               </div>
               <div className="container input-group">        
                    <label className="label">Scale: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="scale" 
                        value = {this.state.scale}
                        onChange={this.onChange} />
                    
                    <label className="label">Loc: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="loc" 
                        value = {this.state.loc}
                        onChange={this.onChange} />

                    <label className="label">Max Resource Amount: </label> 
                    <input 
                        type="text" 
                        className="form-control"
                        name="maxAmount"
                        value = {this.state.maxAmount} 
                        onChange={this.onChange} />
                </div>                   
                <div>
                    {this.state.showErrorMessage ? <p>Please enter all fields</p> : <div></div>}
                    <button className="button" onClick={this.submitEdit}>
                        Submit Edit
                    </button>
                </div>

            </div>
        

        return (
            <Popup 
            open={this.props.openSpecSelect} 
            closeOnDocumentClick = {true} 
            onClose={this.props.closeSpecSelectPopup}
            contentStyle={{height: 400, overflow: "auto"}}>
                <div>
                    <div>
                        <h1>{spec.name}</h1>
                        <p>Resource: {spec.resourceName}</p>
                        <p>Distribution: {spec.distribution}</p>
                        <p>Scale: {spec.scale} </p>
                        <p>Loc: {spec.loc} </p>
                        <p>Max Amount: {spec.maxAmount}</p>
                    </div>
                    <div>
                        <button className="button" onClick={this.showEditSpec}>
                            Edit
                        </button>
                        {this.state.showEditSpec ? content : <div></div>}
                    </div>   
                    <div>
                        <h5>Apply to:</h5>
                        <Select 
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