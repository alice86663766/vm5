import React from 'react';
import {render} from 'react-dom';
import Websocket from './Websocket';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
var moment = require('moment');
var _ = require('lodash');

var LogPanel = React.createClass({
    getInitialState: function() {
        return {
            cidLogPairs: {},
            sessionId: '',
            webTimer: null
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        /*var time = moment().valueOf();
        var interval = time - this.state.timer;
        console.log(interval);*/
        if (nextProps.state.activeCid != this.props.state.activeCid) {
            console.log("true, activeCid changed");
            return true;
        }
        /*if (interval < 800) {
            console.log("false, interval < 800")
            return false;
        }*/
        if (this.props.state.activeCid) {
            console.log(this.state.cidLogPairs[this.props.state.activeCid].length, nextState.cidLogPairs[this.props.state.activeCid].length);
            return this.state.cidLogPairs[this.props.state.activeCid].length < nextState.cidLogPairs[this.props.state.activeCid].length;
        }
        console.log("true");
        return true;
        //return (this.props.state.activeCid != nextProps.state.activeCid);
    },
    handleOpen: function(ws) {
        this.setState({webTimer: setInterval(function (){
            ws.send('whatever');
            console.log("sent whatever");
        }, 3000)});
    },
    handleClose: function() {
        clearInterval(this.state.webTimer);
    },
    updateCidLogPair: function(cid, logs) {
        var sortedLogs = _.sortBy(logs, function(log) { return log["@data"]["@client_epoch_time"]; });
        var obj = _.cloneDeep(this.state.cidLogPairs);
        obj[cid] = sortedLogs;
        this.setState({cidLogPairs: obj});
    },
    addNewCid: function(result, cid, index) {
        var name = result.ua.ua.substring(0, 11) + " (" + cid.substring(0, 8) + ")";
        var details = result.ua.ua;
        var sessionId = result["@data"]["@couple_tokens"].adplay_session_id;
        var sdkVersion = result["@data"]["common"].sdkvs;
        var uiVersion = result["@data"]["common"].sdkvs;
        var adId = result["@data"]["common"].ad_id;
        var logs = [result];
        var time = moment().valueOf();
        this.updateCidLogPair(cid, logs);
        //this.setState({timer: time});
        if (result.ua.browser.name) {
            //name = result.ua.browser.name + " (" + cid.substring(0, 8) + ")";
            name = result.ua.browser.name + " (" + cid.substring(0, 8) + ")";
            details = result.ua.os.name + " " + result.ua.os.version + ", " + result.ua.browser.name;
        }
        if (result.ua.device.vendor) {
            name = result.ua.device.vendor + ", " + result.ua.browser.name + " (" + cid.substring(0, 8) + ")";
            details = result.ua.device.vendor + " " + result.ua.device.model + ", " + result.ua.os.name + " " + result.ua.os.version + ", " + result.ua.browser.name;
        }
        this.props.pushCid(cid, name, details, sessionId, sdkVersion, uiVersion, adId);
        if (this.props.state.activeCid == '') {
            this.props.updateRootState("activeCid", cid);
        }
        //console.log(cid, name, details, sessionId, sdkVersion, uiVersion, adId, logs);
    },
    handleData: function(data) {
        let result = JSON.parse(data);
        console.log(result);
        if (!result.adplay) {
            var cid = result["@data"]["@profile_tokens"].cid;
            var index = _.findIndex(this.props.state.cids, function(item) {
                return (item.cid == cid);
            });
            if (index < 0) {
                this.addNewCid(result, cid, index);
            }
            else {
                var sessionId = result["@data"]["@couple_tokens"].adplay_session_id;
                var sdkVersion = result["@data"]["common"].sdkvs;
                var uiVersion = result["@data"]["common"].sdkvs;
                var adId = result["@data"]["common"].ad_id;
                if (sessionId != this.props.state.cids[index].sessionId) {
                    this.props.updateRootCidDetails(index, "sessionId", sessionId);
                    this.props.updateRootCidDetails(index, "uiVersion", uiVersion);
                    this.props.updateRootCidDetails(index, "sdkVersion", sdkVersion);
                    this.props.updateRootCidDetails(index, "adId", adId);
                    //this.props.updateRootCidDetails(index, "logs", [result]);
                    var time = moment().valueOf();
                    this.updateCidLogPair(cid, [result]);
                    //this.setState({timer: time});
                }
                else if (sessionId == this.props.state.cids[index].sessionId) {
                    //var logs = this.props.state.cids[index].logs;
                    var logs = _.cloneDeep(this.state.cidLogPairs[cid]);
                    logs.push(result);
                    //this.props.updateRootCidDetails(index, "logs", logs);
                    var time = moment().valueOf();
                    this.updateCidLogPair(cid, logs);
                    //this.setState({timer: time});
                    if (result["@data"]["@event_name"] == "intro" || this.props.state.cids[index].uiVersion != result["@data"]["common"].sdkvs) {
                        this.props.updateRootCidDetails(index, "uiVersion", sdkVersion);
                    }
                }
            }
        }
    },
    onClickRaw: function(row, e) {
        this.props.updateRootState("openRawData", true);
        this.props.updateRootState("log", this.state.cidLogPairs[this.props.state.activeCid][row]);
    },
    displayTable: function() {
        const style = {
            noWidth: {
                width: '64px'
            },
            timeWidth: {
                width: '200px'
            },
            typeWidth: {
                width: '150px'
            },
            nameWidth: {
                width: '240px'
            },
            buttonText: {
                textTransform: 'capitalize',
                color: "#ffffff"
            },
            div: {
                paddingLeft: '300px',
                paddingRight: '32px',
            }
        };
        if (this.props.state.activeCid != '') {
            //console.log("rendering display table", this.state.cidLogPairs, this.props.state.activeCid);
            //console.log("rendering display table");
            // console.log(this.state.cidLogPairs[this.props.state.activeCid]);
            return (
                <div style={style.div}>
                    <Table height="584px" fixedHeader={true} selectable={false}>
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                            <TableRow>
                                <TableHeaderColumn style={style.noWidth}>No</TableHeaderColumn>
                                <TableHeaderColumn style={style.timeWidth} tooltip="@client_epoch_time">Client Time</TableHeaderColumn>
                                <TableHeaderColumn style={style.typeWidth} tooltip="@event_type">Event Type</TableHeaderColumn>
                                <TableHeaderColumn style={style.nameWidth} tooltip="@event_name">Event Name</TableHeaderColumn>
                                <TableHeaderColumn tooltip="@event_extra.score">Score</TableHeaderColumn>
                                <TableHeaderColumn tooltip="@event_extra.sec">Second</TableHeaderColumn>
                                <TableHeaderColumn tooltip="@event_extra.fps">Fps</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Show raw data">Raw</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false} showRowHover={true} stripedRows={false}>
                            {this.state.cidLogPairs[this.props.state.activeCid].map(function(log, key) {
                                var time = moment(log["@data"]["@client_epoch_time"]).format("YYYY/MM/DD HH:mm:ss.SSS");
                                return (
                                    <TableRow key={key}>
                                        <TableRowColumn style={style.noWidth}>{key}</TableRowColumn>
                                        <TableRowColumn style={style.timeWidth}>{time}</TableRowColumn>
                                        <TableRowColumn style={style.typeWidth}>{log["@data"]["@event_type"]}</TableRowColumn>
                                        <TableRowColumn style={style.nameWidth}>{log["@data"]["@event_name"]}</TableRowColumn>
                                        <TableRowColumn>{log["@data"]["@event_extra"] ? log["@data"]["@event_extra"].score : ""}</TableRowColumn>
                                        <TableRowColumn>{log["@data"]["@event_extra"] ? log["@data"]["@event_extra"].sec : ""}</TableRowColumn>
                                        <TableRowColumn>{log["@data"]["@event_extra"] ? log["@data"]["@event_extra"].fps : ""}</TableRowColumn>
                                        <TableRowColumn><RaisedButton label="Raw" onClick={this.onClickRaw.bind(this, key)} backgroundColor="#fc981c" labelStyle={style.buttonText} /></TableRowColumn>
                                    </TableRow>
                                )
                            }.bind(this))}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    },
    render: function() {
        return (
            <div>
                {this.displayTable()}
                <Websocket url="ws://qa-log-proxy.vm5apis.com" debug={true} onMessage={this.handleData} onOpen={this.handleOpen} onClose={this.handleClose}/>
            </div>
        );
    }
});

export default LogPanel;