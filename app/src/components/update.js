import React, { Component } from 'react';
import Popup from "reactjs-popup";
import Select from 'react-select';
import LogicComponent from './logicComponent';


class UpdatePopUp extends Component{
    constructor(props){
        super(props);

        this.state = {
            startname: "default name",
            dist: "NORMAL",
            loc: 0,
            scale: 0,
            entity_name: "default entity name",
            limit: 100,

            stationname: "default name",
            capacity: 10,
            time_func: 1,

            endname: "default name",

            showMessageUP: false,
            showMessageCont: false,

            selectedBlueprint: "",

            uid: 0,

            containerName: "",
            containerResource: "",
            containerDist: "Normal",
            containerLoc: 0,
            containerScale: 0,
            containerCapacity: 0,
        }
        
        this.onChange = this.onChange.bind(this);
        this.changeDist = this.changeDist.bind(this);
        this.applyChanges = this.applyChanges.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);

        this.handleSpec = this.handleSpec.bind(this);
        this.addNodeToSpec = this.addNodeToSpec.bind(this);
    
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

    // change for distribution
    changeDist(e){
        this.setState({
            containerDist: e.target.value,
        });
    }
    

    // Handle submit data of the interaction
    applyChanges(type,uid){
        this.props.handleChangeNode(this.state,uid,type);
        this.onButtonContainer();
    }

    // Handle submit new container
    applyContainer(type,uid){
        var name = this.state.containerName;
        var resource = this.state.containerResource;
        var loc = parseInt(this.state.containerLoc);
        var scale = parseInt(this.state.containerScale);
        var dist = this.state.containerDist;
        var capacity = parseInt(this.state.containerCapacity);
        this.props.  submitContainer(uid, name, resource, loc, scale, dist, capacity);
        this.onButtonContainer();
    }

