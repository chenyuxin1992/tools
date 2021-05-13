<template>
  <div>
    <Layout>
      <LayoutPanel
        region="west"
        style="width: 300px;"
        title="设备列表"
        iconCls="icon-document-tree"
        :collapsible="true"
        :collapsed="false"
        :expander="true"
      >
        <Tree
          style="padding:5px"
          :data="nodes"
          @nodeExpand="onNodeExpand($event)"
          @nodeDblClick="onNodeDblClick($event)"
          @selectionChange="onSelectionChange($event)">
        </Tree>
      </LayoutPanel>
      <LayoutPanel
        region="center"
        headerCls="main-header"
        :title="title"
        iconCls="icon-webcam"
      >
        <ComponentMediaPlayer ref="player">
        </ComponentMediaPlayer>
      </LayoutPanel>
      <LayoutPanel
        region="east"
        style="width:300px;"
      >
        <template slot="header">
          <div class="f-row">
            <LinkButton :disabled="prop.idx===undefined" @click="doSave()" iconCls="icon-disk-return-black" :plain="true" v-Tooltip="'保存'"></LinkButton>
            <LinkButton v-if="true" @click="doAddDevice()" iconCls="icon-drive-plus" :plain="true" v-Tooltip="'新增设备'"></LinkButton>
            <LinkButton v-if="table==='device'" @click="doDeleteDevice()" iconCls="icon-drive-minus" :plain="true" v-Tooltip="'删除设备'"></LinkButton>
            <LinkButton v-if="table==='device'" @click="doAddChannel()" iconCls="icon-webcam-plus" :plain="true" v-Tooltip="'新增通道'"></LinkButton>
            <LinkButton v-if="table==='channel'" @click="doDeleteChannel()" iconCls="icon-webcam-minus" :plain="true" v-Tooltip="'删除通道'"></LinkButton>
            <LinkButton :disabled="nodes.length===0" @click="doExport()" iconCls="icon-document-excel-csv" :plain="true" v-Tooltip="'导出数据'"></LinkButton>
          </div>
        </template>
        <Form :model="prop" labelAlign="left" style="padding:10px 30px 10px 10px;">
          <FormField v-if="prop.idx!=null" label="设备ID:">
            <NumberBox spinAlign="horizontal" v-model="prop.idx"></NumberBox>
          </FormField>
          <FormField v-if="prop.name!=null" label="设备名:">
            <TextBox v-model="prop.name"></TextBox>
          </FormField>
          <FormField v-if="prop.user!=null" label="设备账号:">
            <TextBox iconCls="icon-man" v-model="prop.user"></TextBox>
          </FormField>
          <FormField v-if="prop.pass!=null" label="设备密码:">
            <PasswordBox v-model="prop.pass" placeholder="密码"></PasswordBox>
          </FormField>
          <FormField v-if="prop.devip!=null" label="设备地址:">
            <TextBox v-model="prop.devip"></TextBox>
          </FormField>
          <FormField v-if="prop.serial!=null" label="序列号:">
            <TextBox v-model="prop.serial" :multiline="true" :editable="false" style="height:60px;"></TextBox>
          </FormField>
          <FormField v-if="prop.startChannel!=null" label="起始通道:">
            <span class="static-text">{{prop.startChannel}}</span>
          </FormField>
          <FormField v-if="prop.maxChannel!=null" label="通道数量:">
            <span class="static-text">{{prop.maxChannel}}</span>
          </FormField>
          <FormField v-if="prop.port!=null" label="设备端口:">
            <NumberBox spinAlign="horizontal" v-model="prop.port"></NumberBox>
          </FormField>
          <FormField v-if="prop.type!=null" label="设备类型:">
            <ComboBox v-model="prop.type" :plain="true" :data="deviceTypeOptions" :editable="false"></ComboBox>
          </FormField>
          <FormField v-if="prop.no!=null" label="通道号:">
            <NumberBox spinAlign="horizontal" v-model="prop.no"></NumberBox>
          </FormField>
          <FormField v-if="prop.rtsp!=null" label="使能RTSP:">
            <SwitchButton v-model="prop.rtsp"></SwitchButton>
          </FormField>
          <FormField v-if="prop.rtmp!=null" label="使能RTMP:">
            <SwitchButton v-model="prop.rtmp"></SwitchButton>
          </FormField>
          <FormField v-if="prop.hls!=null" label="使能HLS:">
            <SwitchButton v-model="prop.hls"></SwitchButton>
          </FormField>
          <FormField v-if="prop.byneed!=null" label="按需推流:">
            <SwitchButton v-model="prop.byneed"></SwitchButton>
          </FormField>
          <FormField v-if="prop.ptz!=null" label="是否可控:">
            <ComboBox v-model="prop.ptz" :plain="true" :data="ptzTypeOptions" :editable="false"></ComboBox>
          </FormField>
          <FormField v-if="prop.devidx!=null" label="所属设备:">
            <ComboBox v-model="prop.devidx" :plain="true" :data="deviceOptions" :editable="false"></ComboBox>
          </FormField>
          <FormField v-if="prop.audio!=null" label="音频类型:">
            <ComboBox v-model="prop.audio" :plain="true" :data="audioTypeOptions" :editable="false"></ComboBox>
          </FormField>
        </Form>
      </LayoutPanel>
    </Layout>
  </div>
