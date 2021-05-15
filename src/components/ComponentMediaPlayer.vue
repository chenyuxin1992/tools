<template>
  <Layout style="width:100%;height:100%;">
    <LayoutPanel region="south">
      <template slot="header">
        <div class="f-row">
          <Label>3D定位:</Label>
          <SwitchButton v-model="pos3d"></SwitchButton>
          <p style="width:5px;"></p>
          <ComboBox v-if="pos3d" v-model="controlMode" :data="controlModeChoices" style="width:90px;" :editable="false"></ComboBox>
        </div>
      </template>
    </LayoutPanel>
    <LayoutPanel region="center">
      <div class="center">
        <video id="video" class="video" @mousemove="omMouseMove($event)" @mousedown="omMouseDown($event)" @mouseup="omMouseUp($event)" @mouseleave="omMouseLeave($event)">
          Your browser is too old which doesn't support HTML5 video.
        </video>
      </div>
    </LayoutPanel>
  </Layout>
</template>

<script>
import flvjs from 'flv.js'

export default {
  name: 'ComponentMediaPlayer',
  watch: {
  },
  methods: {
    omMouseMove (event) {
      if (!this.pos3d) {
        const clientWidth = event.target.clientWidth
        const clientHeight = event.target.clientHeight
        const clickX = event.layerX
        const clickY = event.layerY
        let deltaX = clickX - clientWidth / 2
        let deltaY = clickY - clientHeight / 2

        let cursor = 'default'

        let mx = clientWidth * 0.2
        let my = clientHeight * 0.2

        if (deltaY < -my && deltaX < -mx) {
          this.command = 0x0702 // 上左
          cursor = 'nw-resize'
        } else if (deltaY < -my && deltaX > mx) {
          this.command = 0x0802 // 上右
          cursor = 'ne-resize'
        } else if (deltaY > my && deltaX < -mx) {
          this.command = 0x0704 // 下左
          cursor = 'sw-resize'
        } else if (deltaY > my && deltaX > mx) {
          this.command = 0x0804 // 下右
          cursor = 'se-resize'
        } else if (deltaY < -my) {
          this.command = 0x0402 // 上
          cursor = 'n-resize'
        } else if (deltaY > my) {
          this.command = 0x0404 // 下
          cursor = 's-resize'
        } else if (deltaX < -mx) {
          this.command = 0x0504 // 左
          cursor = 'w-resize'
        } else if (deltaX > mx) {
          this.command = 0x0502 // 右
          cursor = 'e-resize'
        } else if (deltaY < 0) {
          this.command = 0x0302 // 放大
          cursor = 'pointer'
        } else if (deltaY > 0) {
          this.command = 0x0304 // 缩小
          cursor = 'pointer'
        } else {
          this.command = null
        }
        event.target.style.cursor = cursor
      } else {
        event.target.style.cursor = 'default'
      }
    },
    omMouseDown (event) {
      if (!this.pos3d) {
        this.doPtzControl(this.command, this.speed)
      } else if (this.video) {
        const clickX = event.layerX
        const clickY = event.layerY

        this.xPress = clickX
        this.yPress = clickY
      }
    },
    omMouseUp (event) {
      if (!this.pos3d && this.command) {
        this.doPtzControl(this.command - 1, this.speed)
      } else if (this.video) {
        const clickX = event.layerX
        const clickY = event.layerY

        const clientWidth = this.video.clientWidth
        const clientHeight = this.video.clientHeight

        this.xRelease = clickX
        this.yRelease = clickY

        this.doPtz3DPos(clientWidth, clientHeight)
      }
    },
    omMouseLeave (event) {
      if (this.command) {
        this.command = null
        event.target.style.cursor = 'default'
      }
    },
    doPtzControl (command, speed) {
      if (this.prop.devidx) {
        this.request(
          'GET',
          'media/api/v2/ptzControl',
          {
            idx: this.prop.devidx,
            no: this.prop.no,
            command: command,
            para1: speed
          },
          (response) => {
          }
        )
      }
    },
    doPtz3DPos (clientWidth, clientHeight) {
      if (this.prop.devidx) {
        if (this.controlMode === 1) {
          // 海康3D-Position
          this.request(
            'GET',
            'media/api/v2/ptzControl',
            {
              idx: this.prop.devidx,
              no: this.prop.no,
              command: 0x0901,
              para1: this.xPress * 255 / clientWidth,
              para2: this.yPress * 255 / clientHeight,
              para3: this.xRelease * 255 / clientWidth,
              para4: this.yRelease * 255 / clientHeight
            },
            (response) => {
            }
          )
        } else if (this.controlMode === 2) {
          // 大华3D-Position
          var rectx = clientWidth / 2
          var recty = clientHeight / 2

          console.log(rectx, recty, this.xPress, this.yPress, this.xRelease, this.yRelease)

          var dx = (this.xPress + this.xRelease) / 2
          var dy = (this.yPress + this.yRelease) / 2

          var width = clientWidth
          var height = clientHeight

          var X = (dx - rectx) * 8192 * 2 / width
          var Y = (dy - recty) * 8192 * 2 / height

          var width2 = this.xRelease - this.xPress
          var height2 = this.yRelease - this.yPress
          var Z = 0

          if (height2 !== 0 && width2 !== 0) {
            if (this.yRelease >= this.yPress) {
              Z = (width * height) / (width2 * height2)
            } else {
              Z = -(width * height) / (width2 * height2)
            }
          }

          this.request(
            'GET',
            'media/api/v2/ptzControl',
            {
              idx: this.prop.devidx,
              no: this.prop.no,
              command: 0x0901,
              para1: X,
              para2: Y,
              para3: Z
            },
            (response) => {
            }
          )
          console.log(X, Y, Z)
        }
      }
    },
    getPtzPos () {
      if (this.prop.devidx) {
        this.request(
          'GET',
          'media/api/v2/getptzpos',
          {
            idx: this.prop.devidx,
            no: this.prop.no
          },
          (response) => {
            this.$emit('onGetPtzPos', response.data)
          }
        )
      }
    },
    setPtzPos (ptzh, ptzv, ptzz) {
      if (this.prop.devidx) {
        this.request(
          'GET',
          'media/api/v2/setptzpos',
          {
            idx: this.prop.devidx,
            no: this.prop.no,
            ptzh: ptzh,
            ptzv: ptzv,
            ptzz: ptzz
          },
          (response) => {
            this.$emit('onSetPtzPos', response.data)
          }
        )
      }
    },
    play (devidx, no) {
      // if (this.prop.devidx === devidx && this.prop.no === no) {
      //   return
      // }

      this.prop.devidx = devidx
      this.prop.no = no

      if (flvjs.isSupported()) {
        let url = 'wss://100.100.100.102:8443/media/' + devidx + '/' + no + '.flv'
        //let url = 'wss://' + location.hostname + ':8443/media/' + devidx + '/' + no + '.flv'
        if (this.player != null) {
          this.player.unload()
          this.player.detachMediaElement()
          this.player.destroy()
          this.player = null
        }
        this.player = flvjs.createPlayer(
          {
            isLive: true,
            enableWorker: true,
            cors: true,
            hasAudio: false,
            withCredentials: false,
            hasVideo: true,
            type: 'flv',
            url: url
          },
          {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
            }
          }
        )
        this.video = document.getElementById('video')
        this.player.attachMediaElement(this.video)
        this.player.load()
        this.player.play()
      }
    }
  },
  data () {
    return {
      video: null,
      player: null,
      prop: {},
      params: null,
      keyCode: null,
      command: null,
      speed: 2,
      pos3d: false,
      xPress: 0,
      yPress: 0,
      xRelease: 0,
      yRelease: 0,
      controlMode: 1,
      controlModeChoices: [
        { value: 1, text: '海康' },
        { value: 2, text: '大华' }
      ]
    }
  },
  mounted () {
  },
  created () {
    let that = this
    var command = 0

    document.onkeydown = function (e) {
      if (e.altKey && e.code === 'KeyK') {
        that.pos3d = !that.pos3d
      } else if (e.altKey && that.keyCode !== e.code) {
        switch (e.code) {
          case 'KeyW':
            // 上
            command = 0x0402
            that.doPtzControl(command, that.speed)
            break
          case 'KeyS':
            // 下
            command = 0x0404
            that.doPtzControl(command, that.speed)
            break
          case 'KeyA':
            // 左
            command = 0x0504
            that.doPtzControl(command, that.speed)
            break
          case 'KeyD':
            // 右
            command = 0x0502
            that.doPtzControl(command, that.speed)
            break
          case 'KeyQ':
            // 缩小
            command = 0x0302
            that.doPtzControl(command, that.speed)
            break
          case 'KeyE':
            // 放大
            command = 0x0304
            that.doPtzControl(command, that.speed)
            break
          case 'KeyR':
            // 雨刷开
            command = 0x0604
            that.doPtzControl(command, that.speed)
            break
          case 'KeyF':
            // 雨刷关
            command = 0x0605
            that.doPtzControl(command, that.speed)
            break
        }
      }
      that.keyCode = e.code
    }

    document.onkeyup = function (e) {
      if (e.altKey) {
        switch (e.code) {
          case 'KeyW':
            command = 0x0401
            that.doPtzControl(command, that.speed)
            break
          case 'KeyS':
            command = 0x0403
            that.doPtzControl(command, that.speed)
            break
          case 'KeyA':
            command = 0x0503
            that.doPtzControl(command, that.speed)
            break
          case 'KeyD':
            command = 0x0501
            that.doPtzControl(command, that.speed)
            break
          case 'KeyQ':
            command = 0x0301
            that.doPtzControl(command, that.speed)
            break
          case 'KeyE':
            command = 0x0303
            that.doPtzControl(command, that.speed)
            break
        }
      }
      that.keyCode = null
    }
  }
}
</script>

<style scoped>
.center {
  display: flex;
  align-items: center;
  width: 100%;
  height: calc(100vh - 117px);
  overflow: hidden;
  background-color: black;
}
.video {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
.control{
  right: 0;
  top: 0;
  position: fixed;
  z-index: 100;
  padding-top: 40px;
  padding-right: 10px;
}
</style>
