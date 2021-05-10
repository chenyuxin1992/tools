<template>
  <div>
    <Layout>
      <LayoutPanel region="center">
        <div id="container" class="center"></div>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
import * as THREE from 'three/build/three.module.js'
// import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
export default {
  name: 'ThreeDMonitor',
  watch: {
  },
  props: {},
  methods: {
    init () {
      this.clock = new THREE.Clock()
      const container = document.getElementById('container')

      // this.stats = new Stats()
      // container.appendChild(this.stats.dom)

      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(this.renderer.domElement)

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x50529E)

      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
      this.camera.position.set(5, 2, 8)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.target.set(0, 0.5, 0)
      this.controls.update()
      this.controls.enablePan = false
      this.controls.enableDamping = true

      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4))

      const dirLight = new THREE.DirectionalLight(0xffffff, 1)
      dirLight.position.set(5, 2, 8)
      this.scene.add(dirLight)

      // envmap
      const path = 'three/textures/cube/Park2/'
      const format = '.jpg'
      const envMap = new THREE.CubeTextureLoader().load([
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
      ])

      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('three/js/libs/draco/gltf/')

      let that = this

      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      loader.load('three/models/gltf/LittlestTokyo.glb', function (gltf) {
        const model = gltf.scene
        model.position.set(1, 1, 0)
        model.scale.set(0.01, 0.01, 0.01)
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = envMap
          }
        })
        that.scene.add(model)
        that.mixer = new THREE.AnimationMixer(model)
        that.mixer.clipAction(gltf.animations[0]).play()
        that.animate()
      }, undefined, (e) => {
        console.error(e)
      })

      window.onresize = function () {
        that.camera.aspect = window.innerWidth / window.innerHeight
        that.camera.updateProjectionMatrix()
        that.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    },
    animate () {
      requestAnimationFrame(this.animate)
      const delta = this.clock.getDelta()
      this.mixer.update(delta)
      this.controls.update()
      // this.stats.update()
      this.renderer.render(this.scene, this.camera)
    }
  },
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,
      // stats: null,
      mixer: null,
      clock: null
    }
  },
  mounted () {
    this.init()
  },
  components: {}
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.center {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;
}
</style>
