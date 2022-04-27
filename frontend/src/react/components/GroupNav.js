// React
import React, { Component } from "react";
// Redux
import { fetchAllGroups, selectGroup } from "../../modules/groupManagement/GroupManagementService"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";

class GroupNav extends Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.props.fetchAllGroupsAction(this.props.token, this.props.owner);
    }

    shouldComponentRender() {
        if (this.props.isPending === false) {
            return true;
        } else {
            return false;
        }
    }

    handleClick(event) {
        event.preventDefault();
        let selectedID = event.target.dataset.rbEventKey;
        if (selectedID !== this.props.groupID) {
            this.props.selectGroupAction(selectedID);
        }
    }

    render() {
        if (!this.shouldComponentRender()) {
            return(<Spinner animation="border" variant="primary" />)
        } else {
            let groups = this.props.groups;
            return(
                <Nav defaultActiveKey={this.props.groupID} className="nav-pills flex-column nav-fill w-100">
                {groups.map(group => (
                    <Nav.Link key={group._id} eventKey={group._id} disabled={!this.props.isLoggedIn} onClick={this.handleClick}>
                        {group.name}
                    </Nav.Link>
                ))}
                </Nav>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        token: state.authentication.token,
        isLoggedIn: state.authentication.loggedIn,
        isPending: state.groupManagement.pending,
        groups: state.groupManagement.all,
        groupID: state.groupManagement.selected
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchAllGroupsAction: fetchAllGroups,
    selectGroupAction: selectGroup
}, dispatch)
const ConnectedGroupNav = connect(mapStateToProps, mapDispatchToProps)(GroupNav)

export default ConnectedGroupNav