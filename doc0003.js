
/**
 * doc0003.js
 * 社内受信BOX画面(一般社員)のセレクトボックスと動的HTML生成
 * @author S.Nishio
 *    Date:2026/07/08
 * @version 1.0.0
 *
 */

//年月
var strYyyyMm = "";

//文書セレクトボックスの選択値
var docNameSelectVal = "";

//文書種類セレクトボックスの選択値
var docTypeSelectVal = "";

//状況セレクトボックスの選択値
var statusSelectVal = "";

//保持している社員情報
var userInfoArray = [];
//社員コード
var emplC ="";

//受信日付セレクトボックスFrom 
var datetime ="";

//受信日付セレクトボックスTo
var datetime2="";

/* *********************************************
*画面の準備
** ********************************************/
$(document).ready(function(){


    //送信BOX切替ボタンのクリックイベント設定
    $("#sendBoxBtn").click(function(){
	    subSendBox();
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
    $("#lookUpYearMonth").change(function(){
	    subYMChange();
 	});

    //文書セレクトボックスの変更イベント設定
    $("#docNameSelectList").change(function(){
	    subDocNameSelectChange();
 	});

    //文書種類セレクトボックスの変更イベント設定
    $("#docTypeSelectList").change(function(){
	    subDocTypeSelectChange();
 	});
 	
 	 //受信日時セレクトボックス(開始日)の変更イベント設定
    $("#dateFrom").change(function(){
	    subDateTimeFromSelectChange();
 	});
 	
 	 //受信日時セレクトボックス(終了日)の変更イベント設定
    $("#dateTo").change(function(){
	    subDateTimeToSelectChange();
 	});

    //閲覧状況セレクトボックスの変更イベント設定
    $("#statusSelectList").change(function(){
	    subStatusSelectChange();
 	});

});

/* *********************************************
*画面の初期ロード
** ********************************************/
$(window).on('load',function(){
	
	//社員名を取得し表示
	docInit();

	//年月の初期処理
	monthInit();

	//全セレクトボックスの初期処理
	selectBoxInitAll();

	//初期検索処理
	initSearch();

});
/* *********************************************
*利用者名を表示
** ********************************************/
function docInit() {
	//ユーザ情報を取得
	userInfoArray = init("");

	const emplName = userInfoArray[1];
	emplC = userInfoArray[0];
	$("#useName").text(emplName);

}
/* *********************************************
*セレクトボックスの初期設定
** ********************************************/
function selectBoxInitAll() {

	//文書セレクトボックス
	docNameSelectBoxInit();

	//文書分類セレクトボックス
	docTypeSelectBoxInit();

	//閲覧状況セレクトボックス
	statusSelectBoxInit();

}
/* *********************************************
*年月に当月の初期値をセット
* ********************************************/
function monthInit() {

	const ym = toMonthVal();

    $("#lookUpYearMonth").val(ym);

    //検索パラメータとして当月をセット
    strYyyyMm = String(ym).replace("-","");

}
/* *********************************************
*閉じるボタンのイベント
* ********************************************/
function subClose() {
	//一度再表示してからClose
	open('about:blank', '_self').close();
}
/* *********************************************
*送信BOX切替ボタンのクリックイベント
/* ********************************************/
function subSendBox() {
	const ym = strYyyyMm.replace("-","");
	let url = "http://localhost:8080/oraDoc/form/doc0004/doc0004.html";
	url += "?ym=" + ym;

	//新しいウィンドウで表示
	window.open(url);
}

/* *********************************************
*文書セレクトボックスの初期設定
**********************************************/
function docNameSelectBoxInit() {

	//クリア
	$("#docNameSelectList").empty();

	//送受信明細トランの当月データを取得
	let url = "http://localhost:8080/oraDoc/GetDocNameSelectBoxServlet?ACTION=";
    const action = "search";

    url += action;

    const senddata = {
    	//送受信区分（1:送信）
    	send_recive_type: "1",
    	//年月（当月）
    	year_month : strYyyyMm.replace("-",""),
    	//社員コード
    	empl_code : emplC,
    };

    //ajax通信
    const jqXHR = postSeatch(senddata,url);

    setDocSelectBox(jqXHR);

}
/* *********************************************
*文書セレクトボックスへ選択値をセット
***********************************************/
function setDocSelectBox(jqXHR) {
	//var obj = JSON.parse(data);
    $("#docNameSelectList").append($("<option>").val("").text("ALL").prop("selected",true));

	jqXHR.done(function(data, stat, xhr) {
		//結果を表示
		$.each( data, function( key, value ){
		    $("#docNameSelectList").append($("<option>").val(String(value.doc_name)).text(String(value.doc_name)));
	    });
	});
}

/* *********************************************
*セレクトボックスの初期設定
********************************************** */
function docTypeSelectBoxInit() {
	//ALLを初期値として選択させる
	 $("#docTypeSelectList").append($("<option>").val("").text("ALL").prop("selected",true));
	//名称マスタの一覧を取得
	const nameValue = getNameMst("doc_type","1","");

	$.each( nameValue, function( key, value ){
	    $("#docTypeSelectList").append($("<option>").val(String(value.key)).text(String(value.value)));
    });

}
/* *********************************************
*状況セレクトボックスへ選択値をセット
* *********************************************/
function statusSelectBoxInit() {
	//ALLを初期値として選択させる
    $("#statusSelectList").append($("<option>").val("").text("ALL").prop("selected",true));

    //名称マスタの一覧を取得
	const nameValue = getNameMst("status","1","");

	$.each( nameValue, function( key, value ){
	    $("#statusSelectList").append($("<option>").val(String(value.key)).text(String(value.value)));
    });
}
/* *********************************************
*年月の変更時
* ********************************************/
function subYMChange() {

	strYyyyMm = $('#lookUpYearMonth').val();

	//文書セレクトボックスの再セット
	docNameSelectBoxInit();

	docNameSelectVal = "";

}
/* *********************************************
*文書セレクトボックスの変更時
* ********************************************/
function subDocNameSelectChange() {

	docNameSelectVal = $('#docNameSelectList option:selected').val();

}

/* *********************************************
*文書種類セレクトボックスの変更時
* ********************************************/
function subDocTypeSelectChange() {

	docTypeSelectVal = $('#docTypeSelectList option:selected').val();

}
/* *********************************************
*受信日時(開始日)セレクトボックスの変更時
* *********************************************/
function subDateTimeFromSelectChange() {

	datetime = $('#dateFrom').val();

}
/* *********************************************
*受信日時(終了日)セレクトボックスの変更時
* *********************************************/
function subDateTimeToSelectChange() {

	datetime2 = $('#dateTo').val();

}
/* *********************************************
*状況セレクトボックスの変更時
* *********************************************/
function subStatusSelectChange() {

	statusSelectVal = $('#statusSelectList option:selected').val();

}
/* *********************************************
*表示内容のクリア
* *********************************************/
function detailClear() {
	$('table#detailTBody tbody *').empty();

}
/* *********************************************
*初期検索処理
* ********************************************/
function initSearch() {

    const senddata = {
        	//送受信区分（1:送信）
        	send_recive_type: "1",
        	//年月（当月）
        	year_month : strYyyyMm.replace("-",""),
        	//社員コード
        	empl_code : emplC
    };

	subSearch(senddata);

}
/* *********************************************
*検索処理
* ********************************************/
function execSearch() {
	//入力チェック
	if(!inputcheck())return ;

	const senddata = {
        	//送受信区分（1:送信）
        	send_recive_type: "1",
        	//年月（当月）
        	year_month : strYyyyMm.replace("-",""),
        	//文書名
        	doc_name : docNameSelectVal,
        	//文書種類
        	doc_type : docTypeSelectVal,
        	//社員コード
        	empl_code : emplC,
        	//受信日付(開始)
        	send_recive_datetime_from : datetime,
        	//受信日付(終了)
        	send_recive_datetime_to : datetime2,
        	//閲覧状況
        	status : statusSelectVal,
    };

	subSearch(senddata);

}
/**********************************************
 * 入力チェック
 **********************************************/
function inputcheck(){
	const strDate = String($("#dateFrom").val());
	const strDate2 = String($("#dateTo").val());
	
	if (strDate != "") {
		datetime = strDate.substring(0,4) + strDate.substring(5,7) + strDate.substring(8,10) + "000000";
	}
	if (strDate2 != "") {
		datetime2 = strDate2.substring(0,4) + strDate2.substring(5,7) + strDate2.substring(8,10) + "235959";
		if(datetime > datetime2){
			displayMessage(getMsg("msg0003_001"));
			return false;
		}
	}
	return true;
}
/* *********************************************
//検索処理
* ********************************************/
function subSearch(senddata) {

    detailClear();

	//送受信明細トランの当月データを取得
	let url = "http://localhost:8080/oraDoc/GetSendReciveDetailTranDataServlet?ACTION=";
    const action = "search";

    url += action;

    //ajax通信
    const jqXHR = postSeatch(senddata,url);

    showData(jqXHR);

}
/* *********************************************
*取得した明細を画面に表示
/* ********************************************/
function showData(jqXHR) {

	jqXHR.done(function(data, stat, xhr) {
		//dataの中が何もない
		if(!data || data.length === 0){
			 displayMessage(getMsg("msg0006_001"));
			 return false;
		}
		//結果を表示
		$.each( data, function( key, value ){
						
			let str = "";
			//年月をyyyy/mm形式で表示
			const yyyymm = (value.year_month);
			const yearm = formatyear(yyyymm);
			
			 //日時をyyyy/mm/dd hh:mm:ss形式に変換
		    const srtimesecond = (value.send_recive_datetime);
		    const srdatetime = formattime(srtimesecond);
		   
		    const cktimesecond = (value.check_datetime);
		    const ckdatetime = formattime(cktimesecond);
		    
			
			str = "<tr class='pointer'><td id='yearMonth'>"+ String(yearm)
		    		+"</td><td id='docName'>" + String(value.doc_name)
		    		+"</td><td id='docType'>" + String(value.doc_type_name) 
		    		+ "<input type='hidden' name='emplCode' value='"+ value.empl_code +"'></input>";
		   
	    	str += "</td><td><button class='operation_btn'"+ "data-year-m='" + String(yearm) + "' "                     // 変数 yearm の中身を代入
				    + "data-doc-n='" + (value.doc_name) + "' "             // 変数 value.doc_name の中身を代入
				    + "data-doc-t='" + (value.doc_type_code) + "' "         // 変数 value.doc_type_code の中身を代入
				    + "style='font-size:11px;'>"                                  // 不要な「'」と「id='operationBtn'」を削除
				    + String(value.operation_type_name) + "</button>";    
		   

		    str += "</td><td id='sendReciveDateTime'>" + String(srdatetime)
		    		+"</td><td id='status'>" + String(value.status_name)
		    		+"</td><td id='checkDateTime'>" + String(ckdatetime)
		    		+"</td></tr>";

		    $("#detailTBody>tbody").append(str);
	    });
	});

}

$(function() {
	/* *********************************************
	 *エラーメッセージダイアログを定義
	 ********************************************** */
	$("#message").dialog({
	    autoOpen: false,
	    modal: true,
	    title: "エラーメッセージ",
	    width: 400,
	    height: 200,
	    buttons: [
	    	{
	            text: 'OK',
	            class:'d-button',
	            click: function() {
	                //ボタンを押したときの処理
	            	$(this).dialog("close");
	            }
	        }
	    ]
	});
});
/**********************************************
 * 年月の形式をyyyy/mmに変換
*********************************************** */
function formatyear(yyyymm){
	if(yyyymm !=null){
		const yyyy = yyyymm.substring(0,4);
		const mm = yyyymm.substring(4,6);
		const yearm = yyyy + "/" + mm
		return yearm;
	}
	yyyymm ="--";
	return yyyymm	
}
/**********************************************
 * 時間の形式をyyyy/mm/dd hh:mm:ssに変換
 **********************************************/
function formattime(time){
	 if(time != null){
		const yyyy = time.substring(0, 4);
		const mm = time.substring(4, 6);
		const dd = time.substring(6, 8);
		const hh = time.substring(8, 10);
		const min = time.substring(10, 12);
		const ss = time.substring(12, 14);
		const dtime = yyyy +"/"+ mm +"/"+ dd +" "+ hh + ":" + min + ":" + ss ; 
		return dtime;
	}
	time = "--";
	return time
}
/* *********************************************
 *処理メッセージ表示
 ********************************************** */
function displayMessage(str) {
	$('#message').empty();
	$('#message').append("<p>" + str + "</p>");
	$("#message").dialog("open");
	return false;
}
/* **********************************************
*操作ボタン：文書閲覧のイベント
*********************************************** */
$(document).on('click', '.operation_btn' , function() {
	
	//doc0006へ送るパラメータを作成
	const sr = 1;//送受信区分
	const ym = $(this).data("yearM").replace("/","");//年月
	const ecd = userInfoArray[0];//社員コード
	const dt = $(this).data("docT");//文書種類
	const dName = $(this).data("docN");//文書名
	const dn = encodeBase64Utf8(dName);
	let url = "http://localhost:8080/oraDoc/form/doc0006/doc0006.html";
	url += "?sr="+sr+ "?ym=" + ym + "?ecd=" + ecd +"?dt="+ dt + "?dn="+ dn;

	//新しいウィンドウで表示
	window.open(url);
});
