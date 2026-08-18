/**
 * doc0001.js
 * 社内送信BOX画面のセレクトボックスと動的HTML生成
 * @author S.Nishio
 *    Date:2021/04/30
 * @version 1.0.0
 *
 */

//年月
var strYyyyMm = "";

//文書セレクトボックスの選択値
var docSelectVal = "";

//社員セレクトボックスの選択値(社員コード)
var emplSelectVal = "";

//登録状況セレクトボックスの選択値
var insertStatusSelectVal = "";

//状況セレクトボックスの選択値
var statusSelectVal = "";

var userInfoArray = [];

//操作ボタン押下時の明細の社員コード
var detailEmplCode = "";

//画面の準備
$(document).ready(function(){

	userInfoArray = init("");

	docInit();

    //受信BOX切替ボタンのクリックイベント設定
    $("#reciveBoxBtn").click(function(){
	    subReciveBox();
 	});

    //社員マスタ登録ボタンのクリックイベント設定
    $("#emplMstBtn").click(function(){
	    subEmplMst();
 	});

    //共通連絡新規登録ボタンのクリックイベント設定
    $("#insertDocBodyBtn").click(function(){
	    subInsertDocBody();
 	});

    //閉じるボタンのクリックイベント設定
    $("#closeBtn").click(function(){
	    subClose();
 	});

    //検索ボタンのクリックイベント設定
    $("#searchBtn").click(function(){
	    execSearch();
 	});

    //年月の変更イベント設定
    $("#month1").change(function(){
	    subYMChange();
 	});

    //文書セレクトボックスの変更イベント設定
    $("#docSelectList").change(function(){
	    subDocSelectChange();
 	});

    //社員セレクトボックスの変更イベント設定
    $("#emplSelectList").change(function(){
	    subEmplSelectChange();
 	});

    //登録状況セレクトボックスの変更イベント設定
    $("#insertStatusSelectList").change(function(){
	    subInsertStatusSelectChange();
 	});

    //状況セレクトボックスの変更イベント設定
    $("#statusSelectList").change(function(){
	    subStatusSelectChange();
 	});

});

function docInit() {

	var emplName = userInfoArray[1];
	$("#useName").text(emplName);

}

//画面の初期ロード
$(window).on('load',function(){

	//年月の初期処理
	monthInit();

	//全セレクトボックスの初期処理
	selectBoxInitAll();

	//登録日付の初期処理
	dateInit();

	//初期検索処理
	initSearch();

});

//セレクトボックスの初期設定
function selectBoxInitAll() {

	//文書セレクトボックス
	docSelectBoxInit();

	//社員セレクトボックス
	emplSelectBoxInit();

	//登録状況セレクトボックス
	lastInsStatusSelectBoxInit();

	//状況セレクトボックス
	statusSelectBoxInit();

}

//年月に当月の初期値をセット
function monthInit() {

	var ym = toMonthVal();

    document.getElementById("month1").value = ym;

    //検索パラメータとして当月をセット
    strYyyyMm = String(ym).replace("-","");

}

//登録日付に当日の初期値をセット
function dateInit() {

	//var ymd = toDayVal();

    //登録日付(開始）
    //document.getElementById("dateFrom").value = ymd;

    //登録日付(終了）
    //document.getElementById("dateTo").value = ymd;

}

//閉じるボタンのイベント
function subClose() {
	//一度再表示してからClose
	open('about:blank', '_self').close();
}

//受信BOX切替ボタンのクリックイベント
function subReciveBox() {
	var ym = strYyyyMm.replace("-","");
	var url = "http://localhost:8080/oraDoc/form/doc0002/doc0002.html";
	url += "?ym=" + ym;

	//新しいウィンドウで表示
	window.open(url);
}

//社員マスタ登録ボタンのクリックイベント
function subEmplMst() {
	window.open("http://localhost:8080/oraDoc/form/doc0014/doc0014.html");
}

//共通連絡新規登録ボタンのクリックイベント
function subInsertDocBody() {
	var ym = strYyyyMm.replace("-","");
	var url = "http://localhost:8080/oraDoc/form/doc0010/doc0010.html";
	url += "?ym=" + ym;

	//新しいウィンドウで表示
	window.open(url);
}

