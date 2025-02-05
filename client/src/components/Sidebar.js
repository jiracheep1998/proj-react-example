import React from 'react';

// import { Collapse } from 'bootstrap';

// import 'bootstrap/dist/js/bootstrap.bundle.min';

import './css/Sidebar.css';

export default function Sidebar() {

    const host = window.location.origin;

    return (
        <nav id="sidebar">
           
            <ul className="list-unstyled components">
                <li>
                    <a href="#floorpanSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle collapsed">Class</a>
                    <ul className="list-unstyled collapse show" id="floorpanSubmenu">
                        <li>
                            <a data-id="wall" href="/wall">
                                <img src={host + '/menu/wall.png'} height={25}></img>
                                <span className="ml-1">Wall</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="door" href="/door">
                                <img src={host + '/menu/door.png'} height={25}></img>
                                <span className="ml-1">Door</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="window" href="/window">
                                <img src={host + '/menu/window.png'} height={25}></img>
                                <span className="ml-1">Window</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="stair" href="/stair">
                                <img src={host + '/menu/stair.png'} height={25}></img>
                                <span className="ml-1">Stair</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="kitchen" href="/kitchen">
                                <img src={host + '/menu/kitchen.png'} height={25}></img>
                                <span className="ml-1">Kitchen</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="bathroom" href="/bathroom">
                                <img src={host + '/menu/bathroom.png'} height={25}></img>
                                <span className="ml-1">Bathroom</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="bedroom" href="/bedroom">
                                <img src={host + '/menu/bedroom.png'} height={25}></img>
                                <span className="ml-1">Bedroom</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="livingroom" href="/livingroom">
                                <img src={host + '/menu/livingroom.png'} height={25}></img>
                                <span className="ml-1">Livingroom</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="garden" href="/garden">
                                <img src={host + '/menu/garden.svg'} height={25}></img>
                                <span className="ml-1">Garden</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="material" href="/material">
                                <img src={host + '/menu/material.svg'} height={25}></img>
                                <span className="ml-1">Material</span>
                            </a>
                        </li>
                        <li>
                            <a data-id="object" href="/object">
                                <img src={host + '/menu/objects.png'} height={25}></img>
                                <span className="ml-1">Object</span>
                            </a>
                        </li>
                    </ul>
                </li>


                <li>
                    <a href="#managerSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle collapsed">Manager</a>
                    <ul className="list-unstyled collapse show" id="managerSubmenu">

                        <li>
                            
                            <a data-id="style" href="/manager/style">
                                <img src={host + '/menu/tool.png'} height={25}></img>
                                <span className="ml-3">Style</span>
                            </a>
                        </li>

                    </ul>
                </li>

            </ul>
        </nav>

    );
}
