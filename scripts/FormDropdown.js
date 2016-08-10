import React from 'react';
import {render} from 'react-dom';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

var FormDropdown = React.createClass ({
    handleChange: function(e, index, value) {
        console.log("id:", this.props.id);
        console.log("value:", value);
        this.props.updateState(this.props.id, value);
        if (this.props.state.httpSelect == "Not set") {
            this.props.updateState("httpResponse", "");
        }
    },
    render: function() {
        const style = {
            label: {
                display: "inline-block"
            },
            dropdownMenu: {
                display: "inline-block"
            }
        }
        var items = this.props.options.map (function(item, index) {
            return(
                <MenuItem value={item} primaryText={item} key={index} />
            );
        });
        var id = this.props.id;
        return (
            <div>
                <label style={style.label}>{this.props.label}:</label>
                <DropDownMenu value={this.props.state[id]} onChange={this.handleChange}>
                    {items}
                </DropDownMenu>
            </div>
        );
    }
});

export default FormDropdown;