//文書セレクトボックスの初期設定
function docSelectBoxInit() {

	//クリア
	$("#docSelectList").empty();

	//送受信トランの当月データを取得
	var url = "http://localhost:8080/oraDoc/GetSendReciveTranSelectBoxServlet?ACTION=";
    var action = "search";

    url += action;

    var senddata = {
    	//送受信区分（1:送信）
    	send_recive_type: "1",
    	//年月（当月）
    	year_month : strYyyyMm.replace("-",""),
    	//文書名
    	doc_name : "",
    	//社員コード
    	empl_code : emplSelectVal,
    	//最終登録日(開始)
    	last_send_recive_datetime_from : "",
    	//最終登録日(終了)
    	last_send_recive_datetime_to : "",
    	//登録状況
    	insert_status : "",
    	//状況
    	status : "",
    	//在職日(先月の1日に在職)
    	employment_date : lastMonthVal(strYyyyMm.replace("-","")) + "01"
    };

    //ajax通信
    var jqXHR = postSeatch(senddata,url);

    setDocSelectBox(jqXHR);

}

//文書セレクトボックスへ選択値をセット
function setDocSelectBox(jqXHR) {
	//var obj = JSON.parse(data);
    $("#docSelectList").append($("<option>").val("").text("ALL"));

	jqXHR.done(function(data, stat, xhr) {
		//結果を表示
		$.each( data, function( key, value ){
		    $("#docSelectList").append($("<option>").val(String(value.doc_name)).text(String(value.doc_name)));
	    });
	});
}

//社員セレクトボックスの初期設定
function emplSelectBoxInit() {

	//社員マスタの当月在職者を取得
	var url = "http://localhost:8080/oraDoc/GetEmplMstDataServlet?ACTION=";
    var action = "search";

    url += action;

    var senddata = {
        //社員コード
    	empl_code:"",
        //社員名
    	empl_name:"",
        //管理者権限
    	mng_grant:"",
        //ユーザーID
    	user_id:"",
    	//在職日(先月の1日に在職)
    	employment_date : lastMonthVal(strYyyyMm.replace("-","")) + "01"
    };

    //ajax通信
    var jqXHR = postSeatch(senddata,url);

    setEmplSelectBox(jqXHR);

}

//社員セレクトボックスへ選択値をセット
function setEmplSelectBox(jqXHR) {
	//var obj = JSON.parse(data);
    $("#emplSelectList").append($("<option>").val("").text("ALL"));

	jqXHR.done(function(data, stat, xhr) {
		//結果を表示
		$.each( data, function( key, value ){
		    $("#emplSelectList").append($("<option>").val(String(value.empl_code)).text(String(value.empl_name)));
	    });
	});
}

//登録状況セレクトボックスへ最終登録状況の選択値をセット
function lastInsStatusSelectBoxInit() {

    $("#insertStatusSelectList").append($("<option>").val("").text("ALL"));

    //名称マスタの一覧を取得
	var nameValue = getNameMst("last_ins_status","1","");

	$.each( nameValue, function( key, value ){
	    $("#insertStatusSelectList").append($("<option>").val(String(value.key)).text(String(value.value)));
    });

}

//状況セレクトボックスへ選択値をセット
function statusSelectBoxInit() {
    $("#statusSelectList").append($("<option>").val("").text("ALL"));

    //名称マスタの一覧を取得
	var nameValue = getNameMst("status","1","");

	$.each( nameValue, function( key, value ){
	    $("#statusSelectList").append($("<option>").val(String(value.key)).text(String(value.value)));
    });
}

//年月の変更時
function subYMChange() {

	strYyyyMm = $('#month1').val();

	//文書セレクトボックスの再セット
	docSelectBoxInit();

	docSelectVal = "";

}

//文書セレクトボックスの変更時
function subDocSelectChange() {

	docSelectVal = $('#docSelectList option:selected').val();

}

//社員セレクトボックスの変更時
function subEmplSelectChange() {

	//emplSelectVal = $('option:selected').val();
	emplSelectVal = $('#emplSelectList option:selected').val();

	//文書セレクトボックスの再セット
	docSelectBoxInit();

	docSelectVal = "";

}

//登録状況セレクトボックスの変更時
function subInsertStatusSelectChange() {

	insertStatusSelectVal = $('#insertStatusSelectList option:selected').val();

}

//状況セレクトボックスの変更時
function subStatusSelectChange() {

	statusSelectVal = $('#statusSelectList option:selected').val();

}

