import {GateID, Mode, ReqMessage, SpaceID, Action, Protocol} from "./protocol";
import {serialize} from "./serialization";
import {ClientSocket} from "./socket";
import {receivedCallback} from "./cbDefinitions"
import {buildClientSocket} from "./buildingUtils";
import {
    fromPTemplateToTemplate, fromTemplateToPTemplate, fromTupleToPTuple, SpaceValue,
    TemplateValue
} from "./pSpaceValue";
/**
 * Created by SIMONE on 03/08/2017.
 */

let net = require('net')

export abstract class ClientGate {

    protected abstract getMode():Mode

    constructor(port?:number, host?:string, protocol?:Protocol) {
        this.counter = 1
        this.active = false
        this.client = buildClientSocket(protocol || "tcp")
        this.id = new GateID(this.client.getAddr()[0]||"127.0.0.1",
            this.client.getAddr()[1], this.getMode(), this.client.getProtocol());
    }

    protected counter:number
    protected client:ClientSocket
    protected id:GateID
    protected active:boolean
    protected target:SpaceID

    public getID():GateID {
        return this.id
    }

    public isActive():boolean {
        return this.active
    }
    public abstract open(target:SpaceID)
    public abstract send (action:Action, all?:boolean, callBack?: receivedCallback, blocking?:boolean, args?:any[])
    public abstract close()

}

abstract class PingPongGate extends ClientGate {

    public send(action:Action,  all?:boolean, callBack?: receivedCallback, blocking?:boolean, args?:any[]) {
        let tuple:SpaceValue[] = (action == "PUT_REQUEST") ? fromTupleToPTuple(args) : undefined
        let template:TemplateValue[] = (action != "PUT_REQUEST") ? fromTemplateToPTemplate(args) : undefined
        let message:ReqMessage = {messageType:action, clientSession:this.counter,
            clientURI:this.id.toString(), interactionMode:this.getMode(), target:this.target.name,
            tuple:tuple, template:template, blocking:blocking, all:all}
        this.counter++
        let mess:string = serialize(message)
        this.client.send(mess, callBack)
    }

}

export class KeepClientGate extends PingPongGate {

    protected getMode(): Mode {
        return "keep";
    }

    public open(target: SpaceID) {
        this.target = target
        this.client.bind(this.id.port, this.id.host)
        this.client.connect(target.port, target.host, (host, port) => {
            console.log(this.client.getAddr())
            this.id.port = port
            this.id.host = host
        })
        this.active = true
    }

    public close() {
        this.client.close()
        this.active = false
    }

}

export class ConnClientGate extends KeepClientGate {

    protected getMode(): Mode {
        return "conn";
    }

    public open(target: SpaceID) {
        this.target = target
    }

    public send(action:Action, all?:boolean, callBack?: receivedCallback, blocking?:boolean, args?:any[]) {
        super.open(this.target)
        super.send(action, all,(mess) => {
            callBack(mess)
            super.close()
        }, blocking, args)
    }

    public close() {}

}
