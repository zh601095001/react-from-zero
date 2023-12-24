import { createFiberFromElement, FiberNode } from './fiber'
import { ReactElementType } from 'shared/ReactTypes'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { HostText } from './workTags'
import { Placement } from './fiberFlags'

function reconcileSingleElement(
	returnFiber: FiberNode,
	currentFiber: FiberNode | null,
	element: ReactElementType
) {
	// 根据ReactElement创建Fiber并返回
	const fiber = createFiberFromElement(element)
	fiber.return = returnFiber
	return fiber
}

function reconcileSingleTextNode(
	returnFiber: FiberNode,
	currentFiber: FiberNode | null,
	content: string | number
) {
	const fiber = new FiberNode(HostText, { content }, null)
	fiber.return = returnFiber
	return fiber
}

function ChildReconciler(shouldTrackEffects: boolean) {
	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement
		}
		return fiber
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType | string | number
	) {
		// 判断当前fiber的类型
		if (typeof newChild === 'object' && newChild != null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						// 根据ReactElement创建FiberNode,并与父FiberNode通过return链接，同时返回该FiberNode
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					)
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild)
					}
					break
			}
		}
		// TODO 多节点情况 <ul><li></li></ul>

		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			)
		}

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild)
		}
		return null
	}
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
