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
from flask import jsonify,request,redirect,url_for,send_from_directory,render_template,url_for,send_file,make_response, session
from flaskext.mysql import MySQL
import json
import os
from werkzeug import secure_filename
import pefile
import shutil
from sklearn.linear_model import ElasticNet
#from sklearn.cross_validation import KFold
from sklearn.model_selection import KFold
from sklearn.feature_extraction.text import CountVectorizer
import sys
import nltk.stem
import docx2txt
from pptx import Presentation
import requests
from time import sleep
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
app.secret_key = "OPENSTACK_SECRET_KEY"
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
				
				#토큰 가져오기
				try:
					token_url = 'http://125.132.100.206:5000/v2.0/tokens'
					data = {"auth":{"tenantName":userId,"passwordCredentials":{"username":userId,"password":userPwd}}}
					headers = {'content-type':'application/json'}
					response = requests.post(url=token_url,data=json.dumps(data),headers=headers)
					json_data = json.loads(response.text)
				except requests.exceptions.ConnectionError:
					print("requests.ecveptions.ConnectionError!")
					print("It must invoke error after 5 sec.")
					sleep(5)

				token=json_data["access"]["token"]["id"]
				print("token: " + token)
				session["token"] = token
				session["userId"] = userId
				
				#토큰 계속 요청하면 문제 생길 수 있으므로 임의의 토큰, 스토리지 목록을 만들어 보내자.
				'''
				session["token"] = "dc206eb78a4f46bb83a227fe61317df8"
				session["userId"] = userId
				'''
				return redirect("/storage")
			else:#pwd is incorrect
				return render_template('oldlogin.html', login_err_code="pwd incorrect", sign_up_err_code = "none")


@app.route('/signupchk', methods=['POST','GET'])
def chksignup():
	if request.method == "POST":
		signUpId= request.form['user-id']
		signUpPwd= request.form['user-password']
		signUpBirthday = request.form['user-birthday']
		signUpEmail = request.form['user-email']
		
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
			query = "insert into userinfotable values('" + signUpId + "', '" + signUpPwd + "', '" + signUpBirthday + "', '" + signUpEmail + "');"
			cursor.execute(query)
			conn.commit()

			#######get the admin token
			headers = {"content-type":"application/json"}
			data= {"auth":{"tenantName":"admin","passwordCredentials":{"username":"admin","password":"openstack"}}}
			print(json.dumps(data))
			admin_token_response = requests.post('http://125.132.100.206:5000/v2.0/tokens',data=json.dumps(data),headers=headers)
			print(admin_token_response)
			json_dict= json.loads(admin_token_response.text)
			admin_token=json_dict['access']['token']['id']
			print(admin_token)
			###########################
			#### tenant create
			headers =  {"content-type":"application/json", "x-auth-token":admin_token}
			data = {"tenant":{	"name": signUpId,"description":signUpId,"id":signUpId}}
			response = requests.post('http://125.132.100.206:35357/v2.0/tenants',data = json.dumps(data),headers=headers)
			print(response)
			#############################
			######User Create#######
			#	headers =  {"content-type":"application/json", "x-auth-token":admin_token}
			data = {"user":{"email":signUpEmail,"password":signUpPwd,"name":signUpId,"id":signUpId }}# id is project id 
			response = requests.post('http://125.132.100.206:35357/v2.0/users',data = json.dumps(data),headers=headers)	
			print(response)
			json_dict = json.loads(response.text)
			print(json_dict)
			user_id =json_dict['user']['id']# id is not real id (signup id is user nam ) ex>8cc705d2c8bc4a1f8874f50eee32fc92
			###############################################
			######Role Create ###########################
			#	headers = {"content-type":"application/json", "x-auth-token":admin_token}
			response= requests.put('http://125.132.100.206:35357/v3/projects/'+signUpId+'/users/'+user_id+'/roles/4157814b8ced4164a0b050160b2ba915',headers=headers)
			print(response)			
			if not os.path.exists("/home/gxicxigouxa/myproject/users/" + signUpId):
				os.mkdir("/home/gxicxigouxa/myproject/users/" + signUpId)
				print("mkdir /home/gxicxigouxa/myproject/users/" + signUpId + " success.")
				os.mkdir("/home/gxicxigouxa/myproject/users/" + signUpId + "/malware/")
				print("mkdir /home/gxicxigouxa/myproject/users/" + signUpId + "/malware/ success.")
				os.mkdir("/home/gxicxigouxa/myproject/users/" + signUpId + "/textcompare/")
				print("mkdir /home/gxicxigouxa/myproject/users/" + signUpId + "/textcompare/ success.")
				os.mkdir("/home/gxicxigouxa/myproject/users/" + signUpId + "/malware/malware/")
				print("mkdir /home/gxicxigouxa/myproject/users/" + signUpId + "/malware/malware/ success.")
				os.mkdir("/home/gxicxigouxa/myproject/users/" + signUpId + "/malware/notmalware/")
				print("mkdir /home/gxicxigouxa/myproject/users/" + signUpId + "/malware/notmalware/ success.")
			###########################################
			return render_template('oldlogin.html',login_err_code ="none", sign_up_err_code = "success")
		else:
			return render_template('oldlogin.html', login_err_code = "none", sign_up_err_code = "existed id")


