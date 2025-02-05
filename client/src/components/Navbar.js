import React from 'react';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';

import { logout } from './lib/request';

import './css/Navbar.css';

export default function NavbarSide() {

    const navigate = useNavigate();

    function Logout() {

        logout(() => {
            // localStorage.removeItem('token');
            Cookies.remove('token', { path: '/' });
            sessionStorage.removeItem('isLogined');
            navigate('/login');
        });
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <ul className="navbar-nav mr-auto">
                    <button type="button" id="sidebarCollapse" className="navbar-btn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <li className="nav-item dropdown d-none d-lg-block">
                        <a className="nav-link" data-toggle="dropdown">
                            WEB
                        </a>
                    </li>
                </ul>
                <ul className="logotip nav navbar-nav ml-auto mr-auto d-sm-block d-lg-none">WEB</ul>
                <ul className="nav navbar-nav ml-auto">

                    <li className="nav-item dropdown d-none d-lg-block">
                        <a className="nav-link" data-toggle="dropdown">
                            {/* {localStorage.getItem('name')} */}
                            {Cookies.get('name')}
                        </a>
                    </li>

                    <li className="nav-item dropdown">
                        <a className="nav-link" data-toggle="dropdown" href="#" aria-expanded="false" title="Logout" onClick={Logout}>
                            <i className="fas fa-sign-out-alt" />
                        </a>
                    </li>

                </ul>

            </div>
        </nav>


    );
}
