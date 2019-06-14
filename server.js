var express = require('express');
var app = express();
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc123',
    database: 'GPS1'
});

var list = [1, 2];

connection.query('SELECT SJ,JD,WD from GPS20180501 ORDER BY "SJ"', function(error, results, fields) {
    if (error) throw error;
    list = results;
    var klist = [];
    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var PI = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    function gcj02tobd09(lng, lat) {
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat]
    }
    // 重新排序
    function change() {
        var flag = 0;
        for (let i = 0; i < 1440; i++) {
            var le = [];
            klist.push(le);
            for (let j = flag; j < list.length; j++) {
                if (list[j].SJ >= i * 60 + 1525100000 && list[j].SJ <= i * 60 + 1525100060) {
                    var oe = gcj02tobd09(list[j].JD, list[j].WD);
                    klist[i].push(oe);
                } else { flag = j; break; }
            }
        }
        for (let i = klist.length - 1; i >= 0; i--) {
            if (klist[i] == null) { klist.splice(i, 1); }
        }
        return klist;
    }
    //console.log(change());

    app.use('*', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credential', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        next();
    });

    const bodyParser = require('body-parser');
    app.use(bodyParser.json()); //数据JSON类型
    app.use(bodyParser.urlencoded({ extended: false })); //解析post请求数据

    var llist = change();

    app.post('/iji', function(req, res) {
        console.log(req.body.time);
        res.send(llist[req.body.time]);
    })

    var server = app.listen(8081, function() {
        var host = server.address().address
        var port = server.address().port

        console.log("Application Demo, visit http://%s:%s", host, port)
    })
});