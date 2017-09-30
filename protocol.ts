
import {SpaceValue, TemplateValue} from "./pSpaceValue";
export class SpaceID {
    public protocol:Protocol
    public host:string
    public port:number
    public name:string
    public mode:Mode

    constructor(host:string|undefined, port:number, mode:Mode, name:string, protocol?:Protocol) {
        this.mode = mode
        this.port = port
        this.protocol = protocol||"tcp"
        this.host = host||'127.0.0.1'
        this.name = name
    }
    public static getSpaceName(uri:string):string {
        return uri.split("/").reverse()[0].split('?')[0]
    }
    public toString():string {
        let header = /*this.protocol == undefined ? "" : */(this.protocol + "://")
        return header + this.host + ":" + this.port
            + '/' + this.name + '?' + this.mode
     }
}

export class GateID {
    public protocol:Protocol
    public host:string
    public port:number
    public mode:Mode
    constructor(host?:string, port?:number, mode?:Mode, protocol?:Protocol) {
        this.mode = mode||"keep"
        this.port = port
        this.protocol = protocol||"tcp"
        this.host = host
    }
    public toString():string {
        let header = /*this.protocol == undefined ? "" :*/ (this.protocol + "://")
        return header + this.host
            + ":" + this.port + '?' + this.mode
    }
}

export type Response = "UNKNOWN_ACTION"|"ACTION_PERFORMED"|
    "SPACE_NOT_EXISTING"|"MISMATCHING_PROTOCOL"

export type Protocol = "tcp"|"udp"

export type Action =
    "PUT_REQUEST"|
    "PUT_RESPONSE"|
    "GET_REQUEST"|
    "GET_RESPONSE"|
    "QUERY_REQUEST"|
    "QUERY_RESPONSE"|
    "FAILURE"

export type Mode =
    "conn"|
    "keep"

interface Message {
    messageType?:Action
    interactionMode?:string
    statusCode?:string
    statusMessage?:Response
    clientSession?:number
    serverSession?:number
}

export interface ReqMessage extends Message {
    clientURI?:string
    target?:string
    mode?:Mode
    tuple?:SpaceValue[]
    template?:TemplateValue[]
    blocking:boolean
    all:boolean
}

export interface RespMessage extends Message {
    status?:boolean
    tuples?:SpaceValue[][]
}