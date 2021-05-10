<template>
  <div>
    <Layout>
      <Dialog
        :title="'选择文件'"
        iconCls="icon-folder-open"
        ref="piclist_dailog"
        :dialogStyle="{width:'320px',height:'320px'}"
        :modal="true"
        :draggable="true"
        :resizable="true"
        :closed="true"
      >
        <div class="f-full">
          <Tree :data="picTreeData" @nodeDblClick="doOpenFile($event)"></Tree>
        </div>
      </Dialog>
      <Dialog
        :title="'文本替换'"
        iconCls="icon-edit-replace"
        ref="replace_dailog"
        :dialogStyle="{width:'400px'}"
        :modal="true"
        :draggable="true"
        :resizable="true"
        :closed="true"
      >
        <Form ref="form" :model="property" labelAlign="left" style="margin:10px;">
          <FormField label="查找:">
            <TextBox placeholder="查找" style="width:100%" v-model="textToFind"></TextBox>
          </FormField>
          <FormField label="替换:">
            <TextBox placeholder="替换" style="width:100%" v-model="textToReplace"></TextBox>
          </FormField>
        </Form>
        <div class="dialog-button">
          <LinkButton style="width:80px" @click="doReplace()">全部替换</LinkButton>
          <LinkButton style="width:80px" @click="doCancelReplace()">关闭</LinkButton>
        </div>
      </Dialog>
      <LayoutPanel region="north" style="border:none;">
        <Panel :bodyStyle="{padding:'5px',border:'0px'}">
          <LinkButton @click="doNew()" iconCls="icon-document" :plain="true" v-Tooltip="'新建'"></LinkButton>
          <LinkButton @click="doOpen()" iconCls="icon-folder-open" :plain="true" v-Tooltip="'打开'"></LinkButton>
          <LinkButton :disabled="filename==''" @click="doSave()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'保存'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton :disabled="object.type==null" @click="doCopy()" iconCls="icon-document-copy" :plain="true" v-Tooltip="'拷贝'"></LinkButton>
          <LinkButton :disabled="clipboard==null" @click="doPaste()" iconCls="icon-clipboard-paste" :plain="true" v-Tooltip="'粘贴'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="doCut()" iconCls="icon-scissors" :plain="true" v-Tooltip="'剪切'"></LinkButton>
          <LinkButton @click="undo()" iconCls="icon-arrow-curve-180-left" :plain="true" v-Tooltip="'取消'"></LinkButton>
          <LinkButton @click="redo()" iconCls="icon-arrow-curve" :plain="true" v-Tooltip="'重做'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="doDelete()" iconCls="icon-cross" :plain="true" v-Tooltip="'删除'"></LinkButton>
          <LinkButton @click="doClear()" iconCls="icon-broom" :plain="true" v-Tooltip="'清空'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton @click="addLine()" iconCls="icon-layer-shape-line" :plain="true" v-Tooltip="'直线'"></LinkButton>
          <LinkButton @click="addRect()" iconCls="icon-layer-shape" :plain="true" v-Tooltip="'矩形'"></LinkButton>
          <LinkButton @click="addEllipse()" iconCls="icon-layer-shape-ellipse" :plain="true" v-Tooltip="'椭圆'"></LinkButton>
          <LinkButton @click="addTriangle()" iconCls="icon-layer-shape-polyline" :plain="true" v-Tooltip="'三角'"></LinkButton>
          <LinkButton :disabled="true" iconCls="icon-layer-shape-polygon" :plain="true" v-Tooltip="'多边形'"></LinkButton>
          <LinkButton :disabled="true" iconCls="icon-layer-shape-curve" :plain="true" v-Tooltip="'曲线'"></LinkButton>
          <LinkButton @click="addText()" iconCls="icon-layer-shape-text" :plain="true" v-Tooltip="'文字'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton :disabled="object.type==null" @click="altTextAlign('left')" iconCls="icon-edit-alignment" :plain="true" v-Tooltip="'左对齐'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altTextAlign('center')" iconCls="icon-edit-alignment-center" :plain="true" v-Tooltip="'居中对齐'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altTextAlign('right')" iconCls="icon-edit-alignment-right" :plain="true" v-Tooltip="'右对齐'"></LinkButton>
          <ComboBox :disabled="object.type==null" iconCls="icon-edit-family" iconAlign="left" v-model="objectFontFamily" :plain="true" :data="fontFamilyOptions" :editable="false"></ComboBox>
          <NumberBox :disabled="object.type==null" iconCls="icon-edit-size" iconAlign="left" :increment="1" :min="1" v-model="objectFontSize" style="width:90px;"></NumberBox>
          <LinkButton :disabled="object.type==null" @click="altFontWeight()" iconCls="icon-edit-bold" :plain="true" :toggle="false" :selected="object.fontWeight==='bold'" v-Tooltip="'加粗'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altFontStyle()" iconCls="icon-edit-italic" :plain="true" :toggle="false" :selected="object.fontStyle==='italic'"  v-Tooltip="'倾斜'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altUnderline()" iconCls="icon-edit-underline" :plain="true" :toggle="true" :selected="object.underline" v-Tooltip="'下划线'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altOverline()" iconCls="icon-edit-overline" :plain="true" :toggle="true" :selected="object.overline" v-Tooltip="'上划线'"></LinkButton>
          <NumberBox :disabled="object.type==null" iconCls="icon-edit-line-spacing" iconAlign="left" :increment="0.5" :precision="1" :min="1" v-model="objectLineHeight" style="width:90px;"></NumberBox>
          <LinkButton :disabled="object.type==null" @click="$refs.replace_dailog.open()" iconCls="icon-edit-replace" :plain="true" :toggle="false" v-Tooltip="'替换'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton :disabled="object.type==null" @click="rotateLeft()" iconCls="icon-layer-rotate-left" :plain="true" v-Tooltip="'向左旋转90°'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="rotateRight()" iconCls="icon-layer-rotate" :plain="true" v-Tooltip="'向右旋转90°'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altFlipX()" iconCls="icon-layer-flip" :plain="true" :toggle="true" :selected="object.flipX" v-Tooltip="'水平镜像'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="altFlipY()" iconCls="icon-layer-flip-vertical" :plain="true" :toggle="true" :selected="object.flipY" v-Tooltip="'垂直镜像'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="moveFront()" iconCls="icon-layers-stack-arrange" :plain="true" v-Tooltip="'移至顶层'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="moveBack()" iconCls="icon-layers-stack-arrange-back" :plain="true" v-Tooltip="'移至底层'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="moveForwards()" iconCls="icon-layers-arrange" :plain="true" v-Tooltip="'前移一层'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="moveBackwards()" iconCls="icon-layers-arrange-back" :plain="true" v-Tooltip="'后移一层'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton :disabled="object._objects==null" @click="alignTop()" iconCls="icon-layers-alignment" :plain="true" v-Tooltip="'上对齐'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignLeft()" iconCls="icon-layers-alignment-left" :plain="true" v-Tooltip="'左对齐'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignBottom()" iconCls="icon-layers-alignment-bottom" :plain="true" v-Tooltip="'下对齐'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignRight()" iconCls="icon-layers-alignment-right" :plain="true" v-Tooltip="'右对齐'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignHorizontalC()" iconCls="icon-layers-alignment-middle" :plain="true" v-Tooltip="'水平居中对齐'"></LinkButton>
          <LinkButton :disabled="object._objects==null"  @click="alignVerticalC()" iconCls="icon-layers-alignment-center" :plain="true" v-Tooltip="'垂直居中对齐'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton :disabled="object._objects==null" @click="toGroup()" iconCls="icon-layers-group" :plain="true" v-Tooltip="'创建组合'"></LinkButton>
          <LinkButton :disabled="object.type==null" @click="breakGroup()" iconCls="icon-layers-ungroup" :plain="true" v-Tooltip="'解散组合'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="doScaleHeight()" iconCls="icon-layer-resize-replicate-vertical" :plain="true" v-Tooltip="'等高'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="doScaleWidth()" iconCls="icon-layer-resize-replicate" :plain="true" v-Tooltip="'等宽'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignHorizontalA()" iconCls="icon-application-tile-horizontal" :plain="true" v-Tooltip="'水平平均分布'"></LinkButton>
          <LinkButton :disabled="object._objects==null" @click="alignVerticalA()" iconCls="icon-application-tile-vertical" :plain="true" v-Tooltip="'垂直平均分布'"></LinkButton>
          <span class="button-sep-small"></span>
          <LinkButton @click="doResetZoom()" iconCls="icon-magnifier" :plain="true" style="width:30px;" v-Tooltip="'重置缩放比例'"></LinkButton>
        </Panel>
      </LayoutPanel>
      <LayoutPanel
        region="east"
        style="width:300px;"
        title="配置栏"
        iconCls="icon-toolbox"
        :collapsible="true"
        :collapsed="false"
        :expander="true"
      >
        <Tabs
          :border="false"
          style="height:100%"
        >
          <TabPanel :title="'属性'" iconCls="icon-property">
            <Form ref="form" :model="property" labelAlign="left" style="margin:10px 30px 10px 10px;">
              <FormField v-if="object.text!=null" label="文本:">
                <TextBox v-model="objectText" :multiline="true" style="height:80px;"></TextBox>
              </FormField>
              <FormField v-if="object.linethrough!=null" label="删除线:">
                <CheckBox v-model="objectLinethrough"></CheckBox>
              </FormField>
              <FormField v-if="object.left!=null" label="X坐标:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectLeft"></NumberBox>
              </FormField>
              <FormField v-if="object.top!=null" label="Y坐标:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectTop"></NumberBox>
              </FormField>
              <FormField v-if="object.rx!=null" label="X半径:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectRx"></NumberBox>
              </FormField>
              <FormField v-if="object.ry!=null" label="Y半径:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectRy"></NumberBox>
              </FormField>
              <FormField v-if="object.angle!=null" label="角度:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectAngle"></NumberBox>
              </FormField>
              <FormField v-if="object.width!=null" label="宽度:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectWidth"></NumberBox>
              </FormField>
              <FormField v-if="object.height!=null" label="高度:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectHeight"></NumberBox>
              </FormField>
              <FormField v-if="object.scaleX!=null" label="水平缩放:">
                <NumberBox :increment="0.1" :precision="2" :min="0.01" spinAlign="horizontal" v-model="objectScaleX"></NumberBox>
              </FormField>
              <FormField v-if="object.scaleY!=null" label="垂直缩放:">
                <NumberBox :increment="0.1" :precision="2" :min="0.01" spinAlign="horizontal" v-model="objectScaleY"></NumberBox>
              </FormField>
              <FormField v-if="object.skewX!=null" label="水平扭曲:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectSkewX"></NumberBox>
              </FormField>
              <FormField v-if="object.skewY!=null" label="垂直扭曲:">
                <NumberBox :increment="1" :precision="1" spinAlign="horizontal" v-model="objectSkewY"></NumberBox>
              </FormField>
              <FormField v-if="object.strokeUniform!=null" label="画笔缩放:">
                <CheckBox v-model="objectStrokeUniform"></CheckBox>
              </FormField>
              <FormField v-if="object.strokeWidth!=null" label="画笔宽度:">
                <NumberBox :increment="1" spinAlign="horizontal" v-model="objectStrokeWidth"></NumberBox>
              </FormField>
              <FormField v-if="object.type!=null" label="画笔颜色:">
                <input type="color" v-model="objectStroke"/>
                <input type="text" v-model="objectStroke" style="width:60px;"/>
              </FormField>
              <FormField v-if="object.fill!=null" label="填充颜色:">
                <input type="color" v-model="objectFill"/>
                <input type="text" v-model="objectFill" style="width:60px;"/>
              </FormField>
              <FormField v-if="object.textBackgroundColor!=null" label="文字背景色:">
                <input type="color" v-model="objectTextBackgroundColor"/>
                <input type="text" v-model="objectTextBackgroundColor" style="width:60px;"/>
              </FormField>
              <FormField v-if="object.opacity!=null" label="透明度:">
                <NumberBox :increment="0.1" :precision="1" :min="0" :max="1" spinAlign="horizontal" v-model="objectOpacity"></NumberBox>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="文件路径:">
                <span>{{filename}}</span>
              </FormField>
              <!-- <FormField v-if="canvas!=null&&object.type==null" label="画布宽度:">
                <NumberBox :increment="1" spinAlign="horizontal" v-model="canvasWidth"></NumberBox>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="画布高度:">
                <NumberBox :increment="1" spinAlign="horizontal" v-model="canvasHeight"></NumberBox>
              </FormField> -->
              <FormField v-if="canvas!=null&&object.type==null" label="背景颜色:">
                <input type="color" v-model="canvasBackgroundColor"/>
                <input type="text" v-model="canvasBackgroundColor" style="width:60px;"/>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="背景图片:">
                <DataList
                  :data="bgListData"
                  selectionMode="single"
                  style="width:200px;height:300px;"
                  @selectionChange="setBackgroundImage($event)"
                >
                  <template slot-scope="scope">
                    <div>
                      <img :src="scope.row.path" style="width:160px;padding:10px;">
                    </div>
                  </template>
                </DataList>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="">
                <LinkButton @click="setBackgroundImage()" style="width:100%;">移除画布背景图片</LinkButton>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="画笔宽度:">
                <NumberBox :increment="1" spinAlign="horizontal" v-model="curStrokeWidth"></NumberBox>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="画笔颜色:">
                <input type="color" v-model="curStrokeColor"/>
                <input type="text" v-model="curStrokeColor" style="width:60px;"/>
              </FormField>
              <FormField v-if="canvas!=null&&object.type==null" label="填充颜色:">
                <input type="color" v-model="curFillColor"/>
                <input type="text" v-model="curFillColor" style="width:60px;"/>
              </FormField>
            </Form>
          </TabPanel>
          <TabPanel :title="'数据'"  iconCls="icon-tables-relation">
            <Form ref="form" :model="prop" labelAlign="left" style="margin:10px 30px 10px 10px;">
              <FormField v-if="associate!=null" label="关联表:">
                <ComboBox @selectionChange="onTableChange($event)" v-model="associate.table" style="width:100px;" :data="tableOptions" :editable="false"></ComboBox>
              </FormField>
              <FormField v-if="associate!=null" label="关联域:">
                <ComboBox v-model="associate.column" style="width:100px;" :data="columnOptions" :editable="false"></ComboBox>
              </FormField>
              <FormField v-if="associate!=null" label="关键字:">
                <TextBox v-model="keyword" placeholder="请输入关键字" style="width:100%;">
                  <Addon>
                    <LinkButton :disabled="associate.table==''" iconCls="icon-search" @click="getTable()" :plain="true">查询</LinkButton>
                  </Addon>
                </TextBox>
              </FormField>
              <FormField v-if="hasSubstation" label="厂站:">
                <ComboBox @selectionChange="onSubstationChange($event)" v-model="substation" style="width:100px;" :data="substationOptions" :editable="false"></ComboBox>
              </FormField>
              <FormField v-if="associate!=null" label="记录集:">
                <ComboGrid
                  valueField="id"
                  textField="name"
                  v-model="associate.key"
                  :data="data"
                  :panelStyle="{width:'450px',height:'300px'}"
                >
                  <DataGrid
                    slot="grid"
                    :pagination="true"
                    :lazy="true"
                    :total="total"
                    :pageNumber="pageNumber"
                    :pageSize="pageSize"
                    @pageChange="onPageChange($event)"
                    :border="false">
                    <GridColumn align="center" cellCss="datagrid-td-rownumber" width="50">
                      <template slot="body" slot-scope="scope">
                        {{scope.rowIndex + 1}}
                      </template>
                    </GridColumn>
                    <GridColumn field="name" title="名称"></GridColumn>
                  </DataGrid>
                </ComboGrid>
              </FormField>
              <FormField v-if="associate!=null" label="关联预览:">
                <TextBox v-model="nowAssociate" :multiline="true" :editable="false" style="height:80px;">
                  <Addon>
                    <LinkButton :disabled="object.associate==null" @click="updateAssociate()" style="height:100%;">关联</LinkButton>
                  </Addon>
                </TextBox>
              </FormField>
              <FormField v-if="object.associate!=null" label="关联参数:">
                <span class="static-text">{{object.associate}}</span>
              </FormField>
            </Form>
          </TabPanel>
          <TabPanel :title="'动作'" iconCls="icon-controller">
            <Form ref="form" :model="event" labelAlign="left" style="margin:10px 30px 10px 10px;">
              <FormField v-if="action!=null" label="动作类型:">
                <ComboBox v-model="action.type" :data="actionOptions" :editable="false"></ComboBox>
              </FormField>
              <FormField v-if="action.type=='switch'" label="图形文件:">
                <ComboTree :data="picTreeData" valueField="path" v-model="action.path" placeholder="请选择文件">
                  <Tree slot="tree"></Tree>
                </ComboTree>
              </FormField>
              <FormField v-if="action.type=='request'" label="请求地址:">
                <TextBox v-model="action.url" :multiline="true" style="height:60px;"></TextBox>
              </FormField>
              <FormField v-if="action.type=='request'" label="请求参数:">
                <TextBox v-model="action.params" :multiline="true" style="height:150px;"></TextBox>
              </FormField>
              <FormField v-if="action!=null" label="动作预览:">
                <TextBox v-model="nowAction" :multiline="true" style="height:80px;">
                  <Addon>
                    <LinkButton :disabled="object.action==null" @click="updateAction()" style="height:100%;">关联</LinkButton>
                  </Addon>
                </TextBox>
              </FormField>
              <FormField v-if="object.action!=null" label="动作参数:">
                <span class="static-text">{{object.action}}</span>
              </FormField>
            </Form>
          </TabPanel>
          <TabPanel :title="'图元'" iconCls="icon-images">
            <div>
              <DataList style="height:100%;"
                :data="svgTreeData"
                selectionMode="single"
                :itemStyle="{width:'60px',height:'60px',float:'left',margin:'3px'}"
                @selectionChange="addImage($event)"
              >
                <template slot-scope="scope">
                    <div class="product" v-Tooltip="scope.row.name">
                      <img :src="scope.row.path">
                    </div>
                </template>
              </DataList>
            </div>
          </TabPanel>
        </Tabs>
      </LayoutPanel>
      <LayoutPanel @keypress="onKeyPress($event)" region="center" headerCls="main-header" style="height:100%">
        <div class="canvas_master">
          <canvas id="c" width="100%" height="100%"></canvas>
        </div>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
