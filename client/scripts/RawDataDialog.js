import React from 'react';
import {render} from 'react-dom';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
var ReactDOM = require('react-dom');

var RawDataDialog = React.createClass({
    handleClose: function(e) {
        this.props.updateRootState("openRawData", false);
        this.props.updateRootState("log", {});
    },
    render: function() {
        return (
            <Dialog modal={false} autoScrollBodyContent={true} open={this.props.openRawData} onRequestClose={this.handleClose}>
                <pre>
                    {JSON.stringify(this.props.log, null, 4)}
                </pre>
            </Dialog>
        );
        //ReactDOM.findDOMNode(this.refs.nameInput).focus();
    }
});

export default RawDataDialog;