@app.route('/basicpage')
def showbasicpage():
	return render_template("basicpage.html")
	#return "ok"

@app.route('/urltest')
def urltest():
	
	headers = {"content-type":"application/json"}
	data= {"auth":{"tenantName":"admin","passwordCredentials":{"username":"admin","password":"openstack"}}}
	admin_token_response = requests.post('http://125.132.100.206:5000/v2.0/tokens',data=json.dumps(data),headers=headers)
	print(admin_token_response)
	json_dict= json.loads(admin_token_response.text)
	admin_token=json_dict['access']['token']['id']
	print(admin_token)
	
	signUpId= 'noduplicate123322'
	signUpPwd='testpwd'
	signUpEmail ="123"


	headers =  {"content-type":"application/json", "x-auth-token":admin_token}
	data = {"tenant":{	"name": signUpId,"description":signUpId,"id":signUpId}}
	response = requests.post('http://125.132.100.206:35357/v2.0/tenants',data = json.dumps(data),headers=headers)
	print(response)

	#	headers =  {"content-type":"application/json", "x-auth-token":admin_token}
	data = {"user":{"email":signUpEmail,	"password":signUpPwd,"name":signUpId,"id":signUpId }}# id is project id 
	response = requests.post('http://125.132.100.206:35357/v2.0/users',data = json.dumps(data),headers=headers)	
	print(response)
	json_dict = json.loads(response.text)
	print(json_dict)
	user_id =json_dict['user']['id']# id is not real id (signup id is user nam ) ex>8cc705d2c8bc4a1f8874f50eee32fc92

	#	headers = {"content-type":"application/json", "x-auth-token":admin_token}
	response= requests.put('http://125.132.100.206:35357/v3/projects/'+signUpId+'/users/'+user_id+'/roles/4157814b8ced4164a0b050160b2ba915',headers=headers)
	print(response)

	return "ok"


@app.route('/spamtest')
def spamtest():
	return render_template("spamtest.html")

'''
@app.route('/spamtestchk', methods=['GET', 'POST'])
def spamtestchk():
	if request.method == 'POST':
		file = request.form['file-input-button']
		print(file)
		virusTotalApiKey = "8d7e67814ea6ab5362bec87cd0b800a131b32a02042978a66275783f8263e5de"
		params = {'apikey': virusTotalApiKey}
		files = {'file': (secure_filename(file.filename), file)}
		response = requests.post('https://www.virustotal.com/vtapi/v2/file/scan', files=files, params=params)
		json_response = response.json()
		print(json_response)
		return json_response
	else:
		return render_template("spamtest.html")
'''
import requests
API_KEY='bd4e869950aec438845db005416179e0992a76d1692247c5b468b95d356afce8'
detected_cnt=0
Total_num=0