import Fabric from 'fabric'
import axios from 'axios'
import 'fabric-history'
// import vueJsonEditor from 'vue-json-editor'

const propertiesToInclude = ['associate', 'action', 'source']

// Fabric.fabric.Line.prototype.controls.mt.visible=false
// Fabric.fabric.Line.prototype.controls.mb.visible=false
// Fabric.fabric.Line.prototype.controls.tl.visible=false
// Fabric.fabric.Line.prototype.controls.tr.visible=false
// Fabric.fabric.Line.prototype.controls.bl.visible=false
// Fabric.fabric.Line.prototype.controls.br.visible=false

function initAligningGuidelines (canvas) {
  var ctx = canvas.getSelectionContext()
  var aligningLineOffset = 5
  var aligningLineMargin = 4
  var aligningLineWidth = 1
  var aligningLineColor = '#7DB9DE'
  var viewportTransform
  var zoom = 1

  function drawVerticalLine (coords) {
    drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1)
  }

  function drawHorizontalLine (coords) {
    drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5)
  }

  function drawLine (x1, y1, x2, y2) {
    ctx.save()
    ctx.lineWidth = aligningLineWidth
    ctx.strokeStyle = aligningLineColor
    ctx.beginPath()
    ctx.moveTo((x1 * zoom + viewportTransform[4]), (y1 * zoom + viewportTransform[5]))
    ctx.lineTo((x2 * zoom + viewportTransform[4]), (y2 * zoom + viewportTransform[5]))
    ctx.stroke()
    ctx.restore()
  }

  function isInRange (value1, value2) {
    value1 = Math.round(value1)
    value2 = Math.round(value2)
    for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
      if (i === value2) {
        return true
      }
    }
    return false
  }

  var verticalLines = []
  var horizontalLines = []

  canvas.on('mouse:down', function (e) {
    viewportTransform = canvas.viewportTransform
    zoom = canvas.getZoom()
  })

  canvas.on('object:moving', function (e) {
    var activeObject = e.target
    var canvasObjects = canvas.getObjects()
    var activeObjectCenter = activeObject.getCenterPoint()
    var activeObjectLeft = activeObjectCenter.x
    var activeObjectTop = activeObjectCenter.y
    var activeObjectBoundingRect = activeObject.getBoundingRect()
    var activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3]
    var activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0]
    var horizontalInTheRange = false
    var verticalInTheRange = false
    var transform = canvas._currentTransform

    if (!transform) {
      return
    }

    for (var i = canvasObjects.length; i--;) {
      if (canvasObjects[i] === activeObject) {
        continue
      }

      var objectCenter = canvasObjects[i].getCenterPoint()
      var objectLeft = objectCenter.x
      var objectTop = objectCenter.y
      var objectBoundingRect = canvasObjects[i].getBoundingRect()
      var objectHeight = objectBoundingRect.height / viewportTransform[3]
      var objectWidth = objectBoundingRect.width / viewportTransform[0]

      if (isInRange(objectLeft, activeObjectLeft)) {
        verticalInTheRange = true
        verticalLines.push({
          x: objectLeft,
          y1: (objectTop < activeObjectTop)
            ? (objectTop - objectHeight / 2 - aligningLineOffset)
            : (objectTop + objectHeight / 2 + aligningLineOffset),
          y2: (activeObjectTop > objectTop)
            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(objectLeft, activeObjectTop), 'center', 'center')
      }

      if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
        verticalInTheRange = true
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1: (objectTop < activeObjectTop)
            ? (objectTop - objectHeight / 2 - aligningLineOffset)
            : (objectTop + objectHeight / 2 + aligningLineOffset),
          y2: (activeObjectTop > objectTop)
            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center')
      }

      if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
        verticalInTheRange = true
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1: (objectTop < activeObjectTop)
            ? (objectTop - objectHeight / 2 - aligningLineOffset)
            : (objectTop + objectHeight / 2 + aligningLineOffset),
          y2: (activeObjectTop > objectTop)
            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center')
      }

      if (isInRange(objectTop, activeObjectTop)) {
        horizontalInTheRange = true
        horizontalLines.push({
          y: objectTop,
          x1: (objectLeft < activeObjectLeft)
            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
            : (objectLeft + objectWidth / 2 + aligningLineOffset),
          x2: (activeObjectLeft > objectLeft)
            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(activeObjectLeft, objectTop), 'center', 'center')
      }

      if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
        horizontalInTheRange = true
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1: (objectLeft < activeObjectLeft)
            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
            : (objectLeft + objectWidth / 2 + aligningLineOffset),
          x2: (activeObjectLeft > objectLeft)
            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center')
      }

      if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
        horizontalInTheRange = true
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1: (objectLeft < activeObjectLeft)
            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
            : (objectLeft + objectWidth / 2 + aligningLineOffset),
          x2: (activeObjectLeft > objectLeft)
            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
        })
        activeObject.setPositionByOrigin(new Fabric.fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center')
      }
    }

    if (!horizontalInTheRange) {
      horizontalLines.length = 0
    }

    if (!verticalInTheRange) {
      verticalLines.length = 0
    }
  })

  canvas.on('before:render', function () {
    canvas.clearContext(canvas.contextTop)
  })

  canvas.on('after:render', function () {
    var i = 0
    for (i = verticalLines.length; i--;) {
      drawVerticalLine(verticalLines[i])
    }
    for (i = horizontalLines.length; i--;) {
      drawHorizontalLine(horizontalLines[i])
    }

    verticalLines.length = horizontalLines.length = 0
  })

  canvas.on('mouse:up', function () {
    verticalLines.length = horizontalLines.length = 0
    canvas.renderAll()
  })
}

export default {
  name: 'PicEditor',
  watch: {
    width (newValue, oldValue) {
      if (this.canvas) {
        this.canvas.setWidth(newValue)
        this.canvas.calcOffset()
      }
    },
    height (newValue, oldValue) {
      if (this.canvas) {
        this.canvas.setHeight(newValue)
        this.canvas.calcOffset()
      }
    },
    associate: {
      handler (newValue) {
        this.getTable()
      },
      deep: true
    }
  },
  props: {
    path: String
  },
  methods: {
    request (method, url, params, callback) {
      this.loading = true
      axios({
        method: method,
        async: false,
        url: url,
        params: params
      })
        .then(callback)
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    getModels () {
      this.request(
        'GET',
        'base/models/',
        {},
        (response) => {
          let results = response.data.results
          if (results.length > 0) {
            let data = []
            results.forEach((item) => {
              data.push({
                text: item.name,
                value: item.id,
                fields: item.fields
              })
            })
            this.tableOptions = data
            if (data.length > 0) {
              this.associate.table = data[0].value
              this.onTableChange(data[0])
            }
          }
        }
      )
    },
    onSubstationChange (event) {
      console.log(event)
      this.substation = event.value
      this.getTable()
    },
    onTableChange (event) {
      if (event.fields && event.fields.length > 0) {
        let data = []
        this.hasSubstation = false
        event.fields.forEach(field => {
          if (field.type !== 'ManyToOneRel' && field.type !== 'ForeignKey') {
            data.push({
              text: field.name,
              value: field.id
            })
          }
          if (field.id === 'substation') {
            this.hasSubstation = true
          }
        })
        this.columnOptions = data
        if (data.length > 0) {
          this.associate.column = data[0].value
          this.associate.key = ''
        }
      }
    },
    onPageChange (event) {
      // easyui bug combogrid在被点击时触发onPageChange事件
      if (event.filterRules) {
        this.getTable()
      }
    },
    doReplace () {
      if (this.textToFind !== '' && this.textToReplace !== '') {
        let str = ''
        let that = this
        let findRegExp = new RegExp(that.textToFind, 'g')
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.text != null) {
              str = item.text.replace(findRegExp, that.textToReplace)
              item.set({
                text: str
              }).setCoords()
            }
          })
          this.canvas.requestRenderAll()
        } else if (this.object.text != null) {
          str = this.object.text.replace(findRegExp, that.textToReplace)
          this.object.set({
            text: str
          }).setCoords()
          this.canvas.requestRenderAll()
        }
      }
      this.$refs.replace_dailog.close()
    },
    doCancelReplace () {
      this.$refs.replace_dailog.close()
    },
    altFontStyle () {
      if (this.object._objects) {
        this.object._objects.forEach(item => {
          if (item.fontStyle != null) {
            item.set({
              fontStyle: item.fontStyle === 'normal' ? 'italic' : 'normal'
            }).setCoords()
          }
        })
        this.canvas.requestRenderAll()
      } else if (this.object.fontStyle != null) {
        this.object.set({
          fontStyle: this.object.fontStyle === 'normal' ? 'italic' : 'normal'
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altFontWeight () {
      if (this.object._objects) {
        this.object._objects.forEach(item => {
          if (item.fontWeight != null) {
            item.set({
              fontWeight: item.fontWeight === 'normal' ? 'bold' : 'normal'
            }).setCoords()
          }
        })
        this.canvas.requestRenderAll()
      } else if (this.object.fontWeight != null) {
        this.object.set({
          fontWeight: this.object.fontWeight === 'normal' ? 'bold' : 'normal'
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altOverline () {
      if (this.object._objects) {
        this.object._objects.forEach(item => {
          if (item.overline != null) {
            item.set({
              overline: !item.overline
            }).setCoords()
          }
        })
        this.canvas.requestRenderAll()
      } else if (this.object.overline != null) {
        this.object.set({
          overline: !this.object.overline
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altUnderline () {
      if (this.object._objects) {
        this.object._objects.forEach(item => {
          if (item.underline != null) {
            item.set({
              underline: !item.underline
            }).setCoords()
          }
        })
        this.canvas.requestRenderAll()
      } else if (this.object.underline != null) {
        this.object.set({
          underline: !this.object.underline
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altTextAlign (value) {
      if (this.object._objects) {
        this.object._objects.forEach(item => {
          if (item.textAlign != null) {
            item.set({
              textAlign: value
            }).setCoords()
          }
        })
        this.canvas.requestRenderAll()
      } else if (this.object.textAlign != null) {
        this.object.set({
          textAlign: value
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altFlipX (value) {
      if (this.object.flipX != null) {
        this.object.set({
          flipX: !this.object.flipX
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    altFlipY (value) {
      if (this.object.flipY != null) {
        this.object.set({
          flipY: !this.object.flipY
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    // no-repeat repeat repeat-x repeat-y
    setBackgroundImage (event) {
      // canvas.setBackgroundColor({
      //   source: event.path,
      //   repeat: 'no-repeat'
      // }, canvas.renderAll.bind(canvas))
      if (event) {
        this.canvas.setBackgroundImage(event.path, this.canvas.renderAll.bind(this.canvas), {
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          crossOrigin: 'anonymous',
          source: event.path
        })
      } else {
        this.canvas.backgroundImage = null
        this.canvas.requestRenderAll()
      }
    },
    doResetZoom () {
      if (this.canvas) {
        this.canvas.setZoom(1)
        this.canvas.setViewportTransform([ 1, 0, 0, 1, 0, 0 ])
        this.canvas.requestRenderAll()
      }
    },
    doOpenFile (event) {
      this.openPicFile(event.path)
      this.$refs.piclist_dailog.close()
    },
    getSvgTree () {
      let that = this
      axios({
        method: 'GET',
        url: this.svgScanUrl,
        data: {
        },
        params: {
        }
      })
        .then((response) => {
          that.svgTreeData = response.data
          that.queryset = response.data.results
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
    getPicTree () {
      let that = this
      axios({
        method: 'GET',
        url: this.picScanUrl,
        data: {
        },
        params: {
        }
      })
        .then((response) => {
          that.picTreeData = response.data
          that.queryset = response.data.results
          that.$refs.piclist_dailog.open()
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
    getBgList () {
      let that = this
      axios({
        method: 'GET',
        url: this.bgScanUrl,
        data: {
        },
        params: {
        }
      })
        .then((response) => {
          that.bgListData = response.data
          that.queryset = response.data.results
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
    getTable (params) {
      if (this.associate.table === '') {
        return
      }
      let url = 'base/' + this.associate.table + '/'
      axios({
        method: 'GET',
        url: url,
        data: {
        },
        params: {
          offset: (this.pageNumber - 1) * this.pageSize,
          limit: this.pageSize,
          substation: this.substation,
          name__contains: this.keyword
        }
      })
        .then((response) => {
          this.data = response.data.results
          this.total = response.data.count
          if (this.associate.table === 'substation') {
            let data = []
            this.data.forEach((item) => {
              data.push({
                text: item.name,
                value: item.id
              })
            })
            this.substationOptions = data
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
    updateAssociate () {
      let tmp = JSON.stringify(this.associate)
      this.object.associate = JSON.parse(tmp)
    },
    updateAction () {
      let tmp = JSON.stringify(this.action)
      this.object.action = JSON.parse(tmp)
    },
    zoomIn () {
      if (this.canvas) {
        this.canvas.setZoom(this.canvas.getZoom() + 0.1)
        this.canvas.renderAll()
      }
    },
    zoomOut () {
      if (this.canvas) {
        this.canvas.setZoom(this.canvas.getZoom() - 0.1)
        this.canvas.renderAll()
      }
    },
    replaceSrc (data) {
      for (var i = 0; i < data.objects.length; i++) {
        if (data.objects[i].objects && data.objects[i].objects.length > 0) {
          this.replaceSrc(data.objects[i])
        } else if (data.objects[i].source) {
          data.objects[i].src = data.objects[i].source
        }
      }
      if (data.backgroundImage) {
        data.backgroundImage.src = data.backgroundImage.source
      }
    },
    doNew () {
      this.$messager.prompt({
        title: '新建',
        msg: '请输入文件名',
        result: r => {
          if (r) {
            if (r && r.length > 0) {
              this.openPicFile('data/pic/' + r + '.json', true)
            }
          }
        }
      })
    },
    doOpen () {
      this.getPicTree()
    },
    save () {
      var picdata = this.canvas.toDatalessJSON(propertiesToInclude)
      this.replaceSrc(picdata)
      let data = {
        path: this.filename,
        data: JSON.stringify(picdata)
      }
      axios({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        url: this.picSaveUrl,
        data: data
      })
        .then(res => {
          if (parseInt(res.data) === 1) {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: this.filename + '保存成功'
            })
          } else {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: this.filename + '保存失败'
            })
          }
        })
        .catch(error => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error.toString()
          })
        })
    },
    doSave () {
      if (this.canvas) {
        if (this.filename === '') {
          this.$messager.prompt({
            title: '保存',
            msg: '请输入文件名',
            result: r => {
              if (r) {
                if (r && r.length > 0) {
                  this.filename = 'data/pic/' + r + '.json'
                  this.save()
                }
              }
            }
          })
        } else {
          this.save()
        }
      }
    },
    undo () {
      if (this.canvas) {
        this.canvas.undo()
      }
    },
    redo () {
      if (this.canvas) {
        this.canvas.redo()
      }
    },
    initCanvas () {
      this.canvas = new Fabric.fabric.Canvas('c', {
        includeDefaultValues: false,
        preserveObjectStacking: true,
        backgroundColor: '#000000',
        renderOnAddRemove: false,
        enableRetinaScaling: true,
        path: '',
        width: window.innerWidth,
        height: window.innerHeight
      })

      initAligningGuidelines(this.canvas)

      let that = this

      this.canvas.on({
        'selection:created': function (e) {
          that.object = e.target
        },
        'selection:updated': function (e) {
          that.object = e.target
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
    openPicFile (url, isNew = false) {
      this.filename = url
      let that = this

      if (isNew) {
        let data = '{"objects":[],"background":"#000000"}'
        this.canvas.loadFromJSON(data, function () {
          that.canvas.renderAll.bind(that.canvas)
        })
        return
      }

      axios({
        method: 'GET',
        url: url,
        data: {},
        params: {
          ts: new Date().getTime()
        }
      })
        .then((response) => {
          that.canvas.loadFromJSON(response.data, function () {
            that.canvas.renderAll.bind(that.canvas)
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
    addLine () {
      if (this.canvas) {
        let line = new Fabric.fabric.Line([200, 100, 60, 100], {
          left: this.clickX,
          top: this.clickY,
          strokeWidth: this.curStrokeWidth,
          stroke: this.curStrokeColor,
          strokeUniform: true
        })
        this.canvas.add(line)
        this.canvas.setActiveObject(line).renderAll()
      }
    },
    addRect () {
      if (this.canvas) {
        let rect = new Fabric.fabric.Rect({
          left: this.clickX,
          top: this.clickY,
          strokeWidth: this.curStrokeWidth,
          stroke: this.curStrokeColor,
          fill: this.curFillColor,
          width: 100,
          height: 50,
          strokeUniform: true
        })
        this.canvas.add(rect)
        this.canvas.setActiveObject(rect).renderAll()
      }
    },
    addEllipse () {
      if (this.canvas) {
        let rect = new Fabric.fabric.Ellipse({
          left: this.clickX,
          top: this.clickY,
          strokeWidth: this.curStrokeWidth,
          stroke: this.curStrokeColor,
          fill: this.curFillColor,
          rx: 30,
          ry: 30,
          strokeUniform: true
        })
        this.canvas.add(rect)
        this.canvas.setActiveObject(rect).renderAll()
      }
    },
    addTriangle () {
      if (this.canvas) {
        let rect = new Fabric.fabric.Triangle({
          left: this.clickX,
          top: this.clickY,
          strokeWidth: this.curStrokeWidth,
          stroke: this.curStrokeColor,
          fill: this.curFillColor,
          width: 60,
          height: 80,
          strokeUniform: true
        })
        this.canvas.add(rect)
        this.canvas.setActiveObject(rect).renderAll()
      }
    },
    addText () {
      if (this.canvas) {
        let rect = new Fabric.fabric.IText('TEXT', {
          left: this.clickX,
          top: this.clickY,
          fontStyle: 'normal',
          fontFamily: '宋体',
          fontSize: 14,
          strokeWidth: this.curStrokeWidth,
          fill: this.curStrokeColor,
          strokeUniform: true,
          shadow: 'rgba(0,0,0,0.3) 5px 5px 5px'
        })
        this.canvas.add(rect)
        this.canvas.setActiveObject(rect).renderAll()
      }
    },
    addImage (event) {
      if (this.canvas) {
        var src = event.path
        let that = this
        Fabric.fabric.Image.fromURL(src, function (oImg) {
          var width = oImg.width
          var height = oImg.height
          var scale = Math.min(100 / width, 100 / height)
          oImg.left = that.clickX
          oImg.top = that.clickY
          oImg.scaleX = scale
          oImg.scaleY = scale
          oImg.source = src
          that.canvas.add(oImg)
          that.canvas.setActiveObject(oImg).renderAll()
        })
      }
    },
    rotateLeft () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          object.rotate(object.angle - 90).setCoords()
        }
        this.canvas.renderAll()
      }
    },
    rotateRight () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          object.rotate(object.angle + 90).setCoords()
        }
        this.canvas.renderAll()
      }
    },
    toGroup () {
      if (this.canvas) {
        if (!this.canvas.getActiveObject()) {
          return
        }
        if (this.canvas.getActiveObject().type !== 'activeSelection') {
          return
        }
        this.canvas.getActiveObject().toGroup()
        this.canvas.requestRenderAll()
      }
    },
    breakGroup () {
      if (this.canvas) {
        if (!this.canvas.getActiveObject()) {
          return
        }
        if (this.canvas.getActiveObject().type !== 'group') {
          return
        }
        this.canvas.getActiveObject().toActiveSelection()
        this.canvas.requestRenderAll()
      }
    },
    moveFront () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          this.canvas.bringToFront(object)
        }
      }
    },
    moveBack () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          this.canvas.sendToBack(object)
        }
      }
    },
    moveForwards () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          this.canvas.bringForward(object)
        }
      }
    },
    moveBackwards () {
      if (this.canvas) {
        let object = this.canvas.getActiveObject()
        if (object) {
          this.canvas.sendBackwards(object)
        }
      }
    },
    doCopy () {
      if (this.canvas) {
        let that = this
        let object = this.canvas.getActiveObject()
        if (object) {
          object.clone(function (cloned) {
            that.clipboard = cloned
          }, propertiesToInclude)
        }
      }
    },
    doPaste () {
      if (this.canvas && this.clipboard) {
        let that = this
        this.clipboard.clone(function (clonedObj) {
          that.canvas.discardActiveObject()
          clonedObj.set({
            left: that.clickX,
            top: that.clickY,
            evented: true
          })
          if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = that.canvas
            clonedObj.forEachObject(function (obj) {
              that.canvas.add(obj)
            })
            clonedObj.setCoords()
          } else {
            that.canvas.add(clonedObj)
          }
          that.canvas.setActiveObject(clonedObj)
          that.canvas.requestRenderAll()
        }, propertiesToInclude)
      }
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
    doCut () {
      if (this.canvas) {
        let that = this
        this.canvas.getActiveObject().clone(function (cloned) {
          that.clipboard = cloned
          that.doDelete()
        })
      }
    },
    doClear () {
      if (this.canvas) {
        this.$messager.confirm({
          title: '确认',
          msg: '是否确认清空画布?',
          result: r => {
            if (r) {
              this.canvas.clear()
            }
          }
        })
      }
    },
    doScaleWidth (width) {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].scaleToWidth(objects[0].width * objects[0].scaleX, true)
        }
        this.canvas.requestRenderAll()
      }
    },
    doScaleHeight (height) {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].scaleToHeight(objects[0].height * objects[0].scaleY, true)
        }
        this.canvas.requestRenderAll()
      }
    },
    alignTop () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            top: 0 - object.height * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignLeft () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            left: 0 - object.width * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignRight () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            left: (object.width - (objects[i].aCoords.tr.x - objects[i].aCoords.tl.x)) - object.width * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignBottom () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            top: (object.height - (objects[i].aCoords.bl.y - objects[i].aCoords.tl.y)) - object.height * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignHorizontalC () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            top: (object.height - (objects[i].aCoords.bl.y - objects[i].aCoords.tl.y)) * 0.5 - object.height * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignVerticalC () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 2) {
          return
        }

        for (let i = 0; i < objects.length; i++) {
          objects[i].set({
            left: (object.width - (objects[i].aCoords.tr.x - objects[i].aCoords.tl.x)) * 0.5 - object.width * 0.5
          })
        }
        this.canvas.requestRenderAll()
      }
    },
    alignHorizontalA () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 3) {
          return
        }

        objects.sort((a, b) => {
          return a.aCoords.tl.x - b.aCoords.tl.x
        })

        let count = 0
        objects.forEach(item => { count += item.aCoords.tr.x - item.aCoords.tl.x })
        let es = (object.width - count) / (objects.length - 1)

        let sefNum = 0
        let sefNumOne = true

        for (let i = 0, len = objects.length; i < len; i++) {
          if (i !== 0 && i !== len - 1) {
            let w = objects[i - 1].aCoords.tr.x - objects[i - 1].aCoords.tl.x
            if (sefNumOne) {
              sefNum += (w + es)
              sefNumOne = false
            } else {
              sefNum += es + w
            }
            objects[i].set({
              left: sefNum - object.width * 0.5
            })
          }
        }
        this.canvas.requestRenderAll()
      }
    },
    alignVerticalA () {
      if (this.canvas) {
        let objects = this.canvas.getActiveObjects()
        let object = this.canvas.getActiveObject()

        if (objects.length < 3) {
          return
        }

        objects.sort((a, b) => {
          return a.aCoords.tl.y - b.aCoords.tl.y
        })

        let count = 0
        objects.forEach(item => { count += item.aCoords.bl.y - item.aCoords.tl.y })
        let es = (object.height - count) / (objects.length - 1)

        let sefNum = 0
        let sefNumOne = true

        for (let i = 0, len = objects.length; i < len; i++) {
          if (i !== 0 && i !== len - 1) {
            let h = objects[i - 1].aCoords.bl.y - objects[i - 1].aCoords.tl.y
            if (sefNumOne) {
              sefNum += (h + es)
              sefNumOne = false
            } else {
              sefNum += es + h
            }

            objects[i].set({
              top: sefNum - object.height * 0.5
            })
          }
        }
        this.canvas.requestRenderAll()
      }
    }
  },
  data () {
    return {
      canvas: null,
      clipboard: null,
      clickX: 0,
      clickY: 0,
      prop: {},
      textToFind: '',
      textToReplace: '',
      curStrokeWidth: 2,
      curStrokeColor: '#91989F',
      curFillColor: '#BDC0BA',
      keyword: '',
      filename: '',
      picScanUrl: 'php/picscan.php',
      picSaveUrl: 'php/picsave.php',
      svgScanUrl: 'php/svgscan.php',
      bgScanUrl: 'php/bgscan.php',
      picTreeData: [],
      svgTreeData: [],
      bgListData: [],
      dictModels: [],
      object: {},
      fontFamilyOptions: [
        {'text': '宋体', 'value': '宋体'},
        {'text': '黑体', 'value': '黑体'},
        {'text': '楷体', 'value': '楷体'},
        {'text': '仿宋', 'value': '仿宋'},
        {'text': 'Arial', 'value': 'Arial'},
        {'text': 'Times New Roman', 'value': 'Times New Roman'},
        {'text': 'Verdana', 'value': 'Verdana'},
        {'text': 'Impact', 'value': 'Impact'}
      ],
      actionOptions: [
        {'text': '无', 'value': ''},
        {'text': '图形切换', 'value': 'switch'},
        {'text': '发送请求', 'value': 'request'}
      ],
      tableOptions: [],
      columnOptions: [],
      substation: '',
      hasSubstation: false,
      substationOptions: [],
      property: {},
      data: [],
      event: {},
      queryset: [],
      associate: {
        table: '',
        column: '',
        key: ''
      },
      action: {
        type: '',
        url: '',
        path: '',
        params: ''
      },
      total: 0,
      pageNumber: 1,
      pageSize: 50,
      loading: false
    }
  },
  computed: {
    canvasWidth: {
      get () {
        return this.canvas.getWidth()
      },
      set (newValue) {
        this.canvas.setWidth(newValue)
      }
    },
    canvasHeight: {
      get () {
        return this.canvas.getHeight()
      },
      set (newValue) {
        this.canvas.setHeight(newValue)
      }
    },
    canvasBackgroundColor: {
      get () {
        return this.canvas.backgroundColor
      },
      set (newValue) {
        this.canvas.setBackgroundColor(newValue, this.canvas.renderAll.bind(this.canvas))
      }
    },
    nowAssociate: {
      get () {
        return JSON.stringify(this.associate)
      },
      set (newValue) {
        return JSON.parse(newValue)
      }
    },
    nowAction: {
      get () {
        return JSON.stringify(this.action)
      },
      set (newValue) {
        return JSON.parse(newValue)
      }
    },
    objectText: {
      get () {
        return this.object.text
      },
      set (newValue) {
        this.object.set({
          text: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectFontFamily: {
      get () {
        return this.object.fontFamily
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.fontFamily != null) {
              item.set({
                fontFamily: newValue
              }).setCoords()
            }
          })
          this.canvas.requestRenderAll()
        } else if (this.object.fontFamily != null) {
          this.object.set({
            fontFamily: newValue
          }).setCoords()
          this.canvas.requestRenderAll()
        }
      }
    },
    objectLineHeight: {
      get () {
        return this.object.lineHeight
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.lineHeight != null) {
              item.set({
                lineHeight: newValue
              }).setCoords()
            }
          })
          this.canvas.requestRenderAll()
        } else if (this.object.lineHeight != null) {
          this.object.set({
            lineHeight: newValue
          }).setCoords()
          this.canvas.requestRenderAll()
        }
      }
    },
    objectLinethrough: {
      get () {
        return this.object.linethrough
      },
      set (newValue) {
        this.object.set({
          linethrough: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectTextBackgroundColor: {
      get () {
        return this.object.textBackgroundColor
      },
      set (newValue) {
        this.object.set({
          textBackgroundColor: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectFontSize: {
      get () {
        return this.object.fontSize
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.fontSize != null) {
              item.set({
                fontSize: newValue
              }).setCoords()
            }
          })
          this.canvas.requestRenderAll()
        } else if (this.object.fontSize != null) {
          this.object.set({
            fontSize: newValue
          }).setCoords()
          this.canvas.requestRenderAll()
        }
      }
    },
    objectLeft: {
      get () {
        return this.object.left
      },
      set (newValue) {
        this.object.set({
          left: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectTop: {
      get () {
        return this.object.top
      },
      set (newValue) {
        this.object.set({
          top: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectRx: {
      get () {
        return this.object.rx
      },
      set (newValue) {
        this.object.set({
          rx: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectRy: {
      get () {
        return this.object.ry
      },
      set (newValue) {
        this.object.set({
          ry: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectAngle: {
      get () {
        return this.object.angle
      },
      set (newValue) {
        this.object.set({
          angle: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectWidth: {
      get () {
        return this.object.width
      },
      set (newValue) {
        if (this.object.type === 'ellipse') {
          this.object.set({
            rx: newValue / 2
          }).setCoords()
        } else {
          this.object.set({
            width: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectHeight: {
      get () {
        return this.object.height
      },
      set (newValue) {
        if (this.object.type === 'ellipse') {
          this.object.set({
            ry: newValue / 2
          }).setCoords()
        } else {
          this.object.set({
            height: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectScaleX: {
      get () {
        return this.object.scaleX
      },
      set (newValue) {
        this.object.set({
          scaleX: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectScaleY: {
      get () {
        return this.object.scaleY
      },
      set (newValue) {
        this.object.set({
          scaleY: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectSkewX: {
      get () {
        return this.object.skewX
      },
      set (newValue) {
        this.object.set({
          skewX: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectSkewY: {
      get () {
        return this.object.skewY
      },
      set (newValue) {
        this.object.set({
          skewY: newValue
        }).setCoords()
        this.canvas.requestRenderAll()
      }
    },
    objectStrokeUniform: {
      get () {
        return !this.object.strokeUniform
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.strokeUniform != null) {
              item.set({
                strokeUniform: !newValue
              }).setCoords()
            }
          })
        } else {
          this.object.set({
            strokeUniform: !newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectStrokeWidth: {
      get () {
        return this.object.strokeWidth
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.strokeWidth != null) {
              item.set({
                strokeWidth: newValue
              }).setCoords()
            }
          })
        } else {
          this.object.set({
            strokeWidth: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectStroke: {
      get () {
        return this.object.stroke
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.stroke != null) {
              item.set({
                stroke: newValue
              }).setCoords()
            }
          })
          this.canvas.requestRenderAll()
        } else if (this.object.stroke != null) {
          this.object.set({
            stroke: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectFill: {
      get () {
        return this.object.fill
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.fill != null) {
              item.set({
                fill: newValue
              }).setCoords()
            }
          })
        } else {
          this.object.set({
            fill: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
    },
    objectOpacity: {
      get () {
        return this.object.opacity
      },
      set (newValue) {
        if (this.object._objects) {
          this.object._objects.forEach(item => {
            if (item.opacity != null) {
              item.set({
                opacity: newValue
              }).setCoords()
            }
          })
        } else {
          this.object.set({
            opacity: newValue
          }).setCoords()
        }
        this.canvas.requestRenderAll()
      }
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
      hasRotatingPoint: true,
      centeredRotation: true,
      centeredScaling: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
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
    this.initCanvas()
    this.getSvgTree()
    this.getBgList()
    this.getModels()
  },
  components: {
    // vueJsonEditor
  },
  created () {
    let that = this
    document.onkeydown = function (e) {
      let key = window.event.keyCode
      let sel = null
      if (e.altKey && key === 67) {
        that.doCopy()
      } else if (e.altKey && key === 78) {
        that.doNew()
      } else if (e.altKey && key === 89) {
        that.redo()
      } else if (e.altKey && key === 90) {
        that.undo()
      } else if (e.altKey && key === 79) {
        that.$refs.piclist_dailog.open()
      } else if (e.altKey && key === 83) {
        that.doSave()
      } else if (e.altKey && key === 86) {
        that.doPaste()
      } else if (e.altKey && key === 88) {
        that.doCut()
      } else if (e.altKey && key === 65) {
        if (that.canvas) {
          that.canvas.discardActiveObject()
          sel = new Fabric.fabric.ActiveSelection(that.canvas.getObjects(), {
            canvas: that.canvas
          })
          that.canvas.setActiveObject(sel)
          that.canvas.requestRenderAll()
        }
      } else if (e.altKey && key === 37) {
        if (that.object != null) {
          that.object.set({
            left: that.object.left - 1
          }).setCoords()
          that.canvas.requestRenderAll()
        }
      } else if (e.altKey && key === 38) {
        if (that.object != null) {
          that.object.set({
            top: that.object.top - 1
          }).setCoords()
          that.canvas.requestRenderAll()
        }
      } else if (e.altKey && key === 39) {
        if (that.object != null) {
          that.object.set({
            left: that.object.left + 1
          }).setCoords()
          that.canvas.requestRenderAll()
        }
      } else if (e.altKey && key === 40) {
        if (that.object != null) {
          that.object.set({
            top: that.object.top + 1
          }).setCoords()
          that.canvas.requestRenderAll()
        }
      }
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.listitem {
  width:60px;
  height:60px;
  float:left;
  margin:3px;
}
.canvas_master {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.button-sep-small{
  border-left: 1px solid #dddddd;
  border-right: 1px solid #cccccc;
  margin: 3px 1px;
}
.product .detail {
  align-self: center;
}
.product img {
  width: 50px;
  height: 50px;
  margin: 5px;
  padding: 5px;
  border-radius:5px;
  background-color:whitesmoke;
}
.static-text {
  width: 100%;
  height: 80px;
  display: block;
  word-break: break-all;
  word-wrap: break-word;
}
</style>
