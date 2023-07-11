import { ActionTypes , LoginStateType } from "../action-creators"



interface LoginAction {
    type : ActionTypes.LOGIN;
    payload: LoginStateType;
}

interface LoginActionSuccess {
    type : ActionTypes.LOGIN_SUCCESS,
    payload : string;
}

interface LoginActionFailure {
    type : ActionTypes.LOGIN_ERROR,
    payload: string;
}

export type Action = 
 | LoginAction  
 | LoginActionSuccess
 | LoginActionFailure;
