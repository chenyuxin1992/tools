<template>
  <div>
    <Layout>
      <!-- <LayoutPanel region="north" style="border: none">
      </LayoutPanel> -->
      <LayoutPanel
        region="west"
        style="width: 15%"
        :collapsible="false"
        :collapsed="false"
        :expander="true"
      >
        <template slot="header">
          <div class="f-row">
            <TextBox
              @valueChange="$refs.tree.doFilter($event.currentValue)"
              placeholder="请输入关键字"
              style="width: 100%"
            >
              <Addon>
                <LinkButton iconCls="icon-search" :plain="true"
                  >查询</LinkButton
                >
              </Addon>
            </TextBox>
          </div>
        </template>
        <Tree
          style="padding: 5px"
          :data="nodes"
          ref="tree"
          @nodeExpand="onNodeExpand($event)"
          @selectionChange="onSelectionChange($event)"
        >
        </Tree>
      </LayoutPanel>
      <LayoutPanel
        region="east"
        style="width: 85%"
        iconCls="icon-document-tree"
        :collapsible="false"
        :collapsed="false"
        :expander="true"
      >
        <template
          region="north"
          iconCls="icon-document-tree"
          :collapsible="false"
          :collapsed="false"
          :expander="true"
        >
          <div style="height: 32px; margin-top: 5px">
            &emsp;方案类型：
            <ComboBox
              valueField="id"
              textField="name"
              v-model="typeId"
              placeholder="全部"
              :virtualScroll="true"
              :data="typedata"
              style="width: 10%"
              :total="total"
              :pageSize="pageSize"
              :rowHeight="rowHeight"
            >
            </ComboBox>
            &emsp;方案状态：
            <ComboBox
              valueField="id"
              textField="name"
              v-model="stateId"
              placeholder="全部"
              :virtualScroll="true"
              :data="statedata"
              style="width: 10%"
              :total="total"
              :pageSize="pageSize"
              :rowHeight="rowHeight"
            >
            </ComboBox>
            &emsp;
            <TextBox
              placeholder="输入巡视方案名称关键字"
              style="width: 15%"
              v-model="nameSearch"
            ></TextBox>
            &emsp;
            <LinkButton btnCls="c7" style="width: 5%" @click="getplantaskData()"
              >查询</LinkButton
            >
            <LinkButton btnCls="c7" style="width: 5%" @click="addPlan()"
              >新增</LinkButton
            >
          </div>
        </template>
        <template
          region="south"
          iconCls="icon-document-tree"
          :collapsible="false"
          :collapsed="false"
          :expander="true"
        >
          <div
            style="
              float: top;
              width: 100%;
              height: calc(100% - 38px);
              margin-top: 1px;
            "
          >
            <DataGrid
              :data="taskplanData"
              style="height: 100%; padding: 2px"
              :pageSize="gridpageSize"
              :pagination="true"
              pagePosition="bottom"
              selectionMode="single"
              :columnResizing="true"
              :loading="loading"
            >
              <GridColumn
                align="center"
                cellCss="datagrid-td-rownumber"
                width="3%"
              >
                <template slot="body" slot-scope="scope">
                  {{ scope.rowIndex + 1 }}
                </template>
              </GridColumn>
              <GridColumn
                field="team"
                title="运维班"
                align="center"
                width="9%"
              ></GridColumn>
              <GridColumn
                field="substation"
                title="所属变电站"
                align="center"
                width="9%"
              ></GridColumn>
              <GridColumn
                field="taskname"
                title="方案名称"
                align="center"
                width="14%"
              ></GridColumn>
              <GridColumn
                field="tasktype"
                title="巡视类型"
                align="center"
                width="8%"
              ></GridColumn>
              <GridColumn
                field="source"
                title="数据来源"
                align="center"
                width="8%"
              ></GridColumn>
              <GridColumn
                field="timeplan"
                title="时间方案"
                align="center"
                width="19%"
              ></GridColumn>
              <GridColumn field="state" title="状态" align="center" width="5%">
                <template slot="body" slot-scope="scope">
                  {{ scope.row.state ? "启用" : "停用" }}
                </template>
              </GridColumn>
              <GridColumn
                field="check"
                title="审核状态"
                align="center"
                width="5%"
              >
                <template slot="body" slot-scope="scope">
                  {{
                    scope.row.check == 0
                      ? "待审核"
                      : scope.row.check == 1
                      ? "已审核"
                      : scope.row.check == 2
                      ? "未通过"
                      : ""
                  }}
                </template>
              </GridColumn>
              <GridColumn field="act" title="操作" align="center" width="20%">
                <template slot="body" slot-scope="scope">
                  <ButtonGroup style="height: 24px">
                    <LinkButton
                      @click="checktask(scope.row)"
                      v-if="scope.row.check == 0"
                      >审核</LinkButton
                    >
                    <LinkButton
                      @click="confirmStop(scope.row)"
                      v-if="scope.row.state == 1 && scope.row.check == 1"
                      >停用</LinkButton
                    >
                    <LinkButton
                      @click="confirmEnable(scope.row)"
                      v-if="scope.row.state == 0 && scope.row.check == 1"
                      >启用</LinkButton
                    >
                    <LinkButton @click="detail(scope.row)">详情</LinkButton>
                    <LinkButton
                      @click="startNow(scope.row)"
                      v-if="scope.row.check == 1"
                      >立即执行</LinkButton
                    >
                    <LinkButton @click="confirmDelete(scope.row)"
                      >删除</LinkButton
                    >
                  </ButtonGroup>
                </template>
              </GridColumn>
            </DataGrid>
          </div>
        </template>
      </LayoutPanel>
      <Dialog
        ref="newtaskplan"
        :title="'新增巡视任务方案'"
        :dialogStyle="{ width: '1000px', height: '640px', margin: 0 }"
        bodyCls="f-column"
        closed
        :modal="true"
      >
        <div class="dialog-toolbar">
          <div style="height: 32px; margin-top: 5px">
            &emsp;选择集控站：
            <ComboBox
              valueField="id"
              textField="name"
              v-model="unitdataSel"
              placeholder="请选择"
              :virtualScroll="true"
              :data="unitData"
              style="width: 19%"
              :total="total"
              :pageSize="pageSize"
              :rowHeight="rowHeight"
            >
            </ComboBox>
            &emsp;选择运维班：
            <ComboBox
              valueField="id"
              textField="name"
              v-model="teamdataSel"
              placeholder="请选择"
              :virtualScroll="true"
              :data="teamData"
              style="width: 19%"
              :total="total"
              :pageSize="pageSize"
              :rowHeight="rowHeight"
            >
            </ComboBox>
            &emsp;选择变电站：
            <ComboBox
              valueField="id"
              textField="name"
              v-model="subdataSel"
              placeholder="请选择"
              :virtualScroll="true"
              :data="subData"
              style="width: 19%"
              :rowHeight="rowHeight"
            >
            </ComboBox>
          </div>
        </div>
        <div class="f-full">
          <Layout style="width: 100%; height: 100%">
            <LayoutPanel
              region="west"
              :split="true"
              :bodyStyle="{ padding: '5px' }"
              :panelStyle="{ width: '45%', minWidth: '20%', maxWidth: '70%' }"
            >
              <h3>&emsp;巡视内容配置</h3>
              <Tree
                style="height: 90%"
                ref="pointtree"
                :checkbox="true"
                @checkChange="checkedNodes = $event"
                @nodeExpand="treeExpand($event)"
                :data="pointData"
                idField="id"
                treeField="name"
              >
              </Tree>
            </LayoutPanel>
            <LayoutPanel :bodyStyle="{ padding: '5px' }" style="height: 100%">
              <h3>&emsp;方案基本信息</h3>
              <div style="margin-bottom: 20px; margin-top: 30px">
                &emsp;<a>巡视方案名称：</a>
                <TextBox v-model="inputname" placeholder="请输入名称"></TextBox>
              </div>
              <div style="margin-bottom: 20px">
                &emsp;<a>巡视方案类型：</a>
                <ComboBox
                  :data="heroes"
                  v-model="inputType"
                  placeholder="请选择类型"
                ></ComboBox>
              </div>
              <div style="margin-bottom: 20px">
                &emsp;<a>巡视内容来源：</a>
                <a
                  v-for="decType in decTypes"
                  :key="decType"
                  style="margin-bottom: 10px"
                >
                  <RadioButton
                    name="group2"
                    :value="decType"
                    v-model="dec_type"
                  ></RadioButton>
                  <Label :for="decType">{{
                    decType == 0
                      ? "视频+机器人"
                      : decType == 1
                      ? "视频"
                      : decType == 2
                      ? "机器人"
                      : ""
                  }}</Label>
                </a>
              </div>
              <div style="margin-bottom: 20px">
                &emsp;<a>方案是否启用：</a>
                <SwitchButton inputId="s1" v-model="inputuse"></SwitchButton>
                <a>{{
                  inputuse == 0 ? "已停用" : inputuse == 1 ? "已启用" : ""
                }}</a>
              </div>
              <hr color="#F5F5DC" />
              <h3>&emsp;方案时间配置</h3>
              <div style="margin-bottom: 20px; margin-top: 30px">
                &emsp;<a>任务执行周期：</a>
                <ComboBox
                  inputId="heros"
                  :data="timeTypes"
                  v-model="inputCycle"
                  placeholder="请选择周期"
                ></ComboBox
                >&emsp;
                <a>每隔</a>
                <TextBox
                  v-model="inputhours"
                  placeholder="自定义间隔时间"
                  :disabled="inputCycle != 5"
                ></TextBox>
                <a>小时</a>
              </div>
              <div style="margin-bottom: 20px">
                &emsp;<a>任务执行日期：</a>
                <DateBox
                  inputId="d2"
                  v-model="setdate"
                  format="yyyy-MM-dd"
                  placeholder="请选择日期"
                ></DateBox>
              </div>
              <div style="margin-bottom: 20px">
                &emsp;<a>任务执行时间：</a>
                <DateTimeSpinner
                  inputId="t1"
                  v-model="inputtime"
                  format="HH:mm:ss"
                ></DateTimeSpinner>
              </div>
            </LayoutPanel>
          </Layout>
        </div>
        <div class="dialog-button">
          <LinkButton style="width: 80px" @click="confirmPlan()"
            >创建</LinkButton
          >
          <LinkButton style="width: 80px" @click="$refs.newtaskplan.close()"
            >取消</LinkButton
          >
        </div>
      </Dialog>
      <Dialog
        ref="confirmtaskplan"
        :title="'巡视任务方案确认'"
        :dialogStyle="{ width: '1000px', height: '640px', margin: 0 }"
        bodyCls="f-column"
        closed
        :modal="true"
      >
        <div class="f-full" style="width: 100%; height: 90%">
          <Layout style="width: 100%; height: 100%">
            <h3 style="text-align: center">
              新建巡视任务方案：{{ inputname === "" ? "未命名" : inputname }}
            </h3>
            <hr color="#F5F5DC" />
            <div style="text-align: center">
              <a
                >巡视方案类型：{{
                  inputType === "1501"
                    ? "全面巡视"
                    : inputType === "1502"
                    ? "例行巡视"
                    : inputType === "1503"
                    ? "专项巡视"
                    : inputType === "1504"
                    ? "特殊巡视"
                    : inputType === "1505"
                    ? "自定义巡视"
                    : "未选择"
                }}</a
              >
            </div>
            <div style="text-align: center">
              <a
                >巡视内容来源：{{
                  dec_type == 0
                    ? "视频+机器人"
                    : dec_type == 1
                    ? "视频"
                    : dec_type == 2
                    ? "机器人"
                    : "未知"
                }}</a
              >
            </div>
            <div style="text-align: center">
              <a
                >巡视方案状态：{{
                  inputuse === 0 ? "停用" : inputuse === 1 ? "启用" : ""
                }}</a
              >
            </div>
            <div style="text-align: center">
              <a
                >任务执行周期：{{
                  inputCycle === 1
                    ? "单次巡视"
                    : inputCycle === 2
                    ? "每日巡视"
                    : inputCycle === 3
                    ? "每周巡视"
                    : inputCycle === 4
                    ? "每月巡视"
                    : inputCycle === 5
                    ? "自定义周期巡视"
                    : "未知"
                }}</a
              >
              <a v-if="inputCycle === 5">（每间隔{{ inputhours }}小时执行）</a>
            </div>
            <div style="text-align: center">
              <a>执行日期时间：日期{{ inputdate }}时间{{ inputtime }}</a>
            </div>
            <hr color="#F5F5DC" />
            <div
              style="
                padding: 4px 16px;
                width: 90%;
                height: 410px;
                margin-left: 310px;
                overflow: auto;
              "
            >
              <div style="margin-left: 130px">巡视内容概览:</div>
              <div v-for="(node, index) in dataShow" :key="index">
                {{ index + 1 }} - {{ node.name }} - {{ node.detail }}
              </div>
            </div>
          </Layout>
        </div>
        <div class="dialog-button">
          是否确认创建该巡视任务方案？
          <LinkButton style="width: 80px" @click="sendPlan()">确认</LinkButton>
          <LinkButton style="width: 80px" @click="$refs.confirmtaskplan.close()"
            >取消</LinkButton
          >
        </div>
      </Dialog>
      <Dialog
        ref="checktask"
        :title="'巡视任务方案审核'"
        :dialogStyle="{ width: '1000px', height: '640px', margin: 0 }"
        bodyCls="f-column"
        closed
        :modal="true"
      >
        <div class="dialog-toolbar">
          <h3 style="text-align: center">巡视任务方案审核单</h3>
        </div>
        <div class="f-full">
          <Layout style="width: 100%; height: 100%">
            <LayoutPanel
              region="west"
              :split="true"
              :bodyStyle="{ padding: '5px' }"
              :panelStyle="{ width: '45%', minWidth: '20%', maxWidth: '70%' }"
            >
              <h3>&emsp;巡视方案详情</h3>
              <div style="padding: 4px 16px">
                巡视方案名称：{{ checkdata.taskname }}
              </div>
              <div style="padding: 4px 16px">
                所属变电站名：{{ checkdata.substation }}
              </div>
              <div style="padding: 4px 16px">
                巡视方案类型：{{ checkdata.tasktype }}
              </div>
              <div style="padding: 4px 16px">
                巡视内容来源：{{ checkdata.source }}
              </div>
              <div style="padding: 4px 16px">
                巡视方案状态：{{
                  checkdata.state == 0
                    ? "停用"
                    : checkdata.state == 1
                    ? "启用"
                    : ""
                }}
              </div>
              <div style="padding: 4px 16px">
                任务时间方案：{{ checkdata.timeplan }}
              </div>
              <div style="padding: 4px 16px">
                <div>巡视点位信息：</div>
                <div v-for="(item, index) in checkPoints" :key="index">
                  {{ index + 1 }} - {{ item.name }} - {{ item.source }}
                </div>
              </div>
            </LayoutPanel>
            <LayoutPanel :bodyStyle="{ padding: '5px' }" style="height: 100%">
              <h3>&emsp;审核意见录入</h3>
              <div style="margin-bottom: 20px; margin-top: 30px">
                &emsp;<a>审核意见：</a>
              </div>
              <div style="margin-bottom: 20px">
                <TextBox
                  v-model="checkdos"
                  :multiline="true"
                  placeholder="请输入审核意见"
                  style="width: 80%; height: 130px; margin-left: 30px"
                ></TextBox>
              </div>
              <div style="margin-bottom: 20px; margin-top: 30px">
                &emsp;<a>审核结论：</a>
                <SwitchButton inputId="s5" v-model="checkresult"></SwitchButton>
                <a>{{
                  checkresult == true
                    ? "通过"
                    : checkresult == false
                    ? "驳回"
                    : ""
                }}</a>
              </div>
              <div style="margin-bottom: 20px; margin-top: 30px">
                &emsp;<a>审核人：</a>
                <TextBox
                  v-model="checkman"
                  placeholder="请输入审核人姓名"
                ></TextBox>
              </div>
            </LayoutPanel>
          </Layout>
        </div>
        <div class="dialog-button">
          <LinkButton style="width: 80px" @click="sendCheck()"
            >提交审核</LinkButton
          >
          <LinkButton style="width: 80px" @click="$refs.checktask.close()"
            >取消</LinkButton
          >
        </div>
      </Dialog>
      <Dialog
        ref="detail"
        :title="'巡视任务方案详情'"
        :dialogStyle="{ width: '620px', height: '640px', margin: 0 }"
        bodyCls="f-column"
        closed
        :modal="true"
      >
        <div class="dialog-toolbar">
          <h3 style="text-align: center">巡视任务方案详情</h3>
        </div>
        <div class="f-full">
          <Layout style="width: 100%; height: 100%">
            <LayoutPanel :bodyStyle="{ padding: '15px' }">
              <h3>&emsp;巡视方案名称：{{ detaildata.taskname }}</h3>
              <div style="padding: 4px 16px">
                所属变电站名：{{ detaildata.substation }}
              </div>
              <div style="padding: 4px 16px">
                巡视方案类型：{{ detaildata.tasktype }}
              </div>
              <div style="padding: 4px 16px">
                巡视内容来源：{{ detaildata.source }}
              </div>
              <div style="padding: 4px 16px">
                巡视方案状态：{{
                  detaildata.state == 0
                    ? "停用"
                    : detaildata.state == 1
                    ? "启用"
                    : ""
                }}
              </div>
              <div style="padding: 4px 16px">
                任务时间方案：{{ detaildata.timeplan }}
              </div>
              <div style="padding: 4px 16px">
                <div>巡视点位信息：</div>
                <div
                  style="padding-left: 20px"
                  v-for="(item, index) in detailPoints"
                  :key="index"
                >
                  {{ index + 1 }} - {{ item.name }} - {{ item.source }}
                </div>
              </div>
              <div style="padding: 4px 16px">
                方案审核状态：{{
                  detaildata.check == 0
                    ? "待审核"
                    : detaildata.check == 1
                    ? "已通过"
                    : detaildata.check == 2
                    ? "未通过"
                    : ""
                }}
              </div>
              <div style="padding: 4px 16px" v-if="detaildata.check != 0">
                方案审核意见：{{
                  detaildata.checkdes ? detaildata.checkdes : "无"
                }}
              </div>
              <div style="padding: 4px 16px" v-if="detaildata.check != 0">
                方案审核人员：{{
                  detaildata.checkman ? detaildata.checkman : "匿名"
                }}
              </div>
            </LayoutPanel>
          </Layout>
        </div>
        <div class="dialog-button">
          <LinkButton style="width: 80px" @click="$refs.detail.close()"
            >确认</LinkButton
          >
        </div>
      </Dialog>
    </Layout>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'taskplaning',
  data () {
    return {
      dec_type: '0',
      decTypes: ['0', '1', '2'],
      timeTypes: [
        { value: 1, text: '单次巡视' },
        { value: 2, text: '每日巡视' },
        { value: 3, text: '每周巡视' },
        { value: 4, text: '每月巡视' },
        { value: 5, text: '自定义周期巡视' }
      ],
      typedata: [
        { id: '', name: '全部' },
        { id: '1501', name: '全面巡视' },
        { id: '1502', name: '例行巡视' },
        { id: '1503', name: '专项巡视' },
        { id: '1504', name: '特殊巡视' },
        { id: '1505', name: '自定义巡视' }
      ],
      heroes: [
        { value: '1501', text: '全面巡视' },
        { value: '1502', text: '例行巡视' },
        { value: '1503', text: '专项巡视' },
        { value: '1504', text: '特殊巡视' },
        { value: '1505', text: '自定义巡视' }
      ],
      statedata: [
        { id: '', name: '全部' },
        { id: '1', name: '启用' },
        { id: '0', name: '停用' }
      ],
      taskplanData: [],
      nodes: [],
      pointData: [],
      typeId: '',
      stateId: '',
      nameSearch: '',
      total: 100,
      rowHeight: 30,
      pageSize: 6,
      gridpageSize: 25,
      subSelected: '',
      loading: false,
      unitData: [],
      teamData: [],
      subData: [],
      unitdataSel: '',
      teamdataSel: '',
      subdataSel: '',
      checkedNodes: null,
      voltagePlan: [],
      areaPlan: [],
      devicePlan: [],
      pointPlan: [],
      inputname: '',
      inputType: '',
      inputuse: true,
      inputCycle: '',
      inputhours: '24',
      inputdate: '',
      setdate: new Date(),
      inputtime: '00:00:00',
      dataShow: {},
      checkdata: {},
      detaildata: {},
      checkPoints: [],
      detailPoints: [],
      checkman: '',
      checkdos: '',
      checkresult: true,
      nowDate: ''
    }
  },
  props: {
    status: String
  },
  watch: {
    unitdataSel (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.teamSelect()
      }
    },
    teamdataSel (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.subSelect()
      }
    },
    subdataSel (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getpointData()
      }
    },
    setdate (newValue, oldValue) {
      if (newValue !== oldValue) {
        let y = newValue.getFullYear()
        let m = newValue.getMonth() + 1
        let d = newValue.getDate()
        this.inputdate = [y, m, d].join('-')
      }
    }
  },
  methods: {
    getnodeData () {
      this.getBaseData('maintenanceunit', {}, (response) => {
        // console.log(response.data)
        if (response.data) {
          let objects = response.data.results
          let data = []
          objects.forEach((object) => {
            object.text = object.name
            object.tp = 'maintenanceunit'
            object.state = 'closed'
            object.iconCls = 'icon-building-hedge'
            data.push(object)
          })
          this.nodes = data
          // console.log(this.nodes)
        }
      })
    },
    getBaseData (table, params, callback) {
      this.loading = true
      axios({
        method: 'GET',
        async: false,
        url: 'base/' + table + '/',
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
    getplantaskData () {
      this.getBaseData(
        'plantask_depth',
        {
          substation: this.subSelected,
          dictpatroltype: this.typeId,
          enable: this.stateId,
          name__contains: this.nameSearch
        },
        (response) => {
          this.gettaskData(response.data)
          // console.log(response.data)
        }
      )
    },
    gettaskData (response) {
      if (response) {
        let data = response.results
        this.taskplanData = data.map((item) => ({
          id: item.id,
          team: !item.substation ? '未知' : item.substation.maintenanceteam,
          // item.substation.maintenanceteam == 'b87cb3ef-9915-41e2-9873-39ed535eb760'?'银城运维班' :
          // item.substation.maintenanceteam == 'b9db3b0e-f0bf-40d2-90c4-8ade81dfaca6'?'靖远运维班' :
          // item.substation.maintenanceteam == 'a3482c3f-f3ea-4689-93cf-31b2488d7559'?'景泰运维班' : '未知',
          substation: item.substation ? item.substation.name : '',
          taskname: item.name,
          tasktype: item.dictpatroltype ? item.dictpatroltype.name : '',
          tasktypeid: item.dictpatroltype ? item.dictpatroltype.id : '',
          source: item.source === 0 ? '视频+机器人' : item.source === 1 ? '视频' : item.source === 2 ? '机器人' : '未知',
          timeplan: item.timingtype === 1 ? item.plantime + '单次巡视' : item.timingtype === 2 ? item.plantime + '起每日巡视' : item.timingtype === 3 ? item.plantime + '起每周巡视 ' : item.timingtype === 4 ? item.plantime + '起每月巡视' : item.timingtype === 5 ? item.plantime + '起每隔' + item.interval + '小时巡视' : '',
          state: item.enable,
          check: item.checkstate,
          checkman: item.checkman,
          checktime: item.checktime,
          checkdes: item.checkdes,
          plantime: item.plantime,
          total: item.total
        }))
      }
    },
    addPlan () {
      this.$refs.newtaskplan.open()
      this.unitSelect()
      this.getpointData()
      this.initdate()
    },
    confirmPlan () {
      this.$refs.confirmtaskplan.open()
      let voltage = []
      let area = []
      let device = []
      let point = []
      let dataShow = []
      let objects = this.checkedNodes
      objects.forEach((object) => {
        switch (object.tp) {
          case 'voltage':
            voltage.push(object.id)
            dataShow.push({
              name: object.name,
              detail: '区域内全部巡检点位'
            })
            break
          case 'bay':
            if (object.parent.checkState !== 'checked') {
              area.push(object.id)
              dataShow.push({
                name: object.name,
                detail: '间隔内全部巡检点位'
              })
            }
            break
          case 'device':
            if (object.parent.checkState !== 'checked') {
              device.push(object.id)
              dataShow.push({
                name: object.name,
                detail: '设备区全部巡检点位'
              })
            }
            break
          case 'patrolpoint':
            if (object.parent.checkState !== 'checked') {
              point.push(object.id)
              dataShow.push({
                name: object.name,
                detail: '巡检点位'
              })
            }
            break
        }
      })
      this.voltagePlan = voltage
      this.areaPlan = area
      this.devicePlan = device
      this.pointPlan = point
      this.dataShow = dataShow
      let aaa = {
        __: 'plantask',
        index: {
          name: this.inputname,
          plantime: this.inputdate + 'T' + this.inputtime,
          source: Number(this.dec_type),
          timingtype: 1,
          // timingtype: this.inputCycle,
          interval: Number(this.inputhours),
          enable: Number(this.inputuse),
          substation_id: this.subdataSel,
          dictpatroltype_id: this.inputType
        },
        content: {
          device__area__parent__id__in: this.voltagePlan.toString(),
          device__area__id__in: this.areaPlan.toString(),
          device__id__in: this.devicePlan.toString(),
          id__in: this.pointPlan.toString()
        }
      }
      console.log(aaa)
    },
    sendPlan () {
      this.request(
        'POST',
        'base/task/',
        {
          __: 'plantask',
          index: {
            name: this.inputname,
            plantime: this.inputdate + 'T' + this.inputtime,
            source: Number(this.dec_type),
            timingtype: 1,
            // timingtype: this.inputCycle,
            interval: Number(this.inputhours),
            enable: Number(this.inputuse),
            substation_id: this.subdataSel,
            dictpatroltype_id: this.inputType
          },
          content: {
            device__area__parent__id__in: this.voltagePlan.toString(),
            device__area__id__in: this.areaPlan.toString(),
            device__id__in: this.devicePlan.toString(),
            id__in: this.pointPlan.toString()
          }
        },
        (response) => {
          if (response.data.result === 'success') {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: '巡视方案创建成功!'
            })
            this.$refs.newtaskplan.close()
            this.$refs.confirmtaskplan.close()
            this.getplantaskData()
          }
        }
      )
    },
    getpointData () {
      if (this.subdataSel) {
        this.getBaseData(
          'area',
          {
            substation: this.subdataSel,
            parent__isnull: true
          },
          (response) => {
            // console.log(response.data)
            if (response.data) {
              let objects = response.data.results
              let data = []
              objects.forEach((object) => {
                object.text = object.name
                object.tp = 'voltage'
                object.state = 'closed'
                object.iconCls = 'icon-document-tree'
                // object.parentid = this.subdataSel
                data.push(object)
              })
              this.pointData = data
              // console.log(this.nodes)
            }
          }
        )
      }
    },
    treeExpand (event) {
      if (!event.children) {
        switch (event.tp) {
          case 'voltage':
            this.getBaseData(
              'area',
              {
                parent: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach((object) => {
                    object.text = object.name
                    object.tp = 'bay'
                    object.state = 'closed'
                    object.iconCls = 'icon-database'
                    // object.parentid = object.parent.id
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'bay':
            this.getBaseData(
              'device',
              {
                area: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach((object) => {
                    object.text = object.name
                    object.tp = 'device'
                    object.state = 'closed'
                    object.iconCls = 'icon-drive'
                    // object.parentid = object.parent.id
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'device':
            this.getBaseData(
              'patrolpoint',
              {
                device: event.id,
                dec_type: this.dec_type === 0 ? '' : this.dec_type === 1 ? 0 : this.dec_type === 2 ? 1 : ''
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach((object) => {
                    object.text = object.name
                    object.tp = 'patrolpoint'
                    object.iconCls = 'icon-webcam'
                    // object.parentid = object.parent.id
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
        }
      }
    },
    unitSelect () {
      this.getBaseData('maintenanceunit', {}, (response) => {
        if (response) {
          let data = response.data.results
          this.unitData = data.map((item) => ({
            id: item.id,
            name: item.name
          }))
          this.unitdataSel = this.unitData[0].id
        }
      })
    },
    teamSelect () {
      this.getBaseData(
        'maintenanceteam',
        {
          maintenanceunit: this.unitdataSel
        },
        (response) => {
          if (response) {
            let data = response.data.results
            this.teamData = data.map((item) => ({
              id: item.id,
              name: item.name
            }))
            this.teamdataSel = this.teamData[0].id
          }
        }
      )
    },
    subSelect () {
      this.getBaseData(
        'substation',
        {
          maintenanceteam: this.teamdataSel
        },
        (response) => {
          if (response) {
            let data = response.data.results
            this.subData = data.map((item) => ({
              id: item.id,
              name: item.name
            }))
            this.subdataSel = this.subData[0].id
          }
        }
      )
    },
    confirmDelete (row) {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认删除<' + row.taskname + '>巡视任务方案？',
        result: (r) => {
          if (r) {
            axios({
              method: 'POST',
              async: false,
              url: 'base/modelquery/',
              data: {
                __: 'plantask_delete',
                data: [row.id]
              }
            })
              .then((res) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'info',
                  msg: '巡视任务方案删除成功!'
                })
                this.getplantaskData()
              })
              .catch((error) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'error',
                  msg: error
                })
              })
          }
        }
      })
    },
    confirmStop (row) {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认停用' + row.taskname + '巡视方案？',
        result: (r) => {
          if (r) {
            axios({
              method: 'POST',
              async: false,
              url: 'base/modelquery/',
              data: {
                __: 'plantask_update',
                data: [
                  {
                    id: row.id,
                    enable: 0
                  }
                ]
              }
            })
              .then((res) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'info',
                  msg: '巡视方案已停用'
                })
                this.getplantaskData()
              })
              .catch((error) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'error',
                  msg: error
                })
              })
          }
        }
      })
    },
    confirmEnable (row) {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认启用' + row.taskname + '巡视方案？',
        result: (r) => {
          if (r) {
            axios({
              method: 'POST',
              async: false,
              url: 'base/modelquery/',
              data: {
                __: 'plantask_update',
                data: [
                  {
                    id: row.id,
                    enable: 1
                  }
                ]
              }
            })
              .then((res) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'info',
                  msg: '巡视方案已启用'
                })
                this.getplantaskData()
              })
              .catch((error) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'error',
                  msg: error
                })
              })
          }
        }
      })
    },
    startNow (row) {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认立即执行' + row.taskname + '巡视方案任务？',
        result: (r) => {
          if (r) {
            axios({
              method: 'POST',
              async: false,
              url: 'base/modelquery/',
              data: {
                __: 'runningtask_create',
                data: [
                  {
                    plantask_id: row.id
                  }
                ]
              }
            })
              .then((res) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'info',
                  msg: '任务执行成功'
                })
                this.getplantaskData()
              })
              .catch((error) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'error',
                  msg: error
                })
              })
          }
        }
      })
    },
    detail (row) {
      this.$refs.detail.open()
      this.detaildata = row
      this.getBaseData(
        'plantaskitem_depth',
        {
          plantask: row.id
        },
        (response) => {
          if (response.data) {
            let objects = response.data.results
            this.detailPoints = objects.map((item) => ({
              name: item.patrolpoint.name,
              source: item.patrolpoint.dec_type === 0 ? '视频巡视' : item.patrolpoint.dec_type === 1 ? '机器人巡视' : ''
            }))
          }
        }
      )
    },
    checktask (row) {
      this.$refs.checktask.open()
      this.checkdata = row
      this.getBaseData(
        'plantaskitem_depth',
        {
          plantask: row.id
        },
        (response) => {
          if (response.data) {
            let objects = response.data.results
            this.checkPoints = objects.map((item) => ({
              name: item.patrolpoint.name,
              source: item.patrolpoint.dec_type === 0 ? '视频巡视' : item.patrolpoint.dec_type === 1 ? '机器人巡视' : ''
            }))
          }
        }
      )
    },
    sendCheck () {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认提交巡视方案审核？',
        result: (r) => {
          if (r) {
            this.getnowdate()
            axios({
              method: 'POST',
              async: false,
              url: 'base/modelquery/',
              data: {
                __: 'plantask_update',
                data: [
                  {
                    id: this.checkdata.id,
                    checkstate: this.checkresult === true ? 1 : this.checkresult === false ? 2 : 0,
                    checkman: this.checkman,
                    checkdes: this.checkdos,
                    checktime: this.nowDate
                  }
                ]
              }
            })
              .then((res) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'info',
                  msg: '审核提交成功'
                })
                this.$refs.checktask.close()
                this.getplantaskData()
              })
              .catch((error) => {
                this.$messager.alert({
                  title: '提示',
                  icon: 'error',
                  msg: error
                })
              })
          }
        }
      })
    },
    getnowdate () {
      let yy = new Date().getFullYear()
      let mm = new Date().getMonth() + 1
      let dd = new Date().getDate()
      let hh = new Date().getHours()
      let mf =
        new Date().getMinutes() < 10
          ? '0' + new Date().getMinutes()
          : new Date().getMinutes()
      let ss =
        new Date().getSeconds() < 10
          ? '0' + new Date().getSeconds()
          : new Date().getSeconds()
      this.nowDate = yy + '-' + mm + '-' + dd + 'T' + hh + ':' + mf + ':' + ss
    },
    onNodeExpand (event) {
      if (!event.children) {
        switch (event.tp) {
          case 'maintenanceteam':
            this.getBaseData(
              'substation',
              {
                maintenanceteam: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach((object) => {
                    object.text = object.name
                    object.tp = 'substation'
                    object.iconCls = 'icon-drive'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'maintenanceunit':
            this.getBaseData(
              'maintenanceteam',
              {
                maintenanceunit: event.id,
                parent__isnull: true
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach((object) => {
                    object.text = object.name
                    object.tp = 'maintenanceteam'
                    object.state = 'closed'
                    object.iconCls = 'icon-building-medium'
                    object.disabled = false
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
        }
      }
    },
    onSelectionChange (event) {
      switch (event.tp) {
        case 'substation':
          this.subSelected = event.id
          this.getplantaskData()
          break
        case 'maintenanceteam':
          // this.loading = true
          // axios({
          //   method: 'GET',
          //   async: false,
          //   url: 'base/modelquery/?__=plantask_depth&substation__maintenanceteam__id=' + event.id,
          // })
          //   .then((response) => {
          //     if (response.data) {
          //       let data = response.data.results
          //       console.log(data)
          //       this.taskplanData =  data.map((item) => ({
          //             team: event.id,
          //             substation: item.substation ? item.substation.name : '',
          //             taskname: item.name,
          //             tasktype: item.dictpatroltype ? item.dictpatroltype.name : '',
          //             source: '视频+机器人',
          //             timeplan: item.timingtype,
          //             state: item.enable,
          //             check: item.checkstate
          //       }))
          //     }
          //   })
          //   .catch((error) => {
          //     this.$messager.alert({
          //       title: '提示',
          //       icon: 'error',
          //       msg: error
          //     })
          //   })
          //   .finally((this.loading = false))
          this.subSelected = ''
          this.getplantaskData()
          break
        case 'maintenanceunit':
          // this.titleDetail = event.name
          // this.getTable(
          //   'area',
          //   {
          //     name__contains: this.keyword,
          //     substation: event.substation,
          //     parent: event.id,
          //     offset: (this.pageNumber - 1) * this.pageSize,
          //     limit: this.pageSize
          //   }
          // )
          this.subSelected = ''
          this.getplantaskData()
          break
        default:
          break
      }
    },
    initdate () {
      let a = new Date()
      let y = a.getFullYear()
      let m = a.getMonth() + 1
      let d = a.getDate()
      this.inputdate = [y, m, d].join('-')
    },
    datenum (v, date1904) {
      if (date1904) {
        v += 1462
      }
      var epoch = Date.parse(v)
      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    }
  },
  mounted () {
    // this.getData()
  },
  created () {
    this.getnodeData()
    this.getplantaskData()
  }
}
</script>

<style scoped>
</style>
