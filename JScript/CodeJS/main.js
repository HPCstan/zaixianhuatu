/*
* 對前端的操作建立
* 作者：Tim  北京
* 2014-5-12建立
* 2014-6-21修改
* 2014-08-17完成工具箱功能
* 2014-12基本完成
*/

//#region 系統要使用的變數

var username = ""; //使用者進行協同作業的使用者名稱
var scHeight = 0; //螢幕的高
var scWidth = 0; //螢幕的寬

var drawarea = $(".drawWindow");             //取得繪圖區域，包含兩塊畫布

var showcanvas = document.getElementById("showcanvas");        //最終展現區
var show = showcanvas.getContext("2d");

var tempcanvas = document.getElementById("tempcanvas");        //臨時繪圖區，每次滑鼠移動繪圖前要進行畫布清空
var temp = tempcanvas.getContext("2d");

//var mapWidth = tempcanvas.getAttribute("width"); //臨時繪圖區寬
//var mapHeight = tempcanvas.getAttribute("height"); //臨時繪圖區高
var mapWidth;//繪圖區域寬
var mapHeight;//繪圖區域高

var isMouseDown = false;      //滑鼠是否按下，按下開始繪圖
var startX = 0;                   //滑鼠起始X座標
var startY = 0;                   //滑鼠起始Y座標

var currentX = 0;                  //滑鼠當前X座標
var currentY = 0;                  //滑鼠當前Y座標

var pencolor = "";                  //線顏色、填充顏色
var penwidth = "";                  //線粗細
var penshowdow = "";                //模糊程度
var penalpha = "";                  //透明度
var penstyle = "";                  //筆頭樣式

var drawObject = "btnPencil";                //繪圖物件
var drawObjectName = "鉛筆（P）";
var drawObjectIcon = "icon-btnPencil";

var oprationmenuid;                 //選單下的操作id
var oprationmenutext;               //操作命令名稱
var iconmenuCls;                    //操作圖示

var txtPoX = 0;                   //文本位置
var txtPoY = 0;

var txtFont = "";       //文本字型
var txtSize = "";       //文本大小
var txtBold = "";       //加粗
var txtItalic = "";    //傾斜
var txtUnderline = ""; //下劃線
var txtDeleteline = ""; //刪除線
var txtAlign = "";      //文本對齊
var txtInput = "";      //文本內容

var showoject = ""; //當前物件的屬性

//矩形、圓
var drawWidth = 0; //繪圖物件的寬
var drawHeight = 0; //繪圖物件的高

//圖片旋轉縮放
var rad_x = 1;
var rad_y = 1;//水平/垂直變換引數
var rad_radian = 0;//旋轉變換引數
var rad_zoom = 1;//縮放比例

//影像亮度調整原始圖片
var imgdlight;
var imgdlighttmp;

var cancelTimes = 0; //撤銷次數
var imageHistoryList = new Array(); //儲存圖片繪製歷史資訊

var isCreatedRule = false;//是否已經建立了標尺
var evt;
var dragdrop;
var rg;
var isCreatedGrid = false;//是否已經建立了網格

var isCommunicate = false;//是否已經加入協同處理
var communicateTo = 0;//預設為所有人

//#endregion

//#region 自定義函式

//彈出窗體
function showMyWindow(iconCls, title, href, width, height, modal, minimizable, maximizable, closable, top, left, widowsId) {
    var vWindowsId;
    vWindowsId = widowsId === undefined ? 'myWindow' : widowsId;
    $('#' + vWindowsId + '').window({
        iconCls: iconCls,
        title: title,
        width: width === undefined ? 600 : width,
        height: height === undefined ? 400 : height,
        top: top === undefined ? ($(window).height() - height) * 0.5 : top,
        left: left === undefined ? ($(window).width() - width) * 0.5 : left,
        loadingMessage: '正在載入資料，請稍等片刻......',
        content: '<iframe  frameborder="0"  src="' + href + '" scrolling="auto" style="width: 100%; height: 98%" id="' + vWindowsId + '_windows"></iframe>',
        modal: modal === undefined ? true : modal,
        minimizable: minimizable === undefined ? false : minimizable,
        maximizable: maximizable === undefined ? false : maximizable,
        closable: closable === undefined ? true : closable,
        shadow: false,
        cache: false,
        closed: false,
        collapsible: false,
        resizable: false
    });
}

//關閉窗體
function closeMyWindow(paras, widowsId, pwindowsid) {//引數；Windows標識；父Windows標識；
    var vWindowsId2;
    vWindowsId2 = widowsId === undefined ? 'myWindow' : widowsId;
    $('#' + vWindowsId2 + '').window('close');
    //子頁面關閉時，向父頁面傳遞引數，父頁面進行處理
    try {
        if (paras != undefined) {
            if (pwindowsid === undefined) {
                //window.reCallMethod(paras); //呼叫reCallMethod函式
                //window.frames["testIframe"].reCallMethod(paras);
                reCallMethod(paras);
            } else {
                window.frames[pwindowsid + '_windows'].reCallMethod(paras);
            }
        }
    } catch (e) { alert(e); }
}

//處理子頁面的傳回的引數
function opeChildParas(paras) {
    try {
        if (paras != undefined) {
            reCallMethod(paras);
        }
    } catch (e) { alert(e); }
}

//清除字串開始和結尾的空格
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

//取得圖層中最上的，且未隱藏的圖層
function getCurrentCanvas() {
    for (var i = levelList.length - 1; i > -1; i--) {
        if (levelList[i].isHide == false) {
            var currentCanvas = document.getElementById(levelList[i].canvasId);
            show = currentCanvas.getContext("2d");
            break;
        }
    }
}

//#endregion

//#region控制元件事件

//是否填充選中，則筆頭大小隱藏
$("#chekfill").change(function () {
    $('#penWdth').toggle(); //筆頭大小

    if (drawObject == "btnRectangle") {//是否圓角只針對矩形切換
        $('#opiscirclecorner').toggle();//是否圓角
    }
});

//是否圓角選中，則是否填充隱藏
$("#chekcirclecorner").change(function () {
    $('#opisfill').toggle(); //是否填充
});

//#endregion

//建立新的畫布todo，建立canvas
function CreatedrawWindow() {
    var imgName = $("#txtImgName").val(); //畫布名稱
    var imgWidth = $("#spiImgWidth").val(); //畫布寬度
    var imgHeight = $("#spiImgHeight").val(); //畫布高度

    //取得畫布大小
    var style = '"width: ' + imgWidth + 'px; height: ' + imgHeight + 'px;"';

    //建立tab及畫布
    $('#tabDraw').tabs('add', {
        title: imgName,
        closable: true,
        iconCls: 'icon-log',
        content: '<div class="drawWindow" style=' + style + '></div>'
    });

    $('.drawWindow').parent().css('background-color', '#C9D3E2'); //改變父級的tab背景顏色

    $("#diamnFileNew").dialog('close');
}

//儲存繪製的圖片
function SaveImg() {
    //將影像輸出為base64壓縮的字串  預設為image/png
    var data = showcanvas.toDataURL();
    //刪除字串前的提示資訊 "data:image/png;base64,"
    var imgData = data.substring(22);
    //POST到伺服器上，生成圖片
    $.post("../../Handler/SaveImgHandler.ashx?Method=SaveImg", { "imgData": imgData, "imgName": $("#txtImgSaveName").val(), "imgSavePath": $("#txtImgSavePath").val() }, function (data, status) {
        if (status == "success") {
            //返回圖片路徑
            $.messager.alert('成功', '儲存成功！<br \>位置為：' + data, 'info');
            $('#diamnSave').dialog('close');
        }
        else {
            $.messager.alert("儲存失敗");
        }
    }, "text");
}

//圖片另存新檔
function SaveAsImg() {
    //將影像輸出為base64壓縮的字串  預設為image/png
    var data = showcanvas.toDataURL();
    //刪除字串前的提示資訊 "data:image/png;base64,"
    var imgData = data.substring(22);
    //POST到伺服器上，生成圖片
    $.post("../../Handler/SaveImgHandler.ashx?Method=SaveAsImg", { "imgData": imgData, "imgName": $("#txtImgSaveAsName").val(), "imgExtend": $("#combImgSaveAsExtend").combobox('getValue'), "imgSavePath": $("#txtImgSaveAsPath").val() }, function (data, status) {
        if (status == "success") {
            //返回圖片路徑
            $.messager.alert('成功', '儲存成功！<br \>位置為：' + data, 'info');
            $('#diamnSaveAs').dialog('close');
        }
        else {
            $.messager.alert("儲存失敗", "儲存失敗", 'info');
        }
    }, "text");
}

//協同作業結束
function LoinOut() {
    $.messager.confirm('協同作業結束', '確定結束協同作業？', function (r) {
        if (r) {
            username = ""; //使用者名稱清空
            closeMyWindow(); //關閉協同處理視窗
            $.messager.alert('協同作業結束', '協同作業結束成功！');
        }
    });
}

//#region 選單操作

//#region總的操作方法

//記錄當前操作id、操作名稱、操作圖示
$('#menu div div').click(function () {
    if (this.id != undefined && this.id != "") {
        oprationmenuid = this.id;
        oprationmenutext = $(this).text().trim();
        var iconClsArray = $(this).attr('data-options').split(",");
        var iconCls = iconClsArray[0].substring(9);
        iconmenuCls = iconCls.substring(0, iconCls.length - 1);
    }
});

//#endregion

//“檔案”下的選單操作
$('#mnFile div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnFileNew": //新建
                $("#diamnFileNew").dialog('open');
                break;
            case "mnFileopen": //開啟
                fileOpen();
                break;
            case "mnFilefromCam": //取得
                imgFromCamera();
                break;
            case "mnFilecancel": //關閉
                $.messager.confirm('確定', '圖片未儲存，確定關閉？', function (r) {
                    if (r) {
                        //判斷是否儲存
                        $.messager.alert('關閉', '關閉成功！', 'info');
                    }
                });
                break;
            case "mnFilecloseall": //關閉全部
                $.messager.confirm('確定', '圖片未儲存，確定關閉？', function (r) {
                    if (r) {
                        //判斷是否儲存
                        $.messager.alert('關閉', '關閉成功！', 'info');
                    }
                });
                break;
            case "mnFilesave": //儲存
                $("#diamnSave").dialog('open');
                break;
            case "mnFilesaveall": //儲存全部
                //儲存全部

                $.messager.alert('成功', '儲存成功！', 'info');
                break;
            case "mnFilesaveas": //另存新檔
                $("#diamnSaveAs").dialog('open');
                break;
            case "mnFileprint": //列印
                showMyWindow('icon-print', '列印', 'Code/PrintImg.aspx', 800, 600, true, false, false, true);
                break;
            case "mnFileexist": //結束
                $.messager.confirm('確定', '圖片未儲存，確定結束？', function (r) {
                    if (r) {//不儲存圖片，直接結束
                        window.open('', '_parent', '');
                        window.top.opener = null;
                        window.close();
                    }
                });
                break;
        }
    }
});

