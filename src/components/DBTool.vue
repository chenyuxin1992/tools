<template>
  <div>
    <Layout>
      <LayoutPanel
        region="west"
        style="width: 300px;"
        :collapsible="false"
        :collapsed="false"
        :expander="true"
      >
        <template slot="header">
          <!-- <p>Checked Items: {{checkedRows.map(row=>row.id).join(',')}}</p> -->
          <div class="f-row">
            <TextBox v-model="keyword" placeholder="请输入关键字" style="width:100%;">
              <Addon>
                <LinkButton @click="searchTable()" iconCls="icon-search" :plain="true">查询</LinkButton>
              </Addon>
            </TextBox>
          </div>
        </template>
        <Tree
          ref="device_tree"
          style="padding: 5px"
          :data="nodes"
          @nodeExpand="onNodeExpand($event)"
          @selectionChange="onSelectionChange($event)">
        </Tree>
      </LayoutPanel>
      <LayoutPanel
        region="center"
        headerCls="main-header"
        :title="title + ' - ' + titleDetail"
        iconCls="icon-table"
      >
        <DataGrid
          class="center"
          :border="false"
          :data="props"
          :columnResizing="true"
          editMode="cell"
          :loading="loading"
          selectionMode="single"
          :pagination="true"
          :lazy="true"
          :total="total"
          :pageNumber="pageNumber"
          :pageSize="pageSize"
          :multiSort="false"
          @sortChange="onSortChange($event)"
          @pageChange="onPageChange($event)"
          @selectionChange="getProperty($event)"
          >
          <GridColumn align="center" cellCss="datagrid-td-rownumber" width="50">
            <template slot="body" slot-scope="scope">
              {{scope.rowIndex + 1}}
            </template>
          </GridColumn>
          <GridColumn field="ck" :width="50" align="center">
            <template slot="header">
              <CheckBox v-model="allChecked" @checkedChange="onAllCheckedChange($event)"></CheckBox>
            </template>
            <template slot="body" slot-scope="scope">
              <CheckBox v-model="scope.row.selected" @checkedChange="onCheckedChange($event)"></CheckBox>
            </template>
          </GridColumn>
          <GridColumn v-for="column in columns" :key="column.value" :field="column.value" :title="column.title" :width="column.width" :sortable="true">
            <template slot="body" slot-scope="scope">
              <div class="item">
                {{column.choices?column.choices[scope.row[column.value]][1]:scope.row[column.value]}}
              </div>
            </template>
          </GridColumn>
        </DataGrid>
      </LayoutPanel>
      <LayoutPanel
        region="east"
        style="width:300px;"
      >
        <template slot="header">
          <div class="f-row">
            <ComboBox @selectionChange="onTableChange($event)" style="width: 100%;" iconCls="icon-table" iconAlign="left" v-model="table" :data="dictModels" valueField="id" textField="name" :editable="false"></ComboBox>
          </div>
        </template>
        <div style="height:100%;">
          <Accordion
            :border="false"
            style="height:100%;"
          >
            <AccordionPanel>
              <template slot="header">
                <div class="f-row">
                  <LinkButton :disabled="prop.id===undefined" @click="doSave()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'保存'"></LinkButton>
                  <LinkButton :disabled="checkedRows.length<1" @click="doDelete()" iconCls="icon-cross" :plain="true" v-Tooltip="'删除'"></LinkButton>
                  <LinkButton @click="doAdd()" iconCls="icon-plus" :plain="true" v-Tooltip="'新增'"></LinkButton>
                  <LinkButton @click="doExport()" iconCls="icon-document-excel-csv" :plain="true" v-Tooltip="'导出数据'"></LinkButton>
                  <FileButton @select="doImport($event)" iconCls="icon-drive-download" :plain="true" v-Tooltip="'导入数据'" accept="text/csv"></FileButton>
                  <LinkButton @click="doBackup()" iconCls="icon-database-export" :plain="true" v-Tooltip="'备份数据库'"></LinkButton>
                  <!-- <LinkButton :disabled="row.id===undefined" @click="doCopy()" iconCls="icon-document-copy" :plain="true" v-Tooltip="'拷贝'"></LinkButton>
                  <LinkButton :disabled="row.id===undefined" @click="doPaste()" iconCls="icon-clipboard-paste" :plain="true" v-Tooltip="'粘贴'"></LinkButton> -->
                </div>
              </template>
              <Form v-if="prop.id!=null" :model="prop" labelAlign="left" style="padding:10px 30px 10px 10px;">
                <FormField v-for="item in formFields" :key="item.key" :label="item.type==='ManyToOneRel' ? '关联:' : item.label + ':'">
                  <TextBox :editable="item.key!=='id'" v-if="!item.choices&&item.type==='CharField'" v-model="prop[item.key]" :multiline="true" style="height:80px;"></TextBox>
                  <TextBox :editable="item.key!=='id'" v-if="!item.choices&&item.type==='TextField'" v-model="prop[item.key]" :multiline="true" style="height:80px;"></TextBox>
                  <NumberBox v-if="!item.choices&&item.type==='IntegerField'" spinAlign="horizontal" v-model="prop[item.key]"></NumberBox>
                  <NumberBox v-if="!item.choices&&item.type==='FloatField'" :precision="5" spinAlign="horizontal" v-model="prop[item.key]"></NumberBox>
                  <ComboBox v-if="item.type==='ForeignKey'" v-model="prop[item.key]" style="width:100px;" :data="dicts[item.related]" valueField="id" textField="name" :editable="false"></ComboBox>
                  <ComboBox v-if="item.choices" v-model="prop[item.key]" style="width:100px;" :data="item.choices" valueField="0" textField="1" :editable="false"></ComboBox>
                  <LinkButton v-if="item.type==='ManyToOneRel'" @click="getTableEx(item.key, table, prop.id, title + ':' + prop.name)" style="width:100%;">{{item.label}}</LinkButton>
                  <DateTimeSpinner v-if="item.type==='DateTimeField'" v-model="prop[item.key]" format="yyyy-dd-MMTHH:mm:ss" style="width:100%;"></DateTimeSpinner>
                  <TimeSpinner v-if="item.type==='TimeField'" v-model="prop[item.key]" format="HH:mm:ss" style="width:100%;"></TimeSpinner>
                </FormField>
              </Form>
            </AccordionPanel>
            <AccordionPanel
              iconCls="icon-surveillance-camera"
              style="white-space:nowrap;text-overflow:ellipsis;"
              :title="presetName ? presetName : '预置位生成器'"
            >
              <div style="width:100%;height:100%;">
                <ComponentCameraSelector @onGetCameraParams="onGetCameraParams($event)" ref="camsql" style="width:100%;height:100%;">
                </ComponentCameraSelector>
              </div>
            </AccordionPanel>
          </Accordion>
        </div>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DBTool',
  watch: {
    table (newValue, oldValue) {
      if (newValue !== oldValue) {
        for (let i = 0; i < this.dictModels.length; i++) {
          if (this.dictModels[i].id === newValue) {
            this.title = this.dictModels[i].name
            this.fields = this.dictModels[i].fields
            this.columns = []
            this.formFields = []
            if (this.fields.length > 0) {
              this.getTableFields()
              this.getFormFields()
            }
          }
        }
      }
    }
  },
  props: {},
  computed: {
    checkedRows () {
      return this.props.filter(row => row.selected)
    }
  },
  methods: {
    onAllCheckedChange (checked) {
      if (this.rowClicked) {
        return
      }
      this.props = this.props.map(row => {
        return Object.assign({}, row, {
          selected: checked
        })
      })
    },
    onCheckedChange (checked) {
      this.allChecked = this.checkedRows.length === this.props.length
      this.rowClicked = true
      this.$nextTick(() => (this.rowClicked = false))
    },
    getTableFields () {
      this.fields.forEach(field => {
        switch (field.type) {
          case 'ManyToOneRel':
            break
          case 'ForeignKey':
          case 'CharField':
          case 'DateTimeField':
            this.columns.push({
              value: field.id,
              title: field.name,
              width: 200,
              choices: field.choices
            })
            break
          case 'FloatField':
          case 'IntegerField':
          default:
            this.columns.push({
              value: field.id,
              title: field.name,
              width: 100,
              choices: field.choices
            })
            break
        }
      })
    },
    getFormFields () {
      this.fields.forEach(field => {
        let formField = {}
        formField.key = field.id
        formField.label = field.name
        formField.type = field.type
        formField.related = field.related
        formField.choices = field.choices
        this.formFields.push(formField)
      })
    },
    getBaseData (table, params, callback) {
      this.loading = true
      axios({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
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
    getData () {
      this.getBaseData(
        'maintenanceunit',
        {},
        (response) => {
          let content = this.decrypt(response)
          if (content) {
            let objects = content.results
            let data = []
            objects.forEach(object => {
              object.text = object.name
              object.tp = 'maintenanceunit'
              object.iconCls = 'icon-building-hedge'
              object.state = 'closed'
              data.push(object)
            })
            this.nodes = data
          }
        }
      )
    },
    reloadTable () {
      if (this.table === 'maintenanceunit' ||
        this.table === 'maintenanceteam' ||
        this.table === 'substation' ||
        this.table === 'area' ||
        this.table === 'device') {
        this.getData()
      }
      this.getTable(this.table, this.params)
    },
    searchTable () {
      this.params.name__contains = this.keyword
      this.getTable(this.table, this.params)
    },
    getTable (table, params) {
      this.loading = true
      this.getBaseData(
        table,
        params,
        (response) => {
          let content = this.decrypt(response)
          if (content) {
            this.total = content.count
            this.table = table
            this.params = params
            this.props = content.results
            this.prop = {}
            this.dicts[table] = content.results
          }
          this.loading = false
        }
      )
    },
    getTableEx (table, key, value, title) {
      let params = {}
      params[key] = value
      this.titleDetail = title
      this.getTable(table, params)
    },
    setPreset (event) {
      this.request(
        'POST',
        'base/bindpreset/',
        {
          detector: event.detector,
          ptzH: event.ptzH,
          ptzV: event.ptzV,
          ptzZ: event.ptzZ,
          patrolpoint: this.patrolpoint.id,
          name: this.patrolpoint.name
        },
        (response) => {
          let content = this.decrypt(response)
          if (content.result === 'success') {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: this.patrolpoint.name + '预置位绑定成功!'
            })
            this.reloadTable()
          } else {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: content.detail
            })
          }
        }
      )
    },
    onGetCameraParams (event) {
      if (this.patrolpoint) {
        this.setPreset(event)
      }
    },
    onSelectionChange (event) {
      switch (event.tp) {
        case 'device':
          this.titleDetail = event.name
          this.getTable(
            'patrolpoint',
            {
              name__contains: this.keyword,
              substation: event.substation,
              device: event.id,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          this.substation = event.substation
          break
        case 'maintenanceunit':
          this.titleDetail = event.name
          this.getTable(
            'maintenanceteam',
            {
              name__contains: this.keyword,
              maintenanceunit: event.id,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          break
        case 'maintenanceteam':
          this.titleDetail = event.name
          this.getTable(
            'substation',
            {
              name__contains: this.keyword,
              maintenanceteam: event.id,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          break
        case 'substation':
          this.titleDetail = event.name
          this.getTable(
            'area',
            {
              name__contains: this.keyword,
              substation: event.id,
              parent__isnull: true,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          this.substation = event.id
          break
        case 'voltage':
          this.titleDetail = event.name
          this.getTable(
            'area',
            {
              name__contains: this.keyword,
              substation: event.substation,
              parent: event.id,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          this.substation = event.substation
          break
        case 'bay':
          this.titleDetail = event.name
          this.getTable(
            'device',
            {
              name__contains: this.keyword,
              substation: event.substation,
              area: event.id,
              offset: (this.pageNumber - 1) * this.pageSize,
              limit: this.pageSize
            }
          )
          this.substation = event.substation
          break
        default:
          break
      }
    },
    onNodeExpand (event) {
      if (!event.children) {
        switch (event.tp) {
          case 'bay':
            this.getBaseData(
              'device',
              {
                area: event.id
              },
              (response) => {
                let content = this.decrypt(response)
                if (content) {
                  let objects = content.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'device'
                    object.iconCls = 'icon-leaf'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'voltage':
            this.getBaseData(
              'area',
              {
                parent: event.id
              },
              (response) => {
                let content = this.decrypt(response)
                if (content) {
                  let objects = content.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'bay'
                    object.iconCls = 'icon-box'
                    object.state = 'closed'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'substation':
            this.getBaseData(
              'area',
              {
                substation: event.id,
                parent__isnull: true
              },
              (response) => {
                let content = this.decrypt(response)
                if (content) {
                  let objects = content.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'voltage'
                    object.iconCls = 'icon-wooden-box'
                    object.state = 'closed'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'maintenanceteam':
            this.getBaseData(
              'substation',
              {
                maintenanceteam: event.id
              },
              (response) => {
                let content = this.decrypt(response)
                if (content) {
                  let objects = content.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'substation'
                    object.iconCls = 'icon-drive'
                    object.state = 'closed'
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
                maintenanceunit: event.id
              },
              (response) => {
                let content = this.decrypt(response)
                if (content) {
                  let objects = content.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'maintenanceteam'
                    object.iconCls = 'icon-building-medium'
                    object.state = 'closed'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
        }
      }
    },
    onSortChange (event) {
      let ordering = event.map(row => (row.order === 'desc' ? '-' : '') + row.field)
      this.params.ordering = ordering.toString()
      this.getTable(this.table, this.params)
    },
    onPageChange (event) {
      this.params.offset = (event.pageNumber - 1) * event.pageSize
      this.params.limit = event.pageSize
      this.getTable(this.table, this.params)
    },
    onTableChange (event) {
      this.titleDetail = '全部'
      this.keyword = ''
      this.getTable(event.id, {})
    },
    getProperty (event) {
      this.hasPreset = event.hasOwnProperty('detector')
      if (this.hasPreset) {
        this.presetName = event.name
        this.patrolpoint = event
      }
      this.prop = event
    },
    doCopy () {
    },
    doPaste () {
    },
    postBaseData (data) {
      this.loading = true
      axios({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/' + this.table + '/',
        data: data
      })
        .then((res) => {
          this.reloadTable()
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    doExport () {
      this.loading = true
      let params = {
        __: this.table + '_csv'
      }

      for (let object of Object.entries(this.params)) {
        if (object[0] !== 'limit' && object[0] !== 'offset') {
          params[object[0]] = object[1]
        }
      }

      axios({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/modelquery/',
        params: params
      })
        .then((response) => {
          let content = this.decrypt(response)
          const url = window.URL.createObjectURL(new Blob([content]))
          const link = document.createElement('a')
          let ts = this.dateFormat('YYYYmmddHHMMSS', new Date())
          link.href = url
          link.setAttribute('download', this.table + '_' + ts + '.csv')
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    doImport (event) {
      const file = event[0]
      this.loading = true
      const table = file.name.split('_')[0]
      let data = new FormData()
      data.append('file', file)
      data.append('table', table)
      axios({
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/csv/',
        data: data
      })
        .then((response) => {
          let content = this.decrypt(response)
          if (content.result === 'success') {
            this.$messager.alert({
              title: '提示',
              icon: 'info',
              msg: file.name + '已成功导入到' + table
            })
            this.reloadTable()
          } else {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: content.detail
            })
          }
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    doBackup () {
      this.loading = true
      axios({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/backuprestore/'
      })
        .then((response) => {
          let content = this.decrypt(response)
          if (content.result === 'error') {
            this.$messager.alert({
              title: '提示',
              icon: 'error',
              msg: content.detail
            })
          } else {
            const url = window.URL.createObjectURL(new Blob([content]))
            const link = document.createElement('a')
            let ts = this.dateFormat('YYYYmmddHHMMSS', new Date())
            link.href = url
            link.setAttribute('download', 'nik_platform_' + ts + '.sql')
            document.body.appendChild(link)
            link.click()
          }
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    doAdd () {
      this.$messager.prompt({
        title: this.title + ' - 新增',
        msg: '请输入名称',
        result: r => {
          if (r) {
            let params = {
              name: r
            }
            this.fields.forEach(field => {
              if (field.type === 'ForeignKey') {
                if (this.params[field.id]) {
                  params[field.id] = this.params[field.id]
                }
              }
            })
            this.postBaseData(params)
          }
        }
      })
    },
    doSave () {
      let data = {}

      // delete data.tp
      // delete data.children
      // delete data.state
      // delete data.text
      // delete data.datetime

      for (let object of Object.entries(this.prop)) {
        if (object[1] && typeof object[1] === 'object') {
          data[object[0]] = object[1].id
        } else {
          data[object[0]] = object[1]
        }
      }

      this.loading = true

      axios({
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
        },
        async: false,
        url: 'base/' + this.table + '/' + data.id + '/',
        data: data
      })
        .then((res) => {
          this.loading = false
          this.reloadTable()
        })
        .catch((error) => {
          this.$messager.alert({
            title: '提示',
            icon: 'error',
            msg: error
          })
        })
        .finally((this.loading = false))
    },
    doDelete () {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认删除选中的' + this.checkedRows.length + '条记录?',
        result: r => {
          if (r) {
            this.request(
              'POST',
              'base/modelquery/',
              {
                __: this.table + '_delete',
                data: this.checkedRows.map(row => row.id)
              },
              (response) => {
                if (response.data.result === 'success') {
                  this.reloadTable()
                } else {
                  this.$messager.alert({
                    title: '提示',
                    icon: 'error',
                    msg: response.data.detail
                  })
                }
              }
            )
          }
        }
      })
    }
  },
  data () {
    return {
      title: '未加载',
      titleDetail: '全部',
      patrolpoint: null,
      nodes: [],
      table: null,
      keyword: '',
      substation: null,
      params: null,
      property: {},
      rowCopy: null,
      prop: {},
      total: 0,
      pageNumber: 1,
      pageSize: 50,
      props: [],
      fields: [],
      formFields: [],
      columns: [],
      loading: false,
      dicts: {},
      dictModels: [],
      hasPreset: false,
      presetName: '',
      allChecked: false,
      rowClicked: false
    }
  },
  mounted () {
    this.getData()
    this.getBaseData('models', {}, (response) => {
      console.log(response)
      let content = this.decrypt(response)
      this.dictModels = content.results
      this.dictModels.forEach((model) => {
        if (model.id.slice(0, 4) === 'dict') {
          this.getBaseData(model.id, {}, (response) => {
            let content = this.decrypt(response)
            this.dicts[model.id] = content.results
          })
        }
      })
      if (this.dictModels.length > 0) {
        this.getTable(this.dictModels[0].id)
      }
    })
  },
  components: {}
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.button-sep-small {
  border-left: 1px solid #dddddd;
  border-right: 1px solid #cccccc;
  margin: 3px 1px;
}
.center {
  width: 100%;
  height: calc(100vh - 117px);
  overflow: hidden;
}
</style>
