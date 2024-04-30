## 安装
1. 下载HBuilder编辑器
2. 打开HBuilder点击文件》导入》从本地目录导入
3. 打开终端输入yarn安装依赖
4. 选择项目后，点击运行》运行到内置浏览器


## 从 @dcloudio/uni-app 包内导入 uni-app 其他生命周期API
    import { onLoad, onShow } from '@dcloudio/uni-app'
    
    onLoad((option) => {
      console.log(option)
    })
    
## 问题备注
1. 不能在vue的template上使用v-if，发行后不生效；