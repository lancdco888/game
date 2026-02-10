import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager, { ResultSymbolInfo } from "../../manager/SlotGameResultManager";

const { ccclass } = cc._decorator;

/**
 * 幸运兔子掉落的 jackpot 符号信息辅助类
 */
@ccclass()
export default class JackpotSymbolInfoHelper_LuckyBunnyDrop {
    /**
     * 根据符号ID获取对应的符号信息（倍率/ jackpot 类型）
     * @param symbolId 符号ID（201-215/301-315区间）
     * @returns ResultSymbolInfo 符号信息对象
     */
    public static getSymbolInfo(symbolId: number): ResultSymbolInfo {
        const symbolInfo = new ResultSymbolInfo();
        
        switch (symbolId) {
            case 201: case 301:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 10;
                break;
            case 202: case 302:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 15;
                break;
            case 203: case 303:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 25;
                break;
            case 204: case 304:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 50;
                break;
            case 205: case 305:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 75;
                break;
            case 206: case 306:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 250;
                break;
            case 207: case 307:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 300;
                break;
            case 208: case 308:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 350;
                break;
            case 209: case 309:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 400;
                break;
            case 210: case 310:
                symbolInfo.type = "multiplier";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 450;
                break;
            case 211: case 311:
                symbolInfo.type = "jackpot";
                symbolInfo.key = "mini";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 500;
                break;
            case 212: case 312:
                symbolInfo.type = "jackpot";
                symbolInfo.key = "minor";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 1250;
                break;
            case 213: case 313:
                symbolInfo.type = "jackpot";
                symbolInfo.key = "major";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 2500;
                break;
            case 214: case 314:
                symbolInfo.type = "jackpot";
                symbolInfo.key = "mega";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 5000; // 5e3 转换为数字字面量，更易读
                break;
            case 215: case 315:
                symbolInfo.type = "jackpot";
                symbolInfo.key = "grand";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 50000; // 5e4 转换为数字字面量
                break;
            default:
                symbolInfo.type = "";
                symbolInfo.key = "";
                symbolInfo.prize = 0;
                symbolInfo.multiplier = 0;
                break;
        }

        return symbolInfo;
    }

    /**
     * 获取结果ID（匹配200以上的符号ID）
     * @param windowIndex 窗口索引
     * @param symbolIndex 符号索引
     * @returns 符合条件的符号ID，无则返回-1
     */
    public static getResultID(windowIndex: number, symbolIndex: number): number {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let i = 0; i < historyWindows.length; i++) {
            const window = historyWindows[i].GetWindow(windowIndex);
            if (!TSUtility.isValid(window)) {
                cc.log("Not Have Window");
                continue; // 增加continue，避免后续无效操作
            }
            const symbolId = window.getSymbol(symbolIndex);
            if (symbolId > 200) {
                return symbolId;
            }
        }
        return -1;
    }

    /**
     * 获取奖励结果ID（匹配300以上的符号ID）
     * @param windowIndex 窗口索引
     * @param symbolIndex 符号索引
     * @returns 符合条件的符号ID，无则返回-1
     */
    public static getRewardResultID(windowIndex: number, symbolIndex: number): number {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let i = 0; i < historyWindows.length; i++) {
            const window = historyWindows[i].GetWindow(windowIndex);
            if (!TSUtility.isValid(window)) {
                cc.log("Not Have Window");
                continue; // 增加continue，避免后续无效操作
            }
            const symbolId = window.getSymbol(symbolIndex);
            if (symbolId > 300) {
                return symbolId;
            }
        }
        return -1;
    }
}