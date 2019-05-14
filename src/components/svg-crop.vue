<template>
  <div>
    <header><h1>svg-label</h1></header>
    <div id="container">
      <div id="operation">
         <!-- <Button :type="pathBtnType" shape="circle" icon="ios-git-compare" @click="startPath"></Button><br><br> -->
         <Button :type="rectBtnType" shape="circle" icon="ios-crop-outline" @click="rectBtn"></Button>
      </div>
      <div id="imgContainer" @mousedown="rectStart" @mouseup="rectEnd" @mousemove="rectMove">
        <img src="./../assets/huya.jpg" alt="" id="img" ref="img" draggable="false">
        <!-- <div id="svgContainer" ref="svgContainer">
          <svg v-for="(item, index) in pathItems" :key="index" v-if="item.path">
            <path :d="item.path"></path>
            <circle :cx="item.circle.cx" :cy="item.circle.cy" r="4" fill="green"/>
          </svg>
        </div> -->
        <div id="rectContainer" draggable="false">
          <svg>
            <svg v-for="(item, index) in rectItems" :key="index" class="svg">
              <rect :x="item.x" :y="item.y" :width="item.width" :height="item.height"></rect>
              <rect :x="getX('left-up', item.x)" :y="getY('left-up', item.y)" width="7" height="7" style='fill:rgb(32, 231, 32)' class="left-up"></rect>
              <rect :x="getX('left-down', item.x)" :y="getY('left-down', item.y, item.height)" width="7" height="7" style='fill:rgb(32, 231, 32)' class="left-down"></rect>
              <rect :x="getX('right-up', item.x, item.width)" :y="getY('right-up', item.y, item.height)" width="7" height="7" style='fill:rgb(32, 231, 32)' class="right-up"></rect>
              <rect :x="getX('right-down', item.x, item.width)" :y="getY('right-down', item.y, item.height)" width="7" height="7" style='fill:rgb(32, 231, 32)' class="right-down"></rect>
            </svg>
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
      imgContainerT: 66, // 图片容器距离浏览器上边的位置
      rectDragSX: 0, // 矩形框拖拽的起始x
      rectDragSY: 0, // 矩形框拖拽的起始y
      isRectDrag: false, // 是否为矩形拖拽，用来判断矩形拖拽的移动
      dragTarget: {}, // 保存拖拽中的元素
      dragRectItem: {} // 正在操作的rect对象
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
      this.isMouseDown = true
      // 鼠标在选框按下去的时候，在全局添加鼠标移动事件，因为裁剪进行中的时候，鼠标有可能移出选框外
      window.addEventListener('mousemove', this.rectMove)
      // 添加全局的鼠标弹起事件，因为框架结束的时刻，鼠标可能在款选图片外
      window.addEventListener('mouseup', this.rectEnd)
      // 判断是否点击了裁剪按钮
      if (this.rectBtnType === 'default') {
        // 如果是已有的矩形框，做拖拽处理
        if (e.target.nodeName === 'rect') {
          this.rectDragS(e)
        }
        return false
      }
      // 添加一个rect, 这里的位置要根据情况计算, x,y为rect的顶点，startX, startY为rect开始的点，因为计算时x,y可能会改变
      let rect = {x: e.x - this.imgContainerL, y: e.y - this.imgContainerT, startX: e.x, startY: e.y}
      this.rectItems.push(rect)
    },
    rectEnd: function (e) {
      // 裁剪后，取消那两个全局事件，避免性能消耗
      window.removeEventListener('mousemove', this.rectMove)
      window.removeEventListener('mouseup', this.rectEnd)
      this.isMouseDown = false
      if (this.rectBtnType === 'default') {
      // 如果是已有的矩形框，做拖拽处理
        if (e.target.nodeName === 'rect') {
          this.rectDragE(e)
        }
        return false
      }
      console.log('我弹起啦')
      this.rectBtnType = 'default'
    },
    rectMove: function (e) {
      // 必须是鼠标按下去才可以执行这个函数
      if (!this.isMouseDown) {
        return
      } else if (this.isRectDrag && this.rectBtnType === 'default') {
        this.rectDraging(e)
        return
      } else if (this.rectBtnType === 'default') {
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
    },
    rectClick: function () {
      console.log('我点击啦')
    },
    rectDragS: function (e) {
      this.isRectDrag = true
      this.dragTarget = e.target
      console.log('我开始拖拽啦')
      this.rectDragSX = e.x
      this.rectDragSY = e.y
    },
    rectDragE: function (e) {
      this.isRectDrag = false
      console.log('我结束拖拽啦')
      console.log(this.rectItems)
    },
    rectDraging: function (e) {
      let dragTarget = this.dragTarget
      // 得到原本的顶点位置
      let oldX = Number(dragTarget.getAttribute('x'))
      let oldY = Number(dragTarget.getAttribute('y'))
      let oldWidth = Number(dragTarget.getAttribute('width'))
      let oldHeight = Number(dragTarget.getAttribute('height'))
      // 构造新的x,y
      let x = oldX + e.x - this.rectDragSX
      let y = oldY + e.y - this.rectDragSY
      // 获取图片容器的宽高
      let imgWidth = this.$refs.img.clientWidth
      let imgHeight = this.$refs.img.clientHeight
      // 做溢出判断，这里是考虑顶点
      if (x < 0) {
        x = oldX
      }
      if (y < 0) {
        y = oldY
      }
      // 做溢出处理，这里是考虑边框
      if (x + oldWidth > imgWidth) {
        x = oldX
      }
      if (y + oldHeight > imgHeight) {
        y = oldY
      }
      // 重置拖拽开始的位置
      this.rectDragSX = e.x
      this.rectDragSY = e.y
      dragTarget.setAttribute('x', x)
      dragTarget.setAttribute('y', y)
    },
    // 裁剪框四角的div x
    getX: function (type, x, width) {
      switch (type) {
        case 'left-up': {
          return x - 2
        }
        case 'left-down': {
          return x - 2
        }
        case 'right-up': {
          if (width) {
            return x + width - 2
          } else {
            return x
          }
        }
        case 'right-down': {
          if (width) {
            return x + width - 2
          } else {
            return x
          }
        }
      }
    },
    // 裁剪框四角的div y
    getY: function (type, y, height) {
      switch (type) {
        case 'left-up': {
          return y - 2
        }
        case 'left-down': {
          if (height) {
            return y + height - 2
          } else {
            return y
          }
        }
        case 'right-up': {
          return y - 2
        }
        case 'right-down': {
          if (height) {
            return y + height - 2
          } else {
            return y
          }
        }
      }
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
rect {
  stroke: rgb(32, 231, 32);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: rgba(255, 255, 255, 0);
  cursor: move;
}
.svg {
  position: absolute;
}
.left-up {
  left: -4px;
  top: -4px;
}
</style>
