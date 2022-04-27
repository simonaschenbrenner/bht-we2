import React, { Component } from "react";
import { connect } from "react-redux";

import LoginForm from "./LoginForm"
import MessagesContainer from "./MessagesContainer"
import SettingsView from "./SettingsView";

class MainContainer extends Component {
    
    render() {
        let main;
        if(!this.props.isLoggedIn) {
            main = <LoginForm />
        } else if (this.props.isShowSettings) {
            main = <SettingsView />
        } else {
            main = <MessagesContainer />
        }
        return(
            <main className="p-5">
                {main}
            </main>
        )
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.authentication.loggedIn,
        isShowSettings: state.userManagement.showSettings
    };
}

const ConnectedMainContainer = connect(mapStateToProps, null)(MainContainer)

export default ConnectedMainContainer