//開啟檔案
function fileOpen() {
    showMyWindow('icon-open', '開啟', 'Code/SelectImg.html', 800, 400, true, false, false, true);
}

//取得
function imgFromCamera() {
    showMyWindow('icon-fromCam', '取得', 'Code/GetCamareImg.aspx', 800, 600, true, false, false, true);
}

//“編輯”下的選單操作
$('#mnEdit div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnEditundo":
                //alert("撤銷");
                undo();
                break;
            case "mnEditredo":
                //alert("重做");
                redo();
                break;
            case "mnEditcut":
                alert("剪下");
                break;
            case "mnEditcopy":
                alert("複製");
                break;
            case "mnEditpaste":
                alert("貼上");
                break;
            case "mnEditselectall":
                alert("全選");
                break;
            case "mnEditclear": //清空
                $.messager.confirm('確定', '確定清空當前畫布？', function (r) {
                    if (r) {
                        reset();
                    }
                });
                break;
        }
    }
});

//“影像”下的選單操作
$('#mnImage div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnImageautolevel": //色階
                $("#diamnImageautolevel").dialog('open');
                break;
            case "mnImagecolorpalettes": //色相/飽和度
                $("#diamnImagecolorpalettes").dialog('open');
                break;
            case "mnImageimgsize":
                alert("影像大小");
                break;
            case "mnImagecanvassize":
                alert("畫布大小");
                break;
            case "mnImagerotate180"://旋轉180度
                transforms.flat();

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsflat", communicateTo);
                }

                break;
            case "mnImagerotatew90"://順時針旋轉90度
                transforms.right();

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsright", communicateTo);
                }

                break;
            case "mnImagerotatee90"://逆時針旋轉90度
                transforms.left();

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsleft", communicateTo);
                }

                break;
            case "mnImageinputcc": //旋轉任意角度
                $("#diamnImageinputcc").dialog('open');
                break;
            case "mnImagehorizonrotate"://水平翻轉
                transforms.horizontal();

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformshorizontal", communicateTo);
                }

                break;
            case "mnImageverticalrotate"://垂直翻轉
                transforms.vertical();

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsvertical", communicateTo);
                }

                break;
            case "mnImagetailor": //裁剪
                //alert("裁剪");
                ToolOpration("btnSelectCut", "裁剪");
                break;
        }
    }
});

//“圖層”下的選單操作
$('#mnLevel div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnLevelnewlevel":
                //alert("新建圖層");
                levelOpration.addLevel();
                break;
            case "mnLevelno":
                alert("待實現！刪除圖層");
                break;
            case "mnLevelcopylevel":
                alert("待實現！複製圖層");
                break;
            case "mnLeveluplevel":
                alert("待實現！向上移動圖層");
                break;
            case "mnLeveldownlevel":
                alert("待實現！向下移動圖層");
                break;
            case "mnLevellevelinfo":
                alert("待實現！圖層屬性");
                break;
        }
    }
});

//“效果”下的選單操作
$('#mnConslate div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnConslateblackwhite": //黑白
                var win = $.messager.progress({
                    title: '黑白',
                    msg: '處理...'
                });
                tobalckwhite();
                //處理完後關閉
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("tobalckwhite", communicateTo);
                }

                break;
            case "mnConslateopsitecolor": //反色
                var win = $.messager.progress({
                    title: '反色',
                    msg: '處理...'
                });
                inverse();
                //處理完後關閉
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("inverse", communicateTo);
                }

                break;
            case "mnConslatelight": //亮度/對比度
                $("#diamnLightSlide").dialog('open');
                imgdlighttmp = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
                imgdlight = imgdlighttmp;
                break;
            case "mnConslateblur": //模糊
                var win = $.messager.progress({
                    title: '浮雕',
                    msg: '處理...'
                });
                blur();
                //處理完後關閉
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("blur", communicateTo);
                }

                break;
            case "mnConslatecloud": //霧化
                var win = $.messager.progress({
                    title: '霧化',
                    msg: '處理...'
                });
                wuhuaView();
                //處理完後關閉
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("wuhuaView", communicateTo);
                }

                break;
            case "mnConslatesharpen": //銳化
                var win = $.messager.progress({
                    title: '銳化',
                    msg: '處理...'
                });
                sharpen();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("sharpen", communicateTo);
                }

                break;
            case "mnConslatefloat": //浮雕
                var win = $.messager.progress({
                    title: '浮雕',
                    msg: '處理...'
                });
                selaFloat();
                //處理完後關閉
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("selaFloat", communicateTo);
                }

                break;
            case "mnConslatesoft": //柔化
                var win = $.messager.progress({
                    title: '柔化',
                    msg: '處理...'
                });

                conslateSoft();

                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslateSoft", communicateTo);
                }

                break;
            case "mnConslatepainting": //油畫
                var win = $.messager.progress({
                    title: '油畫',
                    msg: '處理...'
                });

                conslatepainting();

                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslatepainting", communicateTo);
                }

                break;
            case "mnConslatewood": //積木
                var win = $.messager.progress({
                    title: '積木',
                    msg: '處理...'
                });
                conslatewood();

                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslatewood", communicateTo);
                }

                break;
            case "mnConslateCuve": //雕刻
                var win = $.messager.progress({
                    title: '雕刻',
                    msg: '處理...'
                });
                diaokeView();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("diaokeView", communicateTo);
                }

                break;
            case "mnConslateTurnOld": //懷舊
                var win = $.messager.progress({
                    title: '懷舊',
                    msg: '處理...'
                });
                turnOld();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnOld", communicateTo);
                }

                break;
            case "mnConslateTurnRed": //紅色蒙版
                var win = $.messager.progress({
                    title: '紅色蒙版',
                    msg: '處理...'
                });
                turnRed();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnRed", communicateTo);
                }

                break;
            case "mnConslateTurnGreen": //綠色蒙版
                var win = $.messager.progress({
                    title: '綠色蒙版',
                    msg: '處理...'
                });
                turnGreen();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnGreen", communicateTo);
                }

                break;
            case "mnConslateTurnBlue": //藍色蒙版
                var win = $.messager.progress({
                    title: '藍色蒙版',
                    msg: '處理...'
                });
                turnBlue();
                //處理完後關閉，這裡作為測試
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //傳送協同作業
                if (isCommunicate) {//加入協同作業成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnBlue", communicateTo);
                }

                break;
        }

        //儲存歷史記錄，撤銷時使用
        //有些物件不需要記錄，需要排除
        if (oprationid != "" && oprationid != "mnConslatelight") {
            ShowOpration(oprationmenuid, oprationmenutext, iconmenuCls); //將操作顯示在歷史記錄中
            saveImageHistory();
        }
    }
});

//“檢視”下的選單操作
$('#mnView div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnViewzoomin"://放大
                transforms.zoomin();
                break;
            case "mnViewzoomout"://縮小
                transforms.zoomout();
                break;
            case "mnViewruler"://標尺
                if (!isCreatedRule) {
                    evt = new Event();
                    dragdrop = new Dragdrop(evt);
                    rg = new RulersGuides(evt, dragdrop);

                    rg.enable();
                    $.messager.alert("說明", "點選介面左側紅色標尺選單，操作標尺。");

                    isCreatedRule = true;
                }
                else {
                    if (rg.status == 0) {
                        rg.enable();
                        $.messager.alert("說明", "點選介面左側紅色標尺選單，操作標尺。");
                    }
                    else {
                        rg.disable();
                    }
                }
                break;
            case "mnViewgrid"://網格
                if (!isCreatedGrid) {
                    drawGrid(levelNum);

                    isCreatedGrid = true;
                }
                else {
                    //隱藏或顯示網格
                    if ($("#gridcanvas").css("display") == "none") {
                        $("#gridcanvas").css("display", "block");
                    } else {
                        $("#gridcanvas").css("display", "none");
                    }
                }
                break;
            case "mnViewfullscreen"://全螢幕模式
                fullscreen();
                //alert("全螢幕模式");
                break;
            case "default":
                onChangeTheme('default');
                break;
            case "bootstrap":
                onChangeTheme('bootstrap');
                break;
            case "metro-blue":
                onChangeTheme('metro-blue');
                break;
            case "metro-green":
                onChangeTheme('metro-green');
                break;
            case "metro-red":
                onChangeTheme('metro-red');
                break;
            case "mnViewreset":
                alert("重置介面");
                break;
        }
    }
});

//“視窗”下的選單操作
$('#mnWindows div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnWindowstools": //工具箱
                $("#tools").dialog('open');
                break;
            case "mnWindowshistory": //操作
                $("#opration").dialog('open');
                break;
            case "mnWindowssearchimg":
                showMyWindow('icon-searchimg', '圖片搜尋', 'SearchImg.aspx', 800, 400, true, false, false, true);
                break;
            case "mnWindowscommunite": //協同作業
                if (username == "") {//未登入
                    $.messager.prompt('協同作業登入', '請輸入你的使用者名稱', function (r) {
                        if (r) {//如果輸入，則使用輸入的使用者名稱
                            username = r;
                        }
                        else {
                            var now = new Date();
                            username = now.toLocaleTimeString(); //如果使用者未輸入使用者名稱，則使用協同預設使用者名稱，系統預設為當前時間
                        }

                        var host = "ws://192.168.198.17:8050";//本機ip及埠

                        connect(host, username);//連線伺服器

                        //登入成功
                        isCommunicate = true;

                        //修改視窗title
                        //var loginTitle = "協同作業&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">結束</a>";
                        //$("#diamnCommunite").dialog('title', loginTitle);

                        $("#diamnCommunite").dialog('open');
                        //showMyWindow('icon-communite', "協同作業&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">結束</a>", 'Communite.aspx?username=' + username, 250, 340, false, false, true, true, 310, 1106);
                    });
                }
                else {
                    $("#diamnCommunite").dialog('open');
                    //showMyWindow('icon-communite', "協同作業&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">結束</a>", 'Communite.aspx', 250, 340, false, false, true, true, 310, 1106);
                }
                break;
        }
    }
});

//“說明”下的選單操作
$('#mnHelp div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnHelphelp": //WebPhotoshop說明
                window.open("Code/Help.htm");
                break;
            case "mnHelphelpsite": //WebPhotoshop網站
                window.open("https://zaixianhuatu.org");
                break;
            case "mnHelpabout": //關於WebPhotoshop
                showMyWindow('icon-about', '關於WebPhotoshop', 'Code/About.htm', 600, 400, true, false, false, true);
                break;
        }
    }
});

