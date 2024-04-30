import { getGlobalData } from "../global_data";
import request from "./request";
import uniImUtils from '@/uni_modules/uni-im/common/utils.js';
import uniIm from '@/uni_modules/uni-im/lib/main.js';
interface UserInfo {
	[keyName: string]: any
}


/**
 * 应用
 * @example
 * ```
	const app = new Application();
	app.auth.then(authData=> {
	  console.log(authData)
	})
 * ```
 * 
 */
class Application {
	auth : Promise<any>;
	userInfo : Promise<UserInfo> | null;
	token ?: string;
	_userInfo : UserInfo;
	globalData : Map<any, any>;

	constructor() {
		// 使用微信平台token
		// #ifdef H5
		this.token = '16820846465401';
		// #endif
		this.globalData = new Map();;
	}

// 登录方法
	login = () => {
		if (this.auth) {
			return this.auth;
		}
		this.auth = new Promise((resolve) => {
			
			// #ifdef MP
			uni.login({
				success: async (res) => {
					if (!res.code) {
						console.error('not loginCode', res.errMsg)
						this.auth = null;
						this.handleError(res.errMsg)
						return;
					}

					try {
						const referrerId = getGlobalData('referrerId');
						console.log('login', referrerId)
						const ress = await request({
							url: '/wxLogin',
							data: {
								jsCode: res.code,
								refId: referrerId === 'undefined' ? undefined : referrerId,
							}
						})

						uni.setStorageSync('token', ress.data.token)

						resolve(ress)
						
						// 登录到聊天系统
						this.loginIM();
					} catch (err) {
						console.error('wxLogin error', err?.message)
						this.auth = null;
						this.handleError(err?.message)
					}

				},
				fail: (err) => {
					this.auth = null;
					console.error('login error', err?.message)
					this.handleError(err?.message)
				}
			})
			// #endif 

			// #ifdef H5
			uni.setStorageSync('token', this.token)

			resolve(null)
			// #endif
		})
		return this.auth;
	}

	loginIM = () => {
		// 登录到IM
		request({url: '/mobile/im/login', method: 'get' }).then(async (res) => {
			await uniImUtils.login(res.data);
			await uniIm.conversation.loadMore();
			const count = await uniIm.conversation.unreadCount();
			if (count > 0) {
				let tabIndex = 3;
				// #ifdef MP-WEIXIN
				// tabIndex = 2;
				// #endif
				uni.setTabBarBadge({
					index: tabIndex,
					text: count + ''
				})
				uni.$emit('newMsg', count);
			}
		});
	}

	/** 处理手机号获取按钮的点击时间 */
	handleGetPhoneNumber = (e : any, callback : any) => {
		this.login().then((RES) => {
			// 调用登录方法获取code
			request({
				url: '/mobile/getPhoneNumber',
				data: {
					// #ifdef MP-WEIXIN
					openId: RES.data.openId,
					code: e.detail.code,
					// #endif
					// #ifdef MP-TOUTIAO
					// session_key: RES.data.data.session_key,
					iv: e.detail.iv,
					encryptedData: e.detail.encryptedData
					// #endif
					// #ifdef MP-KUAISHOU
					
					// #endif
				}
			}).then(() => {
				this.getUserInfo(true).then(res => {
					// request({
					// 	url: '/updateCustomerInfoByOpenId',
					// 	data: {
					// 		openId: res.openId,
					// 		identity: '1', // 用户来源 
					// 		validUser: '1',
					// 	}
					// })
					callback(res)
				})
			}).catch(() => { })
			
		})
	}

