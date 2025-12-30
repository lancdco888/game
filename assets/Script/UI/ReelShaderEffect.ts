const { ccclass, property } = cc._decorator;

@ccclass
export default class ReelShaderEffect extends cc.Component {
    // ===== 原代码空实现方法 1: 设置Shader程序入口，完全保留空函数，无参数无返回值 =====
    setProgram(param?:any): void { }

    // ===== 原代码空实现方法 2: 设置Shader变量入口，完全保留空函数，无参数无返回值 =====
    setValue(key:string,val:any): void { }
}