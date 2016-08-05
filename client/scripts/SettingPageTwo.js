import React from 'react';
import {render} from 'react-dom';
import Divider from 'material-ui/Divider';
import FormRadioButtons from './FormRadioButtons';
import FormToggle from './FormToggle';
import Paper from 'material-ui/Paper';

var SettingPageTwo = React.createClass ({
    displayForm: function() {
        var style = {
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
        switch (this.props.state.imgCorrupts == "Campaign phase") {
            case true:
                return (
                    <div style={style.settingPage} >
                        <Paper style={style.section}>
                            <h3 style={style.title}>VM</h3>
                            <Divider style={style.shortLine} />
                            <FormRadioButtons order="1" label="No VM" id="noVm" state={this.props.state} options={this.props.noVmOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <FormToggle order="2" label="VM Not Yours" id="vmNotYours" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                        <Paper style={style.section}>
                            <h3 style={style.title}>Video and Images</h3>
                            <Divider style={style.shortLine} />
                            <FormRadioButtons order="1" label="Image Corrupts" id="imgCorrupts" state={this.props.state} options={this.props.corruptedImageOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <FormToggle order="2" label="Send Pre-recorded Video" id="preRecordedVideo" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                    </div>
                );
            case false:
                return (
                    <div style={style.settingPage} >
                        <Paper style={style.section}>
                            <h3 style={style.title}>VM</h3>
                            <Divider style={style.shortLine} />
                            <FormRadioButtons order="1" label="No VM" id="noVm" state={this.props.state} options={this.props.noVmOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <FormToggle order="2" label="VM Not Yours" id="vmNotYours" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                        <Paper style={style.section}>
                            <h3 style={style.title}>Video and Images</h3>
                            <Divider style={style.shortLine} />
                            <FormRadioButtons order="1" label="Image Corrupts" id="imgCorrupts" state={this.props.state} options={this.props.corruptedImageOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <FormToggle order="2" label="Video Corrupts" id="videoCorrupts" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                            <FormToggle order="3" label="Send Pre-recorded Video" id="preRecordedVideo" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                    </div>
                );
        }
    },
    render: function() {
        return (
            <div>{this.displayForm()}</div>
        );
    }
});

export default SettingPageTwo;