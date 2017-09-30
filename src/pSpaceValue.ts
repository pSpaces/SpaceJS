import {getType} from "./utils";
import {ActualTemplateField, FormalTemplateField, TemplateField} from "./template";

var classMap = {
    "String":"pspace:string",
    "Number":"pspace:double",
    "Boolean":"pspace:boolean",
    "Array":"pspace:tuple"
}

var declassMap = {
    "pspace:string":"String",
    "pspace:double":"Number",
    "pspace:boolean":"Boolean",
    "pspace:tuple":"Array"
}

var template_uri = "pspace:template"

export abstract class SpaceValue{

    public value:any
    public type:string

}

export function fromPTupleToTuple(value:SpaceValue[]):any[] {
    if (value == undefined) {
        return
    }
    var tuple = []
    for (let elem of value) {
        tuple.push(elem.value)
    }
    return tuple
}

export function fromTupleToPTuple(value:any[]):SpaceValue[] {
    if (value == undefined) {
        return
    }
    var pTuple:SpaceValue[] = []
    for (let elem of value) {
        if (Array.isArray(elem)) {
            pTuple.push(new TupleValue(elem))
        } else {
            pTuple.push(new ElemValue(elem))
        }
    }
    return pTuple
}


export class TupleValue extends SpaceValue {

    /*public getValue():any[] {
        var tuple = []
        for (let elem of this.value) {
            tuple.push(elem.getValue())
        }
        return tuple
    }*/

    constructor(value:any[]) {
        super()
        this.value = new Array<SpaceValue>()
        this.type = "pSpace:Tuple"
        for (let elem of value) {
            if (Array.isArray(elem)) {
                this.value.push(new TupleValue(elem))
            } else {
                this.value.push(new ElemValue(elem))
            }
        }
    }

}

export function fromPTemplateToTemplate(ptemplate:TemplateValue[]):TemplateField[] {
    if (ptemplate == undefined) {
        return
    }
    var array:TemplateField[] = []
    for (let elem of ptemplate) {
        if (elem.formal) {
            array.push(new FormalTemplateField(declassMap[elem.value]))
        } else {
            array.push(new ActualTemplateField(elem.value))
        }
    }
    return array
}

export function fromTemplateToPTemplate(template:TemplateField[]):TemplateValue[] {
    if (template == undefined) {
        return
    }
    var array:TemplateValue[] = []
    for (let elem of template) {
        if (elem.isActual()) {
            array.push(new TemplateValue(elem.getValue(), false))
        } else {
            array.push(new TemplateValue(elem.getValue(), true))
        }
    }
    return array
}

export class ElemValue extends SpaceValue {

    constructor(value:any) {
        super()
        this.value = value
        this.type = classMap[getType(value)]
    }

}

export class TemplateValue{

    public value:any
    public formal:boolean


    constructor(value:any, formal:boolean) {
        this.formal = formal
        this.value = this.formal ? classMap[value] : value
    }

}


/*
function getActualTemplate(array:any[]):any {
    var tv:TemplateValue[] = []
    for (let elem of array) {
        if (getType(elem) == "Array") {
            tv.push(getActualTemplate(elem))
        } else {
            tv.push(new TemplateValue(elem, false))
        }
    }
    return tv
}

export function fromTemplateToPTemplate(template:TemplateField[]):TemplateValue[] {
    var pt:any[] = []
    for (let elem of template) {
        if (elem.isActual()) {
            if (getType(elem.getValue()) == "Array") {
                pt.push(getActualTemplate(elem.getValue()))
            }
        }
    }
    return pt
}

export function fromPTemplateToTemplate(pt:TemplateValue[]) {
    var template:TemplateField[] = []
    for (let elem of pt) {

    }
}
*

/*export class TemplateValue extends SpaceValue {

    protected formal:boolean

    protected getFormal():boolean {
        return this.formal
    }

    //value != array
    constructor(value:any, formal:boolean) {
        super()
        this.formal = formal
        this.value = value
        this.type = formal ? this.value : classMap[getType(value)]
    }

    public getValue() {
        return this.value
    }


}*/
