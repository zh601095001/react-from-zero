const fakeFetch = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(10)
		})
	})
}

function f() {
	throw fakeFetch()
}

function f2() {
	try {
		f()
	} catch (e) {
		console.log(e)
	}
}

f2()
