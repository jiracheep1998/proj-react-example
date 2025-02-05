
var hammer, handler, toolHandlerArray = [], selector, selectorEventHandle = null, selectorHandle = null;

var svgModifyPath = 1;
var xDraggable = null;

var selectorDom = [];
var selectorData = {};
var object = [];
var svgElementCount = 1;

var metaSelector = [];

var cacheState = {};

var SCALE = 1;

var base;

const obs = subjx.createObservable();

const methods = {
    onInit() {
        for (let i in object) {
            object[i]['parentNode'] = object[i].el.parentNode.getAttribute('id') === 'svgcontent' ? base.createSVGMatrix() : object[i].el.parentNode.getCTM();
            object[i]['transform'] = object[i].el.getCTM();
        }
    },
    onMove() {
        base.calcMatrix();
    },
    onResize() {
        base.calcMatrix();
    },
    onRotate() {
        base.calcMatrix();
    },
    onDrop() {

    },
    onDestroy() {

    },
};

const svgParameters = {
    container: "#svgroot",
    proportions: false,
    // draggable: false,
    // resizable: false,
    // rotatable: false,
    each: {
        resize: true,
        move: true,
        rotate: true,
    },
    snap: {
        x: 1,
        y: 1,
        angle: 1,
    },
    ...methods,
};

//--------------------------------------------------------//
//----------------------EventEmitter----------------------//
//--------------------------------------------------------//

class EvenHandler {
    constructor(svgRoot) {
        this.svgroot = svgRoot;
        this.eventListeners = [];
    }

    addEventListener(event, handler) {
        this.svgroot.addEventListener(event, handler);
        this.eventListeners.push({ event, handler });
    }

    removeAllEventListeners() {
        this.eventListeners.forEach(({ event, handler }) => {
            this.svgroot.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    emit(event, ...args) {
        if (!this.events[event]) return this;

        this.events[event].forEach(listener => listener.apply(this, args));
        return this;
    }

    distroy() {
        let keys = Object.keys(this.events);
        for (let i in keys) {
            delete this.events[keys[i]];
        }

        if (hammer) {
            hammer.destroy();
        }

        if (handler) {
            handler.removeAllEventListeners();
        }
    }
}

class Base {

    constructor(dom, panzoom, svgroot, draw, svgcontent){
        this.dom = dom;
        this.panzoom = panzoom;
        this.svgroot = svgroot;
        this.draw = draw;
        this.content = svgcontent;
    }

    getMousePosition = (evt) => {
        const CTM = this.svgroot.getScreenCTM();

        let x = this.calc('x', (evt.clientX - CTM.e) / CTM.a);
        let y = this.calc('y', (evt.clientY - CTM.f) / CTM.d);

        return {
            x: x,
            y: y
        };
    }

    getTouchPosition = (evt) => {
        const CTM = this.svgroot.getScreenCTM();
        const touch = evt.center;

        let x = this.calc('x', (touch.x - CTM.e) / CTM.a);
        let y = this.calc('y', (touch.y - CTM.f) / CTM.d);

        return {
            x: x,
            y: y
        };
    }

    calc = (type, num) => {

        var matrix = this.draw.parentNode.getScreenCTM().inverse().multiply(this.draw.getScreenCTM());

        let n = null;

        if (type === 'x') {
            n = (num - matrix.e) / matrix.a;
        }

        if (type === 'y') {
            n = (num - matrix.f) / matrix.a;
        }

        return n;
    }

    calcScale = (num) => {
        return num / SCALE;
    }

    createSVGElement = (name) => {
        var element = document.createElementNS("http://www.w3.org/2000/svg", name);
        return element;
    }

    createSVGMatrix = () => {
        return this.createSVGElement("svg").createSVGMatrix();
    }

    matrixToString = (m) => {
        var a = m.a,
            b = m.b,
            c = m.c,
            d = m.d,
            e = m.e,
            f = m.f;
        return "matrix(".concat(a, ",").concat(b, ",").concat(c, ",").concat(d, ",").concat(e, ",").concat(f, ")");
    }

    calcMatrix = () => {
        let screenCTM = document.getElementById('boxSelected').firstElementChild.getCTM();
        for (let i in object) {
            let newMatrix = object[i]['parentNode'].inverse().multiply(screenCTM).multiply(object[i]['transform']);
            object[i].el.setAttribute('transform', base.matrixToString(newMatrix));
        }
    }
}

//--------------------------------------------------------//
//----------------------Selector--------------------------//
//--------------------------------------------------------//

class Selector extends EventEmitter {

    element = null;
    groupSelector = null;

    dragSelector = null;
    draggable = null;
    selector = null;

    handleState = true;

    constructor(el) {

        super();

        this.lib.selectionSetupGlobal();

        if (el) {
            this.element = el;
        }

        this.lib.undraft();

        this.handle();
    }

    handle = () => {

        if (!this.selectorEventHandle) {

            let _this = this;

            this.distroy();

            this.selectorEventHandle = true;

            hammer = new Hammer(base.svgroot);

            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 5 });
            hammer.get('press').set({ time: 0 });

            hammer.on('press', (evt) => this.emit('press', evt));
            hammer.on('tap pressup', (evt) => this.emit('tap', evt));
            hammer.on('panstart', (evt) => this.emit('panstart', evt));
            hammer.on('panmove', (evt) => this.emit('panmove', evt));
            hammer.on('panend', (evt) => this.emit('panend', evt));

            this.on('press', (e) => {
                _this.handleState = true;

                let find_draft = _this.lib.findParentWithSelector(e.target, '#draft');
                let find_sjx_controls = _this.lib.findParentWithSelector(e.target, '.sjx-svg-controls');

                if (find_draft || find_sjx_controls) {
                    _this.handleState = false;
                }
            });

            this.on('tap', (e) => {

                if (_this.handleState) {

                    if (e.target) {

                        this.lib.undraft();

                        let id = e.target.getAttribute('id');

                        if (id != 'svgroot') {
                            this.element = e.target;
                            this.guide();
                        }
                    }

                }

            });

            let startX, startY, axis;

            this.on('panstart', (e) => {

                if (_this.handleState) {

                    _this.lib.undraft();

                    let pos = base.getTouchPosition(e);

                    startX = pos.x;
                    startY = pos.y;

                    this.dragSelector = base.content.cloneNode(true);
                    this.dragSelector.innerHTML = '';
                    this.dragSelector.setAttribute('id', 'dragSelector');

                    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    // g.setAttribute('transform', base.content.getAttribute('transform'));

                    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', pos.x);
                    rect.setAttribute('y', pos.y);
                    rect.setAttribute('width', 0);
                    rect.setAttribute('height', 0);
                    rect.setAttribute('fill', 'none');
                    rect.setAttribute('stroke', '#4F80FF');
                    rect.setAttribute('stroke-width', base.calcScale(1));
                    rect.setAttribute('shape-rendering', 'crispEdges');

                    g.appendChild(rect);

                    this.draggable = rect;

                    this.dragSelector.appendChild(g);

                    base.content.appendChild(this.dragSelector);
                }

            })

            this.on('panmove', (e) => {

                if (_this.handleState) {

                    if (!this.draggable) return;

                    let pos = base.getTouchPosition(e);

                    const width = Math.abs(pos.x - startX);
                    const height = Math.abs(pos.y - startY);

                    let x = startX, y = startY;

                    if (width > 0 || height > 0) {

                        this.draggable.setAttribute('width', width);
                        this.draggable.setAttribute('height', height);

                        if (pos.x < startX) {
                            this.draggable.setAttribute('x', pos.x);
                            x = pos.x;
                        }

                        if (pos.y < startY) {
                            this.draggable.setAttribute('y', pos.y);
                            y = pos.y
                        }

                        let bounding = this.draggable.getBoundingClientRect();

                        axis = {
                            left: bounding.left,
                            top: bounding.top,
                            right: bounding.right,
                            bottom: bounding.bottom
                        }

                    } else {
                        this.draggable.remove();
                        this.draggable = null;
                    }
                }
            })

            this.on('panend', (e) => {

                if (_this.handleState) {

                    let key = Object.keys(selectorData);

                    object = [];

                    let border = {
                        top: [],
                        left: [],
                        right: [],
                        bottom: []
                    };

                    for (let i in key) {
                        let k = selectorData[key[i]];

                        k.update(k.el, k.dom);

                        if (axis) {
                            if (k.axis.top >= axis.top && k.axis.bottom <= axis.bottom && k.axis.left >= axis.left && k.axis.right <= axis.right) {
                                object[key[i]] = k;

                                border.top.push(k.axis.top);
                                border.left.push(k.axis.left);
                                border.right.push(k.axis.right);
                                border.bottom.push(k.axis.bottom);
                            }
                        }
                    }

                    object = Object.assign({}, object);

                    for (let i in object) {

                        let layers = object[i].layer.split('-');
                        let n = [];
                        let currentLayer = '';

                        for (let i = 0; i < layers.length; i++) {
                            currentLayer += layers[i];
                            n.push(currentLayer);
                            if (i < layers.length - 1) {
                                currentLayer += '-';
                            }
                        }

                        for (let p = 0; p < n.length; p++) {
                            let key = cacheState.nodesById[n[p]].key;
                            if (i != key) {
                                if (object[key]) {
                                    delete object[i];
                                }
                            }
                        }
                    }

                    for (let i in object) {
                        if (object[i].width == 0 && object[i].height == 0) {
                            delete object[i];
                        } else if (object[i].use) {
                            delete object[object[i].use];
                        } else if (object[i].gUse.length > 0) {
                            delete object[i];
                        }
                    }

                    if (Object.keys(object).length > 0) {
                        _this.lib.draft({
                            top: Math.min(...border.top),
                            left: Math.min(...border.left),
                            right: Math.max(...border.right),
                            bottom: Math.max(...border.bottom)
                        });
                    }


                    try {
                        base.content.removeChild(this.groupSelector);
                    } catch { }

                    if (this.dragSelector) {
                        this.dragSelector.remove();
                        this.dragSelector = null;
                    }

                }

            })
        }
    }

    guide = () => {

        if (this.element) {

            let data;

            if (data = selectorDom.get(this.element)) {

                let id = this.element.tagName + '#' + data.svgid;

                object = [];
                object[id] = selectorData[id];

                let key = Object.keys(object);

                if (key.length > 0) {

                    let j = object[key[0]].el.getBoundingClientRect();

                    this.lib.draft({
                        top: j.top,
                        left: j.left,
                        right: j.right,
                        bottom: j.bottom
                    });

                }

            }

        }
    }

    getSelector = () => {
        if (this.element) {

            let _this = this;

            let bbox = this.element.getBBox();

            this.selector = this.svgcontent.cloneNode(true);
            this.selector.innerHTML = '';
            this.selector.setAttribute('id', 'selector');
            this.selector.setAttribute('pointer-events', 'all');

            let groupSelector = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            groupSelector.setAttribute('id', 'group-selector');
            // groupSelector.setAttribute('pointer-events', 'none');
            groupSelector.setAttribute('transform', this.content.getAttribute('transform'));

            this.selector.appendChild(groupSelector);

            let num = 8;

            let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', bbox.x);
            rect.setAttribute('y', bbox.y);
            rect.setAttribute('width', bbox.width);
            rect.setAttribute('height', bbox.height);
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', '#4F80FF');
            rect.setAttribute('stroke-width', this.calcScale(1));
            rect.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(rect);

            let node_lt = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_lt.setAttribute('id', 'node_lt');
            node_lt.setAttribute('x', bbox.x - (this.calcScale(num / 2)));
            node_lt.setAttribute('y', bbox.y - (this.calcScale(num / 2)));
            node_lt.setAttribute('width', this.calcScale(num));
            node_lt.setAttribute('height', this.calcScale(num));
            node_lt.setAttribute('fill', '#fff');
            node_lt.setAttribute('stroke', '#4F80FF');
            node_lt.setAttribute('stroke-width', this.calcScale(1));
            node_lt.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_lt);

            let node_lc = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_lc.setAttribute('id', 'node_lc');
            node_lc.setAttribute('x', bbox.x - (this.calcScale(num / 2)));
            node_lc.setAttribute('y', bbox.y - (this.calcScale(num / 2)) + (bbox.height / 2));
            node_lc.setAttribute('width', this.calcScale(num));
            node_lc.setAttribute('height', this.calcScale(num));
            node_lc.setAttribute('fill', '#fff');
            node_lc.setAttribute('stroke', '#4F80FF');
            node_lc.setAttribute('stroke-width', this.calcScale(1));
            node_lc.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_lc);

            let node_lb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_lb.setAttribute('id', 'node_lb');
            node_lb.setAttribute('x', bbox.x - (this.calcScale(num / 2)));
            node_lb.setAttribute('y', bbox.y - (this.calcScale(num / 2)) + (bbox.height));
            node_lb.setAttribute('width', this.calcScale(num));
            node_lb.setAttribute('height', this.calcScale(num));
            node_lb.setAttribute('fill', '#fff');
            node_lb.setAttribute('stroke', '#4F80FF');
            node_lb.setAttribute('stroke-width', this.calcScale(1));
            node_lb.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_lb);

