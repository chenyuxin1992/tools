import Vue from 'vue'
import VueRouter from 'vue-router'
import GraphicEditor from '@/components/GraphicEditor'
import GraphicBrowser from '@/components/GraphicBrowser'
import DBTool from '@/components/DBTool'
import MediaConfig from '@/components/MediaConfig'
import DLConfig from '@/components/DLConfig'
// import TaskMaker from '@/components/TaskMaker'
// import ThreeDMonitor from '@/components/ThreeDMonitor'

Vue.use(VueRouter)

const routes = [
  {
    path: '/GraphicEditor',
    name: 'GraphicEditor',
    component: GraphicEditor,
    meta: {
      title: '小羊笨笨在苏梅-画个图'
    }
  },
  {
    path: '/GraphicBrowser',
    name: 'GraphicBrowser',
    component: GraphicBrowser,
    meta: {
      title: '小羊笨笨在苏梅-看个图'
    }
  },
  {
    path: '/DBTool',
    name: 'DBTool',
    component: DBTool,
    meta: {
      title: '小羊笨笨在苏梅-做个库'
    }
  },
  {
    path: '/MediaConfig',
    name: 'MediaConfig',
    component: MediaConfig,
    meta: {
      title: '小羊笨笨在苏梅-照个相'
    }
  },
  {
    path: '/DLConfig',
    name: 'DLConfig',
    component: DLConfig,
    meta: {
      title: '小羊笨笨在苏梅-画个框'
    }
  }
]

export default routes
