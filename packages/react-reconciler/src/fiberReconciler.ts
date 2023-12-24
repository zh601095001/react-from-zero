import { Container } from 'hostConfig'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue'
import { ReactElementType } from 'shared/ReactTypes'
import { scheduleUpdateOnFiber } from './workLoop'

/**
 * 创建容器(FiberRootNode)以及根FiberRoot(HostFiberRoot),并建立双向链接
 * @param container 宿主环境的容器实例，浏览器中为某一div
 * @return root FiberRootNode
 */
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null)
	/**
	 * 内部建立了FiberRootNode <-->HostRootFiber双向链接，注意HostRootFiber挂载到了FiberRootNode的current属性上
	 * 之后在创建工作的HostRootFiber的时候(FiberRootNode.alternate)的时候，从current复制状态
	 * 在最后切换的时候，由于current有HostRootNode,在替换的时候就有一次Placement操作
	 * 目的是保证HostRootNode之下的树离屏渲染好后，最后只执行一次Placement操作
	 */
	const root = new FiberRootNode(container, hostRootFiber)
	hostRootFiber.updateQueue = createUpdateQueue()
	return root
}

/**
 * 首次使用jsx生成的ReactElement树(<App/>)创建Fiber树以及挂载节点
 * @param element 由babel编译成jsx函数调用并生成的ReactElement树
 * @param root FiberRootNode
 */
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current
	const update = createUpdate<ReactElementType | null>(element)
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	) // hostRootFiber.updateQueue.shared.pending此时就是 jsx生成的ReactElement树(<App/>)
	scheduleUpdateOnFiber(hostRootFiber)
	return element
}