            let node_ct = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_ct.setAttribute('id', 'node_ct');
            node_ct.setAttribute('x', bbox.x - (this.calcScale(num / 2)) + (bbox.width / 2));
            node_ct.setAttribute('y', bbox.y - (this.calcScale(num / 2)));
            node_ct.setAttribute('width', this.calcScale(num));
            node_ct.setAttribute('height', this.calcScale(num));
            node_ct.setAttribute('fill', '#fff');
            node_ct.setAttribute('stroke', '#4F80FF');
            node_ct.setAttribute('stroke-width', this.calcScale(1));
            node_ct.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_ct);

            let node_cb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_cb.setAttribute('id', 'node_cb');
            node_cb.setAttribute('x', bbox.x - (this.calcScale(num / 2)) + (bbox.width / 2));
            node_cb.setAttribute('y', bbox.y - (this.calcScale(num / 2)) + (bbox.height));
            node_cb.setAttribute('width', this.calcScale(num));
            node_cb.setAttribute('height', this.calcScale(num));
            node_cb.setAttribute('fill', '#fff');
            node_cb.setAttribute('stroke', '#4F80FF');
            node_cb.setAttribute('stroke-width', this.calcScale(1));
            node_cb.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_cb);

            let node_rt = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_rt.setAttribute('id', 'node_rt');
            node_rt.setAttribute('x', bbox.x - (this.calcScale(num / 2)) + (bbox.width));
            node_rt.setAttribute('y', bbox.y - (this.calcScale(num / 2)));
            node_rt.setAttribute('width', this.calcScale(num));
            node_rt.setAttribute('height', this.calcScale(num));
            node_rt.setAttribute('fill', '#fff');
            node_rt.setAttribute('stroke', '#4F80FF');
            node_rt.setAttribute('stroke-width', this.calcScale(1));
            node_rt.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_rt);

            let node_rc = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_rc.setAttribute('id', 'node_rc');
            node_rc.setAttribute('x', bbox.x - (this.calcScale(num / 2)) + (bbox.width));
            node_rc.setAttribute('y', bbox.y - (this.calcScale(num / 2)) + (bbox.height / 2));
            node_rc.setAttribute('width', this.calcScale(num));
            node_rc.setAttribute('height', this.calcScale(num));
            node_rc.setAttribute('fill', '#fff');
            node_rc.setAttribute('stroke', '#4F80FF');
            node_rc.setAttribute('stroke-width', this.calcScale(1));
            node_rc.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_rc);

            let node_rb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node_rb.setAttribute('id', 'node_rb');
            node_rb.setAttribute('x', bbox.x - (this.calcScale(num / 2)) + (bbox.width));
            node_rb.setAttribute('y', bbox.y - (this.calcScale(num / 2)) + (bbox.height));
            node_rb.setAttribute('width', this.calcScale(num));
            node_rb.setAttribute('height', this.calcScale(num));
            node_rb.setAttribute('fill', '#fff');
            node_rb.setAttribute('stroke', '#4F80FF');
            node_rb.setAttribute('stroke-width', this.calcScale(1));
            node_rb.setAttribute('shape-rendering', 'crispEdges');
            groupSelector.appendChild(node_rb);

            this.groupRoot.appendChild(this.selector);

            // this.selectorHandle = {};

            // this.addEventHandle(node_lt);
            // this.addEventHandle(node_lc);
            // this.addEventHandle(node_lb);
            // this.addEventHandle(node_ct);
            // this.addEventHandle(node_cb);
            // this.addEventHandle(node_rt);
            // this.addEventHandle(node_rc);
            // this.addEventHandle(node_rb);

            // this.on('node_lc-panstart', (e) => {
            //     _this.handleState = false;

            //     startX = _x;

            // });

            // this.on('node_lc-panmove', (e) => {

            // });

            // this.on('node_lc-panend', (e) => {
            //     _this.handleState = true;
            //     console.log('node_lc-panend')


            // });

        }
    }

    addEventHandle = (node) => {
        let id = node.getAttribute('id');
        this.selectorHandle[id] = new Hammer(node);
        this.selectorHandle[id].get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 5 });
        this.selectorHandle[id].on('panstart', (evt) => this.emit(id + '-panstart', evt));
        this.selectorHandle[id].on('panmove', (evt) => this.emit(id + '-panmove', evt));
        this.selectorHandle[id].on('panend', (evt) => this.emit(id + '-panend', evt));
    }

    lib = {
        selectionSetupGlobal: () => {

            let _this = this;

            const before = Date.now();

            selectorDom = new WeakMap();
            selectorData = {};
            object = [];
            svgElementCount = 0;

            let tags = {
                rect: 1,
                circle: 1,
                ellipse: 1,
                line: 1,
                polyline: 1,
                path: 1,
                text: 1,
                tspan: 1,
                g: 1,
                image: 1,
                use: 1
            }

            console.log(base)

            let root = base.content;

            let svgTags = root.querySelectorAll('*');

            for (let i = 0; i < svgTags.length; i++) {
                if (tags[svgTags[i].tagName]) {
                    _this.lib.setSvgid(svgTags[i]);
                }
            }

            this.lib.setLayer(root.children, function (tree, object) {

                for (let i = 0; i < svgTags.length; i++) {
                    if (tags[svgTags[i].tagName]) {
                        _this.lib.setSize(svgTags[i]);
                    }
                }

                const after = Date.now();
                console.log('cache load ok executed in', (after - before) / 1000);
            });
        },
        randomID: (length) => {
            var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = "";
            for (var i = 0; i < length; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            return result;
        },
        setSvgid: (el) => {
            let c = '_' + this.lib.randomID(4) + '-' + svgElementCount++;
            selectorDom.set(el, {
                svgid: c
            });
        },
        setLayer: (data, callback) => {

            let _this = this;

            let tree = [];
            let nodesById = {};

            function buildTree(node, parent) {
                for (let i = 0; i < node.length; i++) {
                    // if (node[i].children && node[i].children.length > 0) {
                    if (parent) {

                        let get = selectorDom.get(node[i])

                        let info = {
                            key: node[i].tagName + '#' + (get ? get.svgid : null),
                            id: String(i),
                            text: node[i].tagName,
                            children: children(node[i].children, i),
                        }

                        if (get) {
                            selectorDom.set(node[i], {
                                svgid: get.svgid,
                                layer: String(i)
                            });
                        }

                        parent.push(info);
                        nodesById[String(i)] = info;
                        buildTree(node[i].children, parent.children);
                    }
                    // }
                }
            }

            function children(child, t) {
                let q = [];
                for (let r = 0; r < child.length; r++) {
                    let p = t + '-' + r;

                    let get = selectorDom.get(child[r]);

                    let info = {
                        key: child[r].tagName + '#' + (get ? get.svgid : null),
                        id: p,
                        text: child[r].tagName,
                        children: children(child[r].children, p),
                    }

                    if (get) {
                        selectorDom.set(child[r], {
                            svgid: get.svgid,
                            layer: p
                        });
                    }

                    q.push(info);
                    nodesById[p] = info;
                }

                return q;
            }

            buildTree(data, tree);

            cacheState['tree'] = tree;
            cacheState['nodesById'] = nodesById;

            callback(tree, nodesById);

        },

        setSize: (el) => {

            let a = el;
            let svgid = selectorDom.get(a).svgid;
            let size = a.getBBox();

            let tl = {
                x: size.x,
                y: size.y
            };

            let tr = {
                x: size.x + size.width,
                y: size.y + size.height
            };

            let bl = {
                x: size.x,
                y: size.y + size.height
            };

            let br = {
                x: size.x + size.width,
                y: size.y + size.height
            };

            let top = Math.min(tl.y, br.y);
            let left = Math.min(tl.x, tr.x);
            let right = Math.max(tl.x, tr.x);
            let bottom = Math.max(tl.y, br.y);

            let key = a.tagName + '#' + svgid;
            let use = false;

            if (a.tagName == 'use' && a.href && a.href.baseVal) {
                try {
                    let el = document.querySelector(a.href.baseVal);
                    use = el.tagName + '#' + svgid;
                } catch { }
            }

            selectorData[key] = {
                index: svgid,
                dom: key,
                el: a,
                layer: selectorDom.get(a).layer,
                use: use,
                gUse: (this.lib.getParentDef(a) ? [a.parentNode] : []),
                axis: {
                    top: top,
                    left: left,
                    right: right,
                    bottom: bottom
                },
                update: this.lib.setAsix,
                width: size.width,
                height: size.height
            };
        },

        getParentDef: (element) => {

            let state = false;

            parent(element);

            function parent(element) {
                if (element.tagName != 'defs') {

                    if (element.parentNode) {
                        parent(element.parentNode);
                    }

                } else {
                    state = true;
                }
            }

            return state;
        },

        setAsix: (a, key) => {

            let bounding = a.getBoundingClientRect()

            selectorData[key]['axis']['top'] = bounding.top;
            selectorData[key]['axis']['left'] = bounding.left;
            selectorData[key]['axis']['right'] = bounding.right;
            selectorData[key]['axis']['bottom'] = bounding.bottom;
        },

        getTransformToParent: (element, parent) => {
            try {
                let toElement = element;
                let g = parent;
                var gTransform = (g.getScreenCTM && g.getScreenCTM()) || this.lib.createSVGMatrix();
                return gTransform.inverse().multiply(toElement.getScreenCTM() || this.lib.createSVGMatrix());
            } catch {
                return this.lib.createSVGMatrix();
            }
        },

        getParent: (element) => {

            let _this = this;

            let node = [];

            let El = {};

            parent(element.parentNode);

            function parent(element) {
                if (element.getAttribute('id') && element.getAttribute('id') != 'groupContent' || !element.getAttribute('id')) {

                    let get = selectorDom.get(element);

                    if (get) {

                        let svgid = get.svgid;

                        if (!El[svgid]) {
                            let clone = element.cloneNode();
                            clone.setAttribute('svgid', svgid);
                            El[svgid] = clone;
                        }

                        node.unshift(El[svgid]);
                        if (element.parentNode) {
                            parent(element.parentNode);
                        }
                    }
                }
            }

            return node;
        },

        findParentWithSelector: (element, selector) => {
            // เริ่มต้นจาก element ที่ต้องการ
            var currentElement = element;

            // ไล่ขึ้นไปใน DOM tree จนกว่าจะพบ parent ที่มี id หรือ class ที่ต้องการ
            while (currentElement) {
                if (selector.startsWith('#') && currentElement.id === selector.substring(1)) {
                    return currentElement; // พบ parent ที่มี id ตรงกัน
                }
                if (selector.startsWith('.') && currentElement.classList && currentElement.classList.contains(selector.substring(1))) {
                    return currentElement; // พบ parent ที่มี class ตรงกัน
                }
                currentElement = currentElement.parentNode; // ไปยัง parent
            }

            return null; // ไม่พบ
        },

        createSVGElement: (name) => {
            var element = document.createElementNS("http://www.w3.org/2000/svg", name);
            return element;
        },

        createSVGMatrix: () => {
            return this.lib.createSVGElement("svg").createSVGMatrix();
        },

        getSize: (element) => {

            let rect = element.getBoundingClientRect();
            let center = {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
            }

            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                center: center
            }

        },

        matrixToString: (m) => {
            var a = m.a,
                b = m.b,
                c = m.c,
                d = m.d,
                e = m.e,
                f = m.f;
            return "matrix(".concat(a, ",").concat(b, ",").concat(c, ",").concat(d, ",").concat(e, ",").concat(f, ")");
        },

        draft: (selector) => {

            let svgcontentClone = base.content.cloneNode(true);
            svgcontentClone.innerHTML = '';
            svgcontentClone.setAttribute('id', 'draft')
            svgcontentClone.setAttribute('pointer-events', 'all');

            let boxSelected = document.createElementNS("http://www.w3.org/2000/svg", "g");

            boxSelected.setAttribute('id', 'boxSelected');
            boxSelected.setAttribute('pointer-events', 'bounding-box');

            svgcontentClone.appendChild(boxSelected);

            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            let evt1 = {
                clientX: selector.left,
                clientY: selector.top
            }

            let evt2 = {
                clientX: selector.right,
                clientY: selector.bottom
            }

            let pos1 = base.getMousePosition(evt1);
            let pos2 = base.getMousePosition(evt2);

            rect.setAttribute('x', pos1.x);
            rect.setAttribute('y', pos1.y);
            rect.setAttribute('width', pos2.x - pos1.x);
            rect.setAttribute('height', pos2.y - pos1.y);
            rect.setAttribute('fill', 'none');

            boxSelected.appendChild(rect);

            base.content.insertAdjacentElement('afterend', svgcontentClone);

            xDraggable = subjx(document.querySelectorAll('#boxSelected')).drag(svgParameters, obs);

        },

        _draft: () => {

            let counts = Object.keys(object);

            if (counts.length > 0) {

                let El = {};
                let Dom = {};

                metaSelector = [];

                base.content.setAttribute('pointer-events', 'none');

                let svgcontentClone = base.content.cloneNode(true);
                svgcontentClone.innerHTML = '';
                svgcontentClone.setAttribute('id', 'draft')
                svgcontentClone.setAttribute('pointer-events', 'all');

                let boxSelected = document.createElementNS("http://www.w3.org/2000/svg", "g");

                boxSelected.setAttribute('id', 'boxSelected');
                boxSelected.setAttribute('pointer-events', 'bounding-box');
                // boxSelected.setAttribute('transform', base.content.getAttribute('transform'));

                svgcontentClone.appendChild(boxSelected);

                let layer = false;

                for (let i in object) {
                    if (!layer) {
                        layer = i;
                    }

                    let svgid = selectorDom.get(object[i].el).svgid;

                    if (!object[i].el.getAttribute('id')) {
                        object[i].el.setAttribute('id', svgid);
                    }

                    let clone;

                    clone = object[i].el.cloneNode(true);
                    let elementClone = object[i].el.cloneNode(true);

                    clone.setAttribute('id', svgid);

                    object[i].el.parentElement.insertBefore(clone, object[i].el);

                    let parentMatrix = this.lib.getTransformToParent(object[i].el.parentNode, this.svgroot);
                    parentMatrix = parentMatrix.inverse();

                    parentMatrix.e = 0;
                    parentMatrix.f = 0;

                    let elMatrix = this.lib.getTransformToParent(object[i].el, object[i].el.parentNode);

                    let size = this.lib.getSize(object[i].el);

                    metaSelector.push([object[i].el, clone, elementClone, elMatrix, parentMatrix, size, object[i].el.getBBox()]);

                    let node = this.lib.getParent(object[i].el);

                    if (node.length > 0) {

                        for (let r in node) {
                            let a = node[r];

                            if (!El[a.getAttribute('svgid')]) {
                                El[a.getAttribute('svgid')] = a;
                                a = El[a.getAttribute('svgid')];
                            } else {
                                a = El[a.getAttribute('svgid')];
                            }


                            let b;
                            if (b = node[Number(r) + 1]) {

                                if (!El[b.getAttribute('svgid')]) {
                                    El[b.getAttribute('svgid')] = b;
                                    b = El[b.getAttribute('svgid')];
                                } else {
                                    b = El[b.getAttribute('svgid')];
                                }

                                a.appendChild(b);
                            }
                        }

                        let c = node[node.length - 1];

                        if (!El[c.getAttribute('svgid')]) {
                            El[c.getAttribute('svgid')] = c;
                            c = El[c.getAttribute('svgid')];
                        } else {
                            c = El[c.getAttribute('svgid')];
                        }

                        c.appendChild(elementClone);

                        let d = node[0];

                        if (!El[d.getAttribute('svgid')]) {
                            El[d.getAttribute('svgid')] = d;
                            d = El[d.getAttribute('svgid')];
                        } else {
                            d = El[d.getAttribute('svgid')];
                        }

                        if (!Dom[d.getAttribute('svgid')]) {
                            Dom[d.getAttribute('svgid')] = d;
                        }

                    } else {
                        if (!Dom[svgid]) {
                            Dom[svgid] = elementClone;
                        }
                    }

                    let def = this.lib.createSVGElement('defs');
                    def.setAttribute('class', 'df');

                    object[i].el.parentElement.insertBefore(def, object[i].el);

                    def.append(clone);

                    object[i].el.style.visibility = 'hidden';
                }

                base.content.insertAdjacentElement('afterend', svgcontentClone);

                for (let i in Dom) {
                    boxSelected.appendChild(Dom[i]);
                }

                if (counts.length > 0) {
                    // this.distroy();
                    xDraggable = subjx(document.querySelectorAll('#boxSelected')).drag(svgParameters, obs);
                    // this.handleState = false;
                }

                return boxSelected;

            }
        },

        undraft: () => {

            for (let i in metaSelector) {

                // let main = metaSelector[i][0];
                // let clone = metaSelector[i][1];
                // let draft = metaSelector[i][2];

                // if (clone.parentNode) {
                //     clone.parentNode.remove();
                // }

                // main.style.removeProperty('visibility');

                // let screenCTM = draft.getScreenCTM()
                // let parentNode = main.parentNode;
                // let gTransform = (parentNode.getScreenCTM && parentNode.getScreenCTM()) || createSVGMatrix();
                // let newMatrix = gTransform.inverse().multiply(screenCTM || createSVGMatrix());
                // main.setAttribute('transform', this.lib.matrixToString(newMatrix));

                // switch (draft.tagName) {
                //     case 'g':
                //         let arrMain = main.querySelectorAll('*');
                //         let arrDraft = draft.querySelectorAll('*');
                //         for (let t = 0; t < arrDraft.length; t++) {
                //             switch (arrDraft[t].tagName) {
                //                 case 'g':
                //                 case 'text':
                //                 case 'tspan':
                //                 case 'use':
                //                     if (arrDraft[t].getAttribute('transform')) {
                //                         arrMain[t].setAttribute('transform', arrDraft[t].getAttribute('transform'));
                //                     }
                //                     break;
                //                 case 'foreignobject':
                //                 case 'image':
                //                 case 'rect':
                //                     arrMain[t].setAttribute('x', arrDraft[t].getAttribute('x'));
                //                     arrMain[t].setAttribute('y', arrDraft[t].getAttribute('y'));
                //                     arrMain[t].setAttribute('width', arrDraft[t].getAttribute('width'));
                //                     arrMain[t].setAttribute('height', arrDraft[t].getAttribute('height'));
                //                     break;
                //                 case 'circle':
                //                     arrMain[t].setAttribute('cx', arrDraft[t].getAttribute('cx'));
                //                     arrMain[t].setAttribute('cy', arrDraft[t].getAttribute('cy'));
                //                     arrMain[t].setAttribute('r', arrDraft[t].getAttribute('r'));
                //                     break;
                //                 case 'line':
                //                     arrMain[t].setAttribute('x1', arrDraft[t].getAttribute('x1'));
                //                     arrMain[t].setAttribute('y1', arrDraft[t].getAttribute('y1'));
                //                     arrMain[t].setAttribute('x2', arrDraft[t].getAttribute('x2'));
                //                     arrMain[t].setAttribute('y2', arrDraft[t].getAttribute('y2'));
                //                     break;
                //                 case 'path':
                //                     if (svgModifyPath) {

                //                         if (arrDraft[t].getAttribute('transform')) {
                //                             arrMain[t].setAttribute('transform', arrDraft[t].getAttribute('transform'));
                //                         }

                //                     } else {
                //                         arrMain[t].setAttribute('d', arrDraft[t].getAttribute('d'));
                //                     }
                //                     break;
                //                 case 'ellipse':
                //                     arrMain[t].setAttribute('rx', arrDraft[t].getAttribute('rx'));
                //                     arrMain[t].setAttribute('ry', arrDraft[t].getAttribute('ry'));
                //                     arrMain[t].setAttribute('cx', arrDraft[t].getAttribute('cx'));
                //                     arrMain[t].setAttribute('cy', arrDraft[t].getAttribute('cy'));
                //                     break;
                //                 case 'polygon':
                //                 case 'polyline':
                //                     arrMain[t].setAttribute('points', arrDraft[t].getAttribute('points'));
                //                     break;
                //             }

                //             let stroke;

                //             if (arrDraft[t].getAttribute('stroke-width')) {
                //                 stroke = arrDraft[t].getAttribute('stroke-width');
                //             } else {
                //                 stroke = arrDraft[t].style.strokeWidth;
                //             }

                //             arrMain[t].setAttribute('stroke-width', stroke);

                //         }
                //         break;
                //     case 'foreignobject':
                //     case 'image':
                //     case 'rect':
                //         main.setAttribute('x', draft.getAttribute('x'));
                //         main.setAttribute('y', draft.getAttribute('y'));
                //         main.setAttribute('width', draft.getAttribute('width'));
                //         main.setAttribute('height', draft.getAttribute('height'));
                //         break;
                //     case 'circle':
                //         main.setAttribute('cx', draft.getAttribute('cx'));
                //         main.setAttribute('cy', draft.getAttribute('cy'));
                //         main.setAttribute('r', draft.getAttribute('r'));
                //         break;
                //     case 'line':
                //         main.setAttribute('x1', draft.getAttribute('x1'));
                //         main.setAttribute('y1', draft.getAttribute('y1'));
                //         main.setAttribute('x2', draft.getAttribute('x2'));
                //         main.setAttribute('y2', draft.getAttribute('y2'));
                //         break;
                //     case 'path':
                //         if (svgModifyPath) {

                //             // if (draft.getAttribute('transform')) {
                //             //     main.setAttribute('transform', draft.getAttribute('transform'));
                //             // }

                //         } else {
                //             main.setAttribute('d', draft.getAttribute('d'));
                //         }
                //         break;
                //     case 'ellipse':
                //         main.setAttribute('rx', draft.getAttribute('rx'));
                //         main.setAttribute('ry', draft.getAttribute('ry'));
                //         main.setAttribute('cx', draft.getAttribute('cx'));
                //         main.setAttribute('cy', draft.getAttribute('cy'));
                //         break;
                //     case 'polygon':
                //     case 'polyline':
                //         main.setAttribute('points', draft.getAttribute('points'));
                //         break;
                // }

                // let stroke;

                // if (draft.getAttribute('stroke-width')) {
                //     stroke = draft.getAttribute('stroke-width');
                // } else {
                //     stroke = draft.style.strokeWidth;
                // }

                // main.setAttribute('stroke-width', stroke);

            }

            let key = Object.keys(object);

            for (let i in key) {
                let k = object[key[i]];
                k.update(k.el, k.dom);
            }

            object = [];

            metaSelector = [];

            let boxSelected;

            if (boxSelected = document.getElementById('boxSelected')) {
                boxSelected.parentNode.remove();
            }

            if (this.selector) {
                this.selector.remove();
                this.selector = null;
            }

            // base.content.setAttribute('pointer-events', 'all');

            if (xDraggable) {
                xDraggable.disable();
                xDraggable = null;
            }

        }

    }
}

