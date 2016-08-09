import React from 'react';
import {render} from 'react-dom';
import CidPanel from './CidPanel';
import DialogPanel from './DialogPanel';
import EventPanel from './EventPanel';
import LogPanel from './LogPanel';
import SettingForm from './SettingForm';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Tabs, Tab} from 'material-ui/Tabs';
import $ from 'jquery';
import apiMapping from '../apiMapping.json';
import urlMapping from '../urlMapping.json';
import {Row, Col} from 'react-flexbox-grid/lib/index';

/*
Some Spects:
No speed limit: displayed as 100fps in the graph. Should send "unthrottle".
Poor connection: 10 fps.
Intro poor connection: 3fps. Set initial fps to 3fps.
*/

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
                alert("Can't load url mapping!");
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            cids:[], 
            activeCid: '',
            urlMapping: [],
            urlPrefix: 'http://campaign.vm5apis.com',
            openManager: false
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
    updateRootCidName: function(index, name) {
        var cids = this.state.cids;
        console.log("index:", index);
        cids[index].name = name;
        this.setState({cids: cids});
    },
    pushCid: function(cid, name, details) {
        var array = this.state.cids;
        var obj = {};
        obj.id = array.length;
        obj.cid = cid;
        obj.name = name;
        obj.details = details;
        array.push(obj);
        this.setState({cids: array});
    },
    handleChangeTab: function(value) {
        this.setState({tab: value});
    },
    displayMainPanel: function() {
        const style = {
            div: {
                padding: '285px 0px'
            },
            inkBar: {
                background: '#1cfc98'
            },
            tab: {
                background: '#fc981c'
            }
        }
        var debugUrl = this.state.urlPrefix + "/aux/debug/M";
        if (this.state.activeCid) {
            return (
                <Col xs={12} md={9} >
                    <Row>
                        <Col xs={6} style={{padding: '20px'}} >
                            <SettingForm mapping={this.state.urlMapping} cid={this.state.activeCid} urlPrefix={this.state.urlPrefix} />
                        </Col>
                        <Col xs={6} style={{padding: '20px'}} >
                            <EventPanel cid={this.state.activeCid} url={debugUrl} pullInterval={500}/>
                        </Col>
                    </Row>
                    <LogPanel state={this.state} pushCid={this.pushCid} updateRootState={this.updateRootState} />
                </Col>
            );
        }
        else {
            return (
                <Col xs={12} md={9} >
                    <Row center="xs">
                        <Col xs={9}>
                            <div style={style.div}>
                                <h1>No active device being tested at this moment. Start testing to display dashboard.</h1>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} >
                            <LogPanel state={this.state} pushCid={this.pushCid} updateRootState={this.updateRootState} />
                        </Col>
                    </Row>
                </Col>
            );
        }
    },
    render: function() {
        return (
            <MuiThemeProvider>
                <div>
                    <Row>
                        <Col xs={12} md={3} >
                            <CidPanel cids={this.state.cids} urlPrefix={this.state.urlPrefix} activeCid={this.state.activeCid} updateRootState={this.updateRootState} updateRootCidName={this.updateRootCidName}/>
                        </Col>
                        {this.displayMainPanel()}
                    </Row>
                    <DialogPanel openManager={this.state.openManager} cids={this.state.cids} updateRootState={this.updateRootState} updateRootCidName={this.updateRootCidName} />
                </div>
            </MuiThemeProvider>
        );
    }
});

render(
  <ContentBox />, document.getElementById('content')
);