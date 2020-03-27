export const go = promise =>
    promise
        .then(data => {
            return [null, data]
        })
        .catch(err => [err])
