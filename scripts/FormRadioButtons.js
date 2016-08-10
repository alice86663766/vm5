import React from 'react';
import {render} from 'react-dom';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

var FormRadioButtons = React.createClass ({
    handleChange: function(e, value) {
        console.log("id:", this.props.id);
        console.log("value:", value);
        this.props.updateState(this.props.id, value);
        if (this.props.state.imgCorrupts == "Campaign phase") {
            this.props.updateState("videoCorrupts", false);
        }
    },
    render: function() {
        var style = {
            radioButton: {
                display: 'inline-block',
                width: '50%',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '13px',
                fontWeight: '400'
            },
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                fontWeight: '400'
            }
        };
        var items = this.props.options.map (function(item, index) {
            return(
                <RadioButton value={item} label={item} key={index} style={style.radioButton} />
            );
        });
        var id = this.props.id;
        return (
            <div>
                <label style={style.label}>{this.props.label}:</label>
                <RadioButtonGroup name={this.props.label} valueSelected={this.props.state[id]} defaultSelected={this.props.options[0]} onChange={this.handleChange}>
                    {items}
                </RadioButtonGroup>
            </div>
        );
    }
});

export default FormRadioButtons;