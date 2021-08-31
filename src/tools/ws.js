// 闭包，实现单例模式
const single = (() => {
  let url
  // 实例化的ws对象
  let instance
  // 通道列表
  let channels = []
  // 重连次数
  let re_connect_times = 0
  // 创建连接
  const create = (uri) => {
    if (!instance) {
      if (!url) {
        url = uri
      }
      try {
        instance = new WebSocket(url)
      } catch (e) {
      }
      instance.onmessage = e => {
        let { data } = e
        try {
          data = JSON.parse(data)
          const evt = channels.find(e => {
            return e.channel === data.channel
          })
          evt.handler(data.data)
        } catch (e) {
          console.warn('sever data parse error')
          console.trace(e)
        }
      }
    }
    return instance
  }
  // 执行重连
  const reconnect = () => {
    set_reconnect_times()
    instance = null
    create()
  }
  // 绑定一个管道处理事件
  const bind = (channel, handler) => {
    let exist = channels.some(e => {
      return e.channel === channel
    })
    if (exist) {
      console.trace('channel has been exist!')
      return
    }
    channels.push({
      channel, handler
    })
  }
  // 设置重连次数
  const set_reconnect_times = (times) => {
    if (times !== undefined) {
      re_connect_times = times
      return
    }
    re_connect_times += 1
  }
  // 获取重连次数
  const get_reconnect_time = () => {
    return re_connect_times
  }
  // 获取实例化的instance
  const get = () => {
    return instance
  }
  // 返回数据
  return {
    get,
    create,
    reconnect,
    bind,
    set_reconnect_times,
    get_reconnect_time,
    get_channels() {
      return channels
    },
    get_url() {
      return url
    }
  }
})()

class Ws {
  /**
   * 初始化数据
   * @param options {{channels:[{channel:string,handler:Function}],url:string,maxReConTimes:int,reConInterval:int}}
   */
  constructor(options) {
    this.reconneting = false
    let { channels, url, maxReConTimes, reConInterval } = options
    this.maxReConTimes = maxReConTimes || 3
    this.reConInterval = reConInterval || 3
    this.channels = channels || []
    this.url = url
    if (single.get()) {
      this.ws = single.get()
      this.listen_evt()
      return
    }
    this.init()
  }

  /**
   * 数据是连接是否已建立
   * @returns {Promise<WebSocketInstance>}
   */
  ready() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        if (this.ws.readyState === 1) {
          resolve(this.ws)
        }
      }
    })
  }

  /**
   * 初始化相关操作
   */
  init() {
    this.ws = single.create(this.url)
    this.channels.forEach(({ channel, handler }) => {
      single.bind(channel, handler)
    })
    this.listen_evt()
  }

  /**
   * 监听websocket关闭事件进行重连
   */
  listen_evt() {
    this.ws.onclose = e => {
      this.reconneting = true
      if (single.get_reconnect_time() >= this.maxReConTimes) {
        console.log(`重连${ single.get_reconnect_time() }次服务全部失败，取消重连！`)
        return
      }
      setTimeout(() => {
        this.reconneting = false
        this.reconnect()
      }, this.reConInterval * 1000)
    }
  }

  /**
   * 重连方法
   */
  reconnect() {
    if (this.reconneting) {
      return
    }
    console.log(`WebSocket连接已断开，正在尝试第${ single.get_reconnect_time() + 1 }次重连...`)
    single.reconnect()
    this.ws = single.get()
    this.ready().then(ws => {
      console.log(`第${ single.get_reconnect_time() }次重连成功！`)
      single.set_reconnect_times(0)
    })
    this.listen_evt()
  }

  /**
   * 获取配置
   * @returns {{maxReConTimes: (*|int|number), channels: [{channel:string,handler:Function}], reConInterval: (*|int|number), url:string}}
   */
  get_options() {
    return {
      url: single.get_url(),
      channels: single.get_channels(),
      maxReConTimes: this.maxReConTimes,
      reConInterval: this.reConInterval
    }
  }

  /**
   * 添加一个事件通道
   * @param channel
   * @param handler
   */
  static add_channel(channel, handler) {
    single.bind(...arguments)
  }
}

export default Ws
