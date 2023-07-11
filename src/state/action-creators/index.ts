export enum ActionTypes {
    START_GOOGLE_CLOUD_STREAM = "startGoogleCloudStream",
    END_GOOGLE_CLOUD_STREAM = "endGoogleCloudStream",
    RECEIVE_AUDIO_TEXT = "receive_audio_text",
    RECEIVE_MESSAGE = "receive_message",
    SEND_MESSAGE = "send_message",
    SEND_AUDIO_DATA = "send_audio_data",
    SOCKET_CONNECT = "connect",
    SOCKET_DISCONNECT = "disconnect",
    LOGIN = "login",
    LOGIN_SUCCESS = "login_success",
    LOGIN_ERROR = "login_error",
}

export interface LoginStateType {
    name : string
    password : string
}