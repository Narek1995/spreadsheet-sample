import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'

/**
 * Cell represents the atomic element of a table
 */
const Cell = ({onChangedValue, x, y, data, actualData, isValid}) => {
    console.log(data)
    const [value, setValue] = useState(data);
    const [actualValue, setActualValue] = useState(actualData);
    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState(false);
    let timer = 0
    let delay = 200
    let prevent = false

    useEffect(() => {
        window.document.addEventListener('unselectAll',
            handleUnselectAll)
    }, [])

    useEffect(() => {
        setValue(data);
        setActualValue(actualData)
    }, [data, actualData])

    const onChange = (e) => {
        setActualValue(e.target.value)
    }

    const onKeyPressOnInput = (e) => {
        if (e.key === 'Enter') {
            hasNewValue(e.target.value)
        }
    }
    const onKeyPressOnSpan = () => {
        if (!editing) {
            setEditing(true)
        }
    }

    const onBlur = (e) => {
        hasNewValue(e.target.value)
    }

    const handleUnselectAll = () => {
        if (selected || editing) {
            setSelected(false);
            setEditing(false)
        }
    }

   const hasNewValue = (val) => {
        onChangedValue(
            {
                x: x,
                y: y,
            },
            val,
        )
        setEditing(false);
        setSelected(false)
        setActualValue(actualValue)
    }

    const emitUnselectAllEvent = () => {
        const unselectAllEvent = new Event('unselectAll')
        window.document.dispatchEvent(unselectAllEvent)
    }

    const clicked = () => {
        // Prevent click and double click to conflict
        timer = setTimeout(() => {
            if (!prevent) {
                // Unselect all the other cells and set the current
                // Cell state to `selected`
                emitUnselectAllEvent()
                setSelected(true)
            }
            prevent = false
        }, delay)
    }

    const doubleClicked = () => {
        // Prevent click and double click to conflict
        clearTimeout(timer)
        prevent = true

        // Unselect all the other cells and set the current
        // Cell state to `selected` & `editing`
        emitUnselectAllEvent();
        setEditing(true);
        setSelected(true)
    }

    const calculateCss = () => {
        const css = {
            width: '80px',
            padding: '4px',
            margin: '0',
            height: '25px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'table-cell',
            color: 'black',
            border: '1px solid #cacaca',
            textAlign: 'left',
            verticalAlign: 'top',
            fontSize: '14px',
            lineHeight: '15px',
            overflow: 'hidden',
            fontFamily: 'Calibri, \'Segoe UI\', Thonburi, Arial, Verdana, sans-serif',


        }

        if (x === 0 || y === 0) {
            css.textAlign = 'center'
            css.backgroundColor = '#dbcece'
            css.fontWeight = 'bold'
        } else if(!isValid) {
            css.border = '2px solid #fc0303'
        }

        return css
    }

    const calculateCell = () => {
        const css = calculateCss()

        // column 0
        if (y === 0) {
            return (
                <span style={css}>
          {x}
        </span>
            )
        }
        //row 0
        if (x === 0) {
            let values = [];
            let i = 0;
            let n = y;
            while (n) {
                values[i] = n % 26;
                n = Math.floor(n / 26);
                i++;
            }
            for (let j = 0; j < i - 1; j++) {
                if (values[j] <= 0) {
                    values[j] += 26;
                    values[j + 1] = values[j + 1] - 1;
                }
            }
            let val = '';
            for (let j = i; j >= 0; j--) {
                if (values[j] > 0)
                    val += String.fromCharCode(65 + values[j] - 1);
            }
            return (
                <span
                    onKeyPress={onKeyPressOnSpan}
                    style={css}
                    role="presentation">
                    {val}
        </span>
            )
        }

        if (selected) {
            css.outlineColor = 'lightblue'
            css.outlineStyle = 'dotted'
        }

        if (editing) {
            return (
                <input
                    style={css}
                    type="text"
                    onBlur={onBlur}
                    onKeyPress={onKeyPressOnInput}
                    value={actualValue}
                    onChange={onChange}
                    autoFocus
                />
            )
        }
        return (
            <span
                onClick={e => clicked(e)}
                onDoubleClick={e => doubleClicked(e)}
                style={css}
                role="presentation"
            >
        {value}
      </span>
        )
    }

    return calculateCell();
}

Cell.propTypes = {
    onChangedValue: PropTypes.func,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    data: PropTypes.any.isRequired,
    actualData:PropTypes.string.isRequired,
    isValid:PropTypes.bool
}

export default Cell
