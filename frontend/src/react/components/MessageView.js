// React
import React, { Component } from "react";
import Moment from "moment";
import ContentEditable from "react-contenteditable";
// Redux
import { selectMessage, updateMessage, deleteMessage } from "../../modules/messageManagement/MessageManagementService";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// Bootstrap, etc.
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

class MessageView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            content: "",
            isEditable: false,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.formatDate = this.formatDate.bind(this);
    }

    componentDidMount() {
        this.setState({ content: this.props.message.content });
    }

    shouldComponentRender() {
        if (this.props.isPending === false) {
            return true;
        } else {
            return false;
        }
    }

    handleChange(event) {
        this.setState({content: event.target.value});
    }

    handleClick(event) {
        event.preventDefault();
        switch(event.target.dataset.action) {
            case "submit":
                this.props.addMessageAction(this.props.token, this.props.userID, this.props.groupID, this.props.threadID, this.state.message);
                break;
            case "edit":
                this.setState({ isEditable: true });
                this.props.selectMessageAction(event.target.dataset.mid);
                break;
            case "save":
                this.setState({ isEditable: false });
                this.props.updateMessageAction(this.props.token, event.target.dataset.mid, this.state.content);
                this.props.messageUpdated(this.state.content);
                break;
            case "delete":
                this.props.deleteMessageAction(this.props.token, event.target.dataset.mid);
                break;
            default:
                break;
        }
    }

    formatDate(dateString) {
        let date = new Date(dateString);
        return date.format("dd.mm.yy HH:MM:SS");
    }

    render() {
        if(!this.shouldComponentRender()) {
            return(<Spinner animation="border" variant="primary" />)
        } else {
            let message = this.props.message;
            let timeStampString = "am " + Moment(message.published).format('d.M.yy') + " um " + Moment(message.published).format('HH:mm:ss');
            if(message.published !== message.updated) timeStampString += " (geändert am " + Moment(message.updated).format('d.M.yy') + " um " + Moment(message.updated).format('HH:mm:ss') + ")";
            return(
                <div className="card bg-light my-3" key={message._id}>
                    <div className="card-body">
                        <small>{message.firstName} {message.lastName} {timeStampString}</small>
                        <ContentEditable
                            html={this.state.content}
                            disabled={!this.state.isEditable}
                            onChange={this.handleChange}
                            className="pb-3 pt-1"
                        />
                        <Button
                            className="btn btn-secondary btn-sm mr-3"
                            hidden={!this.props.isModifiable || this.state.isEditable}
                            onClick={this.handleClick}
                            data-action="edit"
                            data-mid={message._id}
                        >
                            Bearbeiten
                        </Button>
                        <Button
                            className="btn btn-primary btn-sm mr-3"
                            hidden={!this.state.isEditable}
                            onClick={this.handleClick}
                            data-action="save"
                            data-mid={message._id}
                        >
                            Speichern
                        </Button>
                        <Button
                            className="btn btn-danger btn-sm mr-3"
                            hidden={!this.props.isModifiable}
                            onClick={this.handleClick}
                            data-action="delete"
                            data-mid={message._id}
                        >
                            Löschen
                        </Button>
                    </div>
                </div>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        token: state.authentication.token,
        messageID: state.messageManagement.selected,
        isPending: state.messageManagement.pending,
        isUpdated: state.messageManagement.updated,
        isError: state.messageManagement.error
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    updateMessageAction: updateMessage,
    selectMessageAction: selectMessage,
    deleteMessageAction: deleteMessage
}, dispatch)

const ConnectedMessageView = connect(mapStateToProps, mapDispatchToProps)(MessageView)

export default ConnectedMessageView