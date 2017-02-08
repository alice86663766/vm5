import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import {Row} from 'react-flexbox-grid/lib/index';
import {Col} from 'react-flexbox-grid/lib/index';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import DropDownMenu from 'material-ui/DropDownMenu';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import IconButton from 'material-ui/IconButton';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
import SelectableList from './SelectableList';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

var CidMenu = React.createClass ({
    handleSelect: function(e, key, value) {
        console.log("select value:", value);
        if (value == "Set url") {
            this.props.updateRootState("openUrlInput", true);
        }
        else {
            this.props.updateRootState("urlPrefix", value);
        }
    },
    handleSelectVersion: function(e, key, value) {
        this.props.updateRootState("version", value);
    },
    handleMenuToggle: function(listItem) {
        this.props.updateRootState("activeCid", listItem.props.value);
    },
    handleEditName: function(cid, e) {
        e.stopPropagation();
        this.props.updateRootState("openEditName", true);
    },
    render: function() {
        const style = {
            active: {
                backgroundColor: '#cccccc',
                fontFamily: 'Roboto, sans-serif',
                cursor: 'pointer', 
                width: '264px',
                paddingLeft: '52px',
                paddingRight: '40px'
            },
            normal: {
                backgroundColor: '#ffffff',
                fontFamily: 'Roboto, sans-serif',
                cursor: 'pointer',
                width: '264px',
                paddingLeft: '52px',
                paddingRight: '40px'
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
            buttonTextActive: {
                display: 'inline-block',
                textTransform: 'capitalize',
                color: '#ffffff'
            },
            menuHeight: {
                height: '536px'
            },
            listWidth: {
                width: '264px'
            },
            label: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
            },
            svg: {
                padding: "0px",
                margin: "0px",
                top: "10px",
                left: "12px"
            },
            logDetails: {
                fontSize: '14px',
                backgroundColor: '#ffffff'
            }
        };
        var cidNodes = this.props.cids.map(function(cid) {
            var displayCid = cid.cid.substring(0, 25) + "...";
            var activeCid = this.props.activeCid;
            return (
                <ListItem leftIcon={<IconButton onClick={this.handleEditName.bind(this, cid.cid)} style={style.svg}><EditorModeEdit /></IconButton>} onNestedListToggle={this.handleMenuToggle} primaryTogglesNestedList={true} nestedItems={[
                    <ListItem primaryText="SDK Version" secondaryText={cid.sdkVersion} secondaryTextLines={2} style={style.logDetails} />,
                    <ListItem primaryText="UI Version" secondaryText={cid.uiVersion} secondaryTextLines={2} style={style.logDetails} />,
                    <ListItem primaryText="Ad Id" secondaryText={cid.adId} secondaryTextLines={1} style={style.logDetails} />
                ]} key={cid.id} value={cid.cid} primaryText={cid.name == '' ? displayCid : cid.name} innerDivStyle={this.props.activeCid == cid.cid ? style.active : style.normal} nestedListStyle={style.logDetails} />
            );
        }.bind(this));
        var serverOptions = this.props.serverOptions.map(function(option) {
            return (
                <MenuItem key={option.id} value={option.value} primaryText={option.primaryText} />
            );
        });
        return (
            <Drawer open={this.props.open} width={256} >
                <Menu style={style.header}>
                    <MenuItem key={1} primaryText="AdServer Dashboard" style={style.headerFont}/>
                </Menu>
                <div style={style.div}>
                    <label style={style.label}>Server: </label>
                    <DropDownMenu value={this.props.urlPrefix} onChange={this.handleSelect}>
                        {serverOptions}
                    </DropDownMenu>
                </div>
                <Divider />
                <div style={style.div}>
                    <label style={style.label}>Version: </label>
                    <DropDownMenu value={this.props.version} onChange={this.handleSelectVersion}>
                        <MenuItem key={0} value="v3" primaryText="v.3" />
                        <MenuItem key={1} value="v4" primaryText="v.4" />
                    </DropDownMenu>
                </div>
                <Divider />
                <div>
                    <SelectableList activeCid={this.props.activeCid} updateRootState={this.props.updateRootState} >
                        {cidNodes}
                    </SelectableList>
                </div>
            </Drawer>
        );
    }
});

export default CidMenu;