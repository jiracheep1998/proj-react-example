import React, { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { manager, update, addClassname, getClassname, updateClassname } from '../lib/request';

import { Modal } from 'bootstrap';

import $ from 'jquery';

import moment from 'moment';

import Navbar from '../Navbar';
import Sidebar from '../Sidebar';


import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ClassName(props) {

    var { style, class_id, object_name, style_name } = useParams();

    let id = class_id,
        name = object_name;

    useEffect(function () {

        const modal_add = new Modal($('#modal-add')[0]);
        const modal_edit = new Modal($('#modal-edit')[0]);

        function load() {

            let form = {
                state: 'get',
                id: id
            }

            getClassname(style + '/' + class_id, form, (data) => {

                $('table tbody').empty();

                $('#key').val(name[0] + name[1] + '_' + (data.length + 1));

                if (data.length > 0) {

                    data.map((item, i) => {

                        let tr = '<tr>' +
                            '<th scope="row">' + item.key + '</th>' +
                            '<td>' + item.name + '</td>' +
                            '<td class="d-none d-lg-block t-b-57">' + moment(item.update_date).fromNow(true) + '</td>' +
                            '<td>' +
                            '<button id="' + item.id + '" data-key="' + item.key + '" data-number="' + (i + 1) + '" data-name="' + item.name + '" type="button" class="table-edit btn btn-sm mr-2" state="' + item.is_delete + '" style="background-color: #6c6cff; color: #fff;">Edit</button>' +
                            '<button id="' + item.id + '" type="button" class="table-status btn btn-secondary btn-sm btn-status mr-2" state="' + item.status + '">' + (item.status == 0 ? 'Hide' : 'Show') + '</button>' +
                            '<button id="' + item.id + '" type="button" class="table-delete btn btn-danger btn-sm" state="' + item.is_delete + '">Delele</button>' +
                            '</td>' +
                            '</tr>';

                        $('table tbody').append(tr);

                    });
                }
            });
        }

        load();

        $('table').on('click', function (e) {

            if ($(e.target).hasClass('table-edit')) {
                let id = $(e.target).attr('id');
                let name = $(e.target).attr('data-name');
                let number = $(e.target).attr('data-number');
                let key = $(e.target).attr('data-key');

                $('#edit-name').text(name);
                $('#edit-number').text(number);

                $('#modal-edit #form-edit').attr('data-id', id);

                $('#modal-edit #rekey').val(key);
                $('#modal-edit #rekey').attr('data-key', key);
                $('#modal-edit #rename').val(name);

                modal_edit.show();
            }

            if ($(e.target).hasClass('table-delete')) {
                const confirmSwal = withReactContent(Swal);

                confirmSwal.fire({
                    customClass: {
                        confirmButton: 'btn btn-custom',
                        cancelButton: 'btn btn-custom'
                    },
                    title: 'Delete',
                    text: "Do you want to delete ?",
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#ccc',
                    confirmButtonText: 'Delete'
                }).then((result) => {
                    if (result.isConfirmed) {

                        let form = {
                            state: 'update',
                            field: 'delete',
                            id: $(e.target).attr('id'),
                            value: $(e.target).attr('state') == 0 ? 1 : 0
                        }
                        updateClassname(style + '/' + class_id, form, (data) => {
                            if (!data.error) {
                                load();
                                const uploadSwal = withReactContent(Swal);
                                uploadSwal.fire({
                                    title: <p>Delele successfully...</p>,
                                    icon: 'success',
                                    toast: true,
                                    position: 'bottom-end',
                                    showConfirmButton: false,
                                    timer: 3000,
                                    timerProgressBar: true,
                                });
                            } else {
                                const uploadSwal = withReactContent(Swal);
                                uploadSwal.fire({
                                    title: <p>Delele failed...</p>,
                                    icon: 'error',
                                    toast: true,
                                    position: 'bottom-end',
                                    showConfirmButton: false,
                                    timer: 3000,
                                    timerProgressBar: true,
                                });
                            }
                        });
                    }
                })
            }

            if ($(e.target).hasClass('table-status')) {

                if ($(e.target).attr('state') == '0') {
                    const confirmSwal = withReactContent(Swal);

                    confirmSwal.fire({
                        customClass: {
                            confirmButton: 'btn btn-custom',
                            cancelButton: 'btn btn-custom'
                        },
                        title: 'Hide',
                        text: "Do you want to hide ?",
                        showCancelButton: true,
                        confirmButtonColor: '#545b62',
                        cancelButtonColor: '#ccc',
                        confirmButtonText: 'Hide'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let form = {
                                state: 'update',
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            updateClassname(style + '/' + class_id, form, (data) => {
                                if (!data.error) {
                                    load();
                                    const uploadSwal = withReactContent(Swal);
                                    uploadSwal.fire({
                                        title: <p>Hide successfully...</p>,
                                        icon: 'success',
                                        toast: true,
                                        position: 'bottom-end',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                    });
                                } else {
                                    const uploadSwal = withReactContent(Swal);
                                    uploadSwal.fire({
                                        title: <p>Hide failed...</p>,
                                        icon: 'error',
                                        toast: true,
                                        position: 'bottom-end',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                    });
                                }
                            });
                        }
                    })
                } else {
                    const confirmSwal = withReactContent(Swal);

                    confirmSwal.fire({
                        customClass: {
                            confirmButton: 'btn btn-custom',
                            cancelButton: 'btn btn-custom'
                        },
                        title: 'Show',
                        text: "Do you want to show ?",
                        showCancelButton: true,
                        confirmButtonColor: '#545b62',
                        cancelButtonColor: '#ccc',
                        confirmButtonText: 'Show'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let form = {
                                state: 'update',
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            updateClassname(style + '/' + class_id, form, (data) => {
                                if (!data.error) {
                                    load();
                                    const uploadSwal = withReactContent(Swal);
                                    uploadSwal.fire({
                                        title: <p>Show successfully...</p>,
                                        icon: 'success',
                                        toast: true,
                                        position: 'bottom-end',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                    });
                                } else {
                                    const uploadSwal = withReactContent(Swal);
                                    uploadSwal.fire({
                                        title: <p>Show failed...</p>,
                                        icon: 'error',
                                        toast: true,
                                        position: 'bottom-end',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                    });
                                }
                            });
                        }
                    })
                }
            }
        });


        $('#form-add').on('submit', function (e) {
            e.preventDefault();

            let form = {
                state: 'add',
                id: id,
                key: $(e.target).find('#key').val(),
                name: $(e.target).find('#name').val().replace(/ /g, '_')
            }
            addClassname(style + '/' + class_id, form, (data) => {
                if (!data.error) {
                    modal_add.hide();
                    load();
                    const uploadSwal = withReactContent(Swal);
                    uploadSwal.fire({
                        title: <p>Add successfully...</p>,
                        icon: 'success',
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                    $('#key').val('');
                    $('#name').val('');
                } else {
                    const uploadSwal = withReactContent(Swal);
                    uploadSwal.fire({
                        title: <p>Add failed...</p>,
                        icon: 'error',
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        });

        $('#form-edit').on('submit', function (e) {
            e.preventDefault();

            let key = $('#modal-edit #rekey').attr('data-key');

            let data = {
                key: $(e.target).find('#rekey').val(),
                name: $(e.target).find('#rename').val()
            }

            let form = {
                state: 'update',
                field: 'edit',
                id: $(e.target).attr('data-id'),
                style_id: style,
                class_id: class_id,
                key: key,
                value: data
            }
            updateClassname(style + '/' + class_id, form, (data) => {
                if (!data.error) {
                    modal_edit.hide();
                    load();
                    const uploadSwal = withReactContent(Swal);
                    uploadSwal.fire({
                        title: <p>Edit successfully...</p>,
                        icon: 'success',
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                } else {
                    const uploadSwal = withReactContent(Swal);
                    uploadSwal.fire({
                        title: <p>Edit failed...</p>,
                        icon: 'error',
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        });

        $('#btn-add').on('click', function (e) {
            modal_add.show();
        });

    }, []);

    return (
        <div className="wrapper">
            <Sidebar />
            <div id="content">
                <Navbar />


                <div className="row m-0 mb-4 justify-content-center">
                    <h2>{style_name.charAt(0).toUpperCase() + style_name.slice(1) + ' / ' + object_name}</h2>
                </div>

                <div className="row m-0 mb-4 justify-content-center">
                    <div className="col-12 col-lg-8 text-right">
                        <button id="btn-add" type="button" className="btn btn-primary btn-custom"><i className="fas fa-plus"></i> Add</button>
                    </div>
                </div>

                <div className="row m-0 mb-4 justify-content-center">
                    <table className="col-12 col-lg-8">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col" className="d-none d-lg-block">Update date</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>


                <div className="modal fade" id="modal-add" tabIndex="1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Class {name}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>
                            <form id="form-add">
                                <div className="modal-body">

                                    <div>
                                        <div className="form-group row">
                                            <label htmlFor="key" className="col-sm-2 col-form-label">Key</label>
                                            <div className="col-sm-10">
                                                <input type="text" className="form-control" id="key" placeholder={'Ex. ' + name[0].toLowerCase() + name[1].toLowerCase() + '_1'} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="name" className="col-sm-2 col-form-label">Name</label>
                                            <div className="col-sm-10">
                                                <input type="text" className="form-control" id="name" placeholder={'Ex. ' + name} required />
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <div className="modal-footer" style={{ flexWrap: 'inherit' }}>

                                    <div className="text-right" style={{ width: '100%' }}>
                                        <button type="submit" className="btn btn-primary btn-custom">Add</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="modal-edit" tabIndex="1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">

                                <h5 className="modal-title">
                                    <span className="mr-2">Edit</span>
                                    <span className="" style={{ color: '#c5c5c5' }}>#</span>
                                    <span id="edit-number" className="mr-2" style={{ color: '#c5c5c5' }}></span>
                                    <span id="edit-name" className="mr-2" style={{ color: '#c5c5c5' }}></span>
                                </h5>

                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>
                            <form id="form-edit">
                                <div className="modal-body">
                                    <div>

                                        <div className="form-group row">
                                            <label htmlFor="key" className="col-sm-2 col-form-label">Key</label>
                                            <div className="col-sm-10">
                                                <input type="text" className="form-control" id="rekey" required />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="name" className="col-sm-2 col-form-label">Name</label>
                                            <div className="col-sm-10">
                                                <input type="text" className="form-control" id="rename" required />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="modal-footer" style={{ flexWrap: 'inherit' }}>

                                    <div className="text-right" style={{ width: '100%' }}>
                                        <button type="submit" className="btn btn-primary btn-custom">Save</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>


            </div>

        </div>
    );
}
