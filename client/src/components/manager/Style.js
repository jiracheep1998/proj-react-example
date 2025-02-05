import React, { useEffect } from 'react';

import { manager, update, add } from '../lib/request';

import { Modal } from 'bootstrap';

import $ from 'jquery';

import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

import moment from 'moment';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Style(props) {

    useEffect(function () {
        document.querySelectorAll('[data-id="' + props.path + '"]')[0].style.background = '#474747';

        const modal_add = new Modal($('#modal-add')[0]);
        const modal_edit = new Modal($('#modal-edit')[0]);

        function load() {

            manager(props.path, (data) => {

                $('table tbody').empty();

                if (data.length > 0) {

                    $('#default-style').empty();
                    $('#default-style').append('<option value="" selected>None</option>');

                    data.map((item, i) => {

                        $('#default-style').append('<option value="' + item.id + '">' + item.name + '</option>');

                        let tr = '<tr>' +
                            '<th scope="row">' + (i + 1) + '</th>' +
                            '<td>' + item.name + '</td>' +
                            '<td class="d-none d-lg-block">' + moment(item.update_date).fromNow(true) + '</td>' +
                            '<td>' +
                            '<a href="' + item.id + '/type/' + item.name + '" type="button" class="btn btn-sm mr-2" style="background-color: #e91e63; color: #fff;">Type</a>' +
                            '<a href="' + item.id + '/class/' + item.name + '" type="button" class="btn btn-sm" style="background-color: #3f51b5; color: #fff;">Class</a>' +
                            '</td>' +
                            '<td>' +
                            '<button id="' + item.id + '" data-number="' + (i + 1) + '" data-name="' + item.name + '" type="button" class="table-edit btn btn-sm mr-2" state="' + item.is_delete + '" style="background-color: #6c6cff; color: #fff;">Edit</button>' +
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

                $('#edit-name').text(name);
                $('#edit-number').text(number);

                $('#modal-edit #form-edit').attr('data-id', id);
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
                            name: props.path,
                            field: 'delete',
                            id: $(e.target).attr('id'),
                            value: $(e.target).attr('state') == 0 ? 1 : 0
                        }
                        update('update', form, (data) => {
                            if (!data.error) {
                                load();
                                const uploadSwal = withReactContent(Swal);
                                uploadSwal.fire({
                                    title: <p>Delete successfully...</p>,
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
                                    title: <p>Delete failed...</p>,
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
                                name: props.path,
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            update('update', form, (data) => {
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
                                name: props.path,
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            update('update', form, (data) => {
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

            let self = e.originalEvent.submitter;

            self.disabled = true;

            self.innerHTML = '<img class="loadding" src="../loadding.svg"/>';
            $('#modal-upload-file #alert').text('');

            let form = {
                name: props.path,
                value: $(e.target).find('#new-value').val(),
                defaultStyle: $(e.target).find('#default-style').val()
            }
            add('add', form, (data) => {

                self.innerHTML = 'Add';

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

            let form = {
                name: props.path,
                field: 'name',
                id: $(e.target).attr('data-id'),
                value: $(e.target).find('#rename').val()
            }
            update('update', form, (data) => {
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
                    <h2>{'Style'}</h2>
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
                                <th scope="col">Modify</th>
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
                                <h5 className="modal-title" id="exampleModalLongTitle">Add Style</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>
                            <form id="form-add">
                                <div className="modal-body">

                                    <div className="form-group">
                                        <input type="text" className="form-control" id="new-value" placeholder="Style Name" required />
                                    </div>

                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <label className="input-group-text" htmlFor="inputGroupSelect01">Default</label>
                                        </div>
                                        <select className="custom-select form-control form-control-lg" id="default-style">
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ flexWrap: 'inherit' }}>

                                    <div className="text-right" style={{ width: '100%' }}>
                                        <button id="btn-save-add" type="submit" className="btn btn-primary btn-custom">Add</button>
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
