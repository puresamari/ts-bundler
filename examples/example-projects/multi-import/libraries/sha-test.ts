
///////////////////////////////////////////////////////
// Option 2: Import just the parts you need.
// import * as THREE from 'three';
// import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import hash from "hash.js";

export default function init() {
  hash.sha256().update('abc').digest('hex')
}