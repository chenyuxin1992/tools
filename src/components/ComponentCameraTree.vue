<template>
  <div style="f-row">
    <Tree
      style="padding: 5px"
      :data="nodes"
      :checkbox="true"
      @checkChange="checkedNodes=$event"
      @nodeExpand="onNodeExpand($event)"
      @nodeDblClick="onNodeDblClick($event)"
      @selectionChange="onSelectionChange($event)">
    </Tree>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ComponentCameraTree',
  methods: {
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
          if (response.data) {
            let objects = response.data.results
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
    onSelectionChange (event) {
      this.$emit('selectionChange', event)
    },
    onNodeDblClick (event) {
      this.$emit('nodeDblClick', event)
    },
    onNodeExpand (event) {
      if (!event.children) {
        switch (event.tp) {
          case 'maintenanceunit':
            this.getBaseData(
              'maintenanceteam',
              {
                maintenanceunit: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
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
          case 'maintenanceteam':
            this.getBaseData(
              'substation',
              {
                maintenanceteam: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
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
          case 'substation':
            this.getBaseData(
              'detector',
              {
                substation: event.id,
                ordering: 'name'
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'detector'
                    object.iconCls = object.dec_type === 0 ? 'icon-webcam' : 'icon-robot'
                    object.state = 'closed'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
          case 'detector':
            this.getBaseData(
              'preset',
              {
                detector: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'preset'
                    object.iconCls = 'icon-surveillance-camera'
                  })
                  this.$set(event, 'children', objects)
                }
              }
            )
            break
        }
      }
    },
    deletePresets () {
      let toDelete = []
      this.checkedNodes.forEach((node) => {
        if (node.tp === 'preset') {
          toDelete.push(node.id)
        }
      })

      this.$messager.confirm({
        title: '确认',
        msg: '是否确认删除选中的' + toDelete.length + '个预置位?',
        result: r => {
          if (r) {
            this.request(
              'POST',
              'base/modelquery/',
              {
                __: 'preset_delete',
                data: toDelete
              },
              (response) => {
                if (response.data.result === 'success') {
                  this.getData()
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
      nodes: [],
      loading: false,
      checkedNodes: null
    }
  },
  mounted () {
    this.getData()
  }
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
