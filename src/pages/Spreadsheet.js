import {useParams} from 'react-router-dom'
import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import Table from "../components/Table";
export const errorTypes = {
    INVALID:"INVALID",
    CIRCULAR:"CIRCULAR",
    NON:"NON"
}
const numericRegexp = new RegExp('^[1-9]\\d*$')
const formulaRegexp = new RegExp('^=SUM\\((\\w+\\d+)((:\\w+\\d+)|(,\\w+\\w+)*)((,\\w+\\d)((:\\w+\\d+)|(,\\w+\\w+)*))*\\)$|^=(\\w+\\d+)$')
export const Spreadsheet = ()=>{
    const { getAccessTokenSilently } = useAuth0();
    const [spreadsheet, setSpreadsheet] = useState([]);
    const [cellValues, setCellValues] = useState([]);
    const [rows, setRows] = useState([]);
    const [activeFormulas, setActiveFormulas] = useState([]);
    const {id} = useParams();
    useEffect(() => {
        calculateCellDisplayValues();
        setCellValues(cellValues)
    }, [cellValues])


    useEffect(()=>{
        getAccessTokenSilently({
            audience: `https://api.narekchomoyan.com`
        }).then(token =>  fetch(`http://localhost/spreadsheet/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }).then(res=>res.json()).then(res=>{
                let rw = [];
                res.rows.map(row => rw[row.number] = row);
                setRows(rw);
            setSpreadsheet(res);
            let cV = [];
            for(let i = 0; i < res.rowsCount; i++) {
                cV[i] = []
                for(let j = 0; j < res.columnsCount; j++) {
                    cV[i][j] = { value:'',
                        isFormula : true,
                        isValid : true,
                        errorType:errorTypes.NON,
                        displayValue:'',
                        addedToFormulaList:false,
                        dependencies:[],
                        reversedDependency:[]
                    }
                }
            }
            rw.map(r => {
                r.cells.map( (c, index) => {
                    cV[r.number - 1][index] = {
                        value:c,
                        displayValue:c,
                        dependencies:[],
                        reversedDependency:[],
                        addedToFormulaList:false,
                    };
                })
            })
            setCellValues(cV);
        }));

    },[]);

    const calculateTopology = (graph, results, dead, pending) => {
        graph.map(node => {
            if(!dead.includes(node)) {
                if(!pending.includes(node)) {
                    pending.push(node);
                } else {
                    node.isValid = false;
                    node.errorType = errorTypes.CIRCULAR;
                    node.displayValue = '#REF'
                    return
                }
                calculateTopology(node.dependencies, results, dead, pending)
                if(pending.includes(node)) {
                    pending.filter(it => it.x !== node.x && it.y !== node.y)
                }
                dead.push(node);
                results.push(node);
            }
        })
    }

    const calculateCellDisplayValues = () => {
        cellValues.map((row, rowIndex) => {
            row.map((cell, cellIndex) => {
               calculateCellDisplayValue(cell, cellIndex, rowIndex);
            })
        })
        let topology = [];
        calculateTopology(activeFormulas,topology,[],[]);
        topology.map(node => {
            if(node.isFormula) {
                calculateFormulaValue(node);
            }
        })
    }

    const calculateCellDisplayValue = (cell, cellIndex, rowIndex) => {
        cell.x = rowIndex;
        cell.y = cellIndex;
        if(cell.value.length === 0 ||  numericRegexp.test(cell.value)) {
            cell.displayValue = cell.value;
            cell.isFormula = false;
            cell.isValid = true;
            setActiveFormulas(activeFormulas.filter(c =>
                !(c.x === cell.x && c.y ===cell.y)
            ))
        } else if(formulaRegexp.test(cell.value)) {
            prepareFormulaCellData(cell)
            if(!activeFormulas.some(c => c.x === cell.x && c.y === cell.y)) {
               activeFormulas.push(cell);
               setActiveFormulas(activeFormulas);
            }
        } else {
            cell.isFormula = false;
            cell.isValid = false;
            cell.displayValue = '#ERR'
            setActiveFormulas(activeFormulas.filter(c =>
                !(c.x === cell.x && c.y ===cell.y)
            ))
        }
    }

    const prepareFormulaCellData = (cell) => {
        cell.isFormula = true;
        cell.isValid = true;
        let formula = cell.value;
        let cellData = formula.replace('=SUM(','').replace(')','').replace('=','').trim();
        if(cellData.includes(':')) {
            calculateDependenciesForRangeFormula(cell, cellData)
        } else {
            calculateDependenciesForNonRangeFormula(cell, cellData)
        }
    }

    const calculateFormulaValue = (cell) =>{
        let val = 0;
        cell.dependencies.map(c => {
            if(c.isValid ){
                if(c.displayValue) {
                    val += parseInt(c.displayValue);
                }
            } else {
                val = c.displayValue;
                cell.isValid = false;
                return;
            }
        })
        cell.displayValue = val;
    }

    const calculateDependenciesForNonRangeFormula = (cell, formula) => {
        let parts = formula.split(',');
        cell.dependencies = [];
        parts.map(part => {
            let cords = getCordinatesForCellName(part);
            if(cellValues[cords.x][cords.y]) {
                cell.dependencies.push(cellValues[cords.x][cords.y])
            }
        })
    }

    const calculateDependenciesForRangeFormula = (cell, formula) => {
        let parts = formula.split(':');
        let startCordinates = getCordinatesForCellName(parts[0]);
        let endCordinates = getCordinatesForCellName(parts[1]);
        let startX = Math.min(startCordinates.x, endCordinates.x);
        let endX = Math.max(startCordinates.x, endCordinates.x);
        let startY = Math.min(startCordinates.y, endCordinates.y);
        let endY = Math.max(startCordinates.y, endCordinates.y);
        cell.dependencies = [];
        for(let i = startX; i <= endX; i++) {
            for(let j = startY; j <= endY; j++) {
                if(cellValues[i][j]) {
                    cell.dependencies.push(cellValues[i][j])
                    cellValues[i][j].reversedDependency.push(cell)
                }
            }
        }
    }

    const getCordinatesForCellName = (name) => {
        let start = getColumnNumber(name.substring(0,name.length - 1));
        let end = parseInt(name.substring(name.length - 1,name.length))
        return {
            y:start - 1,
            x:end -1
        }
    }

    const getColumnNumber = (name) =>
    {
        name = name.toUpperCase();
        let number = 0;
        let pow = 1;
        for (let i = name.length - 1; i >= 0; i--)
        {
            number += (name[i].charCodeAt(0) - 'A'.charCodeAt(0) + 1) * pow;
            pow *= 26;
        }
        return number;
    }

    useEffect(()=>{

    },[{
        name:"name",
        surename:"surename",
        arr:[]
    },{
        name:"name2",
        surename:"surename2",
        arr:[]
    }])

    const cellValueUpdated = (value,y, x) => {
        let row = rows[x];
        let cell = [...cellValues[x - 1]][y - 1];
        // let cell = cellValues[x-1][y-1];
        cell.value = value;
        calculateCellDisplayValue(cell, y - 1,x - 1);
        let topology = [];
        calculateTopology(activeFormulas,topology, [], []);
        topology.map(formula  => {
            if(formula.isFormula) {
                calculateFormulaValue(formula);
            }
        })
        cellValues[x-1] [y-1] = cell;
        setCellValues([...cellValues]);
        if(cell.isValid) {
            getAccessTokenSilently({
                audience: `https://api.narekchomoyan.com`
            }).then(token => {
                if (row) {
                    fetch(`http://localhost/row/${row.id}/${y}${value ? '?value='+value:''}`,
                        {
                            method: 'PATCH',
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        })
                } else {
                    let cells = new Array(spreadsheet.columnsCount).fill('')
                    cells[y - 1] = value;
                    fetch(`http://localhost/row`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                number: x,
                                spreadsheetId: id,
                                cells: cells
                            })
                        })
                }
            });
        }

    }
        return (<div>
            <Table x={spreadsheet.rowsCount} y={spreadsheet.columnsCount} data={cellValues}
                   onCellValueUpdate={cellValueUpdated}/>
        </div>)
}