import {customEqual, removeValueFromArray} from "./utils";
import {TemplateField} from "./template";
import {SpaceDataStructure} from "./knolewdge";

class TupleSpaceTreeNode {

    private info:any
    private counter:number = 0
    private successors:TupleSpaceTreeNode[]
    private parent:TupleSpaceTreeNode

    constructor(info:any) {
        this.info = info
        this.successors = new Array<TupleSpaceTreeNode>()
    }

    private setParent(node:TupleSpaceTreeNode) {
        this.parent = node
    }

    public getParent():TupleSpaceTreeNode {
        return this.parent
    }

    public addChild(node:TupleSpaceTreeNode) {
        this.getSuccessors().push(node)
        node.setParent(this)
    }

    public removeChild(node:TupleSpaceTreeNode) {
        removeValueFromArray(this.getSuccessors(), node)
        node.setParent(undefined)
    }

    public getSuccessors():TupleSpaceTreeNode[] {
        return this.successors
    }

    public getInfo():any {
        return this.info
    }

    public increaseCounter() {
        this.counter++
    }

    public decreaseCounter() {
        this.counter--
    }

    public getCounter():number {
        return this.counter
    }

}

export class TreeSpaceDS implements SpaceDataStructure {


    public root: TupleSpaceTreeNode

    constructor() {
        this.root = new TupleSpaceTreeNode(undefined)
    }

    public put(tuple:any[]):boolean {
        if (tuple.length == 0) {
            return false
        }
        var chief = this.root
        var i:number
        for (i = 0; i < tuple.length - 1; i++) {
            chief = this.putOnSingleLevel(chief, tuple[i])
        }
        var lastNode:TupleSpaceTreeNode = this.putOnSingleLevel(chief, tuple[i])
        lastNode.increaseCounter()
        return true
    }

    private putOnSingleLevel(chief: TupleSpaceTreeNode, tupleValue):TupleSpaceTreeNode {
        for (let successor of chief.getSuccessors()) {
            if (customEqual(successor.getInfo(), tupleValue)) {
                return successor
            }
        }
        var node:TupleSpaceTreeNode = new TupleSpaceTreeNode(tupleValue)
        chief.addChild(node)
        return node
    }

    private queryRec(template:TemplateField[], tmp:TupleSpaceTreeNode[], chief:TupleSpaceTreeNode) {
        var index:number = tmp.length
        for (let node of chief.getSuccessors()) {
            if (template[index].match(node.getInfo())) {
                if (template.length - 1 === index) {
                    if (node.getCounter() === 0) {
                        break
                    }
                    tmp.push(node)
                    return
                }
                tmp.push(node)
                this.queryRec(template, tmp, node)
                if ((template.length === tmp.length) && tmp[tmp.length - 1].getCounter() !== 0) {
                    return
                }
            }
        }
        tmp.pop()
    }

    private baseQueryGet(template: TemplateField[], remove:boolean):any[] {
        var nodes:TupleSpaceTreeNode[] = []
        if (template.length != 0) {
            this.queryRec(template, nodes, this.root)
        }
        if (nodes.length != 0) {
            if (remove) {
                this.removeTupleFromTree(nodes);
            }
            return this.tuplify(nodes)
        }
        return
    }

    public queryp(template:TemplateField[]):any[] {
        return this.baseQueryGet(template, false)
    }

    public getp(template:TemplateField[]):any[] {
        return this.baseQueryGet(template, true)
    }

    private otherTuples(node:TupleSpaceTreeNode):boolean {
        var succ:boolean = node.getSuccessors().length !== 0
        var others:boolean = node.getCounter() !== 0
        return succ || others
    }

    private removeTupleFromTree(nodes: TupleSpaceTreeNode[]) {
        var lastNode:TupleSpaceTreeNode = nodes[nodes.length - 1]
        lastNode.decreaseCounter()
        if (!this.otherTuples(lastNode)) {
            for (let node of nodes) {
                var parent:TupleSpaceTreeNode = node.getParent()
                if (node.getCounter() === 0 && node.getSuccessors().length === 0) {
                    parent.removeChild(node)
                } else {
                    break
                }
            }
            //nodes = nodes.reverse()
        }
    }

    private tuplify(nodes:TupleSpaceTreeNode[]):any[] {
        var tuple:any[] = []
        for (let elem of nodes) {
            tuple.push(elem.getInfo())
        }
        return tuple
    }

    private queryAllRec(subRoot:TupleSpaceTreeNode, nodes:any[][], tmp:TupleSpaceTreeNode[]) {
        var counter:number
        if ((counter = subRoot.getCounter()) !== 0) {
            for (let j:number = 0; j < counter; j++) {
                nodes.push(this.tuplify(tmp))
            }
        }
        for (let node of subRoot.getSuccessors()) {
            tmp.push(node)
            this.queryAllRec(node, nodes, tmp)
        }
        tmp.pop()
    }

    private queryAllRecByT(template:TemplateField[], subRoot:TupleSpaceTreeNode,
                           index:number, nodes:TupleSpaceTreeNode[][], tmp:TupleSpaceTreeNode[]) {
        if (index === template.length) {
            if (subRoot.getCounter() !== 0) {
                var counter = subRoot.getCounter()
                for (let j:number = 0; j < counter; j++) {
                    nodes.push(tmp.slice())
                }
            }
            tmp.pop()
            return
        }
        for (let node of subRoot.getSuccessors()) {
            if (template[index].match(node.getInfo())) {
                tmp.push(node)
                this.queryAllRecByT(template, node, index + 1, nodes, tmp)
            }
        }
        tmp.pop()
    }

    public getAll():any[][] {
        var ret:any[][] = this.queryAll()
        delete this.root
        this.root = new TupleSpaceTreeNode(undefined)
        return ret
    }

    public getAllByTemplate(template:TemplateField[]):any[][] {
        return this.baseAllByTemplate(template, true)
    }

    private baseAllByTemplate(template:TemplateField[], remove:boolean) {
        var tuples:TupleSpaceTreeNode[][] = []
        if (template.length == 0) {
            return [[]]
        }
        this.queryAllRecByT(template, this.root, 0, tuples, [])
        var tuplified:any[][] = []
        for (let elem of tuples) {
            tuplified.push(this.tuplify(elem))
            if (remove) {
                this.removeTupleFromTree(elem)
            }
        }
        return tuplified
    }

    public queryAllByTemplate(template:TemplateField[]):any[][] {
        return this.baseAllByTemplate(template, false)
    }

    public queryAll():any[][] {
        var tuples:any[][] = []
        this.queryAllRec(this.root, tuples, [])
        return tuples.length == 0 ? undefined : tuples
    }

}
