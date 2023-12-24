import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes'
import { FunctionComponent, HostComponent, WorkTags } from './workTags'
import { Flags, NoFlags } from './fiberFlags'
import { Container } from 'hostConfig'

export class FiberNode {
	type: any
	tag: WorkTags
	pendingProps: Props
	key: Key
	stateNode: any
	ref: Ref

	return: FiberNode | null
	sibling: FiberNode | null
	child: FiberNode | null
	index: number
	updateQueue: unknown

	memorizedProps: Props | null
	memorizedState: any
	alternate: FiberNode | null
	flags: Flags
	subTreeFlags: Flags

	constructor(tag: WorkTags, pendingProps: Props, key: Key) {
		this.tag = tag //
		this.key = key
		this.stateNode = null // 对于HostComponent <div>来说，此处保存真实dom对应的div实例
		this.type = null // tag类型所对应的具体内容，比如函数组件，此处就为该函数

		// 构成树状结构
		this.return = null // 父fiberNode
		this.sibling = null
		this.child = null
		this.index = 0 // 在父节点中的索引

		this.ref = null

		// 作为工作单元
		this.pendingProps = pendingProps // 刚开始工作的时候的props
		this.memorizedProps = null
		this.updateQueue = null
		this.memorizedState = null
		/**
		 * 当此FiberNode为已经渲染的FiberNode树（current）时，此值指向WorkInProgress(正在进行修改的树)
		 * 反之，当此树为WorkInProgress时，指向Current
		 */
		this.alternate = null
		// 副作用
		this.flags = NoFlags
		this.subTreeFlags = NoFlags
	}
}

export class FiberRootNode {
	container: Container //对应宿主环境实例，对于浏览器，为HTMLElement
	current: FiberNode
	finishedWork: FiberNode | null // 更新完成后的HostRootFiber

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container
		// FiberRootNode <-->HostRootFiber双向链接
		this.current = hostRootFiber
		hostRootFiber.stateNode = this
		this.finishedWork = null
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode | null => {
	let wip = current.alternate
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key)
		wip.stateNode = current.stateNode
		wip.alternate = current
		current.alternate = wip
	} else {
		// update
		wip.pendingProps = pendingProps
		wip.flags = NoFlags
		wip.subTreeFlags = NoFlags
	}
	wip.type = current.type
	wip.updateQueue = current.updateQueue
	wip.child = current.child
	wip.memorizedProps = current.memorizedProps
	wip.memorizedState = current.memorizedState
	return wip
}

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element
	let fiberTag: WorkTags = FunctionComponent
	if (typeof type === 'string') {
		// "div"
		fiberTag = HostComponent
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element)
	}
	const fiber = new FiberNode(fiberTag, props, key)
	fiber.type = type
	return fiber
}