	/** 
	 * 获取用户信息
	 * @param repeat - 是否重新获取用户信息
	 * @param needAuth - 是否需要注册账户信息，没有时将跳转相应页面
	 * @param isPush - 是否使用push跳转
	 */
	getUserInfo = async (repeat ?: boolean, needAuth ?: boolean, isPush: boolean = false) : Promise<UserInfo> => {
		// 获取打开小程序的入口
		const launchOption = uni.getLaunchOptionsSync()

		if (launchOption.scene == 1154) {
			// 朋友圈内打开“单页模式”, 无法登录
			uni.showToast({
				title: '请前往小程序使用完整服务',
				icon: 'none'
			})
			throw new Error('请前往小程序使用完整服务')
		}
		if (!this.auth) {
			return this.login().then((res) => {
				// #ifdef MP-WEIXIN
				this.getUserRoleInfo(res);
				// #endif
				return this.getUserInfo();
			})
		}
		if (this.userInfo && !repeat) {
			if (needAuth && this.checkAuth(isPush)) {
				return this.userInfo;
			} else {
				return this.userInfo;
			}
		}
		this.userInfo = new Promise((resolve) => {
			request({
				url: '/mobile/getLoginCustomerInfo'
			}).then(res => {
				const data = res.data || {};
				const referrerId = getGlobalData('referrerId');
				// if (referrerId && !data.referrerId && data.customerId !== referrerId) {
				// 	// 增加推荐人
				// 	request({
				// 		url: '/updateCustomerInfoByOpenId',
				// 		data: {
				// 			referrerId,
				// 			openId: data.openId,
				// 			sourceType: '2', // 用户来源 分享
				// 		}
				// 	})
				// } 
				// else if (data.validUser !== '1' && data.verify === 'T') {
				// 	request({
				// 		url: '/updateCustomerInfoByOpenId',
				// 		data: {
				// 			openId: data.openId,
				// 			validUser: '1',
				// 		}
				// 	})
				// }
				this._userInfo = data;
				if (needAuth) {
					this.checkAuth(isPush);
				}
				resolve(data)
			}).catch(err => {
				this.userInfo = null;
				this.handleError(err?.message)
			})
		})
		return this.userInfo;
	}
// 鉴权
	checkAuth = (isPush ?: boolean) => {
		if (!this._userInfo) return false;

		if (this._userInfo.verify !== 'T' || !this._userInfo.phoneNumber) {
			uni[isPush ? 'navigateTo' : 'redirectTo']({
				url: '/pages/user/nameAuth'
			})
			return false
		}
		return true;
	}

	// 获取用户角色
	getUserRoleInfo = (data: any) => {
		request({
			url: '/mobile/getUserTpyeByOpenId',
			method: 'get',
			data: {
				openId: data.data.openid
			}
		}).then(res => {
			const urls = ['/queryMenu', '/getUserMenuCatalog'];
			const userType = res.data?.userType;
			// if (userType) {
			// 	request({
			// 		url: urls[userType]
			// 	}).then(res => {
			// 		uni.setStorageSync('menus', res.data);
			// 	});
			// }
			uni.setStorageSync('userRoleInfo', userType);
		});
	}

	handleError = (errMsg : any) => {
		uni.showModal({
			title: '服务异常',
			content: errMsg || '',
			showCancel: false,
			confirmText: '重试',
			success: function (res) {
				const pages = getCurrentPages();

				uni.reLaunch({
					url: '/' + pages[pages.length - 1].route
				})

			}
		})
	}

	getLocation = () => {
		return new Promise((resolve, reject) => {

			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					resolve(res)
				},
				fail: (err) => {
					console.error(err)
				}
			})
		})
	}

	navigateTo = ({
		url,
		needAuth,
	} : { url : string; needAuth }) => {
		this.getUserInfo().then(res => {

			if (needAuth && (res.verify !== 'T' || !res.phoneNumber)) {
				uni.navigateTo({
					url: '/pages/user/nameAuth',
				})
			} else {
				uni.navigateTo({
					url
				})
			}
		})
	}

	subscribeMessage = (tmplIds : string[]) => {
		return new Promise((resolve, reject) => {
			// #ifdef MP-WEIXIN
			uni.requestSubscribeMessage({
				tmplIds,
				success: (res) => {
					resolve(res);
				},
				fail: (err) => {
					reject(err);
				},
				complete: () => {
					resolve(null);	
				}
			});
			// #endif
			// #ifdef MP-TOUTIAO
			// tt.requestSubscribeMessage({
			// 	tmplIds,
			// 	success: (res) => {
			// 		resolve(res);
			// 	},
			// 	fail: (err) => {
			// 		reject(err);
			// 	}
			// });
			// // #endif
			resolve(null);
		})
	}
}


const app = new Application();

export default app;