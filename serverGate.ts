/**
 * Created by SIMONE on 09/08/2017.
 */
import {GateID, Mode, Protocol, ReqMessage, RespMessage, SpaceID} from "./protocol";
import {deserialize, serialize} from "./serialization";
import {ServerSocket} from "./socket";
import {Space} from "./knolewdge";
import {TemplateField} from "./template";
import {buildServerSocket} from "./buildingUtils";
import {processMsg, tupleHandler, spaceGetter} from "./cbDefinitions";
import {fromPTemplateToTemplate, fromPTupleToTuple, fromTupleToPTuple, SpaceValue} from "./pSpaceValue";


var net = require('net');

export abstract class ServerGate {

    protected session:number
    protected getSpace:spaceGetter
    protected id:GateID
    protected socket:ServerSocket

    protected abstract getType():Mode

    constructor(getSpace:spaceGetter, port:number, host:string, protocol?:Protocol) {
        this.session = 0
        this.getSpace = getSpace
        this.socket = buildServerSocket(protocol || "tcp")
        this.id = new GateID(host, port, this.getType(), this.socket.getProtocol())
    }

    protected abstract handleRequest(message:ReqMessage, sendHandler:processMsg)
    protected abstract getConnful():boolean

    public open() {
        this.socket.bind(this.id.port, this.id.host)
        this.socket.onConnection((msg, sendHandler) => {
            let req:ReqMessage = deserialize(msg)
            this.handleRequest(req, sendHandler)
        }, this.getConnful())
        console.log('open')
    }

    public close() {
        this.socket.close()
    }

}

abstract class PingPongGate extends ServerGate {

    private handleError(message:ReqMessage, handler:processMsg, nullSpace:boolean):boolean {
        let resp:RespMessage = {}
        resp.serverSession = this.session
        if (nullSpace) {
            resp.statusMessage = "SPACE_NOT_EXISTING"
            resp.messageType = "FAILURE"
            resp.status = false
            setImmediate(handler, serialize(resp))
            return true
        }
        return false
    }

    private handlePut(message:ReqMessage, handler:processMsg, space:Space) {
        let tuple:any[] = fromPTupleToTuple(message.tuple)
        space.put(tuple)
        var resp:RespMessage = {
            messageType:"PUT_RESPONSE", serverSession:this.session, interactionMode:this.getType(),
            clientSession:message.clientSession, statusMessage: "ACTION_PERFORMED", status:true
        }
        var mess:string = serialize(resp)
        setImmediate(handler, mess)
    }

    private handleRes(message:ReqMessage, handler:processMsg, space:Space) {
        var resp:RespMessage = {
            serverSession:this.session,
            clientSession:message.clientSession, statusMessage: "ACTION_PERFORMED"
        }
        let tupleHandler:tupleHandler = (tuples:any[][]) => {
            var pTuples:SpaceValue[][] = []
            if (tuples != undefined) {
                for (let elem of tuples) {
                    pTuples.push(fromTupleToPTuple(elem))
                }
                resp.tuples = pTuples
            } else {
                resp.tuples = []
            }
            let mess:string = serialize(resp)
            handler(mess)
        }
        let template:TemplateField[] = fromPTemplateToTemplate(message.template)
        switch(message.messageType) {
            case "QUERY_REQUEST":
                if (!message.all) {
                    //setImmediate(() => {
                        resp.messageType = "QUERY_RESPONSE"
                        space.queryp(template, tupleHandler)
                    //})
                } else {
                    //setImmediate(() => {
                        resp.messageType = "QUERY_RESPONSE"
                        space.queryAll(tupleHandler, template)
                    //})
                }
                break
            case "GET_REQUEST":
                if (!message.all) {
                    //setImmediate(() => {
                        resp.messageType = "GET_RESPONSE"
                        space.getp(template, tupleHandler)
                    //})
                } else {
                    //setImmediate(() => {
                        resp.messageType = "GET_RESPONSE"
                        space.getAll(tupleHandler, template)
                    // })
                }
                break
            default:
                resp.statusMessage = "UNKNOWN_ACTION"
                let mess:string = serialize(resp)
                handler(mess)
        }
    }

    protected handleRequest(message:ReqMessage, handler:processMsg) {
        let spaceName:string = message.target
        let space:Space = this.getSpace(spaceName)
        if (this.handleError(message, handler, space == undefined)) {
            return
        }
        this.session++
        switch(message.messageType) {
            case "PUT_REQUEST":
                this.handlePut(message, handler, space)
                break
            default:
                this.handleRes(message, handler, space)
                break
        }
    }

}

export class ConnServerGate extends PingPongGate {

    protected getConnful():boolean {
        return false
    }

    protected getType():Mode {
        return "conn"
    }

}

export class KeepServerGate extends PingPongGate {

    protected getType():Mode {
        return "keep"
    }

    protected getConnful() {
        return true
    }

}
