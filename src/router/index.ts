import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import KvmTest from '../views/KvmTest.vue'
import ModelFormat from '../views/ModelFormat.vue'
import FontSet from '../views/FontSet.vue'
import Circle from '../views/Circle.vue'
import Shanshuo from '../views/Shanshuo.vue'
import Text from '../views/Text.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'FontSet',
    component: FontSet
  },
  {
    path: '/circle',
    name: 'Circle',
    component: Circle
  },
  {
    path: '/text',
    name: 'Text',
    component: Text
  },
  {
    path: '/shanshuo',
    name: 'Shanshuo',
    component: Shanshuo
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/glb',
    name: 'Glb',
    component: () => import(/* webpackChunkName: "about" */ '../views/Glb.vue')
  },
  {
    path: '/first',
    name: 'First',
    component: () => import(/* webpackChunkName: "about" */ '../views/First.vue')
  },
  {
    path: '/model',
    name: 'Model',
    component: () => import(/* webpackChunkName: "about" */ '../views/Model.vue')
  },
  {
    path: '/kvmTest',
    name: 'KvmTest',
    component: KvmTest
  },
  {
    path: '/modelFormat',
    name: 'ModelFormat',
    component: ModelFormat
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
