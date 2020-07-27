import React, { Component } from 'react';
import Select from 'react-select';

class LogicComponent extends Component{
    constructor(props) {
        super(props);
        this.state = {
            condAmount: "",
            resource: "",
            action: "",
            actionAmount: "",
            showErrorMessage: false,

            showLogic: false,
            showConditionGroup: false,
            showCondition:false,
            showAction: false,

            lstGroup: [], // List of groups already created for the selected node

            groupName: "",
            passPath: [],
            passName: [],
            failPath: [],
            failName: [],


            groupSelected: "",
            conditionName: "",
            entityName: "",
            cond: "",
            containerName: "",
            condVal: 0,

            actionName: "",
            actionVal: 0

        };


        this.showAddLogic = this.showAddLogic.bind(this);
        this.showConditionGroup = this.showConditionGroup.bind(this);
        this.showCondition = this.showCondition.bind(this);
        this.showAction = this.showAction.bind(this);


        this.onChange = this.onChange.bind(this);

        
        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.submitLogic = this.submitLogic.bind(this);
        this.handleSelectedGroup = this.handleSelectedGroup.bind(this);
        this.handleEntitySelected = this.handleEntitySelected.bind(this);
        this.handleContainerSelected = this.handleContainerSelected.bind(this);

        this.createGroup = this.createGroup.bind(this);
        this.createCondition = this.createCondition.bind(this);
        this.createAction = this.createAction.bind(this);
        
    }