//--------------------------------------------------------//
//-----------------------Select---------------------------//
//--------------------------------------------------------//

class Select extends EventEmitter {
    constructor() {
        super();
        this.distroy();

        new Selector();
    }
}

//--------------------------------------------------------//
//-----------------------Pencil---------------------------//
//--------------------------------------------------------//

class Pencil extends EventEmitter {

    constructor() {
        super();

        this.distroy();

        hammer = new Hammer(base.svgroot);

        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 10 });

        hammer.on('panstart', (evt) => this.emit('panstart', evt));
        hammer.on('panmove', (evt) => this.emit('panmove', evt));
        hammer.on('panend', (evt) => this.emit('panend', evt));
        hammer.on('pancancel', (evt) => this.emit('pancancel', evt));

        let isDrawing = false;
        let path, d, pathData = [];

        this.on('panstart', (event) => {
            isDrawing = true;
            let pos = base.getTouchPosition(event);
            d = `M ${pos.x} ${pos.y}`;
            pathData.push(['M', pos.x, pos.y]);
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', 'black');
            path.setAttribute('stroke-width', base.calcScale(1));
            path.setAttribute('fill', 'none');
            base.content.appendChild(path);
        });

        this.on('panmove', (event) => {
            if (!isDrawing) return;
            let pos = base.getTouchPosition(event);
            d += ` L ${pos.x} ${pos.y}`;
            pathData.push(['L', pos.x, pos.y]);
            path.setAttribute('d', d);
        });
    }
}

//--------------------------------------------------------//
//------------------------Line----------------------------//
//--------------------------------------------------------//

class Line extends EventEmitter {

    constructor() {
        super();

        this.distroy();

        hammer = new Hammer(base.svgroot);

        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 10 });

        hammer.on('panstart', (evt) => this.emit('panstart', evt));
        hammer.on('panmove', (evt) => this.emit('panmove', evt));
        hammer.on('panend', (evt) => this.emit('panend', evt));
        hammer.on('pancancel', (evt) => this.emit('pancancel', evt));

        let isDrawing = false;
        let line = null;
        let startPoint = { x: 0, y: 0 };

        this.on('panstart', (event) => {
            isDrawing = true;
            startPoint = base.getTouchPosition(event);
            line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startPoint.x);
            line.setAttribute('y1', startPoint.y);
            line.setAttribute('x2', startPoint.x);
            line.setAttribute('y2', startPoint.y);
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', base.calcScale(1));
            base.content.appendChild(line);
        });

        this.on('panmove', (event) => {
            if (!isDrawing) return;
            const endPoint = base.getTouchPosition(event);
            line.setAttribute('x2', endPoint.x);
            line.setAttribute('y2', endPoint.y);
        });

        this.on('panend', () => {
            base.content.appendChild(line);
            isDrawing = false;
            line = null;
        });
    }
}

//--------------------------------------------------------//
//----------------------Ellipse---------------------------//
//--------------------------------------------------------//

class Ellipse extends EventEmitter {

    constructor() {

        super();

        this.distroy();

        hammer = new Hammer(base.svgroot);

        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 10 });

        hammer.on('panstart', (evt) => this.emit('panstart', evt));
        hammer.on('panmove', (evt) => this.emit('panmove', evt));
        hammer.on('panend', (evt) => this.emit('panend', evt));
        hammer.on('pancancel', (evt) => this.emit('pancancel', evt));

        let isDrawing = false,
            ellipse,
            startX,
            startY,
            centerX,
            centerY,
            rx,
            ry;

        this.on('panstart', (e) => {

            let pos = base.getTouchPosition(e);

            startX = pos.x;
            startY = pos.y;

            isDrawing = true;
        });

        this.on('panmove', (e) => {
            if (!isDrawing) return;

            let pos = base.getTouchPosition(e);

            const dx = pos.x - startX;
            const dy = pos.y - startY;

            centerX = startX + dx / 2;
            centerY = startY + dy / 2;

            rx = Math.abs(dx / 2);
            ry = Math.abs(dy / 2);

            if (!ellipse) {
                ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                ellipse.setAttribute('fill', '#fff');
                ellipse.setAttribute('stroke', '#000');
                ellipse.setAttribute('stroke-width', base.calcScale(1));
                base.content.appendChild(ellipse);
            }

            ellipse.setAttribute('cx', centerX);
            ellipse.setAttribute('cy', centerY);
            ellipse.setAttribute('rx', rx);
            ellipse.setAttribute('ry', ry);
        });

        this.on('panend', () => {
            isDrawing = false;

            base.content.appendChild(ellipse);

            ellipse = null;
        });
    }
}

//--------------------------------------------------------//
//-----------------------Rect-----------------------------//
//--------------------------------------------------------//

class Rect extends EventEmitter {

    constructor() {

        super();

        this.distroy();

        hammer = new Hammer(base.svgroot);

        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 10 });

        hammer.on('tap pressup', (evt) => this.emit('tap', evt));
        hammer.on('panstart', (evt) => this.emit('panstart', evt));
        hammer.on('panmove', (evt) => this.emit('panmove', evt));
        hammer.on('panend', (evt) => this.emit('panend', evt));
        hammer.on('pancancel', (evt) => this.emit('pancancel', evt));

        let isDrawing = false,
            rect = null,
            startX = 0,
            startY = 0,
            el;

        this.on('tap', (e) => {
            new Selector(el).guide();
        });

        this.on('panstart', (e) => {

            let pos = base.getTouchPosition(e);

            startX = pos.x;
            startY = pos.y;

            isDrawing = true;

            rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', startX);
            rect.setAttribute('y', startY);
            rect.setAttribute('width', 0);
            rect.setAttribute('height', 0);
            rect.setAttribute('fill', '#fff');
            rect.setAttribute('stroke', '#000');
            rect.setAttribute('stroke-width', base.calcScale(1));
            rect.setAttribute('stroke-dasharray', base.calcScale(4));
            rect.setAttribute('shape-rendering', 'crispEdges');
            base.content.appendChild(rect);
        });

        this.on('panmove', (e) => {

            if (!isDrawing) return;

            let pos = base.getTouchPosition(e);

            const width = Math.abs(pos.x - startX);
            const height = Math.abs(pos.y - startY);

            if (width > 0 || height > 0) {
                rect.setAttribute('width', width);
                rect.setAttribute('height', height);

                if (pos.x < startX) {
                    rect.setAttribute('x', pos.x);
                }

                if (pos.y < startY) {
                    rect.setAttribute('y', pos.y);
                }
            } else {
                rect.remove();
            }
        });

        this.on('panend', () => {

            isDrawing = false;

            if (rect) {
                rect.removeAttribute('stroke-dasharray');
                rect.removeAttribute('shape-rendering');
            }

            base.content.appendChild(rect);

            el = rect;

            rect = null;
        });
    }
}

