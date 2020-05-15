### 路由

#### 不刷新页面，修改url

```js
http://localhost:8081

修改location.hash
location.hash='aa'
http://localhost:8081/aa

修改history, history.pushState({},'','home')
http://localhost:8081/home
history.back()  //go(-1)
history.forward() // go(1)
history.go(2)
history.go(-2)
```

#### 基本步骤

```js
import VueRouter from 'vue-router'
import Vue from 'vue'

// 安装路由
Vue.use(VueRouter)

const routes=[]

const router=new VueRouter({
    routes
})
export default router

// main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

```

#### router-link

router-link在安装的时候Vue.use， 就注册到全局了

router-view也是注册到全局

```js
const routes=[
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home,
    }
]

<template>
      ...
	<router-link to='/home'></router-link>
	<router-view></router-view>
</template>
```

tag表示渲染成什么标签，默认是a标签

```js
<router-link to='/home' tag='button'></router-link>
```

active-class

点了那个link, 那个link的对应a标签会添加一个class, 默认router-link-active

可以修改

单个修改

```js
<router-link to='/home' tag='button' active-class='active'></router-link>
```

统一修改

```js
const router=new VueRouter({
    routes,
    mode: 'history',
    linkActiveClass: 'active'
})
```

跳转携带参数，需要v-bind, 注意外面""相当于{}

```js
<router-link :to="'/home'+userId"></router-link>
data:{
    userId: 121,
}
```

加不加/

加/是绝对路径，不加是相对路径，相对当前浏览器url栏的路径

#### history不是hash

```js
const router=new VueRouter({
    routes,
    mode: 'history'
})
```

默认能返回， replace功能，link打开，之后点击多次，不能点击返回

```js
<router-link to='/home' replace></router-link>
```

#### 控制跳转

this.$router.push

this.$router.replace

$router就是const router=new VueRouter  的router对象

所有组件都有

```js
methods:{
	homeClick(){
		this.$router.push('/home')
	}
}
```

#### 动态路由

```js
const routes=[
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home,
    },
    {
        path: '/user/:userId',
        component: User,
    },
]
```

this.$route, 所有组件都有

$route 表示当前激活的routes数组中的某个条目对象，

this.$route.params包含路径上所有参数，对应key就是routes定义的名称，value就是值

一般在computed时获取匹配的路径参数

```js
computed:{
    userId(){
        return this.$route.params.userId
    }
}
```

这些所有组件都有的数据，可以直接在{{$route.params.userId}}

可以直接在插值语法中使用

#### 拆包

路由懒加载

```js
const Home=()=>import('../components/Home')
const routes=[
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home,
    }
]
```

#### 嵌套路由

path使用相对路径，不要加/

```js
const routes=[
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home,
        children: [
            {
                path: '',
                component: HomeNews,
            },
            {
                path: 'news',
                component: HomeNews,
            }
        ]
    }
]
```

在Home组件里面加一个

```js
<router-view></router-view>
```

此时子路由里设置默认路径，只能写空字符串，不能写'/'

#### 跳转传参

link传参

```js
<router-link :to="{path: '/user', query: {name: 'zhangsan',age: 18}}" replace></router-link>
```

跳转时候，会在url+?name=zhangsan&age=18

代码传参

```js
this.$router.push({
	path: '/user',
	query: {
		name: 'zhangsan',
		age: 18
	}
})
```

取的时候

{{$route.query.name}}

{{$route.query.age}}

this.$route.query

#### 路由定义时meta

```js
const routes=[
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home,
        meta:{
        	title: '用户'
        }，
        children: [
            {
                path: '',
                component: HomeNews,
            },
            {
                path: 'news',
                component: HomeNews,
            }
        ]
    }
]
```

```js
const router=new VueRouter({
    routes,
})
// 从from跳到to, to的matched数组包含匹配的1级，二级,...路由，第0个是一级路由，取出定义时的meta数据，进行操作
router.beforeEach((to, from, next)=>{

	document.title=to.matched[0].meta.title
    next()  // 必须调不然路由系统停止了
})
```

beforeEach,跳转前执行的回调

afterEach,跳转后执行的回调，

组件独享，前置回调

```js
const routes=[
....
    {
        path: '/home',
        component: Home,
        meta:{
        	title: '用户'
        },
        beforeEnter: (to, from, next)=>{
        	// do something
          next()
        }
       ....
    }
]
```

#### keep-alive

组件跳转，前一个组件会销毁掉的

keep-alive可以让路由跳转，前一个组件不销毁，数据都不丢

但是子路由会丢

```js
<keep-alive>
	<router-view/>
</keep-alive>
```

##### 保留子路由

此时组件会触发的生命周期函数

activated, deactivated

```js
activated(){
	this.$router.push(this.path)
}
```



会触发的路由钩子函数

路由钩子函数可以定义在router创建时候，routes数组里面，组件methods里面

```js
// 组件methods里
// 记录跳转前的path
beforeRouteLeave(to, from, next){
    console.log(from, to)  // to里面也有
	this.path=this.$route.path
}
```

##### exclude

exclude='Profile,User' 里面的逗号后面不能加空格，因为切分就是用逗号

Profile,User 都是组件的name,export default{name:'Profile'}

```js
<keep-alive exclude='Profile,User'>
	<router-view/>
</keep-alive>
```

