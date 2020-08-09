import React, { Component } from 'react';
import Select from 'react-select';


/* This component will be called from the update.js */
/* Logic component that appear in the logic tab when a node is selected
it allow the different parts of the logic to be create and edit.
A node can only have 1 logic object, but that object can have multiple condition groups
The parts of the logic are: 
- condition group - take the name, and paths for when fail/pass the 
    list of conditions
- condition - condition that belong to a condition group, used to 
    determine where to go fail/pass path
- action group - take name, it is a group for action, conidtion 
    group can only have 1 action group
- action - an action between the container of entities and node, 
    action can be subtract, add, multiple, give, take*/ 
class LogicComponent extends Component{
    constructor(props) {
        super(props);

        this.state = {
            condAmount: "",
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
            showUpdateLogic: false,
            showActionGroupErrorMessage: "",

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
        this.closeField = this.closeField.bind(this);

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

    // Should be only called one time per node, which is to create a logic object
    showAddLogic(){
        this.setState({showLogic: true});

        // Create the logic object
        this.props.createLogic(this.props.selectedNodeID)
        
    }

    /* When showConditionGroup is false and this func is called,
     it will show the fields to create a group. Also will close any other fields.
     When showConditionGroup is true and func is called, it will close the fields to add 
     group and reset the states that hold those field values */
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



    /* When showActionGroup is false and this func is called,
     it will show the fields to create an action group. Also will close any other fields.
     When showActionGroup is true and func is called, it will close the fields to add 
     group and reset the states that hold those field values */    
     showActionGroup(){
        if(this.state.showActionGroup){
            this.setState({
                showActionGroup: false,
                actionGroupName: "",
            });
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

            // When creating action group, need to select a condition group to belong to.
            // So this will get the list of condition group
            this.getAllGroup();
        }
    }

    /* When showCondition is set to true, show the fields to create condition.
        When showCondition is set to false, close the fields and clear the stored 
        state values of those field
     */
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
            // Create list of condition group this conditions can belong to
            this.getAllGroup();
        }
    }

