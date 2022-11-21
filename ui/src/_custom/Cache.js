import ApiClient from "@/utils/ApiClient";

const Cache = {
    collections: {},
    /**
     * Get collection just like ApiClient.collections.getOne() but with memoized cache that handle the autocancellation
     * @param id
     * @param attempt
     * @return {Promise<unknown>}
     */
    async getCollection(id, attempt = 1) {
        const retry = (id, attempt) => new Promise((resolve, reject) => {
            if (attempt > 10) {
                reject('Too many attempt last: '. e);
            }
            else {
                setTimeout(() => {
                    Cache.getCollection(id, attempt+1)
                        .then(resolve)
                        .catch(reject);
                }, 100)
            }
        })

        if (!this.collections[id]) {
            try {
                const coll = await ApiClient.collections.getOne(id, {'$cancelKey': 'collectionNames-'+id});
                this.collections[id] = coll;
            }
            catch (e) {
                return retry(id, attempt)
                // return await CollectionName.getCollection(id);
            }
        }
        if (this.collections[id]) {
            return this.collections[id];
        }
        return retry(id, attempt)
    }
}

export default Cache;
