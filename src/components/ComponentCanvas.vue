<template>
  <Layout style="width:100%;height:100%;">
    <LayoutPanel region="center">
      <template slot="header">
        <div class="f-row">
          <LinkButton @click="doUpdate()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'更新'"></LinkButton>
          <LinkButton @click="doClear()" iconCls="icon-broom" :plain="true" v-Tooltip="'清除'"></LinkButton>
          <ButtonGroup selectionMode="single">
            <LinkButton @click="setDrawMode(10)" iconCls="icon-edit" :plain="true" :toggle="true" :selected="true" v-Tooltip="'编辑'"></LinkButton>
            <LinkButton @click="setDrawMode(11)" iconCls="icon-eraser" :plain="true" :toggle="true" v-Tooltip="'擦除'"></LinkButton>
            <LinkButton @click="setDrawMode(7)" iconCls="icon-layer-shape-polygon" :toggle="true" :plain="true" v-Tooltip="'绘制计算区域'"></LinkButton>
          </ButtonGroup>
        </div>
      </template>
      <div class="canvas_master">
        <canvas id="canvas" width="100%" height="100%"></canvas>
      </div>
    </LayoutPanel>
  </Layout>
</template>

<script>
import Fabric from 'fabric'

function Point (x, y) {
  this.x = x
  this.y = y
}

const WIN_WIDTH = 256

const DRAW_MODE_NONE = 10 // 图片浏览
const DRAW_MODE_ERASE = 11 // 橡皮擦
const DRAW_MODE_RECT = 3 // 轮廓
// const DRAW_MODE_ELLIPSE = 9 // 环形表椭圆轮廓
// const DRAW_MODE_NEEDLECENTER = 12 // 模拟表指针旋转中心
const DRAW_MODE_LINE = 4 // 模拟表指针
// const DRAW_MODE_POINT = 5 // 模拟表刻度
// const DRAW_MODE_POLYGON = 6 // 数字表、干燥剂四边形
const DRAW_MODE_MULTIPOLYGON = 7 // 红外测温四边形区域
// const DRAW_MODE_EDITLINE = 8 // 环形指针表刻度

const DRAW_POINT_SIZE = 5 // 直线、矩形、多边形顶点宽度
const DRAW_POINT_STROKESIZE = 1 // 直线、矩形、多边形顶点轮廓宽度
// const DRAW_ELLIPSE_SIZE = 5 // 椭圆形半径
// const DRAW_ELLIPSE_STROKESIZE = 1 // 椭圆形轮廓宽度
const DRAW_POLYLINE_WIDTH = 1 // 多边形直线宽度
// const DRAW_TEXT_FONTSIZE = 10 // 字体大小

// const DRAW_ELLIPSE_FILLCOLOR = '#feeeed' // 椭圆形填充色 透明transparent
// const DRAW_ELLIPSE_STROKECOLOR = '#FF0000' // 椭圆形轮廓色
const DRAW_POINT_FILLCOLOR = '#78cdd1' // 直线、矩形、多边形顶点填充色 透明transparent
const DRAW_POINT_STROKECOLOR = '#0000FF' // 直线、矩形、多边形顶点轮廓色
const DRAW_POLYLINE_COLOR = '#0000FF' // 多边形直线颜色
// const DRAW_POINTERLINE_COLOR = '#00FF00' // 指针直线颜色
// const DRAW_SCALELINE_COLOR = '#0000FF' // 刻度直线颜色
// const DRAW_SCALETEXT_COLOR = '#464547' // 刻度文字颜色 (70, 69, 71)
// const DRAW_SCALETEXT_BGCOLOR = '#f2eada' // 刻度文字背景颜色 (242, 234, 218)

const DRAW_LAYER_OPACITY = 0.6 // 图层透明度