//#endregion

//#region 工具箱操作

//工具對應的操作：顯示屬性、
function ToolOpration(oprationid, oprationtitle) {
    //取得當前工具的名稱、圖片
    $('#objectname').html(oprationtitle); //工具名稱
    //取得圖片工具命名為btn+圖片名稱，擷取，則獲得工具對應的圖片
    $("#objectimg").attr("src", "Images/tools/" + oprationid.substring(3, oprationid.length) + ".png");
    switch (oprationid) {
        case "btnSelect": //選擇工具
            $('#toolDescrib').html(oprationtitle + "：點選並拖拽去畫一個選擇區。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').show(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式
            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnMove": //移動工具
            $('#toolDescrib').html(oprationtitle + "：拖動選擇可以移動位置。"); //工具說明
            $(selectCanvas).addClass("easyui-draggable");//使選擇畫布可以移動

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnLasso": //套索工具
            //alert("套索工具");
            $('#toolDescrib').html(oprationtitle + "：點選並拖拽為選擇區畫輪廓。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnZoomAll": //縮放工具
            //alert("縮放工具");
            $('#toolDescrib').html(oprationtitle + "：左擊放大，右擊縮小。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').show(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnHand": //手抓工具
            //alert("手抓工具");
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖拽以沿想要的方向滾動影像。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnFill": //填充工具
            //alert("填充工具");
            $('#toolDescrib').html(oprationtitle + "：點選按下想要的影像區域填充顏色。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnGradient": //漸變工具
            //alert("漸變工具");
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動產生漸變。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').show(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnPaintBrush": //畫筆
            //alert("畫筆");
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動繪圖。"); //工具說明

            $('#penWdth').show(); //筆頭大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').show(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnPencil": //鉛筆
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動繪圖。"); //工具說明

            $('#penWdth').show(); //筆頭大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //筆頭樣式

            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇
            break;
        case "btnEraser": //橡皮擦
            //alert("橡皮擦");
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動清除影像。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').show(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnZoomMiro": //放大鏡
            //alert("放大鏡");
            $('#toolDescrib').html(oprationtitle + "：左擊區域性放大影像，右擊區域性縮小影像。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnSelectCut": //裁剪
            //alert("裁剪");
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動選擇需要裁剪的影像。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnText": //文本
            //alert("文本");
            $('#toolDescrib').html(oprationtitle + "：左擊放置文本游標，然後輸入文字。"); //工具說明
            $("#drawtext").dialog('open');

            //使文本輸入框停用，在點選畫布，取得繪製文本的座標後啟用
            $("#drawtext textarea").attr("disabled", true);
            $("#drawtextCancel").linkbutton('disable');
            $("#drawtextOK").linkbutton('disable');
            $("#drawTextPosition").html(''); //清空座標

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').show(); //字型
            $('#txtSize').show(); //字號
            $('#opbold').show(); //字型加粗
            $('#opitalic').show(); //字型傾斜
            $('#opunderline').show(); //字型下劃線
            $('#opnodeleteline').show(); //字型刪除線
            $('#txtAlign').show(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnLine": //直線
            //alert("直線");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製直線。"); //工具說明

            $('#penWdth').show(); //筆頭大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').show(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnCurve": //曲線
            //alert("曲線");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製直線，然後選擇點拖動變為曲線。"); //工具說明

            $('#penWdth').show(); //筆頭大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnRectangle": //矩形
            //alert("矩形");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製矩形。"); //工具說明
            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //筆頭大小隱藏
            }
            else {
                $('#penWdth').show(); //筆頭大小顯示
            }

            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').show(); //是否填充。否，則顯示筆頭大小、線條樣式
            $('#opiscirclecorner').show(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnEllipse": //橢圓
            //alert("橢圓");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製橢圓。"); //工具說明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //筆頭大小隱藏
            }
            else {
                $('#penWdth').show(); //筆頭大小顯示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').show(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').show(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnTriangle": //三角形
            //alert("三角形");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製三角形。"); //工具說明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //筆頭大小隱藏
            }
            else {
                $('#penWdth').show(); //筆頭大小顯示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').show(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').show(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnPolygon": //多邊形
            //alert("多邊形");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製多邊形。"); //工具說明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //筆頭大小隱藏
            }
            else {
                $('#penWdth').show(); //筆頭大小顯示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').show(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').show(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnOtherShap": //其他形狀
            //alert("其他形狀");
            $('#toolDescrib').html(oprationtitle + "：左擊並且拖動繪製選擇的形狀。"); //工具說明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //筆頭大小隱藏
            }
            else {
                $('#penWdth').show(); //筆頭大小顯示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').show(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').show(); //形狀選擇

            break;
        case "btnClone": //圖章
            //alert("圖章");
            $('#toolDescrib').html(oprationtitle + "：按Ctrl鍵的同時左擊選擇物體，然後左鍵拖動複製。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型
            $('#opEraserSize').show(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        case "btnAlpha": //透明度
            //alert("透明度");
            $('#toolDescrib').html(oprationtitle + "：點選減淡或加深按鈕改變影像透明度。"); //工具說明

            $('#penWdth').hide(); //筆頭大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //筆頭樣式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').show(); //透明度加深、減淡按鈕
            $('#opdeeppercent').show(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇

            break;
        default: //鉛筆
            $('#toolDescrib').html(oprationtitle + "：點選按下並拖動繪圖。"); //工具說明

            $('#penWdth').show(); //筆頭大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //筆頭樣式

            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //選擇工具選擇框:矩形、橢圓
            $('#opZoom').hide(); //放大、縮小
            $('#opGradient').hide(); //漸變工具漸變模式
            $('#opPenStyle').hide(); //筆型

            $('#opEraserSize').hide(); //寬度
            $('#txtFamily').hide(); //字型
            $('#txtSize').hide(); //字號
            $('#opbold').hide(); //字型加粗
            $('#opitalic').hide(); //字型傾斜
            $('#opunderline').hide(); //字型下劃線
            $('#opnodeleteline').hide(); //字型刪除線
            $('#txtAlign').hide(); //對齊
            $('#opisfill').hide(); //是否填充。否，則顯示筆頭大小、線條樣式

            $('#opiscirclecorner').hide(); //是否圓角
            $('#opiscircle').hide(); //是否圓
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否為正多邊形。是，則選擇或者輸入邊數
            $('#opdeepreduce').hide(); //透明度加深、減淡按鈕
            $('#opdeeppercent').hide(); //透明度加深、減淡按鈕調節比例
            $('#opline').hide(); //線條樣式
            $('#opothershap').hide(); //形狀選擇
    }
}

//“工具箱”下的選單操作
$('#tools a').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id; //取得工具id
        var oprationtitle = this.title; //取得工具的名稱
        drawObject = this.id; //當前的繪圖物件
        drawObjectName = oprationtitle;//當前的繪圖物件名稱
        drawObjectIcon = $(this).attr('data-options').substring(9);
        var arrdrawObjectIcon = drawObjectIcon.split(",");
        drawObjectIcon = arrdrawObjectIcon[0];//當前圖示
        drawObjectIcon = drawObjectIcon.substring(0, drawObjectIcon.length - 1);
        ToolOpration(oprationid, oprationtitle);
    }
});

//#endregion

//#region 文本輸入框操作

//點選畫布啟用文本輸入框
$('.drawWindow').live("click", function (e) {
    //在點選畫布，取得繪製文本的座標後啟用文本輸入框
    $("#drawtext textarea").attr("disabled", false);
    $("#drawtextCancel").linkbutton('enable');
    $("#drawtextOK").linkbutton('enable');
    $("#drawTextPosition").html('x:' + Math.ceil(e.offsetX) + ',y:' + Math.ceil(e.offsetY)); //取得座標

    //文本位置
    txtPoX = Math.ceil(e.offsetX);
    txtPoY = Math.ceil(e.offsetY);
});

$("#drawtextOK").live("click", function () {
    drawText();

    createDraw("paintdrawText");//加入協同處理
});

$("#drawtextCancel").live("click", function () {
    $("#drawtext").dialog('close');
});

//#endregion

//#region 瀏覽器大小變化操作

//當瀏覽器大小變化時，設定頁面內容的大小、位置
function ByResizeSet() {
    scWidth = document.body.clientWidth;
    scHeight = document.body.clientHeight;

    mapWidth = scWidth * 0.6;
    mapHeight = scHeight * 0.8;

    //設定工具箱、歷史記錄、圖層、顏色選擇窗體位置

    //設定tab大小、畫布大小
    $("#tabDraw").tabs({
        height: scHeight - 85
    });

    //todo,按照瀏覽器縮小比例
    $(".drawWindow").css("width", mapWidth);
    $(".drawWindow").css("height", mapHeight);

    //todo,動態設定畫布的大小
    var showcanvasSet = document.getElementById("showcanvas");
    var tempcanvasSet = document.getElementById("tempcanvas");
    var gridcanvasSet = document.getElementById("gridcanvas");

    showcanvasSet.height = mapHeight;
    showcanvasSet.width = mapWidth;

    tempcanvasSet.height = mapHeight;
    tempcanvasSet.width = mapWidth;

    gridcanvasSet.height = mapHeight;
    gridcanvasSet.width = mapWidth;

    $("#opration").dialog({
        left: scWidth - 260
    });

    //變化協同處理視窗，協同處理視窗變成了單獨頁面，需要特殊處理，todo
    //    $("#communite").dialog({
    //        left: scWidth - 260
    //    });
}

//瀏覽器大小變化時
window.onresize = function () {
    ByResizeSet();
}

//瀏覽器載入時
window.onload = function () {
    ByResizeSet();
};

//#endregion

//#region歷史記錄操作

/*記錄歷史操作
 *opration  操作id
 *oprationName  名稱
 *opiconCls 操作圖示
*/
function ShowOpration(opration, oprationName, opiconCls) {
    var oprationClass = opration + "linkbutton";
    var oprationStr = "<a href=\"#\" style=\"width: 100%;\" title=\"" + oprationName + "\" class=\"" + oprationClass + "\" >" + oprationName + "</a><br />";
    $("#lsthitory").append(oprationStr);
    $('.' + oprationClass).linkbutton({
        iconCls: opiconCls,
        plain: true
    });
    //控制捲軸在最下
    $('#lsthitory').scrollTop($('#lsthitory')[0].scrollHeight);
}

//#region 歷史記錄下的操作按鈕

//撤銷全部按鈕
$('#historyundoall').click(function () {
    undoall();
});

//撤銷按鈕
$('#historyundo').click(function () {
    undo();
});

//重做按鈕
$('#historyredo').click(function () {
    redo();
});

//重做所有按鈕
$('#historyredoall').click(function () {
    redoall();
});

//#endregion

//#endregion

//#region 選項欄操作

//放大
$('#opzoomin').click(function () {
    transforms.zoomin();

    ShowOpration("opzoomin", "放大", "icon-zoomin"); //將操作顯示在歷史記錄中
});

//縮小
$('#opzoomout').click(function () {
    transforms.zoomout();

    ShowOpration("opzoomout", "縮小", "icon-zoomout"); //將操作顯示在歷史記錄中
});

//#endregion

//起始函式
$(document).ready(function () {
    ByResizeSet();

    //工具箱，預設為鉛筆
    ToolOpration('btnPencil', '鉛筆（P）');

    //顏色
    $('#colorselect').jPicker({
        window: {
            expandable: true
        }
    }, function (color, context) {
        var all = color.val('all');
        $("#colorvalue").attr("value", (all && '#' + all.hex || 'none')); //取得顏色值
    });
});

//屬性初始化todo，同時取得其他物件屬性？還是單獨取得每個物件的屬性？
function setting() {
    pencolor = $("#colorvalue").val(); //線條顏色
    penwidth = $("#penwidthshow").val(); //線條大小
    penalpha = $('#alphashow').numberspinner('getValue'); //線條不透明度
    penalpha = penalpha / 100;
    penstyle = $("#hStyle").combobox('getValue'); //線條頭樣式

    penshowdow = $('#ptpenBlurShow').numberspinner('getValue'); //模糊度
    penshowdow = penshowdow / 100;

    txtFont = $("#seltxtFamily").combobox('getValue');       //文本字型
    txtSize = $("#seltxtSize").combobox('getValue');      //文本大小

    //todo，html5文字樣式如何寫？
    txtBold = $('#chekbold').is(':checked') == true ? "bold" : ""; //加粗
    txtItalic = $("#chekitalic").is(":checked") == true ? "italic" : "";    //傾斜
    txtUnderline = $("#chekunderline").is(":checked") == true ? "underline" : ""; //下劃線
    txtDeleteline = $("#chekdeleteline").is(":checked") == true ? "deleteline" : ""; //刪除線
    txtAlign = $("#seltxtAlign").combobox('getValue');     //文本對齊
    txtInput = $("#txtInput").val();      //文本內容
}

//#region 滑鼠事件mousedown、mousemove、mouseup、mouseleave

//曲線繪製
//二次控制點
var cpx = -1;
var cpy = -1;

var endCurve = false;//是否結束了曲線繪製
var finishCurveLine = false;//是否完成了曲線繪製的第一步直線繪製
var selectCanvas;//選擇工具建立的圖層
var selectCanvasContext;//選擇工具建立的圖層上下文

//當滑鼠按下時，把isMouseDown設為true，表示正在畫，滑鼠沒鬆開。把滑鼠點記錄下來。
drawarea.mousedown(function (e) {
    startX = e.offsetX; //校正滑鼠的繪圖點
    startY = e.offsetY;

    isMouseDown = true;

    //根據繪圖物件名稱，做出不同的操作
    switch (drawObject) {
        case "btnPencil": //鉛筆
            pencil();
            break;
        case "btnPaintBrush": //畫筆
            paintpen();
            break;
        case "btnSelect": //選擇工具
            //建立圖層，並加入到背景圖層中
            var firstDrawWin = document.getElementById("firstDrawWin");

            selectCanvas = document.createElement("canvas");
            selectCanvas.id = "level" + levelNum;
            selectCanvas.width = mapWidth;
            selectCanvas.height = mapHeight;
            $(selectCanvas).css({
                "z-index": levelNum + 2,
                "cursor": "crosshair"
            });
            var bgroudCanvas = document.getElementsByTagName("canvas")[0];
            firstDrawWin.insertBefore(selectCanvas, bgroudCanvas);
            selectCanvasContext = selectCanvas.getContext("2d");

            levelNum++;
            break;
        case "btnMove"://移動工具

            break;
        default:
            pencil();
    }
});

drawarea.mousemove(function (e) {
    //顯示當前座標
    $("#Coordinate").html("X:" + Math.ceil(e.offsetX) + ",Y:" + Math.ceil(e.offsetY));
    if (isMouseDown) {
        currentX = e.offsetX;
        currentY = e.offsetY;

        drawWidth = Math.abs(Math.ceil(currentX - startX));
        drawHeight = Math.abs(Math.ceil(currentY - startY));

        temp.clearRect(0, 0, mapWidth, mapHeight);   //滑鼠拖動時，清空上次的繪圖，即清空在臨時畫布上的繪圖

        var tempPaint = paint;
        tempPaint.name = temp; //使用臨時畫布
        switch (drawObject) {
            case "btnSelect"://選擇
                tempPaint.selectfillRect();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnMove"://移動工具

                break;
            case "btnLine":
                var lineStyle = $("#selline").combobox('getValue');//取得直線樣式

                switch (lineStyle) {
                    case "solid":
                        tempPaint.line();
                        break;
                    case "dottedline1":
                        tempPaint.dottedline(5);
                        break;
                    case "dottedline2":
                        tempPaint.dottedline(15);
                        break;
                    case "dottedline3":
                        tempPaint.dottedline(25);
                        break;
                    default:
                        tempPaint.line();
                }
                break;
            case "btnCurve"://曲線
                if (!endCurve) {
                    if (!finishCurveLine) {//繪製直線
                        tempPaint.line();
                    }
                    else {
                        tempPaint.curveLine(cuStartX, cuStartY, cuEndX, cuEndY);
                    }
                }
                else {
                    endCurve = false;
                    finishCurveLine = false;
                }
                break;
            case "btnRectangle":
                //圓角
                if ($('#chekcirclecorner').is(':checked')) {
                    tempPaint.radiusStrokeRect();
                }
                else {
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillRect();
                    }
                    else {
                        tempPaint.strokeRect();
                    }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillrect":
                tempPaint.fillRect();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "circle":
                tempPaint.circle();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillcircle":
                tempPaint.fillCircle();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnEllipse":
                //是否為圓
                if ($('#chekcircle').is(':checked')) {
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillCircle();
                    }
                    else {
                        tempPaint.circle();
                    }
                }
                else {
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillellipse();
                    }
                    else {
                        tempPaint.ellipse();
                    }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillellipse":
                tempPaint.fillellipse();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnPencil":
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
                break;
            case "btnPaintBrush":
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
                break;
            case "btnEraser":
                var eraserWidth = $("#selEraserSize").val();

                eraser(currentX, currentY, eraserWidth);
                break;
            case "btnText":
                break;
            case "btnTriangle":
                //三角形型別判斷
                var seletriangle = $('#seltriangle').combobox('getValue');
                switch (seletriangle) {
                    case "righttriangle"://直角三角形
                        //判斷是否選中填充
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillrighttriangle();
                        }
                        else {
                            tempPaint.righttriangle();
                        }
                        break;
                    case "regulartriangle"://等腰三角形
                        //判斷是否選中填充
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillregulartriangle();//填充等腰三角形
                        }
                        else {
                            tempPaint.regulartriangle();
                        }
                        break;
                    default:
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillrighttriangle();//填充直角三角形
                        }
                        else {
                            tempPaint.righttriangle();
                        }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnPolygon": //多邊形
                //                //屬性取得todo
                //                tempPaint.line();
                break;
            default:
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
        }
    }
});

//存放需要儲存當前畫布的繪圖工具，即對當前畫布進行了改變
var toSaveCanvas = new Array("btnSelect", "btnMove", "btnLasso", "btnPencil", "btnPaintBrush", "btnEraser", "btnFill", "btnGradient", "btnSelectCut", "btnLine", "btnCurve", "btnRectangle", "circle", "fillrect", "fillcircle", "btnEllipse", "fillellipse", "btnTriangle", "btnPolygon", "btnOtherShap", "btnClone");
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

//滑鼠抬起，則在展示畫布上顯示圖形
drawarea.mouseup(function (e) {
    isMouseDown = false;

    var showPaint = paint; //切換到展示畫布
    showPaint.name = show;

    currentX = e.offsetX;
    currentY = e.offsetY;

    temp.clearRect(0, 0, mapWidth, mapHeight);  //在正式畫布上形成圖時，清空臨時畫布上的圖，以免形成重疊圖

    //在展示畫布上繪圖
    switch (drawObject) {
        case "btnSelect"://todo


            var selectCanvasPaint = paint; //切換到展示畫布
            selectCanvasPaint.name = selectCanvasContext;
            selectCanvasPaint.selectfillRect();


            //取得畫素，並重繪
            var imgd = show.getImageData(startX, startY, currentX - startX, currentY - startY);  //從指定的矩形區域取得 canvas 畫素陣列
            selectCanvasContext.putImageData(imgd, startX, startY);         //在指定位置進行畫素重繪

            show.clearRect(startX, startY, currentX - startX, currentY - startY);
            break;
        case "btnMove"://移動工具

            break;
        case "btnLine":
            var lineStyle = $("#selline").combobox('getValue');//取得直線樣式

            switch (lineStyle) {
                case "solid":
                    showPaint.line();

                    createDraw("paintline");//協同處理
                    break;
                case "dottedline1":
                    showPaint.dottedline(5);

                    createDraw("paintdottedline");//協同處理
                    break;
                case "dottedline2":
                    showPaint.dottedline(15);

                    createDraw("paintdottedline");//協同處理
                    break;
                case "dottedline3":
                    showPaint.dottedline(25);

                    createDraw("paintdottedline");//協同處理
                    break;
                default:
                    showPaint.line();
            }
            break;
        case "btnCurve"://曲線
            if (!endCurve) {
                if (!finishCurveLine) {//繪製直線
                    showPaint.line();
                    finishCurveLine = true;
                }
                else {
                    showPaint.curveLine(cuStartX, cuStartY, cuEndX, cuEndY);
                    //加入曲線繪製結束標誌
                    endCurve = true;
                    cpx == -1;
                    cpy == -1;
                }
            }

            createDraw("paintcurveLine");//協同處理
            break;
        case "btnRectangle":
            //圓角
            if ($('#chekcirclecorner').is(':checked')) {
                showPaint.radiusStrokeRect();

                createDraw("paintradiusStrokeRect");//協同處理
            }
            else {
                //判斷是否選中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillRect();

                    createDraw("paintfillRect");//進行協同處理
                }
                else {
                    showPaint.strokeRect();

                    createDraw("paintstrokeRect");//進行協同處理
                }
            }
            break;
        case "circle":
            showPaint.circle();
            break;
        case "fillrect":
            showPaint.fillRect();
            break;
        case "fillcircle":
            showPaint.fillCircle();
            break;
        case "btnEllipse":
            if ($('#chekcircle').is(':checked')) {//圓
                //判斷是否選中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillCircle();

                    createDraw("paintfillCircle");//進行協同處理
                }
                else {
                    showPaint.circle();

                    createDraw("paintcircle");//進行協同處理
                }
            }
            else {//橢圓
                //判斷是否選中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillellipse();

                    createDraw("paintfillellipse");//進行協同處理
                }
                else {
                    showPaint.ellipse();

                    createDraw("paintellipse");//進行協同處理
                }
            }
            break;
        case "fillellipse":
            showPaint.fillellipse();
            break;
        case "btnTriangle":
            //三角形型別判斷
            var seletriangle = $('#seltriangle').combobox('getValue');
            switch (seletriangle) {
                case "righttriangle"://直角三角形
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillrighttriangle();//填充直角三角形

                        createDraw("paintfillrighttriangle");//進行協同處理
                    }
                    else {
                        showPaint.righttriangle();

                        createDraw("paintrighttriangle");//進行協同處理
                    }
                    break;
                case "regulartriangle"://等腰三角形
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillregulartriangle();//填充等腰三角形

                        createDraw("paintfillregulartriangle");//進行協同處理
                    }
                    else {
                        showPaint.regulartriangle();

                        createDraw("paintregulartriangle");//進行協同處理
                    }

                    break;
                default://直角三角形
                    //判斷是否選中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillrighttriangle();//填充直角三角形

                        createDraw("paintfillrighttriangle");//進行協同處理
                    }
                    else {
                        showPaint.righttriangle();

                        createDraw("paintrighttriangle");//進行協同處理
                    }
            }
            break;
        case "btnPolygon": //多邊形

            break;
    }

    //儲存歷史記錄，撤銷時使用
    //有些物件不需要記錄，需要排除
    if (toSaveCanvas.contains(drawObject)) {
        ShowOpration(drawObject, drawObjectName, drawObjectIcon); //將操作顯示在歷史記錄中
        saveImageHistory();
    }
});

