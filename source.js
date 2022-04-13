function mapValues(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, {});
}

function pick(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    if (fn(obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args));
}

export function bindActionCreators(actionCreators, dispatch) {
  return typeof actionCreators === "function"
    ? bindActionCreator(actionCreators, dispatch)
    : mapValues(actionCreators, (actionCreator) =>
        bindActionCreator(actionCreator, dispatch)
      );
}

export function compose(...funcs) {
  return (arg) => funcs.reduceRight((composed, f) => f(composed), arg);
}

export function applyMiddleware(...middlewares) {
  return (next) => (reducer, initialState) => {
    var store = next(reducer, initialState);
    var dispatch = store.dispatch;
    var chain = [];

    chain = middlewares.map((middleware) =>
      middleware({
        getState: store.getState,
        dispatch: (action) => dispatch(action),
      })
    );
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}

export function combineReducers(reducers) {
  var finalReducers = pick(reducers, (val) => typeof val === "function");
  return (state = {}, action) =>
    mapValues(finalReducers, (reducer, key) => reducer(state[key], action));
}

export function createStore(reducer, initialState) {
  var currentReducer = reducer;
  var currentState = initialState;
  var listeners = [];
  var isDispatching = false;

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    listeners.push(listener);

    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function dispatch(action) {
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    listeners.slice().forEach((listener) => listener());
    return action;
  }

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: "@@redux/INIT" });
  }

  dispatch({ type: "@@redux/INIT" });

  return { dispatch, subscribe, getState, replaceReducer };
}

// ------------------- From script.js //
function counterReducer(state, action) {
    if (typeof state === "undefined") {
      return 0;
    }
  
    switch (action.type) {
      case "INCREMENT":
        return state + 1;
      case "DECREMENT":
        return state - 1;
      default:
        return state;
    }
  }
  
  var store = createStore(counterReducer);
  var valueEl = document.getElementById("value");
  
  function render() {
    valueEl.innerHTML = store.getState().toString();
  }
  
  render();
  store.subscribe(render);
  
  document.getElementById("increment").addEventListener("click", function () {
    store.dispatch({ type: "INCREMENT" });
  });
  
  document.getElementById("decrement").addEventListener("click", function () {
    store.dispatch({ type: "DECREMENT" });
  });
  
  document
    .getElementById("incrementIfOdd")
    .addEventListener("click", function () {
      if (store.getState() % 2 !== 0) {
        store.dispatch({ type: "INCREMENT" });
      }
    });
  
  document
    .getElementById("incrementAsync")
    .addEventListener("click", function () {
      setTimeout(function () {
        store.dispatch({ type: "INCREMENT" });
      }, 1000);
    });
  
