<template>
  <div>
    <Layout>
      <LayoutPanel
          region="center"
          headerCls="main-header"
          :title="title"
          iconCls="icon-images"
        >
        <canvas id="c" class="center"></canvas>
      </LayoutPanel>
    </Layout>
  </div>
</template>
<script>
import Fabric from 'fabric'
import axios from 'axios'
import Stomp from 'stompjs'

export default {
  data () {
    return {
      title: '图形预览',
      client: null,
      destination: '/exchange/nik_base/patrol',
      tables: [],
      canvas: null,
      clickX: 0,
      clickY: 0,
      width: 0,
      height: 0,
      loading: true,
      errored: false,
      websocket: null,
      pathLine: null
    }
  },
  created () {
    this.client = Stomp.client('ws://' + location.hostname + ':15674/ws')
    // this.client = Stomp.client('ws://129.28.103.85:15674/ws')
    // this.client = Stomp.client('ws://100.100.100.102:15674/ws')
    this.client.debug = null
    this.client.connect('admin', 'aicrobo', this.connectCallback, this.errorCallback, '/')
  },
  watch: {
  },
  mounted () {
    Fabric.fabric.Object.prototype.set({
      originX: 'left',
      originY: 'top',
      hasBorders: false,
      hasControls: false,
      hasRotatingPoint: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      selectable: false
    })

    this.initCanvas()
    this.openPicFile('data/pic/index.json')

    // let that = this
    // window.onresize = function () {
    //   that.width = window.innerWidth
    //   that.height = window.innerHeight
    // }
  },
  methods: {
    alterCanvasItem (pk, fields, animate = false) {
      if (this.canvas) {
        let that = this
        var objects = this.canvas.getObjects()
        objects.forEach(object => {
          if (object.type === 'i-text' && object.associate.key === pk) {
            if (animate === false || object.text !== fields[object.associate.column]) {
              object.set({
                text: fields[object.associate.column].toString(),
                opacity: animate ? 0 : object.originOpacity
              }).setCoords()
              if (animate) {
                object.animate('opacity', object.originOpacity, {
                  onChange: that.canvas.renderAll.bind(that.canvas)
                })
              }
            }
          } else if (object.type === 'image' && object.associate.key === pk && object.source) {
            let stop = object.source.lastIndexOf('.')
            let src = object.source.substring(0, stop - 1) + fields[object.associate.column] + object.source.substring(stop)
            if (animate === false || object.source !== src) {
              Fabric.fabric.Image.fromURL(src, function (oImg) {
                oImg.left = object.left
                oImg.top = object.top
                oImg.width = object.width
                oImg.height = object.height
                oImg.scaleX = object.scaleX
                oImg.scaleY = object.scaleY
                oImg.source = src
                oImg.angle = object.angle
                oImg.action = object.action
                oImg.associate = object.associate
                oImg.opacity = animate ? 0 : object.originOpacity
                oImg.originOpacity = object.originOpacity
                oImg.selectable = object.selectable
                oImg.hoverCursor = 'pointer'
                that.canvas.remove(object)
                that.canvas.add(oImg).requestRenderAll()
                if (animate) {
                  oImg.animate('opacity', 1, {
                    onChange: that.canvas.renderAll.bind(that.canvas)
                  })
                }
              })
            }
          }
        })
      }
    },
    connectCallback () {
      this.client.subscribe(this.destination, this.responseCallback)
    },
    responseCallback (message) {
      if (message.body) {
        console.log(message.body)
        const data = JSON.parse(message.body)
        if (data.action === 'post_save') {
          this.tables.forEach((table) => {
            if ('base.' + table.name === data.item.instance.model) {
              let index = table.keys.indexOf(data.item.instance.pk)
              if (index !== -1) {
                this.alterCanvasItem(data.item.instance.pk, data.item.instance.fields, true)
              }
            }
          })
          this.canvas.requestRenderAll()
        }
      }
    },
    errorCallback (message) {
      this.$messager.alert({
        title: '提示',
        icon: 'error',
        msg: message
      })
    },
    initCanvas () {
      this.canvas = new Fabric.fabric.Canvas('c', {
        includeDefaultValues: false,
        allowTouchScrolling: true,
        backgroundColor: '#000000',
        renderOnAddRemove: false,
        enableRetinaScaling: true,
        selection: false,
        path: '',
        width: window.innerWidth,
        height: window.innerHeight
      })

      let that = this

      this.canvas.on({
        'selection:created': function (e) {
          that.doAction(e.target)
        },
        'selection:updated': function (e) {
          that.doAction(e.target)
        },
        'selection:cleared': function (e) {
          that.object = {}
        },
        'after:render': function () {
          that.canvas.calcOffset()
        },
        'mouse:down': function (opt) {
          that.clickX = opt.absolutePointer.x
          that.clickY = opt.absolutePointer.y
          var evt = opt.e
          this.isDragging = true
          this.lastPosX = evt.clientX
          this.lastPosY = evt.clientY
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
    openPicFile (url) {
      axios({
        method: 'GET',
        url: url,
        data: {},
        params: {
          ts: new Date().getTime()
        }
      })
        .then((response) => {
          this.title = url
          let objects = response.data.objects
          this.tables = []
          objects.forEach(element => {
            if (element.action && element.action.type !== '') {
              element.selectable = true
              element.hoverCursor = 'pointer'
            }
            if (element.associate && element.associate.table !== undefined && element.associate.key !== undefined) {
              let index = -1
              // 关联后端数据的图元全部不显示
              if (element.opacity !== undefined) {
                element.originOpacity = element.opacity
                element.opacity = 0
              } else {
                element.originOpacity = 1
                element.opacity = 0
              }

              for (var i = 0; i < this.tables.length; i++) {
                if (this.tables[i].name === element.associate.table) {
                  index = i
                  break
                }
              }
              if (this.tables.length === 0 || index === -1) {
                this.tables.push({
                  name: element.associate.table,
                  load: false,
                  keys: [element.associate.key],
                  columns: [element.associate.column]
                })
              } else {
                if (this.tables[index].keys.indexOf(element.associate.key) === -1) {
                  this.tables[index].keys.push(element.associate.key)
                  this.tables[index].columns.push(element.associate.column)
                }
              }
            }
          })

          this.canvas.loadFromJSON(response.data, function () {
          })

          this.tables.forEach(table => {
            this.getData(table.name, table.keys)
          })
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error.toString()
          })
        })
        .finally((this.loading = false))
    },
    getData (table, keys) {
      axios({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/' + table + '/',
        params: {
          id__regex: '^(' + keys.toString().replace(/,/g, '|') + ')$'
        }
      })
        .then((response) => {
          response.data.results.forEach(row => {
            this.alterCanvasItem(row.id, row)
          })
          this.canvas.requestRenderAll()
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error.toString()
          })
        })
        .finally((this.loading = false))
    },
    post (url, data) {
      axios({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        url: url,
        data: JSON.parse(data)
      })
        .then((response) => {
          if (response.data.result !== 'success') {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: response.data
            })
          }
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error.toString()
          })
        })
        .finally((this.loading = false))
    },
    doAction (target) {
      switch (target.action.type) {
        case 'request':
          if (target.action.url !== '') {
            this.post(target.action.url, target.action.params)
          }
          break
        case 'switch':
          this.openPicFile(target.action.path)
          break
      }
      this.canvas.discardActiveObject().requestRenderAll()
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
canvas {
  display: block;
}
.center {
  width: 100%;
  height: calc(100vh);
  overflow: hidden;
}
</style>
