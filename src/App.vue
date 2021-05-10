<template>
  <div id="app">
    <div class="bar-header" v-if="isLogin">
      <div class="bar-header-left">
        <span class="bar-header-logo">
          <img src="./assets/logo.svg" width="40" height="100%">
        </span>
        <span class="bar-header-title">Lamb Benben in Samui</span>
      </div>
      <div class="bar-header-right">
        <div  v-for="item in menu" :key="item.id" class="bar-header-menu">
          <div class="dropdown">
            <button class="dropbtn">{{item.name}}</button>
            <div v-if="item.children.length > 0" class="dropdown-content">
              <a v-for="node in item.children" :key="node.id" @click="openUrl(item.name, node)">{{node.name}}</a>
            </div>
          </div>
        </div>
        <div class="bar-header-menu">
          <span class="bar-sep"></span>
        </div>
        <div class="bar-header-menu">
          <a class="bar-icon" href="">
            <i class="fa fa-user" aria-hidden="true"></i>
            {{username}}
          </a>
        </div>
        <div class="bar-header-menu">
          <span class="bar-sep"></span>
        </div>
        <div class="bar-header-menu">
          <a class="bar-icon" href="">
            <i class="fa fa-power-off" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
    <div class="bar-nav" v-if="isLogin">
      <div class="bar-header-left">
        <span class="bar-nav-title">{{location}}</span>
      </div>
    </div>
    <Dialog
      ref="login_dailog"
      borderType="none"
      :dialogStyle="{width:'360px'}"
      :modal="true"
      :closed="isLogin">
      <div style="padding:0 20px">
        <div class="login-title">
          <span style="color:#f15a22">NIK</span><span style="color:#009ad6">Toolbox</span></div>
        <div class="login-text">
          <p>v0.3a</p>
        </div>
        <div style="margin-top:40px">
          <TextBox v-model="username" placeholder="账号" iconCls="icon-man" style="width:100%;height:40px;"></TextBox>
        </div>
        <div style="margin:30px 0px 50px 0px;">
          <PasswordBox v-model="password" placeholder="密码" style="width:100%;height:40px;"></PasswordBox>
        </div>
      </div>
      <div slot="footer">
        <ButtonGroup style="width:100%;height:50px">
          <LinkButton class="f-full" @click="login()" :plain="true" btnCls="login-btn">登录</LinkButton>
        </ButtonGroup>
      </div>
    </Dialog>
    <router-view v-if="isLogin" class="content"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      username: 'hammer',
      password: 'hammer',
      isLogin: true,
      location: '',
      menu: [
        {
          id: '1',
          name: 'Database',
          path: '',
          children: [
            {
              id: '1.1',
              name: 'Database Editor',
              path: '/DBTool'
            }
          ]
        },
        {
          id: '2',
          name: 'Media',
          path: '',
          children: [
            {
              id: '2.1',
              name: 'Media Config',
              path: '/MediaConfig'
            },
            {
              id: '2.2',
              name: 'DL Config',
              path: '/DLConfig'
            }
          ]
        },
        {
          id: '3',
          name: 'Graphic',
          path: '',
          children: [
            {
              id: '3.1',
              name: 'Graphic Editor',
              path: '/GraphicEditor'
            },
            {
              id: '3.2',
              name: 'Graphic Browser',
              path: '/GraphicBrowser'
            }
          ]
        }
      ]
    }
  },
  methods: {
    login () {
      if (this.username === 'hammer' && this.password === 'hammer791023') {
        this.$refs.login_dailog.close()
        this.isLogin = true
      }
    },
    openUrl (name, node) {
      this.$router.push({ path: node.path })
        .then((res) => {
          if (node.path === res.path) {
            this.location = name + ' > ' + node.name
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* overflow: hidden; */
}
.content {
  width: 100%;
  height: calc(100vh - 80px);
  padding: 5px;
  background-color: #f0f6ee;
}
body {
  margin: 0px;
  padding: 0px;
}
.login-title {
  font-size: 27px;
  margin-top: 50px;
  text-align: center;
}
.login-text {
  font-size: 14px;
  color: #8a8c8e;
  text-align: center;
  margin: 20px 0;
}
.login-btn,
.login-btn:hover {
  border-radius: 0;
}

.bar-sep{
  border-right: 1px solid #afdfe4;
  height: 70%;
}
.bar-header {
  background-color: #5e7c85;
  vertical-align: middle;
  height: 50px;
  overflow: hidden;
}
.bar-nav {
  vertical-align: middle;
  height: 30px;
  background-color: #f0f6ee;
}
.bar-header-left {
  width: 30%;
  height: 100%;
  float: left;
  display: flex;
}
.bar-header-logo {
  padding-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  align-self: center;
}
.bar-header-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 5px 5px 5px;
  color:white;
  align-self: center;
  font-size: 18px;
  font-weight:bold;
}
.bar-nav-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 15px 0px 15px;
  align-self: center;
  color: #333333;
  font-size: 12px;
}
.bar-header-right {
  position: absolute;
  right: 0px;
  height: 50px;
  float: right;
  display: flex;
  background-color: #5e7c85;
}
.bar-header-menu {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 10px;
  align-self: center;
}
.bar-header-menu a {
  color:ghostwhite;
  font-size: 13px;
  font-weight: bold;
  text-decoration: none;
}
.bar-header-menu a:hover {
  color:#FFC357;
}
.bar-user a {
  font-size: 12px;
}
.bar-icon {
  color: white;
  font-size: 14px;
}

.dropbtn {
  background-color: #5e7c85;
  color: white;
  padding: 5px 5px;
  align-self: center;
  font-size: 13px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

/* 容器 <div> - 需要定位下拉内容 */
.dropdown {
  width: 70px;
  /* position: relative; */
  /* display: inline-block; */
}

/* 下拉内容 (默认隐藏) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #5e7c85;
  min-width: 120px;
  padding: 5px;
  margin-left: -25px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  cursor: pointer;
}

.c1 {
  color: #56CB82;
  color: #FFC357;
  color: #50529E;
  color: #F2764C;
  color: #D4D4D4;
  color: #5e7c85;
  color: #f0f6ee;
}

/* 下拉菜单的链接 */
.dropdown-content a {
  color: white;
  padding: 10px 10px;
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
  display: block;
}

/* 鼠标移上去后修改下拉菜单链接颜色 */
.dropdown-content a:hover {
  color: white;
  background-color: #FFC357;
  border-radius: 5px;
}

/* 在鼠标移上去后显示下拉菜单 */
.dropdown:hover .dropdown-content {
  font-weight: bold;
  display: block;
}

/* 当下拉内容显示后修改下拉按钮的背景颜色 */
.dropdown:hover .dropbtn {
  color: #FFC357;
}
</style>
