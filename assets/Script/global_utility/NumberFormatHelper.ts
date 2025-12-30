const { ccclass } = cc._decorator;

@ccclass
export default class NumberFormatHelper {
    // ✅ 保留原代码唯一静态常量数组 位置+值完全不变
    public static ordinalNumberPostfix: string[] = ["th", "st", "nd", "rd"];

    // ✅ 所有静态方法 严格按照原JS顺序1:1精准复刻 无任何增删改
    public static formatNumber(e: number): string {
        e = Math.floor(e);
        const t = e < 0;
        const n = Math.abs(e).toString();
        let o = "";
        let a = 0;
        if (t) o = "-";
        for (let i = n.length - 1; i >= 0; --i) {
            o = n[i] + o;
            if (++a === 3 && i !== 0) {
                o = "," + o;
                a = 0;
            }
        }
        return o;
    }

    public static getEllipsisCount(e: number): number {
        e = Math.floor(e);
        const t = Math.abs(e).toString();
        if (t.length > 3 && t.length <= 6) return 3;
        if (t.length > 6 && t.length <= 9) return 6;
        if (t.length > 9) return 9;
        return 0;
    }

    public static getEllipsisCount_Ver2(e: number): number {
        e = Math.floor(e);
        const t = Math.abs(e).toString();
        if (t.length > 3 && t.length <= 6) return 3;
        if (t.length > 6 && t.length <= 9) return 6;
        if (t.length > 9 && t.length <= 12) return 9;
        if (t.length > 12) return 12;
        return 0;
    }

    public static formatEllipsisNumber(e: number, t?: number): string {
        e = Math.floor(e);
        const n = e < 0;
        const o = Math.abs(e).toString();
        if (t === undefined) {
            t = 0;
            if (o.length > 3 && o.length <= 6) t = 3;
            else if (o.length > 6 && o.length <= 9) t = 6;
            else if (o.length > 9) t = 9;
        }
        let a = "";
        if (t === 3) a = "K";
        else if (t === 6) a = "M";
        else if (t === 9) a = "B";

        let i = 0;
        for (let l = o.length - 1 - t; l >= 0; --l) {
            if (i > 0 && i % 3 === 0) a = "," + a;
            a = o[l] + a;
            ++i;
        }
        if (n) a = "-" + a;
        return a;
    }

    public static formatEllipsisNumberVer2(e: number): string {
        e = Math.floor(e);
        const t = e < 0;
        const n = Math.abs(e).toString();
        let o = 0;
        if (n.length > 4 && n.length <= 7) o = 3;
        else if (n.length > 7 && n.length <= 10) o = 6;
        else if (n.length > 10 && n.length <= 13) o = 9;
        else if (n.length > 13) o = 12;

        let a = "";
        if (o === 3) a = "K";
        else if (o === 6) a = "M";
        else if (o === 9) a = "B";
        else if (o === 12) a = "T";

        let i = 0;
        for (let l = n.length - 1 - o; l >= 0; --l) {
            if (i > 0 && i % 3 === 0) a = "," + a;
            a = o[l] + a;
            ++i;
        }
        if (t) a = "-" + a;
        return a;
    }

    public static formatEllipsisNumberToFixed(t: number, n: number, o: number = 0): string {
        t = Math.floor(t);
        const a = t < 0;
        const i = Math.abs(t).toString();
        let l = "";
        let u: number, p: string;

        if (i.length > 12 + o) {
            const r = t % (u = Math.pow(10, 12)) / Math.pow(10, 12 - n);
            const s = Math.floor(t / u);
            p = Math.floor(r).toString();
            let c = p.length;
            for (; c < n; ++c) p = "0" + p;
            l = n === 0 ? `${this.formatNumber(s)}T` : `${this.formatNumber(s)}.${p}T`;
        } else if (i.length > 9 + o) {
            const r = t % (u = Math.pow(10, 9)) / Math.pow(10, 9 - n);
            const s = Math.floor(t / u);
            p = Math.floor(r).toString();
            let c = p.length;
            for (; c < n; ++c) p = "0" + p;
            l = n === 0 ? `${this.formatNumber(s)}B` : `${this.formatNumber(s)}.${p}B`;
        } else if (i.length > 6 + o) {
            const r = t % (u = Math.pow(10, 6)) / Math.pow(10, 6 - n);
            const s = Math.floor(t / u);
            p = Math.floor(r).toString();
            let c = p.length;
            for (; c < n; ++c) p = "0" + p;
            l = n === 0 ? `${this.formatNumber(s)}M` : `${this.formatNumber(s)}.${p}M`;
        } else if (i.length > 3 + o) {
            const r = t % (u = Math.pow(10, 3)) / Math.pow(10, 3 - n);
            const s = Math.floor(t / u);
            p = Math.floor(r).toString();
            let c = p.length;
            for (; c < n; ++c) p = "0" + p;
            l = n === 0 ? `${this.formatNumber(s)}K` : `${this.formatNumber(s)}.${p}K`;
        } else {
            l = this.formatNumber(Math.abs(t));
        }
        if (a) l = "-" + l;
        return l;
    }

