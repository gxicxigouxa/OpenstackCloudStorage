	var staticPath = '/home/gxicxigouxa/myproject'
	var url = 'http://10.2.8.85:9999/download'

	function spam() {
	    window.location = "/spampage";
	}

	function text() {
	    window.location = "/txtpage";
	}

	function income() {
	    window.location = "/incomepage";
	}

	function bookmark() {
	    window.location = "/bookmarkpage";
	}

	$(document).ready(function() {
	    $('#malfalseinput').click(function() {
	        $("#malfileinput").click();
	    });
	});

	$('#malfileinput').change(function() {
	    $('#mal_selected_filename').text($('#malfileinput')[0].files[0].name);
	    ext = $('#malfileinput')[0].files[0].name.split('.');
	    if (ext[1] != 'exe')
	        alert('put the exe file!!');
	});


	$(document).ready(function() {
	    $('#txtfalseinput').click(function() {
	        $("#txtfileinput").click();
	    });
	});

	$('#txtfileinput').change(function() {
	    $('#txt_selected_filename').text($('#txtfileinput')[0].files[0].name);
	    ext = $('#txtfileinput')[0].files[0].name.split('.');

	});

	//download txt file!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	/*

		$('.txticon').dblclick(function(){
			var filepath = $(this).attr('value');
			//alert(filepath);
			//alert(staticPath);
			tmp = filepath.split(staticPath);
			downloadUrl = tmp[1];
			//alert(downloadUrl);

			$("#txtdownloadFrm").attr("action",'/download'+downloadUrl);
			document.forms['txtdownloadFrm'].submit();
		})


		$('.pptfileicon').dblclick(function(){
			var filepath = $(this).attr('value');
			//alert(filepath);
			tmp = filepath.split(staticPath);
			downloadUrl=tmp[1];
			//alert(downloadUrl);

			$("#pptxdownloadFrm").attr("action",'/download'+downloadUrl);
			document.forms['pptxdownloadFrm'].submit();

		})
		$('.notmalicon').dblclick(function(){
			var filepath= $(this).attr('value');
			//alert(filepath);
			tmp = filepath.split(staticPath);
			downloadUrl=tmp[1];
			//alert(downloadUrl);

			$('#maldownloadFrm').attr("action","/download"+downloadUrl);
			document.forms['maldownloadFrm'].submit();
		})
		$('.malicon').dblclick(function(){
			alert("It's suspected malware! Cannot download this file!");
		})
	*/
	//download txt file!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



	$(document).on("click", "#incometable", function() { // 비동기 동적 버튼 시 사용!!!
	    $('#income').click();

	    /*
		tableCode = "";
		tableCode+='<button class = "label label-success"  id= "incometable" style = " margin-top: 50px; width:400px;  height:100px;margin-left : 100px; font-size:50px;">Table</button>'
		tableCode+='<button class = "label label-info" id="incomegraph" style = "margin-top:50px; width:400px;  height:100px;font-size:50px;">Chart</button>';
		tableCode+='<div style="width:800px; heigth:400px; margin-left: 100px;  text-align : center; margin-top:100px; overflow:auto">';
		

		tableCode+='<table class="table table-striped" border="0" width="100%" >';
		tableCode+='<tr class="info">';
		tableCode+='<td><strong>사용자 ID</strong></td>';
		tableCode+='<td><strong>등록횟수</strong></td>';
		tableCode+='<td><strong>총 사용 금액($)</strong></td>';
		tableCode+='<td><strong>평균 사용 금액(년)</strong></td>';
		tableCode+='<td><strong>사용자 등급</strong></td>';
		tableCode+='<td><strong>사용기간(달)</strong></td>';
		tableCode+='</tr>';
		tableCode+='{% for info in user_info %}';
		tableCode+='<tr>';
		tableCode+='<td>{{info.id}}</td>';
		tableCode+='<td>{{info.numofregist}}회</td>';
		tableCode+='<td>{{info.totalamount}}$</td>';
		tableCode+='<td>{{info.averagefee}}$</td>';
		tableCode+='<td>{{info.grade}}등급</td>';
		tableCode+='<td>{{info.usedmonth}} 개월</td>';
		tableCode+='</tr>';
		tableCode+='{% endfor %}';
		tableCode+='</table>';
		tableCode+='</div>';

		$(".incomeMain").html(tableCode);
	
	*/

	})

	user = new Array();
	avgIncome = new Array();
	expIncome = new Array();

	$(document).on("click", "#incomegraph", function() { //비동기 동적 버튼 시 사용!!!
	        $.ajax({
	            type: "GET",
	            url: "/income/money",
	            datatype: 'json',
	            success: function(data) {

	                chartCode = ""

	                chartCode += '<button class = "label label-success"  id= "incometable" style = " margin-top: 50px; width:400px;  height:100px;margin-left : 100px; font-size:50px;">Table</button>'
	                chartCode += '<button class = "label label-info" id="incomegraph" style = "margin-top:50px; width:400px;  height:100px;font-size:50px;">Chart</button>';
	                chartCode += '<div id="container" style="; width:800px; heigth:500px; margin-left: 100px;  text-align : center; margin-top:100px;" ></div>'
	                chartCode += '<a class="logoutBtn" onclick="logout()">'
	                chartCode += '<p id="logoutIcon">Log Out</p>'
	                chartCode += '</a>'
	                $(".incomeMain").html(chartCode);



	                i = 0;
	                $.each(data[0], function(key, value) {
	                    user[i] = key;
	                    expIncome[i] = value;
	                    i++;
	                });
	                i = 0;
	                $.each(data[1], function(key, value) {
	                    avgIncome[i] = value;
	                    i++;

	                });



	                Highcharts.chart('container', {
	                    chart: {
	                        type: 'line'
	                    },
	                    title: {
	                        text: 'Expected Income'
	                    },
	                    xAxis: {
	                        categories: user
	                    },
	                    yAxis: {
	                        title: {
	                            text: 'Dollar( $ )'
	                        }
	                    },
	                    plotOptions: {
	                        line: {
	                            dataLabels: {
	                                enabled: true
	                            },
	                            enableMouseTracking: false
	                        }
	                    },
	                    series: [{
	                        name: 'expected',
	                        data: expIncome
	                    }, {
	                        name: 'real',
	                        data: avgIncome
	                    }]
	                });



	            }
	        })


	    })
	    /*
	
	function oneCheckbox(chk){
		var obj= document.getElementsByName("chkbox");
		for (var i=0;i<obj.length;i++){

			if(obj[i]!=chk){
				obj[i].checked=false;
			}
		}
	}
*/
	$('.downBtn').click(function() {
	    var filepath = $("input[name='radiobox']:radio:checked").attr('value');
	    alert(filepath)
	        //alert(filepath);
	        //alert(staticPath);
	    tmp = filepath.split(staticPath);
	    downloadUrl = tmp[1];
	    //alert(downloadUrl);

	    $("#Frm").attr("action", '/download' + downloadUrl);
	    document.forms['Frm'].submit();


	})
	$('.bookmarkBtn').click(function() {


	    var filepath = $("input[name='radiobox']:radio:checked").attr('value');


	    tmp = filepath.split(staticPath);
	    staticFpath = tmp[1];
	    alert(staticFpath);

	    tmp2 = staticFpath.split('/');

	    fname = tmp2[tmp2.length - 1];

	    passval = fname + ',' + staticFpath + ',' + filepath
	    $.ajax({
	        url: '/bookmarkdb',
	        type: 'POST',
	        data: passval

	    })



	})
	$('.deleteBtn').click(function() {
	    var filepath = $("input[name='radiobox']:radio:checked").attr('value');
	    alert(filepath);

	    //alert(filepath);
	    //alert(staticPath);
	    //tmp = filepath.split(staticPath);
	    //downloadUrl = tmp[1];
	    //alert(downloadUrl);
	    //alert(filepath);		
	    $.ajax({
	        data: filepath,
	        url: '/deleteFile',
	        type: 'POST'

	    })


	})


	$('.rmbookmarkBtn').click(function() {
	    var filepath = $("input[name='radiobox']:radio:checked").attr('value');
	    alert(filepath);
	    $.ajax({
	        data: filepath,
	        url: '/deleteBookmark',
	        type: 'POST'
	    })
	})

	$('#login').click(function() {
	    if (!($('#userid').val() && $('#userpwd').val())) {
	        alert("Enter a useranme or password!");
	    } else {
	        document.forms['loginFrm'].submit();
	    }

	})

	function login_result(err_code) {
	    if (err_code == "id incorrect") alert("You input the wrong ID");
	    else if (err_code == "pwd incorrect") alert("You input the wrong Password");
	    else if (err_code == "success") alert("Success registered!!")
	}
	$('#signup').click(function() {


	    $("#loginFrm").attr("action", '/signup');
	    document.forms['loginFrm'].submit();
	})

	function chkPwd() {
	    var pwd = document.getElementById("signup_userpwd").value;
	    var chkpwd = document.getElementById("signup_userpwdchk").value;
	    if (pwd != chkpwd) {
	        $("#signup_userpwdchk").attr("style", 'background-color: #FC6171; border: none; height:50px; width:430px; margin-left: 20px; margin-top:60px;  color:gray;');

	    } else {
	        $("#signup_userpwdchk").attr("style", 'background-color: #white; border: none; height:50px; width:430px; margin-left: 20px; margin-top:60px;  color:gray;');
	    }
	}

	function onlyNumber(obj) {
	    $(obj).keyup(function() {
	        $(this).val($(this).val().replace(/[^0-9]/g, ""));
	    });
	}
	$("#regist").click(function() {
	    document.forms["signupFrm"].submit();

	})

	function signup_result(err_code) {
	    if (err_code == "already exist id") alert("already exist ID!!");

	}

	function logout() {
	    window.location = "/login";
	}
	/*
	$('#login').click(function(){
		var id = document.getElementById("userid").value;
		var pwd = document.getElementById("userpwd").value;
		var userinfo = new Object();

		userinfo.id = id;
		userinfo.pwd = pwd ;

		JSON.stringify(userinfo);

		alert(JSON.stringify(userinfo));

		$.ajax({
			data : JSON.stringify(userinfo),
			url : '/login',
			type : 'POST',
			dataType:"json",
			contentType:"application/json",
			success : function(data){
				
				alert(data);
			}

		});
		

	})*/
	/*
		$(".addbookmark").click(function(){

			var filepath= $("input[name='bookmark']:checkbox:checked").attr('value');
			//alert(filepath);
			tmp = filepath.split(staticPath);
			downloadUrl=tmp[1];
			//alert(downloadUrl);
			$("#txtdownloadFrm").attr("action",'/bookmarkdb');
			document.forms['txtdownloadFrm'].submit();




		})
			
	*/

	/*
		function malpassval(filename){	
			var filename=filename;
			fname=filename.split(' ');//split because of space 
			alert(fname[1]);
			
			$.post("htmltest/htmltest2",{"myData": fname[1]})
			
			
		}
		function textpassval(filename){
			var filename=filename;
			fname=filename.split(' ');
			alert(fname[1]);

			var xhr = new XMLHttpRequest();//split because of space 
			xhr.open('POST','htmltest/htmltest2',true);
			xhr.send(fname[1]);

			
		}

		$.ajax(function {
			success: function(data) {
				var list = [];

				list.add();

				var html = "";
				
				list.foreach(function(data) {
					html += "<form name ="malFrm" action = "htmltest/htmltest2" method="POST" >
								<input value= "{{dir}}" name= "dir" type ="hidden">
			  					<label><input type ="submit"   value = "" class = "malDir"   ><p class="malTxt">{{dir}}</p></label>
			  				</form>"

			  		$(".spamMain").html(html);
				})
				html +=
			}
		})
	*/

	var loginApp = angular.module('loginApp', ['ngMaterial']);
	loginApp.controller('loginController', ['$scope', function($scope) {}]);
	loginApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var bookmarkApp = angular.module('bookmarkApp', ['ngMaterial']);
	bookmarkApp.controller('bookmarkController', ['$scope', function($scope) {}]);
	bookmarkApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var incomeApp = angular.module('incomeApp', ['ngMaterial']);
	incomeApp.controller('incomeController', ['$scope', function($scope) {}]);
	incomeApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var pptFileListApp = angular.module('pptFileListApp', ['ngMaterial']);
	pptFileListApp.controller('pptFileListController', ['$scope', function($scope) {}]);
	pptFileListApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var spamApp = angular.module('spamApp', ['ngMaterial']);
	spamApp.controller('spamController', ['$scope', function($scope) {}]);
	spamApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var spamFileListApp = angular.module('spamFileListApp', ['ngMaterial']);
	spamFileListApp.controller('spamFileListController', ['$scope', function($scope) {}]);
	spamFileListApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var txtApp = angular.module('txtApp', ['ngMaterial']);
	txtApp.controller('txtController', ['$scope', function($scope) {}]);
	txtApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var txtFileListApp = angular.module('txtFileListApp', ['ngMaterial']);
	txtFileListApp.controller('txtFileListController', ['$scope', function($scope) {}]);
	txtFileListApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);

	var signUpApp = angular.module('signUpApp', ['ngMaterial']);
	signUpApp.controller('signUpController', ['$scope', function($scope) {}]);
	signUpApp.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
	    $qProvider.errorOnUnhandledRejections(false);
	    $interpolateProvider.startSymbol('[[').endSymbol(']]');
	}]);