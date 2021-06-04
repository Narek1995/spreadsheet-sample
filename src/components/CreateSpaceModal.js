import '../App.css';
import {Button} from "@material-ui/core";
import React, {useState} from "react";

const Modal = ({ handleCreate, handleClose, show, children }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";
    const [value, setValue] = useState('')
    const [rowsCount, setRowsCount] = useState('')
    const [cellsCount, setCellsCount] = useState('')
    return (
        <div className={showHideClassName}>
            <section className="modal-main">
               <div style={{padding:"20px"}}>
                   <input
                       style={{display:"block"}}
                       type="text"
                       placeholder='Name'
                       value={value}
                       onChange={e => setValue(e.target.value)}
                       autoFocus
                   />
                   <input
                       style={{display:"block"}}
                       type="text"
                       placeholder='Rows Count'
                       value={rowsCount}
                       onChange={e => {
                           setRowsCount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))
                       }}
                       autoFocus
                   />
                  <input
                      style={{display:"block"}}
                       type="text"
                       placeholder='Columns Count'
                       value={cellsCount}
                       onChange={e => setCellsCount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                       autoFocus
                   />
               </div>
                <Button color="secondary" type="button" onClick={handleClose}>
                    Close
                </Button>
                <Button color="primary" type="button" onClick={()=> handleCreate(value, rowsCount, cellsCount)}>
                    Create
                </Button>
            </section>
        </div>
    );
};
export default Modal