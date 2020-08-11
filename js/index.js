$(function () {
    $("body").delegate(".comment", "propertychange input", function () {
        if ($(".comment").val().length > 0) {
            $(".send").prop("disabled", false);
        } else {
            $(".send").prop("disabled", true);

        }
    });
    // var number = $.getCookie("pageNumber") || 1;
    var number = window.location.hash.substring(1) || 1;
    //发送微博
    $(".send").click(function () {
        console.log('zx');
        if ($(".comment").val().length > 0) {
            $(".send").prop("disabled", false);
        } else {
            $(".send").prop("disabled", true);

        }
        var $text = $(".comment").val();
        //weibo.php?act=add&content=xxx	添加一条
        //返回：{error: 0, id: 新添加内容的ID, time: 添加时间, acc: 点赞数, ref: 点踩数}
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=add&content=" + $text,
            success: function (msg) {
                var obj = eval("(" + msg + ")");
                obj.content = $text;
                var $weibo = createEle(obj);
                $weibo.get(0).obj = obj;
                $(".messageList").prepend($weibo);
                $(".comment").val("");
                getMsgPage();
                if ($(".info").length > 6) {
                    $(".info:last-child").remove();
                }

            },
            error: function (xhr) {
                alert(xhr.status);
            }

        })
    });

    //获取微博
    //weibo.php?act=get&page=1		获取一页数据
    // 返回：[{id: ID, content: "内容", time: 时间戳, acc: 顶次数, ref: 踩次数}, {...}, ...]
    getMsgList(number);

    function getMsgList(number) {
        $(".messageList").html("");
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=get&page=" + number,
            success: function (msg) {
                var obj = eval("(" + msg + ")");
                $.each(obj, function (key, value) {
                    var $weibo = createEle(value);
                    $weibo.get(0).obj = value;
                    $(".messageList").append($weibo);
                })
            }, error: function (xhr) {
                alert(xhr.status);
            }
        })
    }

    //weibo.php?act=acc&id=12			顶某一条数据
    // 				返回：{error:0}
    //
    // 			weibo.php?act=ref&id=12			踩某一条数据
    // 				返回：{error:0}
    //
    // 			weibo.php?act=del&id=12			删除一条数据
    // 				返回：{error:0}

    $("body").delegate(".infoTop", "click", function () {
        $(this).text(parseInt($(this).text()) + 1);
        var obj = $(this).parents(".info").get(0).obj;
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=acc&id=" + obj.id,
            success: function (msg) {
                console.log(msg);
            }, error: function (xhr) {
                alert(xhr.status);
            }
        })
    });
    $("body").delegate(".infoDown", "click", function () {
        $(this).text(parseInt($(this).text()) + 1);
        var obj = $(this).parents(".info").get(0).obj;
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=ref&id=" + obj.id,
            success: function (msg) {
                console.log(msg);
            }, error: function (xhr) {
                alert(xhr.status);
            }
        })
    });
    $("body").delegate(".infoDel", "click", function () {
        $(this).parents(".info").remove();
        var obj = $(this).parents(".info").get(0).obj;
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=del&id=" + obj.id,
            success: function (msg) {
                console.log(msg);
            }, error: function (xhr) {
                alert(xhr.status);
            }
        })
        getMsgList($(".cur").html());
    });

    getMsgPage();

    //获取页码
    function getMsgPage() {
        //weibo.php?act=get_page_count	获取页数
        // 				返回：{count:页数}
        $(".page").html("");
        $.ajax({
            type: "get",
            url: "weibo.php",
            data: "act=get_page_count",
            success: function (msg) {
                var obj = eval("(" + msg + ")");
                for (var i = 0; i < obj.count; i++) {
                    var $a = $(" <a href=\"javascript:;\">" + (i + 1) + "</a>");
                    if (i === number - 1) {
                        $a.addClass("cur");
                    }
                    $(".page").append($a);
                }
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        })
    }

    //监听页码的点击(对于动态创建的元素监听其点击要利用事件委托)
    $("body").delegate(".page>a", "click", function () {
        $(this).addClass("cur");
        $(this).siblings().removeClass("cur");
        getMsgList($(this).html());
        window.location.hash = $(this).html();
        // $.addCookie("pageNumber",$(this).html());
    })

    //创建微博每一条微博数据
    function createEle(obj) {
        var $weibo = $("<div class=\"info\">\n" +
            "            <p class=\"infoText\">" + obj.content + "</p>\n" +
            "            <p class=\"infoOperation\">\n" +
            "                <span class=\"infoTime\">" + formartDate(obj.time) + "</span>\n" +
            "                <span class=\"infoHandle\">\n" +
            "                        <a href=\"javascript:;\" class='infoTop'>" + obj.acc + "</a>\n" +
            "                            <a href=\"javascript:;\" class='infoDown'>" + obj.ref + "</a>\n" +
            "                            <a href=\"javascript:;\" class='infoDel'>删除</a>\n" +
            "                        </span>\n" +
            "            </p>\n" +
            "        </div>")
        return $weibo;
    };


    // 生成时间方法
    function formartDate(time) {
        var date = new Date(time * 1000);
        // 2018-4-3 21:30:23
        var arr = [date.getFullYear() + "-",
            date.getMonth() + 1 + "-",
            date.getDate() + " ",
            date.getHours() + ":",
            date.getMinutes() + ":",
            date.getSeconds()];
        return arr.join("");
    }
});