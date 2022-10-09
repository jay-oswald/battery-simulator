export interface inputs{
    tarrif: tarrifs,
    peak_start: string,
    peak_end: string,
    buy_rate: number,
    buy_rate_peak: number,
    sell_rate: number,
    battery_size: number,
    battery_efficiency: number
    battery_cost: number
}

export type tarrifs = 'single' | 'tou';