//--------------------------------------------------------//
//-----------------------Path-----------------------------//
//--------------------------------------------------------//

class Path extends EventEmitter {

    type = 'draw';
    arrayPath = [];
    count = 0;
    points = [];
    path = null;

    guideLine = null;
    guideCircle1 = null;
    guideCircle2 = null;

    guideCurve = null;

    pathData = [];
    isDragging = false;
    isCurve = false;
    startDragPoint = null;
    currentCurveControlPoint1 = null;
    currentCurveControlPoint2 = null;
    currentCurveEndPoint = null;

    currentCurvePoint1 = null;
    currentCurvePoint2 = null;

    nodePoint = null;

    lineGuide = null;

    edit = null;

    pathNodeTap = 0;

    constructor(type) {

        super();

        this.distroy();

        hammer = new Hammer(base.svgroot);

        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });
        hammer.get('press').set({ time: 0 });

        hammer.on('press', (evt) => this.emit('press', evt));
        hammer.on('panmove', (evt) => this.emit('panmove', evt));
        hammer.on('panend', (evt) => this.emit('panend', evt));

        handler = new EvenHandler(base.svgroot);
        handler.addEventListener('mousemove', (evt) => this.emit('mousemove', evt));

        this.on('press', (evt) => {

            if (this.type === 'edit') {

                let target = evt.target;
                let className = target.className.baseVal

                if (className === 'path-node') {

                    this.path_node(target);

                }

                if (className === 'path-curve') {

                    this.path_curve(target);

                }


            }

            if (this.type === 'draw') {

                this.startDragPoint = base.getTouchPosition(evt);
                this.isDragging = true;
                this.isCurve = false;

                if (this.isDragging) {
                    this.isCurve = true;
                    let pos = this.startDragPoint;

                    const snapPoint = this.getSnapPoint(pos);
                    if (snapPoint) {
                        pos = snapPoint;
                        this.startDragPoint = snapPoint;

                        if (snapPoint.x === this.points[this.points.length - 1].x && snapPoint.y === this.points[this.points.length - 1].y) {
                            return;
                        }
                    }

                    if (this.points.length === 0) {
                        this.pathData.push(['M', pos.x, pos.y]);
                        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        this.path.setAttribute('id', 'path-' + this.count);
                        this.path.setAttribute('fill', '#fff');
                        this.path.setAttribute('stroke', 'black');
                        this.path.setAttribute('stroke-width', base.calcScale(1));
                        this.renderPath();
                        base.content.appendChild(this.path);

                        this.currentCurveControlPoint1 = pos;
                        this.currentCurveControlPoint2 = { x: pos.x, y: pos.y };
                        this.currentCurveEndPoint = pos;
                    } else {

                        this.currentCurveControlPoint1 = this.currentCurvePoint1 || this.points[this.points.length - 1];
                        this.currentCurveControlPoint2 = { x: pos.x, y: pos.y };
                        this.currentCurveEndPoint = pos;
                        this.pathData.push(['C', this.currentCurveControlPoint1.x, this.currentCurveControlPoint1.y, this.currentCurveControlPoint2.x, this.currentCurveControlPoint2.y, this.currentCurveEndPoint.x, this.currentCurveEndPoint.y]);
                        this.renderPath();

                        this.currentCurvePoint1 = null;
                        this.currentCurvePoint2 = null;

                        if (snapPoint) {

                            if (snapPoint.x === this.points[0].x && snapPoint.y === this.points[0].y) {

                                const angle = Math.atan2(this.pathData[1][2] - this.points[0].y, this.pathData[1][1] - this.points[0].x);
                                const dist = Math.sqrt(Math.pow(this.points[0].x - this.pathData[1][1], 2) + Math.pow(this.points[0].y - this.pathData[1][2], 2));

                                let x2 = this.points[0].x - dist * Math.cos(angle);
                                let y2 = this.points[0].y - dist * Math.sin(angle);

                                this.pathData[this.pathData.length - 1][3] = x2;
                                this.pathData[this.pathData.length - 1][4] = y2;

                                this.closePath();
                            }

                        }
                    }

                    if (this.pathData.length > 0) {
                        this.points.push(this.startDragPoint);
                        this.createNodePoints(this.startDragPoint.x, this.startDragPoint.y);
                    }

                    this.removeGuide();

                }
            }

        });

        this.on('panend', (evt) => {

            if (this.type === 'edit') {
                this.edit = null;
                this.pathNodeTap = 0;
            }

            if (this.type === 'draw') {

                if (!this.isDragging) return;
                this.isDragging = false;

                let pos = base.getTouchPosition(evt);
                const snapPoint = this.getSnapPoint(pos);

                if (snapPoint) {
                    if (snapPoint.x === this.points[this.points.length - 1].x && snapPoint.y === this.points[this.points.length - 1].y) {
                        return;
                    }
                }

                if (this.isCurve) {

                    if (this.points.length > 1) {
                        if (this.currentCurveEndPoint.x === this.pathData[0][1] && this.currentCurveEndPoint.y === this.pathData[0][2]) {
                            this.closePath();
                        }
                    }

                    return;
                }
            }

        });

        this.on('panmove', (evt) => {

            if (this.type === 'edit') {

                if (this.edit && this.edit.class === 'path-node') {

                    if (this.pathNodeTap > 1) {

                        if (this.edit.guide) {

                            if (this.edit.guide[0] && this.edit.guide[0].getAttribute('fill-opacity')) {

                                let state = false;

                                for (let i = 0; i < this.edit.guide.length; i++) {

                                    if (this.edit.guide[i].getAttribute('fill-opacity') === '0') {
                                        this.edit.guide[i].setAttribute('fill-opacity', 1);
                                        this.edit.guide[i].removeAttribute('pointer-events');
                                    } else {
                                        state = true;
                                    }
                                }

                                if (state) {

                                    let pos = base.getTouchPosition(evt);

                                    let x = pos.x - this.edit.point.x;
                                    let y = pos.y - this.edit.point.y;

                                    let t;

                                    if (x < 0 && y < 0 || x < 0 && y > 0 || x > 0 && y < 0) {
                                        t = 0;
                                    } else {
                                        t = 1;
                                    }

                                    this.path_curve(this.edit.guide[t]);

                                }
                            }
                        }

                    } else {

                        let pos = base.getTouchPosition(evt);

                        for (let i = 0; i < this.edit.data.length; i++) {

                            let sumX = pos.x - this.edit.point.x;
                            let sumY = pos.y - this.edit.point.y;

                            this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].ix] = this.edit.data[i].x + sumX;
                            this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].iy] = this.edit.data[i].y + sumY;

                        }

                        this.editPath(this.edit.id);

                    }
                }

                if (this.edit && this.edit.class === 'path-curve') {

                    let pos = base.getTouchPosition(evt);

                    for (let i = 0; i < this.edit.data.length; i++) {

                        let sumX = pos.x - this.edit.point.x;
                        let sumY = pos.y - this.edit.point.y;

                        let x1 = this.edit.data[i].x + sumX;
                        let y1 = this.edit.data[i].y + sumY;

                        let x2 = this.edit.data[i].x - sumX;
                        let y2 = this.edit.data[i].y - sumY;

                        if (this.edit.type === 0) {

                            if (this.edit.data[i].ix === 1 && this.edit.data[i].iy === 2) {
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].ix] = x1;
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].iy] = y1;
                            }

                            if (this.edit.data[i].ix === 3 && this.edit.data[i].iy === 4) {
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].ix] = x2;
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].iy] = y2;
                            }


                        }

                        if (this.edit.type === 1) {

                            if (this.edit.data[i].ix === 1 && this.edit.data[i].iy === 2) {
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].ix] = x2;
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].iy] = y2;
                            }

                            if (this.edit.data[i].ix === 3 && this.edit.data[i].iy === 4) {
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].ix] = x1;
                                this.arrayPath[this.edit.id].pathData[this.edit.data[i].index][this.edit.data[i].iy] = y1;
                            }

                        }

                    }

                    this.editPath(this.edit.id);

                }

            }

            if (this.type === 'draw') {

                if (this.points[this.points.length - 1]) {

                    let pos = base.getTouchPosition(evt);

                    const angle = Math.atan2(pos.y - this.points[this.points.length - 1].y, pos.x - this.points[this.points.length - 1].x);
                    const dist = Math.sqrt(Math.pow(this.points[this.points.length - 1].x - pos.x, 2) + Math.pow(this.points[this.points.length - 1].y - pos.y, 2));
                    let x1 = this.points[this.points.length - 1].x + dist * Math.cos(angle);
                    let y1 = this.points[this.points.length - 1].y + dist * Math.sin(angle);
                    let x2 = this.points[this.points.length - 1].x - dist * Math.cos(angle);
                    let y2 = this.points[this.points.length - 1].y - dist * Math.sin(angle);

                    this.currentCurvePoint1 = { x: x1, y: y1 };
                    this.currentCurvePoint2 = { x: x2, y: y2 };

                    if (this.points.length > 0 && this.isDragging) {

                        const snapPoint = this.getSnapPoint(pos);
                        if (snapPoint) {
                            pos = snapPoint;
                        }

                        if (this.isCurve) {

                            this.updateGuideLine(pos);

                            if (this.pathData[this.pathData.length - 1] && this.pathData[this.pathData.length - 1][0].toLowerCase() === 'c') {

                                this.currentCurveControlPoint2 = this.currentCurvePoint2;

                                this.pathData[this.pathData.length - 1] = ['C', this.currentCurveControlPoint1.x, this.currentCurveControlPoint1.y, this.currentCurveControlPoint2.x, this.currentCurveControlPoint2.y, this.currentCurveEndPoint.x, this.currentCurveEndPoint.y];
                                this.renderPath();
                            }
                        }
                    }
                }
            }
        });

        this.on('mousemove', (evt) => {

            if (this.type === 'draw') {
                if (this.pathData.length > 0) {

                    let pos = base.getMousePosition(evt);

                    const snapPoint = this.getSnapPoint(pos);
                    if (snapPoint) {
                        pos = snapPoint;
                    }

                    this.updateGuideCurve(pos);
                }
            }
        });

    }

    editPath = (id) => {

        this.renderPathObject(id);

        let pathNode = document.getElementById('path-node-points');
        let lineGuide = document.getElementById('line-guide');

        if (pathNode) {
            pathNode.innerHTML = '';
        }

        if (lineGuide) {
            lineGuide.innerHTML = '';
        }

        let data;

        if (data = this.arrayPath[id]) {
            let segment = data.pathData;

            for (let i = 0; i < segment.length; i++) {

                let command = segment[i][0].toLowerCase();

                if (command === 'm') {

                    let node = this.createNodePoints(segment[i][1], segment[i][2]);
                    node.setAttribute('data', id);
                    node.setAttribute('data-control-index', i);

                }

                if (command === 'c') {

                    if ((segment[0][1] + segment[0][2]) != (segment[i][5] + segment[i][6])) {
                        let node = this.createNodePoints(segment[i][5], segment[i][6]);
                        node.setAttribute('data', id);
                        node.setAttribute('data-control-index', i);
                    }

                    let prev = segment[i - 1];

                    if (prev && prev[0].toLowerCase() === 'm' && segment[i][0].toLowerCase() === 'c') {

                        let curve1 = this.createLineGuide({
                            x: prev[1],
                            y: prev[2]
                        }, {
                            x: segment[i][1],
                            y: segment[i][2]
                        }, 0);

                        curve1.setAttribute('data', id);
                        curve1.setAttribute('data-control-index', i - 1);

                        if ((prev[1] + prev[2]) === (segment[i][1] + segment[i][2])) {
                            curve1.setAttribute('pointer-events', 'none');
                            curve1.setAttribute('fill-opacity', 0);
                        }

                        let curve2 = this.createLineGuide({
                            x: segment[i][5],
                            y: segment[i][6]
                        }, {
                            x: segment[i][3],
                            y: segment[i][4]
                        }, 1);

                        curve2.setAttribute('data', id);
                        curve2.setAttribute('data-control-index', i);

                        if ((segment[i][3] + segment[i][4]) === (segment[i][5] + segment[i][6])) {
                            curve2.setAttribute('pointer-events', 'none');
                            curve2.setAttribute('fill-opacity', 0);
                        }
                    }

                    if (prev && prev[0].toLowerCase() === 'c' && segment[i][0].toLowerCase() === 'c') {

                        let curve1 = this.createLineGuide({
                            x: prev[5],
                            y: prev[6]
                        }, {
                            x: segment[i][1],
                            y: segment[i][2]
                        }, 0);

                        curve1.setAttribute('data', id);
                        curve1.setAttribute('data-control-index', i - 1);

                        if ((prev[5] + prev[6]) === (segment[i][1] + segment[i][2])) {
                            curve1.setAttribute('pointer-events', 'none');
                            curve1.setAttribute('fill-opacity', 0);
                        }

                        let curve2 = this.createLineGuide({
                            x: segment[i][5],
                            y: segment[i][6]
                        }, {
                            x: segment[i][3],
                            y: segment[i][4]
                        }, 1);

                        let j = i;

                        if (segment[segment.length - 1][0].toLowerCase() === 'z') {
                            if (i === (segment.length - 2)) {
                                j = 0;
                            }
                        }

                        curve2.setAttribute('data', id);
                        curve2.setAttribute('data-control-index', j);

                        if ((segment[i][3] + segment[i][4]) === (segment[i][5] + segment[i][6])) {
                            curve2.setAttribute('pointer-events', 'none');
                            curve2.setAttribute('fill-opacity', 0);
                        }

                    }

                }
            }
        }
    }


    createLineGuide = (node, point, type) => {

        const angle = Math.atan2(point.y - node.y, point.x - node.x);
        const dist = Math.sqrt(Math.pow(point.x - node.x, 2) + Math.pow(point.y - node.y, 2));

        let x1 = node.x + dist * Math.cos(angle);
        let y1 = node.y + dist * Math.sin(angle);

        if (!this.lineGuide) {
            this.lineGuide = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.lineGuide.setAttribute('id', 'line-guide');
            base.content.appendChild(this.lineGuide);
        }

        let guideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        guideLine.setAttribute('pointer-events', 'none');
        guideLine.setAttribute('stroke', '#4F80FF');
        guideLine.setAttribute('stroke-width', base.calcScale(1));
        this.lineGuide.appendChild(guideLine);

        let guideCircle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        guideCircle1.setAttribute('class', 'path-curve');
        guideCircle1.setAttribute('point-x', x1);
        guideCircle1.setAttribute('point-y', y1);
        guideCircle1.setAttribute('type', type);
        guideCircle1.setAttribute('cx', x1);
        guideCircle1.setAttribute('cy', y1);
        guideCircle1.setAttribute('r', base.calcScale(3));
        guideCircle1.setAttribute('fill', '#4F80FF');
        this.lineGuide.appendChild(guideCircle1);

        guideLine.setAttribute('x1', node.x);
        guideLine.setAttribute('y1', node.y);
        guideLine.setAttribute('x2', x1);
        guideLine.setAttribute('y2', y1);

        guideCircle1.setAttribute('cx', x1);
        guideCircle1.setAttribute('cy', y1);

        return guideCircle1;
    }

    createNodePoints = (x, y) => {

        if (!this.nodePoint) {
            this.nodePoint = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.nodePoint.setAttribute('id', 'path-node-points');
            base.content.appendChild(this.nodePoint);
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'path-node');
        rect.setAttribute('x', x - base.calcScale((5 / 2)));
        rect.setAttribute('y', y - base.calcScale((5 / 2)));
        rect.setAttribute('point-x', x);
        rect.setAttribute('point-y', y);
        rect.setAttribute('width', base.calcScale(5));
        rect.setAttribute('height', base.calcScale(5));
        rect.setAttribute('fill', '#fff');
        rect.setAttribute('stroke', '#4F80FF');
        rect.setAttribute('stroke-width', base.calcScale(1));
        rect.setAttribute('shape-rendering', 'crispEdges');
        this.nodePoint.appendChild(rect);

        return rect;
    }

    removeNodePoints = () => {
        this.nodePoint.remove();
        this.nodePoint = null;
    }

    closePath = () => {

        this.pathData.push(['Z']);
        this.renderPath();

        this.arrayPath['path-' + this.count] = {
            pathData: this.pathData
        };

        this.points = [];
        // path = null;
        this.pathData = [];

        this.startDragPoint = null;
        this.currentCurveControlPoint1 = null;
        this.currentCurveControlPoint2 = null;
        this.currentCurveEndPoint = null;

        this.currentCurvePoint1 = null;
        this.currentCurvePoint2 = null;

        this.removeGuide();
        this.removeNodePoints();

        this.count += 1;

        // this.type = 'edit';

        // this.editPath('path-0');
    }

    removeGuide = () => {
        if (this.guideLine) {
            base.content.removeChild(this.guideLine);
            this.guideLine = null;
        }

        if (this.guideCircle1) {
            base.content.removeChild(this.guideCircle1);
            this.guideCircle1 = null;
        }

        if (this.guideCircle2) {
            base.content.removeChild(this.guideCircle2);
            this.guideCircle2 = null;
        }

        if (this.guideCurve) {
            base.content.removeChild(this.guideCurve);
            this.guideCurve = null;
        }
    }

    updateGuideCurve = (pos) => {

        if (!this.guideCurve) {
            this.guideCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.guideCurve.setAttribute('fill', 'none');
            this.guideCurve.setAttribute('stroke', '#4F80FF');
            this.guideCurve.setAttribute('stroke-width', base.calcScale(1));
            base.content.appendChild(this.guideCurve);
        }

        let point1 = this.currentCurvePoint1 || this.points[this.points.length - 1];
        let point2 = pos;
        let point3 = pos;

        const snapPoint = this.getSnapPoint(pos);
        if (snapPoint) {

            if (this.points.length > 1 && this.pathData.length > 1) {
                if (snapPoint.x === this.points[0].x && snapPoint.y === this.points[0].y) {

                    const angle = Math.atan2(this.pathData[1][2] - this.points[0].y, this.pathData[1][1] - this.points[0].x);
                    const dist = Math.sqrt(Math.pow(this.points[0].x - this.pathData[1][1], 2) + Math.pow(this.points[0].y - this.pathData[1][2], 2));

                    let x2 = this.points[0].x - dist * Math.cos(angle);
                    let y2 = this.points[0].y - dist * Math.sin(angle);

                    point2 = {
                        x: x2,
                        y: y2
                    }

                    point3 = snapPoint;

                }
            }
        }

        let d = 'M' + this.points[this.points.length - 1].x + ' ' + this.points[this.points.length - 1].y + ' C ' + point1.x + ' ' + point1.y + ' ' + point2.x + ' ' + point2.y + ' ' + point3.x + ' ' + point3.y;

        this.guideCurve.setAttribute('d', d);
    }

    updateGuideLine = (pos) => {

        const angle = Math.atan2(pos.y - this.startDragPoint.y, pos.x - this.startDragPoint.x);
        const dist = Math.sqrt(Math.pow(this.startDragPoint.x - pos.x, 2) + Math.pow(this.startDragPoint.y - pos.y, 2));
        let x1 = this.startDragPoint.x + dist * Math.cos(angle);
        let y1 = this.startDragPoint.y + dist * Math.sin(angle);
        let x2 = this.startDragPoint.x - dist * Math.cos(angle);
        let y2 = this.startDragPoint.y - dist * Math.sin(angle);

        if (!this.guideLine) {
            this.guideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this.guideLine.setAttribute('stroke', '#4F80FF');
            this.guideLine.setAttribute('stroke-width', base.calcScale(1));
            base.content.appendChild(this.guideLine);
        }

        if (!this.guideCircle1) {
            this.guideCircle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.guideCircle1.setAttribute('cx', x1);
            this.guideCircle1.setAttribute('cy', y1);
            this.guideCircle1.setAttribute('r', base.calcScale(3));
            this.guideCircle1.setAttribute('fill', '#4F80FF');
            base.content.appendChild(this.guideCircle1);
        }

        if (!this.guideCircle2) {
            this.guideCircle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.guideCircle2.setAttribute('cx', x2);
            this.guideCircle2.setAttribute('cy', y2);
            this.guideCircle2.setAttribute('r', base.calcScale(3));
            this.guideCircle2.setAttribute('fill', '#4F80FF');
            base.content.appendChild(this.guideCircle2);
        }

        this.guideLine.setAttribute('x1', x1);
        this.guideLine.setAttribute('y1', y1);
        this.guideLine.setAttribute('x2', x2);
        this.guideLine.setAttribute('y2', y2);

        this.guideCircle1.setAttribute('cx', x1);
        this.guideCircle1.setAttribute('cy', y1);

        this.guideCircle2.setAttribute('cx', x2);
        this.guideCircle2.setAttribute('cy', y2);
    }

    renderPath = () => {
        if (this.path) {

            let d = '';

            this.pathData.forEach((segment, i) => {

                d += segment.join(' ') + ' ';
            });

            this.path.setAttribute('d', d.trim());
        }
    }

    renderPathObject = (id) => {

        let svgpath = document.getElementById(id);

        if (!svgpath) {
            svgpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            svgpath.setAttribute('id', id);
            svgpath.setAttribute('fill', '#fff');
            svgpath.setAttribute('stroke', 'black');
            svgpath.setAttribute('stroke-width', base.calcScale(1));
            this.svgroot.appendChild(svgpath);
        }

        let pathData = this.arrayPath[id].pathData;

        let d = '';
        pathData.forEach(segment => {
            d += segment.join(' ') + ' ';
        });
        svgpath.setAttribute('d', d.trim());

    }

    path_node = (target) => {
        this.pathNodeTap++;

        let pathID = target.getAttribute('data');
        let pathIndex = target.getAttribute('data-control-index');

        let pointX = target.getAttribute('point-x');
        let pointY = target.getAttribute('point-y');

        pointX = Number(pointX);
        pointY = Number(pointY);

        pathIndex = Number(pathIndex);

        let pathData = this.arrayPath[pathID].pathData;
        let length = pathData.length - 1;

        let z = false;

        if (pathData[pathData.length - 1][0].toLowerCase() === 'z') {
            length = pathData.length - 2;
            z = true;
        }

        let current = pathData[pathIndex];
        let next = pathData[pathIndex + 1];
        let close = pathData[length];

        this.edit = {
            id: pathID,
            class: 'path-node',
            point: {
                x: pointX,
                y: pointY
            },
            data: [],
            guide: document.querySelectorAll('circle[data-control-index="' + pathIndex + '"]')
        }

        if (current && !next) {

            if (current[0].toLowerCase() === 'm') {
                this.edit.data = [
                    { command: 'M', index: pathIndex, ix: 1, iy: 2, x: current[1], y: current[2] },
                ]
            }

            if (current[0].toLowerCase() === 'c') {
                this.edit.data = [
                    { command: 'C', index: pathIndex, ix: 3, iy: 4, x: current[3], y: current[4] },
                    { command: 'C', index: pathIndex, ix: 5, iy: 6, x: current[5], y: current[6] },
                ]
            }
        }


        if (current && next) {

            if (current[0].toLowerCase() === 'm' && next[0].toLowerCase() === 'c') {

                this.edit.data = [
                    { command: 'M', index: pathIndex, ix: 1, iy: 2, x: current[1], y: current[2] },
                    { command: 'C', index: (pathIndex + 1), ix: 1, iy: 2, x: next[1], y: next[2] }
                ]

                if (z) {
                    this.edit.data.push({ command: 'C', index: length, ix: 3, iy: 4, x: close[3], y: close[4] });
                    this.edit.data.push({ command: 'C', index: length, ix: 5, iy: 6, x: close[5], y: close[6] });
                }
            }

            if (current[0].toLowerCase() === 'c' && next[0].toLowerCase() === 'c') {
                this.edit.data = [
                    { command: 'C', index: pathIndex, ix: 3, iy: 4, x: current[3], y: current[4] },
                    { command: 'C', index: pathIndex, ix: 5, iy: 6, x: current[5], y: current[6] },
                    { command: 'C', index: (pathIndex + 1), ix: 1, iy: 2, x: next[1], y: next[2] }
                ]
            }
        }
    }

    path_curve = (target) => {

        let pathID = target.getAttribute('data');
        let pathIndex = target.getAttribute('data-control-index');

        let pointX = target.getAttribute('point-x');
        let pointY = target.getAttribute('point-y');

        let type = target.getAttribute('type');

        pointX = Number(pointX);
        pointY = Number(pointY);

        type = Number(type);

        pathIndex = Number(pathIndex);

        let pathData = this.arrayPath[pathID].pathData;
        let length = pathData.length - 1;

        let z = false;

        if (pathData[pathData.length - 1][0].toLowerCase() === 'z') {
            length = pathData.length - 2;
            z = true;
        }

        let current = pathData[pathIndex];
        let next = pathData[pathIndex + 1];
        let close = pathData[length];

        this.edit = {
            id: pathID,
            class: 'path-curve',
            point: {
                x: pointX,
                y: pointY
            },
            type: type,
            data: []
        }

        if (current && !next) {

            if (current[0].toLowerCase() === 'm') {
                this.edit.data = [
                    { command: 'M', index: (pathIndex + 1), ix: 1, iy: 2, x: current[1], y: current[2] }
                ]
            }

            if (current[0].toLowerCase() === 'c') {
                this.edit.data = [
                    { command: 'C', index: pathIndex, ix: 3, iy: 4, x: current[3], y: current[4] },
                ]
            }
        }

        if (current && next) {

            if (current[0].toLowerCase() === 'm' && next[0].toLowerCase() === 'c') {
                this.edit.data = [
                    { command: 'C', index: (pathIndex + 1), ix: 1, iy: 2, x: next[1], y: next[2] }
                ]

                if (z) {
                    this.edit.data.push({ command: 'C', index: length, ix: 3, iy: 4, x: close[3], y: close[4] });
                }
            }

            if (current[0].toLowerCase() === 'c' && next[0].toLowerCase() === 'c') {
                this.edit.data = [
                    { command: 'C', index: pathIndex, ix: 3, iy: 4, x: current[3], y: current[4] },
                    { command: 'C', index: (pathIndex + 1), ix: 1, iy: 2, x: next[1], y: next[2] }
                ]
            }
        }
    }

    getSnapPoint = (pos) => {
        let minDist = Infinity;
        let snapPoint = null;
        this.points.forEach(point => {
            const dist = Math.sqrt((pos.x - point.x) ** 2 + (pos.y - point.y) ** 2);
            if (dist < minDist && dist < base.calcScale(20)) {
                minDist = dist;
                snapPoint = point;
            }
        });
        return snapPoint;
    }

}

