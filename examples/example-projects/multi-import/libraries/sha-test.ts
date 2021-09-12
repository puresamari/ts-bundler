
///////////////////////////////////////////////////////
// Option 2: Import just the parts you need.
// import * as THREE from 'three';
// import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import shajs from "sha.js";


export default function init() {
  console.log(shajs('sha256').update('42').digest('hex'))
  // => 73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049
  console.log(new shajs.sha256().update('42').digest('hex'))
  // => 73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049
   
  var sha256stream = shajs('sha256')
  sha256stream.end('42')
  console.log(sha256stream.read().toString('hex'))

}