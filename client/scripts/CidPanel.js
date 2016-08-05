import React from 'react';
import {render} from 'react-dom';
import {Row} from 'react-flexbox-grid/lib/index';
import {Col} from 'react-flexbox-grid/lib/index';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import DropDownMenu from 'material-ui/DropDownMenu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

var CidPanel = React.createClass ({
    handleChange: function(e, value) {
        console.log("cid panel value:", value);
        this.props.updateRootState("activeCid", value);
    },
    handleSelect: function(e, key, value) {
        console.log("select value:", value);
        this.props.updateRootState("urlPrefix", value);
    },
    onClickManager: function(e) {
        console.log("clicked!");
        this.props.updateRootState("openManager", true);
    },
    render: function() {
        const style = {
            active: {
                backgroundColor: '#cccccc',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                cursor: 'pointer', 
                width: '256px'
            },
            normal: {
                backgroundColor: '#ffffff',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
                width: '256px'
            },
            title: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '28px',
                marginTop: '10px'
            }, 
            div: {
                padding: '0px 16px'
            },
            header: {
                padding: '0px',
                backgroundColor: '#fc981c',
            },
            headerFont: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '300',
                fontSize: '24px',
                color: '#ffffff'
            },
            managerButton: {
                margin: 12,
            },
            buttonTextActive: {
                textTransform: 'capitalize',
                color: '#ffffff'
            },
            menuHeight: {
                height: '536px'
            },
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
            }
        };
        var cidNodes = this.props.cids.map(function(cid) {
            var displayCid = cid.cid.substring(0, 25) + "...";
            return(
                <MenuItem key={cid.id} value={cid.cid} primaryText={cid.name == '' ? displayCid : cid.name} rightIcon={this.props.activeCid == cid.cid ? <ArrowDropRight /> : null} style={this.props.activeCid == cid.cid ? style.active : style.normal}/>
            );
        }.bind(this));
        return (
            <Drawer open={true}>
                <Menu style={style.header}>
                    <MenuItem key={1} primaryText="AdServer Dashboard" style={style.headerFont}/>
                </Menu>
                <div style={style.div}>
                    <label style={style.label}>Server: </label>
                    <DropDownMenu value={this.props.urlPrefix} onChange={this.handleSelect}>
                        <MenuItem value="http://campaign.vm5apis.com" primaryText="Local" />
                        <MenuItem value="http://mock.adserver.vm5apis.com" primaryText="Cloud" />
                    </DropDownMenu>
                </div>
                <Divider />
                <Menu onChange={this.handleChange} style={style.menuHeight} >
                    {cidNodes}
                </Menu>
                <Divider />
                <Row center="xs">
                    <Col xs={12}>
                        <RaisedButton label="Device Manager" disabled={this.props.cids.length == 0} onClick={this.onClickManager} style={style.managerButton} backgroundColor="#fc981c" labelStyle={style.buttonTextActive} /> 
                    </Col>
                </Row>
            </Drawer>
        );
    }
});

export default CidPanel;