//--------------------------------------------------------//
//--------------------Shotcut-key-------------------------//
//--------------------------------------------------------//

class ShotcutKey {

    svgroot = document.getElementById('svgroot');

    isCtrlPressed = false;

    constructor(Viewer) {

        let _this = this;

        // document.addEventListener('keydown', function (event) {

        //     if (event.key === 'Control') {
        //         _this.isCtrlPressed = true;
        //         console.log('CTRL', _this.isCtrlPressed)
        //     }

        // });

        // document.addEventListener('wheel', function (event) {

        //     if (event.ctrlKey) {

        //         event.preventDefault();

        //         let scale = Viewer.scale;
        //         let delta;

        //         if (event.deltaY < 0) {
        //             // Zoom in
        //             scale *= 1.1;
        //             delta = 'in';
        //         } else {
        //             // Zoom out
        //             scale /= 1.1;
        //             delta = 'out';
        //         }

        //         Viewer.zoom(scale * 100, delta, event);

        //     }

        // }, { passive: false });

        // document.addEventListener('keyup', function (event) {
        //     if (event.key === 'Control') {
        //         _this.isCtrlPressed = false;
        //         console.log('CTRL', _this.isCtrlPressed)
        //     }
        // });
    }

}

class SvgPanZoom {

    Viewer;
    target;

    options = {
        minScale: 0.1,
        maxScale: 1000,
        zoomAmount: .002,
    }

    defaultOptions = {
        minScale: 1,
        maxScale: 10,
        zoomAmount: .002,
    }

