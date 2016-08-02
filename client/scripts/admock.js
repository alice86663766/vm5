import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import $ from 'jquery';

import {GridList, GridTile} from 'material-ui/GridList';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import Drawer from 'material-ui/Drawer';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import {Tabs, Tab} from 'material-ui/Tabs';
import SvgIcon from 'material-ui/SvgIcon';
import FontIcon from 'material-ui/FontIcon';
import ContentSend from 'material-ui/svg-icons/content/send';

import {Grid} from 'react-flexbox-grid/lib/index';
import {Row} from 'react-flexbox-grid/lib/index';
import {Col} from 'react-flexbox-grid/lib/index';

var _ = require('lodash');
import apiMapping from '../apiMapping.json';
import urlMapping from '../urlMapping.json';
var Highcharts = require('highcharts/highstock');

/*
Some Spects:
No speed limit: displayed as 100fps in the graph. Should send "unthrottle".
Poor connection: 10 fps.
Intro poor connection: 3fps. Set initial fps to 3fps.
*/
var Chart = React.createClass({
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
    componentDidMount: function () {
        console.log("In componenet did mount!");
        var options = {
            title: {
                text: 'Web Socket Connection Profile'
            },
            xAxis: {
                title: {
                    text: 'Time(s)'
                },
                min: -3,
                max: this.props.time
            },
            yAxis: {
                title: {
                    text: 'Fps',
                    align: 'high',
                    offset: 10,
                    rotation: 0,
                    y: -25
                },
                min: 0,
                max: 100
            },
            series: [{
                name: 'Time vs fps',
                data: [],
                step: 'left'
            }, {
                type: 'flags',
                name: 'Cloud',
                color: '#333333',
                shape: 'squarepin',
                y: -55,
                data: [],
                showInLegend: false
            }]
        };
        this.chart = new Highcharts[this.props.type || "Chart"](
            this.props.container, 
            options
        );
        this.chart.xAxis[0].setExtremes(-3, this.props.time);
    },
    //Destroy chart before unmount.
    componentWillUnmount: function () {
        this.chart.destroy();
    },
    componentWillReceiveProps: function(props) {
        this.chart.xAxis[0].setExtremes(-3, props.time);
        if ((props.lineData.length > 0 && props.lineData[props.lineData.length-1].x > props.time) || (props.flagData.length > 0 && props.flagData[props.flagData.length-1].x >= props.time)) {
            alert("Time of web setting exceeds game time. Please reset!");
            var commands = [{
                "trigger": "on-connect",
                "type": "unthrottle"
            }]
            var cid = this.props.cid;
            this.postWebRequests("http://campaign.vm5apis.com" + "/v4/pre-schedule", cid, commands);
        }
        else {
            this.chart.series[0].setData(props.lineData);
            this.chart.series[1].setData(props.flagData);
        }
    },
    render: function() {
        //console.log("chart data:", this.props.data);
        return (
            <div id={this.props.container}></div>
        );
    }
});

var SettingsBlock = React.createClass({
    //Return API status
    render: function() {
        var debugStatus = this.props.data.v4;
        if (this.props.data.v3) {
            debugStatus.onetimeTokenStatusCodeCids = this.props.data.v3.onetimeTokenStatusCodeCids;
            debugStatus.corruptedVideoCids = this.props.data.v3.corruptedVideoCids;
            debugStatus.preRecordedCids = this.props.data.v3.preRecordedCids;
        }
        var mapping = this.props.mapping;
        var cid = this.props.cid;
        var settings = [];
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
            section: {
                marginTop: '12px', 
                padding: '16px',
                height: '182px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            }
        }
        _.forEach(debugStatus, function(value, key) {
            if (cid in value && mapping[key]) {
                var setting = mapping[key]["display"];
                if (mapping[key]["textinput"]) {
                    setting = setting.concat(": " + debugStatus[key][cid]);
                }
                settings.push(<li>{setting}</li>);
            }
        });
        return (
            <div style={style.section} >
                <h3 style={style.title} >Settings</h3>
                <Divider style={style.shortLine} />
                <ul>
                    {settings}
                </ul>
            </div>
        );
    }
});

