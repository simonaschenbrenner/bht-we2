// React
import React, { Component } from "react";
// Redux
import { fetchAllThreadsOfGroup, selectThread } from "../../modules/threadManagement/ThreadManagementService"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";

class ThreadNav extends Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
        let selectedID = event.target.dataset.rbEventKey;
        if (selectedID !== this.props.threadID) {
            this.props.selectThreadAction(selectedID);
        }
    }

    componentDidMount() {
        const { fetchAllThreadsOfGroupAction } = this.props;
        fetchAllThreadsOfGroupAction(this.props.token, this.props.groupID);
    }

    shouldComponentRender() {
        if (this.props.isThreadPending || this.props.isGroupPending) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        if(!this.shouldComponentRender()) {
            return(<Spinner animation="border" variant="primary" />)
        } else {
            let threads = this.props.threads;
            return(
                <Nav activeKey={this.props.isLoggedIn ? this.props.threadID : ""} className="nav-pills flex-column nav-fill w-100">
                    {threads.map(thread => (
                        <Nav.Link key={thread._id} eventKey={thread._id} disabled={!this.props.isLoggedIn} onClick={this.handleClick}>
                            {thread.name}
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
        isGroupPending: state.groupManagement.pending,
        isThreadPending: state.threadManagement.pending,
        groupID: state.groupManagement.selected,
        threads: state.threadManagement.all,
        threadID: state.threadManagement.selected
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchAllThreadsOfGroupAction: fetchAllThreadsOfGroup,
    selectThreadAction: selectThread
}, dispatch)
const ConnectedThreadNav = connect(mapStateToProps, mapDispatchToProps)(ThreadNav)

export default ConnectedThreadNav