drawarea.mouseleave(function (e) {
    isMouseDown = false;
});

//#endregion

//#region 繪圖操作

//清空
function reset() {
    show.clearRect(0, 0, mapWidth, mapHeight);
    temp.clearRect(0, 0, mapWidth, mapHeight);
}

//橡皮擦，橡皮擦座標，橡皮擦寬度
function eraser(currentX, currentY, eraserWidth) {
    show.clearRect(currentX, currentY, eraserWidth, eraserWidth);
    temp.clearRect(currentX, currentY, eraserWidth, eraserWidth);
}

//繪製文本
function drawText() {
    setting();
    //font格式：font-style font-weight font-size font-family
    show.font = txtItalic + ' ' + txtBold + ' ' + txtSize + ' ' + txtFont;
    show.fillStyle = pencolor;
    show.textAlign = txtAlign;
    show.fillText(txtInput, txtPoX, txtPoY);

    //繪製下劃線
    if (txtUnderline == "underline") {
        var txtlengthobj = show.measureText(txtInput);//取得文字長度
        if (txtAlign == "center") {//判斷對齊方式，以決定下劃線、刪除線的起始位置
            txtPoX = txtPoX - txtlengthobj.width / 2;
        }
        if (txtAlign == "right") {
            txtPoX = txtPoX - txtlengthobj.width;
        }

        show.strokeStyle = pencolor;
        show.shadowBlur = penshowdow;
        show.lineWidth = penwidth;
        show.globalAlpha = penalpha;
        show.lineCap = penstyle;

        show.beginPath();
        show.moveTo(txtPoX, txtPoY + 5);//估算的位置
        show.lineTo(txtPoX + txtlengthobj.width, txtPoY + 5);
        show.stroke();
    }

    //繪製刪除線
    if (txtDeleteline == "deleteline") {
        var txtlengthobj = show.measureText(txtInput);

        show.strokeStyle = pencolor;
        show.shadowBlur = penshowdow;
        show.lineWidth = penwidth;
        show.globalAlpha = penalpha;
        show.lineCap = penstyle;

        show.beginPath();
        show.moveTo(txtPoX, txtPoY - txtSize / 3);//估算的位置
        show.lineTo(txtPoX + txtlengthobj.width, txtPoY - txtSize / 3);
        show.stroke();
    }

    ShowOpration(drawObject, drawObjectName, drawObjectIcon); //將操作顯示在歷史記錄中
    saveImageHistory();
}

