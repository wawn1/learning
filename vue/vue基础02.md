### 组件化

1.创建组件

```js
const comp=Vue.extend({
	template:`
	<div><h2>xxx</h2></div>
`
})
// 语法糖，直接写对象
const comp={
	template:`
	<div><h2>xxx</h2></div>
`
}
// 抽离template
<template id='t-comp'>
    <div><h2>xxx</h2></div>
</template>
const comp={
	template: '#t-comp'
}
```

2.注册组件

```js
Vue.component('my-comp', comp)
```

3.使用

```js
<my-comp></my-comp>
```

#### 全局注册和单个Vue实例内注册

```js
// 全局注册， 所有Vue实例管理的div下面都可以使用这个组件
Vue.component('my-comp', comp)
// Vue内部注册  只能在id是app下用
const app=new Vue({
    el: '#app',
    components:{
        my-comp: comp,
    }
})
```

#### 组件内部注册子组件

子组件只能在子组件内部使用

```js
const comp=Vue.extend({
	template:`
	<div><h2>xxx</h2></div>
`,
    components:{
        my-comp: comp2,
    }
})
```

#### 组件数据

data必须是一个函数，每个组件都调用函数，创建一个自己的data

```js
<template id='t-comp'>
    <div><h2>{{title}}</h2></div>
</template>
const comp={
	template: '#t-comp',
    data(){
        return {
            title: 'abs'
        }
    }
}
```

#### 父子组件通信


##### 父组件传数据给子组件

在vue里“”  双引号当作react里的{}， 内部字符串用‘’， 单引号

props类似react写法, 需要: 开头,v-bind

必须要v-bind, 不然就不会把"",内部解析成变量，直接就是字符串了

注意: 写需要解析的用双引号，写字符串用单引号



```js
<comp :movies="movies"></comp>

// 用字符串数组标识props的变量名称
const comp={
   ...
    props:['movies']
    ...
}
// 使用对象可以规范类型，设置默认值(推荐)，required，是否必须
// 但是数组或对象，其他default必须使用函数，其他default: 'aa',直接写
// 可以自定义类型
function Person(name, age){
    this.name=name
    this.age=age
}
const comp={
   ...
    props:{
    	movies: {
            type: Array,
            default(){
                return []
            },
            required: true,
        },
        peop: {
            type: Person,
        }
    }
    ...
}
```

props的变量名可以是驼峰写法，在v-bind里面必须是-链接

```js
<comp :good-movies="movies"></comp>
const comp={
   ...
    props:{
    	goodMovies: {
            type: Array,
            default(){
                return []
            },
            required: true,
        }
    }
    ...
}
```

##### 子组件向父组件传递数据

子组件发射一个事件，父组件v-on监听一个事件，

注意：事件名和v-on的事件名都不能写驼峰

传参不要显示传入，直接通过v-on会默认传入事件的参数，就行@click等原生事件，默认传入的第一个参数是$event，调换位置需要手动调

```js
<comp @item-click='parentCallback'></comp>
<template>
    ....
	@click='childClick'
</template>
methods:{
    childClick:{
        this.$emit('item-click', item)
    }
}
```

#### watch

watch和data, methods平级

监听一个属性的改变，执行函数

```js
watch:{
	precent(newValue, oldValue){
		this.barwith=newValue*10
	}
}
```

#### 父子组件访问

##### 父访问子

this.$children可以拿到children数组，每一个都是组件实例，data,methods都打散放在实例里的，拿到实例就拿到了所有属性和方法

```js
methods:{
	btnClick(){
        console.log(this.$children)
        for(let c of this.$children){
            console.log(c.name)  //访问属性
            c.showMessage()  //访问方法
        }
    }
}
```

但是数组嵌套太深，不太清楚是第几个，还会增删，下标就变了，原来的代码就错了

```js
<children1 ref='aaa'></children1>

this.$refs.aaa就是某个子组件对象，就可以访问属性和方法了
```

##### 子访问父

this.$parent就是父组件实例，但是不推荐使用

#### slot

相当于react里的props.children

slot还能有默认值, 默认button

```js
<slot><button>按钮</button></slot>
```

slot还能有多个，可以起名字

使用的时候添加slot属性，值是名称

```js
<comp><span>标题</span></comp>
<comp><span slot='center'>new 中间</span></comp>
<comp><span slot='left'>new 左边</span></comp>
<comp><span slot='right'>new 右边</span></comp>

<template>
    ...
	<slot name='left'><span>左边</span></slot>
	<slot name='center'><span>中间</span></slot>
	<slot name='right'><span>右边</span></slot>
</template>
```

slot定义时可以携带数据，外部传入组件时候，如果要传入的插槽有数据，可以获得对应插槽里的数据

slot='left',找到name='left'的slot, 不写找到没有name的slot

slot-scope='leftSlot'  leftSlot就是对应slot的实例对象了

:left-data将left-data属性和books变量绑定了

访问leftSlot对象的left-data属性就是books对象

```js
<comp>
    <template slot='left' slot-scope='leftSlot'>
        <span>{{leftSlot.left-data.join('-')}}</span>
    </template>
</comp>

<template>
    ...
	<slot name='left' :left-data='books'><span>左边</span></slot>
	
</template>

```



