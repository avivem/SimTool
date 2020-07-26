import React, { Component } from 'react';
import Select from 'react-select';

class LogicComponent extends Component{
    constructor(props) {
        super(props);
        this.state = {
            cond: "",
            condAmount: "",
            resource: "",
            action: "",
            actionAmount: "",
            passPath: "",
            passName: "",
            failPath: "",
            failName: "",
            showErrorMessage: false
          
        };

        this.onChangeNumber = this.onChangeNumber.bind(this);

        
        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.submitLogic = this.submitLogic.bind(this);
        
    }

    onChangeNumber(e){
        // console.log(e.target)
        this.setState({[e.target.name]: e.target.value});
           
    }

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

    submitLogic(){
        var cond = this.state.cond;
        var condAmount = parseFloat(this.state.condAmount);
        var resource = this.state.resource;
        var action = this.state.action
        var actionAmount = parseFloat(this.state.actionAmount);
        var passPath = this.state.passPath;
        var passName = this.state.passName;
        var failPath = this.state.failPath;
        var failName = this.state.failName;

        if(cond != "" && !isNaN(condAmount) && resource != "" && action != "" && !isNaN(actionAmount) &&
            passPath != "" && failPath != ""){
                this.props.submitLogic(cond, condAmount, resource,
                    action, actionAmount, passPath, passName, failPath, failName, this.props.selectedNodeID);
        
                this.setState({
                    cond: "",
                    condAmount: "",
                    resource: "",
                    action: "",
                    actionAmount: "",
                    passPath: "",
                    passName: "",
                    failPath: "",
                    failName: "",
                    showErrorMessage: false
                });
        
                this.props.showLogic();
        }
        else{
            this.setState({showErrorMessage: true})
        }

    }

    render(){
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
                    {this.state.showErrorMessage ? <p>Please answer all question and only number may be in the textfield.</p> : <div></div>}
                </div>
            </div>

        

        return(
            <div>
                {logicContent}
            </div>
        )
    }

    

}

export default LogicComponent;
