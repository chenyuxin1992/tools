<template>
  <div style="f-row">
    <Tree
      style="padding: 5px"
      :data="nodes"
      @nodeExpand="onNodeExpand($event)"
      @nodeDblClick="onNodeDblClick($event)"
      @selectionChange="onSelectionChange($event)">
    </Tree>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ComponentPatrolPointTree',
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
    getData (substation) {
      this.getBaseData(
        'area',
        {
          substation: substation,
          parent__isnull: true
        },
        (response) => {
          if (response.data) {
            let objects = response.data.results
            let data = []
            objects.forEach(object => {
              object.text = object.name
              object.tp = 'voltage'
              object.state = 'closed'
              data.push(object)
            })
            this.nodes = data
          }
        }
      )
    },
    getDlData (patrolpoint) {
      this.getBaseData(
        'patrolpoint',
        {
          id: patrolpoint
        },
        (response) => {
          if (response.data) {
            let point = response.data.results
            this.getBaseData(
              'device',
              {
                id: point[0].device
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  let data = []
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'device'
                    object.state = 'closed'
                    data.push(object)
                  })
                  this.nodes = data
                }
              }
            )
          }
        }
      )
    },
    searchTable () {
      this.params.name__contains = this.keyword
    },
    onSelectionChange (event) {
      this.$emit('onSelectionChange', event)
    },
    onNodeExpand (event) {
      if (!event.children) {
        switch (event.tp) {
          case 'device':
            this.getBaseData(
              'patrolpoint',
              {
                device: event.id
              },
              (response) => {
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'patrolpoint'
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
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'device'
                    object.state = 'closed'
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
                if (response.data) {
                  let objects = response.data.results
                  objects.forEach(object => {
                    object.text = object.name
                    object.tp = 'bay'
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
    onNodeDblClick (event) {
      this.$emit('nodeDblClick', event)
    }
  },
  data () {
    return {
      nodes: [],
      table: null,
      keyword: '',
      substation: null,
      params: null,
      prop: {},
      props: [],
      loading: false
    }
  },
  mounted () {
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