    closeUpdatePopup(){
        this.setState({
            showErrorMessage: false,
            showMessageCont: false,
            showMessageUP: false
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

    addNodeToSpec(){
        this.props.addNodeToSpec(this.state.selectedBlueprint, this.props.selectedNodeID);
    }

    render(){

        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }
        

        var specOptions = [];
        this.props.specs.forEach((spec) => {
            specOptions.push({ value: spec.uid, label: spec.name })

        });

        var specDefault = "None";
        this.props.specs.forEach((spec) => {
            if(spec.specTo.includes(this.props.selectedNodeID)){
                specDefault = spec.name
            }
        });

        var addBlueprint = 
            <div class="container">
                <p>Current Applied Blueprint: {specDefault}</p>
                <div class="row">
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
                        <button className="button" onClick={this.addNodeToSpec}>
                                Apply Blueprint
                        </button>
                    </div>
                </div>
            </div>

        // Content for adding container
        var containerContent = 
        <div>  

            {/* Add a blueprint to the node */}
            {addBlueprint}  

            <h2>Create Container</h2>  
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
            
            <label className="label">Distribution:&nbsp;
                <select 
                    className="paymentType" 
                    name="constainerDist"
                    onChange={this.changeDist} 
                    value={this.state.constainerDist}>
                    <option value="NORMAL">NORMAL</option>
                    <option value="UNIFORM">UNIFORM</option>
                    <option value="RANDOM INT">RANDOM INT</option>
                </select>
            </label>
            <br/>
            <label className="label">Loc: </label> 
            <input 
                type="text" 
                className="form-control"
                name="containerLoc" 
                style={{width: '150px'}}
                onChange={this.onChange} />

            <label className="label">Scale: </label> 
            <input 
                type="text" 
                className="form-control"
                name="containerScale" 
                style={{width: '150px'}}
                onChange={this.onChange} />

            <label className="label">Capacity: </label> 
            <input 
                type="text" 
                className="form-control"
                name="containerCapacity" 
                style={{width: '150px'}}
                onChange={this.onChange} />
        </div>

        // find type
        var type= this.props.selectedNodeID.substr(0, this.props.selectedNodeID.indexOf('-')); 

        let logic = [];
   /*     this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                l.conditionsActionsGroup.forEach((g) => {
                    var lstCondition = []
                    g.conditions.forEach((c) => {
                        lstCondition.push(<p>{c.name}</p>);
                    });
                    var lstAction = []
                    g.conditions.forEach((a) => {
                        lstAction.push(<p>{a.name}</p>);
                    });
                    var lstPass = []
                    g.conditions.forEach((p) => {
                        lstAction.push(<p>{p}</p>);
                    });
                    var lstFail = []
                    g.conditions.forEach((f) => {
                        lstAction.push(<p>{f}</p>);
                    });
                    logic.push(<div>
                        <h3>Group Name: {g.name}</h3>
                        <h5>List of Condition</h5>
                        {lstCondition}
                        <h5>List of Action</h5>
                        {lstAction}
                        <h5>List of Pass Path</h5>
                        {lstPass}
                        <h5>List of Fail Path</h5>
                        {lstFail}
                    </div>);
                });
        
            }
        })
*/
        let content;

        var endNode = this.props.endNode[0];
        var startNode = this.props.startNode[0];
        var s = this.props.stationNode;


        if(type == "end" && endNode != undefined){

            console.log(this.props);

            content =   <div class="container">
                        <h2>Settings for {endNode.name}</h2>
                        <p>Node Name: {endNode.name}</p>

                        <div class="container">
                            <button className="button" onClick={this.onButtonUpdate}>
                                Update Node
                            </button>
                        </div>

                        {/*when update button clicked, show html*/}
                       {this.state.showMessageUP &&  
                        <div>
                            <label className="label">Name:
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder={endNode.name}
                                    name="endname"
                                    onChange={this.onChange} />
                            </label>

                            <div class="container">
                                <button className="button" onClick={() => this.applyChanges("End Node",endNode.uid)}>Submit Changes</button>
                            </div>
                        </div>}

                        </div>
        }else if(type == "start" && startNode != undefined){
            content =   <div class="container">
                        <h2>Settings for {startNode.name}</h2>
                        <p>Node Name: {startNode.name}</p>
                        <p>Entity Name: {startNode.entity_name}</p>
                        <p>Generation Function dist: {startNode.dist}</p>
                        <p>Generation Function loc: {startNode.loc}</p>
                        <p>Generation Function scale: {startNode.scale}</p>
                        <p>Limit: {startNode.limit}</p>

                        <div class="container">
                            <button className="button" onClick={this.onButtonUpdate}>
                                Update Node
                            </button>
                        </div>

                       {/*when update button clicked, show html*/}
                       {this.state.showMessageUP &&  
                            <div>
                                <label className="label">Name:
                                    <input 
                                        type="text" 
                                        name="startname"
                                        placeholder={startNode.name}
                                        className="form-control"
                                        onChange={this.onChange}
                                         />
                                </label>
                                <label className="label">Gen Function dist:
                                  <select name="dist" className="form-control" onChange={this.onChange}>
                                    <option value="NORMAL">Normal</option>
                                    <option value="CONSTANT">Constant</option>
                                  </select>
                                </label>
                                <label className="label">Gen Function loc:
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder={startNode.loc}
                                        name="loc" 
                                        onChange={this.onChange}
                                         />
                                </label>
                                <label className="label">Gen Function scale:
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder={startNode.scale}
                                        name="scale" 
                                        onChange={this.onChange}
                                         />
                                </label>
                                <label className="label">Entity Name:
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder={startNode.entity_name}
                                        name="entity_name" 
                                        onChange={this.onChange}
                                         />
                                </label>
                                <label className="label">Limit:
                                    <input 
                                        type="text" 
                                        placeholder={startNode.limit}
                                        className="form-control"
                                        name="limit" 
                                        
                                        onChange={this.onChange}
                                         />
                                </label>

                                <div class="container">
                                    <button className="button" onClick={() => this.applyChanges("Start Node",startNode.uid)}>Submit Changes</button>
                                </div>
                            </div>}

                        <div class="container">
                            <button className="button" onClick={this.onButtonContainer}>
                                Add Container
                            </button>
                        </div>

                        {/*when container button clicked, show html*/}
                        {this.state.showMessageCont &&  
                            <div>
                                {containerContent}
                                <div class="container">
                                    <button className="button" onClick={() => this.applyContainer("Start Node",startNode.uid)}>Submit Container</button>
                                </div>
                            </div>
                        }

                    {/*when logic button clicked, show html*/}
                   
                        <LogicComponent
                         submitLogic={this.props.submitLogic}
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
                         createCondition={this.props.createCondition}
                         createAction={this.props.createAction} /> 
                        {logic}
                    </div>



                      
        }else if(type == "station" && s != undefined){
            
            // do a for each to grab correct basic node
            for(var x in this.props.stationNode){
                var uid = this.props.stationNode[x].uid;
                
                if(uid== this.state.targetId){
                    s = this.props.stationNode[x];
                }
            }

            content =   <div class="container">
                            <h2>Settings for {s.name}</h2>
                            <table>
                                <tr>
                                    <td><p>Node Name: {s.name}</p></td>
                                    <td><p>Capacity: {s.capacity}</p></td>
                                </tr>
                                <tr>
                                    <td><p>Time Function: {s.time_func}</p></td>
                                </tr>
                            </table>

                            <div class="container">
                                <button className="button" onClick={this.onButtonUpdate}>
                                    Update Node
                                </button>
                            </div>

                            {/*when update button clicked, show html*/}
                            {this.state.showMessageUP && 
                            <div>
                                <label className="label">Name:
                                    <input 
                                        type="text" 
                                        name="stationname"
                                        placeholder={s.name}
                                        className="form-control"
                                        
                                        onChange={this.onChange}
                                    />
                                </label>
                                <label className="label">Capacity:
                                    <input 
                                        type="text" 
                                        placeholder={s.capacity}
                                        className="form-control"
                                        name="capacity" 
                                        onChange={this.onChange}
                                         />
                                </label>
                                <label className="label">Time Function:
                                    <input 
                                        type="text" 
                                        placeholder={s.time_func}
                                        className="form-control"
                                        name="time_func" 
                                        onChange={this.onChange}
                                         />
                                </label>
                            </div>}

                            <div class="container">
                                <button className="button" onClick={this.onButtonContainer}>
                                    Add Contaier
                                </button>
                            </div>

                            {/*when contianer button clicked, show html*/}
                            {this.state.showMessageCont &&  
                                <div>
                                    {containerContent}

                                    <div class="container">
                                        <button className="button" onClick={() => this.applyContainer("Station Node",s.uid)}>Submit Container</button>
                                    </div>
                                </div>}

                        {/*when logic button clicked, show html*/}
                            <LogicComponent
                            submitLogic={this.props.submitLogic}
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
                            createCondition={this.props.createCondition}
                            createAction={this.props.createAction} /> 
                            {logic}
                        </div>
                    }

        return (
            <Popup open={this.props.openUpdate} 
            closeOnDocumentClick 
            onClose={this.closeUpdatePopup}
            contentStyle={{height: 400, overflow: "auto"}} >

               {content}

            {/*apply changes here*/}


            </Popup>
        );
    }

}

export default UpdatePopUp;
