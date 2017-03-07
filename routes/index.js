var express = require('express');
var request = require('request');
var crypto = require('crypto');
var router = express.Router();

var token = "WeChatOnNode"; // 可自定义,需要与微信平台设置的token一致！
var appID = 'wx82869d3109acf2af';
var APPSECRET = '57dde3521381a5d98de0f45840f1ca0f';

/* GET home page. */
router.get('/', function(req, res, next) {

    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(token, timestamp, nonce);
    array.sort();
    var str = array.toString().replace(/,/g, "");

    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(str, 'utf-8').digest("hex");

    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (code === signature) {
        //res.send(echostr);
        request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APPID + '&secret=' + APPSECRET, (err, res, body) => {
            if (!err && res.errcode != undefined) {
                console.log(res.access_token);
                let jsonData = {
                    "button": [{
                            "type": "click",
                            "name": "今日歌曲",
                            "key": "V1001_TODAY_MUSIC"
                        },
                        {
                            "name": "菜单",
                            "sub_button": [{
                                    "type": "view",
                                    "name": "搜索",
                                    "url": "http://www.soso.com/"
                                },
                                {
                                    "type": "view",
                                    "name": "视频",
                                    "url": "http://v.qq.com/"
                                },
                                {
                                    "type": "click",
                                    "name": "赞一下我们",
                                    "key": "V1001_GOOD"
                                }
                            ]
                        }
                    ]
                };
                request.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + res.access_token, jsonData, (err, res, body) => {
                    if (!err && res.errmsg === 'ok') {
                        console.log('生成自定义菜单POST请求成功');
                    }
                });
            }
        });
    } else {
        res.send("index error");
    }
});
module.exports = router;