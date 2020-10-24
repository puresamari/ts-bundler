
///////////////////////////////////////////////////////
// Option 2: Import just the parts you need.
import { Scene, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, WebGLRenderer } from 'three';

export default function init() {
  var scene = new Scene();
  var camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  var renderer = new WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var geometry = new BoxGeometry();
  var material = new MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = 5;

  var animate = function () {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
  };

  animate();
}