    constructor(Viewer) {

        let _this = this;
        this.Viewer = Viewer;
        this.target = this.Viewer.panzoom;
        this.panOnDrag();
        this.zoomOnWheel();

        new MutationObserver(function (mutations) {

            mutations.forEach(function (mutation) {

                SCALE = _this.getScale(mutation.target.parentElement);
                _this.Viewer.dom.querySelector('#zoom').value = (SCALE * 100).toFixed(0) + '%';

                if (xDraggable) {
                    xDraggable._updateControlsView();
                }

            });

        }).observe(_this.target.firstElementChild, {
            attributes: true,
            attributeFilter: ['transform'],
        });

    }

    updateView = () => {
        let ctm = this.Viewer.svgpanzoom.getScreenCTM();
        let bounding = this.Viewer.workarea.getBoundingClientRect();
        const transform = `matrix(${ctm.a},${ctm.b},${ctm.c},${ctm.d},${ctm.e - bounding.x},${ctm.f - bounding.y})`;
        this.Viewer.draw.setAttribute('transform', transform);
        requestAnimationFrame(this.Viewer.ruler.update);
    }

    clamp = (value, min, max) => value < min ? min : value > max ? max : value;

    getScaleAndOffset = (container, content) => {
        const matrix = new DOMMatrix(content.style.transform);
        return [matrix.a, container.scrollLeft - matrix.e, container.scrollTop - matrix.f];
    };
    setScaleAndOffset = (container, content, scale, offsetX, offsetY) => {
        const scrollX = Math.round(Math.max(offsetX, 0));
        const scrollY = Math.round(Math.max(offsetY, 0));
        content.setAttribute('transform', content.style.transform = `matrix(${scale},0,0,${scale},${scrollX - offsetX},${scrollY - offsetY})`);

        content.style.margin = 0;
        container.scrollLeft = scrollX;
        container.scrollTop = scrollY;
        if (container.scrollLeft !== scrollX) {
            content.style.marginRight = `${scrollX}px`;
            container.scrollLeft = scrollX;
        }
        if (container.scrollTop !== scrollY) {
            content.style.marginBottom = `${scrollY}px`;
            container.scrollTop = scrollY;
        }

        this.updateView();

    };

    pan = (container, deltaX, deltaY) => {
        const content = container.firstElementChild;
        const [scale, previousOffsetX, previousOffsetY] = this.getScaleAndOffset(container, content);
        this.setScaleAndOffset(container, content, scale, previousOffsetX + deltaX, previousOffsetY + deltaY);
    };

    panOnDrag = () => {

        let _this = this;

        let lastMouseX = 0;
        let lastMouseY = 0;
        let isPanning = false;
        let target = _this.target;

        addEventListener('mousedown', event => {

            console.log(event)

            if (event.button === 1 || event.ctrlKey && event.button === 2) {

                event.preventDefault();
                event.stopPropagation();

                isPanning = true;

                lastMouseX = event.clientX;
                lastMouseY = event.clientY;

                addEventListener('mousemove', event_wheel_move);
                addEventListener('mouseup', event_wheel_up);
            }

        });

        function event_wheel_move(event) {

            if (!isPanning) return;

            event.preventDefault();
            event.stopPropagation();

            let deltaX = lastMouseX - event.clientX;
            let deltaY = lastMouseY - event.clientY;

            _this.pan(target, deltaX, deltaY);

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            requestAnimationFrame(_this.Viewer.ruler.update);
        }

        function event_wheel_up(event) {

            if (event.button === 1 || event.button === 2) {

                event.preventDefault();
                event.stopPropagation();

                isPanning = false;

                lastMouseX = 0;
                lastMouseY = 0;

                removeEventListener('mousemove', event_wheel_move);
                removeEventListener('mouseup', event_wheel_up);
            }
        }

    };;

    getScale = (container) => this.getScaleAndOffset(container, container.firstElementChild)[0];

    setScale = (container, value, options = {}) => {
        const scale = this.clamp(value, options.minScale || 1, options.maxScale || 10);
        const origin = options.origin;
        const content = container.firstElementChild;
        const [previousScale, previousOffsetX, previousOffsetY] = this.getScaleAndOffset(container, content);
        if (scale === previousScale) {
            return;
        }
        const offsetScale = scale / previousScale - 1;
        const previousClientRect = content.getBoundingClientRect();
        const centerOffsetX = (origin && origin.clientX || origin.x || 0) - previousClientRect.left;
        const centerOffsetY = (origin && origin.clientY || origin.y || 0) - previousClientRect.top;
        const offsetX = previousOffsetX + offsetScale * centerOffsetX;
        const offsetY = previousOffsetY + offsetScale * centerOffsetY;

        this.setScaleAndOffset(container, content, scale, offsetX, offsetY);
    };

    resetScale = (container) => {
        const content = container.firstElementChild;
        content.style.margin = container.scrollLeft = container.scrollTop = 0;
        content.removeAttribute('transform');
        content.style.transform = '';
    };

    zoom = (container, ratio, options) => {
        this.setScale(container, this.getScale(container) * ratio, options);
    };

    zoomOnWheel = () => {

        let _this = this;
        let target = _this.target;
        let id = '#' + target.getAttribute('id');

        let doc = _this.Viewer.dom;
        doc.appendChild(document.createElement('style'))
            .textContent = `${id}{overflow:scroll}${id}>:first-child{width:100%;height:100%;vertical-align:middle;transform-origin:0 0}`;

        addEventListener('wheel', event => {

            if (event.ctrlKey) {

                const zoomAmount = +_this.options.zoomAmount || _this.defaultOptions.zoomAmount;

                _this.zoom(target, (1 + zoomAmount) ** -event.deltaY, {
                    origin: event,
                    minScale: +_this.options.minScale || _this.defaultOptions.minScale,
                    maxScale: +_this.options.maxScale || _this.defaultOptions.maxScale,
                });
                requestAnimationFrame(_this.Viewer.ruler.update);
                event.preventDefault();
            }

            else if (event.shiftKey) {
                let delta = event.wheelDelta > 0 ? -100 : 100;
                _this.pan(target, delta, 0);
                requestAnimationFrame(_this.Viewer.ruler.update);
                event.preventDefault();
            }

            else {
                _this.target.scrollTop += event.deltaY;
                if (xDraggable) {
                    setTimeout(() => {
                        xDraggable._updateControlsView();
                    }, 5);
                }
            }

        }, { passive: false });

        addEventListener('keydown', event => {

            const zoomAmount = +_this.options.zoomAmount || _this.defaultOptions.zoomAmount;
            let svgcanvas = _this.Viewer.svgcanvas.getBoundingClientRect();
            let delta = 100;

            if (event.ctrlKey) {

                if (event.key === 'ArrowUp') {

                    _this.pan(target, 0, -delta);
                }

                if (event.key === 'ArrowDown') {
                    _this.pan(target, 0, delta);
                }

                if (event.key === 'ArrowLeft') {
                    _this.pan(target, -delta, 0);
                }

                if (event.key === 'ArrowRight') {
                    _this.pan(target, delta, 0);
                }

                event.preventDefault();
                requestAnimationFrame(_this.Viewer.ruler.update);
            }

            if (!event.ctrlKey) {

                if (event.key === '-') {
                    _this.zoom(target, (1 + zoomAmount) ** -delta, {
                        origin: {
                            x: svgcanvas.right,
                            y: svgcanvas.bottom
                        },
                        minScale: +_this.options.minScale || _this.defaultOptions.minScale,
                        maxScale: +_this.options.maxScale || _this.defaultOptions.maxScale,
                    });
                }

                if (event.key === '+') {
                    _this.zoom(target, (1 + zoomAmount) ** +delta, {
                        origin: {
                            x: svgcanvas.right,
                            y: svgcanvas.bottom
                        },
                        minScale: +_this.options.minScale || _this.defaultOptions.minScale,
                        maxScale: +_this.options.maxScale || _this.defaultOptions.maxScale,
                    });
                }

                requestAnimationFrame(_this.Viewer.ruler.update);
            }

            if (event.ctrlKey) {

                if (event.key === '-') {
                    _this.zoom(target, (1 + zoomAmount) ** -delta, {
                        origin: {
                            x: svgcanvas.x + (svgcanvas.width / 2),
                            y: svgcanvas.y + (svgcanvas.height / 2)
                        },
                        minScale: +_this.options.minScale || _this.defaultOptions.minScale,
                        maxScale: +_this.options.maxScale || _this.defaultOptions.maxScale,
                    });
                }

                if (event.key === '+') {
                    _this.zoom(target, (1 + zoomAmount) ** +delta, {
                        origin: {
                            x: svgcanvas.x + (svgcanvas.width / 2),
                            y: svgcanvas.y + (svgcanvas.height / 2)
                        },
                        minScale: +_this.options.minScale || _this.defaultOptions.minScale,
                        maxScale: +_this.options.maxScale || _this.defaultOptions.maxScale,
                    });
                }

                event.preventDefault();
                requestAnimationFrame(_this.Viewer.ruler.update);
            }


        });

        _this.Viewer.panzoom.addEventListener('scroll', () => {
            _this.updateView();
        });

    };
}

//--------------------------------------------------------//
//---------------------Viewer-----------------------------//
//--------------------------------------------------------//

class Viewer extends EventEmitter {

    dom = null;
    width = null;
    height = null;

    workarea = null;
    svgcanvas = null;
    svgroot = null;
    draw = null;
    canvasBackground = null;
    svgcontent = null;
    content = null;
    contentString = null;
    bg = null;

    ns = 'http://www.w3.org/2000/svg';

    scale = 1;

    lastOffset = null;

    translateX = 0;
    translateY = 0;

    posX = 0;
    posY = 0;

    constructor(id, option) {

        super();

        this.bg = option.background;
        this.contentString = option.content;

        let max = Math.max(this.bg.width, this.bg.height);

        let width = max > 5000 ? max * 5 : 1500;
        let height = max > 5000 ? max * 5 : 1500;

        this.width = width;
        this.height = height;

        //---------create element----------//

        let editor = document.getElementById('editor');
        this.dom = editor.attachShadow({ mode: 'open' });

        document.getElementById("editor").appendChild(this.dom);

        this.dom.innerHTML = '';

        this.addStylesheet('/editor/style.css');

        setTimeout(()=>{

            this.create.menu_bar();
            this.create.workarea();
            this.create.tools_left();
            this.create.tools_bottom();

            base = new Base(this.dom, this.panzoom, this.svgroot, this.draw, this.svgcontent);

            //----setup ruler, background----//

            this.ruler.create();

            let gradPicker = document.createElement('DIV');
            gradPicker.setAttribute('id', 'gradPicker');

            this.dom.appendChild(gradPicker);

            this.background.set();

            this.SvgPanZoom = new SvgPanZoom(this);

            this.fit();

            selector = new Selector();

        }, 100);

    }

    addStylesheet = (href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        this.dom.appendChild(link);
        return link;
    };

