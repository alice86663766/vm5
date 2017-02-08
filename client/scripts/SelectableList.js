import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import {List, ListItem, MakeSelectable} from 'material-ui/List';

let SelectableList = MakeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList extends Component {
    constructor(props) {
      super(props);
      var propTypes = {
        children: PropTypes.node,
        defaultValue: PropTypes.string,
        updateRootState: React.PropTypes.func
      };
    }

    componentWillMount() {
      this.setState({
        selectedIndex: this.props.defaultValue,
      });
    }

    handleRequestChange(event, value){
      if (typeof value == "string") {
        this.props.updateRootState("activeCid", value);
      }
    }

    render() {
      return (
        <ComposedComponent value={this.props.activeCid} onChange={this.handleRequestChange.bind(this)}>
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

export default SelectableList;