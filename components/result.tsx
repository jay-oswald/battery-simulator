import { selectInputState, selectResultState } from "../store/battery";
import { useSelector } from "react-redux";
import { styled } from '@mui/material/styles';
import TableContainer from "@mui/material/TableContainer";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";

const Results = () => {
    const result = useSelector(selectResultState);
    const inputs = useSelector(selectInputState);

    const cost_per_day = result.total_cost / result.days_of_data;
    const battery_cost_per_day = result.battery_cost / result.days_of_data;
    const savings_per_day = cost_per_day - battery_cost_per_day;

    const battery_payback = (inputs.battery_cost / savings_per_day) / 365.25

    if (result.days_of_data === 0) {
        return (
            <div>
                Upload some data to see your results
            </div>
        );
    }

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    function createData(
        name: string,
        uploaded: number,
        battery: number,
        decimals: number,
        unit?: string,
        prefix?: string,
    ): dataRow {
        return {
            name,
            uploaded: uploaded.toFixed(decimals),
            battery: battery.toFixed(decimals),
            unit: unit ? unit : '',
            prefix: prefix ? prefix : '',
        };
    }

    interface dataRow{
        name: string,
        uploaded: string,
        battery: string,
        unit: string,
        prefix: string,
    }

    function generateRows(): dataRow[]{
        const rows = [];
        rows.push(createData('Imported', result.total_imported, result.battery_imported, 3, 'kw'))
        if(inputs.tarrif === 'tou')
            rows.push(createData('Imported (Peak)', result.total_imported_peak, result.battery_imported_peak, 3, 'kw'))

        rows.push(createData('Exported', result.total_exported, result.battery_exported, 3, 'kw'))
        rows.push(createData('Total Cost', result.total_cost, result.battery_cost, 2, '', '$'))
        rows.push(createData('Days of Data', result.days_of_data, result.days_of_data, 0))
        rows.push(createData('Cost per day', cost_per_day, battery_cost_per_day, 2, '', '$'))
        rows.push(createData('Savings per day', 0, savings_per_day, 2, '', '$'))
        rows.push(createData('Payback Years', 0, battery_payback, 2, 'years'))

        return rows;
    }

    const rows = generateRows();

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell></StyledTableCell>
                        <StyledTableCell align="right">No Battery</StyledTableCell>
                        <StyledTableCell align="right">With Battery</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <StyledTableRow key={row.name}>
                            <StyledTableCell component="th" scope="row">
                                {row.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.prefix}{row.uploaded} {row.unit}</StyledTableCell>
                            <StyledTableCell align="right">{row.prefix}{row.battery} {row.unit}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Results;