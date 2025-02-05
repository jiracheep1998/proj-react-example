import React, { useState, useEffect } from 'react';
import md5 from 'md5';
import Cookies from 'js-cookie';

import { login } from './lib/request';

import './css/Login.css';

export default function Login(props) {
    useEffect(function () {
        try {
            document.getElementsByTagName('form')[0].addEventListener('submit', function (e) {
                e.preventDefault();

                let email = document.querySelectorAll('input[name="email"]')[0].value;
                let password = document.querySelectorAll('input[name="password"]')[0].value;
                let remember = document.querySelectorAll('input[name="remember"]')[0].checked;

                let form = {
                    email: email,
                    password: md5(password),
                    remember: remember
                }

                login(form, data => {
                    if (data.user_id && data.token) {
                        // localStorage.setItem('user_id', data.user_id);
                        // localStorage.setItem('name', data.name);
                        // localStorage.setItem('token', data.token);

                        Cookies.set('user_id', data.user_id, { expires: 7, path: '/' });
                        Cookies.set('name', data.name, { expires: 7, path: '/' });
                        Cookies.set('token', data.token, { expires: 7, path: '/' });

                        window.location.reload();
                    }
                });
            });
        } catch { }
    }, []);

    if (!sessionStorage.getItem('isLogined')) {

        return (
            <div className="wrapper">
                <div className="container-login">
                    <div className="wrap-login mb-5">
                        <form className="login-form validate-form flex-sb flex-w" method="POST">
                            <span className="login-form-title pb-5">
                                PZ Plan
                            </span>
                            <div className="wrap-input validate-input mb-3" data-validate="Email is required">
                                <input className="input" type="text" name="email" placeholder="E-mail" required />
                                <span className="focus-input" />
                                <span className="text-danger" />
                            </div>
                            <div className="wrap-input validate-input mb-3" data-validate="Password is required">
                                <input className="input" type="password" name="password" placeholder="Password" required />
                                <span className="focus-input" />
                                <span className="text-danger" />
                            </div>
                            <div style={{ width: '100%' }}>
                            </div>
                            <div className="pt-1 pb-3" style={{ display: 'flex' }}>
                                <div className="checkbox custom-control custom-checkbox" style={{ width: '100%' }}>
                                    <input id="customCheck1" className="custom-control-input" type="checkbox" name="remember" />
                                    <label htmlFor="customCheck1" className="custom-control-label"> Remember me</label>
                                </div>
                            </div>
                            <div className="container-login-form-btn m-t-17">
                                <button type="submit" className="btn login-form-btn">
                                    <i className="fa fa-key" /> &nbsp;
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        );
    } else {
        return (<></>);
    }
}
