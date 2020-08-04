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
            distribution: "NORMAL",
            constantValue: 0,
            capacity: 0,
          
        };

        this.onChange = this.onChange.bind(this);
        this.changeDist = this.changeDist.bind(this);

        // Handle change for the dropdown for nodes to apply to
        this.handleChange = this.handleChange.bind(this);

        // add blurprint to backend
        this.addSelectedSpec = this.addSelectedSpec.bind(this);

        // show blueprint to edit
        this.showEditSpec = this.showEditSpec.bind(this);
        // submit new edit
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

    // add blueprint
    addSelectedSpec(){
        var nodes = {lst: this.state.selected};
        this.props.useBlueprintMakeContainer(this.props.selectedSpec, nodes);
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
                resourceName: spec.resource,
                distribution: spec.distribution,
                maxAmount: spec.maxAmount,
                scale: spec.scale,
                loc: spec.loc,
                constantValue: spec.init
            });
        }
    }

    // Edit the blueprint
    submitEdit(){
        var specName = this.state.specName;
        var resource = this.state.resourceName;
        var dist = this.state.distribution;
        var loc = parseInt(this.state.loc);
        var scale = parseInt(this.state.scale);
        var max = parseInt(this.state.maxAmount);
        var constantValu = parseInt(this.state.constantValue);
        if(specName != "" && resource != "" && dist != ""){
            this.props.editSpec(this.props.selectedSpec, specName, dist, resource, loc, scale, max, constantValu);
            this.showEditSpec();
        }
        else{
            this.setState({showErrorMessage: true})
        }
    }

    render(){
        // Collect the possible option for this container, which is now also called a blueprint
        var options = [];

        // for reach start node, add value and label to options
        this.props.startNode.forEach((node) => {
            options.push({ value: node.uid, label: node.name })

        });

        // for reach station node, add value and label to options
        this.props.stationNode.forEach((node)=> {
            options.push({ value: node.uid, label: node.name })
        })

        // for reach start node, add value and label to options
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

        // content for a constant dist      
        let contentConstant =
            <div className="container input-group">        
                <label className="label">Value: </label> 
                <input 
                    type="text" 
                    className="form-control"
                    name="constantValue" 
                    value={this.state.constantValue}
                    onChange={this.onChange} />

                <label className="label">Optional Capacity: </label> 
                <input 
                    type="text" 
                    className="form-control"
                    name="capacity" 
                    value={this.state.capacity}
                    onChange={this.onChange} />
            </div>

        // content for a non-constant dist   
        let contentNotConstant = 
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

        // content for a updating blueprint
        var blueprintEdit = 
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
                            <option value="CONSTANT">CONSTANT</option>
                            <option value="RANDOM INT">RANDOM INT</option>
                        </select>
                    </label>
               </div>

               {this.state.distribution == "CONSTANT" ? contentConstant : contentNotConstant}

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
                    <div class="containr">
                        {/*blueprint informtaion*/}
                        <h1>{spec.name}</h1>
                        <p>Resource: {spec.resource}</p>
                        <p>Distribution: {spec.distribution}</p>
                        
                        {/*if dist constant, show corresponding htlm form*/}
                        {spec.distribution == "CONSTANT" ? 
                        <div>
                            <p>Value: {spec.init}</p>
                        </div>
                        :
                        <div>
                            <p>Scale: {spec.scale} </p>
                            <p>Loc: {spec.loc} </p>
                            <p>Max Amount: {spec.maxAmount}</p>
                        </div>}
                    </div>

                    <div>
                        <button className="button" onClick={this.showEditSpec}>
                            Edit
                        </button>

                        {/*if edit selected, show html to change blueprint*/}
                        {this.state.showEditSpec ? blueprintEdit : <div></div>}
                    </div>  

                    {/*apply blueprint to node*/}
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