import FireHoseSender, { FHLogType } from "./FireHoseSender";

const { ccclass, property } = cc._decorator;


/**
 * 全局错误捕获器
 * 负责捕获原生/WEB端的JS运行时错误和未处理的Promise拒绝，并统一上报到FireHose日志系统
 */
@ccclass()
export default class ErrorCatcher {
    /**
     * 初始化错误捕获器（区分原生/WEB端实现不同的错误监听逻辑）
     */
    public static Init(): void {
        // 原生平台（iOS/Android）错误捕获逻辑
        if (cc.sys.isNative) {
      
            // 原生端自定义错误处理函数
            window["__errorHandler"] = function(url: string, line: number, msg: string, callstack: string) {
                const errorData: Record<string, any> = {};
                let stack = "";

                // 组装错误基础信息
                if (msg) errorData.msg = msg;
                if (url) errorData.url = url;
                if (!line) line = -1; // 行号默认值
                if (callstack) stack = callstack;

                // 上报错误到FireHose
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecordByInfo(
                        FHLogType.Exception,
                        errorData,
                        stack,
                        line,
                        -1 // 列号默认值
                    )
                );
            };

            // 原生端未处理的Promise拒绝处理函数
            window["__errorUnhandlerejection"] = function(error: { msg: string; callstack: string }) {
                const errorData: Record<string, any> = {};
                if (error.msg) errorData.msg = error.msg;

                // 上报未处理的Promise拒绝到FireHose
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecordByInfo(
                        FHLogType.Exception,
                        errorData,
                        error.callstack,
                        -1, // 行号默认值
                        -1  // 列号默认值
                    )
                );
            };
        } 
        // WEB端（浏览器）错误捕获逻辑
        else {
            // // WEB端全局错误监听（window.onerror）
            // window.onerror = function(message: string, source: string, lineno: number, colno: number, error: Error) {
            //     const errorData: Record<string, any> = {};
            //     let stack = "";

            //     // 组装错误基础信息
            //     if (message) errorData.msg = message;
            //     if (source) errorData.url = source;
            //     if (!lineno) lineno = -1; // 行号默认值
            //     if (!colno) colno = -1;   // 列号默认值
            //     if (error && error.stack) stack = error.stack.toString(); // 错误堆栈
            //     if (stack){
            //         errorData.stack = stack
            //     }

            //     // // 上报错误到FireHose
            //     // FireHoseSender.Instance().sendAws(
            //     //     FireHoseSender.Instance().getRecordByInfo(
            //     //         FHLogType.Exception,
            //     //         errorData,
            //     //         stack,
            //     //         lineno,
            //     //         colno
            //     //     )
            //     // );
            //     console.error(JSON.stringify(errorData))
            // };

            // // WEB端未处理的Promise拒绝监听
            // window.addEventListener("unhandledrejection", function(event: PromiseRejectionEvent) {
            //     const errorData: Record<string, any> = {};
            //     let stack = "";

            //     // 组装Promise拒绝错误信息
            //     if (event && event.reason) {
            //         if (event.reason.stack) stack = event.reason.stack; // 错误堆栈
            //         if (event.reason.message) errorData.msg = event.reason.message; // 错误消息
            //     }
            //     errorData.url = ""; // WEB端Promise拒绝默认无URL

            //     // // 上报未处理的Promise拒绝到FireHose
            //     // FireHoseSender.Instance().sendAws(
            //     //     FireHoseSender.Instance().getRecordByInfo(
            //     //         FHLogType.Exception,
            //     //         errorData,
            //     //         stack,
            //     //         -1, // 行号默认值
            //     //         -1  // 列号默认值
            //     //     )
            //     // );
            //     console.error(event)
            // });
        }
    }
}