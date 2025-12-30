/*
 *  单例父类
 *
 */

export default class SingtonClass {
	public constructor() {
	}

	static instance<T extends {}>(this: new (...args) => T): T {
		for (var t = [], e = 0; e < arguments.length; e++)
			t[e] = arguments[e];
        if(!(<any>this)._instance){
            (<any>this)._instance = new this(t);
        }
        return (<any>this)._instance;
    }

}