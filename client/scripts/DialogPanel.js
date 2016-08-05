import React from 'react';
import {render} from 'react-dom';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

var DialogPanel = React.createClass({
    getInitialState: function() {
        return ({
            openEditPage: false,
            selectedRows: [],
            name: ''
        });
    },
    resetState: function() {
        this.setState ({
            openEditPage: false,
            selectedRows: [],
            name: ''
        });
    },
    onRowSelection: function(selectedRows) {
        console.log(selectedRows);
        if (selectedRows.length > 0) {
            var row = selectedRows[0];
            this.setState({name: this.props.cids[row].name});
        }
        this.setState({selectedRows: selectedRows});
    },
    handleClose: function(e) {
        this.props.updateRootState("openManager", false);
        this.resetState();
    },
    handleEdit: function() {
        this.setState({openEditPage: true});
    },
    handleCloseEdit: function(e) {
        this.resetState();
    },
    handleSubmitName: function(e) {
        this.setState({openEditPage: false});
        this.props.updateRootCidName(this.state.selectedRows[0], this.state.name);
    },
    handleChangeName: function(e) {
        this.setState({name: e.target.value});
    },
    displayTable: function() {
        const style = {
            noWidth: {
                width: '36px'
            },
            nameWidth: {
                width: '150px'
            }
        };
        return (
            <Table height="250px" fixedHeader={true} selectable={true} multiSelectable={false} onRowSelection={this.onRowSelection}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={true} enableSelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn style={style.noWidth}>No.</TableHeaderColumn>
                        <TableHeaderColumn style={style.nameWidth} tooltip="Display name of the device">Name</TableHeaderColumn>
                        <TableHeaderColumn tooltip="CID of the device">CID</TableHeaderColumn>
                        <TableHeaderColumn tooltip="Details of the device">Details</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={true} deselectOnClickaway={false} showRowHover={true} stripedRows={false}>
                    {this.props.cids.map((row, index) => (
                        <TableRow key={index} selected={this.state.selectedRows.indexOf(row.id) !== -1}>
                            <TableRowColumn style={style.noWidth}>{row.id}</TableRowColumn>
                            <TableRowColumn style={style.nameWidth}>{row.name}</TableRowColumn>
                            <TableRowColumn>{row.cid}</TableRowColumn>
                            <TableRowColumn>{row.details}</TableRowColumn>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    },
    render: function() {
        const actions = [
            <FlatButton label="Edit" primary={true} disabled={this.state.selectedRows.length == 0} onTouchTap={this.handleEdit} />,
            <FlatButton label="Done" primary={true} onTouchTap={this.handleClose} />
        ];
        const changeName = [
            <FlatButton label="Submit" primary={true} onTouchTap={this.handleSubmitName} />,
            <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit} />
        ];
        var row = 0;
        if (this.state.selectedRows.length > 0) {
            row = this.state.selectedRows[0];
        }
        return (
            <Dialog actions={actions} modal={false} open={this.props.openManager} onRequestClose={this.handleClose}>
                {this.displayTable()}
                <Dialog actions={changeName} modal={false} open={this.state.openEditPage} onRequestClose={this.handleCloseEdit}>
                    <TextField hintText="Enter a new name" floatingLabelText="Name" value={this.state.name} onChange={this.handleChangeName} />
                </Dialog>
            </Dialog>
        );
    }
});

export default DialogPanel;