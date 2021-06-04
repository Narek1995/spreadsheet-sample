import React, {useState} from 'react'
import PropTypes from 'prop-types'
import Row from './Row'

const Table = ({data, x:rowsCount, y:columnCount, onCellValueUpdate}) =>  {

    const handleChangedCell = ({ x, y}, value) => {
        onCellValueUpdate( value, y, x)
    }

    const updateCells = () => {
        this.forceUpdate()
    }

    const calculateRow = () => {
        const rows = []
        for (let x = 0; x < rowsCount + 1; x += 1) {
            const rowData = data[x - 1] || new Array(columnCount).fill({
                displayValue:"",
                value:"",
                isValid:true
            });
            rows.push(
                <Row
                    handleChangedCell={handleChangedCell}
                    updateCells={updateCells}
                    key={x}
                    y={columnCount}
                    x={x}
                    rowData={rowData}
                />,
            )
        }
        return (
            <div style={{
                marginRight: "32px",
                maxWidth: "fit-content",
                display: "table"
            }}>
                {rows}
            </div>
        )
    }
    return calculateRow();
}

Table.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    oncellValueUpdate:PropTypes.func,
    data:PropTypes.array.isRequired
}
export default Table