function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); }
    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
    Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived),
            result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) { return typeof obj; } : function(obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*!
 * camera-controls
 * https://github.com/yomotsu/camera-controls
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
// see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons#value
var MOUSE_BUTTON = {
    LEFT: 1,
    RIGHT: 2,
    MIDDLE: 4
};
var ACTION = Object.freeze({
    NONE: 0,
    ROTATE: 1,
    TRUCK: 2,
    OFFSET: 4,
    DOLLY: 8,
    ZOOM: 16,
    TOUCH_ROTATE: 32,
    TOUCH_TRUCK: 64,
    TOUCH_OFFSET: 128,
    TOUCH_DOLLY: 256,
    TOUCH_ZOOM: 512,
    TOUCH_DOLLY_TRUCK: 1024,
    TOUCH_DOLLY_OFFSET: 2048,
    TOUCH_DOLLY_ROTATE: 4096,
    TOUCH_ZOOM_TRUCK: 8192,
    TOUCH_ZOOM_OFFSET: 16384,
    TOUCH_ZOOM_ROTATE: 32768
});

function isPerspectiveCamera(camera) {
    return camera.isPerspectiveCamera;
}

function isOrthographicCamera(camera) {
    return camera.isOrthographicCamera;
}
var PI_2 = Math.PI * 2;
var PI_HALF = Math.PI / 2;
var EPSILON$1 = 1e-5;

function approxZero(number) {
    var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EPSILON$1;
    return Math.abs(number) < error;
}

function approxEquals(a, b) {
    var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON$1;
    return approxZero(a - b, error);
}

function roundToStep(value, step) {
    return Math.round(value / step) * step;
}

function infinityToMaxNumber(value) {
    if (isFinite(value)) return value;
    if (value < 0) return -Number.MAX_VALUE;
    return Number.MAX_VALUE;
}

function maxNumberToInfinity(value) {
    if (Math.abs(value) < Number.MAX_VALUE) return value;
    return value * Infinity;
}

function extractClientCoordFromEvent(pointers, out) {
    out.set(0, 0);
    pointers.forEach(function(pointer) {
        out.x += pointer.clientX;
        out.y += pointer.clientY;
    });
    out.x /= pointers.length;
    out.y /= pointers.length;
}

function notSupportedInOrthographicCamera(camera, message) {
    if (isOrthographicCamera(camera)) {
        console.warn("".concat(message, " is not supported in OrthographicCamera"));
        return true;
    }
    return false;
}

/**
 * A compat function for `Quaternion.invert()` / `Quaternion.inverse()`.
 * `Quaternion.invert()` is introduced in r123 and `Quaternion.inverse()` emits a warning.
 * We are going to use this compat for a while.
 * @param target A target quaternion
 */
function quatInvertCompat(target) {
    if (target.invert) {
        target.invert();
    } else {
        target.inverse();
    }
    return target;
}
var EventDispatcher = /*#__PURE__*/ function() {
    function EventDispatcher() {
        _classCallCheck(this, EventDispatcher);
        this._listeners = {};
    }
    /**
     * Adds the specified event listener.
     * @param type event name
     * @param listener handler function
     * @category Methods
     */
    _createClass(EventDispatcher, [{
        key: "addEventListener",
        value: function addEventListener(type, listener) {
                var listeners = this._listeners;
                if (listeners[type] === undefined) listeners[type] = [];
                if (listeners[type].indexOf(listener) === -1) listeners[type].push(listener);
            }
            /**
             * Presence of the specified event listener.
             * @param type event name
             * @param listener handler function
             * @category Methods
             */
    }, {
        key: "hasEventListener",
        value: function hasEventListener(type, listener) {
                var listeners = this._listeners;
                return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
            }
            /**
             * Removes the specified event listener
             * @param type event name
             * @param listener handler function
             * @category Methods
             */
    }, {
        key: "removeEventListener",
        value: function removeEventListener(type, listener) {
                var listeners = this._listeners;
                var listenerArray = listeners[type];
                if (listenerArray !== undefined) {
                    var index = listenerArray.indexOf(listener);
                    if (index !== -1) listenerArray.splice(index, 1);
                }
            }
            /**
             * Removes all event listeners
             * @param type event name
             * @category Methods
             */
    }, {
        key: "removeAllEventListeners",
        value: function removeAllEventListeners(type) {
                if (!type) {
                    this._listeners = {};
                    return;
                }
                if (Array.isArray(this._listeners[type])) this._listeners[type].length = 0;
            }
            /**
             * Fire an event type.
             * @param event DispatcherEvent
             * @category Methods
             */
    }, {
        key: "dispatchEvent",
        value: function dispatchEvent(event) {
            var listeners = this._listeners;
            var listenerArray = listeners[event.type];
            if (listenerArray !== undefined) {
                event.target = this;
                var array = listenerArray.slice(0);
                for (var i = 0, l = array.length; i < l; i++) {
                    array[i].call(this, event);
                }
            }
        }
    }]);
    return EventDispatcher;
}();
var VERSION = '1.38.1'; // will be replaced with `version` in package.json during the build process.
var TOUCH_DOLLY_FACTOR = 1 / 8;
var isBrowser = typeof window !== 'undefined';
var isMac = isBrowser && /Mac/.test(navigator.platform);
var isPointerEventsNotSupported = !(isBrowser && 'PointerEvent' in window); // Safari 12 does not support PointerEvents API
var THREE;
var _ORIGIN;
var _AXIS_Y;
var _AXIS_Z;
var _v2;
var _v3A;
var _v3B;
var _v3C;
var _xColumn;
var _yColumn;
var _zColumn;
var _deltaTarget;
var _deltaOffset;
var _sphericalA;
var _sphericalB;
var _box3A;
var _box3B;
var _sphere;
var _quaternionA;
var _quaternionB;
var _rotationMatrix;
var _raycaster;
var CameraControls = /*#__PURE__*/ function(_EventDispatcher) {
    _inherits(CameraControls, _EventDispatcher);
    var _super = _createSuper(CameraControls);
    /**
     * Creates a `CameraControls` instance.
     *
     * Note:
     * You **must install** three.js before using camera-controls. see [#install](#install)
     * Not doing so will lead to runtime errors (`undefined` references to THREE).
     *
     * e.g.
     * ```
     * CameraControls.install( { THREE } );
     * const cameraControls = new CameraControls( camera, domElement );
     * ```
     *
     * @param camera A `THREE.PerspectiveCamera` or `THREE.OrthographicCamera` to be controlled.
     * @param domElement A `HTMLElement` for the draggable area, usually `renderer.domElement`.
     * @category Constructor
     */
    function CameraControls(camera, domElement) {
        var _this;
        _classCallCheck(this, CameraControls);
        _this = _super.call(this);
        /**
         * Minimum vertical angle in radians.
         * The angle has to be between `0` and `.maxPolarAngle` inclusive.
         * The default value is `0`.
         *
         * e.g.
         * ```
         * cameraControls.maxPolarAngle = 0;
         * ```
         * @category Properties
         */
        _this.minPolarAngle = 0; // radians
        /**
         * Maximum vertical angle in radians.
         * The angle has to be between `.maxPolarAngle` and `Math.PI` inclusive.
         * The default value is `Math.PI`.
         *
         * e.g.
         * ```
         * cameraControls.maxPolarAngle = Math.PI;
         * ```
         * @category Properties
         */
        _this.maxPolarAngle = Math.PI; // radians
        /**
         * Minimum horizontal angle in radians.
         * The angle has to be less than `.maxAzimuthAngle`.
         * The default value is `- Infinity`.
         *
         * e.g.
         * ```
         * cameraControls.minAzimuthAngle = - Infinity;
         * ```
         * @category Properties
         */
        _this.minAzimuthAngle = -Infinity; // radians
        /**
         * Maximum horizontal angle in radians.
         * The angle has to be greater than `.minAzimuthAngle`.
         * The default value is `Infinity`.
         *
         * e.g.
         * ```
         * cameraControls.maxAzimuthAngle = Infinity;
         * ```
         * @category Properties
         */
        _this.maxAzimuthAngle = Infinity; // radians
        // How far you can dolly in and out ( PerspectiveCamera only )
        /**
         * Minimum distance for dolly. The value must be higher than `0`.
         * PerspectiveCamera only.
         * @category Properties
         */
        _this.minDistance = 0;
        /**
         * Maximum distance for dolly. The value must be higher than `minDistance`.
         * PerspectiveCamera only.
         * @category Properties
         */
        _this.maxDistance = Infinity;
        /**
         * `true` to enable Infinity Dolly.
         * When the Dolly distance is less than the `minDistance`, radius of the sphere will be set `minDistance` automatically.
         * @category Properties
         */
        _this.infinityDolly = false;
        /**
         * Minimum camera zoom.
         * @category Properties
         */
        _this.minZoom = 0.01;
        /**
         * Maximum camera zoom.
         * @category Properties
         */
        _this.maxZoom = Infinity;
        /**
         * The damping inertia.
         * The value must be between `Math.EPSILON` to `1` inclusive.
         * Setting `1` to disable smooth transitions.
         * @category Properties
         */
        _this.dampingFactor = 0.05;
        /**
         * The damping inertia while dragging.
         * The value must be between `Math.EPSILON` to `1` inclusive.
         * Setting `1` to disable smooth transitions.
         * @category Properties
         */
        _this.draggingDampingFactor = 0.25;
        /**
         * Speed of azimuth (horizontal) rotation.
         * @category Properties
         */
        _this.azimuthRotateSpeed = 1.0;
        /**
         * Speed of polar (vertical) rotation.
         * @category Properties
         */
        _this.polarRotateSpeed = 1.0;
        /**
         * Speed of mouse-wheel dollying.
         * @category Properties
         */
        _this.dollySpeed = 1.0;
        /**
         * Speed of drag for truck and pedestal.
         * @category Properties
         */
        _this.truckSpeed = 2.0;
        /**
         * `true` to enable Dolly-in to the mouse cursor coords.
         * @category Properties
         */
        _this.dollyToCursor = false;
        /**
         * @category Properties
         */
        _this.dragToOffset = false;
        /**
         * The same as `.screenSpacePanning` in three.js's OrbitControls.
         * @category Properties
         */
        _this.verticalDragToForward = false;
        /**
         * Friction ratio of the boundary.
         * @category Properties
         */
        _this.boundaryFriction = 0.0;
        /**
         * Controls how soon the `rest` event fires as the camera slows.
         * @category Properties
         */
        _this.restThreshold = 0.01;
        /**
         * An array of Meshes to collide with camera.
         * Be aware colliderMeshes may decrease performance. The collision test uses 4 raycasters from the camera since the near plane has 4 corners.
         * @category Properties
         */
        _this.colliderMeshes = [];
        /**
         * Force cancel user dragging.
         * @category Methods
         */
        // cancel will be overwritten in the constructor.
        _this.cancel = function() {};
        _this._enabled = true;
        _this._state = ACTION.NONE;
        _this._viewport = null;
        _this._affectOffset = false;
        _this._dollyControlAmount = 0;
        _this._hasRested = true;
        _this._boundaryEnclosesCamera = false;
        _this._needsUpdate = true;
        _this._updatedLastTime = false;
        _this._elementRect = new DOMRect();
        _this._activePointers = [];
        _this._truckInternal = function(deltaX, deltaY, dragToOffset) {
            if (isPerspectiveCamera(_this._camera)) {
                var offset = _v3A.copy(_this._camera.position).sub(_this._target);
                // half of the fov is center to top of screen
                var fov = _this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
                var targetDistance = offset.length() * Math.tan(fov * 0.5);
                var truckX = _this.truckSpeed * deltaX * targetDistance / _this._elementRect.height;
                var pedestalY = _this.truckSpeed * deltaY * targetDistance / _this._elementRect.height;
                if (_this.verticalDragToForward) {
                    dragToOffset ? _this.setFocalOffset(_this._focalOffsetEnd.x + truckX, _this._focalOffsetEnd.y, _this._focalOffsetEnd.z, true) : _this.truck(truckX, 0, true);
                    _this.forward(-pedestalY, true);
                } else {
                    dragToOffset ? _this.setFocalOffset(_this._focalOffsetEnd.x + truckX, _this._focalOffsetEnd.y + pedestalY, _this._focalOffsetEnd.z, true) : _this.truck(truckX, pedestalY, true);
                }
            } else if (isOrthographicCamera(_this._camera)) {
                // orthographic
                var _camera = _this._camera;
                var _truckX = deltaX * (_camera.right - _camera.left) / _camera.zoom / _this._elementRect.width;
                var _pedestalY = deltaY * (_camera.top - _camera.bottom) / _camera.zoom / _this._elementRect.height;
                dragToOffset ? _this.setFocalOffset(_this._focalOffsetEnd.x + _truckX, _this._focalOffsetEnd.y + _pedestalY, _this._focalOffsetEnd.z, true) : _this.truck(_truckX, _pedestalY, true);
            }
        };
        _this._rotateInternal = function(deltaX, deltaY) {
            var theta = PI_2 * _this.azimuthRotateSpeed * deltaX / _this._elementRect.height; // divide by *height* to refer the resolution
            var phi = PI_2 * _this.polarRotateSpeed * deltaY / _this._elementRect.height;
            _this.rotate(theta, phi, true);
        };
        _this._dollyInternal = function(delta, x, y) {
            var dollyScale = Math.pow(0.95, -delta * _this.dollySpeed);
            var distance = _this._sphericalEnd.radius * dollyScale;
            var prevRadius = _this._sphericalEnd.radius;
            var signedPrevRadius = prevRadius * (delta >= 0 ? -1 : 1);
            _this.dollyTo(distance);
            if (_this.infinityDolly && (distance < _this.minDistance || _this.maxDistance === _this.minDistance)) {
                _this._camera.getWorldDirection(_v3A);
                _this._targetEnd.add(_v3A.normalize().multiplyScalar(signedPrevRadius));
                _this._target.add(_v3A.normalize().multiplyScalar(signedPrevRadius));
            }
            if (_this.dollyToCursor) {
                _this._dollyControlAmount += _this._sphericalEnd.radius - prevRadius;
                if (_this.infinityDolly && (distance < _this.minDistance || _this.maxDistance === _this.minDistance)) {
                    _this._dollyControlAmount -= signedPrevRadius;
                }
                _this._dollyControlCoord.set(x, y);
            }
            return;
        };
        _this._zoomInternal = function(delta, x, y) {
            var zoomScale = Math.pow(0.95, delta * _this.dollySpeed);
            var prevZoom = _this._zoomEnd;
            // for both PerspectiveCamera and OrthographicCamera
            _this.zoomTo(_this._zoom * zoomScale);
            if (_this.dollyToCursor) {
                _this._dollyControlAmount += _this._zoomEnd - prevZoom;
                _this._dollyControlCoord.set(x, y);
            }
            return;
        };
        // Check if the user has installed THREE
        if (typeof THREE === 'undefined') {
            console.error('camera-controls: `THREE` is undefined. You must first run `CameraControls.install( { THREE: THREE } )`. Check the docs for further information.');
        }
        _this._camera = camera;
        _this._yAxisUpSpace = new THREE.Quaternion().setFromUnitVectors(_this._camera.up, _AXIS_Y);
        _this._yAxisUpSpaceInverse = quatInvertCompat(_this._yAxisUpSpace.clone());
        _this._state = ACTION.NONE;
        // the location
        _this._target = new THREE.Vector3();
        _this._targetEnd = _this._target.clone();
        _this._focalOffset = new THREE.Vector3();
        _this._focalOffsetEnd = _this._focalOffset.clone();
        // rotation
        _this._spherical = new THREE.Spherical().setFromVector3(_v3A.copy(_this._camera.position).applyQuaternion(_this._yAxisUpSpace));
        _this._sphericalEnd = _this._spherical.clone();
        _this._zoom = _this._camera.zoom;
        _this._zoomEnd = _this._zoom;
        // collisionTest uses nearPlane.s
        _this._nearPlaneCorners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        _this._updateNearPlaneCorners();
        // Target cannot move outside of this box
        _this._boundary = new THREE.Box3(new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
        // reset
        _this._target0 = _this._target.clone();
        _this._position0 = _this._camera.position.clone();
        _this._zoom0 = _this._zoom;
        _this._focalOffset0 = _this._focalOffset.clone();
        _this._dollyControlAmount = 0;
        _this._dollyControlCoord = new THREE.Vector2();
        // configs
        _this.mouseButtons = {
            left: ACTION.ROTATE,
            middle: ACTION.DOLLY,
            right: ACTION.TRUCK,
            wheel: isPerspectiveCamera(_this._camera) ? ACTION.DOLLY : isOrthographicCamera(_this._camera) ? ACTION.ZOOM : ACTION.NONE
        };
        _this.touches = {
            one: ACTION.TOUCH_ROTATE,
            two: isPerspectiveCamera(_this._camera) ? ACTION.TOUCH_DOLLY_TRUCK : isOrthographicCamera(_this._camera) ? ACTION.TOUCH_ZOOM_TRUCK : ACTION.NONE,
            three: ACTION.TOUCH_TRUCK
        };
        var dragStartPosition = new THREE.Vector2();
        var lastDragPosition = new THREE.Vector2();
        var dollyStart = new THREE.Vector2();
        var onPointerDown = function onPointerDown(event) {
            if (!_this._enabled || !_this._domElement) return;
            // Don't call `event.preventDefault()` on the pointerdown event
            // to keep receiving pointermove evens outside dragging iframe
            // https://taye.me/blog/tips/2015/11/16/mouse-drag-outside-iframe/
            var pointer = {
                pointerId: event.pointerId,
                clientX: event.clientX,
                clientY: event.clientY,
                deltaX: 0,
                deltaY: 0
            };
            _this._activePointers.push(pointer);
            // eslint-disable-next-line no-undef
            _this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, {
                passive: false
            });
            _this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
            _this._domElement.ownerDocument.addEventListener('pointermove', onPointerMove, {
                passive: false
            });
            _this._domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
            startDragging(event);
        };
        var onMouseDown = function onMouseDown(event) {
            if (!_this._enabled || !_this._domElement) return;
            var pointer = {
                pointerId: 0,
                clientX: event.clientX,
                clientY: event.clientY,
                deltaX: 0,
                deltaY: 0
            };
            _this._activePointers.push(pointer);
            // see https://github.com/microsoft/TypeScript/issues/32912#issuecomment-522142969
            // eslint-disable-next-line no-undef
            _this._domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
            _this._domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
            _this._domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
            _this._domElement.ownerDocument.addEventListener('mouseup', onMouseUp);
            startDragging(event);
        };
        var onTouchStart = function onTouchStart(event) {
            if (!_this._enabled || !_this._domElement) return;
            event.preventDefault();
            Array.prototype.forEach.call(event.changedTouches, function(touch) {
                var pointer = {
                    pointerId: touch.identifier,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    deltaX: 0,
                    deltaY: 0
                };
                _this._activePointers.push(pointer);
            });
            // eslint-disable-next-line no-undef
            _this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, {
                passive: false
            });
            _this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
            _this._domElement.ownerDocument.addEventListener('touchmove', onTouchMove, {
                passive: false
            });
            _this._domElement.ownerDocument.addEventListener('touchend', onTouchEnd);
            startDragging(event);
        };
        var onPointerMove = function onPointerMove(event) {
            if (event.cancelable) event.preventDefault();
            var pointerId = event.pointerId;
            var pointer = _this._findPointerById(pointerId);
            if (!pointer) return;
            pointer.clientX = event.clientX;
            pointer.clientY = event.clientY;
            pointer.deltaX = event.movementX;
            pointer.deltaY = event.movementY;
            if (event.pointerType === 'touch') {
                switch (_this._activePointers.length) {
                    case 1:
                        _this._state = _this.touches.one;
                        break;
                    case 2:
                        _this._state = _this.touches.two;
                        break;
                    case 3:
                        _this._state = _this.touches.three;
                        break;
                }
            } else {
                _this._state = 0;
                if ((event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
                    _this._state = _this._state | _this.mouseButtons.left;
                }
                if ((event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
                    _this._state = _this._state | _this.mouseButtons.middle;
                }
                if ((event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
                    _this._state = _this._state | _this.mouseButtons.right;
                }
            }
            dragging();
        };
        var onMouseMove = function onMouseMove(event) {
            var pointer = _this._findPointerById(0);
            if (!pointer) return;
            pointer.clientX = event.clientX;
            pointer.clientY = event.clientY;
            pointer.deltaX = event.movementX;
            pointer.deltaY = event.movementY;
            _this._state = 0;
            if ((event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
                _this._state = _this._state | _this.mouseButtons.left;
            }
            if ((event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
                _this._state = _this._state | _this.mouseButtons.middle;
            }
            if ((event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
                _this._state = _this._state | _this.mouseButtons.right;
            }
            dragging();
        };
        var onTouchMove = function onTouchMove(event) {
            if (event.cancelable) event.preventDefault();
            Array.prototype.forEach.call(event.changedTouches, function(touch) {
                var pointerId = touch.identifier;
                var pointer = _this._findPointerById(pointerId);
                if (!pointer) return;
                pointer.clientX = touch.clientX;
                pointer.clientY = touch.clientY;
                // touch event does not have movementX and movementY.
            });

            dragging();
        };
        var onPointerUp = function onPointerUp(event) {
            var pointerId = event.pointerId;
            var pointer = _this._findPointerById(pointerId);
            pointer && _this._activePointers.splice(_this._activePointers.indexOf(pointer), 1);
            if (event.pointerType === 'touch') {
                switch (_this._activePointers.length) {
                    case 0:
                        _this._state = ACTION.NONE;
                        break;
                    case 1:
                        _this._state = _this.touches.one;
                        break;
                    case 2:
                        _this._state = _this.touches.two;
                        break;
                    case 3:
                        _this._state = _this.touches.three;
                        break;
                }
            } else {
                _this._state = ACTION.NONE;
            }
            endDragging();
        };
        var onMouseUp = function onMouseUp() {
            var pointer = _this._findPointerById(0);
            pointer && _this._activePointers.splice(_this._activePointers.indexOf(pointer), 1);
            _this._state = ACTION.NONE;
            endDragging();
        };
        var onTouchEnd = function onTouchEnd(event) {
            Array.prototype.forEach.call(event.changedTouches, function(touch) {
                var pointerId = touch.identifier;
                var pointer = _this._findPointerById(pointerId);
                pointer && _this._activePointers.splice(_this._activePointers.indexOf(pointer), 1);
            });
            switch (_this._activePointers.length) {
                case 0:
                    _this._state = ACTION.NONE;
                    break;
                case 1:
                    _this._state = _this.touches.one;
                    break;
                case 2:
                    _this._state = _this.touches.two;
                    break;
                case 3:
                    _this._state = _this.touches.three;
                    break;
            }
            endDragging();
        };
        var lastScrollTimeStamp = -1;
        var onMouseWheel = function onMouseWheel(event) {
            if (!_this._enabled || _this.mouseButtons.wheel === ACTION.NONE) return;
            event.preventDefault();
            if (_this.dollyToCursor || _this.mouseButtons.wheel === ACTION.ROTATE || _this.mouseButtons.wheel === ACTION.TRUCK) {
                var now = performance.now();
                // only need to fire this at scroll start.
                if (lastScrollTimeStamp - now < 1000) _this._getClientRect(_this._elementRect);
                lastScrollTimeStamp = now;
            }
            // Ref: https://github.com/cedricpinson/osgjs/blob/00e5a7e9d9206c06fdde0436e1d62ab7cb5ce853/sources/osgViewer/input/source/InputSourceMouse.js#L89-L103
            var deltaYFactor = isMac ? -1 : -3;
            var delta = event.deltaMode === 1 ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
            var x = _this.dollyToCursor ? (event.clientX - _this._elementRect.x) / _this._elementRect.width * 2 - 1 : 0;
            var y = _this.dollyToCursor ? (event.clientY - _this._elementRect.y) / _this._elementRect.height * -2 + 1 : 0;
            switch (_this.mouseButtons.wheel) {
                case ACTION.ROTATE:
                    {
                        _this._rotateInternal(event.deltaX, event.deltaY);
                        break;
                    }
                case ACTION.TRUCK:
                    {
                        _this._truckInternal(event.deltaX, event.deltaY, false);
                        break;
                    }
                case ACTION.OFFSET:
                    {
                        _this._truckInternal(event.deltaX, event.deltaY, true);
                        break;
                    }
                case ACTION.DOLLY:
                    {
                        _this._dollyInternal(-delta, x, y);
                        break;
                    }
                case ACTION.ZOOM:
                    {
                        _this._zoomInternal(-delta, x, y);
                        break;
                    }
            }
            _this.dispatchEvent({
                type: 'control'
            });
        };
        var onContextMenu = function onContextMenu(event) {
            if (!_this._enabled) return;
            event.preventDefault();
        };
        var startDragging = function startDragging(event) {
            if (!_this._enabled) return;
            extractClientCoordFromEvent(_this._activePointers, _v2);
            _this._getClientRect(_this._elementRect);
            dragStartPosition.copy(_v2);
            lastDragPosition.copy(_v2);
            var isMultiTouch = _this._activePointers.length >= 2;
            if (isMultiTouch) {
                // 2 finger pinch
                var dx = _v2.x - _this._activePointers[1].clientX;
                var dy = _v2.y - _this._activePointers[1].clientY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyStart.set(0, distance);
                // center coords of 2 finger truck
                var x = (_this._activePointers[0].clientX + _this._activePointers[1].clientX) * 0.5;
                var y = (_this._activePointers[0].clientY + _this._activePointers[1].clientY) * 0.5;
                lastDragPosition.set(x, y);
            }
            if ('touches' in event || 'pointerType' in event && event.pointerType === 'touch') {
                switch (_this._activePointers.length) {
                    case 1:
                        _this._state = _this.touches.one;
                        break;
                    case 2:
                        _this._state = _this.touches.two;
                        break;
                    case 3:
                        _this._state = _this.touches.three;
                        break;
                }
            } else {
                _this._state = 0;
                if ((event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
                    _this._state = _this._state | _this.mouseButtons.left;
                }
                if ((event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
                    _this._state = _this._state | _this.mouseButtons.middle;
                }
                if ((event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
                    _this._state = _this._state | _this.mouseButtons.right;
                }
            }
            _this.dispatchEvent({
                type: 'controlstart'
            });
        };
        var dragging = function dragging() {
            if (!_this._enabled) return;
            extractClientCoordFromEvent(_this._activePointers, _v2);
            // When pointer lock is enabled clientX, clientY, screenX, and screenY remain 0.
            // If pointer lock is enabled, use the Delta directory, and assume active-pointer is not multiple.
            var isPointerLockActive = _this._domElement && document.pointerLockElement === _this._domElement;
            var deltaX = isPointerLockActive ? -_this._activePointers[0].deltaX : lastDragPosition.x - _v2.x;
            var deltaY = isPointerLockActive ? -_this._activePointers[0].deltaY : lastDragPosition.y - _v2.y;
            lastDragPosition.copy(_v2);
            if ((_this._state & ACTION.ROTATE) === ACTION.ROTATE || (_this._state & ACTION.TOUCH_ROTATE) === ACTION.TOUCH_ROTATE || (_this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE || (_this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
                _this._rotateInternal(deltaX, deltaY);
            }
            if ((_this._state & ACTION.DOLLY) === ACTION.DOLLY || (_this._state & ACTION.ZOOM) === ACTION.ZOOM) {
                var dollyX = _this.dollyToCursor ? (dragStartPosition.x - _this._elementRect.x) / _this._elementRect.width * 2 - 1 : 0;
                var dollyY = _this.dollyToCursor ? (dragStartPosition.y - _this._elementRect.y) / _this._elementRect.height * -2 + 1 : 0;
                (_this._state & ACTION.DOLLY) === ACTION.DOLLY ? _this._dollyInternal(deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY) : _this._zoomInternal(deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
            }
            if ((_this._state & ACTION.TOUCH_DOLLY) === ACTION.TOUCH_DOLLY || (_this._state & ACTION.TOUCH_ZOOM) === ACTION.TOUCH_ZOOM || (_this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK || (_this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK || (_this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET || (_this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET || (_this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE || (_this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
                var dx = _v2.x - _this._activePointers[1].clientX;
                var dy = _v2.y - _this._activePointers[1].clientY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var dollyDelta = dollyStart.y - distance;
                dollyStart.set(0, distance);
                var _dollyX = _this.dollyToCursor ? (lastDragPosition.x - _this._elementRect.x) / _this._elementRect.width * 2 - 1 : 0;
                var _dollyY = _this.dollyToCursor ? (lastDragPosition.y - _this._elementRect.y) / _this._elementRect.height * -2 + 1 : 0;
                (_this._state & ACTION.TOUCH_DOLLY) === ACTION.TOUCH_DOLLY || (_this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE || (_this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK || (_this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET ? _this._dollyInternal(dollyDelta * TOUCH_DOLLY_FACTOR, _dollyX, _dollyY) : _this._zoomInternal(dollyDelta * TOUCH_DOLLY_FACTOR, _dollyX, _dollyY);
            }
            if ((_this._state & ACTION.TRUCK) === ACTION.TRUCK || (_this._state & ACTION.TOUCH_TRUCK) === ACTION.TOUCH_TRUCK || (_this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK || (_this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK) {
                _this._truckInternal(deltaX, deltaY, false);
            }
            if ((_this._state & ACTION.OFFSET) === ACTION.OFFSET || (_this._state & ACTION.TOUCH_OFFSET) === ACTION.TOUCH_OFFSET || (_this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET || (_this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET) {
                _this._truckInternal(deltaX, deltaY, true);
            }
            _this.dispatchEvent({
                type: 'control'
            });
        };
        var endDragging = function endDragging() {
            extractClientCoordFromEvent(_this._activePointers, _v2);
            lastDragPosition.copy(_v2);
            if (_this._activePointers.length === 0 && _this._domElement) {
                // eslint-disable-next-line no-undef
                _this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, {
                    passive: false
                });
                _this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
                // eslint-disable-next-line no-undef
                _this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, {
                    passive: false
                });
                _this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
                _this.dispatchEvent({
                    type: 'controlend'
                });
            }
        };
        _this._addAllEventListeners = function(domElement) {
            _this._domElement = domElement;
            _this._domElement.style.touchAction = 'none';
            _this._domElement.style.userSelect = 'none';
            _this._domElement.style.webkitUserSelect = 'none';
            _this._domElement.addEventListener('pointerdown', onPointerDown);
            isPointerEventsNotSupported && _this._domElement.addEventListener('mousedown', onMouseDown);
            isPointerEventsNotSupported && _this._domElement.addEventListener('touchstart', onTouchStart);
            _this._domElement.addEventListener('pointercancel', onPointerUp);
            _this._domElement.addEventListener('wheel', onMouseWheel, {
                passive: false
            });
            _this._domElement.addEventListener('contextmenu', onContextMenu);
        };
        _this._removeAllEventListeners = function() {
            if (!_this._domElement) return;
            _this._domElement.removeEventListener('pointerdown', onPointerDown);
            _this._domElement.removeEventListener('mousedown', onMouseDown);
            _this._domElement.removeEventListener('touchstart', onTouchStart);
            _this._domElement.removeEventListener('pointercancel', onPointerUp);
            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
            // > it's probably wise to use the same values used for the call to `addEventListener()` when calling `removeEventListener()`
            // see https://github.com/microsoft/TypeScript/issues/32912#issuecomment-522142969
            // eslint-disable-next-line no-undef
            _this._domElement.removeEventListener('wheel', onMouseWheel, {
                passive: false
            });
            _this._domElement.removeEventListener('contextmenu', onContextMenu);
            // eslint-disable-next-line no-undef
            _this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, {
                passive: false
            });
            _this._domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
            // eslint-disable-next-line no-undef
            _this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, {
                passive: false
            });
            _this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
            _this._domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
            _this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
        };
        _this.cancel = function() {
            if (_this._state === ACTION.NONE) return;
            _this._state = ACTION.NONE;
            _this._activePointers.length = 0;
            endDragging();
        };
        if (domElement) _this.connect(domElement);
        _this.update(0);
        return _this;
    }
    /**
     * The camera to be controlled
     * @category Properties
     */
    _createClass(CameraControls, [{
        key: "camera",
        get: function get() {
            return this._camera;
        },
        set: function set(camera) {
                this._camera = camera;
                this.updateCameraUp();
                this._camera.updateProjectionMatrix();
                this._updateNearPlaneCorners();
                this._needsUpdate = true;
            }
            /**
             * Whether or not the controls are enabled.
             * `false` to disable user dragging/touch-move, but all methods works.
             * @category Properties
             */
    }, {
        key: "enabled",
        get: function get() {
            return this._enabled;
        },
        set: function set(enabled) {
                if (!this._domElement) return;
                this._enabled = enabled;
                if (enabled) {
                    this._domElement.style.touchAction = 'none';
                    this._domElement.style.userSelect = 'none';
                    this._domElement.style.webkitUserSelect = 'none';
                } else {
                    this.cancel();
                    this._domElement.style.touchAction = '';
                    this._domElement.style.userSelect = '';
                    this._domElement.style.webkitUserSelect = '';
                }
            }
            /**
             * Returns `true` if the controls are active updating.
             * readonly value.
             * @category Properties
             */
    }, {
        key: "active",
        get: function get() {
                return !this._hasRested;
            }
            /**
             * Getter for the current `ACTION`.
             * readonly value.
             * @category Properties
             */
    }, {
        key: "currentAction",
        get: function get() {
                return this._state;
            }
            /**
             * get/set Current distance.
             * @category Properties
             */
    }, {
        key: "distance",
        get: function get() {
            return this._spherical.radius;
        },
        set: function set(distance) {
                if (this._spherical.radius === distance && this._sphericalEnd.radius === distance) return;
                this._spherical.radius = distance;
                this._sphericalEnd.radius = distance;
                this._needsUpdate = true;
            }
            // horizontal angle
            /**
             * get/set the azimuth angle (horizontal) in radians.
             * Every 360 degrees turn is added to `.azimuthAngle` value, which is accumulative.
             * @category Properties
             */
    }, {
        key: "azimuthAngle",
        get: function get() {
            return this._spherical.theta;
        },
        set: function set(azimuthAngle) {
                if (this._spherical.theta === azimuthAngle && this._sphericalEnd.theta === azimuthAngle) return;
                this._spherical.theta = azimuthAngle;
                this._sphericalEnd.theta = azimuthAngle;
                this._needsUpdate = true;
            }
            // vertical angle
            /**
             * get/set the polar angle (vertical) in radians.
             * @category Properties
             */
    }, {
        key: "polarAngle",
        get: function get() {
            return this._spherical.phi;
        },
        set: function set(polarAngle) {
                if (this._spherical.phi === polarAngle && this._sphericalEnd.phi === polarAngle) return;
                this._spherical.phi = polarAngle;
                this._sphericalEnd.phi = polarAngle;
                this._needsUpdate = true;
            }
            /**
             * Whether camera position should be enclosed in the boundary or not.
             * @category Properties
             */
    }, {
        key: "boundaryEnclosesCamera",
        get: function get() {
            return this._boundaryEnclosesCamera;
        },
        set: function set(boundaryEnclosesCamera) {
                this._boundaryEnclosesCamera = boundaryEnclosesCamera;
                this._needsUpdate = true;
            }
            /**
             * Adds the specified event listener.
             * Applicable event types (which is `K`) are:
             * | Event name          | Timing |
             * | ------------------- | ------ |
             * | `'controlstart'`    | When the user starts to control the camera via mouse / touches. ¹ |
             * | `'control'`         | When the user controls the camera (dragging). |
             * | `'controlend'`      | When the user ends to control the camera. ¹ |
             * | `'transitionstart'` | When any kind of transition starts, either user control or using a method with `enableTransition = true` |
             * | `'update'`          | When the camera position is updated. |
             * | `'wake'`            | When the camera starts moving. |
             * | `'rest'`            | When the camera movement is below `.restThreshold` ². |
             * | `'sleep'`           | When the camera end moving. |
             *
             * 1. `mouseButtons.wheel` (Mouse wheel control) does not emit `'controlstart'` and `'controlend'`. `mouseButtons.wheel` uses scroll-event internally, and scroll-event happens intermittently. That means "start" and "end" cannot be detected.
             * 2. Due to damping, `sleep` will usually fire a few seconds after the camera _appears_ to have stopped moving. If you want to do something (e.g. enable UI, perform another transition) at the point when the camera has stopped, you probably want the `rest` event. This can be fine tuned using the `.restThreshold` parameter. See the [Rest and Sleep Example](https://yomotsu.github.io/camera-controls/examples/rest-and-sleep.html).
             *
             * e.g.
             * ```
             * cameraControl.addEventListener( 'controlstart', myCallbackFunction );
             * ```
             * @param type event name
             * @param listener handler function
             * @category Methods
             */
    }, {
        key: "addEventListener",
        value: function addEventListener(type, listener) {
                _get(_getPrototypeOf(CameraControls.prototype), "addEventListener", this).call(this, type, listener);
            }
            /**
             * Removes the specified event listener
             * e.g.
             * ```
             * cameraControl.addEventListener( 'controlstart', myCallbackFunction );
             * ```
             * @param type event name
             * @param listener handler function
             * @category Methods
             */
    }, {
        key: "removeEventListener",
        value: function removeEventListener(type, listener) {
                _get(_getPrototypeOf(CameraControls.prototype), "removeEventListener", this).call(this, type, listener);
            }
            /**
             * Rotate azimuthal angle(horizontal) and polar angle(vertical).
             * Every value is added to the current value.
             * @param azimuthAngle Azimuth rotate angle. In radian.
             * @param polarAngle Polar rotate angle. In radian.
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "rotate",
        value: function rotate(azimuthAngle, polarAngle) {
                var enableTransition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                return this.rotateTo(this._sphericalEnd.theta + azimuthAngle, this._sphericalEnd.phi + polarAngle, enableTransition);
            }
            /**
             * Rotate azimuthal angle(horizontal) to the given angle and keep the same polar angle(vertical) target.
             *
             * e.g.
             * ```
             * cameraControls.rotateAzimuthTo( 30 * THREE.MathUtils.DEG2RAD, true );
             * ```
             * @param azimuthAngle Azimuth rotate angle. In radian.
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "rotateAzimuthTo",
        value: function rotateAzimuthTo(azimuthAngle) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                return this.rotateTo(azimuthAngle, this._sphericalEnd.phi, enableTransition);
            }
            /**
             * Rotate polar angle(vertical) to the given angle and keep the same azimuthal angle(horizontal) target.
             *
             * e.g.
             * ```
             * cameraControls.rotatePolarTo( 30 * THREE.MathUtils.DEG2RAD, true );
             * ```
             * @param polarAngle Polar rotate angle. In radian.
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "rotatePolarTo",
        value: function rotatePolarTo(polarAngle) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                return this.rotateTo(this._sphericalEnd.theta, polarAngle, enableTransition);
            }
            /**
             * Rotate azimuthal angle(horizontal) and polar angle(vertical) to the given angle.
             * Camera view will rotate over the orbit pivot absolutely:
             *
             * azimuthAngle
             * ```
             *       0º
             *         \
             * 90º -----+----- -90º
             *           \
             *           180º
             * ```
             * | direction | angle                  |
             * | --------- | ---------------------- |
             * | front     | 0º                     |
             * | left      | 90º (`Math.PI / 2`)    |
             * | right     | -90º (`- Math.PI / 2`) |
             * | back      | 180º (`Math.PI`)       |
             *
             * polarAngle
             * ```
             *     180º
             *      |
             *      90º
             *      |
             *      0º
             * ```
             * | direction            | angle                  |
             * | -------------------- | ---------------------- |
             * | top/sky              | 180º (`Math.PI`)       |
             * | horizontal from view | 90º (`Math.PI / 2`)    |
             * | bottom/floor         | 0º                     |
             *
             * @param azimuthAngle Azimuth rotate angle to. In radian.
             * @param polarAngle Polar rotate angle to. In radian.
             * @param enableTransition  Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "rotateTo",
        value: function rotateTo(azimuthAngle, polarAngle) {
                var enableTransition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var theta = THREE.MathUtils.clamp(azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
                var phi = THREE.MathUtils.clamp(polarAngle, this.minPolarAngle, this.maxPolarAngle);
                this._sphericalEnd.theta = theta;
                this._sphericalEnd.phi = phi;
                this._sphericalEnd.makeSafe();
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._spherical.theta = this._sphericalEnd.theta;
                    this._spherical.phi = this._sphericalEnd.phi;
                }
                var resolveImmediately = !enableTransition || approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) && approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * Dolly in/out camera position.
             * @param distance Distance of dollyIn. Negative number for dollyOut.
             * @param enableTransition Whether to move smoothly or immediately.
             * @category Methods
             */
    }, {
        key: "dolly",
        value: function dolly(distance) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                return this.dollyTo(this._sphericalEnd.radius - distance, enableTransition);
            }
            /**
             * Dolly in/out camera position to given distance.
             * @param distance Distance of dolly.
             * @param enableTransition Whether to move smoothly or immediately.
             * @category Methods
             */
    }, {
        key: "dollyTo",
        value: function dollyTo(distance) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                var lastRadius = this._sphericalEnd.radius;
                var newRadius = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
                var hasCollider = this.colliderMeshes.length >= 1;
                if (hasCollider) {
                    var maxDistanceByCollisionTest = this._collisionTest();
                    var isCollided = approxEquals(maxDistanceByCollisionTest, this._spherical.radius);
                    var isDollyIn = lastRadius > newRadius;
                    if (!isDollyIn && isCollided) return Promise.resolve();
                    this._sphericalEnd.radius = Math.min(newRadius, maxDistanceByCollisionTest);
                } else {
                    this._sphericalEnd.radius = newRadius;
                }
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._spherical.radius = this._sphericalEnd.radius;
                }
                var resolveImmediately = !enableTransition || approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * Zoom in/out camera. The value is added to camera zoom.
             * Limits set with `.minZoom` and `.maxZoom`
             * @param zoomStep zoom scale
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "zoom",
        value: function zoom(zoomStep) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                return this.zoomTo(this._zoomEnd + zoomStep, enableTransition);
            }
            /**
             * Zoom in/out camera to given scale. The value overwrites camera zoom.
             * Limits set with .minZoom and .maxZoom
             * @param zoom
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "zoomTo",
        value: function zoomTo(zoom) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                this._zoomEnd = THREE.MathUtils.clamp(zoom, this.minZoom, this.maxZoom);
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._zoom = this._zoomEnd;
                }
                var resolveImmediately = !enableTransition || approxEquals(this._zoom, this._zoomEnd, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * @deprecated `pan()` has been renamed to `truck()`
             * @category Methods
             */
    }, {
        key: "pan",
        value: function pan(x, y) {
                var enableTransition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                console.warn('`pan` has been renamed to `truck`');
                return this.truck(x, y, enableTransition);
            }
            /**
             * Truck and pedestal camera using current azimuthal angle
             * @param x Horizontal translate amount
             * @param y Vertical translate amount
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "truck",
        value: function truck(x, y) {
                var enableTransition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                this._camera.updateMatrix();
                _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
                _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
                _xColumn.multiplyScalar(x);
                _yColumn.multiplyScalar(-y);
                var offset = _v3A.copy(_xColumn).add(_yColumn);
                var to = _v3B.copy(this._targetEnd).add(offset);
                return this.moveTo(to.x, to.y, to.z, enableTransition);
            }
            /**
             * Move forward / backward.
             * @param distance Amount to move forward / backward. Negative value to move backward
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "forward",
        value: function forward(distance) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                _v3A.setFromMatrixColumn(this._camera.matrix, 0);
                _v3A.crossVectors(this._camera.up, _v3A);
                _v3A.multiplyScalar(distance);
                var to = _v3B.copy(this._targetEnd).add(_v3A);
                return this.moveTo(to.x, to.y, to.z, enableTransition);
            }
            /**
             * Move target position to given point.
             * @param x x coord to move center position
             * @param y y coord to move center position
             * @param z z coord to move center position
             * @param enableTransition Whether to move smoothly or immediately
             * @category Methods
             */
    }, {
        key: "moveTo",
        value: function moveTo(x, y, z) {
                var enableTransition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                var offset = _v3A.set(x, y, z).sub(this._targetEnd);
                this._encloseToBoundary(this._targetEnd, offset, this.boundaryFriction);
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._target.copy(this._targetEnd);
                }
                var resolveImmediately = !enableTransition || approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) && approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) && approxEquals(this._target.z, this._targetEnd.z, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * Fit the viewport to the box or the bounding box of the object, using the nearest axis. paddings are in unit.
             * set `cover: true` to fill enter screen.
             * e.g.
             * ```
             * cameraControls.fitToBox( myMesh );
             * ```
             * @param box3OrObject Axis aligned bounding box to fit the view.
             * @param enableTransition Whether to move smoothly or immediately.
             * @param options | `<object>` { cover: boolean, paddingTop: number, paddingLeft: number, paddingBottom: number, paddingRight: number }
             * @returns Transition end promise
             * @category Methods
             */
    }, {
        key: "fitToBox",
        value: function fitToBox(box3OrObject, enableTransition) {
                var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
                    _ref$cover = _ref.cover,
                    cover = _ref$cover === void 0 ? false : _ref$cover,
                    _ref$paddingLeft = _ref.paddingLeft,
                    paddingLeft = _ref$paddingLeft === void 0 ? 0 : _ref$paddingLeft,
                    _ref$paddingRight = _ref.paddingRight,
                    paddingRight = _ref$paddingRight === void 0 ? 0 : _ref$paddingRight,
                    _ref$paddingBottom = _ref.paddingBottom,
                    paddingBottom = _ref$paddingBottom === void 0 ? 0 : _ref$paddingBottom,
                    _ref$paddingTop = _ref.paddingTop,
                    paddingTop = _ref$paddingTop === void 0 ? 0 : _ref$paddingTop;
                var promises = [];
                var aabb = box3OrObject.isBox3 ? _box3A.copy(box3OrObject) : _box3A.setFromObject(box3OrObject);
                if (aabb.isEmpty()) {
                    console.warn('camera-controls: fitTo() cannot be used with an empty box. Aborting');
                    Promise.resolve();
                }
                // round to closest axis ( forward | backward | right | left | top | bottom )
                var theta = roundToStep(this._sphericalEnd.theta, PI_HALF);
                var phi = roundToStep(this._sphericalEnd.phi, PI_HALF);
                promises.push(this.rotateTo(theta, phi, enableTransition));
                var normal = _v3A.setFromSpherical(this._sphericalEnd).normalize();
                var rotation = _quaternionA.setFromUnitVectors(normal, _AXIS_Z);
                var viewFromPolar = approxEquals(Math.abs(normal.y), 1);
                if (viewFromPolar) {
                    rotation.multiply(_quaternionB.setFromAxisAngle(_AXIS_Y, theta));
                }
                rotation.multiply(this._yAxisUpSpaceInverse);
                // make oriented bounding box
                var bb = _box3B.makeEmpty();
                // left bottom back corner
                _v3B.copy(aabb.min).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // right bottom back corner
                _v3B.copy(aabb.min).setX(aabb.max.x).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // left top back corner
                _v3B.copy(aabb.min).setY(aabb.max.y).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // right top back corner
                _v3B.copy(aabb.max).setZ(aabb.min.z).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // left bottom front corner
                _v3B.copy(aabb.min).setZ(aabb.max.z).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // right bottom front corner
                _v3B.copy(aabb.max).setY(aabb.min.y).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // left top front corner
                _v3B.copy(aabb.max).setX(aabb.min.x).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // right top front corner
                _v3B.copy(aabb.max).applyQuaternion(rotation);
                bb.expandByPoint(_v3B);
                // add padding
                bb.min.x -= paddingLeft;
                bb.min.y -= paddingBottom;
                bb.max.x += paddingRight;
                bb.max.y += paddingTop;
                rotation.setFromUnitVectors(_AXIS_Z, normal);
                if (viewFromPolar) {
                    rotation.premultiply(_quaternionB.invert());
                }
                rotation.premultiply(this._yAxisUpSpace);
                var bbSize = bb.getSize(_v3A);
                var center = bb.getCenter(_v3B).applyQuaternion(rotation);
                if (isPerspectiveCamera(this._camera)) {
                    var distance = this.getDistanceToFitBox(bbSize.x, bbSize.y, bbSize.z, cover);
                    promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
                    promises.push(this.dollyTo(distance, enableTransition));
                    promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
                } else if (isOrthographicCamera(this._camera)) {
                    var camera = this._camera;
                    var width = camera.right - camera.left;
                    var height = camera.top - camera.bottom;
                    var zoom = cover ? Math.max(width / bbSize.x, height / bbSize.y) : Math.min(width / bbSize.x, height / bbSize.y);
                    promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
                    promises.push(this.zoomTo(zoom, enableTransition));
                    promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
                }
                return Promise.all(promises);
            }
            /**
             * Fit the viewport to the sphere or the bounding sphere of the object.
             * @param sphereOrMesh
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "fitToSphere",
        value: function fitToSphere(sphereOrMesh, enableTransition) {
                var promises = [];
                var isSphere = sphereOrMesh instanceof THREE.Sphere;
                var boundingSphere = isSphere ? _sphere.copy(sphereOrMesh) : createBoundingSphere(sphereOrMesh, _sphere);
                promises.push(this.moveTo(boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z, enableTransition));
                if (isPerspectiveCamera(this._camera)) {
                    var distanceToFit = this.getDistanceToFitSphere(boundingSphere.radius);
                    promises.push(this.dollyTo(distanceToFit, enableTransition));
                } else if (isOrthographicCamera(this._camera)) {
                    var width = this._camera.right - this._camera.left;
                    var height = this._camera.top - this._camera.bottom;
                    var diameter = 2 * boundingSphere.radius;
                    var zoom = Math.min(width / diameter, height / diameter);
                    promises.push(this.zoomTo(zoom, enableTransition));
                }
                promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
                return Promise.all(promises);
            }
            /**
             * Make an orbit with given points.
             * @param positionX
             * @param positionY
             * @param positionZ
             * @param targetX
             * @param targetY
             * @param targetZ
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "setLookAt",
        value: function setLookAt(positionX, positionY, positionZ, targetX, targetY, targetZ) {
                var enableTransition = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
                var target = _v3B.set(targetX, targetY, targetZ);
                var position = _v3A.set(positionX, positionY, positionZ);
                this._targetEnd.copy(target);
                this._sphericalEnd.setFromVector3(position.sub(target).applyQuaternion(this._yAxisUpSpace));
                this.normalizeRotations();
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._target.copy(this._targetEnd);
                    this._spherical.copy(this._sphericalEnd);
                }
                var resolveImmediately = !enableTransition || approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) && approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) && approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) && approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) && approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) && approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * Similar to setLookAt, but it interpolates between two states.
             * @param positionAX
             * @param positionAY
             * @param positionAZ
             * @param targetAX
             * @param targetAY
             * @param targetAZ
             * @param positionBX
             * @param positionBY
             * @param positionBZ
             * @param targetBX
             * @param targetBY
             * @param targetBZ
             * @param t
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "lerpLookAt",
        value: function lerpLookAt(positionAX, positionAY, positionAZ, targetAX, targetAY, targetAZ, positionBX, positionBY, positionBZ, targetBX, targetBY, targetBZ, t) {
                var enableTransition = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : false;
                var targetA = _v3A.set(targetAX, targetAY, targetAZ);
                var positionA = _v3B.set(positionAX, positionAY, positionAZ);
                _sphericalA.setFromVector3(positionA.sub(targetA).applyQuaternion(this._yAxisUpSpace));
                var targetB = _v3C.set(targetBX, targetBY, targetBZ);
                var positionB = _v3B.set(positionBX, positionBY, positionBZ);
                _sphericalB.setFromVector3(positionB.sub(targetB).applyQuaternion(this._yAxisUpSpace));
                this._targetEnd.copy(targetA.lerp(targetB, t)); // tricky
                var deltaTheta = _sphericalB.theta - _sphericalA.theta;
                var deltaPhi = _sphericalB.phi - _sphericalA.phi;
                var deltaRadius = _sphericalB.radius - _sphericalA.radius;
                this._sphericalEnd.set(_sphericalA.radius + deltaRadius * t, _sphericalA.phi + deltaPhi * t, _sphericalA.theta + deltaTheta * t);
                this.normalizeRotations();
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._target.copy(this._targetEnd);
                    this._spherical.copy(this._sphericalEnd);
                }
                var resolveImmediately = !enableTransition || approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) && approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) && approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) && approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) && approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) && approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * setLookAt without target, keep gazing at the current target
             * @param positionX
             * @param positionY
             * @param positionZ
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "setPosition",
        value: function setPosition(positionX, positionY, positionZ) {
                var enableTransition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                return this.setLookAt(positionX, positionY, positionZ, this._targetEnd.x, this._targetEnd.y, this._targetEnd.z, enableTransition);
            }
            /**
             * setLookAt without position, Stay still at the position.
             * @param targetX
             * @param targetY
             * @param targetZ
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "setTarget",
        value: function setTarget(targetX, targetY, targetZ) {
                var enableTransition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                var pos = this.getPosition(_v3A);
                var promise = this.setLookAt(pos.x, pos.y, pos.z, targetX, targetY, targetZ, enableTransition);
                // see https://github.com/yomotsu/camera-controls/issues/335
                this._sphericalEnd.phi = THREE.MathUtils.clamp(this.polarAngle, this.minPolarAngle, this.maxPolarAngle);
                return promise;
            }
            /**
             * Set focal offset using the screen parallel coordinates. z doesn't affect in Orthographic as with Dolly.
             * @param x
             * @param y
             * @param z
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "setFocalOffset",
        value: function setFocalOffset(x, y, z) {
                var enableTransition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                this._focalOffsetEnd.set(x, y, z);
                this._needsUpdate = true;
                if (!enableTransition) {
                    this._focalOffset.copy(this._focalOffsetEnd);
                }
                this._affectOffset = !approxZero(x) || !approxZero(y) || !approxZero(z);
                var resolveImmediately = !enableTransition || approxEquals(this._focalOffset.x, this._focalOffsetEnd.x, this.restThreshold) && approxEquals(this._focalOffset.y, this._focalOffsetEnd.y, this.restThreshold) && approxEquals(this._focalOffset.z, this._focalOffsetEnd.z, this.restThreshold);
                return this._createOnRestPromise(resolveImmediately);
            }
            /**
             * Set orbit point without moving the camera.
             * SHOULD NOT RUN DURING ANIMATIONS. `setOrbitPoint()` will immediately fix the positions.
             * @param targetX
             * @param targetY
             * @param targetZ
             * @category Methods
             */
    }, {
        key: "setOrbitPoint",
        value: function setOrbitPoint(targetX, targetY, targetZ) {
                this._camera.updateMatrixWorld();
                _xColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 0);
                _yColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 1);
                _zColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 2);
                var position = _v3A.set(targetX, targetY, targetZ);
                var distance = position.distanceTo(this._camera.position);
                var cameraToPoint = position.sub(this._camera.position);
                _xColumn.multiplyScalar(cameraToPoint.x);
                _yColumn.multiplyScalar(cameraToPoint.y);
                _zColumn.multiplyScalar(cameraToPoint.z);
                _v3A.copy(_xColumn).add(_yColumn).add(_zColumn);
                _v3A.z = _v3A.z + distance;
                this.dollyTo(distance, false);
                this.setFocalOffset(-_v3A.x, _v3A.y, -_v3A.z, false);
                this.moveTo(targetX, targetY, targetZ, false);
            }
            /**
             * Set the boundary box that encloses the target of the camera. box3 is in THREE.Box3
             * @param box3
             * @category Methods
             */
    }, {
        key: "setBoundary",
        value: function setBoundary(box3) {
                if (!box3) {
                    this._boundary.min.set(-Infinity, -Infinity, -Infinity);
                    this._boundary.max.set(Infinity, Infinity, Infinity);
                    this._needsUpdate = true;
                    return;
                }
                this._boundary.copy(box3);
                this._boundary.clampPoint(this._targetEnd, this._targetEnd);
                this._needsUpdate = true;
            }
            /**
             * Set (or unset) the current viewport.
             * Set this when you want to use renderer viewport and .dollyToCursor feature at the same time.
             * @param viewportOrX
             * @param y
             * @param width
             * @param height
             * @category Methods
             */
    }, {
        key: "setViewport",
        value: function setViewport(viewportOrX, y, width, height) {
                if (viewportOrX === null) {
                    // null
                    this._viewport = null;
                    return;
                }
                this._viewport = this._viewport || new THREE.Vector4();
                if (typeof viewportOrX === 'number') {
                    // number
                    this._viewport.set(viewportOrX, y, width, height);
                } else {
                    // Vector4
                    this._viewport.copy(viewportOrX);
                }
            }
            /**
             * Calculate the distance to fit the box.
             * @param width box width
             * @param height box height
             * @param depth box depth
             * @returns distance
             * @category Methods
             */
    }, {
        key: "getDistanceToFitBox",
        value: function getDistanceToFitBox(width, height, depth) {
                var cover = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitBox')) return this._spherical.radius;
                var boundingRectAspect = width / height;
                var fov = this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
                var aspect = this._camera.aspect;
                var heightToFit = (cover ? boundingRectAspect > aspect : boundingRectAspect < aspect) ? height : width / aspect;
                return heightToFit * 0.5 / Math.tan(fov * 0.5) + depth * 0.5;
            }
            /**
             * Calculate the distance to fit the sphere.
             * @param radius sphere radius
             * @returns distance
             * @category Methods
             */
    }, {
        key: "getDistanceToFitSphere",
        value: function getDistanceToFitSphere(radius) {
                if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitSphere')) return this._spherical.radius;
                // https://stackoverflow.com/a/44849975
                var vFOV = this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
                var hFOV = Math.atan(Math.tan(vFOV * 0.5) * this._camera.aspect) * 2;
                var fov = 1 < this._camera.aspect ? vFOV : hFOV;
                return radius / Math.sin(fov * 0.5);
            }
            /**
             * Returns its current gazing target, which is the center position of the orbit.
             * @param out current gazing target
             * @category Methods
             */
    }, {
        key: "getTarget",
        value: function getTarget(out) {
                var _out = !!out && out.isVector3 ? out : new THREE.Vector3();
                return _out.copy(this._targetEnd);
            }
            /**
             * Returns its current position.
             * @param out current position
             * @category Methods
             */
    }, {
        key: "getPosition",
        value: function getPosition(out) {
                var _out = !!out && out.isVector3 ? out : new THREE.Vector3();
                return _out.setFromSpherical(this._sphericalEnd).applyQuaternion(this._yAxisUpSpaceInverse).add(this._targetEnd);
            }
            /**
             * Returns its current focal offset, which is how much the camera appears to be translated in screen parallel coordinates.
             * @param out current focal offset
             * @category Methods
             */
    }, {
        key: "getFocalOffset",
        value: function getFocalOffset(out) {
                var _out = !!out && out.isVector3 ? out : new THREE.Vector3();
                return _out.copy(this._focalOffsetEnd);
            }
            /**
             * Normalize camera azimuth angle rotation between 0 and 360 degrees.
             * @category Methods
             */
    }, {
        key: "normalizeRotations",
        value: function normalizeRotations() {
                this._sphericalEnd.theta = this._sphericalEnd.theta % PI_2;
                if (this._sphericalEnd.theta < 0) this._sphericalEnd.theta += PI_2;
                this._spherical.theta += PI_2 * Math.round((this._sphericalEnd.theta - this._spherical.theta) / PI_2);
            }
            /**
             * Reset all rotation and position to defaults.
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "reset",
        value: function reset() {
                var enableTransition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                var promises = [this.setLookAt(this._position0.x, this._position0.y, this._position0.z, this._target0.x, this._target0.y, this._target0.z, enableTransition), this.setFocalOffset(this._focalOffset0.x, this._focalOffset0.y, this._focalOffset0.z, enableTransition), this.zoomTo(this._zoom0, enableTransition)];
                return Promise.all(promises);
            }
            /**
             * Set current camera position as the default position.
             * @category Methods
             */
    }, {
        key: "saveState",
        value: function saveState() {
                this.getTarget(this._target0);
                this.getPosition(this._position0);
                this._zoom0 = this._zoom;
                this._focalOffset0.copy(this._focalOffset);
            }
            /**
             * Sync camera-up direction.
             * When camera-up vector is changed, `.updateCameraUp()` must be called.
             * @category Methods
             */
    }, {
        key: "updateCameraUp",
        value: function updateCameraUp() {
                this._yAxisUpSpace.setFromUnitVectors(this._camera.up, _AXIS_Y);
                quatInvertCompat(this._yAxisUpSpaceInverse.copy(this._yAxisUpSpace));
            }
            /**
             * Update camera position and directions.
             * This should be called in your tick loop every time, and returns true if re-rendering is needed.
             * @param delta
             * @returns updated
             * @category Methods
             */
    }, {
        key: "update",
        value: function update(delta) {
                var dampingFactor = this._state === ACTION.NONE ? this.dampingFactor : this.draggingDampingFactor;
                // The original THREE.OrbitControls assume 60 FPS fixed and does NOT rely on delta time.
                // (that must be a problem of the original one though)
                // To to emulate the speed of the original one under 60 FPS, multiply `60` to delta,
                // but ours are more flexible to any FPS unlike the original.
                var lerpRatio = Math.min(dampingFactor * delta * 60, 1);
                var deltaTheta = this._sphericalEnd.theta - this._spherical.theta;
                var deltaPhi = this._sphericalEnd.phi - this._spherical.phi;
                var deltaRadius = this._sphericalEnd.radius - this._spherical.radius;
                var deltaTarget = _deltaTarget.subVectors(this._targetEnd, this._target);
                var deltaOffset = _deltaOffset.subVectors(this._focalOffsetEnd, this._focalOffset);
                if (!approxZero(deltaTheta) || !approxZero(deltaPhi) || !approxZero(deltaRadius) || !approxZero(deltaTarget.x) || !approxZero(deltaTarget.y) || !approxZero(deltaTarget.z) || !approxZero(deltaOffset.x) || !approxZero(deltaOffset.y) || !approxZero(deltaOffset.z)) {
                    this._spherical.set(this._spherical.radius + deltaRadius * lerpRatio, this._spherical.phi + deltaPhi * lerpRatio, this._spherical.theta + deltaTheta * lerpRatio);
                    this._target.add(deltaTarget.multiplyScalar(lerpRatio));
                    this._focalOffset.add(deltaOffset.multiplyScalar(lerpRatio));
                    this._needsUpdate = true;
                } else {
                    this._spherical.copy(this._sphericalEnd);
                    this._target.copy(this._targetEnd);
                    this._focalOffset.copy(this._focalOffsetEnd);
                }
                if (this._dollyControlAmount !== 0) {
                    if (isPerspectiveCamera(this._camera)) {
                        var camera = this._camera;
                        var cameraDirection = _v3A.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).normalize().negate();
                        var planeX = _v3B.copy(cameraDirection).cross(camera.up).normalize();
                        if (planeX.lengthSq() === 0) planeX.x = 1.0;
                        var planeY = _v3C.crossVectors(planeX, cameraDirection);
                        var worldToScreen = this._sphericalEnd.radius * Math.tan(camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD * 0.5);
                        var prevRadius = this._sphericalEnd.radius - this._dollyControlAmount;
                        var _lerpRatio = (prevRadius - this._sphericalEnd.radius) / this._sphericalEnd.radius;
                        var cursor = _v3A.copy(this._targetEnd).add(planeX.multiplyScalar(this._dollyControlCoord.x * worldToScreen * camera.aspect)).add(planeY.multiplyScalar(this._dollyControlCoord.y * worldToScreen));
                        this._targetEnd.lerp(cursor, _lerpRatio);
                    } else if (isOrthographicCamera(this._camera)) {
                        var _camera2 = this._camera;
                        var worldCursorPosition = _v3A.set(this._dollyControlCoord.x, this._dollyControlCoord.y, (_camera2.near + _camera2.far) / (_camera2.near - _camera2.far)).unproject(_camera2); //.sub( _v3B.set( this._focalOffset.x, this._focalOffset.y, 0 ) );
                        var quaternion = _v3B.set(0, 0, -1).applyQuaternion(_camera2.quaternion);
                        var _cursor = _v3C.copy(worldCursorPosition).add(quaternion.multiplyScalar(-worldCursorPosition.dot(_camera2.up)));
                        var prevZoom = this._zoom - this._dollyControlAmount;
                        var _lerpRatio2 = -(prevZoom - this._zoomEnd) / this._zoom;
                        // find the "distance" (aka plane constant in three.js) of Plane
                        // from a given position (this._targetEnd) and normal vector (cameraDirection)
                        // https://www.maplesoft.com/support/help/maple/view.aspx?path=MathApps%2FEquationOfAPlaneNormal#bkmrk0
                        var _cameraDirection = _v3A.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).normalize().negate();
                        var prevPlaneConstant = this._targetEnd.dot(_cameraDirection);
                        this._targetEnd.lerp(_cursor, _lerpRatio2);
                        var newPlaneConstant = this._targetEnd.dot(_cameraDirection);
                        // Pull back the camera depth that has moved, to be the camera stationary as zoom
                        var pullBack = _cameraDirection.multiplyScalar(newPlaneConstant - prevPlaneConstant);
                        this._targetEnd.sub(pullBack);
                    }
                    this._target.copy(this._targetEnd);
                    // target position may be moved beyond boundary.
                    this._boundary.clampPoint(this._targetEnd, this._targetEnd);
                    this._dollyControlAmount = 0;
                }
                // zoom
                var deltaZoom = this._zoomEnd - this._zoom;
                this._zoom += deltaZoom * lerpRatio;
                if (this._camera.zoom !== this._zoom) {
                    if (approxZero(deltaZoom)) this._zoom = this._zoomEnd;
                    this._camera.zoom = this._zoom;
                    this._camera.updateProjectionMatrix();
                    this._updateNearPlaneCorners();
                    this._needsUpdate = true;
                }
                // collision detection
                var maxDistance = this._collisionTest();
                this._spherical.radius = Math.min(this._spherical.radius, maxDistance);
                // decompose spherical to the camera position
                this._spherical.makeSafe();
                this._camera.position.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).add(this._target);
                this._camera.lookAt(this._target);
                // set offset after the orbit movement
                if (this._affectOffset) {
                    this._camera.updateMatrixWorld();
                    _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
                    _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
                    _zColumn.setFromMatrixColumn(this._camera.matrix, 2);
                    _xColumn.multiplyScalar(this._focalOffset.x);
                    _yColumn.multiplyScalar(-this._focalOffset.y);
                    _zColumn.multiplyScalar(this._focalOffset.z); // notice: z-offset will not affect in Orthographic.
                    _v3A.copy(_xColumn).add(_yColumn).add(_zColumn);
                    this._camera.position.add(_v3A);
                }
                if (this._boundaryEnclosesCamera) {
                    this._encloseToBoundary(this._camera.position.copy(this._target), _v3A.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse), 1.0);
                }
                var updated = this._needsUpdate;
                if (updated && !this._updatedLastTime) {
                    this._hasRested = false;
                    this.dispatchEvent({
                        type: 'wake'
                    });
                    this.dispatchEvent({
                        type: 'update'
                    });
                } else if (updated) {
                    this.dispatchEvent({
                        type: 'update'
                    });
                    if (approxZero(deltaTheta, this.restThreshold) && approxZero(deltaPhi, this.restThreshold) && approxZero(deltaRadius, this.restThreshold) && approxZero(deltaTarget.x, this.restThreshold) && approxZero(deltaTarget.y, this.restThreshold) && approxZero(deltaTarget.z, this.restThreshold) && approxZero(deltaOffset.x, this.restThreshold) && approxZero(deltaOffset.y, this.restThreshold) && approxZero(deltaOffset.z, this.restThreshold) && approxZero(deltaZoom, this.restThreshold) && !this._hasRested) {
                        this._hasRested = true;
                        this.dispatchEvent({
                            type: 'rest'
                        });
                    }
                } else if (!updated && this._updatedLastTime) {
                    this.dispatchEvent({
                        type: 'sleep'
                    });
                }
                this._updatedLastTime = updated;
                this._needsUpdate = false;
                return updated;
            }
            /**
             * Get all state in JSON string
             * @category Methods
             */
    }, {
        key: "toJSON",
        value: function toJSON() {
                return JSON.stringify({
                    enabled: this._enabled,
                    minDistance: this.minDistance,
                    maxDistance: infinityToMaxNumber(this.maxDistance),
                    minZoom: this.minZoom,
                    maxZoom: infinityToMaxNumber(this.maxZoom),
                    minPolarAngle: this.minPolarAngle,
                    maxPolarAngle: infinityToMaxNumber(this.maxPolarAngle),
                    minAzimuthAngle: infinityToMaxNumber(this.minAzimuthAngle),
                    maxAzimuthAngle: infinityToMaxNumber(this.maxAzimuthAngle),
                    dampingFactor: this.dampingFactor,
                    draggingDampingFactor: this.draggingDampingFactor,
                    dollySpeed: this.dollySpeed,
                    truckSpeed: this.truckSpeed,
                    dollyToCursor: this.dollyToCursor,
                    verticalDragToForward: this.verticalDragToForward,
                    target: this._targetEnd.toArray(),
                    position: _v3A.setFromSpherical(this._sphericalEnd).add(this._targetEnd).toArray(),
                    zoom: this._zoomEnd,
                    focalOffset: this._focalOffsetEnd.toArray(),
                    target0: this._target0.toArray(),
                    position0: this._position0.toArray(),
                    zoom0: this._zoom0,
                    focalOffset0: this._focalOffset0.toArray()
                });
            }
            /**
             * Reproduce the control state with JSON. enableTransition is where anim or not in a boolean.
             * @param json
             * @param enableTransition
             * @category Methods
             */
    }, {
        key: "fromJSON",
        value: function fromJSON(json) {
                var enableTransition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                var obj = JSON.parse(json);
                var position = _v3A.fromArray(obj.position);
                this.enabled = obj.enabled;
                this.minDistance = obj.minDistance;
                this.maxDistance = maxNumberToInfinity(obj.maxDistance);
                this.minZoom = obj.minZoom;
                this.maxZoom = maxNumberToInfinity(obj.maxZoom);
                this.minPolarAngle = obj.minPolarAngle;
                this.maxPolarAngle = maxNumberToInfinity(obj.maxPolarAngle);
                this.minAzimuthAngle = maxNumberToInfinity(obj.minAzimuthAngle);
                this.maxAzimuthAngle = maxNumberToInfinity(obj.maxAzimuthAngle);
                this.dampingFactor = obj.dampingFactor;
                this.draggingDampingFactor = obj.draggingDampingFactor;
                this.dollySpeed = obj.dollySpeed;
                this.truckSpeed = obj.truckSpeed;
                this.dollyToCursor = obj.dollyToCursor;
                this.verticalDragToForward = obj.verticalDragToForward;
                this._target0.fromArray(obj.target0);
                this._position0.fromArray(obj.position0);
                this._zoom0 = obj.zoom0;
                this._focalOffset0.fromArray(obj.focalOffset0);
                this.moveTo(obj.target[0], obj.target[1], obj.target[2], enableTransition);
                _sphericalA.setFromVector3(position.sub(this._targetEnd).applyQuaternion(this._yAxisUpSpace));
                this.rotateTo(_sphericalA.theta, _sphericalA.phi, enableTransition);
                this.zoomTo(obj.zoom, enableTransition);
                this.setFocalOffset(obj.focalOffset[0], obj.focalOffset[1], obj.focalOffset[2], enableTransition);
                this._needsUpdate = true;
            }
            /**
             * Attach all internal event handlers to enable drag control.
             * @category Methods
             */
    }, {
        key: "connect",
        value: function connect(domElement) {
                if (this._domElement) {
                    console.warn('camera-controls is already connected.');
                    return;
                }
                domElement.setAttribute('data-camera-controls-version', VERSION);
                this._addAllEventListeners(domElement);
            }
            /**
             * Detach all internal event handlers to disable drag control.
             */
    }, {
        key: "disconnect",
        value: function disconnect() {
                this._removeAllEventListeners();
                this._domElement = undefined;
            }
            /**
             * Dispose the cameraControls instance itself, remove all eventListeners.
             * @category Methods
             */
    }, {
        key: "dispose",
        value: function dispose() {
            this.disconnect();
            if (this._domElement && 'setAttribute' in this._domElement) this._domElement.removeAttribute('data-camera-controls-version');
        }
    }, {
        key: "_findPointerById",
        value: function _findPointerById(pointerId) {
            // to support IE11 use some instead of Array#find (will be removed when IE11 is deprecated)
            var pointer = null;
            this._activePointers.some(function(activePointer) {
                if (activePointer.pointerId === pointerId) {
                    pointer = activePointer;
                    return true;
                }
                return false;
            });
            return pointer;
        }
    }, {
        key: "_encloseToBoundary",
        value: function _encloseToBoundary(position, offset, friction) {
            var offsetLength2 = offset.lengthSq();
            if (offsetLength2 === 0.0) {
                // sanity check
                return position;
            }
            // See: https://twitter.com/FMS_Cat/status/1106508958640988161
            var newTarget = _v3B.copy(offset).add(position); // target
            var clampedTarget = this._boundary.clampPoint(newTarget, _v3C); // clamped target
            var deltaClampedTarget = clampedTarget.sub(newTarget); // newTarget -> clampedTarget
            var deltaClampedTargetLength2 = deltaClampedTarget.lengthSq(); // squared length of deltaClampedTarget
            if (deltaClampedTargetLength2 === 0.0) {
                // when the position doesn't have to be clamped
                return position.add(offset);
            } else if (deltaClampedTargetLength2 === offsetLength2) {
                // when the position is completely stuck
                return position;
            } else if (friction === 0.0) {
                return position.add(offset).add(deltaClampedTarget);
            } else {
                var offsetFactor = 1.0 + friction * deltaClampedTargetLength2 / offset.dot(deltaClampedTarget);
                return position.add(_v3B.copy(offset).multiplyScalar(offsetFactor)).add(deltaClampedTarget.multiplyScalar(1.0 - friction));
            }
        }
    }, {
        key: "_updateNearPlaneCorners",
        value: function _updateNearPlaneCorners() {
                if (isPerspectiveCamera(this._camera)) {
                    var camera = this._camera;
                    var near = camera.near;
                    var fov = camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
                    var heightHalf = Math.tan(fov * 0.5) * near; // near plain half height
                    var widthHalf = heightHalf * camera.aspect; // near plain half width
                    this._nearPlaneCorners[0].set(-widthHalf, -heightHalf, 0);
                    this._nearPlaneCorners[1].set(widthHalf, -heightHalf, 0);
                    this._nearPlaneCorners[2].set(widthHalf, heightHalf, 0);
                    this._nearPlaneCorners[3].set(-widthHalf, heightHalf, 0);
                } else if (isOrthographicCamera(this._camera)) {
                    var _camera3 = this._camera;
                    var zoomInv = 1 / _camera3.zoom;
                    var left = _camera3.left * zoomInv;
                    var right = _camera3.right * zoomInv;
                    var top = _camera3.top * zoomInv;
                    var bottom = _camera3.bottom * zoomInv;
                    this._nearPlaneCorners[0].set(left, top, 0);
                    this._nearPlaneCorners[1].set(right, top, 0);
                    this._nearPlaneCorners[2].set(right, bottom, 0);
                    this._nearPlaneCorners[3].set(left, bottom, 0);
                }
            }
            // lateUpdate
    }, {
        key: "_collisionTest",
        value: function _collisionTest() {
                var distance = Infinity;
                var hasCollider = this.colliderMeshes.length >= 1;
                if (!hasCollider) return distance;
                if (notSupportedInOrthographicCamera(this._camera, '_collisionTest')) return distance;
                // divide by distance to normalize, lighter than `Vector3.prototype.normalize()`
                var direction = _v3A.setFromSpherical(this._spherical).divideScalar(this._spherical.radius);
                _rotationMatrix.lookAt(_ORIGIN, direction, this._camera.up);
                for (var i = 0; i < 4; i++) {
                    var nearPlaneCorner = _v3B.copy(this._nearPlaneCorners[i]);
                    nearPlaneCorner.applyMatrix4(_rotationMatrix);
                    var origin = _v3C.addVectors(this._target, nearPlaneCorner);
                    _raycaster.set(origin, direction);
                    _raycaster.far = this._spherical.radius + 1;
                    var intersects = _raycaster.intersectObjects(this.colliderMeshes);
                    if (intersects.length !== 0 && intersects[0].distance < distance) {
                        distance = intersects[0].distance;
                    }
                }
                return distance;
            }
            /**
             * Get its client rect and package into given `DOMRect` .
             */
    }, {
        key: "_getClientRect",
        value: function _getClientRect(target) {
            if (!this._domElement) return;
            var rect = this._domElement.getBoundingClientRect();
            target.x = rect.left;
            target.y = rect.top;
            if (this._viewport) {
                target.x += this._viewport.x;
                target.y += rect.height - this._viewport.w - this._viewport.y;
                target.width = this._viewport.z;
                target.height = this._viewport.w;
            } else {
                target.width = rect.width;
                target.height = rect.height;
            }
            return target;
        }
    }, {
        key: "_createOnRestPromise",
        value: function _createOnRestPromise(resolveImmediately) {
                var _this2 = this;
                if (resolveImmediately) return Promise.resolve();
                this._hasRested = false;
                this.dispatchEvent({
                    type: 'transitionstart'
                });
                return new Promise(function(resolve) {
                    var onResolve = function onResolve() {
                        _this2.removeEventListener('rest', onResolve);
                        resolve();
                    };
                    _this2.addEventListener('rest', onResolve);
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
        key: "_addAllEventListeners",
        value: function _addAllEventListeners(_domElement) {}
    }, {
        key: "_removeAllEventListeners",
        value: function _removeAllEventListeners() {}
    }], [{
        key: "install",
        value:
        /**
         * Injects THREE as the dependency. You can then proceed to use CameraControls.
         *
         * e.g
         * ```javascript
         * CameraControls.install( { THREE: THREE } );
         * ```
         *
         * Note: If you do not wish to use enter three.js to reduce file size(tree-shaking for example), make a subset to install.
         *
         * ```js
         * import {
         * 	Vector2,
         * 	Vector3,
         * 	Vector4,
         * 	Quaternion,
         * 	Matrix4,
         * 	Spherical,
         * 	Box3,
         * 	Sphere,
         * 	Raycaster,
         * 	MathUtils,
         * } from 'three';
         *
         * const subsetOfTHREE = {
         * 	Vector2   : Vector2,
         * 	Vector3   : Vector3,
         * 	Vector4   : Vector4,
         * 	Quaternion: Quaternion,
         * 	Matrix4   : Matrix4,
         * 	Spherical : Spherical,
         * 	Box3      : Box3,
         * 	Sphere    : Sphere,
         * 	Raycaster : Raycaster,
         * 	MathUtils : {
         * 		DEG2RAD: MathUtils.DEG2RAD,
         * 		clamp: MathUtils.clamp,
         * 	},
         * };
         * CameraControls.install( { THREE: subsetOfTHREE } );
         * ```
         * @category Statics
         */
            function install(libs) {
                THREE = libs.THREE;
                _ORIGIN = Object.freeze(new THREE.Vector3(0, 0, 0));
                _AXIS_Y = Object.freeze(new THREE.Vector3(0, 1, 0));
                _AXIS_Z = Object.freeze(new THREE.Vector3(0, 0, 1));
                _v2 = new THREE.Vector2();
                _v3A = new THREE.Vector3();
                _v3B = new THREE.Vector3();
                _v3C = new THREE.Vector3();
                _xColumn = new THREE.Vector3();
                _yColumn = new THREE.Vector3();
                _zColumn = new THREE.Vector3();
                _deltaTarget = new THREE.Vector3();
                _deltaOffset = new THREE.Vector3();
                _sphericalA = new THREE.Spherical();
                _sphericalB = new THREE.Spherical();
                _box3A = new THREE.Box3();
                _box3B = new THREE.Box3();
                _sphere = new THREE.Sphere();
                _quaternionA = new THREE.Quaternion();
                _quaternionB = new THREE.Quaternion();
                _rotationMatrix = new THREE.Matrix4();
                _raycaster = new THREE.Raycaster();
            }
            /**
             * list all ACTIONs
             * @category Statics
             */
    }, {
        key: "ACTION",
        get: function get() {
            return ACTION;
        }
    }]);
    return CameraControls;
}(EventDispatcher);

function createBoundingSphere(object3d, out) {
    var boundingSphere = out;
    var center = boundingSphere.center;
    _box3A.makeEmpty();
    // find the center
    object3d.traverseVisible(function(object) {
        if (!object.isMesh) return;
        _box3A.expandByObject(object);
    });
    _box3A.getCenter(center);
    // find the radius
    var maxRadiusSq = 0;
    object3d.traverseVisible(function(object) {
        if (!object.isMesh) return;
        var mesh = object;
        var geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld);
        if (geometry.isBufferGeometry) {
            var bufferGeometry = geometry;
            var position = bufferGeometry.attributes.position;
            for (var i = 0, l = position.count; i < l; i++) {
                _v3A.fromBufferAttribute(position, i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_v3A));
            }
        } else {
            // for old three.js, which supports both BufferGeometry and Geometry
            // this condition block will be removed in the near future.
            var _position = geometry.attributes.position;
            var vector = new THREE.Vector3();
            for (var _i = 0, _l = _position.count; _i < _l; _i++) {
                vector.fromBufferAttribute(_position, _i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
            }
        }
    });
    boundingSphere.radius = Math.sqrt(maxRadiusSq);
    return boundingSphere;
}