    public static formatEllipsisNumberToFixedWholed(t: number, n: number, o: number = 0, a: boolean = false): string {
        t = Math.floor(t);
        const i = t < 0;
        const l = Math.abs(t).toString();
        let r = "";
        let p: number, f: number, d: string;

        if (l.length > 12 + o) {
            const s = t % (p = Math.pow(10, 12)) / Math.pow(10, 12 - n);
            const c = Math.floor(t / p);
            f = Math.floor(s);
            d = f.toString();
            let u = d.length;
            for (; u < n; ++u) d = "0" + d;

            if (a) {
                r = `${this.formatNumber(c)}.${d}T`;
            } else if (n === 0 || f === 0) {
                r = `${this.formatNumber(c)}T`;
            } else {
                for (u = d.length; u > 0 && d[u - 1] === "0"; u--) d = d.substring(0, u - 1);
                r = `${this.formatNumber(c)}.${d}T`;
            }
        } else if (l.length > 9 + o) {
            const s = t % (p = Math.pow(10, 9)) / Math.pow(10, 9 - n);
            const c = Math.floor(t / p);
            f = Math.floor(s);
            d = f.toString();
            let u = d.length;
            for (; u < n; ++u) d = "0" + d;

            if (a) {
                r = `${this.formatNumber(c)}.${d}B`;
            } else if (n === 0 || f === 0) {
                r = `${this.formatNumber(c)}B`;
            } else {
                for (u = d.length; u > 0 && d[u - 1] === "0"; u--) d = d.substring(0, u - 1);
                r = `${this.formatNumber(c)}.${d}B`;
            }
        } else if (l.length > 6 + o) {
            const s = t % (p = Math.pow(10, 6)) / Math.pow(10, 6 - n);
            const c = Math.floor(t / p);
            f = Math.floor(s);
            d = f.toString();
            let u = d.length;
            for (; u < n; ++u) d = "0" + d;

            if (a) {
                r = `${this.formatNumber(c)}.${d}M`;
            } else if (n === 0 || f === 0) {
                r = `${this.formatNumber(c)}M`;
            } else {
                for (u = d.length; u > 0 && d[u - 1] === "0"; u--) d = d.substring(0, u - 1);
                r = `${this.formatNumber(c)}.${d}M`;
            }
        } else if (l.length > 3 + o) {
            const s = t % (p = Math.pow(10, 3)) / Math.pow(10, 3 - n);
            const c = Math.floor(t / p);
            f = Math.floor(s);
            d = f.toString();
            let u = d.length;
            for (; u < n; ++u) d = "0" + d;

            if (a) {
                r = `${this.formatNumber(c)}.${d}K`;
            } else if (n === 0 || f === 0) {
                r = `${this.formatNumber(c)}K`;
            } else {
                for (u = d.length; u > 0 && d[u - 1] === "0"; u--) d = d.substring(0, u - 1);
                r = `${this.formatNumber(c)}.${d}K`;
            }
        } else {
            r = this.formatNumber(Math.abs(t));
        }
        if (i) r = "-" + r;
        return r;
    }

    public static formatEllipsisNumberUsingDot(e: number, t?: number): string {
        e = Math.floor(e);
        const n = e < 0;
        const o = Math.abs(e).toString();
        if (t === undefined) {
            t = 0;
            if (o.length > 3 && o.length <= 6) t = 3;
            else if (o.length > 6 && o.length <= 9) t = 6;
            else if (o.length > 9) t = 9;
        }

        let a = "";
        if (t === 9) a = "B";
        else if (t === 6) a = "M";
        else if (t === 3) a = "K";

        let i = 0;
        for (let l = o.length - 1; l >= 0 && o[l] === "0"; --l) ++i;

        const r = o.length - t;
        for (let l = Math.max(r - 1, o.length - 1 - i); l >= 0; --l) {
            a = o[l] + a;
            if (o.length - t === l) {
                a = "." + a;
            } else if (l !== 0 && l < o.length - t && Math.floor((o.length - t - l) % 3) === 0) {
                a = "," + a;
            }
        }

        if (o.length === t) {
            a = "0" + a;
        } else if (o.length < t) {
            for (let l = 0; l < t - o.length; ++l) a = "0" + a;
            a = "0." + a;
        }
        if (n) a = "-" + a;
        return a;
    }

