
## 构建逻辑
![Image text](https://raw.githubusercontent.com/milobluebell/imgs-repo/master/WechatIMG4520.png)


## 开发文档

### 主要结构：
```
-- extension-src/    // 开发src
-- dist/             // 打包构建目录
-- gulpfile.js       // gulp任务脚本
```

### 工作流：
1、安装gulp等所需开发环境依赖。
```
npm install
```
2、在extension-src进行业务代码开发。

3、开发完成后，修改对应版本号。分别是:
```
-- package.json      // 中的version字段，作为「项目版本号」
-- extension-src
    -- manifest.json // 和version字段，作为「产品迭代版本号」
```

4、打包执行
```
gulp build
```
在build之后，不仅会将打包后的crx放在dist中。**还会因为给manifest.json写入update_url配置项，而产生修改manifest.json的副作用。需要在构建完成后revert这个文件**

5、git提交和打tag
```
git push
```
```
git tag -a vX.X.X -m "xxxx"
```
github action会监听tag推送事件(以v开头的tag)来执行对应的action，生成并release对应的zip