//表示内容のクリア
function detailClear() {
	$('table#detail tbody *').remove();

}

//初期検索処理
function initSearch() {

    var senddata = {
        	//送受信区分（1:送信）
        	send_recive_type: "1",
        	//年月（当月）
        	year_month : strYyyyMm.replace("-",""),
        	//文書名
        	doc_name : "",
        	//社員コード
        	empl_code : "",
        	//最終登録日(開始)
        	last_send_recive_datetime_from : "",
        	//最終登録日(終了)
        	last_send_recive_datetime_to : "",
        	//登録状況
        	insert_status : "",
        	//状況
        	status : "",
        	//在職日(先月の1日に在職)
        	employment_date : lastMonthVal(strYyyyMm.replace("-","")) + "01"
    };

	subSearch(senddata);

}

//検索処理
function execSearch() {

	var strDate = String($("#dateFrom").val());
	var strDate2 = String($("#dateTo").val());
	var datetime = "";
	var datetime2 = "";
	if (strDate != "") {
		datetime = strDate.substring(0,4) + strDate.substring(5,7) + strDate.substring(8,10) + "000000";
	}
	if (strDate2 != "") {
		datetime2 = strDate2.substring(0,4) + strDate2.substring(5,7) + strDate2.substring(8,10) + "235959";
	}

	var senddata = {
        	//送受信区分（1:送信）
        	send_recive_type: "1",
        	//年月（当月）
        	year_month : strYyyyMm.replace("-",""),
        	//文書名
        	doc_name : docSelectVal,
        	//社員コード
        	empl_code : emplSelectVal,
        	//最終登録日(開始)
        	last_send_recive_datetime_from : datetime,
        	//最終登録日(終了)
        	last_send_recive_datetime_to : datetime2,
        	//登録状況
        	insert_status : insertStatusSelectVal,
        	//状況
        	status : statusSelectVal,
        	//在職日(先月の1日に在職)
        	employment_date : lastMonthVal(strYyyyMm.replace("-","")) + "01"
    };

	subSearch(senddata);

}

//検索処理
function subSearch(senddata) {

    detailClear();

	//送受信トランの当月データを取得
	var url = "http://localhost:8080/oraDoc/GetSendReciveTranDataServlet?ACTION=";
    var action = "search";

    url += action;

    //ajax通信
    var jqXHR = postSeatch(senddata,url);

    showData(jqXHR);

}

function showData(jqXHR) {

	jqXHR.done(function(data, stat, xhr) {
		//結果を表示
		$.each( data, function( key, value ){
			var str = "";
			str = "<tr class='pointer'><td>"+ String(value.year_month)
		    		+"</td><td>" + String(value.doc_name)
		    		+"</td><td>" + String(value.empl_name) + "<input type='hidden' name='emplCode' value='"+ value.empl_code +"'></input>"
		    		+"</td><td>" + String(value.retire_date);

		    if (String(value.doc_name)=='') {
		    	str = str + "</td><td><button class='operation_btn"+ String(value.operation_type) + "' style='font-size:11px;' disabled>"
		    		+ String(value.operation_name) + "</botton>";
		    } else {
		    	str = str + "</td><td><button class='operation_btn"+ String(value.operation_type) + "' style='font-size:11px;'>"
			    	+ String(value.operation_name) + "</botton>";
		    }

		    str = str + "</td><td>" + String(value.last_send_recive_datetime)
		    		+"</td><td>" + String(value.last_ins_status_name)
		    		+"</td><td>" + String(value.status_name)
		    		+"</td></tr>";

		    $("#detail>tbody").append(str);
	    });
	});

}

//操作ボタン：文書登録のイベント
$(document).on('click', '.operation_btn01' , function() {
	var ym3 = strYyyyMm.replace("-","");
	var emplCode = $(this).closest('tr').find('input[name=emplCode]').val();
	var url = "http://localhost:8080/oraDoc/form/doc0005/doc0005.html";
	url += "?ym=" + ym3 + "?ecd=" + emplCode;

	//新しいウィンドウで表示
	window.open(url);
});

//操作ボタン：共通連絡のイベント
$(document).on('click', '.operation_btn03' , function() {
	var ym8 = strYyyyMm.replace("-","");
	var url = "http://localhost:8080/oraDoc/form/doc0010/doc0010.html";
	url += "?ym=" + ym8;

	//新しいウィンドウで表示
	window.open(url);
});