    // First click will add logic to the node and show 
    // the buttons to add condition group, conditions, and actions
    showAddLogic(){
        if(this.state.showLogic){
            this.setState({ 
                showLogic: false,
    /*            cond: "",
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
                previousFail: [{ value: "", label: "" }],*/
             });
        }
        else{

            this.setState({showLogic: true});
        }
        var logicExist = false;
        // Show the logic button if logic already existed for this node
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                logicExist = true;
                this.setState({showLogic: true});
            }
        });
        if(!logicExist){
            // Create the logic for this node if had not been created yet.
            this.props.createLogic(this.props.selectedNodeID)
        }
    /*    if(logicExist){
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
        */
    }

    // First click will open the 
    showConditionGroup(){
        if(this.state.showConditionGroup){
            this.setState({
                showConditionGroup: false,
                groupName: "",
                passPath: [],
                passName: [],
                failPath: [],
                failName: []
            });
        }
        else{
            this.setState({
                showConditionGroup: true,
                showCondition: false,
                showAction: false,
            });
        }
    }

    // Show the field to create a new condition
    showCondition(){
        if(this.state.showCondition){
            this.setState({
                showCondition: false,
                groupSelected: "",
                conditionName: "",
                entityName: "",
                cond: "",
                containerName: "",
                condVal: 0,
            });
        }
        else{
            this.setState({
                showConditionGroup: false,
                showCondition: true,
                showAction: false,
            });

            this.props.logics.forEach((l) => {
                if(l.applyTo == this.props.selectedNodeID){
                    // Get all of the exisitng group
                    var condGroup = [];
                    l.conditionsActionsGroup.forEach((g) => {
                        condGroup.push({value: g.name, label: g.name});
                    });
                    this.setState({ lstGroup: condGroup });
                }
            });
        }
    }

    // Show field to create a new action
    showAction(){
        if(this.state.showAction){
            this.setState({
                showAction: false,
                groupSelected: "",
                actionName: "",
                entityName: "",
                cond: "",
                containerName: "",
                actionVal: 0,
            });
        }
        else{
            this.setState({
                showConditionGroup: false,
                showCondition: false,
                showAction: true,
            });

            this.props.logics.forEach((l) => {
                if(l.applyTo == this.props.selectedNodeID){
                    // Get all of the exisitng group
                    var condGroup = [];
                    l.conditionsActionsGroup.forEach((g) => {
                        condGroup.push({value: g.name, label: g.name});
                    });
                    this.setState({ lstGroup: condGroup });
                }
            });
        }
    }

    onChange(e){
        // console.log(e.target)
        this.setState({[e.target.name]: e.target.value});
           
    }

    handleCond(e){
        this.setState({ cond : e.value });
    }

    handleAction(e){
        this.setState({ action : e.value });
    }

    // Stored the selected pass path and name
    handlePass(e){
        var path = [];
        var name = [];
        if(e != null){
            e.forEach((a) => {
                path.push(a.value);
                name.push(a.label);
            });
    
        }
        this.setState({ 
            passPath : path,
            passName: name
         });
    }

    // Store the selected fail path and name
    handleFail(e){
        var path = [];
        var name = [];
        if(e != null){
            e.forEach((a) => {
                path.push(a.value);
                name.push(a.label);
            });
    
        }
        this.setState({ 
            failPath : path,
            failName: name
         });
    }

    // Change selected group
    handleSelectedGroup(e){
        this.setState({ groupSelected: e.value });
    }

    handleEntitySelected(e){
        this.setState({ entityName: e.value });
    }

    handleContainerSelected(e){
        this.setState({ containerSelected: e.value });
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

    // Create the group
    createGroup(){
        this.props.createConditionGroup(this.props.selectedNodeID, this.state.groupName,
            this.state.passPath, this.state.passName, this.state.failPath, this.state.failName);
        
        this.showConditionGroup();
    }

    // Create a condition
    createCondition(){
        this.props.createCondition(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.actionVal);

        // Make the input field for the condition to close
        this.showCondition();
    }

    createAction(){
        this.props.createAction(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.condVal);

        // Make the input field for the condition to close
        this.showAction();
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
                      { value: "SUB", label: "Subtract" },
                      { value: "GIVE", label: "Give" },
                      { value: "TAKE", label: "Take" },
                      { value: "MULTIPLE", label: "Multiple" }]

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

        var lstContainer = [{ value: "", label: "" }]
        this.props.containers.forEach((c) => {
            if(c.selectedNode == this.props.selectedNodeID){
                lstContainer.push({value: c.uid, label: c.name});
            }
        });

        var lstSpecs = [{ value: "", label: "" }]
        this.props.specs.forEach((s) => {
            if(s.specTo.includes(this.props.selectedNodeID)){
                lstSpecs.push({value: s.uid, label: s.name});
            }
        });

        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }
        
        let logicContent = 
            <div>
                <label>Resource:
                    <Select
                    styles={customStyle}
                    defaultValue={this.state.previousResource}
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
                            onChange={this.onChange} />
                    </label>
                    <label>Condition:
                        <Select
                        styles={customStyle}
                        defaultValue={this.state.previousCond}
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
                            onChange={this.onChange} />
                    </label>
                    <label>Action Taken:
                        <Select
                        styles={customStyle}
                        defaultValue={this.state.previousAction}
                        options={action}
                        name="action"
                        onChange={this.handleAction}
                        />
                    </label>
                </div>
                <div>
                    <label>Pass Path:
                        <Select
                        styles={customStyle}
                        defaultValue={this.state.previousPass}
                        options={path}
                        name="passPath"
                        onChange={this.handlePass}
                        />
                    </label>
                    <label>Fail Pass:
                        <Select
                        styles={customStyle}
                        defaultValue={this.state.previousFail}
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



        var conditionGroupContent = 
            <div>
                <h3>Add Condition Group</h3>
                <label className="label">Group Name:
                    <input 
                        type="text" 
                        name="groupName"
                        className="form-control"
                        value={this.state.groupName}
                        onChange={this.onChange} />
                </label>
                <label>Pass Path:
                    <Select
                    isMulti
                    styles={customStyle}
                    options={path}
                    name="passPath"
                    onChange={this.handlePass}
                    />
                </label>
                <label>Fail Pass:
                    <Select
                    isMulti
                    styles={customStyle}
                    options={path}
                    name="failPath"
                    onChange={this.handleFail}
                    />
                </label>
                <button className="button" onClick={this.createGroup}>
                    Create Group
                </button>
            </div>

        var conditionContent = 
            <div>
                <h3>Add Condition to a Group</h3>
                <label>Select Group:
                    <Select
                    styles={customStyle}
                    options={this.state.lstGroup}
                    name="groupSelected"
                    onChange={this.handleSelectedGroup}
                    />
                </label>
                <label className="label">Condition Name:
                    <input 
                        type="text" 
                        name="conditionName"
                        className="form-control"
                        value={this.state.conditionName}
                        onChange={this.onChange} />
                </label>
                <label>Entity Name:
                    <Select
                    styles={customStyle}
                    options={lstSpecs}
                    name="entityName"
                    onChange={this.handleEntitySelected}
                    />
                </label>
                <label>Check:
                    <Select
                    styles={customStyle}
                    options={cond}
                    name="cond"
                    onChange={this.handleCond}
                    />
                </label>
                <label>Container Name:
                    <Select
                    styles={customStyle}
                    options={lstContainer}
                    name="containerName"
                    onChange={this.handleContainerSelected}
                    />
                </label>
                <label className="label">Value:
                    <input 
                        type="text" 
                        name="condVal"
                        className="form-control"
                        value={this.state.condVal}
                        onChange={this.onChange} />
                </label>

                <button className="button" onClick={this.createCondition}>
                    Create Condition
                </button>
            </div>

        var actionContent = 
            <div>
                <h3>Add Action to a Group</h3>
                <label>Select Group:
                    <Select
                    styles={customStyle}
                    options={this.state.lstGroup}
                    name="groupSelected"
                    onChange={this.handleSelectedGroup}
                    />
                </label>
                <label className="label">Action Name:
                    <input 
                        type="text" 
                        name="actionName"
                        className="form-control"
                        value={this.state.actionName}
                        onChange={this.onChange} />
                </label>
                <label>Entity Name:
                    <Select
                    styles={customStyle}
                    options={lstSpecs}
                    name="entityName"
                    onChange={this.handleEntitySelected}
                    />
                </label>
                <label>Action Taken:
                    <Select
                    styles={customStyle}
                    defaultValue={this.state.previousAction}
                    options={action}
                    name="action"
                    onChange={this.handleAction}
                    />
                </label>
                <label>Container Name:
                    <Select
                    styles={customStyle}
                    options={cond}
                    name="containerName"
                    onChange={this.handleContainerSelected}
                    />
                </label>
                <label className="label">Value:
                    <input 
                        type="text" 
                        name="actionVal"
                        className="form-control"
                        value={this.state.actionVal}
                        onChange={this.onChange} />
                </label>

                <button className="button" onClick={this.createAction}>
                    Create Action
                </button>
            </div>

        return(
            <div>
                {/* Only show the add logic button if node don't already have a logic */}
                {this.state.showLogic ? <div></div>
                :
                <div class="logic">
                    <button className="button" onClick={this.showAddLogic} >
                        Add Logic
                    </button>
                </div>}

                {this.state.showLogic ? 
                <div>
                    <button className="button" onClick={this.showConditionGroup} >
                        Add Condition Group
                    </button>
                    <button className="button" onClick={this.showCondition} >
                        Add Condition 
                    </button>
                    <button className="button" onClick={this.showAction} >
                        Add Action
                    </button>
                </div>
                : <div></div>}

                {this.state.showConditionGroup ? conditionGroupContent : <div></div>}
                {this.state.showCondition ? conditionContent : <div></div>}
                {this.state.showAction ? actionContent : <div></div>}
            </div>
        )
    }

    

}

export default LogicComponent;
