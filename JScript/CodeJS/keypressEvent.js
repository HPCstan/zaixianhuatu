//鍵盤快捷鍵

//檔案選單
Mousetrap.bind('alt+f', function (e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
        //e.cancel = true;
    }
    alert("123");
    //$("#menumnFile").hover();

    //$("#menumnFile").addClass("menu-active");

});

//#region 檔案

//開啟
Mousetrap.bind('ctrl+g', function (e) {
    fileOpen();
});

//取得
Mousetrap.bind('ctrl+m', function (e) {
    imgFromCamera();
});

//#endregion

//#region 編輯

//撤銷
Mousetrap.bind('ctrl+z', function (e) {
    undo();
});

//重做
Mousetrap.bind('ctrl+y', function (e) {
    redo();
});

//清空
Mousetrap.bind('ctrl+q', function (e) {
    $.messager.confirm('確定', '確定清空當前畫布？', function (r) {
        if (r) {
            reset();
        }
    });
});

//#endregion

//#region 效果

//黑白
Mousetrap.bind('ctrl+shift+w', function (e) {
    tobalckwhite();
});

//反色
Mousetrap.bind('ctrl+shift+i', function (e) {
    inverse();
});

//模糊
Mousetrap.bind('ctrl+shift+b', function (e) {
    blur();
});

//霧化
Mousetrap.bind('ctrl+shift+m', function (e) {
    wuhuaView();
});

//銳化
Mousetrap.bind('ctrl+shift+s', function (e) {
    sharpen();
});

//浮雕
Mousetrap.bind('ctrl+shift+f', function (e) {
    selaFloat();
});

//柔化
Mousetrap.bind('ctrl+shift+t', function (e) {
    conslateSoft();
});

//油畫
Mousetrap.bind('ctrl+shift+p', function (e) {
    conslatepainting();
});

//積木
Mousetrap.bind('ctrl+shift+d', function (e) {
    conslatewood();
});

//雕刻
Mousetrap.bind('ctrl+shift+v', function (e) {
    diaokeView();
});

//懷舊
Mousetrap.bind('ctrl+shift+o', function (e) {
    turnOld();
});

//紅色蒙版
Mousetrap.bind('ctrl+shift+r', function (e) {
    turnRed();
});

//綠色蒙版
Mousetrap.bind('ctrl+shift+g', function (e) {
    turnGreen();
});

//藍色蒙版
Mousetrap.bind('ctrl+shift+b', function (e) {
    turnBlue();
});

//#endregion

//#region工具箱

//選擇工具
Mousetrap.bind('s', function (e) {
    $("#btnSelect").click();
});

//移動工具
Mousetrap.bind('m', function (e) {
    $("#btnMove").click();
});

//套索工具
Mousetrap.bind('a', function (e) {
    $("#btnLasso").click();
});

//縮放工具
Mousetrap.bind('z', function (e) {
    $("#btnZoomAll").click();
});

//手抓工具
Mousetrap.bind('h', function (e) {
    $("#btnHand").click();
});

//填充工具
Mousetrap.bind('f', function (e) {
    $("#btnFill").click();
});

//漸變工具
Mousetrap.bind('n', function (e) {
    $("#btnGradient").click();
});

//畫筆
Mousetrap.bind('b', function (e) {
    $("#btnPaintBrush").click();
});

//鉛筆
Mousetrap.bind('p', function (e) {
    $("#btnPaintBrush").click();
});

//橡皮擦
Mousetrap.bind('e', function (e) {
    $("#btnEraser").click();
});

//放大鏡
Mousetrap.bind('o', function (e) {
    $("#btnZoomMiro").click();
});

//裁剪
Mousetrap.bind('c', function (e) {
    $("#btnSelectCut").click();
});

//文本
Mousetrap.bind('t', function (e) {
    $("#btnText").click();
});

//直線
Mousetrap.bind('l', function (e) {
    $("#btnLine").click();
});

//曲線
Mousetrap.bind('v', function (e) {
    $("#btnCurve").click();
});

//矩形
Mousetrap.bind('r', function (e) {
    $("#btnRectangle").click();
});

//橢圓
Mousetrap.bind('i', function (e) {
    $("#btnEllipse").click();
});

//三角形
Mousetrap.bind('g', function (e) {
    $("#btnTriangle").click();
});

//多邊形
Mousetrap.bind('y', function (e) {
    $("#btnPolygon").click();
});

//其他形狀
Mousetrap.bind('w', function (e) {
    $("#btnOtherShap").click();
});

//圖章
Mousetrap.bind('x', function (e) {
    $("#btnClone").click();
});

//透明度
Mousetrap.bind('d', function (e) {
    $("#btnAlpha").click();
});

//#endregion

//#region檢視

//放大
Mousetrap.bind('ctrl+up', function (e) {
    transforms.zoomin();
});

//縮小
Mousetrap.bind('ctrl+down', function (e) {
    transforms.zoomout();
});

//#endregion

//#region

//說明文件
Mousetrap.bind('ctrl+f1', function (e) {
    window.open("Help.htm");
});

//#endregion

