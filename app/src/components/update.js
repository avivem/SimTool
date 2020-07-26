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

            showMessage: false,

            
            showLogic: false

        }
        
        this.onChange = this.onChange.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);
    
        this.showLogic = this.showLogic.bind(this);
        
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

    

     // Handle submit data of the interaction
     submitInteraction(){
        var change;
        this.props.handleChangeNode(change);
    }

    closeUpdatePopup(){
        this.setState({
            showErrorMessage: false
        });
        this.props.closeUpdatePopup();
    }

    onButtonClickHandler = () => {
    this.setState({showMessage: true});
    };

    // First click will open the logic content
    // Second click will close logic content and reset all field
    showLogic(){
        if(this.state.showLogic){
            this.setState({ showLogic: false });
        }
        else{
            this.setState({showLogic: true});
        }
    }
    

    render(){

        // find type
        var type= this.props.selectedNodeID.substr(0, this.props.selectedNodeID.indexOf('-')); 

        let logic = <div></div>;
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                logic = 
                    <div>
                        <h3>Node Logic</h3>
                        <p>Resource: {l.resource}</p>
                        <p>Condition: {l.cond}</p>
                        <p>Condition Amount: {l.condAmount}</p>
                        <p>Action: {l.action}</p>
                        <p>Action Amount: {l.actionAmount}</p>
                        <p>Pass Path: {l.passName}</p>
                        <p>Fail Path: {l.failName}</p>
                    </div>
            }
        })

        let content;

        var endNode = this.props.endNode[0];
        var startNode = this.props.startNode[0];
        var s = this.props.stationNode;


        // determine content in popup
        if(type == "end" && endNode != undefined){

            content =   <div class="container">
                        <p>Node Name: {endNode.name}</p>

                        <div class="container">
                            <button className="button" onClick={this.onButtonClickHandler}>
                                Update Node
                            </button>
                        </div>

                       {this.state.showMessage &&  
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
                            <button className="button" onClick={this.submitInteraction}>
                                Add Container
                            </button>
                        </div>

                        </div>
        }else if(type == "start" && startNode != undefined){
            console.log('start');
            content =   <div class="container">
                        <p>Node Name: {startNode.name}</p>
                        <p>Entity Name: {startNode.entity_name}</p>
                        <p>Generation Function dist: {startNode.dist}</p>
                        <p>Generation Function loc: {startNode.loc}</p>
                        <p>Generation Function scale: {startNode.scale}</p>
                        <p>Limit: {startNode.limit}</p>

                        <div class="container">
                            <button className="button" onClick={this.onButtonClickHandler}>
                                Update Node
                            </button>
                        </div>

                       {this.state.showMessage &&  
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
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder={startNode.dist}
                                name="dist" 
                                onChange={this.onChange}
                                 />
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
                            <button className="button" onClick={this.submitInteraction}>
                                Add Container
                            </button>
                        </div>

                        <div class="logic">
                            <button className="button" onClick={this.showLogic} >
                                Add Logic
                            </button>
                        </div>
                        {this.state.showLogic ? 
                        <LogicComponent
                         submitLogic={this.props.submitLogic}
                         selectedNodeID={this.props.selectedNodeID}
                         showLogic={this.showLogic}
                         containers={this.props.containers}
                         arrows={this.props.arrows}
                         startNode={this.props.startNode}
                         stationNode={this.props.stationNode} 
                         endNode={this.props.endNode} /> 
                         : <div></div>}
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
                        <p>Node Name: {s.name}</p>
                        <p>Capacity: {s.capacity}</p>
                        <p>Time Function: {s.time_func}</p>

                        <div class="container">
                            <button className="button" onClick={this.onButtonClickHandler}>
                                Update Node
                            </button>
                        </div>

                        {this.state.showMessage && 
                        <div><label className="label">Name:
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
                        </label></div>}

                        <div class="container">
                            <button className="button" onClick={this.submitInteraction}>
                                Add Contaier
                            </button>
                        </div>

                        <div class="logic">
                            <button className="button" onClick={this.showLogic}>
                                Add Logic
                            </button>
                        </div>
                        {this.state.showLogic ? 
                        <LogicComponent
                         submitLogic={this.props.submitLogic}
                         selectedNodeID={this.props.selectedNodeID}
                         showLogic={this.showLogic}
                         containers={this.props.containers}
                         arrows={this.props.arrows}
                         startNode={this.props.startNode}
                         stationNode={this.props.stationNode} 
                         endNode={this.props.endNode} />  
                         : <div></div>}
                        {logic}

                        </div>
        }


        return (
            <Popup open={this.props.openUpdate} 
            closeOnDocumentClick 
            onClose={this.closeUpdatePopup}
            contentStyle={{height: 500, overflow: "auto"}} >

               {content}

                <div class="container">
                    {this.state.showErrorMessage ? <p>Max can't be smaller than the mean</p> : <div></div>}
                    <button className="button" onClick={this.submitInteraction}>
                        Apply
                    </button>
                </div>
            </Popup>
        );
    }

}

export default UpdatePopUp;
