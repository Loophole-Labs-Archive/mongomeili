# MongoMeili ![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)

#### Keep your [MongooseJS](http://mongoosejs.com/) Schemas synced with [MeiliSearch](http://meilisearch.com)

This plugin will automatically synchronise your Schemas with aa MeiliSearch index every time a new document is added, updated or removed.

You can also index the entire collection if you're just starting to use the plugin.

## NodeJS Installation

Install using npm:

```bash
npm install mongomeili
```

Or with yarn:
```bash
yarn add mongomeili
```

## Usage

With MongoMeili you can specify which which fields of your schema you'd like to index by adding a `meiliIndex = true` property to your schema as shown below:

```js
// ES6
import mongoose from 'mongoose';
import mongomeili from 'mongomeili';

// ES5
const mongoose = require('mongoose');
const mongomeili = require('mongomeili');

// Add the '{ meiliIndex: true }' property to index these attributes with MeiliSearch
const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, meiliIndex: true },
  director: { type: String, required: true, meiliIndex: true },
  year: { type: String, required: true, meiliIndex: true }
});

// Specify your MeiliSearch credentials
MovieSchema.plugin(mongomeili, {
  host: 'https://...'
  apiKey: '...',
  indexName: '...' // Will get created automatically if it doesn't exist already
})
```

## Options

| Option name  | Type     | Description
| -            | -        | -
| `host`     | `string` | The MeiliSearch Host
| `apiKey`    | `string` | The MeiliSearch API Key (often the Master Key)
| `indexName` | `string` | The name of the index that will store the data from your schema

## Methods

After applying the `mongomeili` plugin to your mongoose schema you will have access to the following methods:

#### `Model.syncWithMeili(): Promise`
Index the whole collection into your MeiliSearch index.

#### `Model.clearMeiliSearchIndex(): Promise`
Clears your MeiliSearch Index and sets `_meiliIndex = false` on the collection

#### `Model.setMeiliIndexSettings(settings: {}): Promise`
Set one or more settings of the MeiliSearch index, the full settings list is available [here](https://docs.meilisearch.com/references/settings.html#get-settings).

#### `Model.meiliSearch({ query: string, params?: {}, populate?: boolean }): Promise`
Search into your MeiliSearch index for a specific query. You can customize the search parameters and populate information not indexed from the mongoDB collection as well.

You can find the full list of search parameters [here](https://docs.meilisearch.com/references/search.html#search-in-an-index-with-post-route).

The response will look like this:

```json
{
  "hits": [
    {
      "_id": "5f86a08c27772b15560ff4af",
      "title": "Fast and Furious",
      "director": "Rob Cohen",
      "year": "2001"
    }
  ],
  "offset": 0,
  "limit": 20,
  "nbHits": 1,
  "exhaustiveNbHits": false,
  "processingTimeMs": 0,
  "query": "furious"
}
```

## Development

After checking out the repo, run `npm install --save-dev` or `yarn install --dev` to install dependencies.

## Contributing

Bug reports and pull requests are welcome on GitHub at [https://github.com/Loophole-Labs/mongomeili][HOMEPAGE]. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The MongoMeili project is available as open source under the terms of the [Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

## Code of Conduct

Everyone interacting in the MongoMeili project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/Loophole-Labs/mongomeili/blob/master/CODE_OF_CONDUCT.md).


## Project Managed By:
![Loophole Labs][LOOPHOLELABS](https://loopholelabs.io)

[HOMEPAGE]: https://github.com/Loophole-Labs/mongomeili
[LOOPHOLELABS]: https://cdn.loopholelabs.io/loopholelabs/LoopholeLabsLogo.svg
