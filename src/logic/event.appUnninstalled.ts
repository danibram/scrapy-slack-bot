import { getAccess, updateAccess } from '../utils'

export default async ({ db, teamId }) => {
    let access = await getAccess(db, teamId)

    await updateAccess(db, teamId, {
        ...access,
        deleted: true
    })
}
