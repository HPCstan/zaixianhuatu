//#region 更換皮膚

//更換皮膚
function onChangeTheme(theme) {
    switch (theme) {
        case 'default':
            //該項為選中狀態
            $('#default').css("background-color", "#C9D3E2");
            //其他為非選中狀態
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'bootstrap':
            //該項為選中狀態
            $('#bootstrap').css("background-color", "#C9D3E2");
            //其他為非選中狀態
            $('#default').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-blue':
            //該項為選中狀態
            $('#metro-blue').css("background-color", "#C9D3E2");
            //其他為非選中狀態
            $('#bootstrap').css("background-color", "");
            $('#default').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-green':
            //該項為選中狀態
            $('#metro-green').css("background-color", "#C9D3E2");
            //其他為非選中狀態
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#default').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-red':
            //該項為選中狀態
            $('#metro-red').css("background-color", "#C9D3E2");
            //其他為非選中狀態
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#default').css("background-color", "");
            break;
    }
    //更換皮膚
    var link = $('#content').find('link:first');
    link.attr('href', 'JScript/jquery-easyui/themes/' + theme + '/easyui.css');
}

//#endregion
