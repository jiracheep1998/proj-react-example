

class EventEmitter {
    constructor() {
        this.events = {};
    }

    event = {
        on: (event, listener) => {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
            return this;
        },
        off: (event, listener) => {
            if (!this.events[event]) return this;

            this.events[event] = this.events[event].filter(l => l !== listener);
            return this;
        },
        emit: (event, ...args) => {
            if (!this.events[event]) return this;

            this.events[event].forEach(listener => listener.apply(this, args));
            return this;
        },
        distroy: () => {
            this.events['mousedown'] = [];
            this.events['mouseup'] = [];
            this.events['mousemove'] = [];
        }
    }
}

class Editor extends EventEmitter {

    constructor(id) {

        super();

        this.view.createSVG(id);

        this.addEventListener();

    }

    create() {

    }

    addEventListener() {

        const _this = this;

        document.addEventListener('mousedown', function (event) {
            _this.event.emit('mousedown', event);
        });

        document.addEventListener('mouseup', function (event) {
            _this.event.emit('mouseup', event);
        });

        document.addEventListener('mousemove', function (event) {
            _this.event.emit('mousemove', event);
        });
    }

    view = {
        createSVG: (id) => {

            document.body.style.overflow = 'hidden';

            let parent = document.getElementById(id);
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100vh');
            parent.appendChild(svg);

            
        },
        createToolbar: () => {

        }
    }




    // view = {
    //     createSVG: function(id){
    //         let parent = document.querySelectorAll(id);

    //         let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    //         parent[0].append(svg);
    //     }
    // }

    tool = {
        select: () => {
            this.event.delete();
        }
    }

    shape = {
        path: () => {

            this.event.distroy();

            this.event.on('mousedown', (event) => {
   
            });

            this.event.on('mouseup', () => {
                
            });

            this.event.on('mousemove', () => {

            });

        },
        line: ()=> {

            this.event.distroy();

            this.event.on('mousedown', (event) => {
   
            });

            this.event.on('mouseup', () => {
                
            });

            this.event.on('mousemove', () => {

            });

        },
        circle: () => {

            this.event.distroy();

            this.event.on('mousedown', (event) => {
   
            });

            this.event.on('mouseup', () => {
                
            });

            this.event.on('mousemove', () => {

            });
            
        },
        rect: () => {

            this.event.distroy();

            this.event.on('mousedown', (event) => {
   
            });

            this.event.on('mouseup', () => {
                
            });

            this.event.on('mousemove', () => {

            });
            
        }
    }

    func = {

    }

}