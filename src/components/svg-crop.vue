<template>
  <div>
    <header><h1>svg-label</h1></header>
    <div id="container">
      <div id="operation">
         <!-- <Button :type="pathBtnType" shape="circle" icon="ios-git-compare" @click="startPath"></Button><br><br> -->
         <Button :type="rectBtnType" shape="circle" icon="ios-crop-outline" @click="rectBtn"></Button>
      </div>
      <div id="imgContainer" @mousedown="rectStart" @mouseup="rectEnd" @mousemove="rectMove">
        <img src="./../assets/huya.jpg" alt="" id="img" draggable="false" ref="img">
        <!-- <div id="svgContainer" ref="svgContainer">
          <svg v-for="(item, index) in pathItems" :key="index" v-if="item.path">
            <path :d="item.path"></path>
            <circle :cx="item.circle.cx" :cy="item.circle.cy" r="4" fill="green"/>
          </svg>
        </div> -->
        <div id="rectContainer">
          <svg>
            <rect  v-for="(item, index) in rectItems" :key="index" :x="item.x" :y="item.y" :width="item.width" :height="item.height"></rect>
          </svg>
        </div>
      </div>
      <div id="dataContainer">
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'svgCrop',
  data () {
    return {
      pathBtnType: 'default', // 按钮样式
      rectBtnType: 'default', // 矩形裁剪按钮样式
      pathItems: [{path: 'M10 10 H 90 V 90 H 10 L 10 10', circle: {cx: '10', cy: '10'}}], // 标注的路径数组
      rectItems: [], // 框选矩形的数组
      isMouseDown: false, // 鼠标是否按下
      imgContainerL: 72, // 图片容器距离浏览器左边的位置
      imgContainerT: 66 // 图片容器距离浏览器上边的位置
    }
  },
  mounted () {

  },
  methods: {
    // startPath: function () {
    //   this.pathBtnType = (this.pathBtnType === 'default') ? 'primary' : 'default'
    //   // 在没有新建一个空对象path的情况下，新建一个新的path
    //   console.log(!(JSON.stringify(this.pathItems[this.pathItems.length - 1]) === '{}'))
    //   if (!(JSON.stringify(this.pathItems[this.pathItems.length - 1]) === '{}')) {
    //     // 新建一个path
    //     this.pathItems.push({})
    //   }
    //   console.log(this.pathItems)
    // },
    // paintPath: function () {
    //   if (this.pathBtnType === 'primary') {
    //     console.log(this.pathItems)
    //   }
    // }
    rectBtn: function () {
      this.rectBtnType = (this.rectBtnType === 'default') ? 'primary' : 'default'
    },
    rectStart: function (e) {
      if (this.rectBtnType === 'default') {
        return false
      }
      this.isMouseDown = true
      // 鼠标在选框按下去的时候，在全局添加鼠标移动事件，因为裁剪进行中的时候，鼠标有可能移出选框外
      window.addEventListener('mousemove', this.rectMove)
      // 添加全局的鼠标弹起事件，因为框架结束的时刻，鼠标可能在款选图片外
      window.addEventListener('mouseup', this.rectEnd)
      // 添加一个rect, 这里的位置要根据情况计算, x,y为rect的顶点，startX, startY为rect开始的点，因为计算时x,y可能会改变
      let rect = {x: e.x - this.imgContainerL, y: e.y - this.imgContainerT, startX: e.x, startY: e.y}
      this.rectItems.push(rect)
      console.log(this.rectItems)
    },
    rectEnd: function (e) {
      if (this.rectBtnType === 'default') {
        return false
      }
      this.isMouseDown = false
      console.log('我弹起啦')
      this.rectBtnType = 'default'
      // 裁剪后，取消那两个全局事件，避免性能消耗
      window.removeEventListener('mousemove', this.rectMove)
      window.removeEventListener('mouseup', this.rectEnd)
    },
    rectMove: function (e) {
      // 必须是鼠标按下去才可以执行这个函数
      if (!this.isMouseDown) {
        return
      }
      // 获取图片容器的宽高
      let imgWidth = this.$refs.img.clientWidth
      let imgHeight = this.$refs.img.clientHeight
      // 根据距离给矩形裁剪框设宽高，这里的位置要根据情况计算
      let startRect = this.rectItems[this.rectItems.length - 1]
      let x = startRect.x
      let y = startRect.y
      let width = e.x - startRect.startX
      let height = e.y - startRect.startY
      // svg 反转拉伸时，更换顶点和其他的位置
      if (width < 0) {
        width = startRect.startX - e.x
        x = e.x - this.imgContainerL
      }
      if (height < 0) {
        height = startRect.startY - e.y
        y = e.y - this.imgContainerT
      }
      // 若超出裁剪框，做截断处理，这里是顶点超出的处理
      if (e.x < this.imgContainerL) {
        width = startRect.width
        x = 0
      }
      if (e.y < this.imgContainerT) {
        height = startRect.height
        y = 0
      }
      // 若超出裁剪框，做截断处理，这里是边框超出的处理
      if (x + width > imgWidth) {
        width = startRect.width
      }
      if (y + height > imgHeight) {
        height = startRect.height
      }
      let rectItem = {...startRect, x: x, y: y, width: width, height: height}
      Vue.set(this.rectItems, this.rectItems.length - 1, rectItem)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#container {
  display: flex;
}
#imgContainer {
  width: 40%;
  border: 1px dashed rgb(230, 62, 11);
  position: relative;
}
#dataContainer {
  flex: 1;
  /* border: 1px dashed black */
}
#img {
  width: 100%;
  /* 使图片不可选 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
#operation {
  /* border: 1px dashed pink; */
  margin: 20px;
}
#svgContainer {
  position: absolute;
  top: 0;
  left: 0;
}
#rectContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
svg {
  stroke: rgb(32, 231, 32);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  width: 100%;
  height: 100%;
}
</style>
