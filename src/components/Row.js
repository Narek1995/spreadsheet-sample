import React from 'react'
import PropTypes from 'prop-types'
import Cell from './Cell'

const Row = ({x, y, rowData, handleChangedCell, updateCells}) => {
    console.log(rowData);

   let cellData = [{
        displayValue:"",
        value:"",
        isValid:true
    }]
    Array.prototype.push.apply(cellData, rowData)
    return (
        <div style={{display: "flex"}}>
            {cellData.map((cell, index)=>{
                    return <Cell
                        key={`${x}-${index}`}
                        y={index}
                        x={x}
                        onChangedValue={handleChangedCell}
                        updateCells={updateCells}
                        data={cell.displayValue === undefined ? "" : cell.displayValue}
                        actualData={cell.value === undefined ? "" : cell.value}
                        isValid={cell.isValid}
                    />
            })}
        </div>
    )
}

Row.propTypes = {
    handleChangedCell: PropTypes.func.isRequired,
    updateCells: PropTypes.func.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Row