//移動保留繪圖痕跡繪圖類，直線、矩形、填充矩形、圓、填充圓、橢圓、填充橢圓
var paint = {
    name: temp, //繪圖的目標畫布，滑鼠移動過程中，是在臨時畫布上繪圖，滑鼠彈起，則顯示在最終畫布上
    //直線，繪製曲線第一步是繪製直線，也要用到該方法
    line: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        this.name.beginPath();
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);
        this.name.stroke();

        if (drawObject == "btnCurve") {
            //繪製曲線，則取得起點、終點
            cuStartX = startX;
            cuStartY = startY;

            cuEndX = currentX;
            cuEndY = currentY;
        }
    },
    //虛線，dashLength：間隔
    dottedline: function (dashLength) {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        var dashLengthdashLength = dashLength === undefined ? 5 : dashLength;

        var distanceX = currentX - startX;
        var distanceY = currentY - startY;
        var interval = Math.floor(Math.sqrt(distanceX * distanceX + distanceY * distanceY) / dashLength);

        this.name.beginPath();
        for (var i = 0; i < interval; ++i) {
            this.name[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (distanceX / interval) * i, startY + (distanceY / interval) * i);
        }
        this.name.stroke();
    },
    //矩形
    strokeRect: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.strokeRect(startX, startY, currentX - startX, currentY - startY);
    },
    //填充矩形
    fillRect: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillRect(startX, startY, currentX - startX, currentY - startY);
    },
    //圓角空心矩形
    radiusStrokeRect: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;

        if (currentX < startX && currentY < startY) {//從右下角畫到左上角
            this.name.beginPath();
            this.name.moveTo(startX - 20, startY);

            this.name.lineTo(currentX + 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY - 20, 20);

            this.name.lineTo(currentX, currentY + 20);
            this.name.arcTo(currentX, currentY, currentX + 20, currentY, 20);

            this.name.lineTo(startX - 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY + 20, 20);

            this.name.lineTo(startX, startY - 20);
            this.name.arcTo(startX, startY, startX - 20, startY, 20);
        }
        else if (currentX > startX && currentY < startY) {//從左下角畫到右上角
            this.name.beginPath();
            this.name.moveTo(startX + 20, startY);

            this.name.lineTo(currentX - 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY - 20, 20);

            this.name.lineTo(currentX, currentY + 20);
            this.name.arcTo(currentX, currentY, currentX - 20, currentY, 20);

            this.name.lineTo(startX + 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY + 20, 20);

            this.name.lineTo(startX, startY - 20);
            this.name.arcTo(startX, startY, startX + 20, startY, 20);
        }
        else if (currentX < startX && currentY > startY) {//從右上角畫到左下角
            this.name.beginPath();
            this.name.moveTo(startX - 20, startY);

            this.name.lineTo(currentX + 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY + 20, 20);

            this.name.lineTo(currentX, currentY - 20);
            this.name.arcTo(currentX, currentY, currentX + 20, currentY, 20);

            this.name.lineTo(startX - 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY - 20, 20);

            this.name.lineTo(startX, startY + 20);
            this.name.arcTo(startX, startY, startX - 20, startY, 20);
        }
        else {//從左上角畫到右下角
            this.name.beginPath();
            this.name.moveTo(startX + 20, startY);

            this.name.lineTo(currentX - 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY + 20, 20);

            this.name.lineTo(currentX, currentY - 20);
            this.name.arcTo(currentX, currentY, currentX - 20, currentY, 20);

            this.name.lineTo(startX + 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY - 20, 20);

            this.name.lineTo(startX, startY + 20);
            this.name.arcTo(startX, startY, startX + 20, startY, 20);
        }

        this.name.stroke();
    },
    //圓
    circle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.arc(startX, startY, Math.sqrt((currentX - startX) * (currentX - startX) + (currentY - startY) * (currentY - startY)), 0, Math.PI * 2, true);
        this.name.stroke();
    },
    //填充圓
    fillCircle: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.arc(startX, startY, Math.sqrt((currentX - startX) * (currentX - startX) + (currentY - startY) * (currentY - startY)), 0, Math.PI * 2, true);
        this.name.fill();
    },
    //橢圓
    ellipse: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.moveTo(2 * startX - currentX, startY);
        this.name.bezierCurveTo(2 * startX - currentX, currentY, currentX, currentY, currentX, startY); //下半圓
        this.name.bezierCurveTo(currentX, 2 * startY - currentY, 2 * startX - currentX, 2 * startY - currentY, 2 * startX - currentX, startY); //上半圓
        this.name.stroke();
    },
    //填充橢圓
    fillellipse: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.moveTo(2 * startX - currentX, startY);
        this.name.bezierCurveTo(2 * startX - currentX, currentY, currentX, currentY, currentX, startY); //下半圓
        this.name.bezierCurveTo(currentX, 2 * startY - currentY, 2 * startX - currentX, 2 * startY - currentY, 2 * startX - currentX, startY); //上半圓
        this.name.fill();
    },
    //直角三角形
    righttriangle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;

        this.name.beginPath();

        //斜邊
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //橫直角邊
        this.name.lineTo(startX, currentY);

        //豎直角邊
        this.name.closePath();

        this.name.stroke();
    },
    //填充直角三角形
    fillrighttriangle: function () {
        setting();
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillStyle = pencolor;

        this.name.beginPath();

        //斜邊
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //橫直角邊
        this.name.lineTo(startX, currentY);

        //豎直角邊
        this.name.closePath();

        this.name.stroke();
        this.name.fill();
    },
    //等腰三角形
    regulartriangle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();

        //腰
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //腰
        this.name.lineTo(startX - (currentX - startX), currentY);

        //底
        this.name.closePath();

        this.name.stroke();
    },
    //填充等腰三角形
    fillregulartriangle: function () {
        setting();
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillStyle = pencolor;

        this.name.beginPath();

        //腰
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //腰
        this.name.lineTo(startX - (currentX - startX), currentY);

        //底
        this.name.closePath();
        this.name.stroke();
        this.name.fill();
    },
    //曲線
    curveLine: function (staX, staY, endX, endY) {//曲線。引數為原直線的起、止座標點
        setting();
        //先擦除第一次繪製的直線，該直線是繪製在最終畫布上的
        //todo,存在缺陷，會清空一個矩形區域
        show.clearRect(staX, staY, endX - staX, endY - staY);

        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        //繪製曲線
        this.name.beginPath();
        this.name.moveTo(staX, staY);
        this.name.quadraticCurveTo(currentX, currentY, endX, endY);
        this.name.stroke();
    },
    //矩形選擇工具痕跡
    selectfillRect: function () {
        this.name.strokeStyle = "#000000";
        this.name.lineWidth = 1;
        this.name.strokeRect(startX, startY, currentX - startX, currentY - startY);
    }
}