    /* When showAction is set to true, show the fields to create action.
        When showAction is set to false, close the fields and clear the stored 
        state values of those field
     */
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
            // Create list of condition groups that this action can belong to
            this.getAllGroup();
        }
    }

    // Edit the logic of the node.
    // Is this really the correct name for it? I find it confusing 
    // between the logic component and a node logic.
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
            
            // Find the current logic selected for this node
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
                showActionGroup: false,
                showUpdateLogic: false,
            });
        }
    }

    // Change showUpdateLogic to false/true which 
    // depend on current value of showUpdateLogic.
    // When change showUpdateLogic to true, show list 
    // of dropdowns used to edit the logic components
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

    /* Show fields to edit condition group and get the default value for those fields.
    Default value are the previous value the user entered for the selected condition group.
    This occur when showConditionGroup is set to true. Otherwise, those fields are close  */
    showEditConditionGroup(){
        if(this.state.showConditionGroup){
            this.setState({ showConditionGroup: false });
        }
        else{
            // Get the selected condition group
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

    /* Show fields to edit action group and get the default value for those fields.
    Default value are the previous value the user entered for the selected action group.
    This occur when showActionGroup is set to true. Otherwise, those fields are close  */
    showEditActionGroup(){
        if(this.state.showActionGroup){
            this.setState({ showActionGroup: false });
        }
        else{
            // Get the selected action group 
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

    /* Show fields to edit condition and get the default value for those fields.
    Default value are the previous value the user entered for the selected condition.
    This occur when showCondition is set to true. Otherwise, those fields are close  */
    showEditCondition(){
        if(this.state.showCondition){
            this.setState({ showCondition: false });
        }
        else{
            // Get the selected condition
            var selected = this.state.selectedConditionUpdateValue;
            
            // Create the defualt option of the check field
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

    /* Show fields to edit action and get the default value for those fields.
    Default value are the previous value the user entered for the selected action.
    This occur when showAction is set to true. Otherwise, those fields are close  */
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

    // Close all of the fields that create/edit the logic component
    // Called when the cancel button is clicked.
    closeField(){
        this.setState({
            showAction: false,
            showEditLogic:false,
            showConditionGroup: false,
            showCondition: false,
            showActionGroup: false,
        });
    }

    // Change the state's value when user change the value in the field
    // The field are give a name which is the same as the statement
    onChange(e){
        this.setState({[e.target.name]: e.target.value});
    }

    // Change the cond value when it's field change.
    // It's field is a dropdown menu with each option beign a dict
    // ex. {value: ..., label: ...}, the label is what the user see
    handleCond(e){
        this.setState({ cond : e.value });
    }

    // Change the action value when it's field change.
    // Action are take, give, add, subtract, and multiple
    // It's field is a dropdown menu with each option beign a dict
    // ex. {value: ..., label: ...}, the label is what the user see
    handleAction(e){
        this.setState({ action : e.value });
    }

    // Handle the change of the selected pass path.
    // The field is a dropdown menu where user can select multiple paths
    // So e is a list of dict
    // ex. {value: ..., label: ...}, the label is what the user see
    handlePass(e){
        var path = [];
        var name = [];

        // Only loop through the list when at least one path is selected
        // e is null when no path is selected
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

    // Handle the change of the selected fail path.
    // The field is a dropdown menu where user can select multiple paths
    // So e is a list of dict
    // ex. {value: ..., label: ...}, the label is what the user see
    handleFail(e){
        var path = [];
        var name = [];
        // e is only null when no path is selected
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

    // This field is a dropdown so e is dict {value: ..., label: ...}
    // When creating condition/action/action group, user need to select 
    // a condition group to belong to. This func handle the user change in condition group.
    handleSelectedGroup(e){
        this.setState({ groupSelected: e.value });
    }

    // This field is a dropdown so e is dict {value: ..., label: ...}
    // When creating condition/action, user need to select an entity container to 
    // compare/do an action to. This func handle the user change in entity container.
    handleEntitySelected(e){
        this.setState({ entityName: e.value });
    }

    // This field is a dropdown so e is dict {value: ..., label: ...}
    // When creating condition/action, user need to select an container container to 
    // compare/do an action to. This func handle the user change in container container.
    handleContainerSelected(e){
        this.setState({ containerName: e.value });
    }

    // Handle change in logic, logic can be BOOL, RAND, ALPHA_SEQ
    handleEditLogic(e){
        this.setState({ logic: e.value });
    }

    // Change the state that will hold the selected condition group for update
    handleUpdateGroup(e){
        this.setState({ 
            selectedGroupUpdateValue: e.value,
            selectedGroupUpdateLabel: e.label
        })
    }

    // Change the state that will hold the selected action group for update
    handleUpdateActionGroup(e){
        this.setState({ 
            selectedActionGroupUpdateValue: e.value,
            selectedActionGroupUpdateLabel: e.label
        })
    }

    // Change the state that will hold the selected condition for update
    handleUpdateCondition(e){
        this.setState({ 
            selectedConditionUpdateValue: e.value,
            selectedConditionUpdateLabel: e.label
        })
    }

    // Change the state that will hold the selected action group for update
    handleUpdateAction(e){
        this.setState({ 
            selectedActionUpdateValue: e.value,
            selectedActionUpdateLabel: e.label
        })
    }

    // Create the condition group
    createGroup(){
        // Create the condition group by passing the data to a functioon in App.js
        this.props.createConditionGroup(this.props.selectedNodeID, this.state.groupName,
            this.state.passPath, this.state.passName, this.state.failPath, this.state.failName);
        
        // Close the fields 
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

        // Create the action group if action group's name is not "" and the selected 
        // condition group do not have an action group
        if(this.state.actionGroupName !== "" && !existed){
            this.props.createActionGroup(this.props.selectedNodeID, 
                this.state.groupSelected, this.state.actionGroupName);
            
            // Close the action group field
            this.showActionGroup();
        }
        else{
            // Show the error message
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
        // Call function from App.js to create condition
        this.props.createCondition(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.cond, this.state.condVal);

        // Make the input field for the condition to close
        this.showCondition();
    }

    // Create an action
    createAction(){
        // Call function from App.js to create action
        this.props.createAction(this.props.selectedNodeID, this.state.groupSelected,
            this.state.actionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.actionVal, this.state.actionGroupName);

        // Make the input field for the action to close
        this.showAction();
    }

    // Submit edit logic, the logic are BOOL, RAND, ALPHA_SEQ
    submitEditLogic(){
        // Func from App.js
        this.props.submitEditLogic(this.props.selectedNodeID, this.state.logic);
    }

    // Edit the logic condition group
    editGroup(){
        // Func from App.js
        this.props.editConditionGroup(this.props.selectedNodeID, this.state.groupName,
            this.state.passPath, this.state.passName, this.state.failPath, this.state.failName, 
            this.state.selectedGroupUpdateValue);
        
        //Close the edit condition group field
        this.showEditConditionGroup();
    }

    //Edit the action group
    editActionGroup(){
        if(this.state.actionGroupName !== ""){
            // Func from App.js
            this.props.editActionGroup(this.props.selectedNodeID, 
                this.state.actionGroupName, this.state.selectedActionGroupUpdateValue);
            
            this.showEditActionGroup();
        }
        else{
            this.setState({ showActionGroupErrorMessage: "Name"});
        }
    }

    // Edit a the selected condition 
    editCondition(){
        // Func from App.js
        this.props.editCondition(this.props.selectedNodeID, this.state.groupSelected,
            this.state.conditionName, this.state.entityName, this.state.containerName,
            this.state.cond, this.state.condVal, this.state.selectedConditionUpdateValue);

        // Make the input field for the condition to close
        this.showEditCondition();
    }

    // Edit the selected action
    editAction(){
        // Func from App.js
        this.props.editAction(this.props.selectedNodeID, this.state.groupSelected,
            this.state.actionName, this.state.entityName, this.state.containerName,
            this.state.action, this.state.actionVal, this.state.actionGroupName,
            this.state.selectedActionUpdateValue);

        // Make the input field for the action to close
        this.showEditAction();
    }

    render(){
        
        // Create list of comparison operation for condition part of logic obj
        // Used in dropdown
        var cond = [{ value: "e==v", label: "=" },
                    { value: "e>=v", label: ">=" },
                    { value: "e>v", label: ">" },
                    { value: "e<=v", label: "<=" },
                    { value: "e<v", label: "<" }]

        // Create list of action for the action part of logic obj
        // Used in dropdown
        var action = [{ value: "ADD", label: "Add" },
                      { value: "SUB", label: "Subtract" },
                      { value: "GIVE", label: "Give" },
                      { value: "TAKE", label: "Take" },
                      { value: "MULTIPLE", label: "Multiple" }]

        // Create list of nodes that entities at this selected node can go
        // Used in dropdown
        var path = []
        this.props.arrows.forEach((arrow) => {
            // check if current path come from the selected node
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

                // Create element of the dropdown
                lst.forEach((node) => {
                    if(node.uid == arrow.to){
                        path.push({ value: node.uid, label: node.name });
                        // value is the uid and label(which the user see) is name of node
                    }
                });

            }
        });

        // Create list of container that this node have
        // Used in dropdown
        var lstContainer = []
        this.props.containers.forEach((c) => {
            if(c.selectedNode == this.props.selectedNodeID){
                lstContainer.push({value: c.name, label: c.name});
            }
        });

        // Create list of container that entities may have by looking at all start node 
        // and getting their container. Used in dropdown
        var lstEntity = []
        this.props.startNode.forEach((s) => {
            s.containers.forEach((c) => {
                lstEntity.push({value: c, label: c});
            })
        });

        // List of logic, used in dropdown
        var logic = [{value: "BOOL", label: "BOOL"},
                    {value: "RAND", label: "RAND"},
                    {value: "ALPHA_SEQ", label: "APLHA_SEQ"}];


        // Dropsdown for the edit option 
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

        // Set width of the dropdown
        const customStyle = {
            valueContainer: () => ({
                width: 100
            })
        }

        // html for creating/editing condition group
        var conditionGroupContent = 
            <div>
                <label class="label">Group Name:
                    <input 
                        type="text" 
                        name="groupName"
                        class="form-control"
                        value={this.state.groupName}
                        onChange={this.onChange} />
                </label>
            {/*this needs to be the UID not the NAME*/}
                {!(this.state.showUpdateLogic) ? 
                    <div>
                        {/* html for creating condition group */}
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
                    </div>
                :
                    <div>
                        {/* html for editing condition group */}
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
                    </div>
                }
                {!(this.state.showUpdateLogic) ? 
                    <div>
                        {/* html for creating condition group */}
                        <button type="button" class="button btn btn-secondary" onClick={this.createGroup}>
                            Create Group
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                :
                    <div>
                        {/* html for editing condition group */}
                        <button type="button" class="button btn btn-secondary" onClick={this.editGroup}>
                            Edit Group
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>

                }
            </div>

        // html for creating/editing action group
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
                
                <label class="label">Action Group Name:
                    <input 
                        type="text" 
                        name="actionGroupName"
                        class="form-control"
                        value={this.state.actionGroupName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ?
                    <div>
                        {this.state.showActionGroupErrorMessage == "Exist" && <p>Condition group can only have one Action group</p>}
                        {this.state.showActionGroupErrorMessage == "Name" && <p>Please enter the Action group's name</p>}
                        <button type="button" class="button btn btn-secondary" onClick={this.createActionGroup}>
                            Create Action Group
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                :
                    <div>
                        {this.state.showActionGroupErrorMessage == "Name" && <p>Please enter the Action group's name</p>}
                        <button type="button" class="button btn btn-secondary" onClick={this.editActionGroup}>
                            Edit Action Group
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                }
            </div>

        // html for creating/editing condition
        var conditionContent = 
            <div>
                <label>Select Group:
                    {!(this.state.showUpdateLogic) ?
                        <div>
                            {/* create condition */}
                            <Select
                            styles={customStyle}
                            options={this.state.lstGroup}
                            name="groupSelected"
                            onChange={this.handleSelectedGroup}
                            />
                        </div>
                    :
                        <div>
                            {/* edit condition */}
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
                <label class="label">Condition Name:
                    <input 
                        type="text" 
                        name="conditionName"
                        class="form-control"
                        value={this.state.conditionName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ?
                    <div>
                        {/* create condition */}
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
                        {/* edit condition */}
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
                
                <label class="label">Value:
                    <input 
                        type="text" 
                        name="condVal"
                        class="form-control"
                        value={this.state.condVal}
                        onChange={this.onChange} />
                </label>

                {!(this.state.showUpdateLogic) ? 
                    <div>
                        {/* create condition */}
                        <button type="button" class="button btn btn-secondary" onClick={this.createCondition}>
                            Create Condition
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                :
                    <div>
                        {/* edit condition */}
                        <button type="button" class="button btn btn-secondary" onClick={this.editCondition}>
                            Edit Condition
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                }
                
            </div>

        // html create/edit action
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
                <label class="label">Action Name:
                    <input 
                        type="text" 
                        name="actionName"
                        class="form-control"
                        value={this.state.actionName}
                        onChange={this.onChange} />
                </label>
                {!(this.state.showUpdateLogic) ? 
                    <div>
                        {/* create action */}
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
                        {/* edit action */}
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
                <label class="label">Value:
                    <input 
                        type="text" 
                        name="actionVal"
                        class="form-control"
                        value={this.state.actionVal}
                        onChange={this.onChange} />
                </label>

                {!(this.state.showUpdateLogic) ?
                    <div> 
                        {/* create action */}
                        <button type="button" class="button btn btn-secondary" onClick={this.createAction}>
                            Create Action
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>
                    </div>
                :
                    <div>
                        {/* edit action */}
                        <button type="button" class="button btn btn-secondary" onClick={this.editAction}>
                            Edit Action
                        </button>
                        <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                            Cancel
                        </button>    
                    </div>
                }
            </div>

        // html to edit the logic option
        var editLogic = 
        <div>
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
            </div>
            <div>
                <button type="button" class="button btn btn-secondary" onClick={this.submitEditLogic}>
                    Submit Edit
                </button>
                <button type="button" class="button btn btn-secondary" onClick={this.closeField}>
                    Cancel
                </button>
            </div>
        </div>

        // html to edit the different component of the logic obj: 
        // condition group, action group, condition, action
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
                    <button type="button" class="button btn btn-secondary" onClick={this.showEditConditionGroup}>
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
                    <button type="button" class="button btn btn-secondary" onClick={this.showEditActionGroup}>
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
                    <button type="button" class="button btn btn-secondary" onClick={this.showEditCondition}>
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
                    <button type="button" class="button btn btn-secondary" onClick={this.showEditAction}>
                        Edit Actions
                    </button>
                </div>
            </div>

        return(
            <div>
                <div>
                    <h3>Logics</h3>
                    <p>Logic control the behavior of each point in the simulation using condition and action.</p>
                    <p>Each point have one logic object, within each logic object:</p>
                    <ul>
                        <li>Condition Group - A group of conditions that decide what path an entities would take. 
                            Logic object can have as many condition group as they want.</li>
                        <li>Action Group - A group of actions that is executed when entities reach this point 
                            and meet the condition set forth. Each condition group have one action group </li>
                        <li>Condition - A condition is a requirement to decided where entities should go</li>
                        <li>Action - An action move resources between containers. They belong to an action group</li>
                    </ul>
                </div>
                {/* Only show the add logic obj button if node don't already have a logic obj */}
                {this.props.logicExist ? 
                    <div></div>
                :
                    <div class="container logic" style={{padding: '10px'}}>
                        <button type="button" class="button btn btn-primary" onClick={this.showAddLogic} >
                            Add Logic
                        </button>
                    </div>
                }

                {(this.state.showLogic || this.props.logicExist) ? 
                <div>
                    <button type="button" class="button btn btn-secondary" onClick={this.showEditLogic} >
                        Edit Logic
                    </button>
                    <button type="button" class="button btn btn-secondary" onClick={this.showConditionGroup} >
                        Add Condition Group
                    </button>
                    <button type="button" class="button btn btn-secondary" onClick={this.showActionGroup} >
                        Add Action Group 
                    </button>
                    <button type="button" class="button btn btn-secondary" onClick={this.showCondition} >
                        Add Condition 
                    </button>
                    <button type="button" class="button btn btn-secondary" onClick={this.showAction} >
                        Add Action
                    </button>
                    <button type="button" class="button btn btn-secondary" onClick={this.showUpdateLogic} >
                        Update Logic
                    </button>
                </div>
                : <div></div>}

                {/* show dropdown to edit the logic obj's part */}
                {this.state.showUpdateLogic ? 
                    <div>
                        {updateLogicContent}
                    </div>
                :
                    <div></div>
                }

                {/* show fields of condition group if showConditionGroup is true */}
                {this.state.showConditionGroup &&
                    <div>
                        <h3>Condition Group</h3>
                        {conditionGroupContent}
                    </div> 
                }
                
                {/* show fields of condition if showCondition is true */}
                {this.state.showCondition &&
                    <div>
                        <h3>Condition</h3>
                        {conditionContent}
                    </div>
                }
                
                {/* show fields of action if showAction is true */}
                {this.state.showAction && 
                    <div>
                        <h3>Action</h3>
                        {actionContent}
                    </div>
                }
                
                {/* show fields of action group if showActionGroup is true */}
                {this.state.showActionGroup && 
                    <div>                 
                        <h3>Action Group</h3>
                        {actionGroupContent}
                    </div>
                }

                {/* show fields to edit logic if showEditLogic is true */}
                {this.state.showEditLogic && editLogic}
                
            </div>
        )
    }
}

export default LogicComponent;
