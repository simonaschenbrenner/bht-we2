// React
import React, { Component } from "react";
import GroupNav from "./GroupNav"
import ThreadNav from "./ThreadNav"
// Redux
import { logout } from "../../modules/authentication/AuthenticationService";
import { showUserSettings } from "../../modules/userManagement/UserManagementService";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import logo from "../../layout/icons/logo.svg"
import gear from "../../layout/icons/gear.svg"

class NavContainer extends Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
        switch(event.target.dataset.action) {
            case "logout":
                this.props.logoutAction();
                break;
            case "show settings":
                this.props.showSettingsAction();
                break;
            default:
                break;
        }
    }

    render() {
        return(
            <Row noGutters={true}>
                <Col>
                    <Row noGutters={true} className="justify-content-center w-100">
                        <Image src={logo} fluid className="p-3"/>                        
                    </Row>
                    <Row className="m-0 w-100">
                        <GroupNav />
                    </Row>
                    <Row noGutters={true} className="p-3 w-100" hidden={!this.props.isLoggedIn}>
                        <Col>
                            <Image src={gear} height={45} className="btn p-1" data-action="show settings" onClick={this.handleClick}/>
                        </Col>
                        <Col>
                            <Button variant="danger" data-action="logout" onClick={this.handleClick}>Logout</Button>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row className="m-0 w-100">
                        <ThreadNav />
                    </Row>  
                </Col>
            </Row>
        )
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.authentication.loggedIn
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    logoutAction: logout,
    showSettingsAction: showUserSettings
}, dispatch)

const ConnectedNavContainer = connect(mapStateToProps, mapDispatchToProps)(NavContainer)

export default ConnectedNavContainer