</template>

<script>
export default {
  name: 'MediaConfig',
  watch: {
  },
  methods: {
    getData () {
      this.request(
        'GET',
        'media/api/v2/devicelist',
        {},
        (response) => {
          console.log(response)
          if (response.data) {
            let objects = response.data.DeviceList
            let data = []
            this.deviceOptions = []
            objects.forEach(object => {
              let node = {}
              node.id = object['DevIdx']
              node.text = object['devName']
              node.table = 'device'
              node.data = object
              node.state = 'closed'
              node.online = object['online']
              node.iconCls = node.online ? 'icon-drive' : 'icon-drive-exclamation'
              data.push(node)
              this.deviceOptions.push({
                text: node.text,
                value: node.id
              })
              this.nodes = data
            })
          }
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
    showErrorMsg (success) {
      let msg = ''
      switch (success) {
        case -1:
          msg = '连接数据库失败'
          break
        case -2:
          msg = '参数错误'
          break
        case -3:
          msg = '设备错误'
          break
        case -4:
          msg = '通道号错误'
          break
        default:
          msg = '未知错误'
          break
      }

      this.$messager.alert({
        title: '提示',
        icon: 'error',
        msg: msg
      })
    },
    doSave () {
      let params = {}
      for (let object of Object.entries(this.prop)) {
        let key = object[0]
        let value = object[1]
        if (typeof value === 'boolean') {
          value = value ? 1 : 0
        }
        params[key] = value
      }
      this.request(
        'GET',
        'media/api/v2/modify' + this.table,
        params,
        (response) => {
          if (response.data.success === 0) {
            this.reload()
          } else {
            this.showErrorMsg(response.data.success)
          }
        }
      )
    },
    doAddDevice () {
      // idx 设备ID，唯一值，用户可指定设备ID值（>=0），当用户指定的值已经存在，添加设备失败。指定为-1时，由系统自动分配。
      // name 设备名称，最大长度128
      // user 登陆设备用户名，最大长度32，非空
      // pass 登陆设备密码，最大长度32，非空
      // devip 设备IP地址
      // type 设备类型，目前只支持1 海康，2 大华两种
      // port 登陆设备端口号
      let params = {
        idx: -1,
        name: '新增设备',
        user: 'admin',
        pass: 'admin',
        devip: '0.0.0.0',
        port: 8000,
        type: 1
      }
      this.request(
        'GET',
        'media/api/v2/adddevice',
        params,
        (response) => {
          if (response.data.success === 0) {
            this.reload()
          } else {
            this.showErrorMsg(response.data.success)
          }
        }
      )
    },
    doAddChannel () {
      // idx 通道ID，唯一值，用户可指定通道ID值（>=0），当用户指定的值已经存在，添加失败。指定为-1时，由系统自动分配。
      // name 通道名称，最大长度128
      // no 通道号，所属设备的对应通道号，0~X，X根据设备能力可能是8-64个
      // devidx 所属设备的idx
      // rtsp 0或1，是否使能rtsp
      // rtmp 0或1，是否使能rtmp rtmp和flv格式使用同一服务，因此使能rtmp将同时提供rtmp和flv格式
      // hls 0或1，是否使能hls
      // byneed 0或1，是否按需推拉流，0：通道推流后不再关断，可提高通道响应流能力，但占用资源，1：按需推拉流，当用户访问流，自动开始流服务，没有用户使用该流时，自动关闭，释放资源。
      // audio 音频类型，根据摄像头设置的音频格式定义，整数，2：AAC，3：G711a，4：G711u，其它值无效，不转发音频
      // ptz 控制属性 0:不可控 1:可控
      this.$messager.prompt({
        title: '新增通道',
        msg: '请输入通道号',
        result: r => {
          if (r) {
            let params = {
              idx: -1,
              name: '新增通道-' + r,
              no: parseInt(r),
              devidx: this.prop.idx,
              rtsp: 1,
              rtmp: 1,
              hls: 1,
              byneed: 1,
              audio: 0,
              ptz: 1
            }
            this.request(
              'GET',
              'media/api/v2/addchannel',
              params,
              (response) => {
                if (response.data.success === 0) {
                  this.reload()
                } else {
                  this.showErrorMsg(response.data.success)
                }
              }
            )
          }
        }
      })
    },
    doDeleteDevice () {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认删除' + this.prop.name + '?',
        result: r => {
          if (r) {
            this.request(
              'GET',
              'media/api/v2/deldevice',
              {
                idx: this.prop.idx
              },
              (response) => {
                if (response.data.success === 0) {
                  this.reload()
                } else {
                  this.showErrorMsg(response.data.success)
                }
              }
            )
          }
        }
      })
    },
    doDeleteChannel () {
      this.$messager.confirm({
        title: '确认',
        msg: '是否确认删除' + this.prop.name + '?',
        result: r => {
          if (r) {
            this.request(
              'GET',
              'media/api/v2/delchannel',
              {
                devidx: this.prop.devidx,
                channelno: this.prop.no
              },
              (response) => {
                if (response.data.success === 0) {
                  this.reload()
                } else {
                  this.showErrorMsg(response.data.success)
                }
              }
            )
          }
        }
      })
    },
    reload () {
      this.getData()
    },
    onSelectionChange (event) {
      this.table = event.table
      if (event.table === 'device') {
        this.prop = {
          idx: event.data['DevIdx'],
          name: event.data['devName'],
          user: event.data['userName'],
          pass: event.data['passWord'],
          devip: event.data['DevIp'],
          port: event.data['DevPort'],
          type: event.data['DevType'],
          serial: event.data['DevSerialNumber'],
          startChannel: event.data['startDChannel'],
          maxChannel: event.data['maxIPChannel']
        }
      } else {
        this.prop = {
          idx: event.data['channelIdx'],
          name: event.data['channelName'],
          no: event.data['channelNo'],
          devidx: event.devidx,
          rtsp: event.data['enable_rtsp'],
          rtmp: event.data['enable_rtmp'],
          hls: event.data['enable_hls'],
          byneed: event.data['playOnNeed'],
          audio: event.data['audioType'],
          ptz: event.data['ptzType']
        }
      }
    },
    onNodeDblClick (event) {
      if (event.flvUrl) {
        this.title = event.text
        this.$refs.player.play(event['devidx'], event.data['channelNo'])
      }
    },
    doExport () {
      var csv = 'name,out_code,video_address1\n'
      this.nodes.forEach((node) => {
        if (node.children) {
          node.children.forEach((channel) => {
            let name = channel.text
            let outCode = channel['devidx'] + '_' + channel.data['channelNo']
            let videoAddress = 'media/' + channel['devidx'] + '/' + channel.data['channelNo'] + '.flv'
            csv += name + ',' + outCode + ',' + videoAddress + '\n'
          })
        }
      })
      const url = window.URL.createObjectURL(new Blob([csv]))
      const link = document.createElement('a')
      let ts = this.dateFormat('YYYYmmddHHMMSS', new Date())
      link.href = url
      link.setAttribute('download', 'media_' + ts + '.csv')
      document.body.appendChild(link)
      link.click()
    }
  },
  data () {
    return {
      title: '播放器',
      nodes: [],
      table: null,
      params: null,
      prop: {},
      keyCode: null,
      command: null,
      speed: 2,
      loading: false,
      deviceOptions: [],
      deviceTypeOptions: [
        {'text': '未定义', 'value': 0},
        {'text': '海康', 'value': 1},
        {'text': '大华', 'value': 2}
      ],
      audioTypeOptions: [
        {'text': '不转发音频', 'value': 0},
        {'text': 'AAC', 'value': 2},
        {'text': 'G711a', 'value': 3},
        {'text': 'G711u', 'value': 4}
      ],
      ptzTypeOptions: [
        {'text': '不可控', 'value': 0},
        {'text': '可控', 'value': 1}
      ]
    }
  },
  mounted () {
    this.getData()
  }
}
</script>
