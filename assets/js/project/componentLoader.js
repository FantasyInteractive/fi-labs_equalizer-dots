var fi = fi || {};
fi.labs = fi.labs || {};

/**
* @Class ComponentLoader
* Initializes and manages access to all components.
* To ensure your component is loaded:
* - Include COMPONENT_CLASS set on the context element.
* - Set the component class name in the data-COMPONENT attribute.
* - Register the class name/object with the register method after the class definition.
* - Be sure the component implements an init method.
*
* Alternatively you can omit the above steps and manually init a component (e.g. dynamically created)
* Registration is still recommended though.
*/
fi.labs.ComponentLoader = (function() {

  var registeredClasses = [];
  var instancesByType = [];
  var instances = [];
  var registeredElements = [];

  // Class name that indicates which DOM elements need to initialize a component.
  var COMPONENT_CLASS = 'fi-sony-component';

  // Data attribute the contains the component name.
  var COMPONENT_ATTRIBUTE = 'component';

  /**
   * Finds, initializes, and stores components with registered classes.
   * @param {element} $context - The element to load components from.
   */
  initialize = function($context) {
    $context = $context || $('body');

    $('.' + COMPONENT_CLASS, $context).each(function(index, element) {

      if ($.inArray(this, registeredElements) !== -1) {
        return -1;
      }

      registeredElements.push(this);

      // Create the component.
      var component = null;
      var element = $(element);
      var type = $(this).data(COMPONENT_ATTRIBUTE);
      var id = null;

      if (registeredClasses[type] != undefined) {
        component = new registeredClasses[type]($(this));

        // Set an instance id.
        if ($(element).data('id')) {
          id = $(element).data('id');
        }
        else {
          id = COMPONENT_CLASS + Math.floor(Math.random() * 100000) + '' + index;
        }

        // Store component
        component.id = id;
        instances[id] = component;

        if (typeof(instancesByType[type]) === 'undefined') {
          instancesByType[type] = [component];
        } else {
          instancesByType[type].push(component);
        }

        component.init();
      }
    });
  };

  /*
   * Registers a component so it can be initialized on page load.
   * @param {String} name - the full class name (e.g. namespace.Classname)
   * @param {Object} component - the class object itself.
   */
  register = function(name, component) {
    registeredClasses[name] = component;
  };

  findInstanceById = function(id) {
    return instances[id];
  };

  findInstancesByType = function(type) {
    var result = instancesByType[type];
    if (result == null) {
      result = [];
    }
    return result;
  };


  return {
    initialize: initialize,
    register: register,
    findInstanceById: findInstanceById,
    findInstancesByType: findInstancesByType
  };

}());