export type WorkTags =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
export const FunctionComponent = 0 // 函数组件
export const HostRoot = 3 // HostRootFiber
export const HostComponent = 5 // 原生Element
export const HostText = 6 // 文本或数字
