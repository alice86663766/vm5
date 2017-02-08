import React from 'react';
import {render} from 'react-dom';
import Toggle from 'material-ui/Toggle';

var FormToggle = React.createClass ({
    handleChange: function(e) {
        this.props.onChangeChecked(this.props.id);
        //console.log(e.target.checked);
    },
    render: function() {
        var style = {
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px', 
                fontWeight: '400'
            }
        };
        var key = this.props.id;
        var updatedValue = this.props.state[key];
        return (
            <Toggle label={this.props.label} onToggle={this.handleChange} toggled={updatedValue} disabled={this.props.disabled} labelStyle={style.label} />
        );
    }
});

export default FormToggle;