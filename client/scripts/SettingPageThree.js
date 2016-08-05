import React from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
import ContentSend from 'material-ui/svg-icons/content/send';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Row, Col} from 'react-flexbox-grid/lib/index';
var _ = require('lodash');

var SettingPageThree = React.createClass ({
    getInitialState: function() {
        return {
            phase: 'intro',
            action: 'poor',
            startTime: '',
            duration: '',  
            fps: '',
            commands: []
        };
    },
    resetForm: function() {
        this.setState({
            action: 'poor',
            startTime: '',
            duration: '', 
            fps: ''
        });
    },
    setThrottlable: function(url) {
        //console.log("sent!");
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            error: function(xhr, status, err) {
                alert("Error!!");
            }.bind(this)
        });
    },
    handleChange: function (e, key) {
      var obj = {};
      obj[key] = e.target.value;
      this.setState(obj);
    },
    checkValidity: function(displayName, key, noError) {
        var value = this.state[key];
        var obj = {};
        obj[key] = '';
        if (!value) {
            alert("Please enter '" + displayName + "'!" );
            this.setState(obj);
            noError.noError = false;
        }
        else if (isNaN(value) || value < 0) {
            alert("Please enter a valid number for '" + displayName + "'!");
            this.setState(obj);
            noError.noError = false;
        }
    },
    postWebRequests: function (url, cid, commands) {
        var data = {
            "cid": cid,
            "commands": commands
        }
        $.ajax({
            url : url,
            type: "POST",
            data: data,
            success: function(data){
                console.log("ajax post return data:", data);
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Error!!");
            }.bind(this)
        });
    },
    deleteRepeatCommand: function(commands, obj) {
        var conflict = false;
        //if (commands.length > 0) {
        commands = _.reject(commands, function(command) {
            if (command.trigger == "after-connect") {
                if (obj.type == "set-fps") {
                    return ((command.trigger == obj.trigger) && (command.type == "unthrottle" || command.type == "set-fps") && (command.delay == obj.delay))
                }
                else if ((command.trigger == obj.trigger) && (command.type == "set-fps") && (obj.type == "unthrottle") && (command.delay == obj.delay)) {
                    conflict = true;
                }
                return ((command.trigger == obj.trigger) && (command.type == obj.type) && (command.delay == obj.delay));
            }
            else {
                return ((command.trigger == obj.trigger) && (command.type == obj.type));
            }
        });
        if (!conflict) {
            commands.push(obj);
            console.log("pushed!", obj, commands);
        }
        else if (conflict) {
            console.log("conflict!")
        }
        return commands;
    },
    handleAdd: function (e) {
        e.preventDefault();
        var passByReference = {noError: true};
        if (this.state.phase == "duringGame") {
            this.checkValidity("Start Time", "startTime", passByReference);
            if (this.state.action == "poor" || this.state.action == "set-fps") {
                this.checkValidity("Duration", "duration", passByReference);
                if (this.state.action == "set-fps") {
                    this.checkValidity("Fps", "fps", passByReference);
                }
            }
        }
        var startTime = 0;
        var duration = 0;
        var debugTimeLimit = parseFloat(this.props.debugTimeLimit);
        if (this.state.startTime) {
            startTime = parseFloat(this.state.startTime);
        }
        if (this.state.duration) {
            duration = parseFloat(this.state.duration);
        }
        if ((startTime + duration) > debugTimeLimit) {
            if (startTime > debugTimeLimit) {
                passByReference.noError = false;
                alert("Your start time exceeds time limit. Please do it again.");
            }
            else {
                duration = debugTimeLimit - startTime;
                if (duration == 0) {
                    passByReference.noError = false;
                    alert("Please don't set ftp at the end of game.");
                }
            }
        }
        if (passByReference.noError) {
            var commands = this.state.commands;
            var commandObj = {
                "trigger": "after-connect",
                "type": this.state.action,
                "delay": 0
            };
            var unthrottleObj = {
                "trigger": "after-connect",
                "type": "unthrottle",
                "delay": 0
            }
            var params = {"fps": 0};
            if (this.state.phase == "intro") {
                if (this.state.action == "poor") {
                    commandObj = {
                        "trigger": "on-connect",
                        "type": "set-fps",
                        "params": {
                            "fps": 2
                        }
                    }
                    unthrottleObj.delay = 3000;
                    commands = this.deleteRepeatCommand(commands, commandObj);
                    commands = this.deleteRepeatCommand(commands, unthrottleObj);
                }
                else {
                    commandObj.delay = 1000;
                    commands = this.deleteRepeatCommand(commands, commandObj);
                }
            }
            else if (this.state.phase == "duringGame") {
                if (this.state.action == "poor") {
                    commandObj.type = "set-fps";
                    params.fps = 10;
                    commandObj["params"] = params;
                    unthrottleObj.delay = (startTime + 3 + duration)*1000;
                }
                else if (this.state.action == "set-fps") {
                    params.fps = parseFloat(this.state.fps);
                    commandObj["params"] = params;
                    unthrottleObj.delay = (startTime + 3 + duration)*1000;
                }
                commandObj.delay = (startTime + 3)*1000;
                commands = this.deleteRepeatCommand(commands, commandObj);
                if (unthrottleObj.delay != 0) {
                    commands = this.deleteRepeatCommand(commands, unthrottleObj);
                }
            }
            commands.sort(function(a, b) {
                if (b.trigger == a.trigger) {
                    if (a.delay < b.delay) {
                        return -1;
                    }
                    else if (a.delay > b.delay) {
                        return 1;
                    }
                    return 0;
                }
                //return b.trigger < a.trigger ? -1 : b.trigger > a.trigger ? 1 : 0;
                if (b.trigger < a.trigger) {
                    return -1;
                }
                if (b.trigger > a.trigger) {
                    return 1;
                }
            });
            this.setState({commands: commands});
            //Start sending requests to server
            var cid = this.props.cid;
            this.setThrottlable(this.props.urlPrefix + "/v4/trial/set-next-throttlable/" + cid); //change to real url: delete the first part
            this.postWebRequests(this.props.urlPrefix + "/v4/pre-schedule", cid, commands); //change to real url: delete the first part
            console.log("Added!");
            this.resetForm();
        }
    },
    handleReset: function(e) {
        e.preventDefault();
        console.log("reset!");
        this.resetForm();
        this.setState({commands: []});
        var commands = [{
            "trigger": "on-connect",
            "type": "unthrottle"
        }]
        var cid = this.props.cid;
        this.postWebRequests(this.props.urlPrefix + "/v4/pre-schedule", cid, commands);
    },
    /*handleDelete: function(index) {
        var items = this.props.state.webItems;
        items.splice(index, 1);
        this.props.onWebSubmit(items);
    },*/
    onChangeText: function(key, e) {
        var obj = {};
        obj[key] = e.target.value;
        this.setState(obj);
        console.log(this.state[key]);
    },
    onChangeSelect: function(e, value) {
        this.setState({action: value});
        this.setState({startTime: '', duration: '', fps: ''});
        console.log(value, "selected");
    },
    onChangePhase: function(key, e) {
        this.setState({phase: key});
        console.log(this.state);
    },
    displayPhaseButton: function() {
        const style = {
            div: {
                display: 'inline-block'
            },
            phaseButton: {
                margin: 12,
            },
            buttonText: {
                textTransform: 'capitalize'
            },
            buttonTextActive: {
                textTransform: 'capitalize',
                color: "#ffffff"
            }
        }
        return (
            <div style={style.div} >
                <RaisedButton label="Intro" onClick={this.onChangePhase.bind(this, 'intro')} style={style.phaseButton} backgroundColor={this.state.phase == "intro" ? "#fc981c" : "#ffffff"} labelStyle={this.state.phase == "intro" ? style.buttonTextActive : style.buttonText} />
                <RaisedButton label="During game" onClick={this.onChangePhase.bind(this, 'duringGame')} style={style.phaseButton} backgroundColor={this.state.phase == "duringGame" ? "#fc981c" : "#ffffff"} labelStyle={this.state.phase == "duringGame" ? style.buttonTextActive : style.buttonText} />
            </div>
        );
    },
    displayTextFields: function() {
        if (this.state.phase == "duringGame") {
            if (this.state.action == "poor") {
                return (
                    <div>
                        <TextField hintText="Start Time (sec)" floatingLabelText="Start Time" value={this.state.startTime} onChange={this.onChangeText.bind(this, "startTime")} />
                        <TextField hintText="Duration (sec)" floatingLabelText="Duration" value={this.state.duration} onChange={this.onChangeText.bind(this, "duration")} />
                    </div>
                )
            }
            else if (this.state.action == "set-fps") {
                return (
                    <div>
                        <TextField hintText="Start Time (sec)" floatingLabelText="Start Time" value={this.state.startTime} onChange={this.onChangeText.bind(this, "startTime")} />
                        <TextField hintText="Duration (sec)" floatingLabelText="Duration" value={this.state.duration} onChange={this.onChangeText.bind(this, "duration")} />
                        <TextField hintText="Fps" floatingLabelText="Fps" value={this.state.fps} onChange={this.onChangeText.bind(this, "fps")} />
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <TextField hintText="Start Time (sec)" floatingLabelText="Start Time" value={this.state.startTime} onChange={this.onChangeText.bind(this, "startTime")} />
                    </div>
                )
            }
        }
    },
    render: function() {
        const style = {
            settingPage: {
                height: '589px'
            },
            longLine: {
                display: 'block',
                margin: '10px 0px 10px 0px'
            },
            shortLine: {
                display: 'block',
                margin: '10px 0px 10px 0px',
                width: '50%'
            },
            section: {
                marginTop: '12px', 
                padding: '16px',
                height: '507px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            },
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px', 
                fontWeight: '400'
            },
            radioButton: {
                width: '50%',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '13px',
                fontWeight: '400'
            },
            textField: {
                display: 'inline-block'
            },
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                fontWeight: '400'
            },
            add: {
                backgroundColor: '#fc981c',
                color: '#ffffff'
            },
            reset: {
                backgroundColor: '#999999',
                color: '#ffffff'
            },
            innerBlock: {
                height: '477px'
            },
            phaseButton: {
                margin: 12,
            },
            buttonText: {
                textTransform: 'capitalize'
            },
            buttonActive: {
                margin: 12,
                backgroundColor: '#c8caea'
            }
        }
        return (
            <div style={style.settingPage}>
                <Paper style={style.section}>
                    <h3 style={style.title}>Web Socket/Connection</h3>
                    <Divider style={style.shortLine} />
                    <div style={style.innerBlock}>
                        <label style={style.label}>Choose a phase:</label>
                        {this.displayPhaseButton()}
                        <label style={style.label}>Choose an action:</label>
                        <RadioButtonGroup name="webSettings" valueSelected={this.state.action} onChange={this.onChangeSelect}>
                            <RadioButton value="poor" label="Poor connection" style={style.radioButton} />
                            <RadioButton value="set-fps" label="Set fps..." disabled={this.state.phase == "intro" ? true : false} style={style.radioButton} />
                            <RadioButton value="terminate-ws" label="Terminate web socket" style={style.radioButton} />
                        </RadioButtonGroup>
                        {this.displayTextFields()}
                    </div>
                    <Row center="xs">
                        <Col xs={9}>
                            <FlatButton onClick={this.handleAdd} style={style.add} icon={<ContentSend />}>Add </FlatButton>
                            <FlatButton onClick={this.handleReset} style={style.reset}>Reset</FlatButton> 
                        </Col>
                    </Row>
                </Paper>
            </div>            
        );
    }
});

export default SettingPageThree;