    create = {
        workarea: () => {

            let ns = this.ns;

            this.workarea = document.createElement('DIV');
            this.workarea.setAttribute('id', 'workarea');

            this.panzoom = document.createElement('DIV');
            this.svgpanzoom = document.createElementNS(ns, "svg");

            this.panzoom.setAttribute('id', 'panzoom');
            this.svgpanzoom.setAttribute('id', 'svgpanzoom');

            this.panzoom.appendChild(this.svgpanzoom);

            this.workarea.appendChild(this.panzoom);

            this.dom.appendChild(this.workarea);

            this.svgcanvas = document.createElement('DIV');
            this.svgroot = document.createElementNS(ns, "svg");
            this.draw = document.createElementNS(ns, "g");
            this.canvasBackground = document.createElementNS(ns, "svg");
            this.svgcontent = document.createElementNS(ns, "svg");

            this.svgroot.setAttribute('xmlns', ns);
            this.canvasBackground.setAttribute('xmlns', ns);
            this.svgcontent.setAttribute('xmlns', ns);

            // this.svgroot.setAttribute('pointer-events', 'none');
            this.canvasBackground.setAttribute('pointer-events', 'none');
            this.svgcontent.setAttribute('pointer-events', 'all');

            this.canvasBackground.style.overflow = 'auto';
            this.svgcontent.style.overflow = 'auto';

            this.draw.setAttribute('id', 'draw');

            this.svgcanvas.setAttribute('id', 'svgcanvas');

            this.svgroot.setAttribute('id', 'svgroot');
            // this.svgroot.style.width = this.width + 'px';
            // this.svgroot.style.height = this.height + 'px';
            this.svgroot.style.width = '100%';
            this.svgroot.style.height = '100%';

            this.draw.appendChild(this.canvasBackground);
            this.draw.appendChild(this.svgcontent);

            this.svgroot.appendChild(this.draw);

            this.canvasBackground.setAttribute('id', 'canvasBackground');
            this.svgcontent.setAttribute('id', 'svgcontent');

            this.svgcanvas.appendChild(this.svgroot);

            this.workarea.appendChild(this.svgcanvas);

            setTimeout(() => {
                let scrollWidth = this.panzoom.offsetWidth - this.panzoom.clientWidth;
                let scrollHeight = this.panzoom.offsetHeight - this.panzoom.clientHeight;
                this.svgcanvas.style.width = 'calc(100% - ' + scrollWidth + 'px)';
                this.svgcanvas.style.height = 'calc(100% - ' + scrollHeight + 'px)';
            });

        },

        tools_left: () => {

            let _this = this;

            let tools_left = document.createElement('DIV');

            tools_left.setAttribute('id', 'tools_left');
            tools_left.setAttribute('class', 'tools_panel');

            tools_left.innerHTML = `

                <div class="tool_button" id="tool_select" data-mode="select" title="Select Tool [V]">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M17.15 20.76l-2.94 1.5-3.68-6-4.41 3V1.24l12.5 12.01-4.41 1.5 2.94 6z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_fhpath" data-mode="fhpath" title="Pencil Tool [P]">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style="transform: scale(-1,1)">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_line" data-mode="line" title="Line Tool [L]">
                    <svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M 3 1 L 26 24 L 24 26 L 1 3 L 3 1 Z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_rect" data-mode="rect" title="Square/Rect Tool [R]">
                    <svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M 0 8 L 0 24 L 24 24 L 25 8 L 0 8 Z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_ellipse" data-mode="ellipse" title="Ellipse/Circle Tool [C]">
                    <svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <ellipse cx="13" cy="13" rx="13" ry="9"></ellipse>
                    </svg>
                </div>

                <div class="tool_button" id="tool_path" data-mode="path" title="Path Tool [P]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 27" width="27" height="27">
                    <path d="M12.2 1.9c0-.36.86 0 .86 0V14a1.3 1.3 0 10.88 0V1.9s.87-.36.87 0c0 6.81 5.22 11.68 5.22 11.68l-3.25 8.2h-6.55l-3.26-8.2s5.22-4.87 5.22-11.68zM7.83 25.26v-2.61h11.32v2.6H7.84z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_text" data-mode="text" title="Text Tool [T]">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="2 2 20 20" width="27">
                        <path d="M5 4v3h5.5v12h3V7H19V4z"></path>
                    </svg>
                </div>

                <div class="tool_button" id="tool_zoom" data-mode="zoom" title="Zoom Tool [Z]">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="2 2 20 20" width="27">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                     </svg>
                </div>

                <div id="color_tools">

                    <div id="tool_switch" title="Switch stroke and fill colors [X]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11"><path d="M3.01 2A6 6 0 019 8h1.83l-2.91 2.91L5 8h2a4 4 0 00-3.99-4v1.93L.1 3.02 3.01.1V2z"></path></svg>
                    </div>

                    <div class="color_tool active" id="tool_fill">
                        <label class="icon_label" title="Change fill color"></label>
                        <div class="color_block">
                            <div id="fill_bg"></div>
                            <div id="fill_color" class="color_block"><svg xmlns="http://www.w3.org/2000/svg" width="100%"><rect width="100%" height="100%" fill="#ffffff" opacity="1"></rect>    <defs><linearGradient id="gradbox_"></linearGradient></defs></svg></div>
                        </div>
                    </div>

                    <div class="color_tool" id="tool_stroke">
                        <label class="icon_label" title="Change stroke color"></label>
                        <div class="color_block">
                            <div id="stroke_bg"></div>
                            <div id="stroke_color" class="color_block" title="Change stroke color"><svg xmlns="http://www.w3.org/2000/svg" width="100%"><rect width="100%" height="100%" fill="#000000" opacity="1"></rect>    <defs><linearGradient id="gradbox_"></linearGradient></defs></svg></div>
                        </div>
                    </div>
                </div>

            `;

            this.dom.appendChild(tools_left);

            toolHandlerArray = [
                new EvenHandler(this.dom.querySelector('#tool_select')).addEventListener('click', (evt) => this.emit('tool_select', evt)),
                new EvenHandler(this.dom.querySelector('#tool_fhpath')).addEventListener('click', (evt) => this.emit('tool_fhpath', evt)),
                new EvenHandler(this.dom.querySelector('#tool_line')).addEventListener('click', (evt) => this.emit('tool_line', evt)),
                new EvenHandler(this.dom.querySelector('#tool_rect')).addEventListener('click', (evt) => this.emit('tool_rect', evt)),
                new EvenHandler(this.dom.querySelector('#tool_ellipse')).addEventListener('click', (evt) => this.emit('tool_ellipse', evt)),
                new EvenHandler(this.dom.querySelector('#tool_path')).addEventListener('click', (evt) => this.emit('tool_path', evt)),
                new EvenHandler(this.dom.querySelector('#tool_fill')).addEventListener('click', (evt) => this.emit('tool_fill', evt)),
                new EvenHandler(this.dom.querySelector('#tool_stroke')).addEventListener('click', (evt) => this.emit('tool_stroke', evt)),
                new EvenHandler(this.dom.querySelector('#tool_switch')).addEventListener('click', (evt) => this.emit('tool_switch', evt))
            ];

            this.on('tool_select', () => {
                new Select();
            });

            this.on('tool_fhpath', () => {
                new Pencil();
            });

            this.on('tool_line', () => {
                new Line();
            });

            this.on('tool_rect', () => {
                new Rect();
            });

            this.on('tool_ellipse', () => {
                new Ellipse();
            });

            this.on('tool_path', () => {
                new Path();
            });

            this.on('tool_fill', () => {

                _this.dom.querySelector('#tool_fill').classList.add('active');
                _this.dom.querySelector('#tool_stroke').classList.remove('active');

                var paint = new $.jGraduate.Paint({ alpha: 100, solidColor: $(_this.dom.querySelector('#tool_fill svg rect')).attr('fill') })

                console.log(_this.dom.querySelector('#tool_fill svg rect'))

                console.log(_this.dom.querySelector('#gradPicker'))

                $(_this.dom.querySelector('#gradPicker')).css({ 'left': 0, 'top': 0 }).jGraduate(
                    {
                        paint: paint,
                        window: { pickerTitle: "Pick a paint for the demo", },
                        images: { clientPath: '/editor/jgraduate-master/images/' }
                    },
                    function (p) {
                        $('#r').attr('fill-opacity', p.alpha / 100);
                        if (p.type == "linearGradient") {
                            // var oldgrad = document.getElementById("grad");
                            // var newgrad = document.importNode(p.linearGradient, true);
                            // newgrad.id = "grad";
                            // // replace the old gradient with the new one
                            // var parent = oldgrad.parentNode;
                            // parent.replaceChild(newgrad, oldgrad);
                            // $('#r').attr('fill', 'url(#grad)');
                            console.log(p);
                        } else if (p.type == "radialGradient") {
                            // var oldgrad = document.getElementById("grad");
                            // var newgrad = document.importNode(p.radialGradient, true);
                            // newgrad.id = "grad";
                            // // replace the old gradient with the new one
                            // var parent = oldgrad.parentNode;
                            // parent.replaceChild(newgrad, oldgrad);
                            // $('#r').attr('fill', 'url(#grad)');
                            console.log(p);
                        }
                        else { // solid color
                            $('#r').attr('fill', (p.solidColor != 'none' ? '#' : '') + p.solidColor);
                            console.log('hghg', p)
                        }
                    });


            });

            this.on('tool_stroke', () => {
                document.querySelectorAll('#tool_stroke')[0].classList.add('active');
                document.querySelectorAll('#tool_fill')[0].classList.remove('active');
            });

            this.on('tool_switch', () => {
                if (document.querySelectorAll('#tool_fill')[0].classList.contains('active')) {
                    document.querySelectorAll('#tool_stroke')[0].classList.add('active');
                    document.querySelectorAll('#tool_fill')[0].classList.remove('active');
                } else {
                    document.querySelectorAll('#tool_fill')[0].classList.add('active');
                    document.querySelectorAll('#tool_stroke')[0].classList.remove('active');
                }
            });

        },

        tools_bottom: () => {

            let _this = this;
            let ns = this.ns;

            let tools_bottom = document.createElement('DIV');
            let select = document.createElement('SELECT');
            let zoom_panel = document.createElement('DIV');

            let zoom_label = document.createElement('DIV');
            let zoomLabel = document.createElement('SPAN');
            let svg = document.createElementNS(ns, "svg");
            let path = document.createElementNS(ns, "path");

            let zoom = document.createElement('INPUT');

            tools_bottom.setAttribute('id', 'tools_bottom');
            select.setAttribute('id', 'zoom_select');
            zoom_panel.setAttribute('id', 'zoom_panel');

            zoom_label.setAttribute('id', 'zoom_label');
            zoom_label.setAttribute('class', 'select-input');
            zoomLabel.setAttribute('id', 'zoomLabel');
            zoomLabel.setAttribute('class', 'zoom_tool icon_label');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', 27);
            svg.setAttribute('height', 24);
            svg.setAttribute('viewBox', '2 2 20 20');
            path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');

            zoom.setAttribute('id', 'zoom');
            zoom.setAttribute('value', '100%');
            zoom.setAttribute('type', 'text');
            zoom.setAttribute('readonly', 'readonly');

            svg.appendChild(path);
            zoomLabel.appendChild(svg);
            zoom_label.appendChild(zoomLabel);
            zoom_label.appendChild(zoom);
            zoom_panel.appendChild(zoom_label);

            let zoom_array = [6, 12, 16, 25, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1600];

            for (let i in zoom_array) {
                let option = document.createElement('OPTION');
                option.setAttribute('value', zoom_array[i]);
                option.innerText = zoom_array[i] + '%';
                select.appendChild(option);
            }

            tools_bottom.appendChild(select);
            tools_bottom.appendChild(zoom_panel);

            this.dom.appendChild(tools_bottom);

            select.addEventListener('change', (e) => {
                let val = Number(e.target.value);
                zoom.value = val + '%';

                _this.zoom(val / (SCALE * 100));

                console.log(SCALE * 100, val)

            });
        },

        menu_bar: () => {

            let _this = this;

            let menu_bar = document.createElement('DIV');

            menu_bar.setAttribute('id', 'menu_bar');

            menu_bar.innerHTML = `
                <div class="menu open">
                    <div id="file" class="menu_title">File</div>
                    <div class="menu_list inverted-undo" id="file_menu"> 
                    <div data-action="clear" id="tool_clear" class="menu_item">New Document</div>
                    
                    <div id="tool_open" class="menu_item">
                        <input type="file" accept="image/svg+xml" id="tool_open_input">
                        Open SVG... <span class="shortcut" style="display: none;">Ctrl+O</span>
                    </div>
                    
                    <div id="tool_import" class="menu_item">
                        <input type="file" accept="image/*" id="tool_import_input">
                        Place Image... <span class="shortcut" style="display: none;">Ctrl+K</span>
                    </div>
                    <div data-action="save" id="tool_save" class="menu_item">Save Image... <span class="shortcut">Ctrl+S</span></div>
                    <div data-action="export" id="tool_export" class="menu_item">Export as PNG</div>
                    </div>
                </div>
            `;

            this.dom.appendChild(menu_bar);

            // new EvenHandler(document.querySelectorAll('#file')[0]).addEventListener('click', (evt) => this.emit('file', evt));

            // let active = null;

            // document.getElementById('modal-editor').addEventListener('click', (e) => {
            //     let el = e.target.parentNode.parentNode;
            //     if (el.getAttribute('id') === 'menu_bar') {
            //         if (!el.classList.contains('active')) {
            //             el.setAttribute('class', 'active');
            //             active = el;
            //             return;
            //         }
            //     }

            //     if (active) {
            //         active.setAttribute('class', '');
            //         active = null;
            //     }

            // });

            // document.getElementById('tool_open_input').addEventListener('change', (e) => {

            //     let selectedFile = e.target.files;
            //     let fileType = selectedFile[0].name.split(".").pop();

            //     let reader = new FileReader();

            //     reader.onload = function (e) {
            //         let base64Data = e.target.result;
            //         base64Data = base64Data.toString().replace(/^data:(.*,)?/, '');

            //         if (fileType === 'svg') {

            //             let svgString = atob(base64Data);

            //             let div = document.createElement('DIV');
            //             div.innerHTML = svgString;

            //             let serializer = new XMLSerializer();
            //             svgString = serializer.serializeToString(div.children[0])
            //             svgString = svgString.replace(/<!--\?xml.*?\?-->/, '');

            //             let subSVG = SVG(svgString).node;
            //             let matrix = _this.svgroot.getScreenCTM().inverse().multiply(subSVG.getScreenCTM());

            //             matrix.e = 0;
            //             matrix.f = 0;

            //             let g = SVG().group().node;

            //             let subWidth = null;
            //             let subHeight = null;
            //             let getWHState = false;

            //             let unit = subSVG.getAttribute('width') && subSVG.getAttribute('width').includes('cm') ? 'cm' : 1;

            //             if (unit === 'cm') {
            //                 unit = 37.7952755906;
            //             }

            //             try {
            //                 let bbox = subSVG.getBBox();

            //                 if (bbox.width && bbox.width) {
            //                     subWidth = bbox.width;
            //                     subHeight = bbox.height;
            //                     if (subWidth != null && subHeight != null) {
            //                         getWHState = true;
            //                     }
            //                 } else {
            //                     let viewBox = subSVG.getAttribute('viewBox');

            //                     if (viewBox) {
            //                         let viewBoxArray = viewBox.split(' ').map(Number);
            //                         matrix.e = (viewBoxArray[0] > 0 ? -viewBoxArray[0] : Math.abs(viewBoxArray[0])) * unit;
            //                         matrix.f = (viewBoxArray[1] > 0 ? -viewBoxArray[1] : Math.abs(viewBoxArray[1])) * unit;
            //                         subWidth = viewBoxArray[2];
            //                         subHeight = viewBoxArray[3];
            //                         if (subWidth != null && subHeight != null) {
            //                             getWHState = true;
            //                         }
            //                     }
            //                 }

            //             } catch {
            //                 let viewBox = subSVG.getAttribute('viewBox');
            //                 if (viewBox) {
            //                     let viewBoxArray = viewBox.split(' ').map(Number);
            //                     matrix.e = (viewBoxArray[0] > 0 ? -viewBoxArray[0] : Math.abs(viewBoxArray[0])) * unit;
            //                     matrix.f = (viewBoxArray[1] > 0 ? -viewBoxArray[1] : Math.abs(viewBoxArray[1])) * unit;
            //                     subWidth = viewBoxArray[2];
            //                     subHeight = viewBoxArray[3];
            //                     if (subWidth != null && subHeight != null) {
            //                         getWHState = true;
            //                     }
            //                 }
            //             }

            //             if (!getWHState) {
            //                 subWidth = parseFloat(subSVG.getAttribute('width'));
            //                 subHeight = parseFloat(subSVG.getAttribute('height'));
            //             }

            //             let scaleX = ((subWidth * unit) / subWidth);
            //             let scaleY = ((subHeight * unit) / subHeight);

            //             matrix.a = scaleX;
            //             matrix.d = scaleY;

            //             g.setAttribute('transform', "matrix(".concat(matrix.a, ",").concat(matrix.b, ",").concat(matrix.c, ",").concat(matrix.d, ",").concat(matrix.e, ",").concat(matrix.f, ")"));

            //             let allowedTags = [
            //                 'a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion',
            //                 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse',
            //                 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
            //                 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA',
            //                 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
            //                 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
            //                 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src',
            //                 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient',
            //                 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline',
            //                 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text',
            //                 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern'
            //             ];

            //             let elements = subSVG.querySelectorAll('*');

            //             elements.forEach(function (element) {
            //                 if (!allowedTags.includes(element.tagName.toLowerCase())) {
            //                     element.parentNode.removeChild(element);
            //                 }
            //             });

            //             g.innerHTML = subSVG.innerHTML;

            //             base.content.appendChild(g);

            //             _this.fit();

            //             selector = new Selector();

            //         }
            //     }

            //     reader.readAsDataURL(selectedFile[0]);
            // });


        }
    }