def scan_file(APIKEY,FilePath):
	while(True):
		params = {'apikey': API_KEY}
		files = {'file': (FilePath, open(FilePath, 'rb'))}
		response = requests.post('https://www.virustotal.com/vtapi/v2/file/scan', files=files, params=params)
		scan_response = response.json()
		if(scan_response['response_code']==1):
			return scan_response
		elif(scan_response['response_code']==-2):
			print("Wait For 30 sec")
			time.sleep(30)
			continue;
			
		elif(scan_response['response_code']==-1):
			print("ERROR")

			return 'error';
		else:#0
			print("NO data !! ")
			return "NO Data";

def report_file(APIKEY,Resource):
	while(True):
		global detected_cnt
		global Total_num
		params = {'apikey': API_KEY, 'resource': Resource}
		headers = {
		  "Accept-Encoding": "gzip, deflate",
		  "User-Agent" : "gzip,  My Python requests library example client or username"
		  }
		response = requests.get('https://www.virustotal.com/vtapi/v2/file/report',
		  params=params, headers=headers)
		if(response.text==""):
			return "lots of requests"
		json_response = response.json()
		print(json_response)
	
		scan = json_response.get('scans',{})

		scan_keys= scan.keys();
		print(scan_keys)
		print(json_response)
		if(json_response['response_code'] == 1):
			for key in scan_keys:
				print(' %s : %s  %s' %(key,scan[key]['detected'],scan[key]['result']))
				Total_num+=1
				if (scan[key]['detected'] is True):
					detected_cnt+=1
			print("Total NUM : %d" %(Total_num))
			print("Deceted NUM: %d " %(detected_cnt))
			return json_response
			
		elif(json_response['response_code'] == -2):
			print("Still Analysis.... Wait for 20 sec")
			time.sleep(20)
			continue;
		elif(scan_response['response_code']==-1):
			print("ERROR")

			return 'error';
		else:# 0
			print("NO data !! ")
			return "NO Data";


'''
@app.route('/classifymal',methods=['POST'])
def classifyMal():
	if request.method=="POST":
		file = request.files['file']  # in []  there must be name = 'file'??? search
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'],filename))

		scan_response=scan_file(API_KEY,UPLOAD_FOLDER+'/'+file.filename)
		#print(scan_response)
		resource = scan_response['resource']
		print(resource)

		spamdir_list = os.listdir("/home/gxicxigouxa/myproject/malware")
		answer= report_file(API_KEY,resource)
		if(answer == "lots of requests"):
			print("do it after 1minutes after")
			return render_template('spam.html',spamdir_list=spamdir_list,state_code=1)#1 : lots of request
		
		print (Total_num)
		print (detected_cnt)
		print(detected_cnt/Total_num)
		
		if(scan_response=="NO Data"):
			shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/malware/"+file.filename)
			#return "There is no data in DB so go to malware directory"# go to spam suspect
			return render_template('spam.html',spamdir_list=spamdir_list,state_code=2)# 2: suspect malware
		else:
			if(detected_cnt/Total_num>0.1):#malware suspect
				shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/malware/"+filename)
				#return "IS MALWARE(DownFile's dll!= DB's dll)"
				return render_template('spam.html',spamdir_list=spamdir_list,state_code=2)# 2: suspect malware					
			else:#not malware
				shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/notmalware/"+filename)
				#return "IS NOT MALWARE (DownFile's dll== DB's dll)"
				return render_template('spam.html',spamdir_list=spamdir_list,state_code=3)# 3: no malware

'''

@app.route('/storage')
def storagepage():
	
	#######get the admin token
	headers = {"content-type":"application/json"}
	data= {"auth":{"tenantName":"admin","passwordCredentials":{"username":"admin","password":"openstack"}}}
	print(json.dumps(data))
	admin_token_response = requests.post('http://125.132.100.206:5000/v2.0/tokens',data=json.dumps(data),headers=headers)
	print(admin_token_response)
	json_dict= json.loads(admin_token_response.text)
	admin_token=json_dict['access']['token']['id']
	print("session adminToken: " + admin_token)
	#토큰에 대한 컨테이너 목록 요청
	container_url ='http://125.132.100.206:8080/v1/AUTH_'+ session["userId"]
	headers  ={'x-auth-token':session["token"],'content-type':'application/json'}
	response = requests.get(container_url,headers=headers)
	print(container_url)
	#print(response.text.split("\n"))
	containerList = response.text.split("\n")[:-1]
	#storageListString = "/".join(storageList)
	print(containerList)
	#session["storageListString"] = storageListString
	print("session token: " + session["token"])
	print("session containerList: ")
	print(containerList)
	
	#여기도 계속 토큰 요청하면 문제 생길 수 있으므로 임의의 관리자 토큰과 스토리지 목록을 사용한다.
	'''
	admin_token = "789789789thisistempadmintoken55555"
	containerList = ["컨테이너1", "문서", "사진", "temp1", "temp2", "임시"]
	'''
	return render_template("storage.html", token = session["token"], adminToken = admin_token, containerList = containerList)

