import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {Button} from "@material-ui/core";
import Modal from "../components/CreateSpaceModal"

export const Spreadsheets = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [spreadsheets, setSpreadsheets] = useState([]);
    const [showCreateSpace, setShowCreateSpace] = useState(false);
    useEffect(()=>{
        if(isAuthenticated) {
            getAccessTokenSilently({
                audience: `https://api.narekchomoyan.com`
            }).then(token => fetch(`http://localhost/spreadsheet`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(res => res.json()).then(res => {
                console.log(res)
                setSpreadsheets(res);
            }));
        }
    },[isAuthenticated]);
    const onSheetDeleteClicked = (sheetId) => {
        getAccessTokenSilently({
            audience: `https://api.narekchomoyan.com`
        }).then(token => fetch(`http://localhost/spreadsheet/${sheetId}`,
            {
                method:"DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }).then(res => {
                setSpreadsheets(spreadsheets.filter(spr => spr.id !== sheetId))
        }))
    }
    const createSpreadsheet = (name, rowsCount, cellsCount) => {
        getAccessTokenSilently({
            audience: `https://api.narekchomoyan.com`
        }).then(token => fetch(`http://localhost/spreadsheet`,
            {
                method:"POST",
                body:JSON.stringify({
                    name:name,
                    rowsCount:rowsCount,
                    columnsCount:cellsCount
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }).then(res => res.json()).then(res => {
                if(res.error) {
                    alert(res.error)
                }else {
                    spreadsheets.push(res)
                    setSpreadsheets([...spreadsheets])
                    setShowCreateSpace(false)
                }
        }))
    }

    const showModal = () => {
        setShowCreateSpace(true)
    };

   const hideModal = () => {
        setShowCreateSpace(false);
    };
    if(isAuthenticated) {
        return <div>
            <Modal show={showCreateSpace} handleCreate={createSpreadsheet} handleClose={hideModal}>
            </Modal>
            <div style={{"margin-bottom":"10px"}}>
                <Button onClick={showModal} color="primary">Create Spreadsheet</Button>
            </div>
            <td key={"spreadsheets"} style={{"border": "1px solid black", width:"fit-content"}}>

                {spreadsheets.map(sheet => {
                    return <tr key={sheet.id} style={{"border": "1px solid black", width:"fit-content", padding:"10px"}}>
                        <td style={{"border": "1px solid black", width:"fit-content", padding:"10px"}}><Link to={`/spreadsheet/${sheet.id}`}>{sheet.name}</Link></td>
                        <td style={{"border": "1px solid black", width:"fit-content", padding:"10px"}}>sheet.rowsCount</td>
                        <td style={{"border": "1px solid black", width:"fit-content", padding:"10px"}}>sheet.columnsCount</td>
                        <td style={{"border": "1px solid black", width:"fit-content", padding:"10px"}}><Button color="secondary"  onClick={() => onSheetDeleteClicked(sheet.id)}>Delete</Button></td>
                    </tr>
                })}
            </td>

        </div>
    } else {
        return <h1>Please log in</h1>
    }
}