//鉛筆開始
function pencil() {
    setting();

    show.shadowBlur = penshowdow;   //模糊程度
    show.strokeStyle = pencolor;
    show.lineWidth = penwidth;
    show.globalAlpha = penalpha;
    show.lineCap = penstyle;

    show.beginPath();
    show.moveTo(startX, startY);
    show.lineTo(startX, startY);
    show.stroke();
}

//畫筆開始
function paintpen() {
    setting();
    show.shadowBlur = penshowdow;   //模糊程度
    show.shadowColor = pencolor;    //模糊顏色
    show.strokeStyle = pencolor;    //線顏色
    show.lineWidth = penwidth;
    show.globalAlpha = penalpha;
    show.lineCap = penstyle;

    show.beginPath();
    show.moveTo(startX, startY);
    show.lineTo(startX, startY)
    show.stroke();
}

//#endregion

//#region 圖片操作

//#region 拖拽繪製圖片

function imagesSelected(myFiles) {
    for (var i = 0, f; f = myFiles[i]; i++) {
        var imageReader = new FileReader();
        imageReader.onload = (function (aFile) {
            return function (e) {
                DrawPic(e.target.result);
            };
        })(f);
        imageReader.readAsDataURL(f);
    }
}

function dropIt(e) {
    imagesSelected(e.dataTransfer.files);
    e.stopPropagation();
    e.preventDefault();
}

//#endregion

//根據輸入角度進行變換
function rotatebydegress() {
    var degree = $('#spnimnImageinputcc').numberspinner('getValue');
    var rateto = $("#selImgrateto").combobox('getValue');

    transforms.rotatebydegress(degree, rateto);

    if (rateto == "right") {
        ShowOpration("diamnImageinputcc", "順時針旋轉" + degree + "度", "icon-inputcc"); //將操作顯示在歷史記錄中
    }
    else {
        ShowOpration("diamnImageinputcc", "逆時針旋轉" + degree + "度", "icon-inputcc"); //將操作顯示在歷史記錄中
    }

    //傳送協同作業
    if (isCommunicate) {//加入協同作業成功！
        communicateTo = $("#selMsgTo").val();
        //帶引數
        sendOperation("transformsrotatebydegress@" + degree + "@\"" + rateto + "\"", communicateTo);
    }
}

//變換方法
//如果沒有選擇，則對整個畫布進行旋轉，否則只旋轉選擇的部分
var transforms = {
    //引數初始化
    intitle: function () {
        rad_x = 1;
        rad_y = 1;//水平/垂直變換引數
        rad_radian = 0;//旋轉變換引數
        //rad_zoom = 1;//縮放比例
    },
    //變換後重繪
    drawShow: function (imgdrsrc) {//圖片路徑
        var img = new Image();
        img.src = imgdrsrc;
        img.onload = function () {
            show.save();
            show.clearRect(0, 0, mapWidth, mapHeight);//清空內容
            show.translate(mapWidth / 2, mapHeight / 2);//中心座標
            show.rotate(rad_radian);//旋轉
            show.scale(rad_y, rad_x);//縮放
            show.drawImage(img, -img.width / 2, -img.height / 2);//居中畫圖
            show.restore();
        }
    },
    //垂直翻轉
    vertical: function () {
        this.intitle();
        rad_radian = Math.PI - rad_radian;
        rad_y *= -1;
        this.drawShow(showcanvas.toDataURL());
    },
    //水平翻轉
    horizontal: function () {
        this.intitle();
        rad_radian = Math.PI - rad_radian;
        rad_x *= -1;
        this.drawShow(showcanvas.toDataURL());
    },
    //向左轉90度
    left: function () {
        this.intitle();
        rad_radian -= Math.PI / 2;
        this.drawShow(showcanvas.toDataURL());
    },
    //向右轉90度
    right: function () {
        this.intitle();
        rad_radian += Math.PI / 2;
        this.drawShow(showcanvas.toDataURL());
    },
    //根據角度旋轉
    rotatebydegress: function (degress, rateto) {
        this.intitle();
        if (rateto == "right") {
            rad_radian = degress * Math.PI / 180;//順時針
        }
        else {
            rad_radian = -degress * Math.PI / 180;//逆時針
        }
        this.drawShow(showcanvas.toDataURL());
    },
    //旋轉180度
    flat: function () {
        this.intitle();
        rad_radian += Math.PI;
        this.drawShow(showcanvas.toDataURL());
    },
    //縮放
    scale: function () {
        function getZoom(scale, zoom) {
            return scale > 0 && scale > -zoom ? zoom :
                    scale < 0 && scale < zoom ? -zoom : 0;
        }
        return function (zoom) {
            if (zoom) {
                var hZoom = getZoom(rad_y, zoom);
                var vZoom = getZoom(rad_x, zoom);
                if (hZoom && vZoom) {//放大
                    rad_y += hZoom;
                    rad_x += vZoom;
                }
                else {//縮小
                    rad_y = rad_y / 2;
                    rad_x = rad_x / 2;
                }
            }
        }
    }(),
    //放大
    zoomin: function () {
        this.intitle();
        this.scale(Math.abs(rad_zoom));
        this.drawShow(showcanvas.toDataURL());
    },
    //縮小
    zoomout: function () {
        this.intitle();
        this.scale(-Math.abs(rad_zoom));
        this.drawShow(showcanvas.toDataURL());
    }
};

//#region繪製圖片

//引數為圖片的路徑
function DrawPic(imgdrsrc) {
    var img = new Image();
    img.src = imgdrsrc;
    img.onload = function () {
        //show.drawImage(img, 0, 0);       //在指定起始座標處繪製圖片

        show.save();
        show.translate(mapWidth / 2, mapHeight / 2);//中心座標
        show.drawImage(img, -img.width / 2, -img.height / 2);//居中畫圖
        show.restore();
    }
}

//#endregion

/*
　在給定了width和height的canvas上，在座標(x, y)上的畫素的構成如下：
•紅色部分：((width * y) + x) * 4
•綠色部分：((width * y) + x) * 4 + 1
•藍色部分：((width * y) + x) * 4 + 2
•透明度部分：((width * y) + x) * 4 + 3
*/


//#region 黑白處理
//原理: 彩色影像處理成黑白效果通常有3種演算法；
//(1).最大值法: 使每個畫素點的 R, G, B 值等於原畫素點的 RGB (顏色值) 中最大的一個；
//(2).平均值法: 使用每個畫素點的 R,G,B值等於原畫素點的RGB值的平均值；
//(3).加權平均值法: 對每個畫素點的 R, G, B值進行加權
function tobalckwhite() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        var averge;
        //例項程式以加權平均值法產生黑白影像
        var iType = 2;
        switch (iType) {
            case 0: //平均值法
                averge = ((r + g + b) / 3);
                break;
            case 1: //最大值法
                averge = r > g ? r : g;
                averge = averge > b ? averge : b;
                break;
            case 2: //加權平均值法
                //averge = ((0.7 * r) + (0.2 * g) + (0.1 * b));
                averge = ((0.299 * r) + (0.587 * g) + (0.114 * b));
                break;
        }

        pix[i] = averge;       //紅
        pix[i + 1] = averge;   //綠
        pix[i + 2] = averge;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}
//#endregion

//#region 反色處理
//獲得每一點畫素的值, 然後再使用SetPixel方法將取反後的顏色值設定到對應的點
function inverse() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    //取得紅綠藍，取反
    for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i] = 255 - pix[i];           //紅
        pix[i + 1] = 255 - pix[i + 1];   //綠
        pix[i + 2] = 255 - pix[i + 2];   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}
//#endregion

//#region亮度處理todo
//將每個點的三個通道加上一個數。
function light(lightstep) {
    imgdlighttmp = imgdlight;
    var pix = imgdlighttmp.data; //得到畫素
    var average = 0;//計算r、g、b平均值

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = pix[i] + lightstep;
        g = pix[i + 1] + lightstep;
        b = pix[i + 2] + lightstep;

        average = (r + g + b) / 3;
        r = r + average;
        g = g + average;
        b = b + average;

        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgdlighttmp, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region對比度調整todo
//讓顏色深的更深，讓顏色淺的更淺
function compare(compstep) {
    imgdlighttmp = imgdlight;
    var pix = imgdlighttmp.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = pix[i];
        g = pix[i + 1];
        b = pix[i + 2];

        if (r > 127) {
            r = r + compstep;
        }
        if (r < 127) {
            r = r - compstep;
        }

        if (g > 127) {
            g = g + compstep;
        }
        if (g < 127) {
            g = g - compstep;
        }

        if (b > 127) {
            b = b + compstep;
        }
        if (b < 127) {
            b = b - compstep;
        }

        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgdlighttmp, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region 銳化效果
//突出顯示顏色值大(即形成形體邊緣)的畫素點.

function sharpen() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //拉普拉斯模板
    var Laplacian = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
    var r = 0, g = 0, b = 0;
    var Index = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            Index = 0;
            for (var col = -1; col <= 1; col++) {
                for (var row = -1; row <= 1; row++) {
                    r += pix[((imgdWd * (y + col)) + x + row) * 4] * Laplacian[Index];
                    g += pix[((imgdWd * (y + col)) + x + row) * 4 + 1] * Laplacian[Index];
                    b += pix[((imgdWd * (y + col)) + x + row) * 4 + 2] * Laplacian[Index];
                    Index++;
                }
            }

            //處理顏色值溢位
            r = r > 255 ? 255 : r;
            r = r < 0 ? 0 : r;
            g = g > 255 ? 255 : g;
            g = g < 0 ? 0 : g;
            b = b > 255 ? 255 : b;
            b = b < 0 ? 0 : b;

            pix[((imgdWd * (y - 1)) + x - 1) * 4] = r;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 1] = g;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 2] = b;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3] = pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置進行畫素重繪
}

//#endregion

//#region 浮雕處理
//對影像畫素點的畫素值分別與相鄰畫素點的畫素值相減後加上128, 然後將其作為新的畫素點的值.

function selaFloat() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = Math.abs(pix[i] - pix[i + 4] + 128);
        g = Math.abs(pix[i + 1] - pix[i + 5] + 128);
        b = Math.abs(pix[i + 2] - pix[i + 6] + 128);
        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}
//#endregion

//#region 柔化效果
//當前畫素點與周圍畫素點的顏色差距較大時取其平均值.

