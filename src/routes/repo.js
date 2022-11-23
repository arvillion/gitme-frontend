import { createRepository, getAllBranches, getCloneUrl, getContent, getRepoIdByUserNameAndRepoName, getRepoInfo, starRepo, undoStarRepo } from "../utils/api"

export default async function repoInfoLoader({ params }) {
	const { userName, repoName } = params
	const token = localStorage.getItem('token')
	const { data: repoId } = await getRepoIdByUserNameAndRepoName({ token, userName, repoName })
	const [{ data: branches }, {data: repoInfo }, cloneUrl] = await Promise.all([
		getAllBranches({ token, repoId }),
		getRepoInfo({ token, repoId }),
		getCloneUrl({ repoName, userName, token })
	])
	const defaultBranch = branches?.find(b => b.default)
	return { repoId, repoInfo, branches, defaultBranch, cloneUrl }
}

export async function repoAction({ params, request }) {
	const formData = await request.formData()
	const method = request.method
	const token = localStorage.getItem('token')

	if (method === 'POST') {
		const repoName = formData.get('repName')
		const desc = formData.get('repDesc')
		const state = formData.get('repType') === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'
		try {
			await createRepository({ repoName, desc, state, token })
			return { err: '' }
		} catch (err) {
			return { err: err.message }
		}
	} else {
		return { err: 'Method not supported' }
	}
}


export async function starAction({ params, request }) {
	const token = localStorage.getItem('token')

	const formData = await request.formData()
	const isStarred = formData.get('isStarred')
	const repoId = formData.get('repoId')

	const valid = repoId && isStarred
	if (!valid) {
		throw new Error('Missing parameters')
	}

	if (isStarred === "1") {
		// undo star
		return undoStarRepo({ token, repoId })
	} else {
		return starRepo({ token, repoId })
	}
}