export default {
  name: 'ComponentCanvas',
  watch: {
  },
  methods: {
    initCanvas () {
      this.canvas = new Fabric.fabric.Canvas('canvas', {
        includeDefaultValues: false,
        preserveObjectStacking: true,
        backgroundColor: '#000000',
        renderOnAddRemove: false,
        enableRetinaScaling: true,
        selection: false,
        width: WIN_WIDTH
      })

      let that = this

      this.canvas.on({
        'selection:created': function (e) {
          if (that.drawMode === DRAW_MODE_ERASE) {
            if (e.target.line1) {
              that.canvas.remove(e.target.line1)
            }

            if (e.target.line2) {
              that.canvas.remove(e.target.line2)
            }

            if (e.target.line3) {
              that.canvas.remove(e.target.line3)
            }

            if (e.target.line4) {
              that.canvas.remove(e.target.line4)
            }

            if (e.target.rt) {
              that.canvas.remove(e.target.rt)
            }

            if (e.target.rb) {
              that.canvas.remove(e.target.rb)
            }

            if (e.target.lb) {
              that.canvas.remove(e.target.lb)
            }

            if (e.target.lt) {
              that.canvas.remove(e.target.lt.rt)
              that.canvas.remove(e.target.lt.rb)
              that.canvas.remove(e.target.lt.lb)
              that.canvas.remove(e.target.lt.line1)
              that.canvas.remove(e.target.lt.line2)
              that.canvas.remove(e.target.lt.line3)
              that.canvas.remove(e.target.lt.line4)
              that.canvas.remove(e.target.lt)
            }

            that.canvas.remove(e.target)
            that.canvas.fire('object:modified', {target: null})
            that.canvas.renderAll()
          }
        },
        'object:modified': function (e) {
          if (e.target) {
            if (e.target.objType === 'lefttoprect' || e.target.objType === 'righttoprect' ||
                e.target.objType === 'leftbottomrect' || e.target.objType === 'rightbottomrect') {
              var lefttop = new Point(that.displayPolygon.lefttop.left, that.displayPolygon.lefttop.top)
              var righttop = new Point(that.displayPolygon.righttop.left, that.displayPolygon.righttop.top)
              var leftbottom = new Point(that.displayPolygon.leftbottom.left, that.displayPolygon.leftbottom.top)
              var rightbottom = new Point(that.displayPolygon.rightbottom.left, that.displayPolygon.rightbottom.top)
              that.setDisplayPolygon(lefttop, righttop, leftbottom, rightbottom)
            }

            if (e.target.objType === 'area_lt' || e.target.objType === 'area_rb' ||
                e.target.objType === 'area_lb' || e.target.objType === 'area_rt') {
              that.repaintAreaLine()
            }
          }
        },
        'object:moving': function (e) {
          if (e.target) {
            if (e.target.objType === 'lefttoprect' || e.target.objType === 'righttoprect' ||
                e.target.objType === 'leftbottomrect' || e.target.objType === 'rightbottomrect') {
              var lefttop = new Point(that.displayPolygon.lefttop.left, that.displayPolygon.lefttop.top)
              var righttop = new Point(that.displayPolygon.righttop.left, that.displayPolygon.righttop.top)
              var leftbottom = new Point(that.displayPolygon.leftbottom.left, that.displayPolygon.leftbottom.top)
              var rightbottom = new Point(that.displayPolygon.rightbottom.left, that.displayPolygon.rightbottom.top)
              that.setDisplayPolygon(lefttop, righttop, leftbottom, rightbottom)
            }

            if (e.target.objType === 'area_lt' || e.target.objType === 'area_rb' ||
                e.target.objType === 'area_lb' || e.target.objType === 'area_rt') {
              that.repaintAreaLine()
            }
          }
        },
        'mouse:down': function (e) {
          that.dragmove = true
          that.clickX = e.absolutePointer.x
          that.clickY = e.absolutePointer.y
          that.moveX = -1
          that.moveY = -1
        },
        'mouse:move': function (e) {
          if (that.dragmove) {
            that.moveX = e.absolutePointer.x
            that.moveY = e.absolutePointer.y
            switch (that.drawMode) {
              case DRAW_MODE_MULTIPOLYGON:
                var lefttop = new Point(Math.min(that.clickX, that.moveX), Math.min(that.clickY, that.moveY))
                var righttop = new Point(Math.max(that.clickX, that.moveX), Math.min(that.clickY, that.moveY))
                var leftbottom = new Point(Math.min(that.clickX, that.moveX), Math.max(that.clickY, that.moveY))
                var rightbottom = new Point(Math.max(that.clickX, that.moveX), Math.max(that.clickY, that.moveY))
                that.setAreaPolygonPaint(lefttop, righttop, leftbottom, rightbottom)
                break
              default:
                break
            }
          }
        },
        'mouse:up': function (e) {
          if (that.dragmove) {
            if (that.clickX > 0 && that.clickY > 0 && that.moveX > 0 && that.moveY > 0) {
              switch (that.drawMode) {
                case DRAW_MODE_MULTIPOLYGON:
                  that.removeAreaPolygonPaint()
                  var x1 = that.clickX
                  var y1 = that.clickY
                  var x2 = that.moveX
                  var y2 = that.moveY
                  if (x1 != null && y1 != null && x2 != null && y2 != null) {
                    var lefttop = new Point(Math.min(x1, x2), Math.min(y1, y2))
                    var righttop = new Point(Math.max(x1, x2), Math.min(y1, y2))
                    var leftbottom = new Point(Math.min(x1, x2), Math.max(y1, y2))
                    var rightbottom = new Point(Math.max(x1, x2), Math.max(y1, y2))
                    that.setAreaPolygon(lefttop, righttop, leftbottom, rightbottom)
                    that.repaintAreaLine()
                  }
                  break
                default:
                  break
              }
            }
            that.dragmove = false
          }
        }
      })
    },
    setBackgroundImage (image) {
      this.zoom = WIN_WIDTH / image.width
      this.canvas.clear()
      this.canvas.setHeight(image.height * this.zoom)
      this.canvas.setBackgroundImage(image)
      this.canvas.zoomToPoint({x: 0, y: 0}, this.zoom)
      this.canvas.requestRenderAll()
    },
    setObjectSelectable (editable) {
      this.canvas.discardActiveObject()

      var objects = this.canvas.getObjects()

      objects.forEach(function (obj) {
        if (obj.objType) {
          switch (obj.objType) {
            case 'boundingrect':
              obj.set({
                selectable: false
              })
              break
            case 'lefttoprect':
            case 'righttoprect':
            case 'leftbottomrect':
            case 'rightbottomrect':
            case 'area_lt':
            case 'area_lb':
            case 'area_rt':
            case 'area_rb':
              obj.set({
                selectable: editable
              })
              break
            default:
              break
          }
        }
      })
    },
    setDrawMode (mode) {
      switch (mode) {
        case DRAW_MODE_NONE:
        case DRAW_MODE_ERASE:
          this.drawMode = mode
          this.setObjectSelectable(true)
          break
        case DRAW_MODE_RECT:
          this.drawMode = DRAW_MODE_RECT
          this.setObjectSelectable(false)
          break
        case DRAW_MODE_LINE:
          this.drawMode = DRAW_MODE_LINE
          this.setObjectSelectable(false)
          break
        case DRAW_MODE_MULTIPOLYGON:
          this.drawMode = DRAW_MODE_MULTIPOLYGON
          this.setObjectSelectable(false)
          break
        default:
          break
      }
    },
    repaintAreaLine () {
      var objects = this.canvas.getObjects()
      var that = this
      objects.forEach(function (obj) {
        if (obj.objType && obj.objType === 'area_lt') {
          var lt = obj
          var rt = obj.rt
          var lb = obj.lb
          var rb = obj.rb

          var line1 = obj.line1
          var line2 = obj.line2
          var line3 = obj.line3
          var line4 = obj.line4

          var linedlt = 0 - (DRAW_POLYLINE_WIDTH / that.zoom) / 2

          line1.set({
            x1: lt.left,
            y1: lt.top,
            x2: rt.left,
            y2: rt.top,
            left: Math.min(lt.left, rt.left) + linedlt,
            top: Math.min(lt.top, rt.top) + linedlt
          }).setCoords()

          line2.set({
            x1: lt.left,
            y1: lt.top,
            x2: lb.left,
            y2: lb.top,
            left: Math.min(lt.left, lb.left) + linedlt,
            top: Math.min(lt.top, lb.top) + linedlt
          }).setCoords()

          line3.set({
            x1: rt.left,
            y1: rt.top,
            x2: rb.left,
            y2: rb.top,
            left: Math.min(rt.left, rb.left) + linedlt,
            top: Math.min(rt.top, rb.top) + linedlt
          }).setCoords()

          line4.set({
            x1: lb.left,
            y1: lb.top,
            x2: rb.left,
            y2: rb.top,
            left: Math.min(lb.left, rb.left) + linedlt,
            top: Math.min(lb.top, rb.top) + linedlt
          }).setCoords()

          line1.sendToBack()
          line2.sendToBack()
          line3.sendToBack()
          line4.sendToBack()
        }
      })
      this.canvas.renderAll()
    },
    setAreaPolygonPaint (lefttop, righttop, leftbottom, rightbottom) {
      if (lefttop != null && righttop != null && leftbottom != null && rightbottom != null) {
        if (this.displayPolygon === null) {
          this.displayPolygon = {
            lefttop: null,
            righttop: null,
            leftbottom: null,
            rightbottom: null,
            line1: null,
            line2: null,
            line3: null,
            line4: null
          }

          this.displayPolygon.lefttop = new Fabric.fabric.Ellipse({
            objType: 'lefttoprect',
            left: lefttop.x,
            top: lefttop.y,
            rx: DRAW_POINT_SIZE / this.zoom,
            ry: DRAW_POINT_SIZE / this.zoom,
            originX: 'center',
            originY: 'center',
            selectable: true,
            opacity: DRAW_LAYER_OPACITY,
            strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
            stroke: DRAW_POINT_STROKECOLOR,
            fill: DRAW_POINT_FILLCOLOR
          })

          this.displayPolygon.righttop = new Fabric.fabric.Ellipse({
            objType: 'righttoprect',
            left: righttop.x,
            top: righttop.y,
            rx: DRAW_POINT_SIZE / this.zoom,
            ry: DRAW_POINT_SIZE / this.zoom,
            originX: 'center',
            originY: 'center',
            selectable: true,
            opacity: DRAW_LAYER_OPACITY,
            strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
            stroke: DRAW_POINT_STROKECOLOR,
            fill: DRAW_POINT_FILLCOLOR
          })

          this.displayPolygon.leftbottom = new Fabric.fabric.Ellipse({
            objType: 'leftbottomrect',
            left: leftbottom.x,
            top: leftbottom.y,
            rx: DRAW_POINT_SIZE / this.zoom,
            ry: DRAW_POINT_SIZE / this.zoom,
            originX: 'center',
            originY: 'center',
            selectable: true,
            opacity: DRAW_LAYER_OPACITY,
            strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
            stroke: DRAW_POINT_STROKECOLOR,
            fill: DRAW_POINT_FILLCOLOR
          })

          this.displayPolygon.rightbottom = new Fabric.fabric.Ellipse({
            objType: 'rightbottomrect',
            left: rightbottom.x,
            top: rightbottom.y,
            rx: DRAW_POINT_SIZE / this.zoom,
            ry: DRAW_POINT_SIZE / this.zoom,
            originX: 'center',
            originY: 'center',
            selectable: true,
            opacity: DRAW_LAYER_OPACITY,
            strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
            stroke: DRAW_POINT_STROKECOLOR,
            fill: DRAW_POINT_FILLCOLOR
          })

          var linedlt = 0 - (DRAW_POLYLINE_WIDTH / this.zoom) / 2

          this.displayPolygon.line1 = new Fabric.fabric.Line([
            this.displayPolygon.lefttop.left,
            this.displayPolygon.lefttop.top,
            this.displayPolygon.righttop.left,
            this.displayPolygon.righttop.top], {
            left: Math.min(this.displayPolygon.lefttop.left, this.displayPolygon.righttop.left) + linedlt,
            top: Math.min(this.displayPolygon.lefttop.top, this.displayPolygon.righttop.top) + linedlt,
            selectable: false,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
            stroke: DRAW_POLYLINE_COLOR,
            opacity: DRAW_LAYER_OPACITY
          })

          this.displayPolygon.line2 = new Fabric.fabric.Line([
            this.displayPolygon.lefttop.left,
            this.displayPolygon.lefttop.top,
            this.displayPolygon.leftbottom.left,
            this.displayPolygon.leftbottom.top], {
            left: Math.min(this.displayPolygon.lefttop.left, this.displayPolygon.leftbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.lefttop.top, this.displayPolygon.leftbottom.top) + linedlt,
            selectable: false,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
            stroke: DRAW_POLYLINE_COLOR,
            opacity: DRAW_LAYER_OPACITY
          })

          this.displayPolygon.line3 = new Fabric.fabric.Line([
            this.displayPolygon.righttop.left,
            this.displayPolygon.righttop.top,
            this.displayPolygon.rightbottom.left,
            this.displayPolygon.rightbottom.top], {
            left: Math.min(this.displayPolygon.righttop.left, this.displayPolygon.rightbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.righttop.top, this.displayPolygon.rightbottom.top) + linedlt,
            selectable: false,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
            stroke: DRAW_POLYLINE_COLOR,
            opacity: DRAW_LAYER_OPACITY
          })

          this.displayPolygon.line4 = new Fabric.fabric.Line([
            this.displayPolygon.leftbottom.left,
            this.displayPolygon.leftbottom.top,
            this.displayPolygon.rightbottom.left,
            this.displayPolygon.rightbottom.top], {
            left: Math.min(this.displayPolygon.leftbottom.left, this.displayPolygon.rightbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.leftbottom.top, this.displayPolygon.rightbottom.top) + linedlt,
            selectable: false,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
            stroke: DRAW_POLYLINE_COLOR,
            opacity: DRAW_LAYER_OPACITY
          })

          this.canvas.add(this.displayPolygon.line1)
          this.canvas.add(this.displayPolygon.line2)
          this.canvas.add(this.displayPolygon.line3)
          this.canvas.add(this.displayPolygon.line4)

          this.canvas.add(this.displayPolygon.lefttop)
          this.canvas.add(this.displayPolygon.righttop)
          this.canvas.add(this.displayPolygon.leftbottom)
          this.canvas.add(this.displayPolygon.rightbottom)
        } else {
          this.displayPolygon.lefttop.set({
            left: lefttop.x,
            top: lefttop.y,
            width: DRAW_POINT_SIZE / this.zoom,
            height: DRAW_POINT_SIZE / this.zoom,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.righttop.set({
            left: righttop.x,
            top: righttop.y,
            width: DRAW_POINT_SIZE / this.zoom,
            height: DRAW_POINT_SIZE / this.zoom,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.leftbottom.set({
            left: leftbottom.x,
            top: leftbottom.y,
            width: DRAW_POINT_SIZE / this.zoom,
            height: DRAW_POINT_SIZE / this.zoom,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.rightbottom.set({
            left: rightbottom.x,
            top: rightbottom.y,
            width: DRAW_POINT_SIZE / this.zoom,
            height: DRAW_POINT_SIZE / this.zoom,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          linedlt = 0 - (DRAW_POLYLINE_WIDTH / this.zoom) / 2

          this.displayPolygon.line1.set({
            x1: this.displayPolygon.lefttop.left,
            y1: this.displayPolygon.lefttop.top,
            x2: this.displayPolygon.righttop.left,
            y2: this.displayPolygon.righttop.top,
            left: Math.min(this.displayPolygon.lefttop.left, this.displayPolygon.righttop.left) + linedlt,
            top: Math.min(this.displayPolygon.lefttop.top, this.displayPolygon.righttop.top) + linedlt,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.line2.set({
            x1: this.displayPolygon.lefttop.left,
            y1: this.displayPolygon.lefttop.top,
            x2: this.displayPolygon.leftbottom.left,
            y2: this.displayPolygon.leftbottom.top,
            left: Math.min(this.displayPolygon.lefttop.left, this.displayPolygon.leftbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.lefttop.top, this.displayPolygon.leftbottom.top) + linedlt,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.line3.set({
            x1: this.displayPolygon.righttop.left,
            y1: this.displayPolygon.righttop.top,
            x2: this.displayPolygon.rightbottom.left,
            y2: this.displayPolygon.rightbottom.top,
            left: Math.min(this.displayPolygon.righttop.left, this.displayPolygon.rightbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.righttop.top, this.displayPolygon.rightbottom.top) + linedlt,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.displayPolygon.line4.set({
            x1: this.displayPolygon.leftbottom.left,
            y1: this.displayPolygon.leftbottom.top,
            x2: this.displayPolygon.rightbottom.left,
            y2: this.displayPolygon.rightbottom.top,
            left: Math.min(this.displayPolygon.leftbottom.left, this.displayPolygon.rightbottom.left) + linedlt,
            top: Math.min(this.displayPolygon.leftbottom.top, this.displayPolygon.rightbottom.top) + linedlt,
            strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom
          }).setCoords()

          this.canvas.renderAll()
        }
      }
    },
    setAreaPolygon (lefttop, righttop, leftbottom, rightbottom) {
      var lt = new Fabric.fabric.Ellipse({
        objType: 'area_lt',
        left: lefttop.x,
        top: lefttop.y,
        rx: DRAW_POINT_SIZE / this.zoom,
        ry: DRAW_POINT_SIZE / this.zoom,
        originX: 'center',
        originY: 'center',
        selectable: true,
        opacity: DRAW_LAYER_OPACITY,
        strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
        stroke: DRAW_POINT_STROKECOLOR,
        fill: DRAW_POINT_FILLCOLOR,
        hasControls: false,
        hasRotatingPoint: false
      })

      var rt = new Fabric.fabric.Ellipse({
        objType: 'area_rt',
        left: righttop.x,
        top: righttop.y,
        rx: DRAW_POINT_SIZE / this.zoom,
        ry: DRAW_POINT_SIZE / this.zoom,
        originX: 'center',
        originY: 'center',
        selectable: true,
        opacity: DRAW_LAYER_OPACITY,
        lt: lt,
        strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
        stroke: DRAW_POINT_STROKECOLOR,
        fill: DRAW_POINT_FILLCOLOR,
        hasControls: false,
        hasRotatingPoint: false
      })

      var lb = new Fabric.fabric.Ellipse({
        objType: 'area_lb',
        left: leftbottom.x,
        top: leftbottom.y,
        rx: DRAW_POINT_SIZE / this.zoom,
        ry: DRAW_POINT_SIZE / this.zoom,
        originX: 'center',
        originY: 'center',
        selectable: true,
        opacity: DRAW_LAYER_OPACITY,
        lt: lt,
        strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
        stroke: DRAW_POINT_STROKECOLOR,
        fill: DRAW_POINT_FILLCOLOR,
        hasControls: false,
        hasRotatingPoint: false
      })

      var rb = new Fabric.fabric.Ellipse({
        objType: 'area_rb',
        left: rightbottom.x,
        top: rightbottom.y,
        rx: DRAW_POINT_SIZE / this.zoom,
        ry: DRAW_POINT_SIZE / this.zoom,
        originX: 'center',
        originY: 'center',
        selectable: true,
        opacity: DRAW_LAYER_OPACITY,
        lt: lt,
        strokeWidth: DRAW_POINT_STROKESIZE / this.zoom,
        stroke: DRAW_POINT_STROKECOLOR,
        fill: DRAW_POINT_FILLCOLOR,
        hasControls: false,
        hasRotatingPoint: false
      })

      var linedlt = 0 - (DRAW_POLYLINE_WIDTH / this.zoom) / 2

      var line1 = new Fabric.fabric.Line([
        lt.left,
        lt.top,
        rt.left,
        rt.top], {
        left: Math.min(lt.left, rt.left) + linedlt,
        top: Math.min(lt.top, rt.top) + linedlt,
        selectable: false,
        strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
        stroke: DRAW_POLYLINE_COLOR,
        opacity: DRAW_LAYER_OPACITY
      })

      var line2 = new Fabric.fabric.Line([
        lt.left,
        lt.top,
        lb.left,
        lb.top], {
        left: Math.min(lt.left, lb.left) + linedlt,
        top: Math.min(lt.top, lb.top) + linedlt,
        selectable: false,
        strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
        stroke: DRAW_POLYLINE_COLOR,
        opacity: DRAW_LAYER_OPACITY
      })

      var line3 = new Fabric.fabric.Line([
        rt.left,
        rt.top,
        rb.left,
        rb.top], {
        left: Math.min(rt.left, rb.left) + linedlt,
        top: Math.min(rt.top, rb.top) + linedlt,
        selectable: false,
        strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
        stroke: DRAW_POLYLINE_COLOR,
        opacity: DRAW_LAYER_OPACITY
      })

      var line4 = new Fabric.fabric.Line([
        lb.left,
        lb.top,
        rb.left,
        rb.top], {
        left: Math.min(lb.left, rb.left) + linedlt,
        top: Math.min(lb.top, rb.top) + linedlt,
        selectable: false,
        strokeWidth: DRAW_POLYLINE_WIDTH / this.zoom,
        stroke: DRAW_POLYLINE_COLOR,
        opacity: DRAW_LAYER_OPACITY
      })

      lt.rt = rt
      lt.lb = lb
      lt.rb = rb

      lt.line1 = line1
      lt.line2 = line2
      lt.line3 = line3
      lt.line4 = line4

      this.canvas.add(line1)
      this.canvas.add(line2)
      this.canvas.add(line3)
      this.canvas.add(line4)

      this.canvas.add(lt)
      this.canvas.add(rt)
      this.canvas.add(lb)
      this.canvas.add(rb)
    },
    removeAreaPolygonPaint () {
      this.canvas.remove(this.displayPolygon.line1)
      this.canvas.remove(this.displayPolygon.line2)
      this.canvas.remove(this.displayPolygon.line3)
      this.canvas.remove(this.displayPolygon.line4)
      this.canvas.remove(this.displayPolygon.lefttop)
      this.canvas.remove(this.displayPolygon.righttop)
      this.canvas.remove(this.displayPolygon.leftbottom)
      this.canvas.remove(this.displayPolygon.rightbottom)
      this.displayPolygon = null
      this.canvas.renderAll()
    },
    doClear () {
      this.setBackgroundImage(this.image)
    },
    initConfig (image, x, y, zx, zy, displaypara) {
      this.image = image
      this.baseX = x
      this.baseY = y
      this.baseZX = zx
      this.baseZY = zy
      this.setBackgroundImage(image)
      this.initObjectPara(displaypara)
    },
    initObjectPara (displaypara) {
      if (displaypara) {
        try {
          for (var i = 0; i < displaypara.lefttop_x.length; i++) {
            displaypara.lefttop_x[i] -= this.baseX
            displaypara.lefttop_y[i] -= this.baseY
            displaypara.righttop_x[i] -= this.baseX
            displaypara.righttop_y[i] -= this.baseY
            displaypara.leftbottom_x[i] -= this.baseX
            displaypara.leftbottom_y[i] -= this.baseY
            displaypara.rightbottom_x[i] -= this.baseX
            displaypara.rightbottom_y[i] -= this.baseY

            var ltx = displaypara.lefttop_x[i]
            var lty = displaypara.lefttop_y[i]
            var rtx = displaypara.righttop_x[i]
            var rty = displaypara.righttop_y[i]
            var lbx = displaypara.leftbottom_x[i]
            var lby = displaypara.leftbottom_y[i]
            var rbx = displaypara.rightbottom_x[i]
            var rby = displaypara.rightbottom_y[i]

            var lefttop = new Point(ltx * this.baseZX, lty * this.baseZY)
            var righttop = new Point(rtx * this.baseZX, rty * this.baseZY)
            var leftbottom = new Point(lbx * this.baseZX, lby * this.baseZY)
            var rightbottom = new Point(rbx * this.baseZX, rby * this.baseZY)

            this.setAreaPolygon(lefttop, righttop, leftbottom, rightbottom)
          }
          this.repaintAreaLine()
        } catch (ex) {
          console.log(ex)
        }
      }
    },
    doUpdate () {
      var ltx = []
      var lty = []
      var rtx = []
      var rty = []
      var lbx = []
      var lby = []
      var rbx = []
      var rby = []

      var objects = this.canvas.getObjects()

      let that = this

      objects.forEach(function (obj) {
        if (obj.objType) {
          switch (obj.objType) {
            case 'area_lt':
              ltx.push(Math.round(that.baseX + (obj.left / that.baseZX)))
              lty.push(Math.round(that.baseY + (obj.top / that.baseZY)))
              break
            case 'area_rt':
              rtx.push(Math.round(that.baseX + (obj.left / that.baseZX)))
              rty.push(Math.round(that.baseY + (obj.top / that.baseZY)))
              break
            case 'area_lb':
              lbx.push(Math.round(that.baseX + (obj.left / that.baseZX)))
              lby.push(Math.round(that.baseY + (obj.top / that.baseZY)))
              break
            case 'area_rb':
              rbx.push(Math.round(that.baseX + (obj.left / that.baseZX)))
              rby.push(Math.round(that.baseY + (obj.top / that.baseZY)))
              break
            default:
              break
          }
        }
      })

      var displaypara = {
        lefttop_x: ltx,
        lefttop_y: lty,
        righttop_x: rtx,
        righttop_y: rty,
        leftbottom_x: lbx,
        leftbottom_y: lby,
        rightbottom_x: rbx,
        rightbottom_y: rby
      }

      this.$emit('onUpdate', displaypara)
    }
  },
  data () {
    return {
      baseX: 0,
      baseY: 0,
      baseZX: 1,
      baseZY: 1,
      image: null,
      zoom: 1,
      dragmove: false,
      clickX: 0,
      clickY: 0,
      moveX: 0,
      moveY: 0,
      displayPolygon: null,
      erase: true,
      drawMode: DRAW_MODE_NONE
    }
  },
  mounted () {
    // Fabric.fabric.Object.prototype.set({
    //   originX: 'left',
    //   originY: 'top',
    //   transparentCorners: false,
    //   cornerColor: '#7DB9DE',
    //   cornerStrokeColor: '#3A8FB7',
    //   cornerStyle: 'circle',
    //   cornerSize: 6,
    //   hasBorders: true,
    //   borderColor: '#7DB9DE',
    //   hasControls: false,
    //   hasRotatingPoint: false,
    //   centeredRotation: true,
    //   centeredScaling: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: true,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   selectable: true
    // })

    this.initCanvas()
  },
  created () {
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
