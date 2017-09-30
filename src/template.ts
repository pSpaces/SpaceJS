import {customEqual, getType} from "./utils";

export abstract class TemplateField {

    abstract match(obj: any) : boolean
    abstract isActual() : boolean
    abstract getValue() : any

}

interface FormalInterface {
    type: string
}

interface ActualInterface {
    value: any
}

export class FormalTemplateField extends TemplateField {

    private type:string
    constructor(type:string) {
        super()
        this.type = type
    }

    public getValue():string {
        return this.type
    }

    public match(obj: any): boolean {
        return getType(obj) == this.type
    }

    public isActual():boolean {
        return false
    }

}

export class ActualTemplateField extends TemplateField {

    private value:any

    constructor(value:any) {
        super()
        this.value = value
    }

    public getValue():any {
        return this.value
    }

    public match(obj: any): boolean {
        return customEqual(this.value, obj)

    }

    public isActual():boolean {
        return true
    }

}
