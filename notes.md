# Git

conventional规范集意义：

```
<type>:<subject>
```
常用type值：
- feat: 添加新功能
- fix: 修复bug
- chore: 一些不影响功能的更改
- docs: 文档修改
- perf: 性能优化
- refactor: 代码重构
- test: 测试用例



# `ReactDOM.createRoot(rootElement).render(<App/>)`过程：

Render阶段总体流程（DFS）:![image-20231224114947261](https://typro-zh.oss-cn-shanghai.aliyuncs.com/image-20231224114947261.png)

![image-20231216155723242](https://typro-zh.oss-cn-shanghai.aliyuncs.com/image-20231216155723242.png)

## BeginWork

1.递过程，一直往下遍历，创建子FiberNode并与父FiberNode进行双向链接

2.具体流程如下

![image-20231224110644747](https://typro-zh.oss-cn-shanghai.aliyuncs.com/image-20231224110644747.png)

上图表示首次挂载时，挂载App组件的过程，由于HostFiberNode有对应的alternate，所以对于HostFiberNode来说，是更新过程，因此执行了**reconcileChildFibers**，而该函数会在当前新建的FiberNode没有对应alternate时，给当前新建的FiberNode打上Placement标记

![image-20231224111804097](https://typro-zh.oss-cn-shanghai.aliyuncs.com/image-20231224111804097.png)

上图表示，在挂载App的孩子时，挂载的过程中，发现App没有在current中有对应，因此我们执行**mountChildFibers**而不是**reconcileChildFibers**，也就是说，我们不用去给图中的div打上Placement的flags

上面的情况的原因：我们不希望mount的时候，所有新节点的构建都需要执行插入操作，而是构建一颗离屏的dom树，最后在App处统一插入真实的dom树

注：真实dom的构建过程在**completeWork**中，**beginWork**中构建的是整颗Fiber树，mount时的Fiber树只有App是有flags的，因此对应修改真实dom也只在此处生效。

