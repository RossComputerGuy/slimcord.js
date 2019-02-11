const { Graph, Node } = require('async-dependency-graph');

const each = (list, method) => Promise.all(list.map(p => {
  try {
    return p.module[method]();
  } catch(e) {
    return Promise.reject(e);
  }
})).catch(err => console.warn(err));

module.exports.resolveTreeByKey = (tree, key, defaultValue) => {
  let result;
  try {
    result = key.split(/\./g).reduce((result, key) => result[key], Object.assign({}, tree));
  } catch (e) { /* noop */ }
  return typeof result === 'undefined' ? defaultValue : result;
};

module.exports.moduleHandler = (core) => {
  let instances = {};
  let modules = [];
  let registry = [];

  const createGraph = (list, method) => {
    const graph = new Graph();
    const provides = list.map(p => p.module.metadata().provides);
    const dependsOnIndex = wants => provides.findIndex(arr => arr.some(a => wants.indexOf(a) !== -1));
    list.forEach((p, i) => {
      graph.addNode(new Node(String(i), () => {
        try {
          return Promise.resolve(p.module[method]());
        } catch(e) {
          return Promise.reject(e);
        }
      }));
    });
    list.forEach((p, i) => {
      if (p.module.metadata().depends instanceof Array) {
        const dindex = dependsOnIndex(p.module.metadata().depends);
        if (dindex !== -1) {
          graph.addDependency(String(i), String(dindex));
        }
      }
    });
    return graph.traverse().catch(e => console.warn(e));
  };
  
  const handle = list => createGraph(list, 'init').then(() => createGraph(list, 'start'));
  
  const has = name => registry.findIndex(p => p.name === name) !== -1;
  
  const destroy = () => {
    each(modules, 'destroy');

    instances = {};
    registry = [];
  };
  
  const init = (before) => handle(before ? modules.filter(p => p.options.before) : modules.filter(p => !p.options.before));
  
  const register = (ref, options) => {
    try {
      modules.push({
        module: new ref(core, options.args),
        options
      });
    } catch(error) {
      console.error('Module registry error:', error);
    }
  };
  
  const bind = (name, singleton, callback) => {
    registry.push({
      singleton,
      name,
      make(...args) {
        return callback(...args);
      }
    });
  };
  
  const make = (name, ...args) => {
    const found = registry.find(p => p.name === name);
    if (!found) {
      throw new Error(`Module '${name}' not found`);
    }
    if (!found.singleton) {
      return found.make(...args);
    }
    if (!instances[name]) {
      if (found) {
        instances[name] = found.make(...args);
      }
    }
    return instances[name];
  };
  
  const getModuleMetadata = (name) => {
    const found = modules.find(mod => mod.module.metadata().name == name);
    if (!found) {
      throw new Error(`Module '${name}' not found`);
    }
    return found.module.metadata();
  };
  
  const getModuleNames = () => modules.map(mod => mod.module.metadata().name);

  return {register, init, bind, has, make, destroy, getModuleMetadata, getModuleNames};
};

// vim:set ts=2 sw=2 et:
