import { combineReducers } from "redux";
import authenticationReducer from "./authentication/AuthenticationReducer";
import userManagementReducer from "./userManagement/UserManagementReducer";
import groupManagementReducer from "./groupManagement/GroupManagementReducer";
import threadManagementReducer from "./threadManagement/ThreadManagementReducer";
import messageManagementReducer from "./messageManagement/MessageManagementReducer";


const rootReducer = combineReducers({
    authentication: authenticationReducer,
    userManagement: userManagementReducer,
    groupManagement: groupManagementReducer,
    threadManagement: threadManagementReducer,
    messageManagement: messageManagementReducer
});

export default rootReducer;