import React from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
import ContentSend from 'material-ui/svg-icons/content/send';
import FlatButton from 'material-ui/FlatButton';
import SettingPageOne from './SettingPageOne';
import SettingPageTwo from './SettingPageTwo';
import SettingPageThree from './SettingPageThree';
import {Row, Col} from 'react-flexbox-grid/lib/index';
import mappingv3 from '../urlMappingV3.json';
import mappingv4 from '../urlMapping.json';
var _ = require('lodash');

var SettingForm = React.createClass ({
    loadDebugTime: function() {
        $.ajax({
            url: this.props.urlPrefix + "/aux/debug/M",
            dataType: 'json',
            cache: false,
            success: function(data){
                var cid = this.props.cid;
                var debugTime = data.v4.timelimitCids[cid];
                if (typeof debugTime == 'undefined') {
                    debugTime = 60;
                }
                else {
                    parseFloat(debugTime);
                }
                this.setState({debugTimeLimit: debugTime});
                console.log("debugTime loaded:", debugTime);
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadDebugTime();
        //this.setState({urlMapping: urlMapping});
    },
    componentWillReceiveProps: function(nextProps) {
        if ((nextProps.version != this.props.version) || (nextProps.urlPrefix != this.props.urlPrefix) || (nextProps.cid != this.props.cid)) {
            this.resetState(1);
        }
    },
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
            imgCorrupts: 'Not set', 
            bufferCorrupts: false,
            videoCorrupts: false, 
            debugTimeLimit: ''
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
            imgCorrupts: 'Not set',
            bufferCorrupts: false, 
            videoCorrupts: false, 
            preRecordedVideo: false,
            debugTimeLimit: ''
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
                    <SettingPageTwo version={this.props.version} state={this.state} updateState={this.updateState} onChangeChecked={this.onChangeChecked} noVmOptions={noVmOptions} corruptedImageOptions={corruptedImageOptions} />
                );
            case 3:
                return (
                    <SettingPageThree version={this.props.version} cid={this.props.cid} urlPrefix={this.props.urlPrefix} debugTimeLimit={this.state.debugTimeLimit} handleReset={this.handleReset} preScheduleEmpty={this.props.preScheduleEmpty} />
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
            success: function() {
                this.loadDebugTime();
            }.bind(this),
            error: function(xhr, status, err) {
                alert("We can't process your request right now. Please check if you are connected to Mock-AP. If this error message keeps showing, please contact the person in charge (Alice/Gary/Denny/Cades)");
            }.bind(this)
        });
    },
    prepareAndSendRequest: function() {
        var stateObj = this.state;
        var cid = this.props.cid;
        console.log(stateObj);
        var mapping = mappingv4;
        if (this.props.version == "v3") {
            mapping = mappingv3;
        }
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
                url = this.props.urlPrefix + url; //change to real url: delete this line
                this.sendRequest(url);
            }
        }.bind(this));

    },
    handleClick: function(input) {
        this.setState({page: input});
        if (input == 3) {
            this.prepareAndSendRequest();
            console.log("Submitted");
        }
        console.log(input);
    },
    handleReset: function(e) {
        this.resetState(this.state.page);
        var url = this.props.urlPrefix + "/aux/reset/" + this.props.cid; //change to real url: delete the first string
        this.sendRequest(url);
    },
    handleSubmit: function(e) {
        e.preventDefault();
        this.prepareAndSendRequest();
        //this.onSubmitSetRoot(cid);
        console.log("Submitted");
    },
    displayButton: function() {
        const style = {
            buttonActive: {
                backgroundColor: '#1c80fc',
                color: '#ffffff'
            },
        };
        return (
            <div>
                <FlatButton type="button" id="1" onClick={() => this.handleClick(1)} style={this.state.page == 1 ? style.buttonActive : null} >1</FlatButton>
                <FlatButton type="button" id="2" onClick={() => this.handleClick(2)} style={this.state.page == 2 ? style.buttonActive : null} >2</FlatButton>
                <FlatButton type="button" id="3" onClick={() => this.handleClick(3)} style={this.state.page == 3 ? style.buttonActive : null} version={this.props.version}>3</FlatButton>
            </div>
        );
    },
    displayResetSubmitButtons: function() {
        const style = {
            submit: {
                backgroundColor: '#fc981c',
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

export default SettingForm;