import {Space, SpaceDataStructure} from "./knolewdge";
import {TemplateField} from "./template";
import {removeValueFromArray, testTemplateMatch} from "./utils";
import {tupleHandler} from "./cbDefinitions";

interface PendingRequest {
    template: TemplateField[]
    handler: tupleHandler
    removeTuple: boolean
}

export class TupleSpace implements Space {

    private tuples: SpaceDataStructure
    private pending: PendingRequest[] = []

    constructor(tuples: SpaceDataStructure) {
        this.tuples = tuples
    }

    public put(tuple: any[], callback?: tupleHandler) {
        for (let value of this.pending) {
            if (testTemplateMatch(value.template, tuple)) {
                if (!value.removeTuple) {
                    this.tuples.put(tuple)
                }
                removeValueFromArray(this.pending, value);
                setImmediate(value.handler, [tuple])
                return
            }
        }
        this.tuples.put(tuple)
        if (callback != undefined) {
            setImmediate(() => {
                callback([tuple])
            })
        }
    }

    public getp(template: TemplateField[], callback: tupleHandler) {
        let ret: any[] = this.tuples.getp(template)
        if (ret != undefined) {
            setImmediate(callback, [ret])
        } else {
            this.pending.push({template: template, handler: callback, removeTuple: true})
        }
    }


    public queryp(template: TemplateField[], callback: tupleHandler) {
        let ret: any[] = this.tuples.queryp(template)
        if (ret != undefined) {
            setImmediate(callback, [ret])
        } else {
            this.pending.push({template: template, handler: callback, removeTuple: false})
        }
    }


    protected getAllByTemplate(template: TemplateField[], callback: tupleHandler) {
        let ret: any[][] = this.tuples.queryAllByTemplate(template)
        if (ret != undefined) {
            setImmediate(callback, ret)
        } else {
            this.pending.push({template: template, handler: callback, removeTuple: true})
        }
    }


    public getAll(callback: tupleHandler, template?: TemplateField[]) {
        if (template == undefined) {
            let tuples: any[][] = this.tuples.getAll()
            setImmediate(callback, tuples)
        } else {
            this.getAllByTemplate(template, callback)
        }
    }

    protected queryAllByTemplate(template: TemplateField[], callback: tupleHandler) {
        let tuples: any[][] = this.tuples.queryAllByTemplate(template)
        if (tuples != undefined) {
            setImmediate(callback, tuples)
        } else {
            this.pending.push({template: template, handler: callback, removeTuple: false})
        }
    }

    public queryAll(callback: tupleHandler, template?: TemplateField[]) {
        if (template == undefined) {
            let tuples: any[][] = this.tuples.queryAll()
                setImmediate(callback, tuples)
        } else {
            this.queryAllByTemplate(template, callback)
        }
    }

}