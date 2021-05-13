<template>
  <div>
    <Layout>
      <LayoutPanel
        region="west"
        style="width: 300px;"
        title="预置位列表"
        iconCls="icon-document-tree"
        :collapsible="true"
        :collapsed="false"
        :expander="true"
      >
        <ComponentCameraTree
          @nodeDblClick="onNodeDblClickCamera($event)"
          ref="detector"
        >
        </ComponentCameraTree>
      </LayoutPanel>
      <LayoutPanel
        region="center"
        headerCls="main-header"
        :title="title"
        style="height:100%"
        iconCls="icon-camera"
      >
        <div class="canvas_master">
          <canvas id="c" width="100%" height="100%"></canvas>
        </div>
      </LayoutPanel>
      <LayoutPanel
        region="east"
        style="width:300px;"
      >
        <template slot="header">
          <div class="f-row">
            <LinkButton @click="doSave()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'保存'"></LinkButton>
            <LinkButton @click="doDelete()" iconCls="icon-cross" :plain="true" v-Tooltip="'删除'"></LinkButton>
          </div>
        </template>
        <Layout>
          <LayoutPanel
            :border="false"
            v-if="object!==null"
            region="south"
            style="height:100%;"
          >
            <Form
              :model="prop"
              labelAlign="left"
              style="padding:10px 30px 10px 10px;"
            >
              <FormField label="巡视点位:">
                <TextBox v-model="object.data.name" :multiline="true" style="height:80px;"></TextBox>
              </FormField>
              <FormField label="识别类型:">
                <ComboBox v-model="object.data.group_id[0]" :plain="true" :data="groupIdOptions" :editable="false"></ComboBox>
              </FormField>
              <FormField label="计算方法:">
                <ComboBox v-model="object.data.calc_method" :plain="true" :data="calculateOptions" :editable="false"></ComboBox>
              </FormField>
              <ComponentCanvas
                @onUpdate="onSetDisplayPara($event)"
                ref="detailcanvas"
              >
              </ComponentCanvas>
            </Form>
          </LayoutPanel>
          <LayoutPanel
            :border="false"
            region="center"
            style="height:100%;"
          >
            <ComponentPatrolPointTree
              @nodeDblClick="onNodeDblClickPatrol($event)"
              @selectionChange="onSelectionChange($event)"
              ref="patrolpoint"
            >
            </ComponentPatrolPointTree>
          </LayoutPanel>
        </Layout>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
import Fabric from 'fabric'

