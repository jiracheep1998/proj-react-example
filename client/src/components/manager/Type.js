import React, { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { manager, update, add } from '../lib/request';

import { Modal } from 'bootstrap';

import $ from 'jquery';

import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

import moment from 'moment';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Type(props) {

    var { style, name } = useParams();

    useEffect(function () {
        document.querySelectorAll('[data-id="' + props.path + '"]')[0].style.background = '#474747';

        const modal_add = new Modal($('#modal-add')[0]);

        function load() {

            manager(style + '/type', (data) => {

                $('table tbody').empty();

                if (data.length > 0) {

                    data.map((item, i) => {

                        let tr = '<tr>' +
                            '<th scope="row">' + (i + 1) + '</th>' +
                            '<td>' + item.name + '</td>' +
                            '<td class="d-none d-lg-block">' + moment(item.update_date).fromNow(true) + '</td>' +
                            '<td>' +
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
                            action: 'update',
                            name: 'type',
                            field: 'delete',
                            id: $(e.target).attr('id'),
                            value: $(e.target).attr('state') == 0 ? 1 : 0
                        }
                        update(style + '/type', form, (data) => {
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
                                action: 'update',
                                name: 'type',
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            update(style + '/type', form, (data) => {
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
                                action: 'update',
                                name: 'type',
                                field: 'status',
                                id: $(e.target).attr('id'),
                                value: $(e.target).attr('state') == 0 ? 1 : 0
                            }
                            update(style + '/type', form, (data) => {
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

        $('form').on('submit', function (e) {
            e.preventDefault();

            let form = {
                action: 'add',
                name: 'type',
                value: $('#new-value').val()
            }
            add(style + '/type', form, (data) => {
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
                    <h2>{name.charAt(0).toUpperCase() + name.slice(1) + ' Type'}</h2>
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
                                <h5 className="modal-title" id="exampleModalLongTitle">Add Type</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>

                            </div>
                            <form>
                                <div className="modal-body">

                                    <div className="form-group">
                                        <input type="text" defaultValue={2.1} className="form-control" id="new-value" placeholder="Enter value" required />
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



            </div>
        </div>
    );
}
