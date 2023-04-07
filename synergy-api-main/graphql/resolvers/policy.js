const Policy = require("../../models/policy");

module.exports = {
    // All resolvers function will be placed here.
    policy: async () => {
        try {
            const result = await Policy.findOne().sort({ createdAt: -1 }).limit(1);
            return {
                ...result._doc,
                id: result.id,
            };
        } catch (err) {
            throw err;
        }
    },
    createPolicy: async ({ appPolicy }) => {
        try {
            const doc = new Policy({
                appPolicy: appPolicy,
            });
            const result = await doc.save();
            return {
                ...result._doc,
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString(),
            };
        } catch (err) {
            throw err;
        }
    },
    updatePolicy: async ({ appPolicy }) => {
        try {
            const doc = await Policy.findOne().sort({ createdAt: -1 }).limit(1);
            doc.appPolicy = appPolicy;
            const result =  await doc.save();
            return {
                ...result._doc,
                updatedAt: new Date(result._doc.updatedAt).toISOString(),
            };
        } catch (err) {
            throw err;
        }
    },
};
