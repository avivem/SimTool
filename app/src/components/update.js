import React, { Component } from 'react';
import Popup from "reactjs-popup";
import Select from 'react-select';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import LogicComponent from './logicComponent';


class UpdatePopUp extends Component{
    constructor(props){
        super(props);

        this.state = {
            // Start Node Variables
            startname: "default name",
            dist: "NORMAL",
            loc: 0,
            scale: 0,
            entity_name: "default entity name",
            limit: 100,

            // Station Node Variables
            stationname: "default name",
            capacity: 10,
            time_func: 1,

            // End Node Variables
            endname: "default name",

            // UID for all Variables
            uid: 0,

            showMessageUP: false,
            showMessageCont: false,

            // Bluprint to Create Container From
            selectedBlueprint: "",

            // Container Variables
            containerName: "",
            containerResource: "",
            containerDist: "Normal",
            containerLoc: 0,
            containerScale: 0,
            containerCapacity: 0,
            constantValue: 0,

            // Selected Container to Delete and View
            selectedContainer: {},
            showContainer: false
        }
        
        this.onChange = this.onChange.bind(this);
        this.applyChanges = this.applyChanges.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);

        this.handleSpec = this.handleSpec.bind(this);
        this.useBlueprintMakeContainer = this.useBlueprintMakeContainer.bind(this);

