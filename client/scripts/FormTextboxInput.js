import React from 'react';
import {render} from 'react-dom';
import TextField from 'material-ui/TextField';

var FormTextboxInput = React.createClass ({
    handleChange: function(e) {
        this.props.updateState(this.props.id, e.target.value);
    },
    render: function() {
        var key = this.props.id;
        var updatedValue = this.props.state[key];
        return (
            <TextField hintText={this.props.label} floatingLabelText={this.props.label} value={updatedValue} onChange={this.handleChange} />
        );
    }
});

export default FormTextboxInput;