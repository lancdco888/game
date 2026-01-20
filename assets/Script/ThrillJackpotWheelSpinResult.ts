import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";

// Cocos 2.x 标准头部解构写法 (指定要求)
const { ccclass, property } = cc._decorator;

/**
 * 单轮抽奖结果类 - 存储单轮轮盘的抽奖数据
 */
export class SingleResult {
    // 轮盘索引
    private _wheelIdx: number = 0;
    // 停止位置索引
    private _stopIdx: number = 0;
    // 奖励数值
    private _value: number = 0;
    // 奖励描述（如 "coin" 表示金币奖励）
    private _desc: string = "";

    /**
     * 获取 jackpot 类型
     * @returns 类型值：-1(金币)/0/1/2/3/4，对应不同奖励类型
     */
    getJackpotType(): number {
        if (this.isRewardCoin()) {
            return -1;
        }
        if (this._wheelIdx === 1) {
            return 0;
        }
        if (this._wheelIdx === 2) {
            return this._stopIdx === 1 ? 1 : 2;
        }
        if (this._wheelIdx === 3) {
            const zoneId = UserInfo.instance().getZoneId();
            return ServiceInfoManager.instance.isEnableDiamondJackpot(zoneId) 
                ? (this._stopIdx === 1 ? 3 : 4) 
                : 3;
        }
        return -1;
    }

    /**
     * 判断是否为金币奖励
     * @returns true=金币奖励，false=其他奖励
     */
    isRewardCoin(): boolean {
        return this._desc === "coin";
    }

    /**
     * 获取奖励金额/数值
     * @returns 奖励数值
     */
    getRewardMoney(): number {
        return this._value;
    }

    // 为了兼容原代码的属性赋值逻辑，开放属性访问（或可封装setter）
    set wheelIdx(val: number) { this._wheelIdx = val; }
    set stopIdx(val: number) { this._stopIdx = val; }
    set value(val: number) { this._value = val; }
    set desc(val: string) { this._desc = val; }
}

/**
 * 轮盘抽奖结果解析类 - 管理多轮抽奖结果的解析和计算
 */
@ccclass
export default class ThrillJackpotWheelSpinResult {
    // 所有单轮抽奖结果列表
    private _listSingleResult: SingleResult[] = [];

    /**
     * 解析后台返回的抽奖结果数据
     * @param data 后台返回的原始抽奖结果数组
     */
    parse(data: Array<{ wheelIdx: number; result: { stopIdx: number; value: number; desc: string } }>): void {
        this._listSingleResult = []; // 清空原有数据
        for (let t = 0; t < data.length; ++t) {
            const singleResult = new SingleResult();
            singleResult.wheelIdx = data[t].wheelIdx;
            singleResult.stopIdx = data[t].result.stopIdx;
            singleResult.value = data[t].result.value;
            singleResult.desc = data[t].result.desc;
            this._listSingleResult.push(singleResult);
        }
    }

    /**
     * 获取轮盘抽奖的次数
     * @returns 抽奖次数（结果列表长度）
     */
    getWheelSpinCount(): number {
        return this._listSingleResult.length;
    }

    /**
     * 根据轮盘索引获取对应的单轮结果
     * @param wheelIdx 轮盘索引
     * @returns 对应索引的SingleResult，无则返回null
     */
    getSingleResult(wheelIdx: number): SingleResult | null {
        for (let n = 0; n < this._listSingleResult.length; ++n) {
            if (this._listSingleResult[n]["_wheelIdx"] === wheelIdx) { // 兼容原私有属性访问
                return this._listSingleResult[n];
            }
        }
        return null;
    }

    /**
     * 计算所有奖励数值的总和
     * @returns 奖励总和
     */
    getSumOfValues(): number {
        let total = 0;
        for (let t = 0; t < this._listSingleResult.length; ++t) {
            total += this._listSingleResult[t].getRewardMoney();
        }
        return total;
    }
}