import { FiberNode, FiberRootNode } from './fiber'
import { MutationMask, NoFlags, Placement } from './fiberFlags'
import { HostComponent, HostRoot, HostText } from './workTags'
import { appendChildToContainer, Container } from 'hostConfig'

let nextEffect: FiberNode | null = null
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork
	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child
		// 有子副作用，继续向下递归
		if ((nextEffect.subTreeFlags & MutationMask) != NoFlags && child !== null) {
			nextEffect = child
		} else {
			if (__DEV__) {
				console.log(nextEffect)
			}
			while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect)
				const sibling: FiberNode | null = nextEffect.sibling
				if (sibling !== null) {
					nextEffect = sibling
					break
				}
				nextEffect = nextEffect.return
			}
			if (__DEV__) {
				console.log(nextEffect)
			}
		}
	}
}

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork)
		finishedWork.flags &= ~Placement
	}
	// flags Update
	// flags ChildDeletion
}

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行placement操作')
	}
	const hostParent = getHostParent(finishedWork)
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent)
	}
}

function getHostParent(fiber: FiberNode): Container | null {
	let parent = fiber.return
	while (parent) {
		const parentTag = parent.tag
		if (parentTag === HostComponent) {
			return parent.stateNode
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container
		}
		parent = parent.return
	}
	if (__DEV__) {
		console.warn('未找到hostParent')
	}
	return null
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode)
		return
	}
	const child = finishedWork.child
	if (child != null) {
		appendPlacementNodeIntoContainer(child, hostParent)
		let sibling = child.sibling
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent)
			sibling = sibling.sibling
		}
	}
}