var EventPanel = React.createClass({
    loadApiStatus: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({data: data});
                var debugTimeLimit = '';
                if (data.v4.timelimitCids[this.props.cid]) {
                    //console.log("Load api time");
                    debugTimeLimit = data.v4.timelimitCids[this.props.cid];
                    debugTimeLimit = parseFloat(debugTimeLimit);
                    //console.log(debugTimeLimit);
                    this.setState({time: debugTimeLimit});
                }
                else {
                    this.setState({time: 60});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    loadApiMapping: function() {
        $.ajax({
            url: '/apiMapping.json',
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({mapping: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadApiMapping();
        this.loadApiStatus();
        setInterval(this.loadApiStatus, this.props.pullInterval);
    },
    getInitialState:function() {
        return {time: 60, data: [], mapping: []};
    },
    render: function() {
        var objs = [];
        var lineData = [];
        var flagData = [];
        var lastFps = 100;
        //{x: 0, text:'No speed limit', title:'No speed limit'}
        if (this.state.data.v4 && this.state.data.v4.preScheduleCids && this.state.data.v4.preScheduleCids[this.props.cid]) {
            objs = this.state.data.v4.preScheduleCids[this.props.cid];
            var filtered = [];
            filtered = _.filter(objs, function(obj) {
                if (obj.type == "set-fps" || obj.type == "unthrottle") {
                    return true;
                }
                else {
                    return false;
                }
            });
            if (filtered.length == 0 || filtered[0].trigger != "on-connect") {
                lineData.push({x: -3, y: 100});
            }
            _.forEach(filtered, function(value, key) {
                var obj = {x: 0, y: 0};
                var x = -3;
                var y = 100;
                if (value.delay) {
                    x = (parseInt(value.delay)/1000) - 3;
                }
                if (value.type == "set-fps") {
                    y = parseInt(value.params.fps);
                }
                obj.x = x;
                obj.y = y;
                lastFps = y;
                lineData.push(obj);
            });
            lineData.push({x: this.state.time, y: lastFps});
            filtered = _.filter(objs, function(obj) {
                if (obj.type == "terminate-ws") {
                    return true;
                }
                else if (obj.type == "set-fps") {
                    if (obj.trigger == "on-connect" && obj.params && obj.params.fps == "2") {
                        return true;
                    }
                    else if (obj.trigger == "after-connect" && obj.params && obj.params.fps == "10") {
                        return true;
                    }
                    return false;
                }
                else {
                    return false;
                }
            });
            _.forEach(filtered, function(value, key) {
                var obj = {x: -3, text: "terminate-ws", title: "terminate-ws"};
                if (value.delay) {
                    obj.x = (parseInt(value.delay)/1000) - 3;
                }
                if (value.trigger == "on-connect" && value.params && value.params.fps == "2") {
                    obj.text = "poor connection";
                    obj.title = "Intro poor";
                }
                else if (value.trigger == "after-connect" && value.params && value.params.fps == "10") {
                    obj.text = "poor connection";
                    obj.title = "poor";
                }
                flagData.push(obj);
            });
        }
        const style = {
            eventPanel: {
                height: '625px'
            },
            section: {
                marginTop: '12px', 
                padding: '16px'
            }
        }
        return (
            <Paper style={style.eventPanel}>
                <SettingsBlock cid={this.props.cid} url={this.props.url} pullInterval={this.props.pullInterval} time={this.state.time} data={this.state.data} mapping={this.state.mapping} />
                <Chart container="webSettingChart" cid={this.props.cid} url={this.props.url} time={this.state.time} lineData={lineData} flagData={flagData} />
            </Paper>
        );
    }
});

var Dropdown = React.createClass ({
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

var RadioButtons = React.createClass ({
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

var TextboxInput = React.createClass ({
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

var CheckboxInput = React.createClass ({
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
            <Toggle label={this.props.label} onToggle={this.handleChange} toggled={updatedValue} labelStyle={style.label} />
        );
    }
});

var WebSocketBlock = React.createClass ({
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
            phase: 'intro',
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
        console.log("Added!");
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
                    unthrottleObj.delay = (parseFloat(this.state.startTime) + 3 + parseFloat(this.state.duration))*1000;
                }
                else if (this.state.action == "set-fps") {
                    params.fps = parseFloat(this.state.fps);
                    commandObj["params"] = params;
                    unthrottleObj.delay = (parseFloat(this.state.startTime) + 3 + parseFloat(this.state.duration))*1000;
                }
                commandObj.delay = (parseFloat(this.state.startTime) + 3)*1000;
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
            this.setThrottlable("http://campaign.vm5apis.com" + "/v4/trial/set-next-throttlable/" + cid); //change to real url: delete the first part
            this.resetForm();
            this.postWebRequests("http://campaign.vm5apis.com" + "/v4/pre-schedule", cid, commands);
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
        this.postWebRequests("http://campaign.vm5apis.com" + "/v4/pre-schedule", cid, commands);
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
                <RaisedButton label="Intro" onClick={this.onChangePhase.bind(this, 'intro')} style={style.phaseButton} backgroundColor={this.state.phase == "intro" ? "#eeab58" : "#ffffff"} labelStyle={this.state.phase == "intro" ? style.buttonTextActive : style.buttonText} />
                <RaisedButton label="During game" onClick={this.onChangePhase.bind(this, 'duringGame')} style={style.phaseButton} backgroundColor={this.state.phase == "duringGame" ? "#eeab58" : "#ffffff"} labelStyle={this.state.phase == "duringGame" ? style.buttonTextActive : style.buttonText} />
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
                backgroundColor: '#eeab58',
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
        );
    }
});

var SettingPageOne = React.createClass ({
    displayHTTPField: function() {
        if (this.props.state.httpSelect != "Not set") {
            return (
                <TextboxInput order="4" label="HTTP Response Code" id="httpResponse" state={this.props.state} updateState={this.props.updateState} />
            );
        }
    },
    render: function() {
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
        return (
            <div style={style.settingPage}>
                <Paper style={style.section}>
                    <h3 style={style.title}>General Settings</h3>
                    <Divider style={style.shortLine} />
                    <TextboxInput order="1" label="Language" id="language" state={this.props.state} updateState={this.props.updateState} />
                    <TextboxInput order="2" label="Time Limit" id="timeLimit" state={this.props.state} updateState={this.props.updateState} />
                    <Dropdown order="3" label="HTTP Response" id="httpSelect" state={this.props.state} options={this.props.httpSelectOptions} updateState={this.props.updateState} />
                    {this.displayHTTPField()}
                </Paper>
                <Paper style={style.section}>
                    <h3 style={style.title}>Campaign</h3>
                    <Divider style={style.shortLine} />
                    <RadioButtons order="1" label="Campaign Expired" id="campaignExpired" state={this.props.state} options={this.props.campaignExpiredOptions} updateState={this.props.updateState} />
                </Paper>
            </div>            
        );
    }
});

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
                            <RadioButtons order="1" label="No VM" id="noVm" state={this.props.state} options={this.props.noVmOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <CheckboxInput order="2" label="VM Not Yours" id="vmNotYours" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                        <Paper style={style.section}>
                            <h3 style={style.title}>Video and Images</h3>
                            <Divider style={style.shortLine} />
                            <RadioButtons order="1" label="Image Corrupts" id="imgCorrupts" state={this.props.state} options={this.props.corruptedImageOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <CheckboxInput order="2" label="Send Pre-recorded Video" id="preRecordedVideo" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
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
                            <RadioButtons order="1" label="No VM" id="noVm" state={this.props.state} options={this.props.noVmOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <CheckboxInput order="2" label="VM Not Yours" id="vmNotYours" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                        </Paper>
                        <Paper style={style.section}>
                            <h3 style={style.title}>Video and Images</h3>
                            <Divider style={style.shortLine} />
                            <RadioButtons order="1" label="Image Corrupts" id="imgCorrupts" state={this.props.state} options={this.props.corruptedImageOptions} updateState={this.props.updateState} />
                            <Divider style={style.longLine} />
                            <CheckboxInput order="2" label="Video Corrupts" id="videoCorrupts" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
                            <Divider style={style.longLine} />
                            <CheckboxInput order="3" label="Send Pre-recorded Video" id="preRecordedVideo" state={this.props.state} onChangeChecked={this.props.onChangeChecked} />
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

var SettingPageThree = React.createClass ({
    render: function() {
        var style = {
            settingPage: {
                height: '589px'
            },
        }
        return (
            <div style={style.settingPage}>
                <WebSocketBlock cid={this.props.cid} />
            </div>            
        );
    }
});

var SettingForm = React.createClass ({
    getInitialState: function() {
        return {
            page: 1, 
            language: '', 
            timeLimit:'' , 
            httpResponse:'',
            httpSelect:'Not set', 
            noVm:'Not set', 
            campaignExpired: 'Not set', 
            vmNotYours: false, 
            imgCorrupts:'Not set', 
            videoCorrupts: false, 
            preRecordedVideo: false,
            mapping: []
        };
    },
    resetState: function(currentPage) {
        this.setState({
            page: currentPage, 
            language: '', 
            timeLimit:'' , 
            httpResponse:'',
            httpSelect:'Not set',  
            noVm:'Not set', 
            campaignExpired: 'Not set', 
            vmNotYours: false, 
            imgCorrupts:'Not set', 
            videoCorrupts: false, 
            preRecordedVideo: false,  
            mapping: []
        });
    },
    displayForm: function(httpSelectOptions, campaignExpiredOptions, noVmOptions, corruptedImageOptions) {
        switch (this.state.page) {
            case 1:
                return (
                    <SettingPageOne state={this.state} updateState={this.updateState} onChangeChecked={this.onChangeChecked} httpSelectOptions={httpSelectOptions} campaignExpiredOptions={campaignExpiredOptions} />
                );
            case 2:
                return (
                    <SettingPageTwo state={this.state} updateState={this.updateState} onChangeChecked={this.onChangeChecked} noVmOptions={noVmOptions} corruptedImageOptions={corruptedImageOptions} />
                );
            case 3:
                return (
                    <SettingPageThree cid={this.props.cid} />
                );
        }
    },
    updateState: function(id, value) {
        var obj = {};
        obj[id] = value;
        this.setState(obj);
        //console.log(this.state);
    },
    onChangeChecked: function(id) {
        var obj = {};
        obj[id] = !this.state[id];
        this.setState(obj);
        //console.log(this.state);
    },
    sendRequest: function(url) {
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
    webSocketRequest: function() {
        //after submission
        //read webTime and webActions. re-generate new mapping (generate error when !no time limit but has time)
        //generate urls for each request at specific times. stored in an array
        //generate step chart 
        //handle reset
        //magic algorithm that makes this happen
        /*var createItems = this.props.items.map(function(item, index) {
            return (
                <WebSocketItem handleDelete={this.props.handleDelete} key={index} index={index} item={item} />
            );
        }.bind(this));*/

        //first make it throttable
        
        /*
        var url = "/v3/trial/set-next-throttlable/:cid";
        url = url.replace(/:cid/, cid);
        url = "http://campaign.vm5apis.com" + url; //change to real url: delete this line
        this.sendRequest(url);

        var objs = this.state.webItems;
        var cid = this.props.cid;
        var mapping = this.props.mapping;
        var requestArray = [];
        _.forEach(objs, function(obj) {
            if (obj.time == "0" && obj.action == "Poor connection") {

            }
        });*/
    },
    prepareAndSendRequest: function() {
        var stateObj = this.state;
        var cid = this.props.cid;
        var mapping = this.props.mapping;
        _.forEach(stateObj, function(value, key) {
            if (key in mapping && value && (value != "Not set")) { //only look at attributes that are set
                var url = '';
                var subObj = mapping[key]; //there are "type" and "url" in subObj
                url = subObj.url;
                if ((subObj.type == "select") && (typeof url[value] != 'undefined')) {
                    url = url[value];
                }
                if (key == "httpResponse" && this.state.httpSelect != 'Not set') {
                    console.log("http Select:", this.state.httpSelect);
                    var selection = this.state.httpSelect;
                    url = url[selection];
                    console.log("url:", url);
                }
                url = url.replace(/:cid/, cid);
                if (subObj.type == "textInput") {
                    url = url.replace(/:lang/, value);
                    url = url.replace(/:n/, value);
                    url = url.replace(/:code/, value);
                }
                console.log("url:", url);
                url = "http://campaign.vm5apis.com" + url; //change to real url: delete this line
                this.sendRequest(url);
            }
        }.bind(this));

    },
    handleClick: function(input) {
        this.setState({page: input});
        console.log(input);
    },
    handleReset: function(e) {
        this.resetState(this.state.page);
        var url = "http://campaign.vm5apis.com" + "/aux/reset/" + this.props.cid; //change to real url: delete the first string
        this.sendRequest(url);
    },
    /*onSubmitSetRoot: function(cid) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data){
                var debugTimeLimit = 60;
                if (data.timelimitCids[cid]) {
                    debugTimeLimit = data.timelimitCids[cid];
                }
                console.log("updated should succeed");
                console.log("Debug time limit:", debugTimeLimit);
                var lastPoint = [debugTimeLimit];
                var index = this.state.webItems.length - 1;
                lastPoint.push(this.newPoint(index));
                console.log("pushed array:", lastPoint);
                this.props.updateRootState("newPoint", lastPoint); 
                this.resetState(this.state.page);
                //this.webSocketRequest();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },*/
    handleSubmit: function(e) {
        e.preventDefault();
        this.prepareAndSendRequest();
        var cid = this.props.cid;
        //this.onSubmitSetRoot(cid);
        console.log("Submitted");
    },
    displayButton: function() {
        const style = {
            buttonActive: {
                backgroundColor: '#00bcd4'
            },
        };
        return (
            <div>
                <FlatButton type="button" id="1" onClick={() => this.handleClick(1)} style={this.state.page == 1 ? style.buttonActive : null} >1</FlatButton>
                <FlatButton type="button" id="2" onClick={() => this.handleClick(2)} style={this.state.page == 2 ? style.buttonActive : null} >2</FlatButton>
                <FlatButton type="button" id="3" onClick={() => this.handleClick(3)} style={this.state.page == 3 ? style.buttonActive : null} >3</FlatButton>
            </div>
        );
    },
    displayResetSubmitButtons: function() {
        const style = {
            submit: {
                backgroundColor: '#eeab58',
                color: '#ffffff'
            },
            reset: {
                backgroundColor: '#999999',
                color: '#ffffff'
            }
        };
        if (this.state.page == 1 || this.state.page == 2) {
            return (
                <div>
                    <FlatButton type="submit" style={style.submit} icon={<ContentSend />}>Submit </FlatButton>
                    <FlatButton type="reset" onClick={this.handleReset} style={style.reset}>Reset</FlatButton>
                </div>
            );
        }
    },
    render: function() {
        var httpSelectOptions = ['Not set', 'Campaign phase', 'Trial phase', 'Onetime token'];
        var campaignExpiredOptions = ['Not set', 'Campaign phase', 'Trial phase'];
        var noVmOptions = ['Not set', 'Campaign phase', 'Trial phase', 'Web connection phase'];
        var corruptedImageOptions = ['Not set', 'Campaign phase', 'Trial phase'];
        var webSettings = [];
        var currentPage = this.state.page;
        var buttons = [];
        const style = {
            form: {
                height: '677px'
            },
        };
        return (
            <form onSubmit={this.handleSubmit} style={style.form} >
                {this.displayForm(httpSelectOptions, campaignExpiredOptions, noVmOptions, corruptedImageOptions)}
                <Row center="xs">
                    <Col xs={9}>
                        {this.displayResetSubmitButtons()}
                        {this.displayButton()}
                    </Col>
                </Row>   
            </form>    
        );
    }
});

var CidPanel = React.createClass ({
    handleChange: function(e, value) {
        console.log("called");
        this.props.updateRootState("activeCid", value);
    },
    render: function() {
        const style = {
            active: {
                backgroundColor: '#cccccc',
                fontSize: '10',
                fontFamily: 'monospace',
                cursor: 'pointer', 
                width: '256px'
            },
            normal: {
                backgroundColor: '#ffffff',
                fontSize: '10',
                fontFamily: 'monospace',
                cursor: 'pointer',
                width: '256px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            }
        };
        var cidNodes = this.props.cids.map(function(cid) {
            var displayCid = cid.cid.substring(0, 25) + "...";
            if (this.props.activeCid == cid.cid) {
                return(
                    <MenuItem key={cid.id} value={cid.cid} primaryText={displayCid} rightIcon={<ArrowDropRight />} style={style.active}/>
                );
            }
            else {
                return(
                    <MenuItem key={cid.id} value={cid.cid} primaryText={displayCid} style={style.normal}/>
                );
            }
        }.bind(this));
        return (
            <Drawer open={true}>
                <Menu onChange={this.handleChange} >
                    <MenuItem style={style.title} >Cid Panel</MenuItem>
                    <Divider />
                    {cidNodes}
                </Menu>
            </Drawer>
        );
    }
});

var ContentBox = React.createClass({
    loadUrlMapping: function() {
        $.ajax({
            url: '/urlMapping.json',
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({urlMapping: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            cids:[{
                    id: 1,
                    cid: '5054bfde-6108-4ff7-9dc9-193511f407ea'
                }, {
                    id: 2,
                    cid: '5e53695f-74cf-450f-86e1-11a9fa708398'
                }, {
                    id: 3,
                    cid: '12344441-74cf-450f-86e1-11a9fa708398'
                }, {
                    id: 4,
                    cid: '232f9ee9-74cf-450f-86e1-11a9fa708398'
                }, {
                    id: 5,
                    cid: '88792378-74cf-450f-86e1-11a9fa708398'
                }], 
            activeCid: '5054bfde-6108-4ff7-9dc9-193511f407ea',
            urlMapping: []
        };
    },
    componentDidMount: function() {
        this.loadUrlMapping();
    },
    updateRootState: function(key, value) {
        var obj = {};
        obj[key] = value;
        this.setState(obj);
    },
    render: function() {
        return (
            <MuiThemeProvider>
                <div>
                    <Row>
                        <Col xs={12} md={3} >
                            <CidPanel cids={this.state.cids} activeCid={this.state.activeCid} updateRootState={this.updateRootState}/>
                        </Col>
                        <Col xs={12} md={9} >
                            <Row>
                                <Col xs={6} style={{padding: '20px'}} >
                                    <SettingForm mapping={this.state.urlMapping} cid={this.state.activeCid} url={this.props.url} updateRootState={this.updateRootState} setRootTime={this.setRootTime} />
                                </Col>
                                <Col xs={6} style={{padding: '20px'}} >
                                    <EventPanel cid={this.state.activeCid} url={this.props.url} pullInterval={500}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </MuiThemeProvider>
        );
    }
});

render(
  <ContentBox url="http://campaign.vm5apis.com/aux/debug/M" />, document.getElementById('content') //change to real url
);