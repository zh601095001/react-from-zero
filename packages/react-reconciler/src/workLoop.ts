import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import { HostRoot } from './workTags'
import { MutationMask, NoFlags } from './fiberFlags'
import { commitMutationEffects } from './commitWork'

let workInProgress: FiberNode | null = null

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {})
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 调度功能
	const root = markUpdateFromFiberToRoot(fiber)
	renderRoot(root)
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber
	let parent = node.return
	/**
	 * 循环找parent，直到没有parent
	 * 注意hostRootFiber的没有parent字段，因此该循环就会停止
	 */
	while (parent !== null) {
		node = parent
		parent = node.return
	}
	// 发现时hostRootFiber，返回其父节点fiberRootNode
	if (node.tag === HostRoot) {
		return node.stateNode
	}
	return null
}

function renderRoot(root: FiberRootNode) {
	// 初始化，根据current新建HostFiberRoot,并且将新建的HostFiberRoot赋值给workInProgress，并在接下来，进行工作循环
	prepareFreshStack(root)
	do {
		try {
			workLoop()
			break
		} catch (e) {
			if (__DEV__) {
				console.warn(`workLoop Error: ${e}`)
			}
			workInProgress = null
		}
	} while (true)
	const finishedWork = root.current.alternate
	root.finishedWork = finishedWork
	// 执行具体的commit
	commitRoot(root)
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork
	if (finishedWork === null) {
		return
	}
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork)
	}
	// 重置
	root.finishedWork = null

	// 判断是否存在3个子阶段
	const subtreeHasEffect =
		(finishedWork.subTreeFlags & MutationMask) !== NoFlags
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork)
		root.current = finishedWork
		// layout
	} else {
		root.current = finishedWork
	}
}

function workLoop() {
	while (workInProgress !== null) {
		// 分为递和归两个阶段，直到完成一次整个Fiber树的递归操作
		performUnitOfWork(workInProgress)
	}
}

/**
 * @param fiber HostFiberRoot
 */
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber) // 如果有子节点，继续遍历子节点
	fiber.memorizedProps = fiber.pendingProps
	if (next === null) {
		completeUnitOfWork(fiber)
	} else {
		workInProgress = next
	}
}

/**
 * 往上逐层"归"，如果有兄弟节点，需要往下”递归“
 * @param fiber
 */
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber
	do {
		completeWork(node)
		// 查看有没有兄弟，有的话，从兄弟节点开始进行递和归
		const sibling = node.sibling
		if (sibling !== null) {
			workInProgress = sibling
			return
		}
		node = node.return
		workInProgress = node
	} while (node !== null)
}
