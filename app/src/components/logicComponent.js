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
            showActionGroup: false,
            showCondition:false,
            showAction: false,
            showEditLogic: false,
            showUpdateLogic: false,
            showActionGroupErrorMessage: "",

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
            actionVal: 0,

            actionGroupName: "",

            logic: "",
            defaultLogic: [{value: "BOOL", label: "Boolean"}],

            selectedGroupUpdateValue: null,
            selectedGroupUpdateLabel: null,
            selectedActionGroupUpdateValue: null,
            selectedActionGroupUpdateLabel: null,
            selectedConditionUpdateValue: null,
            selectedConditionUpdateLabel: null,
            selectedActionUpdateValue: null,
            selectedActionUpdateLabel: null,
            defaultPassPath: [],
            defaultFailPath: [],
            defaultSelectedGroup: [],
            defaultEntity: [],
            defaultCheck: [],
            defaultAction: [],
            defaultContainer: [],
            editType: "",


        };
        this.getAllGroup = this.getAllGroup.bind(this);

        this.showAddLogic = this.showAddLogic.bind(this);
        this.showConditionGroup = this.showConditionGroup.bind(this);
        this.showActionGroup = this.showActionGroup.bind(this);
        this.showCondition = this.showCondition.bind(this);
        this.showAction = this.showAction.bind(this);
        this.showEditLogic = this.showEditLogic.bind(this);
        this.showUpdateLogic = this.showUpdateLogic.bind(this);
        this.showEditConditionGroup = this.showEditConditionGroup.bind(this);
        this.showEditActionGroup = this.showEditActionGroup.bind(this);
        this.showEditCondition = this.showEditCondition.bind(this);
        this.showEditAction = this.showEditAction.bind(this);

        this.onChange = this.onChange.bind(this);

        
        this.handleCond = this.handleCond.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handlePass = this.handlePass.bind(this);
        this.handleFail = this.handleFail.bind(this);
        this.handleSelectedGroup = this.handleSelectedGroup.bind(this);
        this.handleEntitySelected = this.handleEntitySelected.bind(this);
        this.handleContainerSelected = this.handleContainerSelected.bind(this);
        this.handleEditLogic = this.handleEditLogic.bind(this);
        this.handleUpdateGroup = this.handleUpdateGroup.bind(this);
        this.handleUpdateActionGroup = this.handleUpdateActionGroup.bind(this);
        this.handleUpdateCondition = this.handleUpdateCondition.bind(this);
        this.handleUpdateAction = this.handleUpdateAction.bind(this);

        this.createGroup = this.createGroup.bind(this);
        this.createActionGroup = this.createActionGroup.bind(this);
        this.createCondition = this.createCondition.bind(this);
        this.createAction = this.createAction.bind(this);

        this.submitEditLogic = this.submitEditLogic.bind(this);  
        
        this.editGroup = this.editGroup.bind(this);
        this.editActionGroup = this.editActionGroup.bind(this);
        this.editCondition = this.editCondition.bind(this);
        this.editAction = this.editAction.bind(this);
    }

    // Get all logic group for this node
    getAllGroup(){
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
                showUpdateLogic: false,
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
                showUpdateLogic: false,
                showActionGroup: true,
                showActionGroupErrorMessage: "",
                actionGroupName: "",
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: false,
                showAction: false,
            });

            this.getAllGroup();
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
                showUpdateLogic: false,
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: true,
                showAction: false,
                showActionGroup: false
            });

            this.getAllGroup();
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
                showUpdateLogic: false,
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: false,
                showAction: true,
                showActionGroup: false
            });

            this.getAllGroup();
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

    showUpdateLogic(){
        if(this.state.showUpdateLogic){
            this.setState({ showUpdateLogic: false });
        }
        else{
            this.setState({ 
                showUpdateLogic: true,
                showEditLogic:false,
                showConditionGroup: false,
                showCondition: false,
                showAction: false,
                showActionGroup: false
             });
        }
    }

    showEditConditionGroup(){
        if(this.state.showConditionGroup){
            this.setState({ showConditionGroup: false });
        }
        else{
            var selected = this.state.selectedGroupUpdateValue;
            if(selected !== null){
                var pass = [];
                var fail = []
                var index = 0;
 
                // Create the list of default selected pass path
                selected.pass_paths.forEach((p) => {
                    pass.push({value: p, label: selected.passName[index]});
                    index = index + 1;
                });
                index = 0;
 
                // Create the list of default selected fail path
                selected.fail_paths.forEach((f) => {
                    fail.push({value: f, label: selected.failName[index]});
                    index = index + 1;
                });


                this.setState({ 
                    showConditionGroup: true,
                    showEditLogic:false,
                    showCondition: false,
                    showAction: false,
                    showActionGroup: false,

                    editType: "group",
                    defaultFailPath: fail,
                    defaultPassPath: pass,
                    groupName: selected.name,
                    
                    passPath: selected.pass_paths,
                    passName: selected.passName,
                    failPath: selected.fail_paths,
                    failName: selected.failName
                });
            }
        }
    }

    // Show the action group to be update
    showEditActionGroup(){
        if(this.state.showActionGroup){
            this.setState({ showActionGroup: false });
        }
        else{
            var selected = this.state.selectedActionGroupUpdateValue;
            if(selected !== null){

                this.setState({ 
                    showActionGroup: true,
                    showEditLogic:false,
                    showConditionGroup: false,
                    showCondition: false,
                    showAction: false,
                    editType: "actionGroup",
                    actionGroupName: selected[1]
                 });
            }
            
        }
    }

    // Show the condition to be update with the current data
    showEditCondition(){
        if(this.state.showCondition){
            this.setState({ showCondition: false });
        }
        else{
            var selected = this.state.selectedConditionUpdateValue;
            if(selected !== null){
                var cond;
                var c = selected[1].check; 
                switch(c){
                    case "e==v":
                        cond = [{value: c, label: "="}];
                        break;
                    case "e>=v":
                        cond = [{value: c, label: ">="}];
                        break;
                    case "e>v":
                        cond = [{value: c, label: ">"}];
                        break;
                    case "e<=v":
                        cond = [{value: c, label: "<="}];
                        break;
                    case "e<v":
                        cond = [{value: c, label: "<"}];
                        break;

                }
                // Get all group to display in dropdown when editing condition
                this.getAllGroup();

                // Set the default for when updating condition
                this.setState({ 
                    showCondition: true,
                    showEditLogic:false,
                    showConditionGroup: false,
                    showAction: false,
                    showActionGroup: false,

                    editType: "condition",
                    defaultSelectedGroup: [{value: selected[0], label: selected[0]}],
                    defaultEntity: [{value: selected[1].encon_name, label: selected[1].encon_name}],
                    defaultContainer: [{value: selected[1].nodecon_name, label: selected[1].nodecon_name}],
                    defaultCheck: cond,
                    conditionName: selected[1].name,
                    condVal: selected[1].val,

                    groupSelected: selected[0],
                    entityName: selected[1].encon_name,
                    containerName: selected[1].nodecon_name,
                    cond: selected[1].check

                 });
            }
        }
    }

    // Show the action to be updated
    showEditAction(){
        if(this.state.showAction){
            this.setState({ showAction: false });
        }
        else{
            var selected = this.state.selectedActionUpdateValue;
            if(selected !== null){
                var op;
                var c = selected[1].op;
                switch(c){
                    case "ADD":
                        op = [{value: c, label: "Add"}];
                        break;
                    case "SUB":
                        op = [{value: c, label: "Subtract"}];
                        break;
                    case "GIVE":
                        op = [{value: c, label: "Give"}];
                        break;
                    case "TAKE":
                        op = [{value: c, label: "Take"}];
                        break;
                    case "MULTIPLE":
                        op = [{value: c, label: "Multiple"}];
                        break;

                }

                // Get all group to display in dropdown when editing action 
                this.getAllGroup();

                // Default setting for editing action part of logic
                this.setState({ 
                    showAction: true,
                    showEditLogic:false,
                    showConditionGroup: false,
                    showCondition: false,
                    showActionGroup: false,

                    editType: "action",
                    defaultSelectedGroup: [{value: selected[0], label: selected[0]}],
                    defaultEntity: [{value: selected[1].encon_name, label: selected[1].encon_name}],
                    defaultContainer: [{value: selected[1].nodecon_name, label: selected[1].nodecon_name}],
                    defaultAction: op,

                    groupSelected: selected[0],
                    actionName: selected[1].name,
                    actionVal: selected[1].val,
                    entityName: selected[1].encon_name,
                    containerName: selected[1].nodecon_name,
                    action: selected[1].op
                 });
            }
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

    // Handle the selected part of logic for update
    handleUpdateGroup(e){
        this.setState({ 
            selectedGroupUpdateValue: e.value,
            selectedGroupUpdateLabel: e.label
        })
    }

    handleUpdateActionGroup(e){
        this.setState({ 
            selectedActionGroupUpdateValue: e.value,
            selectedActionGroupUpdateLabel: e.label
        })
    }

    handleUpdateCondition(e){
        this.setState({ 
            selectedConditionUpdateValue: e.value,
            selectedConditionUpdateLabel: e.label
        })
    }

    handleUpdateAction(e){
        this.setState({ 
            selectedActionUpdateValue: e.value,
            selectedActionUpdateLabel: e.label
        })
    }

    // Create the condition group
    createGroup(){

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

    // Edit the logic group
    editGroup(){

        this.props.editConditionGroup(this.props.selectedNodeID, this.state.groupName,
            this.state.passPath, this.state.passName, this.state.failPath, this.state.failName, 
            this.state.selectedGroupUpdateValue);
        
        this.showEditConditionGroup();
    }

    //Edit the action group
    editActionGroup(){
        if(this.state.actionGroupName !== ""){
            this.props.editActionGroup(this.props.selectedNodeID, 
                this.state.actionGroupName, this.state.selectedActionGroupUpdateValue);
            
            this.showEditActionGroup();
        }
        else{
            this.setState({ showActionGroupErrorMessage: "Name"});
        }
    }

    // Edit condition 
    editCondition(){
        this.props.editCondition(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.cond, this.state.condVal, this.state.selectedConditionUpdateValue);

        // Make the input field for the condition to close
        this.showEditCondition();
    }

    // Edit Action
    editAction(){
        this.props.editAction(this.props.selectedNodeID, this.state.groupSelected,
            this.state.actionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.actionVal, this.state.actionGroupName,
            this.state.selectedActionUpdateValue);

        // Make the input field for the condition to close
        this.showEditAction();
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


        var lstGroup = [];
        var lstCondition = [];
        var lstActionGroup = [];
        var lstAction = [];
        this.props.logics.forEach((l) => {
            if(l.applyTo == this.props.selectedNodeID){
                /* Create list of group */
                /* [type of update, current data] */
                l.conditionsActionsGroup.forEach((group) => {
                    lstGroup.push({
                        value: group, 
                        label: group.name
                    });
                    
                    /* Create list of condition */
                    /* [type of update, group name to find, current data] */
                    group.conditions.forEach((c) => {
                        lstCondition.push({
                            value: [group.name, c], 
                            label: c.name
                        });
                    });

                    /* Create list of actions group */
                    /* [type of update, group name to find, current data] */
                    lstActionGroup.push({
                        value: [group.name, group.actionGroup.name], 
                        label: group.actionGroup.name
                    });

                    /* Create list of actions */
                    /* [type of update, group name to find, current data] */
                    group.actionGroup.actions.forEach((a) => {
                        lstAction.push({
                            value: [group.name, a], 
                            label: a.name
                        });
                    });

                })
            }
            
        })

        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }

        var conditionGroupContent = 
            <div>
                <label className="label">Group Name:
                    <input 
                        type="text" 
                        name="groupName"
                        className="form-control"
                        value={this.state.groupName}
                        onChange={this.onChange} />
                </label>
            {/*this needs to be the UID not the NAME*/}
                {!(this.state.showUpdateLogic) ? 
                    <div>
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
                :
                    <div>
                        <label>Pass Path:
                            <Select
                            defaultValue={this.state.defaultPassPath}
                            isMulti
                            styles={customStyle}
                            options={path}
                            name="passPath"
                            onChange={this.handlePass}
                            />
                        </label>
                        <label>Fail Pass:
                            <Select
                            defaultValue={this.state.defaultFailPath}
                            isMulti
                            styles={customStyle}
                            options={path}
                            name="failPath"
                            onChange={this.handleFail}
                            />
                        </label>
                        <button className="button" onClick={this.editGroup}>
                            Edit Group
                        </button>
                    </div>
                }
            </div>

        var actionGroupContent = 
            <div>
                {!(this.state.showUpdateLogic) ? 
                    <label>Select a Condition Group:
                        <Select
                        styles={customStyle}
                        options={this.state.lstGroup}
                        name="groupSelected"
                        onChange={this.handleSelectedGroup}
                        />
                    </label>
                :
                    <div></div>
                }
                
                <label className="label">Action Group Name:
                    <input 
                        type="text" 
                        name="actionGroupName"
                        className="form-control"
                        value={this.state.actionGroupName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ?
                    <div>
                        {this.state.showActionGroupErrorMessage == "Exist" && <p>Condition group can only have one Action group</p>}
                        {this.state.showActionGroupErrorMessage == "Name" && <p>Please enter the Action group's name</p>}
                        <button className="button" onClick={this.createActionGroup}>
                            Create Action Group
                        </button>
                    </div>
                :
                    <div>
                        {this.state.showActionGroupErrorMessage == "Name" && <p>Please enter the Action group's name</p>}
                        <button className="button" onClick={this.editActionGroup}>
                            Edit Action Group
                        </button>
                    </div>
                }
            </div>

        var conditionContent = 
            <div>

                <label>Select Group:
                    {!(this.state.showUpdateLogic) ?
                        <div>
                            <Select
                            styles={customStyle}
                            options={this.state.lstGroup}
                            name="groupSelected"
                            onChange={this.handleSelectedGroup}
                            />
                        </div>
                    :
                        <div>
                            <Select
                            defaultValue={this.state.defaultSelectedGroup}
                            styles={customStyle}
                            options={this.state.lstGroup}
                            name="groupSelected"
                            onChange={this.handleSelectedGroup}
                            />
                        </div>
                    }
                    
                </label>
                <label className="label">Condition Name:
                    <input 
                        type="text" 
                        name="conditionName"
                        className="form-control"
                        value={this.state.conditionName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ?
                    <div>
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
                    </div>
                :
                    <div>
                        <label>Entity Name:
                            <Select
                            defaultValue={this.state.defaultEntity}
                            styles={customStyle}
                            options={lstEntity}
                            name="entityName"
                            onChange={this.handleEntitySelected}
                            />
                        </label>
                        <label>Check:
                            <Select
                            defaultValue={this.state.defaultCheck}
                            styles={customStyle}
                            options={cond}
                            name="cond"
                            onChange={this.handleCond}
                            />
                        </label>
                        <label>Container Name:
                            <Select
                            defaultValue={this.state.defaultContainer}
                            styles={customStyle}
                            options={lstContainer}
                            name="containerName"
                            onChange={this.handleContainerSelected}
                            />
                        </label>
                    </div>
                }
                
                <label className="label">Value:
                    <input 
                        type="text" 
                        name="condVal"
                        className="form-control"
                        value={this.state.condVal}
                        onChange={this.onChange} />
                </label>

                {!(this.state.showUpdateLogic) ? 
                    <button className="button" onClick={this.createCondition}>
                        Create Condition
                    </button>
                :
                    <button className="button" onClick={this.editCondition}>
                        Edit Condition
                    </button>

                }
            </div>

        var actionContent = 
            <div>
                <label>Select Group:
                    {!(this.state.showUpdateLogic) ? 
                        <Select
                        styles={customStyle}
                        options={this.state.lstGroup}
                        name="groupSelected"
                        onChange={this.handleSelectedGroup}
                        />
                    :
                        <Select
                        defaultValue={this.state.defaultSelectedGroup}
                        styles={customStyle}
                        options={this.state.lstGroup}
                        name="groupSelected"
                        onChange={this.handleSelectedGroup}
                        />
                    }
                </label>
                <label className="label">Action Name:
                    <input 
                        type="text" 
                        name="actionName"
                        className="form-control"
                        value={this.state.actionName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ? 
                    <div>
                        <label>Entity Name:
                            <Select
                            styles={customStyle}
                            options={lstEntity}
                            name="entityName"
                            onChange={this.handleEntitySelected}
                            />
                        </label>
                        <label>Action:
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
                    </div>
                :
                    <div>
                        <label>Entity Name:
                            <Select
                            defaultValue={this.state.defaultEntity}
                            styles={customStyle}
                            options={lstEntity}
                            name="entityName"
                            onChange={this.handleEntitySelected}
                            />
                        </label>
                        <label>Action:
                            <Select
                            defaultValue={this.state.defaultAction}
                            styles={customStyle}
                            options={action}
                            name="action"
                            onChange={this.handleAction}
                            />
                        </label>
                        <label>Container Name:
                            <Select
                            defaultValue={this.state.defaultContainer}
                            styles={customStyle}
                            options={lstContainer}
                            name="containerName"
                            onChange={this.handleContainerSelected}
                            />
                        </label>
                    </div>
                }
                <label className="label">Value:
                    <input 
                        type="text" 
                        name="actionVal"
                        className="form-control"
                        value={this.state.actionVal}
                        onChange={this.onChange} />
                </label>

                {!(this.state.showUpdateLogic) ? 
                    <button className="button" onClick={this.createAction}>
                        Create Action
                    </button>
                :
                    <button className="button" onClick={this.editAction}>
                        Edit Action
                    </button>    
                }
                
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

        var updateLogicContent =
            <div>
                <div>
                    <label> Groups:
                        <Select
                        styles={customStyle}
                        options={lstGroup}
                        name="selectedUpdate"
                        onChange={this.handleUpdateGroup}
                        />
                    </label>
                    <button className="button" onClick={this.showEditConditionGroup}>
                        Edit Group
                    </button>
                </div>
                <div>
                    <label> Action Groups:
                        <Select
                        styles={customStyle}
                        options={lstActionGroup}
                        name="selectedUpdate"
                        onChange={this.handleUpdateActionGroup}
                        />
                    </label>
                    <button className="button" onClick={this.showEditActionGroup}>
                        Edit Action Groups
                    </button>
                </div>
                <div>
                    <label> Conditions:
                        <Select
                        styles={customStyle}
                        options={lstCondition}
                        name="selectedUpdate"
                        onChange={this.handleUpdateCondition}
                        />
                    </label>
                    <button className="button" onClick={this.showEditCondition}>
                        Edit Conditions
                    </button>
                </div>
                <div>
                    <label> Actions:
                        <Select
                        styles={customStyle}
                        options={lstAction}
                        name="selectedUpdate"
                        onChange={this.handleUpdateAction}
                        />
                    </label>
                    <button className="button" onClick={this.showEditAction}>
                        Edit Actions
                    </button>
                </div>
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
                    <button className="button" onClick={this.showUpdateLogic} >
                        Update Logic
                    </button>
                </div>
                : <div></div>}

                {this.state.showUpdateLogic ? 
                    <div>
                        {updateLogicContent}
                    </div>
                :
                    <div></div>
                }

                {this.state.showConditionGroup ? 
                <div>
                    <h3>Condition Group</h3>
                    {conditionGroupContent}
                </div> 
                : <div></div>}
                
                {this.state.showCondition ? 
                <div>
                    <h3>Condition</h3>
                    {conditionContent}
                </div>
                : <div></div>}
                
                {this.state.showAction ? 
                <div>
                    <h3>Action</h3>
                    {actionContent}
                </div>
                : <div></div>}
                
                {this.state.showActionGroup ? 
                <div>                 
                    <h3>Action Group</h3>
                    {actionGroupContent}
                </div> 
                : <div></div>}
                {this.state.showEditLogic ? editLogic : <div></div>}
            </div>
        )
    }

    

}

export default LogicComponent;
