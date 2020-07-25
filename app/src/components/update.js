import React, { Component } from 'react';
import Popup from "reactjs-popup";
import Select from 'react-select';



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

            cond: "",
            condAmount: 0,
            resource: "",
            action: "",
            actionAmount: 0,
            passPath: "",
            passName: "",
            failPath: "",
            failName: "",
            showLogic: false

        }
        
        this.onChange = this.onChange.bind(this);
        this.onChangeNumber = this.onChangeNumber.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);
    
        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.showLogic = this.showLogic.bind(this);
        this.submitLogic = this.submitLogic.bind(this);
    }

    onChange(e){
        // console.log(e.target)
        this.setState({ [e.target.name]: e.target.value })
    }

    onChangeNumber(e){
        // console.log(e.target)
        var n = parseInt(e.target.value);
        this.setState({ [e.target.name]: n });
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

    handleCond(e){
        this.setState({ cond : e.value });
    }

    handleAction(e){
        this.setState({ action : e.value });
    }

    handlePass(e){
        this.setState({ 
            passPath : e.value,
            passName: e.label
         });
    }

    handleFail(e){
        this.setState({ 
            failPath : e.value,
            failName: e.label
         });
    }

    // First click will open the logic content
    // Second click will close logic content and reset all field
    showLogic(){
        if(this.state.showLogic){
            this.setState({
                showLogic: false,
                cond: "",
                condAmount: 0,
                resource: "",
                action: "",
                actionAmount: 0,
                passPath: "",
                passName: "",
                failPath: "",
                failName: "",
            });
        }
        else{
            this.setState({showLogic: true});
        }
    }

    submitLogic(){
        var cond = this.state.cond;
        var condAmount = this.state.condAmount;
        var resource = this.state.resource;
        var action = this.state.action
        var actionAmount = this.state.actionAmount;
        var passPath = this.state.passPath;
        var passName = this.state.passName;
        var failPath = this.state.failPath;
        var failName = this.state.failName;

        this.props.submitLogic(cond, condAmount, resource,
            action, actionAmount, passPath, passName, failPath, failName, this.props.selectedNodeID);

        this.showLogic();
    }
    

    render(){

        // find type
        var type= this.props.selectedNodeID.substr(0, this.props.selectedNodeID.indexOf('-')); 

        var resource = []
        this.props.containers.forEach((container) => {
            if(container.selectedNode == this.props.selectedNodeID){
                resource.push({ value: container.uid, label: container.resource });
            }
        }); 

        var cond = [{ value: "el==", label: "=" },
                    { value: "el>=", label: ">=" },
                    { value: "el>", label: ">" },
                    { value: "el<=", label: "<=" },
                    { value: "el<", label: "<" }]

        var action = [{ value: "ADD", label: "Add" },
                      { value: "SUB", label: "Subtract" }]

        var path = []
        this.props.arrows.forEach((arrow) => {
            if(arrow.from == this.props.selectedNodeID){
                var toType= arrow.to.substr(0, arrow.to.indexOf('-')); 
                var lst = []
                switch(toType){
                    case "start":
                        lst = this.props.startNode;
                        break;

                    case "station":
                        lst = this.props.stationNode;
                        break;

                    case "end":
                        lst = this.props.endNode
                        break;

                    default:
                        console.log("Selected is not a node")
                }
                lst.forEach((node) => {
                    if(node.uid == arrow.to){
                        path.push({ value: node.uid, label: node.name });
                    }
                });

            }
        });

        
        let logicContent = 
            <div>
                <label>Resource:
                    <Select
                    options={resource}
                    name="resource"
                    onChange={this.handleCond}
                    />
                </label>
                <div>
                    <label className="label">Condition Amount:
                        <input 
                            type="text" 
                            name="condAmount"
                            className="form-control"
                            onChange={this.onChangeNumber} />
                    </label>
                    <label>Condition:
                        <Select
                        options={cond}
                        name="cond"
                        onChange={this.handleCond}
                        />
                    </label>
                </div>
                <div>
                    <label className="label">Action Amount:
                        <input 
                            type="text" 
                            name="actionAmount"
                            className="form-control"
                            onChange={this.onChangeNumber} />
                    </label>
                    <label>Action Taken:
                        <Select
                        options={action}
                        name="action"
                        onChange={this.handleAction}
                        />
                    </label>
                </div>
                <div>
                    <label>Pass Path:
                        <Select
                        options={path}
                        name="passPath"
                        onChange={this.handlePass}
                        />
                    </label>
                    <label>Fail Pass:
                        <Select
                        options={path}
                        name="failPath"
                        onChange={this.handleFail}
                        />
                    </label>

                    <button className="button" onClick={this.submitLogic}>
                        Submit Logic
                    </button>
                </div>
            </div>

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
                        {this.state.showLogic ? logicContent : <div></div>}
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
                        {this.state.showLogic ? logicContent : <div></div>}
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
