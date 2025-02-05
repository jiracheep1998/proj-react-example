import React, { useState, useEffect, useRef } from 'react';
import $, { grep } from 'jquery';

import './css/Home.css';

import Cookies from 'js-cookie';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

import { getStyle, getType, getClass, getName, list, upload, update, updateDoorStair } from './lib/request';

import { Modal } from 'bootstrap';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Home(props) {

    useEffect(function () {

        // const modal_upload_file = new Modal($('#modal-upload-file')[0]);

        // function format(selectedFile, fileType, callabck) {

        //     let reader = new FileReader();

        //     reader.onload = function (e) {

        //         window.base64Data = e.target.result;

        //         window.base64 = window.base64Data.toString().replace(/^data:(.*,)?/, '');

        //         if (fileType === 'svg') {

        //             let svgText = atob(window.base64);

        //             // svgo.config.plugins[4][1].active = false;
        //             // svgo.config.plugins[4][3].active = false;
        //             // svgo.config.plugins[6][0].active = false;

        //             // svgo.config.plugins[3][0].active = false;

        //             // svgo.config.plugins[1][1].active = false;

        //             // svgo.config.plugins[11][5].active = false;

        //             // svgo.optimize(svgText).then((result) => {

        //             //     console.log('optimize')

        //             // svgText = result.data;

        //             size = svgText.length;

        //             let div = document.createElement('div');
        //             div.innerHTML = svgText;

        //             let svgElement = div.querySelector('svg');
        //             // ตรวจสอบว่า xmlns และ xmlns:svg มีหรือไม่
        //             let hasXmlns = svgElement.getAttribute('xmlns');
        //             let hasXmlnsSvg = svgElement.getAttribute('xmlns:svg');
        //             width = svgElement.getAttribute('width');
        //             height = svgElement.getAttribute('height');
        //             let style = svgElement.getAttribute('style');

        //             // ถ้าไม่มี xmlns, เพิ่ม xmlns ลงใน SVG
        //             if (!hasXmlns) {
        //                 svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //             }
        //             // ถ้าไม่มี xmlns:svg, เพิ่ม xmlns:svg ลงใน SVG
        //             if (!hasXmlnsSvg) {
        //                 svgElement.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
        //             }

        //             if (!style) {
        //                 svgElement.setAttribute('style', 'overflow: visible');
        //             } else {
        //                 svgElement.style.overflow = 'visible';
        //             }

        //             let view = svgElement.cloneNode(true);

        //             view.setAttribute('width', SIZE_IMG_WIDTH);
        //             view.setAttribute('height', SIZE_IMG_HEIGHT);

        //             // แปลง SVG element กลับเป็น HTML string
        //             var svgString = new XMLSerializer().serializeToString(svgElement);

        //             let parser = new DOMParser();
        //             let xml = parser.parseFromString(svgString, "image/svg+xml");
        //             let dom = xml.querySelectorAll("svg")[0];

        //             document.body.appendChild(dom);

        //             let doc = parser.parseFromString(dom.outerHTML, "image/svg+xml");
        //             let output = doc.documentElement.outerHTML;

        //             window.base64 = btoa(output);

        //             // blob = new Blob([output], { type: "image/svg+xml;charset=utf-8" });
        //             // let link = URL.createObjectURL(blob);

        //             dom.remove();

        //             callabck([view.outerHTML, width, height]);
        //             // });

        //         } else if (fileType === 'png') {
        //             const img = new Image();
        //             img.src = window.base64Data;

        //             img.onload = function () {
        //                 width = img.width;
        //                 height = img.height;

        //                 callabck([window.base64Data, width, height]);
        //             };
        //         } else if (fileType === 'glb') {
        //             document.getElementById('model-3d').innerHTML = '';
        //             modal_preview.show();
        //             setTimeout(() => {
        //                 window.preview_3D();
        //             }, 500);
        //         }
        //     }

        //     reader.readAsDataURL(selectedFile[0]);
        // }

        // const inputElement = document.createElement('input');
        // inputElement.setAttribute('type', 'file');
        // inputElement.setAttribute('accept', '.svg, .png, .glb');
        // inputElement.classList.add('hidden');
        // inputElement.addEventListener('change', choose, false);

        // function choose(event, q) {
        //     try {
        //         let selectedFile;

        //         if (!q) {
        //             selectedFile = event.target.files;

        //         } else {
        //             selectedFile = event.dataTransfer.files;
        //         }

        //         fileType = selectedFile[0].name.split(".").pop();
        //         size = selectedFile[0].size;

        //         format(selectedFile, fileType, function (result) {

        //             document.querySelectorAll('.file-drop-zone')[0].classList.add("d-none");

        //             document.querySelectorAll('#show-upload-file')[0].setAttribute('class', 'd-block');
        //             document.querySelectorAll('#show-upload-file')[0].innerHTML = '';

        //             if (fileType == 'png') {
        //                 let img = document.createElement('img');
        //                 img.setAttribute('src', result[0]);

        //                 let w = width / SIZE_IMG_WIDTH;
        //                 let h = height / SIZE_IMG_HEIGHT;
        //                 let s = Math.max(w, h);

        //                 if (width > height) {
        //                     img.setAttribute('width', width / s);
        //                     img.setAttribute('height', height / s);
        //                 } else {
        //                     img.setAttribute('height', height / s);
        //                 }

        //                 document.querySelectorAll('#show-upload-file')[0].appendChild(img);
        //             } else if (fileType == 'svg') {

        //                 document.querySelectorAll('#show-upload-file')[0].innerHTML = result[0];
        //             }

        //             document.getElementById('upload-size').classList.remove('d-none');
        //             document.getElementById('upload-size').innerText = result[1] + ' x ' + result[2];

        //             $('#alert').empty();
        //         });
        //     } catch { }

        // }

        // $('#modal-change-transform').on('shown.bs.modal', function (e) {

        // });

        // $('#select-shape').on('change', function () {

        // })

        // $("#shape-rect input").on("change textInput select keyup", function (e) {

        // });

        // $('.setting-door-tabs .btn-setting-door').on('click', function () {

        // });

        // $('.view-door-item').delegate('select', 'change', function () {

        // });

        // $('.setting-door-tabs').delegate('input', 'change keyup', function () {

        // });

        // const uploadSwal = withReactContent(Swal);

        // uploadSwal.fire({
        //     title: <p>Upload successfully...</p>,
        //     icon: 'success',
        //     toast: true,
        //     position: 'bottom-end',
        //     showConfirmButton: false,
        //     timer: 3000,
        //     timerProgressBar: true,
        // });

        // const uploadSwal = withReactContent(Swal);

        // uploadSwal.fire({
        //     title: <p>Upload failed...</p>,
        //     icon: 'error',
        //     toast: true,
        //     position: 'bottom-end',
        //     showConfirmButton: false,
        //     timer: 3000,
        //     timerProgressBar: true,
        // });

        // const confirmSwal = withReactContent(Swal);

        // confirmSwal.fire({
        //     customClass: {
        //         confirmButton: 'btn btn-custom',
        //         cancelButton: 'btn btn-custom'
        //     },
        //     title: 'Save',
        //     text: "Do you want to save ?",
        //     showCancelButton: true,
        //     confirmButtonColor: 'rgb(102, 204, 153)',
        //     cancelButtonColor: '#ccc',
        //     confirmButtonText: 'Save'
        // }).then((result) => {

        //     if (result.isConfirmed) {

        //         var canvas = document.createElement('canvas');
        //         var context = canvas.getContext('2d');
        //         canvas.width = parseFloat(getWidth) * 37.7952755906;
        //         canvas.height = parseFloat(getHeight) * 37.7952755906;
        //         context.drawImage(img, 0, 0);
        //         var pngDataUrl = canvas.toDataURL('image/png');

        //         let form = {
        //             style_id: dataStyle[current[0]],
        //             type_id: dataType[current[1]],
        //             class_id: dataClass[current[2]],
        //             id: DATA_ID,
        //             name: DATA_NAME,
        //             fileType: 'svg',
        //             width: getWidth || 0,
        //             height: getHeight || 0,
        //             file: base64,
        //             size: base64.length,
        //             picture: pngDataUrl.split(',')[1]
        //         }

        //         upload(form, data => {

        //             if (!data.error) {

        //                 inputElement.value = '';

        //                 const uploadSwal = withReactContent(Swal);

        //                 uploadSwal.fire({
        //                     title: <p>Save successfully...</p>,
        //                     icon: 'success',
        //                     toast: true,
        //                     position: 'bottom-end',
        //                     showConfirmButton: false,
        //                     timer: 3000,
        //                     timerProgressBar: true,
        //                 });

        //                 load(function () {

        //                     modal_upload_file.hide();

        //                     load_callection();

        //                 });

        //             } else {

        //                 const uploadSwal = withReactContent(Swal);

        //                 uploadSwal.fire({
        //                     title: <p>Save failed...</p>,
        //                     icon: 'error',
        //                     toast: true,
        //                     position: 'bottom-end',
        //                     showConfirmButton: false,
        //                     timer: 3000,
        //                     timerProgressBar: true,
        //                 });
        //             }
        //         });
        //     }
        // });

    }, []);

    return (
        <div className="wrapper">

            <Sidebar />

            <div id="content">
            
                <Navbar />

                <div>Main</div>

                {/* <div className="row m-0 mb-4 justify-content-center">
                    <h2>{props.path ? props.path.charAt(0).toUpperCase() + props.path.slice(1) : 'Null'}</h2>
                </div> */}

                {/* <div className="row m-0 mb-5 justify-content-center">
                    <div className="col-12 col-xl-8">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupSelect01">Style</label>
                            </div>
                            <select className="custom-select" id="inputGroupSelect01">
                                <option selected>Choose...</option>
                                <option value={1}>One</option>
                                <option value={2}>Two</option>
                                <option value={3}>Three</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-xl-8">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupSelect01">Dimension</label>
                            </div>
                            <select className="custom-select" id="inputGroupSelect01">
                                <option selected>Choose...</option>
                                <option value={1}>2D</option>
                                <option value={2}>3D</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-xl-8">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupSelect01">type</label>
                            </div>
                            <select className="custom-select" id="inputGroupSelect01">
                                <option selected>Choose...</option>
                                <option value={1}>2.1</option>
                                <option value={2}>2.2</option>
                                <option value={3}>2.3</option>
                                <option value={3}>2.4</option>
                                <option value={3}>2.5</option>
                            </select>
                        </div>
                    </div>

                </div> */}

                {/* <div className="row m-0 mb-4 justify-content-center">
                    <div className="select-style">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupSelect01">Style</label>
                            </div>
                            <select className="custom-select form-control form-control-lg" id="select-style">
                                <option>#Select Style</option>

                            </select>
                        </div>
                    </div>
                </div> */}

                {/* <div id="btn-object" className="row m-0 mb-5 justify-content-center">
                    <div className="tabs" style={{ visibility: "hidden" }}>


                        <span className="glider" />
                    </div>

                </div> */}

                {/* <div className="row m-0 mb-5 justify-content-center">
                    <button id="btn-upload-file" type="button" className="btn btn-primary btn-custom">Upload File</button>
                </div> */}

                {/* <div className="row m-0 mb-4 justify-content-center">
                    <div className="col-md-8">
                        <div className="search">
                            <i className="fa fa-search" />
                            <input type="text" className="form-control" placeholder="Have a question? Ask Now" />
                            <button className="btn btn-primary">Search</button>
                        </div>
                    </div>
                </div> */}

                <div className="modal fade" id="modal-collection" tabIndex="1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: "1200px" }}>
                        <div className="modal-content" style={{ backgroundColor: '#fafafa' }}>
                            <div className="modal-header">

                                <h5>Collection</h5>

                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>

                            <div className="modal-body" style={{ overflow: "auto", height: "83vh" }}>
                                <section className="d-flex justify-content-center p-0">

                                    <div id="preview-collection" className="col-10 d-flex justify-content-center" style={{ flexWrap: 'wrap' }}></div>

                                </section>
                            </div>

                            <div className="modal-footer" style={{ flexWrap: 'inherit' }}>


                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="modal-change-color" tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: "30%" }}>
                        <div className="modal-content">
                            <div className="modal-header">

                                <h5>Color Editor</h5>

                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>

                            <div className="modal-body" style={{ paddingTop: 0 }}>

                                <div className="d-flex" style={{ height: '300px' }}>
                                    <div id="setting-view-color" className="d-flex justify-content-center align-items-center" style={{ width: '50%' }}></div>
                                    <div className="view-color-item" style={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
                                        <ul></ul>
                                    </div>
                                </div>
                                <div id="view-colors" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <div id="vc-fill">
                                        <div className="vc-title">Fill</div>
                                        <div className="vc-item"></div>
                                    </div>
                                    <div id="vc-stroke">
                                        <div className="vc-title">Stroke</div>
                                        <div className="vc-item"></div>
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer" style={{ flexWrap: 'inherit' }}>
                                <div className="text-left" style={{ width: '100%' }}>
                                    <button id="btn-reset-change-color" type="button" className="btn btn-change btn-custom">Reset</button>
                                </div>
                                <div className="text-right" style={{ width: '100%' }}>
                                    <button id="btn-save-change-color" type="button" className="btn btn-primary btn-custom">Save</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="modal fade" id="modal-change-transform" tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: "30%" }}>
                        <div className="modal-content">
                            <div className="modal-header">

                                <h5>Transform Editor</h5>

                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>

                            <div className="modal-body" style={{ paddingTop: 0 }}>

                                <div className="d-flex" style={{ height: '360px' }}>
                                    <div id="setting-view-transform" className="d-flex justify-content-center align-items-center" style={{ width: '68%', overflow: 'hidden' }}></div>
                                    <div className="view-transform-item" style={{ width: '33%', display: 'flex', justifyContent: 'center' }}>
                                        <ul style={{ width: '100%' }}></ul>
                                    </div>
                                </div>
                                <div id="view-transform" style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', marginTop: '15px' }}>

                                    <div id="vc-box">
                                        <div className="vc-title">Width</div>
                                        <div className="vc-item"><input id="svg-width" defaultValue="0" type="number" /></div>
                                    </div>
                                    <div id="vc-box">
                                        <div className="vc-title">Height</div>
                                        <div className="vc-item"><input id="svg-height" defaultValue="0" type="number" /></div>
                                    </div>
                                    <div id="vc-box">
                                        <div className="vc-title">viewBox</div>
                                        <div className="vc-item"><input id="svg-viewbox-x" type="number" defaultValue="0" /><input id="svg-viewbox-y" type="number" defaultValue="0" /><input id="svg-viewbox-width" type="number" defaultValue="0" /><input id="svg-viewbox-height" type="number" defaultValue="0" /></div>
                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer" style={{ flexWrap: 'inherit' }}>
                                <div className="text-left" style={{ width: '100%' }}>
                                    <button id="btn-reset-change-transform" type="button" className="btn btn-change btn-custom">Reset</button>
                                </div>
                                <div className="text-right" style={{ width: '100%' }}>
                                    <button id="btn-save-change-transform" type="button" className="btn btn-primary btn-custom">Save</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>

    );
}