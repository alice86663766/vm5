import React from 'react';
import {render} from 'react-dom';
import Chart from './Chart';
import SettingsBlock from './SettingsBlock';
import $ from 'jquery';
import Paper from 'material-ui/Paper';
var _ = require('lodash');

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

export default EventPanel;