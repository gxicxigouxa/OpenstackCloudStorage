	function spam(){
		window.location="/htmltest"
		document.getElementById("spamMain").style.visibility="visible";
		document.getElementById("textMain").style.visibility="hidden";
		document.getElementById("incomeMain").style.visibility="hidden";
	}
	function text(){
		window.location="/htmltest"
		document.getElementById("spamMain").style.visibility="hidden";
		document.getElementById("textMain").style.visibility="visible";
		document.getElementById("incomeMain").style.visibility="hidden";
	}
	function income(){
		window.location="/htmltest"
		document.getElementById("spamMain").style.visibility="hidden";
		document.getElementById("textMain").style.visibility="hidden";
		document.getElementById("incomeMain").style.visibility="visible";

	}

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