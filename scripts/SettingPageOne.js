import React from 'react';
import {render} from 'react-dom';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import FormDropdown from './FormDropdown';
import FormRadioButtons from './FormRadioButtons';
import FormTextboxInput from './FormTextboxInput';

var SettingPageOne = React.createClass ({
    displayHTTPField: function() {
        if (this.props.state.httpSelect != "Not set") {
            return (
                <FormTextboxInput order="4" label="HTTP Response Code" id="httpResponse" state={this.props.state} updateState={this.props.updateState} />
            );
        }
    },
    render: function() {
        const style = {
            longLine: {
                display: 'block',
                margin: '10px 0px 10px 0px'
            },
            shortLine: {
                display: 'block',
                margin: '10px 0px 10px 0px',
                width: '50%'
            },
            settingPage: {
                height: '553px'
            },
            section: {
                marginTop: '12px', 
                padding: '16px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            }
        }
        return (
            <div style={style.settingPage}>
                <Paper style={style.section}>
                    <h3 style={style.title}>General Settings</h3>
                    <Divider style={style.shortLine} />
                    <FormTextboxInput order="1" label="Language" id="language" state={this.props.state} updateState={this.props.updateState} />
                    <FormTextboxInput order="2" label="Time Limit" id="timeLimit" state={this.props.state} updateState={this.props.updateState} />
                    <FormDropdown order="3" label="HTTP Response" id="httpSelect" state={this.props.state} options={this.props.httpSelectOptions} updateState={this.props.updateState} />
                    {this.displayHTTPField()}
                </Paper>
                <Paper style={style.section}>
                    <h3 style={style.title}>Campaign</h3>
                    <Divider style={style.shortLine} />
                    <FormRadioButtons order="1" label="Campaign Expired" id="campaignExpired" state={this.props.state} options={this.props.campaignExpiredOptions} updateState={this.props.updateState} />
                </Paper>
            </div>            
        );
    }
});

export default SettingPageOne;