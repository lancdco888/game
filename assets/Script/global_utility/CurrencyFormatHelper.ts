const { ccclass } = cc._decorator;
import NumberFormatHelper from "./NumberFormatHelper";

@ccclass
export default class CurrencyFormatHelper {
    // ✅ 保留所有静态常量/全局变量 初始化值完全不变
    public static intSubstExpOf10: number = 0;
    public static showDecimalPlaces: number = 0;
    public static ordinalNumberPostfix: string[] = ["th", "st", "nd", "rd"];

    // ✅ 所有静态方法 顺序/参数/逻辑 1:1 精准复刻 无任何修改
    public static setCurrencyInfo(t: number, n: number): void {
        cc.log("CurrencyFormatHelper.setDecimal", t, n);
        CurrencyFormatHelper.intSubstExpOf10 = t;
        CurrencyFormatHelper.showDecimalPlaces = n;
    }

    public static formatNumber(t: number): string {
        return CurrencyFormatHelper.showDecimalPlaces === 0 
            ? NumberFormatHelper.formatNumber(t) 
            : CurrencyFormatHelper.formatNumberWithDecimal(t, CurrencyFormatHelper.showDecimalPlaces);
    }

    public static formatNumberWithDecimal(e: number, t: number): string {
        const n = Math.pow(10, t);
        const o = Math.floor(Math.abs(e) / n);
        const a = Math.floor(Math.abs(e) % n);
        let i = o.toLocaleString() + "." + a.toString().padStart(t, "0");
        return e < 0 ? "-" + i : i;
    }

    public static getEllipsisCount(t: number): number {
        const n = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const a = Math.floor(Math.abs(t) / n);
        return NumberFormatHelper.getEllipsisCount(a);
    }

    public static getEllipsisCount_Ver2(t: number): number {
        const n = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const a = Math.floor(Math.abs(t) / n);
        return NumberFormatHelper.getEllipsisCount_Ver2(a);
    }

    public static formatEllipsisNumber(t: number, n?: number): string {
        if (n === undefined) n = CurrencyFormatHelper.getEllipsisCount(t);
        if (n === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const a = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const i = Math.floor(Math.abs(t) / a);
        return Math.abs(i).toString().length <= n 
            ? CurrencyFormatHelper.formatEllipsisNumberUsingDot(t, n) 
            : NumberFormatHelper.formatEllipsisNumber(i, n);
    }

    public static formatEllipsisNumberVer2(t: number): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const n = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const a = Math.floor(Math.abs(t) / n);
        return NumberFormatHelper.formatEllipsisNumberVer2(a);
    }

    public static formatEllipsisNumberToFixed(t: number, n: number, a: number = 0): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const i = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const l = Math.floor(Math.abs(t) / i);
        return NumberFormatHelper.formatEllipsisNumberToFixed(l, n, a);
    }

    public static formatEllipsisNumberToFixedWholed(t: number, n: number, a: number = 0, i: boolean = false): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const l = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const r = Math.floor(Math.abs(t) / l);
        return NumberFormatHelper.formatEllipsisNumberToFixedWholed(r, n, a, i);
    }

    public static formatEllipsisNumberUsingDot(t: number, n?: number): string {
        if (n === undefined) n = CurrencyFormatHelper.getEllipsisCount(t);
        if (n === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const a = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const i = Math.floor(Math.abs(t) / a);
        return NumberFormatHelper.formatEllipsisNumberUsingDot(i, n);
    }

    public static formatEllipsisNumberUsingDotMaxCount(t: number, n: number): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const a = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const i = Math.floor(Math.abs(t) / a);
        return NumberFormatHelper.formatEllipsisNumberUsingDotMaxCount(i, n);
    }

    public static formatEllipsisNumberUsingDotUnderPointCount(t: number, n: number): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const a = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const i = Math.floor(Math.abs(t) / a);
        return NumberFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(i, n);
    }

    public static formatEllipsisNumberUsingDotUnderPointCountRemoveZero(t: number, n: number): string {
        if (CurrencyFormatHelper.getEllipsisCount_Ver2(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const a = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const i = Math.floor(Math.abs(t) / a);
        return NumberFormatHelper.formatEllipsisNumberUsingDotUnderPointCountRemoveZero(i, n);
    }

    public static formatEllipsisNumberDisplay(t: number): string {
        if (CurrencyFormatHelper.getDisplayEllipsisCount(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const n = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const a = Math.floor(Math.abs(t) / n);
        return NumberFormatHelper.formatEllipsisNumberDisplay(a);
    }

    public static getDisplayEllipsisCount(t: number): number {
        const n = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const a = Math.floor(Math.abs(t) / n);
        return NumberFormatHelper.getDisplayEllipsisCount(a);
    }

    public static formatEllipsisWithEllipsisRange(t: number, n: number[], a: any = null): string {
        if (CurrencyFormatHelper.getEllipsisCount(t) === 0) return CurrencyFormatHelper.formatNumber(t);
        
        const i = Math.pow(10, CurrencyFormatHelper.intSubstExpOf10);
        const l = Math.floor(Math.abs(t) / i);
        return NumberFormatHelper.formatEllipsisWithEllipsisRange(l, n, a);
    }

    public static formatOrdinalNumber(t: number): string {
        const n = t % 100;
        const o = CurrencyFormatHelper.ordinalNumberPostfix;
        return t + (o[(n - 20) % 10] || o[n] || o[0]);
    }

    public static formatOrdinalNumberUppercase(t: number): string {
        return CurrencyFormatHelper.formatOrdinalNumber(t).toUpperCase();
    }

    public static getOrdinalNumberPostfix(t: number): string {
        const n = t % 100;
        const o = CurrencyFormatHelper.ordinalNumberPostfix;
        return o[(n - 20) % 10] || o[n] || o[0];
    }
}