    background = {
        set: () => {

            let scale = this.scale;
            let option = this.bg;

            if (option.child) {
                this.canvasBackground.appendChild(option.child);
            } else {

                let path = document.createElementNS(this.ns, 'path');
                path.setAttribute('d', 'm 0 0 v ' + (option.width * scale) + ' h ' + (option.height * scale) + ' v -' + (option.width * scale) + ' h -' + (option.height * scale));
                path.setAttribute('fill', option.fill);
                path.setAttribute('stroke-width', 1);
                path.setAttribute('stroke', '#000');
                path.setAttribute('vector-effect', 'non-scaling-stroke');

                this.canvasBackground.appendChild(path);
            }

            if (this.contentString) {
                this.svgcontent.innerHTML = this.contentString;
            }

        }

    }

    ruler = {

        r_intervals: [],
        ruler_x: null,
        ruler_y: null,

        create: (width, height) => {

            let rulers = document.createElement('DIV');

            let ruler_corner = document.createElement('DIV');

            let ruler_x = document.createElement('DIV');
            let ruler_x_div = document.createElement('DIV');
            let canvas_ruler_x = document.createElement('CANVAS');

            let ruler_y = document.createElement('DIV');
            let ruler_y_div = document.createElement('DIV');
            let canvas_ruler_y = document.createElement('CANVAS');

            this.ruler.ruler_x = ruler_x;
            this.ruler.ruler_y = ruler_y;

            rulers.setAttribute('id', 'rulers');
            ruler_corner.setAttribute('id', 'ruler_corner');

            ruler_x.setAttribute('id', 'ruler_x');
            ruler_x_div.style.width = width + 'px';
            ruler_x_div.appendChild(canvas_ruler_x);
            ruler_x.appendChild(ruler_x_div);

            ruler_y.setAttribute('id', 'ruler_y');
            ruler_y_div.style.height = height + 'px';
            ruler_y_div.appendChild(canvas_ruler_y);
            ruler_y.appendChild(ruler_y_div);

            rulers.appendChild(ruler_corner);
            rulers.appendChild(ruler_x);
            rulers.appendChild(ruler_y);

            this.dom.appendChild(rulers);

            this.ruler.r_intervals = [];

            for (var i = .1; i < 1E5; i *= 10) {
                this.ruler.r_intervals.push(1 * i);
                this.ruler.r_intervals.push(2 * i);
                this.ruler.r_intervals.push(5 * i);
            }

            let _this = this;

            this.workarea.addEventListener("scroll", function () {
                // _this.ruler.ruler_x.scrollLeft = _this.workarea.scrollLeft;
                // _this.ruler.ruler_y.scrollTop = _this.workarea.scrollTop;
                // _this.ruler.update();
            });

            this.ruler.update(1);

        },
        update: () => {

            const gray = '#000';

            var limit = 30000;
            // var c_elem = this.canvasBackground;
            var unit = 1;

            let workarea = this.workarea.getBoundingClientRect();
            let canvasBackground = this.canvasBackground.getBoundingClientRect();
            let bbox = this.canvasBackground.getBBox();


            let offsetX = (canvasBackground.x - workarea.x) - bbox.x;
            let offsetY = (canvasBackground.y - workarea.y) - bbox.y;

            for (var d = 0; d < 2; d++) {
                var is_x = (d === 0);
                var dim = is_x ? 'x' : 'y';
                var lentype = is_x ? 'width' : 'height';
                var notlentype = is_x ? 'height' : 'width';
                // var content_d = c_elem.getAttribute(dim);

                var content_d;

                if (dim === 'x') {
                    content_d = offsetX;
                } else {
                    content_d = offsetY;
                }

                var hcanv = this.dom.querySelector('#ruler_' + dim + ' canvas');

                // Set the canvas size to the width of the container

                // var ruler_len = this.svgcanvas[lentype === "width" ? "offsetWidth" : "offsetHeight"];

                var ruler_len = lentype === "width" ? workarea.width : workarea.height;

                var total_len = ruler_len;
                hcanv.parentNode.style[lentype] = total_len + 'px';

                var canv_count = 1;
                var ctx_num = 0;
                var ctx_arr;
                var ctx = hcanv.getContext("2d");
                var scale = window.devicePixelRatio * 2 || 1;
                hcanv.style[lentype] = total_len + "px";
                hcanv.style[notlentype] = 16 + "px";
                hcanv[lentype] = Math.floor(total_len * scale);
                hcanv[notlentype] = Math.floor(16 * scale);
                ctx.scale(scale, scale);

                // Remove any existing canvasses
                // $(hcanv).siblings().remove();

                this.ruler.removeSiblings(hcanv);

                // Create multiple canvases when necessary (due to browser limits)
                if (ruler_len >= limit) {
                    var num = parseInt(ruler_len / limit) + 1;
                    ctx_arr = Array(num);
                    ctx_arr[0] = ctx;
                    for (var i = 1; i < num; i++) {
                        hcanv[lentype] = limit;
                        var copy = hcanv.cloneNode(true);
                        hcanv.parentNode.appendChild(copy);
                        ctx_arr[i] = copy.getContext('2d');
                    }

                    copy[lentype] = ruler_len % limit;

                    // set copy width to last
                    ruler_len = limit;
                }

                hcanv[lentype] = ruler_len * scale;

                var u_multi = unit * this.scale;

                // Calculate the main number interval
                var raw_m = 50 / u_multi;
                var multi = 1;
                for (var i = 0; i < this.ruler.r_intervals.length; i++) {
                    var num = this.ruler.r_intervals[i];
                    multi = num;
                    if (raw_m <= num) {
                        break;
                    }
                }

                var big_int = multi * u_multi;
                ctx.font = "400 8px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif";
                ctx.fillStyle = gray;
                ctx.strokeStyle = gray;
                ctx.scale(scale, scale);
                var ruler_d = ((content_d / u_multi) % multi) * u_multi - 50;
                var label_pos = ruler_d - big_int;
                for (; ruler_d < total_len; ruler_d += big_int) {
                    label_pos += big_int;
                    var real_d = ruler_d - content_d;

                    var cur_d = Math.round(ruler_d);
                    if (is_x) {
                        ctx.moveTo(cur_d + 0.5, 15);
                        ctx.lineTo(cur_d + 0.5, 0);
                    } else {
                        ctx.moveTo(15, cur_d + 0.5);
                        ctx.lineTo(0, cur_d + 0.5);
                    }

                    var num = (label_pos - content_d) / u_multi;
                    var label;
                    if (multi >= 1) {
                        label = Math.round(num);
                    } else {
                        var decs = (multi + '').split('.')[1].length;
                        label = num.toFixed(decs) - 0;
                    }

                    // Change 1000s to Ks
                    // if (label !== 0 && label !== 1000 && label % 1000 === 0) {
                    //     label = (label / 1000) + 'K';
                    // }

                    if (is_x) {
                        ctx.fillText(label, ruler_d + 2, 8);
                        ctx.fillStyle = gray;
                    } else {
                        var str = (label + '').split('');
                        for (var i = 0; i < str.length; i++) {
                            ctx.fillText(str[i], 1, (ruler_d + 9) + i * 9);
                            ctx.fillStyle = gray;
                        }
                    }

                    var part = big_int / 10;
                    for (var i = 1; i < 10; i++) {
                        var sub_d = Math.round(ruler_d + part * i) + .5;
                        if (ctx_arr && sub_d > ruler_len) {
                            ctx_num++;
                            ctx.stroke();
                            if (ctx_num >= ctx_arr.length) {
                                i = 10;
                                ruler_d = total_len;
                                continue;
                            }
                            ctx = ctx_arr[ctx_num];
                            ruler_d -= limit;
                            sub_d = Math.round(ruler_d + part * i) + .5;
                        }

                        var line_num = (i % 2) ? 12 : 10;
                        if (is_x) {
                            ctx.moveTo(sub_d, 15);
                            ctx.lineTo(sub_d, line_num);
                        } else {
                            ctx.moveTo(15, sub_d);
                            ctx.lineTo(line_num, sub_d);
                        }
                    }
                }
                ctx.strokeStyle = gray;
                ctx.stroke();
            }
        },
        getSiblings: (element) => {
            // สร้างอาร์เรย์สำหรับเก็บ siblings
            const siblings = [];

            // เลือก parent element ของ element ที่กำหนด
            let sibling = element.parentNode.firstChild;

            // วนลูปผ่าน siblings ทั้งหมด
            while (sibling) {
                // ตรวจสอบว่า sibling นั้นไม่ใช่ element ที่กำหนดและเป็น element node
                if (sibling.nodeType === 1 && sibling !== element) {
                    siblings.push(sibling);
                }
                sibling = sibling.nextSibling;
            }

            return siblings;
        },
        removeSiblings: (element) => {
            // เลือก parent element ของ element ที่กำหนด
            const parent = element.parentNode;

            // ตรวจสอบว่า parent element มีอยู่ใน DOM หรือไม่
            if (!parent) {
                console.error('Parent element not found.');
                return;
            }

            // วนลูปผ่าน children ทั้งหมดของ parent
            let child = parent.firstChild;
            while (child) {
                // เก็บ nextSibling ไว้ก่อน เนื่องจากการลบ element จะทำให้การอ้างอิง nextSibling เปลี่ยนไป
                const nextSibling = child.nextSibling;

                // ตรวจสอบว่า child นั้นไม่ใช่ element ที่กำหนดและเป็น element node
                if (child.nodeType === 1 && child !== element) {
                    parent.removeChild(child);
                }

                // ย้ายไปยัง sibling ถัดไป
                child = nextSibling;
            }
        }
    }

    zoom = (zooming) => {

        // let scale = zooming / 100;

        let svgcanvas = this.svgcanvas.getBoundingClientRect();

        this.SvgPanZoom.zoom(this.panzoom, zooming, {
            origin: {
                x: svgcanvas.x + (svgcanvas.width / 2),
                y: svgcanvas.y + (svgcanvas.height / 2)
            },
            minScale: +this.SvgPanZoom.options.minScale || this.SvgPanZoom.defaultOptions.minScale,
            maxScale: +this.SvgPanZoom.options.maxScale || this.SvgPanZoom.defaultOptions.maxScale,
        });

        this.ruler.update();
    }

    fit = () => {

        let clientWidth = this.workarea.clientWidth;
        let clientHeight = this.workarea.clientHeight;

        let size = this.draw.getBoundingClientRect();

        let w = clientWidth / (size.width);
        let h = clientHeight / (size.height);

        let scale = Math.min(w, h) * 0.8;

        let svgcanvas = this.svgcanvas.getBoundingClientRect();

        this.SvgPanZoom.zoom(this.panzoom, scale, {
            origin: {
                x: svgcanvas.x + (svgcanvas.width / 2),
                y: svgcanvas.y + (svgcanvas.height / 2)
            },
            minScale: +this.SvgPanZoom.options.minScale || this.SvgPanZoom.defaultOptions.minScale,
            maxScale: +this.SvgPanZoom.options.maxScale || this.SvgPanZoom.defaultOptions.maxScale,
        });

        this.center();

    }

    center = () => {

        let draw = this.draw.getBoundingClientRect();
        let svgcanvas = this.svgcanvas.getBoundingClientRect();

        let x = draw.x - svgcanvas.x;
        let y = draw.y - svgcanvas.y;

        let cx = x - ((svgcanvas.width - draw.width) / 2);
        let cy = y - ((svgcanvas.height - draw.height) / 2);

        this.SvgPanZoom.pan(this.panzoom, cx, cy);
        this.ruler.update();
    }

    svg = {
        bbox: (element) => {

            let rect = element.getBoundingClientRect();

            let center = {
                x: (rect.x + rect.width / 2),
                y: (rect.y + rect.height / 2)
            }

            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                center: center
            }

        },

        matrixToString: (m) => {
            var a = m.a,
                b = m.b,
                c = m.c,
                d = m.d,
                e = m.e,
                f = m.f;
            return "matrix(".concat(a, ",").concat(b, ",").concat(c, ",").concat(d, ",").concat(e, ",").concat(f, ")");
        },

        getMatrix: (element) => {
            var matrix = element.parentNode
                .getScreenCTM()
                .inverse()
                .multiply(element.getScreenCTM());
            return matrix;
        }
    }

    remove = () => {

        this.distroy();

        for (let i in toolHandlerArray) {
            if (toolHandlerArray[i]) {
                toolHandlerArray[i].removeAllEventListeners();
            }
        }

        document.getElementById('editor').innerHTML = '';
    }

    getMousePosition = (evt) => {
        const CTM = this.svgroot.getScreenCTM();

        let x = this.calc('x', (evt.clientX - CTM.e) / CTM.a);
        let y = this.calc('y', (evt.clientY - CTM.f) / CTM.d);

        return {
            x: x,
            y: y
        };
    }

    calc = (type, num) => {

        var matrix = this.content.parentNode.getScreenCTM().inverse().multiply(this.content.getScreenCTM());

        let n = null;

        if (type === 'x') {
            let svgX = Number(this.svgcontent.getAttribute('x'));
            n = ((num - svgX) - matrix.e) / matrix.a;
        }

        if (type === 'y') {
            let svgY = Number(this.svgcontent.getAttribute('y'));
            n = ((num - svgY) - matrix.f) / matrix.a;
        }

        return n;
    }

}

window.Viewer = Viewer;

// viewer = new window.Viewer('editor', {
//     background: {
//         x: size.x,
//         y: size.y,
//         width: size.width,
//         height: size.height,
//         fill: '#fff',
//         child: child
//     },
//     content: content
// });