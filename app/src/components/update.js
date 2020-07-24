import React, { Component } from 'react';
import Popup from "reactjs-popup";


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
        }
        
        this.onChange = this.onChange.bind(this);
        this.submitInteraction = this.submitInteraction.bind(this);

        this.closeUpdatePopup = this.closeUpdatePopup.bind(this);
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

    render(){

        let content;

        var endNode = this.props.endNode[0];
        var startNode = this.props.startNode[0];
        var s = this.props.stationNode;

        // find type
        var type= this.props.selectedNodeID.substr(0, this.props.selectedNodeID.indexOf('-')); 

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

                        </div>
        }


        return (
            <Popup open={this.props.openUpdate} closeOnDocumentClick = {true} onClose={this.closeUpdatePopup} >

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
