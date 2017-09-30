import {Space} from "./knolewdge";
import {TemplateField} from "./template";
import {ClientGate} from "./ClientGate"
import {Action, GateID, RespMessage, SpaceID} from "./protocol";
import {receivedCallback, tupleHandler} from "./cbDefinitions";
import {buildClientGate} from "./buildingUtils";
import {fromPTupleToTuple} from "./pSpaceValue";
/**
 * Created by SIMONE on 09/08/2017.
 */
export class RemoteSpace implements Space {

    private gate:ClientGate
    //private target:SpaceID

    constructor(id:GateID, target:SpaceID) {
        this.gate = buildClientGate(id)
        this.gate.open(target)
    }

    private handleResponse(action:Action, template: TemplateField[],
                           callback:tupleHandler, recvHandler?:receivedCallback, all?:boolean, blocking?:boolean) {
        this.gate.send(action, all, (resp:RespMessage) => {
            try {
                //console.log(resp)
                if (recvHandler != undefined) {
                    recvHandler(resp)
                }
                if (callback != undefined && resp.tuples.length != 0) {
                    let tuples: any[][] = []
                    for (let elem of resp.tuples) {
                        tuples.push(fromPTupleToTuple(elem))
                    }
                    setImmediate(() => {
                        callback(tuples)
                    })
                }
            } catch(err) {
                console.log('err at: ' + resp.messageType)
            }
        }, blocking, template)
    }

    public put(tuple: any[], recvHandler?:receivedCallback) {
        this.gate.send("PUT_REQUEST", undefined, recvHandler, false, tuple)
    }

    public getp(template: TemplateField[], callback:tupleHandler, recvHandler?:receivedCallback) {
        this.handleResponse("GET_REQUEST", template, callback, recvHandler, false, false)
    }

    public queryp(template: TemplateField[], callback:tupleHandler, recvHandler?:receivedCallback) {
        this.handleResponse("QUERY_REQUEST", template, callback, recvHandler, false, false)
    }
    public getAll(callback:tupleHandler, template?: TemplateField[], recvHandler?:receivedCallback) {
        this.handleResponse("GET_REQUEST", template, callback, recvHandler, true, false)
    }
    public queryAll(callback:tupleHandler, template?: TemplateField[], recvHandler?:receivedCallback) {
        this.handleResponse("QUERY_REQUEST", template, callback, recvHandler, true, false)
    }

}