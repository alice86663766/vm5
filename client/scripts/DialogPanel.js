import React from 'react';
import {render} from 'react-dom';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
var ReactDOM = require('react-dom');

var DialogPanel = React.createClass({
    componentDidMount: function() {
        ReactDOM.findDOMNode(this.refs.nameInput).focus();
    },
    getInitialState: function() {
        return ({
            name: '',
            error: false
        });
    },
    resetState: function() {
        this.setState ({
            name: '',
            error: false
        });
        this.props.updateRootState("openEditName", false);
    },
    handleCloseEdit: function(e) {
        this.resetState();
    },
    handleSubmitName: function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.name == '') {
            this.setState({error: true})
        }
        else {
            this.props.updateRootCidName(this.props.cid, this.state.name);
            this.resetState();
        }
    },
    handleChangeName: function(e) {
        this.setState({name: e.target.value});
    },
    render: function() {
        return (
            <Dialog modal={false} open={this.props.openEditName} onRequestClose={this.handleCloseEdit}>
                <form>
                    <TextField ref={function(input) {
                        if (input != null) {
                            input.focus();
                        }
                    }} hintText="Enter a new name" floatingLabelText="Name" errorText={this.state.error ? "Please enter name" : null} value={this.state.name} onChange={this.handleChangeName} />
                    <FlatButton type="submit" label="Submit" primary={true} onClick={this.handleSubmitName} />
                    <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit} />
                </form>
            </Dialog>
        );
        //ReactDOM.findDOMNode(this.refs.nameInput).focus();
    }
});

export default DialogPanel;