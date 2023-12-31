import { FiberNode } from './fiber'
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags'
import {
	appendInitialChild,
	createInstance,
	createTextInstance,
	Instance
} from 'hostConfig'
import { NoFlags } from './fiberFlags'

export const completeWork = (wip: FiberNode) => {
	// 递归中的归
	const newProps = wip.pendingProps
	const current = wip.alternate
	switch (wip.tag) {
		case HostComponent:
			// 当前的FiberNode存在且dom树上有挂载的情况，即update
			if (current !== null && wip.stateNode) {
			} else {
				// 构建DOM
				const instance = createInstance(wip.type, newProps)
				appendAllChildren(instance, wip)
				wip.stateNode = instance
			}
			bubbleProperties(wip)
			return null
		case HostText:
			if (current !== null && wip.stateNode) {
			} else {
				// 构建DOM
				const instance = createTextInstance(newProps.content)
				wip.stateNode = instance
			}
			bubbleProperties(wip)
			return null
		case HostRoot:
			/**
			 * 跳过
			 */
			bubbleProperties(wip)
			return null
		case FunctionComponent:
			bubbleProperties(wip)
			return null

		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip)
			}
			return null
	}
}

function appendAllChildren(parent: Instance, wip: FiberNode) {
	let node = wip.child
	while (node != null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode)
		} else if (node.child !== null) {
			node.child.return = node
			node = node.child
			continue
		}
		if (node === wip) {
			return
		}
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return
			}
			node = node?.return
		}
		node.sibling.return = node.return
		node = node.sibling
	}
}

function bubbleProperties(wip: FiberNode) {
	let subTreeFlags = NoFlags
	let child = wip.child
	while (child !== null) {
		subTreeFlags |= child.subTreeFlags
		subTreeFlags |= child.flags

		child.return = wip
		child = child.sibling
	}
	wip.subTreeFlags |= subTreeFlags
}
