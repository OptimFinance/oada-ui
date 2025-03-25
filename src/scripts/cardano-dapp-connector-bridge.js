/**
 * Cardano DApp Connector Bridge
 * 
 * This module implements a bridge for connecting Cardano wallets to DApps through iframes,
 * following the CIP-0030 specification. It handles wallet connections, message passing,
 * and API object generation for seamless wallet integration.
 * 
 * Key Features:
 * - Implements CIP-0030 wallet connector specification
 * - Handles iframe-based wallet connections
 * - Manages message passing between DApp and wallet
 * - Provides API object generation for wallet interactions
 */

/**
 * Initialize the Cardano DApp Connector Bridge
 * Sets up the bridge for wallet connections and message handling
 * 
 * @param {Function} onBridgeCreated - Callback function called when bridge is successfully created
 *                                    Receives the wallet API object as parameter
 */
export function initCardanoDAppConnectorBridge(onBridgeCreated) {

  // Debug configuration
  var _debug = false                   // Enable for detailed debug logs
  var _label = 'DAppConnectorBridge: ' // Debug log prefix

  // Bridge state variables
  var _walletNamespace = null        // Wallet identifier (e.g., 'eternl')
  var _initialApiObject = null       // Initial CIP-0030 API object
  var _fullApiObject = null         // Complete CIP-0030 API object after enable()

  // Bridge configuration
  var _bridge = { 
    type: 'cardano-dapp-connector-bridge', 
    source: null,                    // Message source window
    origin: null                     // Origin of the wallet iframe
  }

  // Request tracking and method mapping
  var _requestMap = { }              // Maps request UIDs to their Promise handlers
  var _methodMap = {
    // Core bridge establishment methods
    connect: 'connect',              // Initial connection request
    handshake: 'handshake',         // Connection confirmation
    enable: 'enable',               // Wallet API activation
    isEnabled: 'isEnabled'          // Check if wallet is enabled
  }

  /**
   * Generate a unique identifier for requests
   * Creates a 6-character base-36 string
   * @returns {string} Unique identifier
   */
  function generateUID() {
    return ("000" + ((Math.random() * 46656) | 0).toString(36)).slice(-3) +
           ("000" + ((Math.random() * 46656) | 0).toString(36)).slice(-3);
  }

  /**
   * Create a bridge request
   * Handles message creation and Promise management for wallet communication
   * 
   * @param {string} method - API method to call
   * @param {...any} args - Method arguments
   * @returns {Promise} Resolves with the method response
   */
  function createRequest(method) {
    var args = [...arguments]
    if(args.length > 0) args.shift()

    return new Promise(((resolve, reject) => {
      var request = {
        payload: {
          type: _bridge.type,
          to: _walletNamespace,
          uid: generateUID(),
          method: method,
          args: args
        },
        resolve: resolve,
        reject: reject
      }

      _requestMap[request.payload.uid] = request
      if(_debug) { console.log(_label+'_requestMap:', _requestMap) }
      _bridge.source.postMessage(request.payload, _bridge.origin)
    }))
  }

  /**
   * Generate an API function for a given method
   * Creates a function that wraps createRequest for the specified method
   * 
   * @param {string} method - API method name
   * @returns {Function} Wrapped API function
   */
  function generateApiFunction(method) {
    return function() { return createRequest(method, ...arguments) }
  }

  /**
   * Generate an API object from a specification
   * Recursively creates API functions and objects based on the provided structure
   * 
   * @param {Object} obj - API specification object
   * @returns {Object} Generated API object
   */
  function generateApiObject(obj) {
    var apiObj = {}

    for(var key in obj) {
      var value = obj[key]
      if(_debug) { console.log(_label+'init: key/value:', key, value) }

      if(typeof value === 'string') {
        if(key === 'feeAddress') {
          apiObj[key] = value
        } else {
          apiObj[key] = generateApiFunction(value)
          _methodMap[value] = value
        }
      } else if(typeof value === 'object') {
        apiObj[key] = generateApiObject(value)
      } else {
        apiObj[key] = value
      }
    }

    return apiObj
  }

  /**
   * Initialize the bridge with a wallet connection
   * Sets up the cardano namespace and initial API object
   * 
   * @param {Window} source - Message source window
   * @param {string} origin - Origin of the wallet iframe
   * @param {string} walletNamespace - Wallet identifier
   * @param {Object} initialApi - Initial API specification
   * @returns {Object|null} Created API object or null if already exists
   */
  function initBridge(source, origin, walletNamespace, initialApi) {
    if(!window.hasOwnProperty('cardano')) {
      window.cardano = {}
    }

    if(window.cardano.hasOwnProperty(walletNamespace)) {
      console.warn('Warn: '+_label+'window.cardano.' + walletNamespace + ' already present, skipping initialApi creation.')
      return null
    }

    _bridge.source = source
    _bridge.origin = origin
    _walletNamespace = walletNamespace

    var initialApiObj = {
      isBridge: true,

      // CIP-0030 standard methods
      isEnabled: function() { return createRequest('isEnabled') },
      enable: function() { return createRequest('enable') },

      apiVersion: initialApi.apiVersion,
      name: initialApi.name,
      icon: initialApi.icon ? initialApi.icon : null,

      // Experimental features support
      experimental: {}
    }

    window.cardano[walletNamespace] = initialApiObj

    if(initialApi.experimental) {
      initialApiObj.experimental = {
        ...generateApiObject(initialApi.experimental)
      }
    }

    return window.cardano[walletNamespace]
  }

  /**
   * Validate bridge setup and state
   * Ensures proper bridge initialization and API object creation
   * 
   * @param {MessageEvent} payload - Message event payload
   * @returns {boolean} True if bridge is valid
   */
  function isValidBridge(payload) {
    if(!_initialApiObject) {
      if(payload.data.method !== _methodMap.connect) {
        console.error('Error: '+_label+'send \'connect\' first.')
        return false
      }

      var initialApi = payload.data.initialApi

      if(!initialApi || !initialApi.isBridge || !initialApi.apiVersion || !initialApi.name) {
        console.error('Error: '+_label+'\'connect\' is missing correct initialApi.', initialApi)
        return false
      }

      if(!payload.data.walletNamespace) {
        console.error('Error: '+_label+'\'connect\' is missing walletNamespace.', payload.data.walletNamespace)
        return false
      }

      _initialApiObject = initBridge(payload.source, payload.origin, payload.data.walletNamespace, initialApi)
    }

    if(!(_initialApiObject && window.hasOwnProperty('cardano') && window.cardano[payload.data.walletNamespace] === _initialApiObject)) {
      console.warn('Warn: '+_label+'bridge not set up correctly:', _bridge, _initialApiObject, _walletNamespace)
      return false
    }

    return true
  }

  /**
   * Validate incoming messages
   * Ensures messages are properly formatted and from the correct source
   * 
   * @param {MessageEvent} payload - Message event payload
   * @returns {boolean} True if message is valid
   */
  function isValidMessage(payload) {
    if(!payload.data || !payload.origin || !payload.source) return false
    if(payload.data.type !== _bridge.type) return false
    if(!_methodMap.hasOwnProperty(payload.data.method)) return false
    if(_walletNamespace && payload.data.walletNamespace !== _walletNamespace) return false

    return true
  }

  /**
   * Handle incoming messages
   * Processes messages from the wallet iframe and manages responses
   * 
   * @param {MessageEvent} payload - Message event payload
   */
  async function onMessage(payload) {
    if(!isValidMessage(payload) || !isValidBridge(payload)) return

    if(_debug) {
      console.log('########################')
      console.log(_label+'onMessage: got message')
      console.log(_label+'onMessage: origin:', payload.origin)
      console.log(_label+'onMessage: data: ', payload.data)
      console.log('########################')
    }

    if(payload.data.method === _methodMap.connect) {
      var success = await createRequest('handshake')
      if(success && _initialApiObject) {
        if(onBridgeCreated) onBridgeCreated(_initialApiObject)
      }
      return
    }

    if(!payload.data.uid) return

    var request = _requestMap[payload.data.uid]
    if(!request) return

    var response = payload.data.response
    var error = payload.data.error

    if(error) {
      request.reject(error)
      delete _requestMap[payload.data.uid]
      return
    }

    // Handle enable method response
    if(payload.data.method === _methodMap.enable) {
      _fullApiObject = null
      if(typeof response === 'object') {
        _fullApiObject = {
          ...generateApiObject(response)
        }
        response = _fullApiObject
        if(_debug) { console.log(_label+'onMessage: fullApiObject:', _fullApiObject) }
      }
    }

    request.resolve(response)
    delete _requestMap[payload.data.uid]
  }

  // Set up message event listener
  window.addEventListener("message", onMessage, false)
}
