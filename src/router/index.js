import Vue from 'vue'
import Router from 'vue-router'
import svgCrop from '@/components/svg-crop'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '',
      component: svgCrop
    }
  ]
})
