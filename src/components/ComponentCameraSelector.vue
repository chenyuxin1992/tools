<template>
  <div>
    <Dialog
      ref="player_dialog"
      :title="(devidx === null ? '' : devidx) + (no === null ? '' : '_' + no + ' ') + title"
      iconCls="icon-webcam"
      borderType="thin"
      :dialogStyle="{width:'55%',height:'60%',opacity:1}"
      :modal="false"
      :draggable="true"
      :resizable="true"
      :closed="true"
    >
        <div style="width:100%;height:100%;">
          <ComponentMediaPlayer @onGetPtzPos="onGetPtzPos($event)" @onSetPtzPos="onSetPtzPos($event)" ref="player" style="width:100%;height:100%;">
          </ComponentMediaPlayer>
        </div>
    </Dialog>
    <Layout>
      <LayoutPanel
        v-if="imgPath!=null"
        region="south"
        :border="false"
        style="height:200px;"
      >
        <img :src="imgPath" width="100%" height="195px">
      </LayoutPanel>
      <LayoutPanel
        region="center"
        :border="false"
        style="height:100%;"
        :collapsible="false"
        :collapsed="false"
        :expander="true"
      >
        <template slot="header">
          <div class="f-row">
            <LinkButton @click="reload()" iconCls="icon-reload" :plain="true" v-Tooltip="'刷新'"></LinkButton>
            <LinkButton :disabled="no===null || preset===null" @click="doUpdatePreset()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'保存预置位'"></LinkButton>
            <LinkButton @click="doDeletePreset()" iconCls="icon-cross" :plain="true" v-Tooltip="'删除预置位'"></LinkButton>
            <LinkButton :disabled="no===null" @click="doGetPtzPos()" iconCls="icon-surveillance-camera" :plain="true" v-Tooltip="'获取摄像机参数'"></LinkButton>
            <LinkButton :disabled="no===null" @click="doCreatePreset()" iconCls="icon-plug-disconnect" :plain="true" v-Tooltip="'创建预置位'"></LinkButton>
            <LinkButton :disabled="preset===null || devidx===null" @click="doGetPicture()" iconCls="icon-camera" :plain="true" v-Tooltip="'截图'"></LinkButton>
            <p>H:{{ptzH}} V:{{ptzV}} Z:{{ptzZ}}</p>
          </div>
        </template>
        <ComponentCameraTree
          @nodeDblClick="onNodeDblClick($event)"
          @selectionChange="onSelectionChange($event)"
          ref="detector"
        >
        </ComponentCameraTree>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
export default {
  name: 'ComponentCameraSelector',
  watch: {
  },
  methods: {
    reload () {
      this.$refs.detector.getData()
    },
    onGetPtzPos (event) {
      if (event.ptzpos === null) {
        this.$messager.alert({
          title: '提示',
          icon: 'error',
          msg: '获取云台参数失败!'
        })
        return
      }
      this.ptzH = event.ptzpos.ptz_h
      this.ptzV = event.ptzpos.ptz_v
      this.ptzZ = event.ptzpos.ptz_z
    },
    onSetPtzPos (event) {
      if (!event.success) {
        this.$messager.alert({
          title: '提示',
          icon: 'error',
          msg: '调用预置位失败!'
        })
      }
    },
    play () {
      let that = this
      setTimeout(function () {
        that.$refs.player.play(that.devidx, that.no)
      }, 500)
    },
    playByOutCode (outCode) {
      const info = outCode.split('_')
      if (info.length === 2) {
        this.devidx = info[0]
        this.no = info[1]
        this.$refs.player_dialog.open()
        this.play()
      }
    },
    onSelectionChange (event) {
      if (event.tp === 'preset') {
        this.preset = event.id
      } else {
        this.preset = null
      }
    },
    onNodeDblClick (event) {
      this.title = event.text
      this.devidx = null
      this.no = null
      if (event.tp === 'detector') {
        this.detector = event.id
        this.playByOutCode(event.out_code)
      } else if (event.tp === 'preset') {
        this.detector = event.parent.id
        this.playByOutCode(event.parent.out_code)
        this.doSetPtzPos(event.ptz_h, event.ptz_v, event.ipc_z)
      }
    },
    doCreatePreset () {
      this.$emit('onGetCameraParams', {
        ptzH: this.ptzH,
        ptzV: this.ptzV,
        ptzZ: this.ptzZ,
        devidx: this.devidx,
        no: this.no,
        detector: this.detector
      })
    },
    doUpdatePreset () {
      console.log(this.preset)
      this.request(
        'POST',
        'base/modelquery/',
        {
          __: 'preset_update',
          data: [{
            id: this.preset,
            ptz_h: this.ptzH,
            ptz_v: this.ptzV,
            ipc_z: this.ptzZ
          }]
        },
        (response) => {
          if (response.data.result === 'success') {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: '预置位保存成功'
            })
          } else {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: response.data.detail
            })
          }
        }
      )
    },
    doDeletePreset () {
      this.$refs.detector.deletePresets()
    },
    doGetPtzPos () {
      this.ptzH = null
      this.ptzV = null
      this.ptzZ = null
      this.$refs.player.getPtzPos()
    },
    doSetPtzPos (ptzh, ptzv, ptzz) {
      this.$refs.player.setPtzPos(ptzh, ptzv, ptzz)
    },
    doGetPicture () {
      this.imgPath = null

      if (this.preset && this.devidx) {
        var path = '/dlpath/' + this.preset + '/scene.jpg'
        this.request(
          'POST',
          'mediaex',
          {
            devIdx: this.devidx,
            channel: this.no,
            path: path
          },
          (response) => {
            if (response.data.success) {
              this.imgPath = 'https://' + location.hostname + ':8443/tools/' + 'dlpath/ivsdata/recognizewithdl/' + this.preset + '/scene.jpg'
              setTimeout(() => {
                this.imgPath = null
              }, 3000)
            } else {
              this.$messager.alert({
                title: '提示',
                icon: 'error',
                msg: '截图失败:' + response.data.detail
              })
            }
          }
        )
      }
    }
  },
  data () {
    return {
      title: '播放器',
      detector: null,
      devidx: null,
      no: null,
      ptzH: null,
      ptzV: null,
      ptzZ: null,
      preset: null,
      imgPath: null
    }
  },
  mounted () {
  }
}
</script>
