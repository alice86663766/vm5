import React from 'react';
import {render} from 'react-dom';
import AppBar from 'material-ui/AppBar';
import CidMenu from './CidMenu';
import DialogPanel from './DialogPanel';
import Divider from 'material-ui/Divider';
import EventPanel from './EventPanel';
import FlatButton from 'material-ui/FlatButton';
import LogPanel from './LogPanel';
import LogMenu from './LogMenu';
import RaisedButton from 'material-ui/RaisedButton';
import RawDataDialog from './RawDataDialog';
import SettingForm from './SettingForm';
import UrlDialog from './UrlDialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import $ from 'jquery';
import {Row, Col} from 'react-flexbox-grid/lib/index';

/*
Some Spects:
No speed limit: displayed as 100fps in the graph. Should send "unthrottle".
Poor connection: 10 fps.
Intro poor connection: 3fps. Set initial fps to 3fps.
*/

var ContentBox = React.createClass({
    /*componentDidMount: function() {
        Events.scrollEvent.register('begin', function(to, element) {
            console.log("begin", arguments);
        });
        Events.scrollEvent.register('end', function(to, element) {
            console.log("end", arguments);
        });
        scrollSpy.update();
    },
    componentWillUnmount: function() {
        Events.scrollEvent.remove('begin');
        Events.scrollEvent.remove('end');
    },*/
    /*scrollTo: function() {
        scroll.scrollTo(100);
    },*/
    getInitialState: function() {
        return {
            cids:[], 
            activeCid: '',
            urlPrefix: 'http://campaign.vm5apis.com',
            version: "v4",
            serverOptions: [{
                id: 0,
                value: "http://campaign.vm5apis.com",
                primaryText: "Local"
            },{
                id: 1,
                value: "http://mock-campaign.vm5apis.com/",
                primaryText: "Cloud"
            },{
                id: 2,
                value: "Set url",
                primaryText: "Set url..."
            }],
            openEditName: false,
            openUrlInput: false,
            openRawData: false,
            log: {},
            preScheduleEmpty: true,
        };
    },
    updateRootState: function(key, value) {
        var obj = {};
        obj[key] = value;
        this.setState(obj);
    },
    updateRootCidDetails: function (index, key, value) {
        var obj = this.state.cids[index];
        if (!value) {
            value = "No information";
        }
        obj[key] = value;
        this.setState(obj);
    },
    updateRootCidName: function(cid, name) {
        var cids = this.state.cids;
        var index = _.findIndex(this.state.cids, function(item) {
            return (item.cid == cid);
        }.bind(this));
        console.log("index:", index);
        cids[index].name = name;
        this.setState({cids: cids});
    },
    pushCid: function(cid, name, details, sessionId, sdkVersion, uiVersion, adId) {
        var array = this.state.cids;
        var obj = {};
        obj.id = array.length;
        obj.cid = cid;
        obj.name = name;
        obj.details = details;
        obj.sessionId = sessionId;
        if (!sdkVersion) {
            uiVersion = "No information";
        }
        obj.sdkVersion = sdkVersion;
        if (!uiVersion) {
            uiVersion = "No information";
        }
        obj.uiVersion = uiVersion;
        obj.adId = adId;
        //obj.logs = logs;
        array.push(obj);
        this.setState({cids: array});
        console.log(obj);
    },
    scrollToLog: function() {
        window.scrollTo(0, 729);
    },
    displayMainPanel: function() {
        const style = {
            olddiv: {
                padding: '285px 0px'
            },
            div: {
                paddingLeft: '300px',
                paddingRight: '32px',
                paddingTop: '64px'
            },
            appBar: {
                backgroundColor: '#fc981c',
                position: 'fixed',
                top: '0px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '300',
                fontSize: '24px',
                color: '#ffffff',
                paddingLeft: '250px'
            }
        }
        var debugUrl = this.state.urlPrefix + "/aux/debug/M";
        if (this.state.activeCid) {
            var index = _.findIndex(this.state.cids, function(item) {
                return (item.cid == this.state.activeCid);
            }.bind(this));
            var displayDetail = this.state.cids[index].details + ': ' + this.state.activeCid;
            var displayName = this.state.cids[index].name + ' (' + this.state.cids[index].details + '): ' + this.state.activeCid;;
            var substring = this.state.activeCid.substring(0, 8);
            //"Model: " + this.state.cids[index].details + ', Cid: ' + this.state.activeCid
            return (
                <div>
                    <AppBar title={this.state.cids[index].name.indexOf(substring) == -1 ? displayName : displayDetail} iconElementRight={<FlatButton label="Go To Log" labelColor="#ffffff" onClick={this.scrollToLog} />} titleStyle={style.title} iconClassNameRight="muidocs-icon-navigation-expand-more" zDepth={0} style={style.appBar} />
                    <div style={style.div}>
                        <Row>
                            <Col xs={6} style={{padding: '20px'}} >
                                <SettingForm cid={this.state.activeCid} version={this.state.version} urlPrefix={this.state.urlPrefix} preScheduleEmpty={this.state.preScheduleEmpty}/>
                            </Col>
                            <Col xs={6} style={{padding: '20px'}} >
                                <EventPanel cid={this.state.activeCid} version={this.state.version} preScheduleEmpty={this.state.preScheduleEmpty} url={debugUrl} pullInterval={500} updateRootState={this.updateRootState} />
                            </Col>
                        </Row>
                        <Divider />
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <AppBar title={this.state.activeCid} iconElementRight={<FlatButton label="Go To Log" labelColor="#ffffff" disabled={true}/>} titleStyle={style.title} iconClassNameRight="muidocs-icon-navigation-expand-more" zDepth={0} style={style.appBar} />
                    <div style={style.div}>
                        <h1>No active device being tested at this moment. Start testing to display dashboard.</h1>
                    </div>
                </div>
            );
        }
    },
    render: function() {
        console.log('admock render');
        var index = _.findIndex(this.state.cids, function(item) {
            return (item.cid == this.state.activeCid);
        }.bind(this));
        return (
            <MuiThemeProvider>
                <div>
                    <CidMenu cids={this.state.cids} index={index} open={true} serverOptions={this.state.serverOptions} urlPrefix={this.state.urlPrefix} version={this.state.version} activeCid={this.state.activeCid} updateRootState={this.updateRootState} />
                    {this.displayMainPanel()}
                    <LogPanel state={this.state} pushCid={this.pushCid} updateRootState={this.updateRootState} updateRootCidDetails={this.updateRootCidDetails} />
                    <DialogPanel cid={this.state.activeCid} openEditName={this.state.openEditName} updateRootState={this.updateRootState} updateRootCidName={this.updateRootCidName} />
                    <UrlDialog openUrlInput={this.state.openUrlInput} serverOptions={this.state.serverOptions} updateRootState={this.updateRootState} />
                    <RawDataDialog openRawData={this.state.openRawData} updateRootState={this.updateRootState} log={this.state.log}/>
                </div>
            </MuiThemeProvider>
        );
    }
});

render(
  <ContentBox />, document.getElementById('content')
);