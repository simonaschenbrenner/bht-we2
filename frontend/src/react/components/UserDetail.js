// React
import React, { Component } from "react";
// Redux
import { fetchUser } from "../../modules/userManagement/UserManagementService"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Spinner from "react-bootstrap/Spinner";

class UserDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            firstName: "",
            lastName: "",
            passwordOld: "",
            passwordNew: ""
        }
    }

    componentDidMount() {
        const { fetchUserAction } = this.props;
        fetchUserAction(this.props.token, this.props.owner);
    }

    render() {
        return( // Dummy
            <div>
                {this.props.isPending && <Spinner animation="border" variant="primary" />}
                <p><b>User ID: </b>{this.props.id}</p>
                <p><b>Email: </b>{this.props.email}</p>
                <p><b>Vorname: </b>{this.props.firstName}</p>
                <p><b>Nachname: </b>{this.props.lastName}</p>
                <p><b>Registriert am: </b>{this.props.registered}</p>
                <p><b>Rolle: </b>{this.props.role}</p>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        token: state.authentication.token,
        owner: state.authentication.userID,
        isPending: state.userManagement.pending,
        isError: state.userManagement.error,
        id: state.userManagement._id,
        email: state.userManagement.email,
        firstName: state.userManagement.firstName,
        lastName: state.userManagement.lastName,
        registered: state.userManagement.registered,
        role: state.userManagement.role,
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchUserAction: fetchUser
}, dispatch)
const ConnectedUserDetail = connect(mapStateToProps, mapDispatchToProps)(UserDetail)

export default ConnectedUserDetail