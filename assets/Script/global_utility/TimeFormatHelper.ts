
export default class TimeFormatHelper {
    private _time: number = 0;

    constructor(e: number) {
        this._time = 0;
        this._time = e;
    }

    public static getTimeStringFormat(e: number): string {
        return e <= 0 ? "00" : e < 10 ? "0" + e : e.toString();
    }

    public static getHourTimeString(t: number): string {
        return new TimeFormatHelper(t).getHourTimeString();
    }

    public static getHourTimeStringForBomb(t: number): string {
        return new TimeFormatHelper(t).getTimeOfferMiniuteTimeString();
    }

    public static getTotMiniuteTimeString(t: number): string {
        return new TimeFormatHelper(t).getTotMinuteTimeString();
    }

    public static getMiniuteTimeString(t: number): string {
        return new TimeFormatHelper(t).getMiniuteTimeString();
    }

    public static getTimeStringDayBaseHourFormat(t: number): string {
        return new TimeFormatHelper(t).getTimeStringDayBaseHourFormat();
    }

    public static getTimeStringDayBaseHourFormatBig(t: number): string {
        return new TimeFormatHelper(t).getTimeStringDayBaseHourFormatBig();
    }

    public static getFullDate(e: number): string {
        return e <= 0 ? "00" : e < 10 ? "0" + e : e.toString();
    }

    public static getFullMonth(e: number): string {
        return e <= 0 ? "00" : e < 10 ? "0" + e : e.toString();
    }

    public addSecond(e: number): void {
        this._time += e;
    }

    public getTime(): number {
        return this._time;
    }

    public getTotHour(): string {
        var t = Math.floor(this._time / 3600);
        return TimeFormatHelper.getTimeStringFormat(t);
    }

    public getTotDay(): number {
        return Math.floor(this._time / 86400);
    }

    public getHourNumber(): number {
        return Math.floor(this._time / 3600) % 24;
    }

    public getTotMiniute(): string {
        var t = Math.floor(this._time / 60);
        return TimeFormatHelper.getTimeStringFormat(t);
    }

    public getMiniute(): string {
        var t = Math.floor(this._time / 60 % 60);
        return TimeFormatHelper.getTimeStringFormat(t);
    }

    public getMinuteNumber(): number {
        return Math.floor(this._time / 60 % 60);
    }

    public getSecond(): string {
        var t = Math.floor(this._time % 60);
        return TimeFormatHelper.getTimeStringFormat(t);
    }

    public getSecondNumber(): number {
        return Math.floor(this._time % 60);
    }

    public getHourTimeString(): string {
        return this.getTotHour() + ":" + this.getMiniute() + ":" + this.getSecond();
    }

    public getTotMinuteTimeString(): string {
        return this.getTotMiniute() + ":" + this.getSecond();
    }

    public getMiniuteTimeString(): string {
        return this.getMiniute() + ":" + this.getSecond();
    }

    public getTimeOfferMiniuteTimeString(): string {
        return this.getMiniute() + ":" + this.getSecond();
    }

    public getTimeWithMinuteTimeString(): string {
        return this.getTotHour() + ":" + this.getMiniute();
    }

    public getTimeStringDayBaseHourFormat(): string {
        var e = this.getTotDay();
        return e > 0 ? "%s days".format((e + 1).toString()) : this.getHourTimeString();
    }

    public getTimeStringDayBaseHourFormatBig(): string {
        var e = this.getTotDay();
        return e > 0 ? "%s DAYS".format((e + 1).toString()) : this.getHourTimeString();
    }

    public getTimeStringDayBaseHourFormatBigNoneSpace(): string {
        var e = this.getTotDay();
        return e > 0 ? "%sDAYS".format((e + 1).toString()) : this.getHourTimeString();
    }

    public getTimeStringDayBaseHourFormatBigWithSpace(): string {
        var e = this.getTotDay();
        return e > 0 ? "%s  DAYS".format((e + 1).toString()) : this.getHourTimeString();
    }

    public getMonthTimeString(e?: boolean): string {
        switch (void 0 === e && (e = false), new Date(1e3 * this._time).getMonth() + 1) {
            case 1: return e ? "Jan" : "January";
            case 2: return e ? "Feb" : "February";
            case 3: return e ? "Mar" : "March";
            case 4: return e ? "Apr" : "April";
            case 5: return "May";
            case 6: return e ? "Jun" : "June";
            case 7: return e ? "Jul" : "July";
            case 8: return e ? "Aug" : "August";
            case 9: return e ? "Sep" : "September";
            case 10: return e ? "Oct" : "October";
            case 11: return e ? "Nov" : "November";
            case 12: return e ? "Dec" : "December";
            default: return "";
        }
    }

    public getDayTimeString(e?: boolean): string {
        switch (void 0 === e && (e = false), new Date(1e3 * this._time).getDate()) {
            case 1: return e ? "1st" : "First";
            case 2: return e ? "2nd" : "Second";
            case 3: return e ? "3rd" : "Third";
            case 4: return e ? "4th" : "Fourth";
            case 5: return e ? "5th" : "Fifth";
            case 6: return e ? "6th" : "Sixth";
            case 7: return e ? "7th" : "Seventh";
            case 8: return e ? "8th" : "Eighth";
            case 9: return e ? "9th" : "Ninth";
            case 10: return e ? "10th" : "Tenth";
            case 11: return e ? "11th" : "Eleventh";
            case 12: return e ? "12th" : "Twelfth";
            case 13: return e ? "13th" : "Thirteenth";
            case 14: return e ? "14th" : "Fourteenth";
            case 15: return e ? "15th" : "Fifteenth";
            case 16: return e ? "16th" : "Sixteenth";
            case 17: return e ? "17th" : "Seventeenth";
            case 18: return e ? "18th" : "Eighteenth";
            case 19: return e ? "19th" : "Nineteenth";
            case 20: return e ? "20th" : "Twentieth";
            case 21: return e ? "21st" : "Twenty-first";
            case 22: return e ? "22nd" : "Twenty-second";
            case 23: return e ? "23rd" : "Twenty-third";
            case 24: return e ? "24th" : "Twenty-fourth";
            case 25: return e ? "25th" : "Twenty-fifth";
            case 26: return e ? "26th" : "Twenty-sixth";
            case 27: return e ? "27th" : "Twenty-seventh";
            case 28: return e ? "28th" : "Twenty-eighth";
            case 29: return e ? "29th" : "Twenty-ninth";
            case 30: return e ? "30th" : "Thirtieth";
            case 31: return e ? "31st" : "Thirty-first";
            default: return "";
        }
    }

    public getDayOfWeekString(e?: boolean): string {
        switch (void 0 === e && (e = false), new Date(1e3 * this._time).getDay()) {
            case 0: return e ? "Sun" : "Sunday";
            case 1: return e ? "Mon" : "Monday";
            case 2: return e ? "Tue" : "Tuesday";
            case 3: return e ? "Wed" : "Wednesday";
            case 4: return e ? "Thu" : "Thursday";
            case 5: return e ? "Fri" : "Friday";
            case 6: return e ? "Sat" : "Saturday";
            default: return "";
        }
    }
}