'''
py3front.py
세부정보
활동
공유 정보
공유되지 않음
일반 정보
유형
텍스트
크기
26KB (26,627바이트)
사용된 저장용량
26KB (26,627바이트)
위치
06/29
소유자
나
수정한 날짜
2017. 6. 30., 나
열어본 날짜
오후 2:12, 나
2017. 6. 30.에 Google Drive Web
(으)로
작성됨
설명
설명 추가
다운로드 권한
뷰어가 다운로드할 수 있음
모든 항목이 선택취소되었습니다. 모든 항목이 선택취소되었습니다.
'''
import csv
import scipy as sp
#import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import numpy as np
from flask import Flask
from flask import jsonify,request,redirect,url_for,send_from_directory,render_template,url_for,send_file,make_response
from flaskext.mysql import MySQL
import json
import os
from werkzeug import secure_filename
import pefile
import shutil
from sklearn.linear_model import ElasticNet
from sklearn.cross_validation import KFold
from sklearn.feature_extraction.text import CountVectorizer
import sys
import nltk.stem
import docx2txt
from pptx import Presentation
#-*- coding: utf-8 -*-

mystopword = frozenset([
    "가","가운데","갈","걔","거","건","것","걸","고","곳","곳곳","그","그간","그것","그곳","그녀","그달","그당시","그대","그대신",
   "그동안","그들","그들대로","그때","그런고","그런날","그런데서","그런줄","그럴수록","그로","그무렵","그외","그이","그전","그전날",
   "그쪽","나","내게","내년초","내달","내부",
   "너","너로","너와","너희","너희대로","너희들","네","네번","네째","네탓","넷","넷째","년","년간","년도","녘","놈","누가","누구","누구누구",
   "누군가","다섯째","다음달","다음주","당분간","대다수","덧","데","되","둘","둘째","둥","뒤","뒷받침",
   "듯","등","따름","따위","딴","때","때문","마련","마지막","마찬가지","마리","만원","만큼","맏","무엇","몇","묶음","물론","못","뭣","밑",
   "밖에","백","백만원","뿐","서로","세","세째","수십","스스로","쉰","십","아홉째","어느편","어디","어디론지","어떤때",
   "여러가지","여섯째","역","열째","옆","요즘","우리","우선","움직임","월","위해서","육","으뜸",
   "이곳","이것","이날","이달초","이듬","이듬달","이때","이런저런","이런줄","이번","일곱째","쟤",
   "저것","저곳","저도","저기","저런날","저런줄","저렴","저쪽",
   "저희","적극적","전날","전년","전부","전부문","전체적","제","줄곳","지난해",
   "첫째","첫날","최근","평상시","하나","허나","한마디","한가운데","한가지","한곳","한번",
   "한쪽","한편","할",
   "a", "about", "above", "across", "after", "afterwards", "again", "against",
    "all", "almost", "alone", "along", "already", "also", "although", "always",
    "am", "among", "amongst", "amoungst", "amount", "an", "and", "another",
    "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are",
    "around", "as", "at", "back", "be", "became", "because", "become",
    "becomes", "becoming", "been", "before", "beforehand", "behind", "being",
    "below", "beside", "besides", "between", "beyond", "bill", "both",
    "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con",
    "could", "couldnt", "cry", "de", "describe", "detail", "do", "done",
    "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else",
    "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone",
    "everything", "everywhere", "except", "few", "fifteen", "fifty", "fill",
    "find", "fire", "first", "five", "for", "former", "formerly", "forty",
    "found", "four", "from", "front", "full", "further", "get", "give", "go",
    "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter",
    "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his",
    "how", "however", "hundred", "i", "ie", "if", "in", "inc", "indeed",
    "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter",
    "latterly", "least", "less", "ltd", "made", "many", "may", "me",
    "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly",
    "move", "much", "must", "my", "myself", "name", "namely", "neither",
    "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone",
    "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on",
    "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our",
    "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps",
    "please", "put", "rather", "re", "same", "see", "seem", "seemed",
    "seeming", "seems", "serious", "several", "she", "should", "show", "side",
    "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone",
    "something", "sometime", "sometimes", "somewhere", "still", "such",
    "system", "take", "ten", "than", "that", "the", "their", "them",
    "themselves", "then", "thence", "there", "thereafter", "thereby",
    "therefore", "therein", "thereupon", "these", "they", "thick", "thin",
    "third", "this", "those", "though", "three", "through", "throughout",
    "thru", "thus", "to", "together", "too", "top", "toward", "towards",
    "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us",
    "very", "via", "was", "we", "well", "were", "what", "whatever", "when",
    "whence", "whenever", "where", "whereafter", "whereas", "whereby",
    "wherein", "whereupon", "wherever", "whether", "which", "while", "whither",
    "who", "whoever", "whole", "whom", "whose", "why", "will", "with",
    "within", "without", "would", "yet", "you", "your", "yours", "yourself",
    "yourselves"])
