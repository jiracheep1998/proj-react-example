import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { isExpired, decodeToken } from "react-jwt";

import Cookies from 'js-cookie';

import Login from './components/Login';
import Home from './components/Home';

import Style from './components/manager/Style';
import Type from './components/manager/Type';
import Class from './components/manager/Class';
import ClassName from './components/manager/ClassName';

import NotFound from './components/NotFound';

import 'bootstrap';

import './App.css';

import $ from 'jquery';

function App() {

  useEffect(function () {

    var sidebar = $('#sidebar');
    var content = $('#content');
    var sidebarCollapse = $('#sidebarCollapse');

    sidebarCollapse.on('click', () => {

      if (!sidebar.hasClass('active')) {
        sidebar.addClass('active');
        content.css('margin-left', '0');
      } else {
        sidebar.removeClass('active');
        content.css('margin-left', '250px');
      }

      if (!sidebarCollapse.hasClass('active')) {
        sidebarCollapse.addClass('active');
      } else {
        sidebarCollapse.removeClass('active');
      }

    });

  }, []);

  const location = useLocation();
  const currentPath = location.pathname;

  const SELECT_DATA = ['default', '2.2', 'wall', null];
  // const select = localStorage.getItem('select');
  const select = Cookies.get('select');

  if (!sessionStorage.getItem('previousUrl')) {
    sessionStorage.setItem('previousUrl', '/wall');
  }

  if (!select) {

    // localStorage.setItem('select', JSON.stringify(SELECT_DATA));
    Cookies.set('select', JSON.stringify(SELECT_DATA), { expires: 7, path: '/' });
  }

  // let token = localStorage.getItem('token');
  let token = Cookies.get('token');

  if (token) {

    if (isExpired(token)) {
      // localStorage.removeItem('token');
      Cookies.remove('token', { path: '/' });
      sessionStorage.removeItem('isLogined');
      return (
        <Login />
      );
    } else {
      sessionStorage.setItem('isLogined', false);
    }

  } else {
    return (
      <Login />
    );

  }

  if (currentPath == '/login') {
    window.location.href = sessionStorage.getItem('previousUrl');
  }

  if (currentPath != '/login') {
    sessionStorage.setItem('previousUrl', currentPath);
  }

  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Home path="wall" />} />
      <Route path="/wall" element={<Home path="wall" />} />
      <Route path="/door" element={<Home path="door" />} />
      <Route path="/window" element={<Home path="window" />} />
      <Route path="/stair" element={<Home path="stair" />} />
      <Route path="/kitchen" element={<Home path="kitchen" />} />
      <Route path="/bathroom" element={<Home path="bathroom" />} />
      <Route path="/bedroom" element={<Home path="bedroom" />} />
      <Route path="/livingroom" element={<Home path="livingroom" />} />
      <Route path="/garden" element={<Home path="garden" />} />
      <Route path="/material" element={<Home path="material" />} />
      <Route path="/object" element={<Home path="object" />} />

      <Route path="/manager/style" element={<Style path="style" />} />
      <Route path="/manager/:style/type/:name" element={<Type path="style" />} />
      <Route path="/manager/:style/class/:name" element={<Class path="style" />} />
      <Route path="/manager/:style/:class_id/:object_name/:style_name" element={<ClassName path="style" />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

}

export default App;
