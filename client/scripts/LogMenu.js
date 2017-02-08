import React from 'react';
import {render} from 'react-dom';
import {Row} from 'react-flexbox-grid/lib/index';
import {Col} from 'react-flexbox-grid/lib/index';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import DropDownMenu from 'material-ui/DropDownMenu';
import {List, ListItem} from 'material-ui/List';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';

var LogMenu = React.createClass ({
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
                margin: '6px 12px',
            },
            buttonTextActive: {
                display: 'inline-block',
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
        var index = _.findIndex(this.props.cids, function(item) {
            return (item.cid == this.props.activeCid);
        }.bind(this));
        return (
            <Drawer open={this.props.open} openSecondary={true}>
                <Menu style={style.menuHeight} >
                    <List>
                        <Subheader>Cid</Subheader>
                        <ListItem primaryText={this.props.activeCid} />
                        <Subheader>SDK Version</Subheader>
                        <ListItem primaryText={this.props.sdkVersion} />
                        <Subheader>UI Version</Subheader>
                        <ListItem primaryText={this.props.uiVersion} />
                        <Subheader>Ad Id</Subheader>
                        <ListItem primaryText={this.props.adId} />
                    </List>
                </Menu>
                <Divider />
                <Row center="xs">
                    <Col xs={12}>
                        
                    </Col>
                </Row>
            </Drawer>
        );
    }
});

export default LogMenu;