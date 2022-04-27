// React
import React, { Component } from "react";
// Redux
import { authenticateUser } from "../../modules/authentication/AuthenticationService"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import personIcon from "../../layout/icons/person.svg"
import lockIcon from "../../layout/icons/lock.svg" // TODO

class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userID: "",
            password: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({[name]: value});
    }

    handleSubmit(event) {
        event.preventDefault();
        const { userID, password } = this.state;
        const { authenticateUserAction } = this.props;
        authenticateUserAction(userID, password);
    }

    render() {
        return(
            <Form>
                <Form.Group as={Row}>
                    <img src={personIcon} alt="person icon" height={35}/>
                    <Col>
                        <Form.Control type="text" placeholder="E-Mail" name="userID" onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <img src={lockIcon} alt="lock icon" height={35}/>
                    <Col>
                        <Form.Control type="password" placeholder="Passwort" name="password" onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    Login
                </Button>
                <Form.Group>
                    {this.props.isPending && <Spinner animation="border" variant="primary" />}
                    {this.props.isError && <Form.Label style={{ color: "red"}}>Invalid user ID or password</Form.Label>}
                </Form.Group>
            </Form>
        )
    }
}
const mapStateToProps = state => {
    return {
        userName: state.authentication.userName,
        // token: state.authentication.token,
        isPending: state.authentication.pending,
        isLoggedIn: state.authentication.loggedIn,
        isError: state.authentication.error
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    authenticateUserAction: authenticateUser
}, dispatch)

const ConnectedLoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginForm)

export default ConnectedLoginForm