import {ReqMessage, RespMessage} from "./protocol";
import {Space} from "./knolewdge";

export type tupleHandler = (tuples:any[][]) => any
export type receivedCallback = (message:RespMessage) => void
export type voidHandler = (mess:ReqMessage) => RespMessage
export type spaceGetter = (spaceName:string) => Space
export type processMsg = (msg:string) => void
export type genHandler = (msg:string, callback:processMsg) => void