'use strict';

function wipeCollections(models) {
  return Promise.all(models.map(model => model.remove({})));
}

module.exports = {
  wipeCollections,
};
