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
            showErrorMessage: false,

            showLogic: false,
            logicButtonText: "Add Logic",

            previousResource: [{ value: "", label: "" }],
            previousCond: [{ value: "", label: "" }],
            previousAction: [{ value: "", label: "" }],
            previousPass: [{ value: "", label: "" }],
            previousFail: [{ value: "", label: "" }],
          
        };


        this.showLogic = this.showLogic.bind(this);

        this.onChangeNumber = this.onChangeNumber.bind(this);

        
        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.submitLogic = this.submitLogic.bind(this);
        
    }

    // First click will open the logic content
    // Second click will close logic content and reset all field
    showLogic(){
        if(this.state.showLogic){
            this.setState({ 
                showLogic: false,
                cond: "",
                condAmount: "",
                resource: "",
                action: "",
                actionAmount: "",
                passPath: "",
                passName: "",
                failPath: "",
                failName: "",
                showErrorMessage: false,

                previousResource: [{ value: "", label: "" }],
                previousCond: [{ value: "", label: "" }],
                previousAction: [{ value: "", label: "" }],
                previousPass: [{ value: "", label: "" }],
                previousFail: [{ value: "", label: "" }],
             });
        }
        else{
            this.setState({showLogic: true});
        }
        var logicExist = false;
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                logicExist = true;
            }
        });
        if(logicExist){
            this.setState({ logicButtonText: "Edit Logic" })
            this.props.logics.forEach((l) => {
                if(l.applyTo == this.props.selectedNodeID){
                    var condLabel = "";
                    switch(l.cond){
                        case "el==":
                            condLabel = "=";
                            break;
                        case "el<=":
                            condLabel = "<=";
                            break;
                        case "el<":
                            condLabel = "<";
                            break;
                        case "el>=":
                            condLabel = ">=";
                            break;
                        case "el>":
                            condLabel = ">";
                            break;
                    }
                    this.setState({
                        condAmount: l.condAmount,
                        actionAmount: l.actionAmount,
                        previousResource: [{value : l.resource, label: l.resource }],
                        previousAction: [{value : l.action, label: l.action }],
                        previousPass: [{value: l.passPath, label: l.passName}],
                        previousFail: [{value: l.failPath, label: l.failName}],
                        previousCond: [{value : l.cond, label: condLabel }],
                        resource: l.resource,
                        action: l.actionAmount,
                        passPath: l.passPath,
                        passName: l.passName,
                        failPath: l.failPath,
                        failName: l.failName
                    });
                }
                
            })
        }
        else{
            this.setState({ logicButtonText: "Add Logic" })
        }
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

            if(this.state.logicButtonText == "Add Logic"){
                this.props.submitLogic("new", cond, condAmount, resource,
                    action, actionAmount, passPath, passName, failPath, failName, this.props.selectedNodeID);
        
            }
            else{
                this.props.submitLogic("edit", cond, condAmount, resource,
                    action, actionAmount, passPath, passName, failPath, failName, this.props.selectedNodeID);
        
            }

            this.showLogic();
                
        }
        else{
            this.setState({showErrorMessage: true})
        }

    }


    render(){
        var resource = [{ value: "", label: "" }]
        this.props.containers.forEach((container) => {
            if(container.selectedNode == this.props.selectedNodeID){
                resource.push({ value: container.uid, label: container.resource });
            }
        }); 

        var cond = [{ value: "", label: "" },
                    { value: "el==", label: "=" },
                    { value: "el>=", label: ">=" },
                    { value: "el>", label: ">" },
                    { value: "el<=", label: "<=" },
                    { value: "el<", label: "<" }]

        var action = [{ value: "", label: "" },
                      { value: "ADD", label: "Add" },
                      { value: "SUB", label: "Subtract" }]

        var path = [{ value: "", label: "" }]
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

        // Find the logic that already existed for this logic
        var previousLogic = {};
        var logicExisted = false;
        var previousResource = [{ value: "", label: "" }]
        var previousCond = [{ value: "", label: "" }]
        var previousAction = [{ value: "", label: "" }]
        var previousPass = [{ value: "", label: "" }]
        var previousFail = [{ value: "", label: "" }]
        
        if(this.state.logicButtonText == "Edit Logic"){
            this.props.logics.forEach((l) => {
                if(l.applyTo == this.props.selectedNodeID){
                    previousLogic = l;
                
                    previousResource = [{value : l.resource, label: l.resource }]
                    previousAction = [{value : l.action, label: l.action }]
                    previousPass = [{value: l.passPath, label: l.passName}]
                    previousFail = [{value: l.failPath, label: l.failName}]
                    
                    var condLabel = "";
                    switch(l.cond){
                        case "el==":
                            condLabel = "=";
                            break;
                        case "el<=":
                            condLabel = "<=";
                            break;
                        case "el<":
                            condLabel = "<";
                            break;
                        case "el>=":
                            condLabel = ">=";
                            break;
                        case "el>":
                            condLabel = ">";
                            break;
                    }
                    previousCond = [{value : l.cond, label: condLabel }]
                }
            });
        }

        
        let logicContent = 
            <div>
                <label>Resource:
                    <Select
                    defaultValue={previousResource}
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
                            value={this.state.condAmount}
                            onChange={this.onChangeNumber} />
                    </label>
                    <label>Condition:
                        <Select
                        defaultValue={previousCond}
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
                            value={this.state.actionAmount}
                            onChange={this.onChangeNumber} />
                    </label>
                    <label>Action Taken:
                        <Select
                        defaultValue={previousAction}
                        options={action}
                        name="action"
                        onChange={this.handleAction}
                        />
                    </label>
                </div>
                <div>
                    <label>Pass Path:
                        <Select
                        defaultValue={previousPass}
                        options={path}
                        name="passPath"
                        onChange={this.handlePass}
                        />
                    </label>
                    <label>Fail Pass:
                        <Select
                        defaultValue={previousFail}
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
                <div class="logic">
                    <button className="button" onClick={this.showLogic} >
                        {this.state.logicButtonText}
                    </button>
                </div>
                {this.state.showLogic ? logicContent : <div></div>}
            </div>
        )
    }

    

}

export default LogicComponent;
