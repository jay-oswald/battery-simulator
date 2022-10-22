import { Inputs as InputInterface, selectInputState, setInputs, setData, recalculate, recalculateCosts } from "../store/battery";
import { useSelector, useDispatch } from "react-redux";
import { parseFile } from '../src/parseFile'
import TextField from '@mui/material/TextField';
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

const Inputs = () => {
    const reduxInputs = useSelector(selectInputState);
    let inputs: InputInterface = JSON.parse(JSON.stringify(reduxInputs))
    const dispatch = useDispatch();

    //Fields that need a full re-calculate, not just costs
    const recalculate_fields = [
        'tarrif',
        'peak_start',
        'peak_end',
        'battery_size',
        'battery_efficiency',
    ];

    const field_change = (e: any) => {
        const name: string = e.target.name;
        let value = e.target.value;

        if (!isNaN(value)) {
            value = parseFloat(value);
        }

        // @ts-ignore
        inputs[name] = value;

        dispatch(setInputs(inputs))
        if (recalculate_fields.includes(name)) {
            dispatch(recalculate());
        } else {
            dispatch(recalculateCosts());
        }
    }
    const process_file = async (e: any) => {
        if (!e.target.files || Array.isArray(e.target.files)) {
            //TODO show errors
        }
        const data = await parseFile(e.target.files[0]);
        dispatch(setData(data));
    }

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <h2>Your Energy and future battery details</h2>
            <Grid container spacing={2}>
                <Grid xs={12} sm={6} lg={4}>
                    <InputLabel>Tarrif Type</InputLabel>
                    <Select
                        value={inputs.tarrif}
                        label="Tarrif Type"
                        name="tarrif"
                        onChange={field_change}
                    >
                        <MenuItem value="tou">Time of Use</MenuItem>
                        <MenuItem value="single">Single Rate</MenuItem>
                    </Select>
                </Grid>
                {inputs.tarrif === 'tou' &&
                    <Grid xs={12} sm={6} lg={4}>
                        <TextField label="Peak time start" type='time' name="peak_start" defaultValue={inputs.peak_start} onChange={field_change} />
                    </Grid>
                }
                {inputs.tarrif === 'tou' &&
                    <Grid xs={12} sm={6} lg={4}>
                        <TextField label="Peak time end" type='time' name="peak_end" defaultValue={inputs.peak_end} onChange={field_change} />
                    </Grid>
                }
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Buy Rate" type='numeric' name="buy_rate" defaultValue={inputs.buy_rate} onChange={field_change} />
                </Grid>
                {inputs.tarrif === 'tou' &&
                    <Grid xs={12} sm={6} lg={4}>
                        <TextField label="Buy Rate (Peak)" type='numeric' name="buy_rate_peak" defaultValue={inputs.buy_rate_peak} onChange={field_change} />
                    </Grid>
                }
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Sell Rate" type='numeric' name="sell_rate" defaultValue={inputs.sell_rate} onChange={field_change} />
                </Grid>
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Daily Supply Charge" type='numeric' name="daily_cost" defaultValue={inputs.daily_cost} onChange={field_change} />
                </Grid>
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Battery Size (kwh)" type='numeric' name="battery_size" defaultValue={inputs.battery_size} onChange={field_change} />
                </Grid>
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Battery Efficiency (%)" type='numeric' name="battery_efficiency" defaultValue={inputs.battery_efficiency} onChange={field_change} />
                </Grid>
                <Grid xs={12} sm={6} lg={4}>
                    <TextField label="Battery Cost" type='numeric' name="battery_cost" defaultValue={inputs.battery_cost} onChange={field_change} />
                </Grid>
                <Grid xs={12} sm={6} lg={4}>
                    <Button variant="contained" component="label">
                        Select Data file
                        <input hidden accept="*.csv" name="file" type="file" onChange={process_file} />
                    </Button>
                </Grid>
            </Grid>
        </Box >
    )
}

export default Inputs;