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
            showActionGroupErrorMessage: "",

            showErrorMessage: false,
            showLogic: false,
            showConditionGroup: false,
            showActionGroup: false,
            showCondition:false,
            showAction: false,
            showEditLogic: false,

            lstGroup: [], // List of groups already created for the selected node

            passPath: [],
            passName: [],
            failPath: [],
            failName: [],

            groupName: "",
            groupSelected: "",
            conditionName: "",
            entityName: "",
            cond: "",
            containerName: "",
            condVal: 0,

            actionName: "",
            actionVal: 0,

            actionGroupName: "",

            logic: "",

            defaultLogic: [{value: "BOOL", label: "Boolean"}]
        };


        this.showAddLogic = this.showAddLogic.bind(this);
        this.showConditionGroup = this.showConditionGroup.bind(this);
        this.showActionGroup = this.showActionGroup.bind(this);
        this.showCondition = this.showCondition.bind(this);
        this.showAction = this.showAction.bind(this);
        this.showEditLogic = this.showEditLogic.bind(this);

        this.onChange = this.onChange.bind(this);

        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.submitLogic = this.submitLogic.bind(this);
        this.handleSelectedGroup = this.handleSelectedGroup.bind(this);
        this.handleEntitySelected = this.handleEntitySelected.bind(this);
        this.handleContainerSelected = this.handleContainerSelected.bind(this);
        this.handleEditLogic = this.handleEditLogic.bind(this);

        this.createGroup = this.createGroup.bind(this);
        this.createActionGroup = this.createActionGroup.bind(this);
        this.createCondition = this.createCondition.bind(this);
        this.createAction = this.createAction.bind(this);

        this.submitEditLogic = this.submitEditLogic.bind(this);
        
    }

    // First click will add logic to the node and show 
    // the buttons to add condition group, conditions, and actions
    showAddLogic(){
        if(this.state.showLogic){
            this.setState({ 
                showLogic: false,
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
                showEditLogic:false,
                showConditionGroup: true,
                showCondition: false,
                showAction: false,
                showActionGroup: false
            });
        }
    }

    // Show the way to add an action group
    showActionGroup(){
        if(this.state.showActionGroup){
            this.setState({showActionGroup: false});
        }
        else{
            this.setState({
                showActionGroup: true,
                showActionGroupErrorMessage: "",
                actionGroupName: "",
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: false,
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
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: true,
                showAction: false,
                showActionGroup: false
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
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: false,
                showAction: true,
                showActionGroup: false
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

    showEditLogic(){
        if(this.state.showEditLogic){
            this.setState({ showEditLogic: false});
        }
        else{
            var nodes;
            if(this.props.selectedNodeID.includes("start")){
                nodes = this.props.startNode;
            }
            else if(this.props.selectedNodeID.includes("station")){
                nodes = this.props.stationNode;
            }
            else if(this.props.selectedNodeID.includes("end")){
                nodes = this.props.endNode;
            }
    
            nodes.forEach((n) => {
                if(n.uid == this.props.selectedNodeID){
                    var a = [];
                    switch(n.logic){
                        case "BOOL":
                            a = [{value: n.logic, label: "BOOL"}];
                            break;
    
                        case "RAND":
                            a = [{value: n.logic, label: "RAND"}]
                            break;
                        
                        case "ALPHA_SEQ":
                            a = [{value: n.logic, label: "ALPHA_SEQ"}]
                            break;
                    }
                    this.setState({ defaultLogic:  a});
                }
            });
    
            this.setState({ 
                showEditLogic: true,
                showConditionGroup: false,
                showCondition: false,
                showAction: false,
                showActionGroup: false
            });


    
        }
    }

    onChange(e){

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
                console.log(a);
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
        this.setState({ containerName: e.value });
    }

    handleEditLogic(e){
        this.setState({ logic: e.value });
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

    // Create the condition group
    createGroup(){
        console.log(this.props.selectedNodeID);
        console.log(this.props.groupName);

        this.props.createConditionGroup(this.props.selectedNodeID, this.state.groupName,
            this.state.passPath, this.state.passName, this.state.failPath, this.state.failName);
        
        this.showConditionGroup();
    }

    //Create the action group
    createActionGroup(){
        //Assume that the condition group already have an action group 
        var existed = true;

        // Find if that action group really existed
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                l.conditionsActionsGroup.forEach((group) => {
                    if(group.name == this.state.groupSelected){
                        if(group.actionGroup.name === ""){
                            //Action group do not exist
                            existed = false;
                        }
                    }
                })
            }
        });

        if(this.state.actionGroupName !== "" && !existed){
            this.props.createActionGroup(this.props.selectedNodeID, 
                this.state.groupSelected, this.state.actionGroupName);
            
            this.showActionGroup();
        }
        else{
            if(this.state.actionGroupName == ""){
                this.setState({ showActionGroupErrorMessage: "Name"});
            }
            else{
                this.setState({ showActionGroupErrorMessage: "Exist"});
            }
            
        }


    }

    // Create a condition
    createCondition(){

        this.props.createCondition(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.cond, this.state.condVal);

        // Make the input field for the condition to close
        this.showCondition();
    }

    createAction(){
        this.props.createAction(this.props.selectedNodeID, this.state.groupSelected,
            this.state.actionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.actionVal, this.state.actionGroupName);

        // Make the input field for the condition to close
        this.showAction();
    }

    // Submit Edit
    submitEditLogic(){
        this.props.submitEditLogic(this.props.selectedNodeID, this.state.logic);
        
    }

    render(){
        var resource = [{ value: "", label: "" }]
        this.props.containers.forEach((container) => {
            if(container.selectedNode == this.props.selectedNodeID){
                resource.push({ value: container.uid, label: container.resource });
            }
        }); 
        

        var cond = [{ value: "", label: "" },
                    { value: "e==v", label: "=" },
                    { value: "e>=v", label: ">=" },
                    { value: "e>v", label: ">" },
                    { value: "e<=v", label: "<=" },
                    { value: "e<v", label: "<" }]

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
                lstContainer.push({value: c.name, label: c.name});
            }
        });

        var lstEntity = [{ value: "", label: "" }]
        this.props.startNode.forEach((s) => {
            s.containers.forEach((c) => {
                lstEntity.push({value: c, label: c});
            })
        });

        var logic = [{value: "BOOL", label: "BOOL"},
                    {value: "RAND", label: "RAND"},
                    {value: "ALPHA_SEQ", label: "APLHA_SEQ"}];

        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }

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
            {/*this needs to be the UID not the NAME*/}
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

        var actionGroupContent = 
            <div>
                <h3>Add Action Group</h3>
                <label>Select a Condition Group:
                    <Select
                    styles={customStyle}
                    options={this.state.lstGroup}
                    name="groupSelected"
                    onChange={this.handleSelectedGroup}
                    />
                </label>
                <label className="label">Action Group Name:
                    <input 
                        type="text" 
                        name="actionGroupName"
                        className="form-control"
                        value={this.state.actionGroupName}
                        onChange={this.onChange} />
                </label>
                {this.state.showActionGroupErrorMessage == "Exist" && <p>Condition group can only have one Action group</p>}
                {this.state.showActionGroupErrorMessage == "Name" && <p>Please enter the Action group's name</p>}
                <button className="button" onClick={this.createActionGroup}>
                    Create Condition
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
                    options={lstEntity}
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
                    options={lstEntity}
                    name="entityName"
                    onChange={this.handleEntitySelected}
                    />
                </label>
                <label>Action Taken:
                    <Select
                    styles={customStyle}
                    options={action}
                    name="action"
                    onChange={this.handleAction}
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
                        name="actionVal"
                        className="form-control"
                        value={this.state.actionVal}
                        onChange={this.onChange} />
                </label>

                <button className="button" onClick={this.createAction}>
                    Create Action
                </button>
            </div>

        var editLogic = 
        <div>
            <h3>Edit Logic</h3>
            <label>Select Group:
                <Select
                defaultValue={this.state.defaultLogic}
                styles={customStyle}
                options={logic}
                name="logic"
                onChange={this.handleEditLogic}
                />
            </label>
            <button className="button" onClick={this.submitEditLogic}>
                Submit Edit
            </button>
        </div>

        return(
            <div>
                {/* Only show the add logic button if node don't already have a logic */}
                {this.state.showLogic ? <div></div>
                :
                <div class="container logic">
                    <button className="button" onClick={this.showAddLogic} >
                        Add Logic
                    </button>
                </div>}

                {this.state.showLogic ? 
                <div>
                    <button className="button" onClick={this.showEditLogic} >
                        Edit Logic
                    </button>
                    <button className="button" onClick={this.showConditionGroup} >
                        Add Condition Group
                    </button>
                    <button className="button" onClick={this.showActionGroup} >
                        Add Action Group 
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
                {this.state.showEditLogic ? editLogic : <div></div>}
                {this.state.showActionGroup ? actionGroupContent : <div></div>}
            </div>
        )
    }

    

}

export default LogicComponent;
