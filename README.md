## 讯盟小程序集合开发模版

### Start

安装依赖

```
npm install # 或 yarn install
```

启动服务

```
npm run serve
```

浏览器输入

```
# 端口按照本地的来
http://localhost:8080/demo.html
```

⚠️ 预览，预览需要通过手机 app 扫码，执行下面命令生成二维码

```
# 端口按照本地的来
xmmp qrcode 8080/demo.html
```

### Usage

创建小程序项目

```
# dir 是小程序工程的名称，一般为一个单词，可以为多个单词，用短杆连接。例如：hello-world
npm run create <dir>
```

打包小程序项目

```
npm run build <dir>
```

打包全部

```
npm run build:all
```

### 内置依赖

#### 包

全局引用了 `vue.js`、`echarts`、`xmbase`、`xmcard`，以及 `vconsole`

从 package.json 中可以看到

```
dayjs 格式化时间
tcon 原子型 css 库，文档地址：https://tcon.netlify.app/
vant 需要自己按需引入
```

#### 方法

内置了 API 的调用方法：`/assets/api.js`，调用方式，直接在小程序中使用：

```js
this.$http.post(
 url,
 {
   body: data,
   headers: {
     'Content-Type': 'application/json'
   }
 }
)
```

但是这种方式不够聚合和结偶，更推荐的方式：`assets/api-demo.js`

```js
// 示例接口
export function getSomeList () {
  return post('/path/to/name', {})
}
```

将业务类型聚合到一起，再导出，在需要的地方统一 `import` 导入，更清晰。

### 适配

对于移动端的适配内置了 `$vw` 和 `$vwSize` 方法，譬如左右布局宽度适配：

```html
<template>
  <div :style="{ width: $vw(200) }"></div>
  <div :style="{ width: $vw(175) }"></div>
</template>
```

### 关于图片、字体库等静态资源

请放到 `public/asserts-<dir>` 目录下，这样会被单独打包的各自的小程序中，不会造成冗余。

使用规则不变，依旧是 `vue-cli` 的规则，如有疑问可查询官网文档：静态资源。