        this.selectedContainer = this.selectedContainer.bind(this);
        this.viewContainer = this.viewContainer.bind(this);
        this.deleteContainer = this.deleteContainer.bind(this);
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }
    
    // Handle submit data of the interaction
    applyChanges(type,uid){
        this.props.handleChangeNode(this.state,uid,type);
     //   this.onButtonContainer();
        this.onButtonUpdate();
    }

    // // Handle submit new spec and container
    // applyContainer(type,uid){
    //     var name = this.state.containerName;
    //     var resource = this.state.containerResource;
    //     var loc = parseInt(this.state.containerLoc);
    //     var scale = parseInt(this.state.containerScale);
    //     var dist = this.state.containerDist;
    //     var capacity = parseInt(this.state.containerCapacity);
    //     var value = parseInt(this.state.constantValue);

    //     // Submit Container to backend
    //     // submit new SPEC
    //     // submit new CONTAINER
    //     this.props.submitContainer(uid, name, resource, loc, scale, dist, capacity, value);

    //     this.onButtonContainer();
    // }

    closeUpdatePopup(){
        this.setState({
            showErrorMessage: false,
            showMessageCont: false,
            showMessageUP: false,
            showContainer: false,
        });
        this.props.closeUpdatePopup();
    }

    onButtonUpdate = () => {
        if(this.state.showMessageUP == false){
            this.setState({showMessageUP: true});
        }else{
            this.setState({showMessageUP: false});
        }
    };

    onButtonContainer = () => {
        if(this.state.showMessageCont== false){
            this.setState({
                showMessageCont: true,
                showContainer: false,
                containerName: "",
                containerResource: "",
                containerDist: "Normal",
                containerLoc: 0,
                containerScale: 0,
                containerCapacity: 0,
            });
        }else{
            this.setState({showMessageCont: false});
        }   
    };

    // Should save a spec uid
    handleSpec(e){
        this.setState({ selectedBlueprint: e.value });
    }

    useBlueprintMakeContainer(){
        // what is this doing?
        // This find the blueprint that is being applied 
        // and pass it to the function
        // This can occur in the App.js but would need to pass 
        // the this.state.selectedBlueprint instead of spec
        var spec = {};
        this.props.specs.forEach((s) => {
            if(s.uid == this.state.selectedBlueprint){
                spec = s;
            }
        });
        var node = {lst: [this.props.selectedNodeID]};

        // Make Container from Blueprint
        this.props.useBlueprintMakeContainer(spec, node);
        this.onButtonContainer();
    }

    // Store the current selected container
    selectedContainer(e){
        var container;
        this.props.containers.forEach((c) => {
            if(c.uid == e.value){
                container = c
            }
        })
        this.setState({ selectedContainer: container });
    }

    // Show selected container data
    viewContainer(){
        this.setState({ showContainer: true });
        
    }

    deleteContainer(){
        this.props.deleteContainer(this.state.selectedContainer.uid);
        this.setState({ 
            showContainer: false,
            selectedContainer: {}
        });
    }

    render(){

        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }
        
        // List of blueprint that can be applied
        var specOptions = [];
        this.props.specs.forEach((spec) => {
            specOptions.push({ value: spec.uid, label: spec.name })

        });

        // Option of container of node to view/delete
        var lstContainer = [];
        this.props.containers.forEach((c) => {
            if(c.selectedNode == this.props.selectedNodeID){
                lstContainer.push({value: c.uid, label: c.name });
            }
        });

        var viewDeleteContainer = 
            <div class="container">

                <Select
                styles={customStyle}
                options={lstContainer}
                name="selectedContainer"
                onChange={this.selectedContainer}
                />
                <div class="container row" style={{padding: '10px'}}>
                    <div class="col">
                        <button type="button" class="button btn btn-secondary" onClick={this.viewContainer}>
                            View
                        </button>
                    </div>
                    <div class="col">
                        <button type="button" class="button btn btn-secondary" onClick={this.deleteContainer}>
                            Delete
                        </button>
                    </div>
                    <div class="col">
                        <button type="button" class="button btn btn-secondary" onClick={this.onButtonContainer}>
                            Add Container
                        </button>
                    </div>
                </div>

                {this.state.showContainer &&
                <div>
                    <p>Container Name: {this.state.selectedContainer.name}</p>
                    <p>Resource: {this.state.selectedContainer.resource}</p>
                    <p>Loc: {this.state.selectedContainer.loc}</p>
                    <p>Scale: {this.state.selectedContainer.scale}</p>
                    <p>Distribution: {this.state.selectedContainer.distribution}</p>
                    <p>Capacity: {this.state.selectedContainer.capacity}</p>
                </div>}
            </div>

        // Drop down to add possible blueprints
        var addBlueprint = 
            <div class="container">
                <div class="row container">
                    <div class="col">
                        <label>Apply New Blueprint: 
                            <Select
                            styles={customStyle}
                            options={specOptions}
                            name="selectedBlueprint"
                            onChange={this.handleSpec}
                            />
                        </label>
                    </div>
                    <div class="col">
                        <button type="button" class="button btn btn-secondary" onClick={this.useBlueprintMakeContainer}>
                                Apply Blueprint
                        </button>
                    </div>
                </div>
            </div>

        // Container field for when distribution is CONSTANT
        var containerConstant = 
            <div>
                <label class="label">Value: </label> 
                <input 
                    type="text" 
                    class="form-control"
                    name="constantValue" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />

                <label class="label">Capacity: </label> 
                <input 
                    type="text" 
                    class="form-control"
                    name="containerCapacity" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />
            </div>

        // Container field for when distribution is not CONSTANT
        var containerNotConstant = 
            <div>
                <label class="label">Loc: </label> 
                <input 
                    type="text" 
                    class="form-control"
                    name="containerLoc" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />

                <label class="label">Scale: </label> 
                <input 
                    type="text" 
                    class="form-control"
                    name="containerScale" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />

                <label class="label">Capacity: </label> 
                <input 
                    type="text" 
                    class="form-control"
                    name="containerCapacity" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />
            </div>

        // Content for adding container
        var applyBlueprint=
        <div> 
            {/* Add a blueprint to the node */}
            {addBlueprint} 
        </div>

        // commented out- html to create a blueprint and container
        var containerContent = 
            <div>   
                {/*<h2>Create Blueprint and Container</h2>  
                <label class="label">Name:</label>
                <input 
                    type="text" 
                    class="form-control"
                    name="containerName" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />
            
                <label class="label">Resource:</label>
                <input 
                    type="text" 
                    class="form-control"
                    name="containerResource" 
                    style={{width: '150px'}}
                    onChange={this.onChange} />
                
                <label class="label">Distribution:&nbsp;
                    <select 
                        class="paymentType" 
                        name="constainerDist"
                        onChange={this.onChange} 
                        value={this.state.constainerDist}>
                        <option value="NORMAL">NORMAL</option>
                        <option value="UNIFORM">UNIFORM</option>
                        <option value="CONSTANT">CONSTANT</option>
                        <option value="RANDOM INT">RANDOM INT</option>
                    </select>
                </label>
                <br/>
                {this.state.containerDist == "CONSTANT" ? containerConstant : containerNotConstant}
                
                <div class="container">
                    <button class="button" onClick={() => this.applyContainer("Station Node",s.uid)}>Submit Container</button>
                </div>
                */}
            </div>

        // Find if this node have a logic already created
        var logicExist = false;
        // Show the logic button if logic already existed for this node
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                logicExist = true;
            }
        });

        // find type
        var type= this.props.selectedNodeID.substr(0, this.props.selectedNodeID.indexOf('-')); 

        let logic = [];

        // variable to hold settings html for specific node
        let SettingsContent;

        var endNode;
        var startNode;
        var station;

        // Find the selected node
        switch(type){
            case "start":
                this.props.startNode.forEach((n) => {
                    if(n.uid == this.props.selectedNodeID){
                        startNode = n;
                    }
                });
                break;
                
            case "station":
                this.props.stationNode.forEach((n) => {
                    if(n.uid == this.props.selectedNodeID){
                        station = n;
                    }
                });
                break;
            case "end":
                this.props.endNode.forEach((n) => {
                    if(n.uid == this.props.selectedNodeID){
                        endNode = n;
                    }
                });
                break;
        }

        // End Node Settings
        if(type == "end" && endNode != undefined){

            SettingsContent =   <div class="container">
                        <h2>Settings for {endNode.name}</h2>
                        <Tabs defaultActiveKey="content" transition={false} id="noanim-tab">
                            <Tab eventKey="content" title="Node Content">
                                <p>Node Name: {endNode.name}</p>

                                <div class="container">
                                    <button type="button" class="button btn btn-primary" onClick={this.onButtonUpdate}>
                                        Update Node
                                    </button>
                                </div>

                                {/*when update button clicked, show html*/}
                                {this.state.showMessageUP &&  
                                    <div>
                                        <label class="label">Name:
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                placeholder={endNode.name}
                                                name="endname"
                                                onChange={this.onChange} />
                                        </label>

                                        <div class="container">
                                            <button type="button" class="button btn btn-secondary" onClick={() => this.applyChanges("End Node",endNode.uid)}>Submit Changes</button>
                                        </div>
                                    </div>
                                }
                            </Tab>
                        </Tabs>
                    </div>
        // Start Node Settings
        }else if(type == "start" && startNode != undefined){
            SettingsContent =   <div class="container">
                        <h2>Settings for {startNode.name}</h2>
                        <Tabs defaultActiveKey="content" transition={false} id="noanim-tab">
                            <Tab eventKey="content" title="Node Content">

                                <p>Node Name: {startNode.name}</p>
                                <p>Entity Name: {startNode.entity_name}</p>
                                <p>Generation Function dist: {startNode.dist}</p>
                                <p>Generation Function loc: {startNode.loc}</p>
                                <p>Generation Function scale: {startNode.scale}</p>
                                <p>Limit: {startNode.limit}</p>

                                <div class="container" style={{padding: '10px'}}>
                                    <button type="button" class="button btn btn-primary" onClick={this.onButtonUpdate}>
                                        Update Node
                                    </button>
                                </div>

                                {/*when update button clicked, show html*/}
                                {this.state.showMessageUP &&  
                                    <div>
                                        <label class="label">Name:
                                            <input 
                                                type="text" 
                                                name="startname"
                                                placeholder={startNode.name}
                                                class="form-control"
                                                onChange={this.onChange}
                                                />
                                        </label>
                                        <label class="label">Gen Function dist:
                                        <select name="dist" class="form-control" onChange={this.onChange}>
                                            <option value="NORMAL">Normal</option>
                                            <option value="CONSTANT">Constant</option>
                                        </select>
                                        </label>
                                        <label class="label">Gen Function loc:
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                placeholder={startNode.loc}
                                                name="loc" 
                                                onChange={this.onChange}
                                                />
                                        </label>
                                        <label class="label">Gen Function scale:
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                placeholder={startNode.scale}
                                                name="scale" 
                                                onChange={this.onChange}
                                                />
                                        </label>
                                        <label class="label">Entity Name:
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                placeholder={startNode.entity_name}
                                                name="entity_name" 
                                                onChange={this.onChange}
                                                />
                                        </label>
                                        <label class="label">Limit:
                                            <input 
                                                type="text" 
                                                placeholder={startNode.limit}
                                                class="form-control"
                                                name="limit" 
                                                
                                                onChange={this.onChange}
                                                />
                                        </label>

                                        <div class="container">
                                            <button type="button" class="button btn btn-secondary" onClick={() => this.applyChanges("Start Node",startNode.uid)}>Submit Changes</button>
                                        </div>
                                    </div>
                                }
                            </Tab>
                            <Tab eventKey="container" title="Container">
                                
                                <div>
                                    <label>
                                        <h3>Containers: </h3>
                                        {viewDeleteContainer}
                                    </label>
                                </div>
                                {/*when container button clicked, show html*/}
                                {this.state.showMessageCont &&  
                                    <div>
                                        {containerContent}
                                        {applyBlueprint}
                                    </div>
                                }
                            </Tab>
                            <Tab eventKey="logic" title="Logic">
                                {/*when logic button clicked, show html*/}
                                <LogicComponent
                                logicExist={logicExist}
                                selectedNodeID={this.props.selectedNodeID}
                                containers={this.props.containers}
                                arrows={this.props.arrows}
                                startNode={this.props.startNode}
                                stationNode={this.props.stationNode} 
                                endNode={this.props.endNode}
                                logics={this.props.logics}
                                specs={this.props.specs}
                                createLogic={this.props.createLogic}
                                createConditionGroup={this.props.createConditionGroup}
                                createActionGroup={this.props.createActionGroup}
                                createCondition={this.props.createCondition}
                                createAction={this.props.createAction}
                                editConditionGroup={this.props.editConditionGroup}
                                editActionGroup={this.props.editActionGroup}
                                editCondition={this.props.editCondition}
                                editAction={this.props.editAction}
                                submitEditLogic={this.props.submitEditLogic} /> 
                                {logic}
                            </Tab>
                        </Tabs> 
                    </div>

        // Station Node Settings      
        }else if(type == "station" && station != undefined){
            
            // do a for each to grab correct basic node
            for(var x in this.props.stationNode){
                var uid = this.props.stationNode[x].uid;
                
                if(uid== this.state.targetId){
                    station = this.props.stationNode[x];
                }
            }

            SettingsContent =   <div class="container">
                            <h2>Settings for {station.name}</h2>
                            <Tabs defaultActiveKey="content" transition={false} id="noanim-tab">
                                <Tab eventKey="content" title="Node Content">
                                    <table>
                                        <tr>
                                            <td><p>Node Name: {station.name}</p></td>
                                            <td><p>Capacity: {station.capacity}</p></td>
                                        </tr>
                                        <tr>
                                        
                                        </tr>
                                        <tr>
                                            <td><p>Time Function: {station.time_func}</p></td>
                                        </tr>
                                    </table>

                                    <div class="container" style={{padding: '10px'}}>
                                        <button type="button" class="button btn btn-primary" onClick={this.onButtonUpdate}>
                                            Update Node
                                        </button>
                                    </div>

                                    {/*when update button clicked, show html*/}
                                    {this.state.showMessageUP && 
                                        <div>
                                            <label class="label">Name:
                                                <input 
                                                    type="text" 
                                                    name="stationname"
                                                    placeholder={station.name}
                                                    class="form-control"
                                                    
                                                    onChange={this.onChange}
                                                />
                                            </label>
                                            <label class="label">Capacity:
                                                <input 
                                                    type="text" 
                                                    placeholder={station.capacity}
                                                    class="form-control"
                                                    name="capacity" 
                                                    onChange={this.onChange}
                                                    />
                                            </label>
                                            <label class="label">Time Function:
                                                <input 
                                                    type="text" 
                                                    placeholder={station.time_func}
                                                    class="form-control"
                                                    name="time_func" 
                                                    onChange={this.onChange}
                                                    />
                                            </label>
                                            <div class="container">
                                                <button type="button" class="button btn btn-secondary" onClick={() => this.applyChanges("Station Node",station.uid)}>Submit Changes</button>
                                            </div>
                                        </div>
                                    }
                                </Tab>
                                <Tab eventKey="container" title="Container">
                                    <div>
                                        <label>
                                            <h3>Containers: </h3>
                                            {viewDeleteContainer}
                                        </label>
                                    </div>
                                    {/*when contianer button clicked, show html*/}
                                    {this.state.showMessageCont &&  
                                        <div>
                                            {containerContent}
                                            {applyBlueprint}
                                        </div>
                                    }
                                </Tab>
                                <Tab eventKey="logic" title="Logic">
                                    {/*when logic button clicked, show html*/}
                                    <LogicComponent
                                    logicExist={logicExist}
                                    selectedNodeID={this.props.selectedNodeID}
                                    containers={this.props.containers}
                                    arrows={this.props.arrows}
                                    startNode={this.props.startNode}
                                    stationNode={this.props.stationNode} 
                                    endNode={this.props.endNode}
                                    logics={this.props.logics}
                                    specs={this.props.specs}
                                    createLogic={this.props.createLogic}
                                    createConditionGroup={this.props.createConditionGroup}
                                    createActionGroup={this.props.createActionGroup}
                                    createCondition={this.props.createCondition}
                                    createAction={this.props.createAction}
                                    editConditionGroup={this.props.editConditionGroup}
                                    editActionGroup={this.props.editActionGroup}
                                    editCondition={this.props.editCondition}
                                    editAction={this.props.editAction}
                                    submitEditLogic={this.props.submitEditLogic} /> 
                                    {logic}
                                </Tab>
                            </Tabs>
                        </div>
                    }

        return (
            <Popup open={this.props.openUpdate} closeOnDocumentClick onClose={this.closeUpdatePopup} contentStyle={{height: 400, overflow: "auto"}}>

               {SettingsContent}

            </Popup>
        );
    }

}

export default UpdatePopUp;
