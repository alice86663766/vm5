import React from 'react';
import {render} from 'react-dom';
import Divider from 'material-ui/Divider';
var _ = require('lodash');

var SettingsBlock = React.createClass({
    //Return API status
    render: function() {
        var version= this.props.version;
        var debugStatus = this.props.data[version];
        if (version == "v4" && this.props.data.v3) {
            debugStatus.onetimeTokenStatusCodeCids = this.props.data.v3.onetimeTokenStatusCodeCids;
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
                height: '200px',
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            },
            scrollable: {
                height: '100px',
                overflow: 'scroll'
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
                <div style={style.scrollable}>
                    <ul>
                        {settings}
                    </ul>
                </div>
            </div>
        );
    }
});

export default SettingsBlock;