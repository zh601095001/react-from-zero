import { FiberNode } from './fiber'
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags'
import { processUpdateQueue, UpdateQueue } from './updateQueue'
import { ReactElementType } from 'shared/ReactTypes'
import { mountChildFibers, reconcileChildFibers } from './childFibers'
import { renderWithHooks } from './fiberHooks'

export const beginWork = (wip: FiberNode) => {
	// 比较并返回子FiberNode
	switch (wip.tag) {
		case HostRoot:
			// 对HostRootFiber执行更新
			return updateHostRoot(wip)
		case HostComponent:
			return updateHostComponent(wip)
		case HostText:
			return null
		case FunctionComponent:
			return updateFunctionComponent(wip)
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型')
			}
			return null
	}
}

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip)
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memorizedState
	const updateQueue = wip.updateQueue as UpdateQueue<Element>
	const pending = updateQueue.shared.pending // <App/>
	updateQueue.shared.pending = null
	const { memorizedState } = processUpdateQueue(baseState, pending)
	wip.memorizedState = memorizedState
	const nextChildren = wip.memorizedState // 就是render方法传进去的ReactElement,例如<App/>
	reconcileChildren(wip, nextChildren) // HostRootFiber, <App/>
	return wip.child
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps
	const nextChildren = nextProps.children
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate
	if (current !== null) {
		// update
		// 相对于mount来说，不同点就是wip对应的FiberNode存在，此时如果wip.child.alternate没有孩子，则需要标记Placement Tags
		// 在首次mount时，
		wip.child = reconcileChildFibers(wip, current?.child, children)
	} else {
		// mount阶段
		// 内部建立了childFiber.return = wip,此处建立父指向子的child字段
		wip.child = mountChildFibers(wip, null, children)
	}
}