function conslateSoft() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //高斯模板
    var Gauss = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    var r = 0, g = 0, b = 0;
    var Index = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            Index = 0;
            for (var col = -1; col <= 1; col++) {
                for (var row = -1; row <= 1; row++) {
                    r += pix[((imgdWd * (y + col)) + x + row) * 4] * Gauss[Index];
                    g += pix[((imgdWd * (y + col)) + x + row) * 4 + 1] * Gauss[Index];
                    b += pix[((imgdWd * (y + col)) + x + row) * 4 + 2] * Gauss[Index];
                    Index++;
                }
            }

            r /= 16;
            g /= 16;
            b /= 16;
            //處理顏色值溢位
            r = r > 255 ? 255 : r;
            r = r < 0 ? 0 : r;
            g = g > 255 ? 255 : g;
            g = g < 0 ? 0 : g;
            b = b > 255 ? 255 : b;
            b = b < 0 ? 0 : b;

            pix[((imgdWd * (y - 1)) + x - 1) * 4] = r;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 1] = g;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 2] = b;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3] = pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置進行畫素重繪
}

//#endregion

//#region油畫效果
//對影像中某一範圍內的畫素引入隨機值.

function conslatepainting() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //取不同的值決定油畫效果的不同程度
    var iModel = 2;
    var i = imgdWd - iModel;
    while (i > 1) {
        var j = imgdHt - iModel;
        while (j > 1) {
            var iPos = Math.floor(Math.random() * 99999) % iModel;

            //將該點的RGB值設定成附近iModel點之內的任一點
            r = pix[((imgdWd * (j + iPos)) + i + iPos) * 4];
            g = pix[((imgdWd * (j + iPos)) + i + iPos) * 4 + 1];
            b = pix[((imgdWd * (j + iPos)) + i + iPos) * 4 + 2];

            pix[(imgdWd * j + i) * 4] = r;
            pix[(imgdWd * j + i) * 4 + 1] = g;
            pix[(imgdWd * j + i) * 4 + 2] = b;
            pix[(imgdWd * j + i) * 4 + 3] = pix[(imgdWd * j + i) * 4 + 3];

            j = j - 1;
        }
        i = i - 1;
    }

    show.putImageData(imgd, 0, 0);//在指定位置進行畫素重繪
}

//#endregion

//#region積木效果
//對影像中的各個畫素點著重(即加大分畫素的顏色值)著色.

function conslatewood() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    var r = 0, g = 0, b = 0;
    var iAvg = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            iAvg = (pix[(imgdWd * y + x) * 4] + pix[(imgdWd * y + x) * 4 + 1] + pix[(imgdWd * y + x) * 4 + 2]) / 3;

            if (iAvg >= 128) {
                iAvg = 255;
            }
            else {
                iAvg = 0;
            }

            pix[(imgdWd * y + x) * 4] = iAvg;
            pix[(imgdWd * y + x) * 4 + 1] = iAvg;
            pix[(imgdWd * y + x) * 4 + 2] = iAvg;
            pix[(imgdWd * y + x) * 4 + 3] = pix[(imgdWd * y + x) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置進行畫素重繪
}

//#endregion

//#region 模糊處理
function blur() {
    var pi = 3.141592654; //get blur_array
    var e = 2.718281828459;
    var g = 2;
    var blur_array = new Array();
    var temp = 0;

    for (var x = 0; x < 2 * g + 1; x++) {
        blur_array[x] = new Array();
        for (var y = 0; y < 2 * g + 1; y++) {
            blur_array[x][y] = Math.pow(e, -((x - g) * (x - g) + (y - g) * (y - g)) / (2 * g * g)) / (2 * pi * g * g);
            temp += blur_array[x][y];
        }
    }

    for (var x = 0; x < 2 * g + 1; x++) {
        for (var y = 0; y < 2 * g + 1; y++) {
            blur_array[x][y] /= temp;
        }
    }

    var can_data = show.getImageData(0, 0, mapWidth, mapHeight);
    var can_data2 = show.getImageData(0, 0, mapWidth, mapHeight);

    for (var i = g; i < mapWidth - g - 1; i++) {
        for (var j = g; j < mapHeight - g - 1; j++) {
            var idx = (i + j * mapWidth) * 4;
            can_data2.data[idx + 0] = get_blur_average(can_data, g, blur_array, 0, i, j);
            can_data2.data[idx + 1] = get_blur_average(can_data, g, blur_array, 1, i, j);
            can_data2.data[idx + 2] = get_blur_average(can_data, g, blur_array, 2, i, j);
        }
    }
    show.putImageData(can_data2, 0, 0);
}

function get_blur_average(can_data, g, blur_array, channel, x, y) {
    var t = 0;
    for (var i = 0; i < 2 * g + 1; i++) {
        for (var j = 0; j < 2 * g + 1; j++) {
            var idx = (x + i - g + (y + j - g) * can_data.width) * 4;
            t += can_data.data[idx + channel] * blur_array[i][j];
        }
    }
    return t;
}

//#endregion

//#region 霧化處理
//在影像中引入一定的隨機值, 打亂影像中的畫素值

function wuhuaView() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var k = Math.floor(Math.random() * (123456 + 1));

        //畫素塊大小
        var dx = i + k % 19;
        if (dx >= pix.length) {
            dx = pix.length - 1;
        }

        var r = pix[dx];
        var g = pix[dx + 1];
        var b = pix[dx + 2];
        var a = pix[dx + 3];

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = a;         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region 雕刻處理
//同浮雕效果相反，從結尾的畫素開始處理

function diaokeView() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = pix.length - 4; i > 0; i -= 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = Math.abs(pix[i] - pix[i - 4] + 128);
        g = Math.abs(pix[i + 1] - pix[i - 3] + 128);
        b = Math.abs(pix[i + 2] - pix[i - 2] + 128);
        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}
//#endregion

//#region 懷舊處理

function turnOld() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = parseInt(0.393 * pix[i] + 0.769 * pix[i + 1] + 0.189 * pix[i + 2]);
        var g = parseInt(0.349 * pix[i] + 0.686 * pix[i + 1] + 0.168 * pix[i + 2]);
        var b = parseInt(0.272 * pix[i] + 0.534 * pix[i + 1] + 0.131 * pix[i + 2]);

        if (r > 255) {
            r = 255;
        }
        if (g > 255) {
            g = 255;
        }
        if (b > 255) {
            b = 255;
        }

        pix[i] = r;       //紅
        pix[i + 1] = g;   //綠
        pix[i + 2] = b;   //藍
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region紅色蒙版
//將紅色通道取平均值，綠色通道和藍色通道都設為0

function turnRed() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];
        pix[i] = (r + g + b) / 3;        // 紅色通道取平均值
        pix[i + 1] = pix[i + 2] = 0; // 綠色通道和藍色通道都設為0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region綠色蒙版

function turnGreen() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        pix[i + 1] = (r + g + b) / 3;        // 綠色通道取平均值
        pix[i] = pix[i + 2] = 0; // 紅色通道和藍色通道都設為0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#region藍色蒙版

function turnBlue() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //從指定的矩形區域取得 canvas 畫素陣列
    var pix = imgd.data; //得到畫素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        pix[i + 2] = (r + g + b) / 3;        //藍色通道取平均值
        pix[i] = pix[i + 1] = 0; //紅色通道和綠色通道都設為0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置進行畫素重繪
}

//#endregion

//#endregion

//#region 撤銷、重做操作函式

//儲存picture歷史記錄
function saveImageHistory() {
    cancelTimes = 0;
    imageHistoryList.push(showcanvas.toDataURL());
    if (imageHistoryList.length > 0) {
        //啟用撤銷功能

        //選單欄的撤銷功能
        var itemEl = $('#mnEditundo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        $('#historyundoall').linkbutton('enable');//歷史記錄下的撤銷所有
        $('#historyundo').linkbutton('enable');//歷史記錄下的撤銷
    }
}

//undo 撤銷一次
function undo() {
    cancelTimes++;
    if (cancelTimes >= imageHistoryList.length + 1) {
        cancelTimes--;
        return;
    } else if (cancelTimes == imageHistoryList.length) {
        show.clearRect(0, 0, mapWidth, mapHeight);

        //啟用重做功能
        var itemEl = $('#mnEditredo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        //歷史記錄下的重做、重做所有按鈕
        $('#historyredo').linkbutton('enable');
        $('#historyredoall').linkbutton('enable');

        //停用撤銷功能
        var itemE2 = $('#mnEditundo')[0];
        $('#mnEdit').menu('disableItem', itemE2);

        $('#historyundoall').linkbutton('disable');//歷史記錄下的撤銷所有
        $('#historyundo').linkbutton('disable');//歷史記錄下的撤銷
    } else {
        //啟用重做功能
        var itemEl = $('#mnEditredo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        //歷史記錄下的重做、重做所有按鈕
        $('#historyredo').linkbutton('enable');
        $('#historyredoall').linkbutton('enable');

        show.clearRect(0, 0, mapWidth, mapHeight);
        var image = new Image();
        image.src = imageHistoryList[imageHistoryList.length - 1 - cancelTimes];
        image.onload = function () {
            show.drawImage(image, 0, 0, image.width, image.height);
        };
    }
};

//redo，重做上一次操作
function redo() {
    cancelTimes--;
    if (cancelTimes < 0) {
        cancelTimes++;
        return;
    } else {
        if (cancelTimes == 0) {
            //停用重做功能
            var itemEl = $('#mnEditredo')[0];
            $('#mnEdit').menu('disableItem', itemEl);

            //歷史記錄下的重做、重做所有按鈕
            $('#historyredo').linkbutton('disable');
            $('#historyredoall').linkbutton('disable');
        }
        show.clearRect(0, 0, mapWidth, mapHeight);
        var image = new Image();
        image.src = imageHistoryList[imageHistoryList.length - 1 - cancelTimes];
        image.onload = function () {
            show.drawImage(image, 0, 0, image.width, image.height);
        };

        //啟用撤銷功能
        var itemEl = $('#mnEditundo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        $('#historyundoall').linkbutton('enable');//歷史記錄下的撤銷所有
        $('#historyundo').linkbutton('enable');//歷史記錄下的撤銷
    }
};

//undoall 撤銷所有
function undoall() {
    show.clearRect(0, 0, mapWidth, mapHeight);

    //啟用重做功能
    var itemEl = $('#mnEditredo')[0];
    $('#mnEdit').menu('enableItem', itemEl);

    //歷史記錄下的重做、重做所有按鈕
    $('#historyredo').linkbutton('enable');
    $('#historyredoall').linkbutton('enable');

    //停用撤銷功能
    var itemE2 = $('#mnEditundo')[0];
    $('#mnEdit').menu('disableItem', itemE2);

    $('#historyundoall').linkbutton('disable');//歷史記錄下的撤銷所有
    $('#historyundo').linkbutton('disable');//歷史記錄下的撤銷
}

//redoall重做所有
function redoall() {
    show.clearRect(0, 0, mapWidth, mapHeight);
    var image = new Image();
    image.src = imageHistoryList[imageHistoryList.length - 1];
    image.onload = function () {
        show.drawImage(image, 0, 0, image.width, image.height);
    };

    //停用重做功能
    var itemEl = $('#mnEditredo')[0];
    $('#mnEdit').menu('disableItem', itemEl);

    //歷史記錄下的重做、重做所有按鈕
    $('#historyredo').linkbutton('disable');
    $('#historyredoall').linkbutton('disable');

    //啟用撤銷功能
    var itemEl = $('#mnEditundo')[0];
    $('#mnEdit').menu('enableItem', itemEl);

    $('#historyundoall').linkbutton('enable');//歷史記錄下的撤銷所有
    $('#historyundo').linkbutton('enable');//歷史記錄下的撤銷
}

//#endregion

//#region 圖層操作

//#region 圖層管理下的按鈕操作

//新建圖層
$('#levellstNew').click(function () {
    levelOpration.addLevel();
});

//刪除圖層
$('#levellstDelete').click(function () {
    levelOpration.deleteLevel();
});

//複製圖層
$('#levellstCopy').click(function () {
    levelOpration.copyLevel();
});

//向上移動圖層
$('#levellstMoveUp').click(function () {
    levelOpration.moveUpLevel();
});

//向下移動圖層
$('#levellstMoveDown').click(function () {
    levelOpration.moveDownLevel();
});

//圖層屬性
$('#levellstInfo').click(function () {
    levelOpration.showLevelInfo();
});

//#endregion



//存放圖層資訊
var levelList = new Array({ "canvasId": "showcanvas", "isHide": false });
//根據圖層id刪除該元素
Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].canvasId == val) {
            this.splice(i, 1);
            break;
        }
    }
}

