import {TemplateField} from "./template";
import {tupleHandler} from "./cbDefinitions";



export interface Space {
    put: (tuple: any[], callback?:tupleHandler) => void
    getp: (template: TemplateField[], callback:tupleHandler) => void
    //getAllByTemplate: (template: TemplateField[], callback:tupleHandler) => void
    getAll: (callback:tupleHandler, template?: TemplateField[]) => void
    queryp: (template:TemplateField[], callback:tupleHandler) => void
    queryAll: (callback:tupleHandler, template?: TemplateField[]) => void
    //queryAllByTemplate: (template: TemplateField[], callback:tupleHandler) => void
}

export interface SpaceDataStructure {
    put: (tuple: any[]) => boolean
    getp: (template: TemplateField[]) => any[]
    getAllByTemplate: (template: TemplateField[]) => any[][]
    queryp: (template: TemplateField[]) => any[]
    getAll: () => any[][]
    queryAll: () => any[][]
    queryAllByTemplate: (template: TemplateField[]) => any[][]
}
