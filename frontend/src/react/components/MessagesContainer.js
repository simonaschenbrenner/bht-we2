// React
import React, { Component } from "react";
import MessageView from "./MessageView";
// Redux
import { fetchAllMessagesOfThread, addMessage, selectMessage } from "../../modules/messageManagement/MessageManagementService";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

class MessagesContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.formatDate = this.formatDate.bind(this);
    }

    componentDidMount() {
        this.props.fetchMessagesAction(this.props.token, this.props.groupID, this.props.threadID);
    }

    shouldComponentRender() {
        if (this.props.isPending === false) {
            return true;
        } else {
            return false;
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.threadID !== prevProps.threadID || this.props.groupID !== prevProps.groupID || this.props.deletion !== prevProps.deletion) {
            this.props.fetchMessagesAction(this.props.token, this.props.groupID, this.props.threadID);
        }
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({message: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.addMessageAction(this.props.token, this.props.groupID, this.props.threadID, this.state.message);
    }

    formatDate(dateString) {
        let date = new Date(dateString);
        return date.format("dd.mm.yy HH:MM:SS");
    }

    render() {
        if (!this.shouldComponentRender()) {
            return(<Spinner animation="border" variant="primary" />)
        } else {
            var messageCards = [];
            this.props.messages.map((message) => {
                messageCards.push(
                    <MessageView
                        key={message._id}   
                        message={message}
                        isModifiable={(message.authorID === this.props.userID) || this.props.isAdmin}
                        messageUpdated={(content) => message.content = content}
                    />
                );
                return null;
            });
            return(
                <div>
                    {messageCards}
                    <hr />
                    <Form>
                        {this.props.isPending && <Spinner animation="border" variant="primary" />}
                        <Form.Control className="" type="text" placeholder="Neue Nachricht" name="message" onChange={this.handleChange} />
                        <Button className="btn btn-primary mt-3" data-action="submit" onClick={this.handleSubmit}>Senden</Button>
                    </Form>
                </div>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        token: state.authentication.token,
        userID: state.authentication.userID,
        isAdmin: state.authentication.isAdmin,
        groupID: state.groupManagement.selected,
        threadID: state.threadManagement.selected,
        messages: state.messageManagement.all,
        messageID: state.messageManagement.selected,
        deletion: state.messageManagement.deletion,
        isPending: state.messageManagement.pending,
        isError: state.messageManagement.error
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchMessagesAction: fetchAllMessagesOfThread,
    addMessageAction: addMessage,
    selectMessageAction: selectMessage
}, dispatch)

const ConnectedMessagesContainer = connect(mapStateToProps, mapDispatchToProps)(MessagesContainer)

export default ConnectedMessagesContainer