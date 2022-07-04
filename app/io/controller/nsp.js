"use strict";
const { Controller } = require("egg");
class NspController extends Controller {
    async chekUser(userInfo){
      const { ctx, app } = this;
        //检查用户名密码
        const { username, password } = userInfo;
        const queryPassword = await app.redis.hget("usersInfo", username);
        if (queryPassword === password) {
            //用户验证成功,获取用户发送的数据
            const chatInfo = ctx.args[0];
            //保存用户发送的数据
            // await app.redis.lpush('chatInfos',JSON.stringify({...chatInfo,username}))
            const namespace = app.io.of("/");
            // 广播
            namespace.emit("data", {...chatInfo, username });
            // const sockets = Object.keys(namespace.sockets)
            console.log('current sockets', Object.keys(namespace.sockets));
            // for(const socket of sockets){
            //   namespace.sockets[socket].emit('res', {...chatInfo,username});
            // }

            await ctx.socket.emit("res", `message has already send`);
        }
    }

    async index() {
        const { ctx, app } = this;
        const token = ctx.socket.handshake.query.usekey;
        app.jwt.verify(token,'creazing', async (err,decoded)=>{
          if(err){
            await ctx.socket.emit("res", {token:'expired'});
          }else{
            await this.chekUser(decoded)
          }
        });
      
    }
}