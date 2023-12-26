import path from 'path'
import fs from 'fs'

import ts from 'rollup-plugin-typescript2'
import cjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

const pkgPath = path.resolve(__dirname, '../../packages')
const distPath = path.resolve(__dirname, '../../dist/node_modules')

export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`
	}
	return `${pkgPath}/${pkgName}`
}

export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`
	const s = fs.readFileSync(path, { encoding: 'utf-8' })
	return JSON.parse(s)
}

export function getBaseRollupPlugins({
	typescript = {},
	alias = { __DEV__: true, preventAssignment: true }
} = {}) {
	return [replace(alias), cjs(), ts(typescript)]
}
