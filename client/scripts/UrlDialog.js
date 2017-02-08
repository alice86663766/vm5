import React from 'react';
import {render} from 'react-dom';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

var UrlDialog = React.createClass({
	getInitialState: function() {
		return ({
			primaryText: '',
			value: '',
			primaryEmpty: false,
			valueEmpty: false
		})
	},
	handleChangePrimaryText: function(e) {
		this.setState({primaryText: e.target.value});
		this.setState({primaryEmpty: false});
	},
	handleChangeValue: function(e) {
		this.setState({value: e.target.value});
		this.setState({valueEmpty: false});
	},
	handleSubmit: function() {
		if (this.state.primaryText == '') {
			this.setState({primaryEmpty: true});
		}
		if (this.state.value == '') {
			this.setState({valueEmpty: true});
		}
		if (this.state.primaryText != '' && this.state.value != '') {
			var len = this.props.serverOptions.length;
			var obj = {
				id: len,
				value: "Set url",
				primaryText: "Set url..."
			}
			var serverOptions = this.props.serverOptions;
			var temp = _.find(serverOptions, {'value': this.state.value});
			if (temp) {
				alert("This url already exist! The option for this url is \"" + temp.primaryText + "\".");
				this.setState({primaryText: ''});
				this.setState({value: ''});
				this.setState({primaryEmpty: false});
				this.setState({valueEmpty: false});
			}
			else {
				serverOptions[len-1].value = this.state.value;
				serverOptions[len-1].primaryText = this.state.primaryText;
				serverOptions.push(obj);
				this.props.updateRootState("serverOptions", serverOptions);
				this.props.updateRootState("urlPrefix", this.state.value);
				this.handleClose();
			}
		}
	},
	handleClose: function() {
		this.setState({primaryText: ''});
		this.setState({value: ''});
		this.setState({primaryEmpty: false});
		this.setState({valueEmpty: false});
        this.props.updateRootState("openUrlInput", false);
    },
	render: function() {
		const actions = [
            <FlatButton label="Submit" primary={true} onTouchTap={this.handleSubmit} />,
            <FlatButton label="Cancel" primary={true} onTouchTap={this.handleClose} />
        ];
		return (
			<Dialog actions={actions} modal={false} open={this.props.openUrlInput} onRequestClose={this.handleClose}>
				<TextField hintText="Enter a name to identify the server" errorText={this.state.primaryEmpty ? "This field is required." : null} floatingLabelText="Server Name" value={this.state.primaryText} onChange={this.handleChangePrimaryText} /><br />
                <TextField hintText="Enter a url" errorText={this.state.valueEmpty ? "This field is required." : null} floatingLabelText="Url" value={this.state.value} onChange={this.handleChangeValue} />
            </Dialog>
		);
	}
});

export default UrlDialog;