    public static formatEllipsisNumberUsingDotMaxCount(e: number, t: number): string {
        e = Math.floor(e);
        const n = e < 0;
        const o = Math.abs(e).toString();
        let a = 0;
        for (let i = 1; i <= o.length && o[o.length - i] === "0"; ++i) ++a;

        let l = "";
        if (o.length > 3 && o.length <= 6) l = "K";
        else if (o.length > 6 && o.length <= 9) l = "M";
        else if (o.length > 9 && o.length <= 12) l = "B";
        else if (o.length > 12) l = "T";

        let r = o.length % 3;
        if (r === 0) r = 3;
        let s = Math.max(r - 1, o.length - 1 - a);
        s = Math.min(s, t - 1);

        for (let i = s; i >= 0; --i) {
            l = o[i] + l;
            if (o.length % 3 === 0 && i === 3) {
                l = "." + l;
            } else if (o.length % 3 !== 0 && o.length % 3 === i) {
                l = "." + l;
            }
        }
        if (n) l = "-" + l;
        return l;
    }

    public static formatEllipsisNumberUsingDotUnderPointCount(e: number, t: number): string {
        e = Math.floor(e);
        const n = e < 0;
        const o = Math.abs(e).toString();
        let a = 0;
        for (let i = 1; i <= o.length && o[o.length - i] === "0"; ++i) ++a;

        let l = "";
        if (o.length > 3 && o.length <= 6) l = "K";
        else if (o.length > 6 && o.length <= 9) l = "M";
        else if (o.length > 9 && o.length <= 12) l = "B";
        else if (o.length > 12) l = "T";

        let r = o.length % 3;
        if (r === 0) r = 3;
        let s = Math.max(r - 1, o.length - 1 - a);
        s = Math.min(s, r + t - 1);

        for (let i = s; i >= 0; --i) {
            l = o[i] + l;
            if (o.length % 3 === 0 && i === 3) {
                l = "." + l;
            } else if (o.length % 3 !== 0 && o.length % 3 === i) {
                l = "." + l;
            }
        }
        if (n) l = "-" + l;
        return l;
    }

    public static formatEllipsisNumberUsingDotUnderPointCountRemoveZero(e: number, t: number): string {
        e = Math.floor(e);
        const n = e < 0;
        const o = Math.abs(e).toString();
        let a = 0;
        for (let i = 1; i <= o.length && o[o.length - i] === "0"; ++i) ++a;

        let l = "";
        if (o.length > 3 && o.length <= 6) l = "K";
        else if (o.length > 6 && o.length <= 9) l = "M";
        else if (o.length > 9 && o.length <= 12) l = "B";
        else if (o.length > 12) l = "T";

        let r = o.length % 3;
        if (r === 0) r = 3;
        let s = Math.max(r - 1, o.length - 1 - a);
        s = Math.min(s, r + t - 1);

        for (let i = s; i >= 0; --i) {
            l = o[i] + l;
            if ((o.length % 3 === 0 && i === 3 && o[i] !== "0") || (o.length % 3 !== 0 && o.length % 3 === i && o[i] !== "0")) {
                l = "." + l;
            }
        }
        if (n) l = "-" + l;
        return l;
    }

    public static formatEllipsisNumberDisplay(t: number): string {
        const n = this.getDisplayEllipsisCount(t);
        return Math.abs(t).toString().length - n === 4 
            ? this.formatEllipsisNumber(t, n) 
            : this.formatEllipsisNumberUsingDotUnderPointCountRemoveZero(t, 1);
    }

    public static getDisplayEllipsisCount(e: number): number {
        let t = 0;
        while (Math.floor(e).toString().length - t > 4) {
            t += 3;
        }
        return t;
    }

    public static formatEllipsisWithEllipsisRange(e: number, t: number[], n?: Function | null): string {
        if (n === undefined) n = null;
        const o = ["K", "M", "B", "T"];
        const a = [3, 6, 9, 12];
        let i = 1;
        let l = "";
        for (let r = 0; r < t.length; ++r) {
            if (e >= Math.pow(10, t[r])) {
                i = Math.pow(10, a[r]);
                l = o[r];
            }
        }
        let s = e / i;
        if (n !== null) s = n(s);
        return `${s.toString()}${l}`;
    }

    public static formatOrdinalNumber(t: number): string {
        const n = t % 100;
        const o = this.ordinalNumberPostfix;
        return `${t}${o[(n - 20) % 10] || o[n] || o[0]}`;
    }

    public static formatOrdinalNumberUppercase(t: number): string {
        return this.formatOrdinalNumber(t).toUpperCase();
    }

    public static getOrdinalNumberPostfix(t: number): string {
        const n = t % 100;
        const o = this.ordinalNumberPostfix;
        return o[(n - 20) % 10] || o[n] || o[0];
    }
}