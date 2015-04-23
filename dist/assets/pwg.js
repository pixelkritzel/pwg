/* jshint ignore:start */

/* jshint ignore:end */

define('pwg/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].LSAdapter.extend({
    namespace: 'pwg'
  });

});
define('pwg/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'pwg/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('pwg/controllers/password', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    copyAble: window.PWGCopyAble
  });

});
define('pwg/controllers/pwg', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    actions: {
      setSelectedService: function setSelectedService(selectedService) {
        this.set('selectedService', selectedService);
        this.set('showServiceList', false);
        this.set('errorService', false);
      },

      removeService: function removeService(service) {
        service.deleteRecord();
        service.save();
      },

      generatePassword: function generatePassword() {
        var selectedServiceName = this.get('selectedService');
        if (!selectedServiceName) {
          this.set('errorService', true);
        }
        var salt = this.get('salt') || '';
        if (salt.length < 6) {
          this.set('errorSalt', true);
        }
        if (this.get('errorService') || this.get('errorSalt')) {
          return false;
        }
        var combinedPassword = selectedServiceName + salt;
        var password = btoa(CryptoJS.SHA1(combinedPassword)).substr(0, 32);
        var newPasswordModel = this.store.createRecord('password', {
          password: password
        });
        this.transitionToRoute('password', newPasswordModel);
      },

      selectedServiceGainsFocus: function selectedServiceGainsFocus() {
        if (this.get('model').get('length') > 0) {
          this.set('showServiceList', true);
        }
      },

      saveService: function saveService() {
        var newServiceName = this.get('selectedService');
        var newService = this.store.createRecord('service', {
          serviceName: newServiceName
        });
        newService.save();
        this.set('showServiceList', false);
      },

      selectedServiceKeyUp: function selectedServiceKeyUp(x, event) {
        if ((this.get('selectedService') || '').trim().length > 0) {
          this.set('errorService', false);
          this.set('showServiceList', true);
        }
        var keycode = event.which;
        if (keycode === 13) {
          this.set('showServiceList', false);
          this.set('focusSaltField', true);
        }
        if (keycode === 27) {
          this.set('showServiceList', false);
        }
      },

      saltKeyUp: function saltKeyUp() {
        if ((this.get('salt') || '').trim().length > 5) {
          this.set('errorSalt', false);
        }
      }
    },

    selectedService: null,
    showServiceList: false,
    errorService: false,
    errorSalt: false,
    errorMessageService: 'You must provide a service name',
    errorMessageSalt: 'Your salt must be at least 6 characters long',

    filteredServices: (function () {
      var selectedService = this.get('selectedService');
      if (selectedService) {
        return this.filter(function (serviceModel) {
          return serviceModel.get('serviceName').indexOf(selectedService) !== -1;
        });
      } else {
        return this.get('model');
      }
    }).property('selectedService'),

    isSaveAble: (function () {
      var selectedService = this.get('selectedService') || '';
      selectedService = selectedService.trim();

      var isNotTheSame = (function () {
        var withTheSameName = this.filter(function (serviceModel) {
          return serviceModel.get('serviceName') === selectedService;
        });
        return withTheSameName.length === 0;
      }).bind(this);

      return selectedService.length > 0 && isNotTheSame();
    }).property('selectedService')
  });

});
define('pwg/controllers/service', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    actions: {
      deleteService: function deleteService() {
        var service = this.get('model');
        service.deleteRecord();
        service.save();
      }
    }
  });

});
define('pwg/initializers/app-version', ['exports', 'pwg/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('pwg/initializers/export-application-global', ['exports', 'ember', 'pwg/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('pwg/models/password', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    password: DS['default'].attr('string')
  });

});
define('pwg/models/service', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    serviceName: DS['default'].attr('string')
  });

});
define('pwg/router', ['exports', 'ember', 'pwg/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  exports['default'] = Router.map(function () {
    this.route('pwg', { path: '/' });
    this.route('services');
    this.route('password', { path: '/password/:password_id' });
  });

});
define('pwg/routes/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.get('store').find('service');
    }
  });

});
define('pwg/routes/password', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model() {
      var model = this.get('store').find('password');
      return model;
    },

    deactivate: function deactivate() {
      this.currentModel.destroy();
    }
  });

});
define('pwg/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].LSSerializer.extend();

});
define('pwg/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('pwg/templates/password', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Back");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","pwg_copy-button-container");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn pwg_password-copy-button");
            var el3 = dom.createTextNode("\n        Copy!\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1, 1]);
            var attrMorph0 = dom.createAttrMorph(element0, 'data-pwg-password');
            attribute(env, attrMorph0, element0, "data-pwg-password", concat(env, [get(env, context, "password")]));
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","pwg_password");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          content(env, morph0, context, "password");
          block(env, morph1, context, "if", [get(env, context, "copyAble")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","services_back-link");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        block(env, morph0, context, "link-to", ["pwg"], {}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "password")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('pwg/templates/pwg', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"class","btn btn-link pwg_filtered-service--name");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"role","button");
            var el3 = dom.createTextNode("\n              ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"class","btn pwg_filtered-service--remove");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"role","button");
            var el3 = dom.createTextNode("\n              ×\n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [1]);
            var element2 = dom.childAt(element1, [1]);
            var element3 = dom.childAt(element1, [3]);
            var morph0 = dom.createMorphAt(element2,1,1);
            element(env, element2, context, "action", ["setSelectedService", get(env, context, "service.serviceName")], {});
            content(env, morph0, context, "service.serviceName");
            element(env, element3, context, "action", ["removeService", get(env, context, "service")], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"class","btn btn-link");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"role","button");
            var el3 = dom.createTextNode("Save Service");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1, 0]);
            element(env, element0, context, "action", ["saveService", get(env, context, "service.serviceName")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"style","position:relative");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","pwg_filtered-services");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element4 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(element4,1,1);
          var morph1 = dom.createMorphAt(element4,2,2);
          block(env, morph0, context, "each", [get(env, context, "filteredServices")], {"keyword": "service"}, child0, null);
          block(env, morph1, context, "if", [get(env, context, "isSaveAble")], {}, child1, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          content(env, morph0, context, "errorMessageService");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          content(env, morph0, context, "errorMessageSalt");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pwg_selected-service-container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pwg_errormessage");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pwg_errormessage");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pwg_generate-button-container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"class","btn");
        var el3 = dom.createTextNode("Generate!");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [2]);
        var element6 = dom.childAt(fragment, [10, 1]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(element5,1,1);
        var morph2 = dom.createMorphAt(element5,3,3);
        var morph3 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        var morph4 = dom.createMorphAt(fragment,6,6,contextualElement);
        var morph5 = dom.createMorphAt(dom.childAt(fragment, [8]),1,1);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        inline(env, morph1, context, "input", [], {"value": get(env, context, "selectedService"), "focus-in": "selectedServiceGainsFocus", "key-up": "selectedServiceKeyUp", "class": "pwg_input-service form-control", "placeholder": "Service Name"});
        block(env, morph2, context, "if", [get(env, context, "showServiceList")], {}, child0, null);
        block(env, morph3, context, "if", [get(env, context, "errorService")], {}, child1, null);
        inline(env, morph4, context, "input", [], {"value": get(env, context, "salt"), "action": "generatePassword", "on": "enter", "key-up": "saltKeyUp", "class": "pwg_input-phrase js-salt form-control", "placeholder": "Secret Phrase"});
        block(env, morph5, context, "if", [get(env, context, "errorSalt")], {}, child2, null);
        element(env, element6, context, "action", ["generatePassword"], {});
        return fragment;
      }
    };
  }()));

});
define('pwg/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('pwg/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('pwg/tests/controllers/password.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/password.js should pass jshint', function() { 
    ok(true, 'controllers/password.js should pass jshint.'); 
  });

});
define('pwg/tests/controllers/pwg.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/pwg.js should pass jshint', function() { 
    ok(false, 'controllers/pwg.js should pass jshint.\ncontrollers/pwg.js: line 29, col 27, \'CryptoJS\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/controllers/service.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/service.js should pass jshint', function() { 
    ok(true, 'controllers/service.js should pass jshint.'); 
  });

});
define('pwg/tests/helpers/resolver', ['exports', 'ember/resolver', 'pwg/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('pwg/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('pwg/tests/helpers/start-app', ['exports', 'ember', 'pwg/app', 'pwg/router', 'pwg/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('pwg/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('pwg/tests/models/password.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/password.js should pass jshint', function() { 
    ok(true, 'models/password.js should pass jshint.'); 
  });

});
define('pwg/tests/models/service.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/service.js should pass jshint', function() { 
    ok(true, 'models/service.js should pass jshint.'); 
  });

});
define('pwg/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('pwg/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('pwg/tests/routes/password.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/password.js should pass jshint', function() { 
    ok(true, 'routes/password.js should pass jshint.'); 
  });

});
define('pwg/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('pwg/tests/test-helper', ['pwg/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('pwg/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('pwg/tests/unit/controllers/password-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:password', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/controllers/password-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/password-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/password-test.js should pass jshint.'); 
  });

});
define('pwg/tests/unit/controllers/pwg-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:pwg', 'PwgController', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function () {
    var controller = this.subject();
    ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/controllers/pwg-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/pwg-test.js should pass jshint', function() { 
    ok(false, 'unit/controllers/pwg-test.js should pass jshint.\nunit/controllers/pwg-test.js: line 14, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/controllers/service-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:service', 'ServiceController', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function () {
    var controller = this.subject();
    ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/controllers/service-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/service-test.js should pass jshint', function() { 
    ok(false, 'unit/controllers/service-test.js should pass jshint.\nunit/controllers/service-test.js: line 14, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/controllers/services-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:services', 'ServicesController', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function () {
    var controller = this.subject();
    ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/controllers/services-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/services-test.js should pass jshint', function() { 
    ok(false, 'unit/controllers/services-test.js should pass jshint.\nunit/controllers/services-test.js: line 14, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/models/password-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('password', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('pwg/tests/unit/models/password-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/password-test.js should pass jshint', function() { 
    ok(true, 'unit/models/password-test.js should pass jshint.'); 
  });

});
define('pwg/tests/unit/models/service-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('service', 'Service', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

});
define('pwg/tests/unit/models/service-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/service-test.js should pass jshint', function() { 
    ok(false, 'unit/models/service-test.js should pass jshint.\nunit/models/service-test.js: line 14, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:application', 'ApplicationRoute', {});

  ember_qunit.test('it exists', function () {
    var route = this.subject();
    ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(false, 'unit/routes/application-test.js should pass jshint.\nunit/routes/application-test.js: line 13, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/routes/password-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:password', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/routes/password-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/password-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/password-test.js should pass jshint.'); 
  });

});
define('pwg/tests/unit/routes/pwg-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:pwg', 'PwgRoute', {});

  ember_qunit.test('it exists', function () {
    var route = this.subject();
    ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/routes/pwg-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/pwg-test.js should pass jshint', function() { 
    ok(false, 'unit/routes/pwg-test.js should pass jshint.\nunit/routes/pwg-test.js: line 13, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/routes/services-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:services', 'ServicesRoute', {});

  ember_qunit.test('it exists', function () {
    var route = this.subject();
    ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('pwg/tests/unit/routes/services-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/services-test.js should pass jshint', function() { 
    ok(false, 'unit/routes/services-test.js should pass jshint.\nunit/routes/services-test.js: line 13, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/unit/views/pwg-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('view:pwg');

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('pwg/tests/unit/views/pwg-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/pwg-test.js should pass jshint', function() { 
    ok(true, 'unit/views/pwg-test.js should pass jshint.'); 
  });

});
define('pwg/tests/unit/views/services-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('view:services', 'ServicesView');

  // Replace this with your real tests.
  ember_qunit.test('it exists', function () {
    var view = this.subject();
    ok(view);
  });

});
define('pwg/tests/unit/views/services-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/services-test.js should pass jshint', function() { 
    ok(false, 'unit/views/services-test.js should pass jshint.\nunit/views/services-test.js: line 11, col 3, \'ok\' is not defined.\n\n1 error'); 
  });

});
define('pwg/tests/views/pwg.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/pwg.js should pass jshint', function() { 
    ok(false, 'views/pwg.js should pass jshint.\nviews/pwg.js: line 7, col 37, \'$\' is not defined.\nviews/pwg.js: line 9, col 5, \'$\' is not defined.\nviews/pwg.js: line 17, col 5, \'$\' is not defined.\n\n3 errors'); 
  });

});
define('pwg/views/pwg', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    didInsertElement: function didInsertElement() {

      var controller = this.get('controller');
      var $selectedServiceContainer = $('.pwg_selected-service-container');

      $(window).on('click.pwgFocusControlForSelectedService', function (event) {
        if (!$selectedServiceContainer.is(event.target) && $selectedServiceContainer.has(event.target).length === 0) {
          controller.set('showServiceList', false);
        }
      });
    },

    willDestroyElement: function willDestroyElement() {
      $(window).off('click.pwgFocusControlForSelectedService');
    },

    focusSalt: (function () {
      if (this.get('controller.focusSaltField')) {
        this.$('.js-salt').focus();
      }
    }).observes('controller.focusSaltField')
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('pwg/config/environment', ['ember'], function(Ember) {
  var prefix = 'pwg';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("pwg/tests/test-helper");
} else {
  require("pwg/app")["default"].create({"LOG_ACTIVE_GENERATION":true,"LOG_VIEW_LOOKUPS":true,"name":"pwg","version":"0.0.0.a01b0e41"});
}

/* jshint ignore:end */
//# sourceMappingURL=pwg.map