import React from 'react';
import {render} from 'react-dom';
import Websocket from './Websocket';

var LogPanel = React.createClass({
    getInitialState: function() {
        return {data: []}
    },
    handleData: function(data) {
        let result = JSON.parse(data);
        var cid = result["@data"]["@profile_tokens"].cid;
        var index = _.findIndex(this.props.state.cids, function(item) {
            return (item.cid == cid);
        });
        
        if (index < 0) {
            var name = result.ua.browser.name + " (" + cid.substring(0, 8) + ")";
            var details = result.ua.browser.name;
            if (result.ua.device.vendor) {
                name = result.ua.device.vendor + ", " + result.ua.browser.name + " (" + cid.substring(0, 8) + ")";
                details = result.ua.device.vendor + ", " + result.ua.device.model + ", " + result.ua.browser.name;
            }
            this.props.pushCid(cid, name, details);
            if (this.props.state.activeCid == '') {
                this.props.updateRootState("activeCid", cid);
            }
            console.log(cid, name, details);
        }
        this.setState({data: result});
        console.log(result);
    },
    render: function() {
        return (
            <div>
                <Websocket url="ws://qa-log-proxy.vm5apis.com" onMessage={this.handleData}/>
            </div>
        );
    }
});

export default LogPanel;