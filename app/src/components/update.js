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

        }
        
        this.onChange = this.onChange.bind(this);
        this.applyChanges = this.applyChanges.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);
    
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }
    

    // Handle submit data of the interaction
    applyChanges(type){
        this.props.handleChangeNode(this.state,type);
    }

    closeUpdatePopup(){
        this.setState({
            showErrorMessage: false
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
            this.setState({showMessageCont: true});
        }else{
            this.setState({showMessageCont: false});
        }
        
    };

    render(){

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

            content =   <div class="container">
                        <h2>Settings</h2>
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
                        </div>}


                        <div class="container">
                            <button className="button" onClick={this.onButtonContainer}>
                                Add Container
                            </button>
                        </div>

                     {/*when container button clicked, show html*/}
                        {this.state.showMessageCont &&  
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
                        }

                        </div>
        }else if(type == "start" && startNode != undefined){
            content =   <div class="container">
                        <h2>Settings</h2>
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
                            </div>}

                        <div class="container">
                            <button className="button" onClick={this.onButtonContainer}>
                                Add Container
                            </button>
                        </div>

                        {/*when container button clicked, show html*/}
                        {this.state.showMessageCont &&  
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
                            <h2>Settings</h2>
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
            contentStyle={{height: 500, overflow: "auto"}} >

               {content}

            {/*apply changes here*/}

            </Popup>
        );
    }

}

export default UpdatePopUp;