//建立新的畫布
var selectedLevelId;//記錄當前選中的圖層記錄id
var selectedcanvasid;//記錄當前選中圖層canvas的id
var levelNum = 1; //圖層面板新建索引
function createCanvas(levelNum, width, height) {
    var newCanvas = document.createElement("canvas");
    newCanvas.id = "level" + levelNum;
    newCanvas.width = width;
    newCanvas.height = height;
    $(newCanvas).addClass("newCanvas");
    $(newCanvas).css("z-index", levelNum + 2);//已經有臨時圖層和最終展示圖層，z-index分別為1和2

    var levelInfo = { "canvasId": newCanvas.id, "isHide": false };
    levelList.push(levelInfo);
    return newCanvas;
}

//圖層操作類
var levelOpration = {
    //圖層個數
    levelCount: 0,
    //新增圖層
    addLevel: function () {
        //建立圖層，並加入到背景圖層中
        var firstDrawWin = document.getElementById("firstDrawWin");

        var newCanvas = createCanvas(levelNum, mapWidth, mapHeight);
        var bgroudCanvas = document.getElementsByTagName("canvas")[0];
        firstDrawWin.insertBefore(newCanvas, bgroudCanvas);

        //圖層管理面板
        var levelName = "圖層" + levelNum;
        var levelNameCheck = "levelCheck" + levelNum;
        var levelStr = "<a id=\"" + levelName + "\" href=\"#\" style=\"width: 100%;\" title=\"" + levelName + "\" >" + levelName + "<input id=\"" + levelNameCheck + "\" type=\"checkbox\" checked=\"true\" /></a><br />";
        $("#levelList").prepend(levelStr);//新建的圖層在開始行

        //設定樣式
        $('#' + levelName).linkbutton({
            iconCls: 'icon-level',
            plain: true
        });
        //控制捲軸在最下
        $('#levelList').scrollTop();
        levelNum++;

        getCurrentCanvas();
    },
    //刪除圖層
    deleteLevel: function () {
        //刪除選中的圖層，不是checked=true的圖層
        levelList.removeByValue(selectedcanvasid);//圖層管理棧中刪除該記錄
        //刪除該canvas
        $("#" + selectedcanvasid).remove();

        //圖層管理記錄中，移除該記錄
        $("#" + selectedLevelId).remove();
        $('#levellstDelete').linkbutton('disable');

        getCurrentCanvas();
    },
    //複製圖層
    copyLevel: function () {


        getCurrentCanvas();
    },
    //向上移動圖層
    moveUpLevel: function () {

        getCurrentCanvas();
    },
    //向下移動圖層
    moveDownLevel: function () {

        getCurrentCanvas();
    },
    //顯示圖層屬性
    showLevelInfo: function () {
        alert("顯示圖層屬性");
    }
};

//隱藏、顯示圖層。圖層列表，單擊checkbox觸發
$("#levelList input[type='checkbox']").live("click", function () {
    var canvasid;
    var levelclickNum;
    if (this.id == "cklebelbgroud") {//背景
        canvasid = "showcanvas";
        levelclickNum = 0;
    }
    else {
        levelclickNum = this.id.substring(10);
        canvasid = "level" + levelclickNum;
    }

    if ($(this).attr("checked")) {//顯示這個圖層
        $("#" + canvasid).show();

        //圖層棧的中，該圖層標註為顯示
        levelList[levelclickNum] = { "canvasId": levelList[levelclickNum].canvasId, "isHide": false };
    } else {//隱藏這個圖層
        $("#" + canvasid).hide();

        //圖層棧的中，該圖層標註為隱藏
        levelList[levelclickNum] = { "canvasId": levelList[levelclickNum].canvasId, "isHide": true };
    }

    getCurrentCanvas();
});

//圖層記錄單擊
$("#levelList a").live("click", function () {
    var levelclickNum;
    if (this.id == "levelbgroud") {//背景
        selectedcanvasid = "showcanvas";
    }
    else {
        levelclickNum = this.id.substring(2);
        selectedcanvasid = "level" + levelclickNum;
    }

    selectedLevelId = this.id;//記錄當前選中的圖層記錄id
    $("#levelList a").each(function () {
        if (this.id == selectedLevelId) {//該項為選中狀態
            $("#" + selectedLevelId).css("background-color", "#B2CBF0");
        }
        else {//其他為非選中狀態
            $(this).css("background-color", "#FFFFFF");
        }
    });

    $('#levellstDelete').linkbutton('enable');
});
//#endregion

//#region建立網格

//建立網格
//levelNum當前圖層個數
function drawGrid(levelNum) {

    var drawgridcanvas = document.getElementById("gridcanvas");//取得網格區域
    var gridContext = drawgridcanvas.getContext("2d");

    $(drawgridcanvas).css("z-index", levelNum + 2);//加上臨時圖層、最終展示圖層
    levelNum++;

    gridContext.strokeStyle = "#7F7F7F";
    var canvasWidth = drawgridcanvas.width;
    var canvasHeight = drawgridcanvas.height;

    gridContext.beginPath();

    var dashLength = 1;//虛線間隔
    var startX;//起始X軸座標
    var startY;//起始Y軸座標
    var currentX;//終點X軸座標
    var currentY;//終點Y軸座標

    var deltaX;
    var deltaY;
    var numDashes;

    gridContext.beginPath();
    //畫豎向
    for (var x = 10; x < canvasWidth; x += 10) {
        gridContext.moveTo(x, 0);
        startX = x;
        startY = 0;
        currentX = x;
        currentY = canvasHeight;

        deltaX = currentX - startX;
        deltaY = currentY - startY;
        numDashes = canvasHeight / dashLength;

        for (var i = 0; i < numDashes; ++i) {
            gridContext[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * i, startY + (deltaY / numDashes) * i);
        }
    }

    //畫橫向
    for (var y = 10; y < canvasHeight; y += 10) {
        gridContext.moveTo(0, y);
        startX = 0;
        startY = y;
        currentX = canvasWidth;
        currentY = y;

        deltaX = currentX - startX;
        deltaY = currentY - startY;
        numDashes = canvasWidth / dashLength;

        for (var j = 0; j < numDashes; ++j) {
            gridContext[j % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * j, startY + (deltaY / numDashes) * j);
        }
    }

    gridContext.stroke();
}

//#endregion

//#region 函式回撥，取得子頁面的值，進行處理。
//paras為子頁面傳回的引數。要指定引數的來源，以便做出不同的處理
//例如：{"mark":"selectimg","imgSrc":"C:\Users\Tim\Pictures\test.png"}

function reCallMethod(paras) {
    paras = eval('(' + paras + ')'); //將字串轉換成json
    var mark = paras.mark; //取得標記，標示值的來源
    switch (mark) {
        case "selectimg": //圖片選擇
            DrawPic(paras.imgSrc);            //呼叫繪製圖片函式
            ShowOpration(oprationmenuid, oprationmenutext, iconmenuCls); //將操作顯示在歷史記錄中
            saveImageHistory();//儲存畫布
            break;
            //case "communicate"://協同交流
            //    if (paras.result == "success") {//加入協同處理成功，則頁面上的操作會傳送到其他線上使用者
            //        isCommunicate = true;
            //    }
            //    break;
    }
}

//#endregion

//構建協同處理需要的引數
function createDraw(comdrawobject) {
    //構建引數
    if (isCommunicate) {//加入協同作業成功！
        communicateTo = $("#selMsgTo").val();//接收人
        var content = "";//操作函式+引數
        switch (comdrawobject) {
            case "paintline"://直線
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintdottedline"://虛線
                var dottStyle = $("#selline").combobox('getValue');
                var dashLength = 5;
                switch (dottStyle) {
                    case "dottedline1":
                        dashLength = 5;
                        break;
                    case "dottedline2":
                        dashLength = 15;
                        break;
                    case "dottedline3":
                        dashLength = 25;
                        break;
                }
                content = comdrawobject + "@" + dashLength + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintstrokeRect"://矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillRect"://填充矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintradiusStrokeRect"://圓角空心矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintcircle"://圓
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillCircle"://填充圓
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintellipse"://橢圓
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillellipse"://填充橢圓
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintrighttriangle"://直角三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillrighttriangle"://填充直角三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintregulartriangle"://等腰三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillregulartriangle"://填充等腰三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintcurveLine"://曲線
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + cuStartX + "@" + cuStartY + "@" + cuEndX + "@" + cuEndY + "@" + currentX + "@" + currentY;
                break;
            case "paintdrawText"://繪製文本
                content = comdrawobject + "@\"" + txtFont + "\"@\"" + txtSize + "\"@\"" + txtBold + "\"@\"" + txtItalic + "\"@\"" + txtUnderline + "\"@\"" + txtDeleteline + "\"@\"" + txtAlign + "\"@\"" + pencolor + "\"@\"" + txtInput + "\"@" + txtPoX + "@" + txtPoY + "@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"";
                break;
        }

        //傳送協同作業
        sendDraw(content, communicateTo);
    }
}
