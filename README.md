# SpaceJS
Programming tuple spaces with TypeScript

## Requirements
This framework was written in TypeScript, a superset of ECMAScript standard. It's built over Node.js so you have to create a Node.js project in your IDE (e.g. WebStorm) in order to compile and run the code. Also, you need to include in your project the following Node.js packages:
* events
* net
* dgram
* typescript (available at https://www.npmjs.com/package/typescript).

## How it works
Let's see some basic snippets which give you an idea of how SpacesJS works:
* **SpaceRepository creation**: 
```
var spaceRep:SpaceRepository = new SpaceRepository()
spaceRep.addGate(new GateID(myIP, port, "keep"))
var tree:Space = new TupleSpace(new TreeSpaceDS())
spaceRep.addSpace(tree, "space")
```
* **RemoteSpace creation**:
```
var myID:GateID = new GateID("keep")
var targetSpace:SpaceID = new SpaceID(serverIp, serverPort, "keep", "Albero")
var space:RemoteSpace = new RemoteSpace(myID, targetSpace)
```
* **How to create a template and perform a match on a tuple**
```
var template:TemplateField[] = var t = [new FormalTemplateField('String'),...]
template.match(foo_tuple)
```

* **Actions on a space**
```
space.getp(template, (tuples) => {
    //do something with returned tuples
})
space.put(tuple)
space.queryAll((tuples) => {
    //do something with returned tuples
})
```

## Loading SpaceJS-based source file in a web page
Node.js is not intended to write client-side scripts, cause of `require()` instruction which browser can not execute. However, there are some useful Node.js packages meant to "convert" a Node.js-based source file into a JavaScript file loadable via HTML `<script>` tag:
* browserify (https://www.npmjs.com/package/browserify)
* watchify, which acts as a file watcher (https://www.npmjs.com/package/watchify).


