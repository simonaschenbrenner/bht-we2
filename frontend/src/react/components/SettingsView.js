// React
import React, { Component } from "react";
// Redux
import { closeUserSettings } from "../../modules/userManagement/UserManagementService";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Button from "react-bootstrap/Button";

class SettingsView extends Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
        switch(event.target.dataset.action) {
            case "close settings":
                this.props.closeSettingsAction();
                break;
            default:
                break;
        }
    }

    render() {
        return( // TODO
            <Button variant="danger" data-action="close settings" onClick={this.handleClick}>
                Button
            </Button>
        )
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({
    closeSettingsAction: closeUserSettings
}, dispatch)

const ConnectedSettingsView = connect(null, mapDispatchToProps)(SettingsView)

export default ConnectedSettingsView