TXT_DIRECTORY= '/home/gxicxigouxa/myproject/textcompare'
UPLOAD_FOLDER= '/home/gxicxigouxa/myproject' # path convert!! (when i use different server)
ALLOWED_EXTENSIONS =    set(['txt','pdf','png','jpg','jpeg','gif','doc','exe','docx','hwp','pptx'])

#app = Flask(__name__,template_folder='templates', static_folder='/home/asdiste/myproject/templates')
app = Flask(__name__, static_path='/static')
app.config['UPLOAD_FOLDER']=UPLOAD_FOLDER
app.config['TXT_DIRECTORY']=TXT_DIRECTORY
app.debug=True
mysql= MySQL()

app.config['MYSQL_DATABASE_USER']='root'
app.config['MYSQL_DATABASE_PASSWORD']='root'
app.config['MYSQL_DATABASE_DB']='jhj'
mysql.init_app(app)

@app.route('/login')
def showloginpage():
	return render_template('oldlogin.html',err_code ="no error")

@app.route('/loginchk', methods=['POST','GET'])
def chklogin():
	if request.method == "POST":
		userId= request.form['id']
		userPwd= request.form['password']
		
		print (userId)
		conn =mysql.connect()
		cursor =conn.cursor()
		query = "select * from userinfotable where id ='"+userId +"';"
		cursor.execute(query)
		conn.commit()

		   
		result =[]
		columns= tuple( [d[0] for d in cursor.description] )

		   
		for row in cursor:
		   result.append(dict(zip(columns, row)))
   
		print (str(result))

		if (str(result)=='[]'): # When there is no user id in db
			return render_template('oldlogin.html',login_err_code ="id incorrect", sign_up_err_code = "none")
		else:
			if(result[0]["pwd"]==userPwd):#pwd is correct
				return redirect('/basicpage')
			else:#pwd is incorrect
				return render_template('oldlogin.html', login_err_code="pwd incorrect", sign_up_err_code = "none")

@app.route('/signupchk', methods=['POST','GET'])
def chksignup():
	if request.method == "POST":
		signUpId= request.form['user-id']
		signUpPwd= request.form['user-password']
		signUpBirthday = request.form['user-birthday']
		
		print (signUpId)
		conn =mysql.connect()
		cursor =conn.cursor()
		query = "select * from userinfotable where id ='"+signUpId +"';"
		cursor.execute(query)
		conn.commit()

		   
		result =[]
		columns= tuple( [d[0] for d in cursor.description] )

		   
		for row in cursor:
		   result.append(dict(zip(columns, row)))
   
		print (str(result))

		if (str(result)=='[]'): # When there is no user id in db
			query = "insert into userinfotable values('" + signUpId + "', '" + signUpPwd + "', '" + signUpBirthday + "');"
			cursor.execute(query)
			conn.commit()
			return render_template('oldlogin.html',login_err_code ="none", sign_up_err_code = "success")
		else:
			return render_template('oldlogin.html', login_err_code = "none", sign_up_err_code = "existed id")


@app.route('/basicpage')
def showbasicpage():

	return "ok"


if __name__ =='__main__':
   app.run(host='0.0.0.0',port=9999)