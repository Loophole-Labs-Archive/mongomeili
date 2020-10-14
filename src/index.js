const MeiliSearch = require('meilisearch');
const _ = require('lodash');

const validateOptions = function (options) {
  const requiredKeys = ['host', 'apiKey', 'indexName'];
  requiredKeys.forEach(key => {
    if (!options[key]) throw new Error(`Missing mongoMeili Option: ${key}`);
  });
};


const createMeiliMongooseModel = function ({ index, attributesToIndex }) {
  // MeiliMongooseModel is of type Mongoose.Model
  class MeiliMongooseModel {

    // Clear Meili index
    static async clearMeiliIndex() {
      await index.deleteAllDocuments();
      await this.collection.updateMany({ _meiliIndex: true }, { $set: { _meiliIndex: false } });
    }
  
    // Clear Meili index
    // Push a mongoDB collection to Meili index
    static async syncWithMeili() {
      await this.clearMeiliIndex();
      const docs = await this.find({ _meiliIndex: false });
      await Promise.all(docs.map(function(doc) {
        return doc.addObjectToMeili();
      }));
    }
  
    // Set one or more settings of the meili index
    static async setMeiliIndexSettings(settings) {
      return await index.updateSettings(settings);
    }
  
    // Search the index
    static async meiliSearch({ query, params, populate }) {
      const data = await index.search(query, params);
  
      // Populate hits with content from mongodb
      if (populate) {
        
        // Find objects into mongodb matching `objectID` from Meili search
        const hitsFromMongoose = await this.find(
          {
            _id: { $in: _.map(data.hits, '_id') },
          },
          _.reduce( this.schema.obj, function (results, value, key) { return { ...results, [key]: 1 } }, { _id: 1 } )
        );
  
        // Add additional data from mongodb into Meili search hits
        const populatedHits = data.hits.map(function(hit) {
          const originalHit = _.find(hitsFromMongoose, {
            _id: hit._id
          });

          return {
            ...(originalHit ? originalHit.toJSON() : {}),
            ...hit,
          };
        });
        data.hits = populatedHits;
      }
  
      return data;
    }
  
    // Push new document to Meili
    async addObjectToMeili() {
      const object = _.pick(this.toJSON(), attributesToIndex);
      await index.addDocuments([object]);

      await this.collection.updateMany(
        { _id: this._id },
        { $set: { _meiliIndex: true } }
      );
    }
  
    // Update an existing document in Meili
    async updateObjectToMeili() {
      const object = pick(this.toJSON(), attributesToIndex);
      await index.updateDocuments([object]);
    }
  
    // Delete a document from Meili
    async deleteObjectFromMeili() {
      await index.deleteDocument(this._id);
    }
  
    // * schema.post('save')
    postSaveHook() {
      if (this._meiliIndex) {
        this.updateObjectToMeili();
      } else {
        this.addObjectToMeili();
      }
    }
  
    // * schema.post('update')
    postUpdateHook() {
      if (this._meiliIndex) {
        this.updateObjectToMeili();
      }
    }
  
    // * schema.post('remove')
    postRemoveHook() {
      if (this._meiliIndex) {
        this.deleteObjectFromMeili();
      }
    }
  }

  return MeiliMongooseModel;
}

module.exports = function mongoMeili(schema, options) {

  // Vaidate Options for mongoMeili
  validateOptions(options);

  // Add meiliIndex to schema
  schema.add({
    _meiliIndex: { 
      type: Boolean, 
      required: false, 
      select: false, 
      default: false 
    }
  });

  const { host, apiKey, indexName } = options;

  // Setup MeiliSearch Client
  const client = new MeiliSearch({
    host: host,
    apiKey: apiKey
  });
  
  // Asynchronously create the index
  client.getOrCreateIndex(indexName);

  // Setup the index to search for this schema
  const index = client.getIndex(indexName);

  const attributesToIndex = [..._.reduce(schema.obj, function (results, value, key) {
    return value.meiliIndex ? [...results, key] : results;
  }, []), '_id'];

  schema.loadClass(createMeiliMongooseModel({ index, attributesToIndex }));

  // Register hooks
  schema.post('save', function (doc) { doc.postSaveHook() });
  schema.post('update', function (doc) { doc.postUpdateHook() });
  schema.post('remove', function (doc) { doc.postRemoveHook() });
};