@app.route('/dialog/<path:path>')
def serve_dialog(path):
    return render_template('/dialog/{}'.format(path))

@app.route('/createcontainer', methods=['POST'])
def createcontainer():
	
	data = json.loads(request.data.decode())
	newContainerName = data["newContainerName"]
	currentUserId = data["currentUserId"]
	currentUserToken = data["currentUserToken"]
	print(newContainerName + ", " + currentUserId + ", " + currentUserToken)
	#요청했다고 치고 테스트해보자.
	
	url ='http://125.132.100.206:8080/v1/AUTH_'+ currentUserId
	headers  ={'x-auth-token':currentUserToken,'x-container-read':'.r:*'}

	response = requests.put(url+ '/' +newContainerName, headers=headers)
	print(url+'/'+ newContainerName)
	print(response)
	print("newContainerName : " + newContainerName)
	
	return newContainerName + " create success"

#폴더 내 파일 리스트 요청.
def requestFileList(userId, userToken, folderPath):
	#TODO. 아직 내가 잘 몰라서 그런지 여기서 뭔가 잘 안되는 것 같다...
	
	url = 'http://125.132.100.206:8080/v1/AUTH_'+ userId
	headers  ={'x-auth-token':userToken,'content-type':'application/json'}
	response = requests.get(url+'/'+ folderPath,headers=headers)
	print(url + '/' + folderPath)
	print(response.text)
	print(response.text.split("\n")[:-1])
	rawPathList = []
	rawPathList.extend(response.text.split("\n")[:-1])
	parsedFolderSet = set()
	parsedFileSet = set()
	print("rawPathList: ")
	print (rawPathList)
	#더미 리스트.
	#rawPathList = ["VXC/", "VXC/aaa/", "VXC/putty.exe"]
	#결과값은 마치 해당 위치에서의 윈도우의 tree 명령어와 유사한 결과를 출력한다.
	#이를 /로 파싱하여 폴더로 구분할 수 있도록 하자.
	
	for currentPath in rawPathList:
		if currentPath.find('/'):
			parsedFolderSet.add(currentPath[:currentPath.find('/')])
		else:
			parsedFileSet.add(currentPath)
	print(list(parsedFolderSet))
	print(list(parsedFileSet))
	folderData = []
	fileData = []
	for currentFolder in parsedFolderSet:
		folderData.append({"name":currentFolder, "lastUpdate":"만든 날짜(폴더)", "size":"폴더의 크기", "format":"폴더"})
	for currentFile in parsedFileSet:
		fileData.append({"name":currentFile, "lastUpdate":"만든 날짜(파일)", "size":"파일의 크기", "format":"파일"})
	forSendData = {"folders":folderData, "files":fileData}
	return forSendData
@app.route('/requestfilelist', methods = ['POST'])
def requestfilelist():
	if request.method == 'POST':
		data = request.get_json()
		currentUserId = data["currentUserId"]
		currentUserToken = data["currentUserToken"]
		currentFolderPath = data["currentFolderPath"]
		print("파일 리스트 요청.")
		print("currentUserId: " + currentUserId)
		print("currentUserToken: " + currentUserToken)
		print("currentFolderPath: " + currentFolderPath)
		return jsonify(requestFileList(currentUserId, currentUserToken, currentFolderPath))

if __name__ =='__main__':
   app.run(host='0.0.0.0',port=9999)