var fi = fi || {};
fi.labs = fi.labs || {};
/*
 * @function: fi.labs.Main
 * @desc: starting point for Main scripts
 */
fi.labs.Main =
(function() {
  var api = {};
  var cache = {
    $window: $(window)
  };

  function initialize() {
    // Initialize and instanciate other components.
    fi.labs.ComponentLoader.initialize();
  }

  // return api
  api.initialize = initialize;

  return api;
})();