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
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export default {
  name: 'ThreeDMonitor',
  watch: {
  },
  props: {},
  methods: {
    init () {
      const container = document.getElementById('container')

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
      this.camera.position.set(100, 200, 300)

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xbfe3dd)
      this.scene.fog = new THREE.Fog(0xbfe3dd, 200, 1000)

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
      hemiLight.position.set(0, 200, 0)
      this.scene.add(hemiLight)

      const dirLight = new THREE.DirectionalLight(0xffffff)
      dirLight.position.set(0, 200, 100)
      dirLight.castShadow = true
      dirLight.shadow.camera.top = 180
      dirLight.shadow.camera.bottom = -100
      dirLight.shadow.camera.left = -120
      dirLight.shadow.camera.right = 120
      this.scene.add(dirLight)

      let that = this
      const loader = new FBXLoader()
      loader.load(
        'models/fbx/cloth.fbx',
        (object) => {
          object.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          that.scene.add(object)
        },
        null,
        (error) => {
          console.log(error)
        }
      )

      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.shadowMap.enabled = true
      container.appendChild(this.renderer.domElement)

      const controls = new OrbitControls(this.camera, this.renderer.domElement)
      controls.target.set(0, 0.5, 0)
      controls.update()
      controls.enablePan = false
      controls.enableDamping = true

      window.onresize = function () {
        that.camera.aspect = window.innerWidth / window.innerHeight
        that.camera.updateProjectionMatrix()
        that.renderer.setSize(window.innerWidth, window.innerHeight)
      }

      // stats
      this.stats = new Stats()
      container.appendChild(this.stats.dom)
    },
    animate () {
      requestAnimationFrame(this.animate)
      const delta = this.clock.getDelta()
      if (this.mixer) {
        this.mixer.update(delta)
      }
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    }
  },
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,
      stats: null,
      mixer: null,
      clock: null
    }
  },
  mounted () {
    this.clock = new THREE.Clock()
    this.init()
    this.animate()
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