export default {
  name: 'DLConfig',
  methods: {
    getDlDef () {
      this.request(
        'GET',
        'html/tools/dlpath/dldef.json',
        {},
        (response) => {
          var data = response.data
          var i = 0

          for (i = 0; i < data.calculate_def.id.length; i++) {
            this.calculateOptions.push({
              value: data.calculate_def.id[i],
              text: data.calculate_def.chn_desc[i]
            })
          }

          for (i = 0; i < data.group_def.id.length; i++) {
            this.groupIdOptions.push({
              value: data.group_def.id[i],
              text: data.group_def.chn_desc[i]
            })
          }
        }
      )
    },
    getDlConfig (preset) {
      this.request(
        'GET',
        'html/tools/dlpath/ivsdata/recognizewithdl/' + preset + '/config.json?ts=' + (new Date()).getTime(),
        {},
        (response) => {
          this.jsonToCanvas(response.data)
        },
        () => {
        },
        () => {
          this.preset = preset
          var url = 'html/tools/dlpath/ivsdata/recognizewithdl/' + this.preset + '/scene.jpg?ts=' + (new Date()).getTime()
          this.setBackgroundImage(url)
        }
      )
    },
    onNodeExpand (event) {
      if (!event.children) {
        this.request(
          'GET',
          'media/api/v2/channellist',
          {
            devidx: event.id
          },
          (response) => {
            if (response.data) {
              if (response.data.ChannelCount > 0) {
                const channels = response.data.ChannelList
                let children = []
                channels.forEach(channel => {
                  let child = {}
                  child.id = channel['channelIdx']
                  child.text = channel['channelName']
                  child.devidx = event.id
                  child.table = 'channel'
                  child.leaf = true
                  child.data = channel
                  child.flvUrl = channel['flv_url']
                  child.hlsUrl = channel['hls_url']
                  child.rtmpUrl = channel['rtmp_url']
                  child.rtspUrl = channel['rtsp_url']
                  child.snapUrl = channel['snapUrl']
                  child.ready = channel['ready']
                  child.online = channel['online']
                  child.iconCls = child.online ? 'icon-webcam' : 'icon-webcam-exclamation'
                  children.push(child)
                })
                this.$set(event, 'children', children)
              }
            }
          }
        )
      }
    },
    onNodeDblClickCamera (event) {
      console.log(event)
      this.canvas.clear()
      if (event.tp === 'preset') {
        this.getDlConfig(event.id)

        // if (this.substation !== event.substation) {
        //   this.substation = event.substation
        //   this.initPatrolPointTree()
        // }
        if (this.patrolpoint !== event.patrolpoint) {
          this.patrolpoint = event.patrolpoint
          this.$refs.patrolpoint.getDlData(this.patrolpoint)
        }
        this.title = event.name
      }
    },
    onNodeDblClickPatrol (event) {
      this.addPatrolPointRect(this.clickX, this.clickY, 100, 100, {
        id: event.id,
        name: event.name,
        group_id: [0],
        calc_method: 0,
        displaypara: {
          lefttop_x: [],
          lefttop_y: [],
          righttop_x: [],
          righttop_y: [],
          leftbottom_x: [],
          leftbottom_y: [],
          rightbottom_x: [],
          rightbottom_y: []
        }
      })
    },
    initPatrolPointTree () {
      this.$refs.patrolpoint.getData(this.substation)
    },
    initCanvas () {
      this.canvas = new Fabric.fabric.Canvas('c', {
        includeDefaultValues: false,
        preserveObjectStacking: true,
        renderOnAddRemove: false,
        enableRetinaScaling: true,
        path: '',
        width: window.innerWidth,
        height: window.innerHeight
      })

      let that = this

      this.canvas.on({
        'selection:created': function (e) {
          if (e.target.data) {
            console.log(e.target.data.displaypara.lefttop_x)
            that.object = e.target
            that.crop()
          }
        },
        'selection:updated': function (e) {
          if (e.target.data) {
            console.log(e.target.data.displaypara.lefttop_x)
            that.object = e.target
            that.crop()
          }
        },
        'selection:cleared': function (e) {
          that.object = null
        },
        'object:modified': function (e) {
          if (e.target.data) {
            that.crop()
          }
        },
        'after:render': function () {
          that.canvas.calcOffset()
        },
        'mouse:down': function (opt) {
          that.clickX = opt.absolutePointer.x
          that.clickY = opt.absolutePointer.y
          var evt = opt.e
          if (evt.altKey === true) {
            this.isDragging = true
            this.lastPosX = evt.clientX
            this.lastPosY = evt.clientY
            that.doSwitchMode(false)
          }
        },
        'mouse:move': function (opt) {
          if (this.isDragging) {
            var e = opt.e
            var vpt = this.viewportTransform
            vpt[4] += e.clientX - this.lastPosX
            vpt[5] += e.clientY - this.lastPosY
            this.requestRenderAll()
            this.lastPosX = e.clientX
            this.lastPosY = e.clientY
          }
        },
        'mouse:up': function (opt) {
          this.setViewportTransform(this.viewportTransform)
          if (this.isDragging) {
            this.isDragging = false
            that.doSwitchMode(true)
          }
        },
        'mouse:wheel': function (opt) {
          var delta = opt.e.deltaY
          var zoom = that.canvas.getZoom()
          zoom *= 0.999 ** delta
          if (zoom > 20) zoom = 20
          if (zoom < 0.01) zoom = 0.01
          that.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
          that.canvas.requestRenderAll()
          opt.e.preventDefault()
          opt.e.stopPropagation()
        }
      })
    },
    doSwitchMode (e) {
      this.canvas.selection = e
      this.canvas.getObjects().forEach(item => { item.selectable = e })
      this.canvas.discardActiveObject().requestRenderAll()
    },
    removeBackgroundImage () {
      this.canvas.backgroundImage = null
      this.canvas.requestRenderAll()
    },
    setBackgroundImage (url) {
      this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(this.canvas), {
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        crossOrigin: 'anonymous'
      })
    },
    doSave () {
      var path = '/dlpath/' + this.preset + '/config.json'
      var data = JSON.stringify(this.canvasToJson(), null, 4)
      this.request(
        'POST',
        'mediaex/setjson',
        {
          path: path,
          data: data
        },
        (response) => {
          if (response.data.success) {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: '图像识别配置保存成功:' + path
            })
          } else {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: '图像识别配置保存失败:' + response.data.detail
            })
          }
        }
      )
    },
    doDelete () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        for (var i = 0; i < objects.length; i++) {
          this.canvas.remove(objects[i])
        }
        this.canvas.discardActiveObject().renderAll()
      }
    },
    addPatrolPointRect (x, y, width, height, data) {
      var objects = this.canvas.getObjects('rect')
      for (var i = 0; i < objects.length; i++) {
        if (objects[i].data.id === data.id) {
          this.canvas.setActiveObject(objects[i]).renderAll()
          return
        }
      }
      var rect = new Fabric.fabric.Rect({
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        width: width,
        height: height,
        selectable: true,
        opacity: 0.5,
        fill: '#464557',
        stroke: '#f2eada',
        data: data
      })
      this.canvas.add(rect)
      this.canvas.setActiveObject(rect).renderAll()
    },
    crop () {
      var object = this.canvas.getActiveObject()
      if (object) {
        var cropped = new Image()

        var width = object.width * object.scaleX
        var height = object.height * object.scaleY
        var left = object.left - width / 2
        var top = object.top - height / 2

        var viewport = this.canvas.viewportTransform
        var zoom = viewport[0]
        var x = viewport[4]
        var y = viewport[5]

        cropped.src = this.canvas.toDataURL({
          left: x + left * zoom,
          top: y + top * zoom,
          width: width * zoom,
          height: height * zoom
        })

        let that = this

        cropped.onload = function () {
          var image = new Fabric.fabric.Image(cropped)
          var zx = image.width / width
          var zy = image.height / height
          var data = JSON.parse(JSON.stringify(object.data.displaypara))
          that.$refs.detailcanvas.initConfig(image, left, top, zx, zy, data)
        }
      }
    },
    canvasToJson () {
      var ltX = this.canvas.getWidth()
      var ltY = this.canvas.getHeight()
      var rbX = 0
      var rbY = 0

      var config = {
        classname: 'recognizewithdl',
        isvalid: 0,
        ismodify: 1,
        isxujidct: 0,
        errormsg: '',
        scenepic: 'scene.jpg',
        iscalibrate: 1,
        viewpic: 'view.jpg',
        shiftpic: 'shift.jpg',
        objectpara: {
          lefttop: null,
          rightbottom: null
        }
      }

      var objects = this.canvas.getObjects('rect')

      config['objectpara']['ref_num'] = objects.length

      for (var i = 0; i < objects.length; i++) {
        var width = objects[i].width * objects[i].scaleX
        var height = objects[i].height * objects[i].scaleY
        var left = objects[i].left - width / 2
        var top = objects[i].top - height / 2
        var displaypara = objects[i].data.displaypara

        ltX = Math.min(ltX, left)
        ltY = Math.min(ltY, top)
        rbX = Math.max(rbX, left + width)
        rbY = Math.max(rbY, top + height)

        config['objectpara']['ref_' + (i + 1)] = {
          id: objects[i].data.id,
          name: objects[i].data.name,
          calc_method: objects[i].data.calc_method,
          group_id: objects[i].data.group_id,
          lefttop: {
            x: Math.round(left),
            y: Math.round(top)
          },
          rightbottom: {
            x: Math.round(left + width),
            y: Math.round(top + height)
          },
          displaypara: displaypara
        }
      }

      config['objectpara']['lefttop'] = {
        x: ltX - 5,
        y: ltY - 5
      }
      config['objectpara']['rightbottom'] = {
        x: rbX + 5,
        y: rbY + 5
      }
      return config
    },
    jsonToCanvas (config) {
      var refNum = config['objectpara']['ref_num']
      for (var i = 0; i < refNum; i++) {
        var object = config['objectpara']['ref_' + (i + 1)]
        var data = {
          id: object.id,
          name: object.name,
          group_id: object.group_id,
          calc_method: object.calc_method,
          displaypara: object.displaypara
        }
        var left = Math.min(object['lefttop'].x, object['rightbottom'].x)
        var top = Math.min(object['lefttop'].y, object['rightbottom'].y)
        var width = Math.abs(object['lefttop'].x - object['rightbottom'].x)
        var height = Math.abs(object['lefttop'].y - object['rightbottom'].y)

        this.canvas.add(new Fabric.fabric.Rect({
          left: left + width / 2,
          top: top + height / 2,
          originX: 'center',
          originY: 'center',
          width: width,
          height: height,
          selectable: true,
          opacity: 0.5,
          fill: '#464557',
          stroke: '#f2eada',
          data: data
        }))
      }
      this.canvas.renderAll()
    },
    onSetDisplayPara (data) {
      console.log(data)
      var object = this.canvas.getActiveObject()
      if (object) {
        object.data.displaypara = data
      }
    }
  },
  data () {
    return {
      title: '请选择预置位',
      nodes: [],
      clickX: 0,
      clickY: 0,
      object: null,
      params: null,
      prop: {},
      keyCode: null,
      command: null,
      speed: 2,
      loading: false,
      calculateOptions: [],
      groupIdOptions: [],
      preset: null,
      substation: null,
      patrolpoint: null
    }
  },
  mounted () {
    Fabric.fabric.Object.prototype.set({
      originX: 'left',
      originY: 'top',
      transparentCorners: false,
      cornerColor: '#7DB9DE',
      cornerStrokeColor: '#3A8FB7',
      cornerStyle: 'circle',
      cornerSize: 6,
      hasBorders: true,
      borderColor: '#7DB9DE',
      hasControls: true,
      hasRotatingPoint: false,
      centeredRotation: true,
      centeredScaling: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: true,
      lockScalingX: false,
      lockScalingY: false,
      selectable: true,
      associate: {},
      action: {},
      source: ''
    })

    Fabric.fabric.ActiveSelection.prototype.set({
      originX: 'left',
      originY: 'top'
    })
    this.getDlDef()
    this.initCanvas()
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.canvas_master {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
